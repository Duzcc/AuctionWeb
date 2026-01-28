import User from '../models/User.model.js';
import WalletTransaction from '../models/WalletTransaction.model.js';
import mongoose from 'mongoose';

class WalletService {
    /**
     * Get user's wallet balance
     * @param {String} userId 
     * @returns {Object} Balance details
     */
    async getBalance(userId) {
        const user = await User.findById(userId).select('walletBalance lockedBalance');
        if (!user) {
            throw new Error('User not found');
        }

        return {
            total: user.walletBalance,
            locked: user.lockedBalance,
            available: user.walletBalance - user.lockedBalance
        };
    }

    /**
     * Lock balance for auction/deposit
     * @param {String} userId
     * @param {Number} amount
     * @param {String} referenceId - Payment/Registration/SessionPlate ID
     * @param {String} referenceType - Type of reference
     * @param {String} description - Transaction description
     */
    async lockBalance(userId, amount, referenceId, referenceType, description = null) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const user = await User.findById(userId).session(session);

            if (!user) {
                throw new Error('User not found');
            }

            const availableBalance = user.walletBalance - user.lockedBalance;

            if (availableBalance < amount) {
                throw new Error(
                    `Insufficient balance. Available: ${availableBalance.toLocaleString('vi-VN')} VND, ` +
                    `Required: ${amount.toLocaleString('vi-VN')} VND`
                );
            }

            const balanceBefore = user.walletBalance;
            user.lockedBalance += amount;
            await user.save({ session });

            // Create transaction log
            const transactionDesc = description || `Locked ${amount.toLocaleString('vi-VN')} VND for ${referenceType}`;

            await WalletTransaction.create([{
                userId,
                type: 'lock',
                amount,
                balanceBefore,
                balanceAfter: user.walletBalance,
                description: transactionDesc,
                referenceId,
                referenceType,
                status: 'completed'
            }], { session });

            await session.commitTransaction();

            console.log(`✅ Locked ${amount} VND for user ${userId}`);

            return {
                success: true,
                lockedBalance: user.lockedBalance,
                availableBalance: user.walletBalance - user.lockedBalance,
                transaction: {
                    type: 'lock',
                    amount,
                    description: transactionDesc
                }
            };

        } catch (error) {
            await session.abortTransaction();
            console.error('Lock balance error:', error);
            throw error;
        } finally {
            session.endSession();
        }
    }

    /**
     * Unlock balance (refund)
     * @param {String} userId
     * @param {Number} amount
     * @param {String} referenceId
     * @param {String} referenceType
     * @param {String} description
     */
    async unlockBalance(userId, amount, referenceId, referenceType, description = null) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const user = await User.findById(userId).session(session);

            if (!user) {
                throw new Error('User not found');
            }

            if (user.lockedBalance < amount) {
                throw new Error(
                    `Cannot unlock ${amount.toLocaleString('vi-VN')} VND. ` +
                    `Locked balance: ${user.lockedBalance.toLocaleString('vi-VN')} VND`
                );
            }

            const balanceBefore = user.walletBalance;
            user.lockedBalance -= amount;
            await user.save({ session });

            const transactionDesc = description || `Unlocked ${amount.toLocaleString('vi-VN')} VND (refund)`;

            await WalletTransaction.create([{
                userId,
                type: 'unlock',
                amount,
                balanceBefore,
                balanceAfter: user.walletBalance,
                description: transactionDesc,
                referenceId,
                referenceType,
                status: 'completed'
            }], { session });

            await session.commitTransaction();

            console.log(`✅ Unlocked ${amount} VND for user ${userId}`);

            return {
                success: true,
                lockedBalance: user.lockedBalance,
                availableBalance: user.walletBalance - user.lockedBalance,
                transaction: {
                    type: 'unlock',
                    amount,
                    description: transactionDesc
                }
            };

        } catch (error) {
            await session.abortTransaction();
            console.error('Unlock balance error:', error);
            throw error;
        } finally {
            session.endSession();
        }
    }

    /**
     * Deduct balance (after payment verification)
     * @param {String} userId
     * @param {Number} amount
     * @param {String} referenceId
     * @param {String} referenceType
     * @param {String} description
     */
    async deductBalance(userId, amount, referenceId, referenceType, description = null) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const user = await User.findById(userId).session(session);

            if (!user) {
                throw new Error('User not found');
            }

            if (user.lockedBalance < amount) {
                throw new Error(
                    `Cannot deduct ${amount.toLocaleString('vi-VN')} VND. ` +
                    `Locked balance: ${user.lockedBalance.toLocaleString('vi-VN')} VND`
                );
            }

            const balanceBefore = user.walletBalance;
            user.walletBalance -= amount;
            user.lockedBalance -= amount;
            await user.save({ session });

            const transactionDesc = description || `Deducted ${amount.toLocaleString('vi-VN')} VND for payment`;

            await WalletTransaction.create([{
                userId,
                type: 'deduct',
                amount,
                balanceBefore,
                balanceAfter: user.walletBalance,
                description: transactionDesc,
                referenceId,
                referenceType,
                status: 'completed'
            }], { session });

            await session.commitTransaction();

            console.log(`✅ Deducted ${amount} VND from user ${userId}`);

            return {
                success: true,
                totalBalance: user.walletBalance,
                lockedBalance: user.lockedBalance,
                availableBalance: user.walletBalance - user.lockedBalance,
                transaction: {
                    type: 'deduct',
                    amount,
                    description: transactionDesc
                }
            };

        } catch (error) {
            await session.abortTransaction();
            console.error('Deduct balance error:', error);
            throw error;
        } finally {
            session.endSession();
        }
    }

    /**
     * Deposit money to wallet
     * @param {String} userId
     * @param {Number} amount
     * @param {String} paymentId - Payment reference
     * @param {String} description
     */
    async deposit(userId, amount, paymentId, description = null) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const user = await User.findById(userId).session(session);

            if (!user) {
                throw new Error('User not found');
            }

            const balanceBefore = user.walletBalance;
            user.walletBalance += amount;
            await user.save({ session });

            const transactionDesc = description || `Deposited ${amount.toLocaleString('vi-VN')} VND`;

            await WalletTransaction.create([{
                userId,
                type: 'deposit',
                amount,
                balanceBefore,
                balanceAfter: user.walletBalance,
                description: transactionDesc,
                referenceId: paymentId,
                referenceType: 'Payment',
                status: 'completed'
            }], { session });

            await session.commitTransaction();

            console.log(`✅ Deposited ${amount} VND to user ${userId}`);

            return {
                success: true,
                newBalance: user.walletBalance,
                availableBalance: user.walletBalance - user.lockedBalance,
                transaction: {
                    type: 'deposit',
                    amount,
                    description: transactionDesc
                }
            };

        } catch (error) {
            await session.abortTransaction();
            console.error('Deposit error:', error);
            throw error;
        } finally {
            session.endSession();
        }
    }

    /**
     * Withdraw money from wallet
     * @param {String} userId
     * @param {Number} amount
     * @param {String} description
     */
    async withdraw(userId, amount, description = null) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const user = await User.findById(userId).session(session);

            if (!user) {
                throw new Error('User not found');
            }

            const availableBalance = user.walletBalance - user.lockedBalance;

            if (availableBalance < amount) {
                throw new Error(
                    `Insufficient available balance. Available: ${availableBalance.toLocaleString('vi-VN')} VND, ` +
                    `Requested: ${amount.toLocaleString('vi-VN')} VND`
                );
            }

            const balanceBefore = user.walletBalance;
            user.walletBalance -= amount;
            await user.save({ session });

            const transactionDesc = description || `Withdrew ${amount.toLocaleString('vi-VN')} VND`;

            await WalletTransaction.create([{
                userId,
                type: 'withdraw',
                amount,
                balanceBefore,
                balanceAfter: user.walletBalance,
                description: transactionDesc,
                status: 'completed'
            }], { session });

            await session.commitTransaction();

            console.log(`✅ Withdrew ${amount} VND from user ${userId}`);

            return {
                success: true,
                newBalance: user.walletBalance,
                availableBalance: user.walletBalance - user.lockedBalance,
                transaction: {
                    type: 'withdraw',
                    amount,
                    description: transactionDesc
                }
            };

        } catch (error) {
            await session.abortTransaction();
            console.error('Withdraw error:', error);
            throw error;
        } finally {
            session.endSession();
        }
    }

    /**
     * Get transaction history
     * @param {String} userId
     * @param {Object} filters
     */
    async getTransactions(userId, filters = {}) {
        const {
            page = 1,
            limit = 20,
            type,
            dateFrom,
            dateTo,
            referenceType
        } = filters;

        const query = { userId };

        if (type) {
            query.type = type;
        }

        if (referenceType) {
            query.referenceType = referenceType;
        }

        if (dateFrom || dateTo) {
            query.createdAt = {};
            if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
            if (dateTo) query.createdAt.$lte = new Date(dateTo);
        }

        const transactions = await WalletTransaction.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('referenceId')
            .lean();

        const total = await WalletTransaction.countDocuments(query);

        return {
            success: true,
            transactions,
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
     * Get wallet summary for user
     * @param {String} userId
     */
    async getWalletSummary(userId) {
        const user = await User.findById(userId).select('walletBalance lockedBalance');

        if (!user) {
            throw new Error('User not found');
        }

        // Get transaction stats
        const stats = await WalletTransaction.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(userId) } },
            {
                $group: {
                    _id: '$type',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$amount' }
                }
            }
        ]);

        const summary = {
            balance: {
                total: user.walletBalance,
                locked: user.lockedBalance,
                available: user.walletBalance - user.lockedBalance
            },
            statistics: stats.reduce((acc, stat) => {
                acc[stat._id] = {
                    count: stat.count,
                    totalAmount: stat.totalAmount
                };
                return acc;
            }, {})
        };

        return summary;
    }

    /**
     * Refund - combination of unlock and deposit if needed
     * @param {String} userId
     * @param {Number} amount
     * @param {String} referenceId
     * @param {String} referenceType
     * @param {Boolean} isLocked - If the money was locked or not
     */
    async refund(userId, amount, referenceId, referenceType, isLocked = true) {
        if (isLocked) {
            // Money was locked, just unlock it
            return await this.unlockBalance(
                userId,
                amount,
                referenceId,
                referenceType,
                `Refunded ${amount.toLocaleString('vi-VN')} VND`
            );
        } else {
            // Money was already deducted, need to deposit back
            return await this.deposit(
                userId,
                amount,
                referenceId,
                `Refunded ${amount.toLocaleString('vi-VN')} VND`
            );
        }
    }
}

export default new WalletService();
