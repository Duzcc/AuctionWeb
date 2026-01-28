import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema(
    {
        sessionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Session',
            required: [true, 'Session ID is required'],
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
        depositAmount: {
            type: Number,
            required: [true, 'Deposit amount is required'],
            min: [0, 'Deposit amount must be non-negative'],
        },
        depositStatus: {
            type: String,
            enum: ['pending', 'paid', 'refunded'],
            default: 'pending',
        },
        status: {
            type: String,
            enum: ['registered', 'approved', 'rejected', 'cancelled'],
            default: 'registered',
        },
        depositProof: {
            type: String, // URL or path to deposit proof image
        },
        depositProofUploadedAt: {
            type: Date,
        },
        // Plate Information - Track which plate this registration is for
        plateNumber: {
            type: String,
            trim: true,
        },
        plateType: {
            type: String,
            enum: ['CarPlate', 'MotorbikePlate', 'Asset'],
        },
        plateId: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: 'plateType', // Dynamic reference based on plateType
        },
        notes: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for performance
registrationSchema.index({ sessionId: 1 });
registrationSchema.index({ userId: 1 });
registrationSchema.index({ status: 1 });
registrationSchema.index({ depositStatus: 1 });
registrationSchema.index({ plateNumber: 1 });
registrationSchema.index({ plateId: 1 });

// Compound unique index to prevent duplicate registrations
registrationSchema.index({ sessionId: 1, userId: 1 }, { unique: true });

const Registration = mongoose.model('Registration', registrationSchema);

export default Registration;
