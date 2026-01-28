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
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // 1. Get SessionPlate with lock (for update)
            const sessionPlate = await SessionPlate.findById(sessionPlateId)
                .session(session)
                .populate('sessionId');

            if (!sessionPlate) {
                throw new Error('Auction not found');
            }

            // 2. Validate auction status
            if (sessionPlate.status !== 'bidding') {
                throw new Error(`Auction is not active. Current status: ${sessionPlate.status}`);
            }

            // 3. Check if auction time has ended
            const now = new Date();
            if (now > sessionPlate.auctionEndTime) {
                throw new Error('Auction has ended');
            }

            // 4. Validate user is registered and approved
            const registration = await Registration.findOne({
                sessionId: sessionPlate.sessionId._id,
                userId,
                depositStatus: 'paid',
                status: 'approved'
            }).session(session);

            if (!registration) {
                throw new Error('You are not registered for this auction or deposit not paid');
            }

            // 5. Check if user is the current winner (can't bid on own bid)
            if (sessionPlate.winnerId && sessionPlate.winnerId.toString() === userId.toString()) {
                throw new Error('You are already the highest bidder');
            }

            // 6. Validate bid amount
            const minimumBid = sessionPlate.currentPrice + sessionPlate.priceStep;
            if (bidAmount < minimumBid) {
                throw new Error(
                    `Bid must be at least ${minimumBid.toLocaleString('vi-VN')} VND. ` +
                    `Current price: ${sessionPlate.currentPrice.toLocaleString('vi-VN')} VND, ` +
                    `Step: ${sessionPlate.priceStep.toLocaleString('vi-VN')} VND`
                );
            }

            // 7. Validate bid is multiple of price step
            const priceAboveStart = bidAmount - sessionPlate.startingPrice;
            if (priceAboveStart % sessionPlate.priceStep !== 0) {
                throw new Error(
                    `Bid must be in increments of ${sessionPlate.priceStep.toLocaleString('vi-VN')} VND`
                );
            }

            // 8. Check user wallet balance
            const balance = await walletService.getBalance(userId);
            const requiredAmount = bidAmount - registration.depositAmount;
            if (balance.available < requiredAmount) {
                throw new Error(
                    `Insufficient wallet balance. ` +
                    `Available: ${balance.available.toLocaleString('vi-VN')} VND, ` +
                    `Required: ${requiredAmount.toLocaleString('vi-VN')} VND`
                );
            }

            // 9. Check KYC and bidding permissions
            const canParticipate = await kycService.canParticipate(userId);
            if (!canParticipate.canParticipate) {
                throw new Error(canParticipate.reason);
            }

            // 10. Update previous winning bid
            await Bid.updateMany(
                { sessionPlateId, isWinning: true },
                { $set: { isWinning: false } }
            ).session(session);

            // 11. Create new bid
            const newBid = await Bid.create([{
                sessionPlateId,
                userId,
                userName,
                plateNumber: sessionPlate.plateNumber,
                bidAmount,
                isWinning: true,
                bidTime: now
            }], { session });

            // 12. Update SessionPlate
            const previousPrice = sessionPlate.currentPrice;
            sessionPlate.currentPrice = bidAmount;
            sessionPlate.lastBidTime = now;

            // 13. Check for time extension
            let timeExtended = false;
            let newEndTime = sessionPlate.auctionEndTime;
            const timeLeft = sessionPlate.auctionEndTime - now;
            const extensionThreshold = sessionPlate.bidExtensionSeconds * 1000;

            if (timeLeft <= extensionThreshold &&
                sessionPlate.totalExtensions < sessionPlate.maxExtensions) {

                const extensionMs = sessionPlate.bidExtensionSeconds * 1000;
                newEndTime = new Date(sessionPlate.auctionEndTime.getTime() + extensionMs);
                sessionPlate.auctionEndTime = newEndTime;
                sessionPlate.totalExtensions += 1;
                timeExtended = true;

                // Log time extension
                await AuctionLog.create([{
                    sessionPlateId,
                    eventType: 'time_extended',
                    userId,
                    userName,
                    metadata: {
                        newEndTime: newEndTime,
                        extensionSeconds: sessionPlate.bidExtensionSeconds,
                        totalExtensions: sessionPlate.totalExtensions,
                        triggeredBy: userName,
                        bidAmount: bidAmount
                    },
                    ipAddress,
                    success: true
                }], { session });

                console.log(`⏰ Time extended for ${sessionPlate.plateNumber}: +${sessionPlate.bidExtensionSeconds}s`);
            }

            await sessionPlate.save({ session });

            // 14. Log bid placement
            await AuctionLog.create([{
                sessionPlateId,
                eventType: 'bid_placed',
                userId,
                userName,
                metadata: {
                    bidAmount,
                    previousPrice,
                    priceIncrease: bidAmount - previousPrice,
                    isWinning: true,
                    timeExtended
                },
                ipAddress,
                success: true
            }], { session });

            await session.commitTransaction();

            console.log(
                `✅ Bid placed: ${userName} bid ${bidAmount.toLocaleString('vi-VN')} VND ` +
                `on ${sessionPlate.plateNumber}`
            );

            // 15. Emit WebSocket events (after transaction commit)
            this.emitBidEvents(sessionPlateId, {
                bid: newBid[0],
                sessionPlate,
                timeExtended,
                newEndTime,
                userName,
                bidAmount,
                now
            });

            return {
                success: true,
                bid: newBid[0],
                currentPrice: bidAmount,
                timeExtended,
                newEndTime: sessionPlate.auctionEndTime,
                totalExtensions: sessionPlate.totalExtensions,
                message: timeExtended
                    ? `Bid placed successfully! Time extended by ${sessionPlate.bidExtensionSeconds} seconds.`
                    : 'Bid placed successfully!'
            };

        } catch (error) {
            await session.abortTransaction();

            // Log failed bid attempt
            try {
                await AuctionLog.create({
                    sessionPlateId,
                    eventType: 'bid_placed',
                    userId,
                    userName,
                    metadata: {
                        bidAmount,
                        attemptedBid: true
                    },
                    ipAddress,
                    success: false,
                    errorMessage: error.message
                });
            } catch (logError) {
                console.error('Failed to log bid error:', logError);
            }

            console.error('❌ Place bid error:', error.message);
            throw error;
        } finally {
            session.endSession();
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
