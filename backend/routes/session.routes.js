import express from 'express';
import {
    getSessions,
    getSessionById,
    getSessionPlates,
    createSession,
    updateSession,
    finalizeAuction,
    startAuctionPlate,
    stopAuctionPlate
} from '../controllers/session.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/roleAuth.middleware.js';

const router = express.Router();

/**
 * Public routes
 */
router.get('/', getSessions);
router.get('/:id', getSessionById);
router.get('/:id/plates', getSessionPlates);

/**
 * Admin-only routes
 */
router.post('/', authenticate, authorizeRoles('admin'), createSession);
router.put('/:id', authenticate, authorizeRoles('admin'), updateSession);
router.post('/:id/finalize', authenticate, authorizeRoles('admin'), finalizeAuction);

/**
 * Admin: bắt đầu / dừng đấu giá thủ công
 * POST /api/sessions/plates/:plateId/start  { durationMinutes: 60 }
 * POST /api/sessions/plates/:plateId/stop
 */
router.post('/plates/:plateId/start', authenticate, authorizeRoles('admin'), startAuctionPlate);
router.post('/plates/:plateId/stop', authenticate, authorizeRoles('admin'), stopAuctionPlate);

export default router;
