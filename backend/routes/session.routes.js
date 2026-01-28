import express from 'express';
import {
    getSessions,
    getSessionById,
    getSessionPlates,
    createSession,
    updateSession,
    finalizeAuction
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

export default router;
