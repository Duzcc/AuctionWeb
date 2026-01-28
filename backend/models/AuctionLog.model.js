import mongoose from 'mongoose';

const auctionLogSchema = new mongoose.Schema({
    sessionPlateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SessionPlate',
        required: [true, 'Session plate ID is required'],
        index: true
    },
    eventType: {
        type: String,
        enum: [
            'auction_created',
            'auction_started',
            'bid_placed',
            'time_extended',
            'auction_ended',
            'winner_determined',
            'payment_completed',
            'payment_failed',
            'auction_cancelled'
        ],
        required: [true, 'Event type is required']
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    userName: {
        type: String,
        trim: true
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    ipAddress: {
        type: String,
        trim: true
    },
    userAgent: {
        type: String,
        trim: true
    },
    previousState: {
        type: mongoose.Schema.Types.Mixed
    },
    newState: {
        type: mongoose.Schema.Types.Mixed
    },
    success: {
        type: Boolean,
        default: true
    },
    errorMessage: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

// Indexes for performance
auctionLogSchema.index({ sessionPlateId: 1, createdAt: -1 });
auctionLogSchema.index({ eventType: 1 });
auctionLogSchema.index({ userId: 1, createdAt: -1 });
auctionLogSchema.index({ createdAt: -1 });
auctionLogSchema.index({ success: 1 });

// Static method to log event
auctionLogSchema.statics.logEvent = async function (data) {
    try {
        const log = await this.create(data);
        return log;
    } catch (error) {
        console.error('Failed to create auction log:', error);
        // Don't throw error - logging should not break main flow
        return null;
    }
};

// Static method to get logs for a session plate
auctionLogSchema.statics.getLogsForAuction = async function (sessionPlateId, options = {}) {
    const {
        eventType,
        page = 1,
        limit = 50
    } = options;

    const query = { sessionPlateId };
    if (eventType) {
        query.eventType = eventType;
    }

    const logs = await this.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('userId', 'username email avatar');

    const total = await this.countDocuments(query);

    return {
        logs,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
};

const AuctionLog = mongoose.model('AuctionLog', auctionLogSchema);

export default AuctionLog;
