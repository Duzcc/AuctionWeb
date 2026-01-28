import mongoose from 'mongoose';
import SessionPlate from '../models/SessionPlate.model.js';
import Registration from '../models/Registration.model.js';
import Payment from '../models/Payment.model.js';
import WalletTransaction from '../models/WalletTransaction.model.js';
import AuctionLog from '../models/AuctionLog.model.js';
import User from '../models/User.model.js';
import walletService from './wallet.service.js';

class AuctionPaymentService {
    /**
     * Process winner payment after auction ends
     * Deduct locked amount from winner's wallet
     * @param {String} sessionPlateId
     */
    async processWinnerPayment(sessionPlateId) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const sessionPlate = await SessionPlate.findById(sessionPlateId)
                .session(session)
                .populate('sessionId');

            if (!sessionPlate) {
                throw new Error('SessionPlate not found');
            }

            if (sessionPlate.status !== 'sold') {
                throw new Error(`Cannot process payment. Status: ${sessionPlate.status}`);
            }

            if (!sessionPlate.winnerId) {
                throw new Error('No winner found for this auction');
            }

            // Get registration to know deposit amount
            const registration = await Registration.findOne({
                sessionId: sessionPlate.sessionId._id,
                userId: sessionPlate.winnerId
            }).session(session);

            if (!registration) {
                throw new Error('Winner registration not found');
            }

            // Check if payment already processed
            const existingPayment = await Payment.findOne({
                user: sessionPlate.winnerId,
                type: 'auction_payment',
                registration: registration._id,
                status: 'COMPLETED'
            }).session(session);

            if (existingPayment) {
                throw new Error('Payment already processed for this auction');
            }

            const finalPrice = sessionPlate.finalPrice;
            const depositAmount = registration.depositAmount;
            const remainingAmount = finalPrice - depositAmount;

            // Deduct full amount from wallet (including locked balance)
            await walletService.deductBalance(
                sessionPlate.winnerId.toString(),
                finalPrice,
                sessionPlateId,
                'SessionPlate',
                `Payment for auction win: ${sessionPlate.plateNumber}`,
                session
            );

            // Create payment record
            const payment = await Payment.create([{
                user: sessionPlate.winnerId,
                registration: registration._id,
                type: 'auction_payment',
                amount: finalPrice,
                feeAmount: 0,
                totalAmount: finalPrice,
                status: 'COMPLETED',
                method: 'BANKING', // Wallet payment
                transactionCode: `AUC-${sessionPlateId.slice(-8)}-${Date.now()}`,
                adminNotes: `Auto payment for winning auction: ${sessionPlate.plateNumber}. Deposit: ${depositAmount}, Remaining: ${remainingAmount}`
            }], { session });

            // Update registration deposit status
            registration.depositStatus = 'paid';
            await registration.save({ session });

            // Log payment
            await AuctionLog.create([{
                sessionPlateId,
                eventType: 'payment_completed',
                userId: sessionPlate.winnerId,
                userName: sessionPlate.winnerName,
                metadata: {
                    finalPrice,
                    depositAmount,
                    remainingAmount,
                    paymentId: payment[0]._id,
                    paymentMethod: 'wallet'
                },
                success: true
            }], { session });

            await session.commitTransaction();

            console.log(
                `✅ Winner payment processed: ${sessionPlate.winnerName} paid ` +
                `${finalPrice.toLocaleString('vi-VN')} VND for ${sessionPlate.plateNumber}`
            );

            return {
                success: true,
                payment: payment[0],
                finalPrice,
                depositAmount,
                remainingAmount
            };

        } catch (error) {
            await session.abortTransaction();
            console.error('❌ Process winner payment error:', error);
            throw error;
        } finally {
            session.endSession();
        }
    }

    /**
     * Refund deposits for non-winners
     * @param {String} sessionId - Session ID
     * @param {Array} excludeUserIds - User IDs to exclude (e.g., winner)
     */
    async refundNonWinners(sessionId, excludeUserIds = []) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Find all registrations for this session (excluding winners)
            const registrations = await Registration.find({
                sessionId,
                userId: { $nin: excludeUserIds },
                depositStatus: 'paid',
                status: 'approved'
            }).session(session);

            if (registrations.length === 0) {
                console.log('No deposits to refund');
                return { success: true, refundCount: 0, refunds: [] };
            }

            const refunds = [];
            let totalRefunded = 0;

            for (const registration of registrations) {
                try {
                    // Refund to wallet
                    await walletService.refund(
                        registration.userId.toString(),
                        registration.depositAmount,
                        sessionId,
                        'Session',
                        `Deposit refund for session`,
                        session
                    );

                    // Update registration status
                    registration.depositStatus = 'refunded';
                    await registration.save({ session });

                    // Create refund payment record
                    await Payment.create([{
                        user: registration.userId,
                        registration: registration._id,
                        type: 'DEPOSIT',
                        amount: registration.depositAmount,
                        feeAmount: 0,
                        totalAmount: registration.depositAmount,
                        status: 'REFUNDED',
                        method: 'BANKING',
                        transactionCode: `REF-${sessionId.toString().slice(-8)}-${Date.now()}`,
                        adminNotes: `Deposit refund for non-winner`
                    }], { session });

                    refunds.push({
                        userId: registration.userId,
                        userName: registration.userName,
                        amount: registration.depositAmount
                    });

                    totalRefunded += registration.depositAmount;

                    console.log(
                        `💰 Refunded ${registration.depositAmount.toLocaleString('vi-VN')} VND ` +
                        `to ${registration.userName}`
                    );

                } catch (refundError) {
                    console.error(`Failed to refund for user ${registration.userId}:`, refundError);
                    // Continue with other refunds
                }
            }

            await session.commitTransaction();

            console.log(
                `✅ Refund complete: ${refunds.length} users, ` +
                `total ${totalRefunded.toLocaleString('vi-VN')} VND`
            );

            return {
                success: true,
                refundCount: refunds.length,
                totalRefunded,
                refunds
            };

        } catch (error) {
            await session.abortTransaction();
            console.error('❌ Refund non-winners error:', error);
            throw error;
        } finally {
            session.endSession();
        }
    }

    /**
     * Complete auction settlement
     * Process winner payment and refund non-winners
     * @param {String} sessionPlateId
     */
    async completeAuctionSettlement(sessionPlateId) {
        try {
            const sessionPlate = await SessionPlate.findById(sessionPlateId)
                .populate('sessionId');

            if (!sessionPlate) {
                throw new Error('SessionPlate not found');
            }

            const results = {
                sessionPlateId,
                plateNumber: sessionPlate.plateNumber,
                status: sessionPlate.status
            };

            // If sold, process winner payment
            if (sessionPlate.status === 'sold' && sessionPlate.winnerId) {
                const winnerPayment = await this.processWinnerPayment(sessionPlateId);
                results.winnerPayment = winnerPayment;

                // Refund non-winners
                const refunds = await this.refundNonWinners(
                    sessionPlate.sessionId._id,
                    [sessionPlate.winnerId]
                );
                results.refunds = refunds;

            } else if (sessionPlate.status === 'unsold') {
                // No winner, refund all participants
                const refunds = await this.refundNonWinners(sessionPlate.sessionId._id);
                results.refunds = refunds;
            }

            return {
                success: true,
                message: 'Auction settlement completed',
                data: results
            };

        } catch (error) {
            console.error('❌ Complete auction settlement error:', error);
            throw error;
        }
    }

    /**
     * Get payment status for a user in an auction
     * @param {String} sessionPlateId
     * @param {String} userId
     */
    async getPaymentStatus(sessionPlateId, userId) {
        try {
            const sessionPlate = await SessionPlate.findById(sessionPlateId)
                .populate('sessionId');

            if (!sessionPlate) {
                throw new Error('SessionPlate not found');
            }

            const registration = await Registration.findOne({
                sessionId: sessionPlate.sessionId._id,
                userId
            });

            if (!registration) {
                return {
                    success: true,
                    isParticipant: false,
                    message: 'User not registered for this auction'
                };
            }

            const isWinner = sessionPlate.winnerId?.toString() === userId.toString();

            // Get payment record
            const payment = await Payment.findOne({
                user: userId,
                registration: registration._id,
                type: { $in: ['auction_payment', 'DEPOSIT'] }
            }).sort({ createdAt: -1 });

            return {
                success: true,
                isParticipant: true,
                isWinner,
                auctionStatus: sessionPlate.status,
                depositAmount: registration.depositAmount,
                depositStatus: registration.depositStatus,
                finalPrice: isWinner ? sessionPlate.finalPrice : null,
                payment: payment ? {
                    id: payment._id,
                    type: payment.type,
                    status: payment.status,
                    amount: payment.amount,
                    createdAt: payment.createdAt
                } : null
            };

        } catch (error) {
            console.error('Get payment status error:', error);
            throw error;
        }
    }

    /**
     * Handle payment timeout (winner didn't pay)
     * @param {String} sessionPlateId
     */
    async handlePaymentTimeout(sessionPlateId) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const sessionPlate = await SessionPlate.findById(sessionPlateId)
                .session(session)
                .populate('sessionId');

            if (!sessionPlate || sessionPlate.status !== 'sold') {
                throw new Error('Invalid auction for payment timeout');
            }

            const originalWinnerId = sessionPlate.winnerId;

            // Penalize winner (forfeit deposit)
            const registration = await Registration.findOne({
                sessionId: sessionPlate.sessionId._id,
                userId: originalWinnerId
            }).session(session);

            if (registration) {
                registration.depositStatus = 'forfeited';
                registration.notes = 'Payment timeout - deposit forfeited';
                await registration.save({ session });

                // Ban user from bidding temporarily (7 days)
                await User.findByIdAndUpdate(
                    originalWinnerId,
                    {
                        isBiddingAllowed: false,
                        bannedUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                        banReason: 'Payment timeout after winning auction'
                    },
                    { session }
                );
            }

            // Mark auction as unsold
            sessionPlate.status = 'payment_failed';
            sessionPlate.winnerId = null;
            sessionPlate.winnerName = null;
            sessionPlate.finalPrice = null;
            await sessionPlate.save({ session });

            // Log timeout
            await AuctionLog.create([{
                sessionPlateId,
                eventType: 'payment_timeout',
                userId: originalWinnerId,
                metadata: {
                    reason: 'Winner failed to complete payment within deadline',
                    depositForfeited: registration?.depositAmount || 0,
                    banDuration: '7 days'
                },
                success: true
            }], { session });

            await session.commitTransaction();

            console.log(
                `⚠️ Payment timeout: ${sessionPlate.plateNumber} - ` +
                `Winner ${originalWinnerId} banned for 7 days`
            );

            return {
                success: true,
                message: 'Payment timeout processed',
                forfeitedDeposit: registration?.depositAmount || 0
            };

        } catch (error) {
            await session.abortTransaction();
            console.error('❌ Handle payment timeout error:', error);
            throw error;
        } finally {
            session.endSession();
        }
    }

    /**
     * Get all pending payments (for admin monitoring)
     */
    async getPendingPayments() {
        try {
            const pendingAuctions = await SessionPlate.find({
                status: 'sold',
                winnerId: { $exists: true, $ne: null }
            })
                .populate('sessionId', 'sessionName')
                .populate('winnerId', 'username email fullName')
                .lean();

            const results = [];

            for (const auction of pendingAuctions) {
                const payment = await Payment.findOne({
                    user: auction.winnerId._id,
                    type: 'auction_payment',
                    status: 'COMPLETED'
                });

                if (!payment) {
                    const registration = await Registration.findOne({
                        sessionId: auction.sessionId._id,
                        userId: auction.winnerId._id
                    });

                    results.push({
                        sessionPlateId: auction._id,
                        plateNumber: auction.plateNumber,
                        winner: auction.winnerId,
                        finalPrice: auction.finalPrice,
                        depositAmount: registration?.depositAmount || 0,
                        remainingAmount: auction.finalPrice - (registration?.depositAmount || 0),
                        auctionEndTime: auction.auctionEndTime,
                        daysOverdue: Math.floor((Date.now() - auction.auctionEndTime) / (1000 * 60 * 60 * 24))
                    });
                }
            }

            return {
                success: true,
                count: results.length,
                pendingPayments: results
            };

        } catch (error) {
            console.error('Get pending payments error:', error);
            throw error;
        }
    }
}

export default new AuctionPaymentService();
