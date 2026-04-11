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
        priceStep: {
            type: Number,
            default: 5000000, // 5M VND per step for assets
            min: [500000, 'Price step must be at least 500K VND'],
        },
        images: [{
            type: String, // Multiple images for assets
        }],
        specifications: {
            area: String,      // Diện tích (for real estate)
            location: String,  // Vị trí chi tiết
            condition: String, // Tình trạng
            yearBuilt: Number, // Năm xây dựng
            legalStatus: String, // Tình trạng pháp lý
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
            default: '', // URL or path to asset image (deprecated, use images array)
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
