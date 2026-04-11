import mongoose from 'mongoose';
import SessionPlate from '../models/SessionPlate.model.js';
import Bid from '../models/Bid.model.js';
import Registration from '../models/Registration.model.js';
import User from '../models/User.model.js';
import AuctionLog from '../models/AuctionLog.model.js';
import walletService from './wallet.service.js';
import kycService from './kyc.service.js';
import { getIO } from '../socket/socket.handler.js';

class BiddingService {
    /**
     * Place a bid with full validation and concurrency handling
     * @param {String} sessionPlateId
     * @param {String} userId
     * @param {String} userName
     * @param {Number} bidAmount
     * @param {String} ipAddress
     */
    async placeBid(sessionPlateId, userId, userName, bidAmount, ipAddress = null) {
        const mongoSession = await mongoose.startSession();
        mongoSession.startTransaction();

        try {
            const now = new Date();

            // ─────────────────────────────────────────────────────────────
            // BƯỚC 1: Đọc SessionPlate để validate trước khi lock
            // ─────────────────────────────────────────────────────────────
            const sessionPlate = await SessionPlate.findById(sessionPlateId)
                .session(mongoSession)
                .populate('sessionId')
                .lean(); // lean() cho read nhanh hơn

            if (!sessionPlate) throw new Error('Không tìm thấy phiên đấu giá');

            // Validate trạng thái
            if (sessionPlate.status !== 'bidding') {
                throw new Error(`Phiên đấu giá không đang hoạt động (trạng thái: ${sessionPlate.status})`);
            }
            if (now > sessionPlate.auctionEndTime) {
                throw new Error('Phiên đấu giá đã kết thúc');
            }

            // ─────────────────────────────────────────────────────────────
            // BƯỚC 2: Kiểm tra đăng ký & quyền tham gia
            // ─────────────────────────────────────────────────────────────
            const registration = await Registration.findOne({
                sessionId: sessionPlate.sessionId._id,
                userId,
                status: { $in: ['approved', 'won_paid'] }
            }).session(mongoSession).lean();

            if (!registration) {
                throw new Error('Bạn chưa đăng ký hoặc chưa nộp cọc cho phiên đấu giá này');
            }

            // Không được bid khi đang là người thắng hiện tại
            if (sessionPlate.winnerId && sessionPlate.winnerId.toString() === userId.toString()) {
                throw new Error('Bạn đang là người trả giá cao nhất, không thể bid tiếp');
            }

            // ─────────────────────────────────────────────────────────────
            // BƯỚC 3: Validate số tiền bid
            // ─────────────────────────────────────────────────────────────
            const minimumBid = sessionPlate.currentPrice + sessionPlate.priceStep;
            if (bidAmount < minimumBid) {
                throw new Error(
                    `Giá đặt phải ít nhất ${minimumBid.toLocaleString('vi-VN')} VNĐ ` +
                    `(Giá hiện tại: ${sessionPlate.currentPrice.toLocaleString('vi-VN')} + ` +
                    `Bước giá: ${sessionPlate.priceStep.toLocaleString('vi-VN')})`
                );
            }

            // ─────────────────────────────────────────────────────────────
            // BƯỚC 4: Kiểm tra số dư ví
            // ─────────────────────────────────────────────────────────────
            const balance = await walletService.getBalance(userId);
            const requiredAmount = bidAmount - registration.depositAmount;
            if (balance.available < requiredAmount) {
                throw new Error(
                    `Số dư ví không đủ. Khả dụng: ${balance.available.toLocaleString('vi-VN')} VNĐ, ` +
                    `Cần thêm: ${requiredAmount.toLocaleString('vi-VN')} VNĐ`
                );
            }

            // ─────────────────────────────────────────────────────────────
            // BƯỚC 5: Kiểm tra KYC
            // ─────────────────────────────────────────────────────────────
            const canParticipate = await kycService.canParticipate(userId, sessionPlate.sessionId._id);
            if (!canParticipate.canParticipate) {
                throw new Error(canParticipate.reason);
            }

            // ─────────────────────────────────────────────────────────────
            // BƯỚC 6: ATOMIC UPDATE — Chống Race Condition
            //
            // findOneAndUpdate với điều kiện:
            //   - currentPrice < bidAmount → đảm bảo không có bid cao hơn đã được chèn
            //   - status === 'bidding'
            //   - auctionEndTime > now
            //
            // Nếu hai request cùng đến đồng thời, chỉ 1 cái thỏa điều kiện
            // vì sau khi cái đầu update currentPrice, cái sau sẽ thất bại
            // do `currentPrice` sẽ >= bidAmount.
            // ─────────────────────────────────────────────────────────────
            const timeLeft = new Date(sessionPlate.auctionEndTime) - now;
            const extensionThresholdMs = sessionPlate.bidExtensionSeconds * 1000;
            const shouldExtendTime =
                timeLeft <= extensionThresholdMs &&
                sessionPlate.totalExtensions < sessionPlate.maxExtensions;

            const newEndTime = shouldExtendTime
                ? new Date(new Date(sessionPlate.auctionEndTime).getTime() + extensionThresholdMs)
                : sessionPlate.auctionEndTime;

            const updateOps = {
                $set: {
                    currentPrice: bidAmount,
                    lastBidTime: now,
                    winnerId: userId,
                    winnerName: userName,
                },
            };

            if (shouldExtendTime) {
                updateOps.$set.auctionEndTime = newEndTime;
                updateOps.$inc = { totalExtensions: 1 };
            }

            const updatedSessionPlate = await SessionPlate.findOneAndUpdate(
                {
                    _id: sessionPlateId,
                    status: 'bidding',
                    currentPrice: { $lt: bidAmount }, // ← Điều kiện atomic chống race condition
                    auctionEndTime: { $gt: now },
                },
                updateOps,
                { new: true, session: mongoSession }
            );

            // Nếu null → bid đã bị vượt qua bởi người khác trong cùng millisecond
            if (!updatedSessionPlate) {
                throw new Error(
                    'Giá của bạn đã bị vượt qua. Vui lòng kiểm tra giá mới và thử lại'
                );
            }

            const previousPrice = sessionPlate.currentPrice;
            const timeExtended = shouldExtendTime;

            // ─────────────────────────────────────────────────────────────
            // BƯỚC 7: Reset isWinning của các bid cũ & Tạo bid mới
            // ─────────────────────────────────────────────────────────────
            await Bid.updateMany(
                { sessionPlateId, isWinning: true },
                { $set: { isWinning: false } },
                { session: mongoSession }
            );

            const newBid = await Bid.create([{
                sessionPlateId,
                userId,
                userName,
                plateNumber: updatedSessionPlate.plateNumber,
                bidAmount,
                isWinning: true,
                bidTime: now,
            }], { session: mongoSession });

            // ─────────────────────────────────────────────────────────────
            // BƯỚC 8: Ghi log
            // ─────────────────────────────────────────────────────────────
            const logEntries = [{
                sessionPlateId,
                eventType: 'bid_placed',
                userId,
                userName,
                metadata: {
                    bidAmount,
                    previousPrice,
                    priceIncrease: bidAmount - previousPrice,
                    isWinning: true,
                    timeExtended,
                },
                ipAddress,
                success: true,
            }];

            if (timeExtended) {
                logEntries.push({
                    sessionPlateId,
                    eventType: 'time_extended',
                    userId,
                    userName,
                    metadata: {
                        newEndTime,
                        extensionSeconds: updatedSessionPlate.bidExtensionSeconds,
                        totalExtensions: updatedSessionPlate.totalExtensions,
                        triggeredBy: userName,
                        bidAmount,
                    },
                    ipAddress,
                    success: true,
                });
                console.log(`⏰ Time extended for ${updatedSessionPlate.plateNumber}: +${updatedSessionPlate.bidExtensionSeconds}s`);
            }

            await AuctionLog.create(logEntries, { session: mongoSession });

            await mongoSession.commitTransaction();

            console.log(
                `✅ Bid placed: ${userName} → ${bidAmount.toLocaleString('vi-VN')} VNĐ ` +
                `on ${updatedSessionPlate.plateNumber} (prev: ${previousPrice.toLocaleString('vi-VN')})`
            );

            // ─────────────────────────────────────────────────────────────
            // BƯỚC 9: Emit WebSocket events (SAU khi commit transaction)
            // ─────────────────────────────────────────────────────────────
            this.emitBidEvents(sessionPlateId, {
                bid: newBid[0],
                sessionPlate: updatedSessionPlate,
                timeExtended,
                newEndTime: updatedSessionPlate.auctionEndTime,
                userName,
                bidAmount,
                now,
            });

            return {
                success: true,
                bid: newBid[0],
                currentPrice: bidAmount,
                timeExtended,
                newEndTime: updatedSessionPlate.auctionEndTime,
                totalExtensions: updatedSessionPlate.totalExtensions,
                message: timeExtended
                    ? `Đặt giá thành công! Thời gian được gia hạn thêm ${updatedSessionPlate.bidExtensionSeconds} giây.`
                    : 'Đặt giá thành công!',
            };

        } catch (error) {
            await mongoSession.abortTransaction();

            // Ghi log thất bại (best-effort, không throw nếu lỗi)
            AuctionLog.create({
                sessionPlateId,
                eventType: 'bid_placed',
                userId,
                userName,
                metadata: { bidAmount, attemptedBid: true },
                ipAddress,
                success: false,
                errorMessage: error.message,
            }).catch(e => console.error('Không ghi được log bid lỗi:', e));

            console.error('❌ Place bid error:', error.message);
            throw error;
        } finally {
            mongoSession.endSession();
        }
    }

    /**
     * Emit WebSocket events for bid placement
     * @private
     */
    emitBidEvents(sessionPlateId, data) {
        try {
            const io = getIO();
            const roomName = `auction:${sessionPlateId}`;

            // Emit new bid event
            io.to(roomName).emit('new_bid', {
                bidId: data.bid._id,
                sessionPlateId,
                userId: data.bid.userId,
                userName: data.userName,
                bidAmount: data.bidAmount,
                currentPrice: data.bidAmount,
                bidTime: data.now,
                isWinning: true,
                plateNumber: data.sessionPlate.plateNumber
            });

            // Emit time extension event if occurred
            if (data.timeExtended) {
                io.to(roomName).emit('time_extended', {
                    sessionPlateId,
                    newEndTime: data.newEndTime,
                    extensionSeconds: data.sessionPlate.bidExtensionSeconds,
                    totalExtensions: data.sessionPlate.totalExtensions,
                    maxExtensions: data.sessionPlate.maxExtensions,
                    reason: `Bid placed in last ${data.sessionPlate.bidExtensionSeconds} seconds`,
                    triggeredBy: data.userName
                });
            }
        } catch (error) {
            console.error('Error emitting bid events:', error);
        }
    }

    /**
     * Determine winner when auction ends
     * @param {String} sessionPlateId
     */
    async determineWinner(sessionPlateId) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const sessionPlate = await SessionPlate.findById(sessionPlateId)
                .session(session)
                .populate('sessionId');

            if (!sessionPlate) {
                throw new Error('SessionPlate not found');
            }

            // Find highest bid
            const winningBid = await Bid.findOne({
                sessionPlateId,
                isWinning: true
            }).session(session).sort({ bidAmount: -1 });

            if (winningBid) {
                // Update SessionPlate
                sessionPlate.status = 'sold';
                sessionPlate.winnerId = winningBid.userId;
                sessionPlate.winnerName = winningBid.userName;
                sessionPlate.finalPrice = winningBid.bidAmount;
                await sessionPlate.save({ session });

                // Get registration to know deposit amount
                const registration = await Registration.findOne({
                    sessionId: sessionPlate.sessionId._id,
                    userId: winningBid.userId
                }).session(session);

                // Lock winner's money (final price - deposit already locked)
                const amountToLock = sessionPlate.finalPrice - registration.depositAmount;

                if (amountToLock > 0) {
                    await walletService.lockBalance(
                        winningBid.userId.toString(),
                        amountToLock,
                        sessionPlateId,
                        'SessionPlate',
                        `Locked ${amountToLock.toLocaleString('vi-VN')} VND for winning auction`
                    );
                }

                // Count total bids
                const totalBids = await Bid.countDocuments({ sessionPlateId });

                // Log winner determination
                await AuctionLog.create([{
                    sessionPlateId,
                    eventType: 'winner_determined',
                    userId: winningBid.userId,
                    userName: winningBid.userName,
                    metadata: {
                        winnerName: winningBid.userName,
                        finalPrice: sessionPlate.finalPrice,
                        totalBids,
                        depositAmount: registration.depositAmount,
                        amountLocked: amountToLock
                    },
                    success: true
                }], { session });

                console.log(
                    `🏆 Winner determined: ${winningBid.userName} won ${sessionPlate.plateNumber} ` +
                    `for ${sessionPlate.finalPrice.toLocaleString('vi-VN')} VND`
                );

            } else {
                // No bids - mark as unsold
                sessionPlate.status = 'unsold';
                await sessionPlate.save({ session });

                await AuctionLog.create([{
                    sessionPlateId,
                    eventType: 'auction_ended',
                    metadata: {
                        status: 'unsold',
                        reason: 'No bids placed',
                        startingPrice: sessionPlate.startingPrice
                    },
                    success: true
                }], { session });

                console.log(`📭 No winner: ${sessionPlate.plateNumber} received no bids`);
            }

            await session.commitTransaction();

            // Emit WebSocket event
            const io = getIO();
            io.to(`auction:${sessionPlateId}`).emit('auction_ended', {
                sessionPlateId,
                status: sessionPlate.status,
                winnerId: sessionPlate.winnerId,
                winnerName: sessionPlate.winnerName,
                finalPrice: sessionPlate.finalPrice,
                totalBids: winningBid ? await Bid.countDocuments({ sessionPlateId }) : 0
            });

            return {
                success: true,
                status: sessionPlate.status,
                winner: sessionPlate.winnerId ? {
                    userId: sessionPlate.winnerId,
                    userName: sessionPlate.winnerName,
                    finalPrice: sessionPlate.finalPrice
                } : null
            };

        } catch (error) {
            await session.abortTransaction();
            console.error('❌ Determine winner error:', error);
            throw error;
        } finally {
            session.endSession();
        }
    }

    /**
     * Get bid history for a session plate
     * @param {String} sessionPlateId
     * @param {Object} options
     */
    async getBidHistory(sessionPlateId, options = {}) {
        const {
            page = 1,
            limit = 50,
            sortBy = 'bidTime',
            sortOrder = 'desc'
        } = options;

        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const bids = await Bid.find({ sessionPlateId })
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('userId', 'username avatar')
            .lean();

        const total = await Bid.countDocuments({ sessionPlateId });

        return {
            success: true,
            bids,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit),
                hasMore: page * limit < total
            }
        };
    }

    /**
     * Get current auction state
     * @param {String} sessionPlateId
     */
    async getAuctionState(sessionPlateId) {
        const sessionPlate = await SessionPlate.findById(sessionPlateId)
            .populate('sessionId')
            .populate('winnerId', 'username avatar')
            .lean();

        if (!sessionPlate) {
            throw new Error('Auction not found');
        }

        const now = new Date();
        const timeLeft = Math.max(0, sessionPlate.auctionEndTime - now);
        const hasEnded = timeLeft === 0 || sessionPlate.status !== 'bidding';

        // Get current winning bid
        const winningBid = await Bid.findOne({
            sessionPlateId,
            isWinning: true
        }).populate('userId', 'username avatar');

        // Get total bids
        const totalBids = await Bid.countDocuments({ sessionPlateId });

        // Get recent bids
        const recentBids = await Bid.find({ sessionPlateId })
            .sort({ bidTime: -1 })
            .limit(10)
            .populate('userId', 'username avatar')
            .lean();

        return {
            success: true,
            sessionPlate,
            currentState: {
                status: sessionPlate.status,
                currentPrice: sessionPlate.currentPrice,
                startingPrice: sessionPlate.startingPrice,
                priceStep: sessionPlate.priceStep,
                timeLeft, // milliseconds
                hasEnded,
                totalBids,
                totalExtensions: sessionPlate.totalExtensions,
                maxExtensions: sessionPlate.maxExtensions
            },
            winningBid,
            recentBids
        };
    }
}

export default new BiddingService();
