import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    type: {
        type: String,
        enum: ['bid', 'login', 'warning', 'info', 'reward', 'kyc', 'payment', 'system'],
        default: 'info',
    },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    isRead: { type: Boolean, default: false, index: true },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} }, // sessionId, plateId, etc.
}, {
    timestamps: true,
});

// Compound index for fast unread count queries
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

// Auto-delete notifications older than 30 days
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 3600 });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
