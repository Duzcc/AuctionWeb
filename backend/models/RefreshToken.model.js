import mongoose from 'mongoose';

const refreshTokenSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tokenHash: {
        type: String,
        required: true,
        index: true // Helper for faster lookup
    },
    familyId: {
        type: String,
        required: true,
        index: true // Helper for revocation of family
    },
    expires: {
        type: Date,
        required: true
    },
    isRevoked: {
        type: Boolean,
        default: false
    },
    ipAddress: String,
    userAgent: String
}, {
    timestamps: true
});

// Auto-expire documents after they expire (TTL index)
// Note: expires field is Date. Clean up 30 days after expiry just to be safe or immediately.
// Actually standard strategy: simply check expiry logic in code, or use simple TTL.
// Let's set TTL to 'expires' field itself. 
refreshTokenSchema.index({ expires: 1 }, { expireAfterSeconds: 0 });

const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);

export default RefreshToken;
