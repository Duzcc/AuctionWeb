import walletService from '../services/wallet.service.js';

/**
 * Get user's wallet balance
 */
export const getBalance = async (req, res) => {
    try {
        const userId = req.user.userId;
        const balance = await walletService.getBalance(userId);

        res.status(200).json({
            success: true,
            message: 'Balance retrieved successfully',
            data: balance
        });
    } catch (error) {
        console.error('Get balance error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get wallet balance'
        });
    }
};

/**
 * Get wallet summary (balance + statistics)
 */
export const getWalletSummary = async (req, res) => {
    try {
        const userId = req.user.userId;
        const summary = await walletService.getWalletSummary(userId);

        res.status(200).json({
            success: true,
            message: 'Wallet summary retrieved successfully',
            data: summary
        });
    } catch (error) {
        console.error('Get wallet summary error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get wallet summary'
        });
    }
};

/**
 * Get transaction history
 */
export const getTransactions = async (req, res) => {
    try {
        const userId = req.user.userId;
        const filters = {
            page: parseInt(req.query.page) || 1,
            limit: parseInt(req.query.limit) || 20,
            type: req.query.type,
            dateFrom: req.query.dateFrom,
            dateTo: req.query.dateTo,
            referenceType: req.query.referenceType
        };

        const result = await walletService.getTransactions(userId, filters);

        res.status(200).json({
            success: true,
            message: 'Transactions retrieved successfully',
            data: result.transactions,
            pagination: result.pagination
        });
    } catch (error) {
        console.error('Get transactions error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get transactions'
        });
    }
};

/**
 * Deposit money to wallet (after payment verification)
 * This is typically called internally after payment is verified by admin
 */
export const processDeposit = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { amount, paymentId, description } = req.body;

        // Validate amount
        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid deposit amount'
            });
        }

        if (!paymentId) {
            return res.status(400).json({
                success: false,
                message: 'Payment ID is required'
            });
        }

        const result = await walletService.deposit(userId, amount, paymentId, description);

        res.status(200).json({
            success: true,
            message: 'Deposit successful',
            data: result
        });
    } catch (error) {
        console.error('Process deposit error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to process deposit'
        });
    }
};

/**
 * Request withdrawal
 * User requests to withdraw money from wallet to bank account
 */
export const requestWithdrawal = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { amount, bankAccount, description } = req.body;

        // Validate amount
        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid withdrawal amount'
            });
        }

        // Minimum withdrawal amount
        const MIN_WITHDRAWAL = 50000; // 50,000 VND
        if (amount < MIN_WITHDRAWAL) {
            return res.status(400).json({
                success: false,
                message: `Minimum withdrawal amount is ${MIN_WITHDRAWAL.toLocaleString('vi-VN')} VND`
            });
        }

        if (!bankAccount) {
            return res.status(400).json({
                success: false,
                message: 'Bank account information is required'
            });
        }

        // For now, we'll create a withdrawal transaction
        // In production, this should create a withdrawal request for admin approval
        const result = await walletService.withdraw(userId, amount, description);

        res.status(200).json({
            success: true,
            message: 'Withdrawal request submitted successfully',
            data: result
        });
    } catch (error) {
        console.error('Request withdrawal error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to process withdrawal request'
        });
    }
};

/**
 * Admin: Manual balance adjustment
 * Only accessible by admin
 */
export const adminAdjustBalance = async (req, res) => {
    try {
        const { userId, amount, type, description } = req.body;
        const adminId = req.user.userId;

        if (!userId || !amount || !type) {
            return res.status(400).json({
                success: false,
                message: 'userId, amount, and type are required'
            });
        }

        let result;
        switch (type) {
            case 'deposit':
                result = await walletService.deposit(userId, amount, adminId, description || 'Admin deposit');
                break;
            case 'deduct':
                result = await walletService.deductBalance(userId, amount, adminId, 'Manual', description || 'Admin deduction');
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: 'Invalid adjustment type. Use "deposit" or "deduct"'
                });
        }

        res.status(200).json({
            success: true,
            message: 'Balance adjusted successfully',
            data: result
        });
    } catch (error) {
        console.error('Admin adjust balance error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to adjust balance'
        });
    }
};

/**
 * Admin: Get user's wallet details
 */
export const adminGetUserWallet = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        const balance = await walletService.getBalance(userId);
        const summary = await walletService.getWalletSummary(userId);

        res.status(200).json({
            success: true,
            message: 'User wallet details retrieved successfully',
            data: {
                balance,
                summary
            }
        });
    } catch (error) {
        console.error('Admin get user wallet error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get user wallet details'
        });
    }
};
