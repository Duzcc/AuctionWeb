import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema(
    {
        roomName: {
            type: String,
            required: [true, 'Room name is required'],
            trim: true,
        },
        location: {
            type: String,
            required: [true, 'Location is required'],
            trim: true,
        },
        capacity: {
            type: Number,
            required: [true, 'Capacity is required'],
            min: [1, 'Capacity must be at least 1'],
        },
        description: {
            type: String,
            trim: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        // Statistics tracking
        statistics: {
            totalSessions: {
                type: Number,
                default: 0,
            },
            totalParticipants: {
                type: Number,
                default: 0,
            },
            totalRevenue: {
                type: Number,
                default: 0,
            },
            averageBidsPerSession: {
                type: Number,
                default: 0,
            },
        },
        // Theme customization
        theme: {
            primaryColor: {
                type: String,
                default: '#D4AF37', // Gold
            },
            secondaryColor: {
                type: String,
                default: '#1F2937', // Dark gray
            },
            backgroundImage: {
                type: String,
                trim: true,
            },
            logoUrl: {
                type: String,
                trim: true,
            },
        },
        // Room settings
        settings: {
            allowChat: {
                type: Boolean,
                default: true,
            },
            maxParticipants: {
                type: Number,
                min: [1, 'Max participants must be at least 1'],
            },
            autoStartDelay: {
                type: Number,
                default: 30, // seconds before auto-start
                min: [0, 'Auto-start delay cannot be negative'],
            },
            enableSoundEffects: {
                type: Boolean,
                default: true,
            },
            enableNotifications: {
                type: Boolean,
                default: true,
            },
        },
    },
    {
        timestamps: true,
    }
);

// Index for performance
roomSchema.index({ location: 1 });
roomSchema.index({ isActive: 1 });

const Room = mongoose.model('Room', roomSchema);

export default Room;
