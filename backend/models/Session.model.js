import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema(
    {
        sessionName: {
            type: String,
            required: [true, 'Session name is required'],
            trim: true,
        },
        roomId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Room',
            required: [true, 'Room ID is required'],
        },
        startTime: {
            type: Date,
            required: [true, 'Start time is required'],
        },
        endTime: {
            type: Date,
            required: [true, 'End time is required'],
        },
        registrationStart: {
            type: Date,
            required: [true, 'Registration start time is required'],
        },
        registrationEnd: {
            type: Date,
            required: [true, 'Registration end time is required'],
        },
        status: {
            type: String,
            enum: ['upcoming', 'registration_open', 'registration_closed', 'ongoing', 'completed', 'cancelled'],
            default: 'upcoming',
        },
        depositAmount: {
            type: Number,
            required: [true, 'Deposit amount is required'],
            min: [0, 'Deposit amount must be non-negative'],
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
sessionSchema.index({ startTime: -1 });
sessionSchema.index({ status: 1 });
sessionSchema.index({ roomId: 1 });

// Virtual for checking if registration is open
sessionSchema.virtual('isRegistrationOpen').get(function () {
    const now = new Date();
    return now >= this.registrationStart && now <= this.registrationEnd;
});

const Session = mongoose.model('Session', sessionSchema);

export default Session;
