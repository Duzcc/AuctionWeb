import mongoose from 'mongoose';

const plateSchema = new mongoose.Schema(
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
        vehicleType: {
            type: String,
            enum: ['car', 'motorcycle'],
            required: [true, 'Vehicle type is required'],
        },
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
plateSchema.index({ province: 1 });
plateSchema.index({ vehicleType: 1 });
plateSchema.index({ plateType: 1 });
plateSchema.index({ plateColor: 1 });
plateSchema.index({ status: 1 });
plateSchema.index({ plateNumber: 'text' });

const Plate = mongoose.model('Plate', plateSchema);

export default Plate;
