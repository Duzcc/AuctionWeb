import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification,
} from '../controllers/notification.controller.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);
router.patch('/:id/read', markAsRead);
router.patch('/read-all', markAllAsRead);
router.delete('/:id', deleteNotification);

// Internal (can be called from other controllers to create notifications)
router.post('/', createNotification);

export default router;
