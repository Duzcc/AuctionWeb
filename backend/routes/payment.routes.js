import express from 'express';
import {
    createDepositPayment,
    confirmPayment,
    getUserPayments,
    getAllPayments,
    approvePayment,
    rejectPayment,
    getMyAuctionPaymentStatus,
    adminProcessWinnerPayment,
    adminRefundNonWinners,
    adminCompleteSettlement,
    adminHandlePaymentTimeout,
    adminGetPendingPayments
} from '../controllers/payment.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/roleAuth.middleware.js';

const router = express.Router();

router.use(authenticate); // Protect all routes

// ========================
// USER ROUTES - Deposit Payments
// ========================
router.post('/deposit', createDepositPayment);
router.post('/confirm', confirmPayment);
router.post('/confirm/:paymentId', confirmPayment);
router.get('/history', getUserPayments);

// ========================
// USER ROUTES - Auction Payments
// ========================
router.get('/auction/:sessionPlateId/status', getMyAuctionPaymentStatus);

// ========================
// ADMIN ROUTES - General Payments
// ========================
router.get('/', authorizeRoles('admin'), getAllPayments);
router.put('/:paymentId/approve', authorizeRoles('admin'), approvePayment);
router.put('/:paymentId/reject', authorizeRoles('admin'), rejectPayment);

// ========================
// ADMIN ROUTES - Auction Payments
// ========================
router.get('/auction/pending', authorizeRoles('admin'), adminGetPendingPayments);
router.post('/auction/:sessionPlateId/process-winner', authorizeRoles('admin'), adminProcessWinnerPayment);
router.post('/auction/:sessionPlateId/settle', authorizeRoles('admin'), adminCompleteSettlement);
router.post('/auction/:sessionPlateId/timeout', authorizeRoles('admin'), adminHandlePaymentTimeout);
router.post('/auction/session/:sessionId/refund-non-winners', authorizeRoles('admin'), adminRefundNonWinners);

export default router;
