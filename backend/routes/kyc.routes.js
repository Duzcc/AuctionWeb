import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/roleAuth.middleware.js';
import {
    submitKYC,
    getKYCStatus,
    getPendingKYC,
    approveKYC,
    rejectKYC,
    getKYCStats,
    getUserKYC,
    checkParticipation
} from '../controllers/kyc.controller.js';

const router = express.Router();

// User routes
router.post('/submit', authenticate, submitKYC);
router.get('/status', authenticate, getKYCStatus);
router.get('/can-participate', authenticate, checkParticipation);

// Admin routes
router.get('/admin/pending', authenticate, authorizeRoles('admin'), getPendingKYC);
router.get('/admin/stats', authenticate, authorizeRoles('admin'), getKYCStats);
router.get('/admin/user/:userId', authenticate, authorizeRoles('admin'), getUserKYC);
router.put('/admin/:userId/approve', authenticate, authorizeRoles('admin'), approveKYC);
router.put('/admin/:userId/reject', authenticate, authorizeRoles('admin'), rejectKYC);

export default router;
