import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema(
    {
        roomId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Room',
            required: [true, 'Room ID is required'],
            index: true,
        },
        sessionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Session',
            required: [true, 'Session ID is required'],
            index: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User ID is required'],
        },
        userName: {
            type: String,
            required: [true, 'User name is required'],
            trim: true,
        },
        userAvatar: {
            type: String,
            trim: true,
        },
        message: {
            type: String,
            required: [true, 'Message content is required'],
            trim: true,
            maxlength: [500, 'Message cannot exceed 500 characters'],
        },
        messageType: {
            type: String,
            enum: ['text', 'system', 'bid_alert', 'user_joined', 'user_left'],
            default: 'text',
        },
        metadata: {
            bidAmount: Number,
            plateNumber: String,
            action: String,
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
        deletedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for performance
chatMessageSchema.index({ roomId: 1, createdAt: -1 });
chatMessageSchema.index({ sessionId: 1, createdAt: -1 });
chatMessageSchema.index({ userId: 1 });
chatMessageSchema.index({ messageType: 1 });

// Static method to create system message
chatMessageSchema.statics.createSystemMessage = async function (data) {
    const { roomId, sessionId, message, metadata } = data;

    return await this.create({
        roomId,
        sessionId,
        userId: null,
        userName: 'Hệ thống',
        message,
        messageType: 'system',
        metadata,
    });
};

// Static method to get recent messages
chatMessageSchema.statics.getRecentMessages = async function (sessionId, limit = 50) {
    return await this.find({
        sessionId,
        isDeleted: false,
    })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('userId', 'username avatar')
        .lean();
};

// Method to soft delete message
chatMessageSchema.methods.softDelete = async function () {
    this.isDeleted = true;
    this.deletedAt = new Date();
    return await this.save();
};

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

export default ChatMessage;
