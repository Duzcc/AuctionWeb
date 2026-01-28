import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/roleAuth.middleware.js';
import {
    getBalance,
    getWalletSummary,
    getTransactions,
    processDeposit,
    requestWithdrawal,
    adminAdjustBalance,
    adminGetUserWallet
} from '../controllers/wallet.controller.js';

const router = express.Router();

// User routes (require authentication)
router.get('/balance', authenticate, getBalance);
router.get('/summary', authenticate, getWalletSummary);
router.get('/transactions', authenticate, getTransactions);
router.post('/deposit', authenticate, processDeposit);
router.post('/withdraw', authenticate, requestWithdrawal);

// Admin routes
router.post('/admin/adjust', authenticate, authorizeRoles('admin'), adminAdjustBalance);
router.get('/admin/user/:userId', authenticate, authorizeRoles('admin'), adminGetUserWallet);

export default router;
