import mongoose from 'mongoose';

const sessionPlateSchema = new mongoose.Schema(
    {
        sessionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Session',
            required: [true, 'Session ID is required'],
        },
        plateId: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: 'itemType', // Dynamic reference based on itemType
            required: [true, 'Plate/Asset ID is required'],
        },
        itemType: {
            type: String,
            required: [true, 'Item type is required'],
            enum: ['CarPlate', 'MotorbikePlate', 'Asset'],
            default: 'CarPlate' // Default for backward compatibility if needed, but we should always set it
        },
        plateNumber: {
            type: String, // Can be plate number or asset name
            required: [true, 'Plate number or Item name is required'],
            trim: true,
        },
        orderNumber: {
            type: Number,
            required: [true, 'Order number is required'],
            min: [1, 'Order number must be at least 1'],
        },
        startingPrice: {
            type: Number,
            required: [true, 'Starting price is required'],
            min: [0, 'Starting price must be non-negative'],
        },
        priceStep: {
            type: Number,
            required: [true, 'Price step is required'],
            min: [1000, 'Price step must be at least 1,000 VND'],
        },
        currentPrice: {
            type: Number,
            required: [true, 'Current price is required'],
            min: [0, 'Current price must be non-negative'],
        },
        lastBidTime: {
            type: Date,
        },
        bidExtensionSeconds: {
            type: Number,
            default: 180, // 3 minutes
        },
        totalExtensions: {
            type: Number,
            default: 0,
        },
        maxExtensions: {
            type: Number,
            default: 10, // Maximum 10 extensions
        },
        winnerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        winnerName: {
            type: String,
            trim: true,
        },
        finalPrice: {
            type: Number,
            min: [0, 'Final price must be non-negative'],
        },
        status: {
            type: String,
            enum: ['pending', 'bidding', 'sold', 'unsold'],
            default: 'pending',
        },
        auctionStartTime: {
            type: Date,
        },
        auctionEndTime: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for performance
sessionPlateSchema.index({ sessionId: 1, orderNumber: 1 });
sessionPlateSchema.index({ plateId: 1 });
sessionPlateSchema.index({ status: 1 });
sessionPlateSchema.index({ winnerId: 1 });

// Compound unique index to prevent duplicate items in same session
sessionPlateSchema.index({ sessionId: 1, plateId: 1 }, { unique: true });

const SessionPlate = mongoose.model('SessionPlate', sessionPlateSchema);

export default SessionPlate;
