import Notification from '../models/Notification.model.js';
import { AppError } from '../middleware/error.middleware.js';

/**
 * @route   GET /api/notifications
 * @desc    Get notifications for current user (pagination + filter)
 */
export const getNotifications = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, unread } = req.query;
        const query = { userId: req.user.id };
        if (unread === 'true') query.isRead = false;

        const [notifications, total] = await Promise.all([
            Notification.find(query)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(Number(limit)),
            Notification.countDocuments(query),
        ]);

        res.json({
            success: true,
            data: notifications,
            pagination: {
                total,
                page: Number(page),
                pages: Math.ceil(total / limit),
            },
        });
    } catch (e) { next(e); }
};

/**
 * @route   GET /api/notifications/unread-count
 */
export const getUnreadCount = async (req, res, next) => {
    try {
        const count = await Notification.countDocuments({ userId: req.user.id, isRead: false });
        res.json({ success: true, count });
    } catch (e) { next(e); }
};

/**
 * @route   PATCH /api/notifications/:id/read
 */
export const markAsRead = async (req, res, next) => {
    try {
        const noti = await Notification.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            { isRead: true },
            { new: true }
        );
        if (!noti) throw new AppError('Notification not found', 404);
        res.json({ success: true, data: noti });
    } catch (e) { next(e); }
};

/**
 * @route   PATCH /api/notifications/read-all
 */
export const markAllAsRead = async (req, res, next) => {
    try {
        const result = await Notification.updateMany(
            { userId: req.user.id, isRead: false },
            { isRead: true }
        );
        res.json({ success: true, modifiedCount: result.modifiedCount });
    } catch (e) { next(e); }
};

/**
 * @route   DELETE /api/notifications/:id
 */
export const deleteNotification = async (req, res, next) => {
    try {
        const noti = await Notification.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (!noti) throw new AppError('Notification not found', 404);
        res.json({ success: true, message: 'Notification deleted' });
    } catch (e) { next(e); }
};

/**
 * @route   POST /api/notifications (internal or admin use)
 * Helper: createSystemNotification(userId, type, title, message, metadata)
 */
export const createNotification = async (req, res, next) => {
    try {
        const { userId, type, title, message, metadata } = req.body;
        const noti = await Notification.create({ userId, type, title, message, metadata });
        res.status(201).json({ success: true, data: noti });
    } catch (e) { next(e); }
};

// ── Utility function (call from other services) ───────────────────────────────
export const createSystemNotification = async (userId, type, title, message, metadata = {}) => {
    try {
        return await Notification.create({ userId, type, title, message, metadata });
    } catch (err) {
        console.error('createSystemNotification error:', err.message);
    }
};
