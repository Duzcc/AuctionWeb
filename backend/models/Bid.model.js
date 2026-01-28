import mongoose from 'mongoose';

const bidSchema = new mongoose.Schema(
    {
        sessionPlateId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'SessionPlate',
            required: [true, 'Session plate ID is required'],
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
        plateNumber: {
            type: String,
            required: [true, 'Plate number is required'],
            trim: true,
        },
        bidAmount: {
            type: Number,
            required: [true, 'Bid amount is required'],
            min: [0, 'Bid amount must be non-negative'],
        },
        isWinning: {
            type: Boolean,
            default: false,
        },
        bidTime: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for performance
bidSchema.index({ sessionPlateId: 1, bidTime: -1 });
bidSchema.index({ userId: 1 });
bidSchema.index({ isWinning: 1 });
bidSchema.index({ bidTime: -1 });

const Bid = mongoose.model('Bid', bidSchema);

export default Bid;
