import express from 'express';
import {
    getRooms,
    getRoomById,
    createRoom,
    updateRoom
} from '../controllers/room.controller.js';
import {
    getRoomStats,
    getRoomParticipants,
    getRoomActivityLog
} from '../controllers/roomStats.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/roleAuth.middleware.js';

const router = express.Router();

/**
 * Public routes
 */
router.get('/', getRooms);
router.get('/:id', getRoomById);

// Room statistics routes
router.get('/:id/stats', getRoomStats);
router.get('/:id/participants', getRoomParticipants);
router.get('/:id/activity-log', getRoomActivityLog);

/**
 * Admin-only routes
 */
router.post('/', authenticate, authorizeRoles('admin'), createRoom);
router.put('/:id', authenticate, authorizeRoles('admin'), updateRoom);

export default router;
