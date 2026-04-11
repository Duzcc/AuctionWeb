import mongoose from 'mongoose';

const carPlateSchema = new mongoose.Schema(
    {
        plateNumber: {
            type: String,
            required: [true, 'Plate number is required'],
            unique: true,
            trim: true,
            uppercase: true,
        },
        province: {
            type: String,
            required: [true, 'Province is required'],
            trim: true,
        },
        // Removed vehicleType as this model is exclusively for cars
        plateType: {
            type: String,
            enum: ['Ngũ quý', 'Sảnh tiến', 'Tứ quý', 'Tam hoa', 'Thần tài', 'Lộc phát', 'Ông địa', 'Số gánh', 'Lặp đôi', 'Biển đẹp'],
            required: [true, 'Plate type is required'],
        },
        plateColor: {
            type: String,
            enum: ['Biển trắng', 'Biển vàng'],
            required: [true, 'Plate color is required'],
        },
        startingPrice: {
            type: Number,
            required: [true, 'Starting price is required'],
            min: [0, 'Starting price must be non-negative'],
        },
        priceStep: {
            type: Number,
            default: 1000000, // 1M VND per step
            min: [100000, 'Price step must be at least 100K VND'],
        },
        images: [{
            type: String, // Array of image URLs
        }],
        detailedDescription: {
            type: String,
            trim: true,
        },
        features: {
            type: [String], // ['Số đẹp', 'Dễ nhớ', 'Phong thủy tốt']
            default: [],
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
    },
    {
        timestamps: true,
    }
);

// Indexes for performance
carPlateSchema.index({ province: 1 });
carPlateSchema.index({ plateType: 1 });
carPlateSchema.index({ plateColor: 1 });
carPlateSchema.index({ status: 1 });
carPlateSchema.index({ plateNumber: 'text' });

const CarPlate = mongoose.model('CarPlate', carPlateSchema);

export default CarPlate;
