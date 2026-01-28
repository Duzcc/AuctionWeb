import mongoose from 'mongoose';

const favoriteSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User ID is required'],
        },
        plateId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Plate',
            required: [true, 'Plate ID is required'],
        },
        plateNumber: {
            type: String,
            required: [true, 'Plate number is required'],
            trim: true,
        },
        addedDate: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for performance
favoriteSchema.index({ userId: 1, addedDate: -1 });
favoriteSchema.index({ plateId: 1 });

// Compound unique index to prevent duplicate favorites
favoriteSchema.index({ userId: 1, plateId: 1 }, { unique: true });

const Favorite = mongoose.model('Favorite', favoriteSchema);

export default Favorite;
