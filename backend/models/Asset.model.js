import mongoose from 'mongoose';

const assetSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Asset name is required'],
            trim: true,
        },
        type: {
            type: String,
            required: [true, 'Asset type is required'], // e.g., 'Real Estate', 'Jewelry', 'Art', 'Antique'
            trim: true,
        },
        province: {
            type: String,
            required: [true, 'Province/Location is required'],
            trim: true,
        },
        startingPrice: {
            type: Number,
            required: [true, 'Starting price is required'],
            min: [0, 'Starting price must be non-negative'],
        },
        status: {
            type: String,
            enum: ['available', 'in_auction', 'sold'],
            default: 'available',
        },
        description: {
            type: String,
            trim: true,
        },
        image: {
            type: String,
            default: '', // URL or path to asset image
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for performance
assetSchema.index({ type: 1 });
assetSchema.index({ province: 1 });
assetSchema.index({ status: 1 });
assetSchema.index({ name: 'text' });

const Asset = mongoose.model('Asset', assetSchema);

export default Asset;
