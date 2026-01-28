import mongoose from 'mongoose';
import { hashData, verifyHash } from '../utils/crypto.utils.js';
import crypto from 'crypto';

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, 'Username is required'],
            unique: true,
            trim: true,
            minlength: [3, 'Username must be at least 3 characters'],
            maxlength: [50, 'Username cannot exceed 50 characters'],
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [8, 'Password must be at least 8 characters'],
            select: false, // Don't return password by default in queries
        },
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user',
        },
        avatar: {
            type: String,
            default: function () {
                // Generate default avatar URL using username
                const name = encodeURIComponent(this.username || 'User');
                return `https://ui-avatars.com/api/?name=${name}&background=AA8C3C&color=fff&size=200`;
            }
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        otpCode: {
            type: String,
            select: false, // Don't return OTP in queries
        },
        otpExpires: {
            type: Date,
            select: false,
        },
        // Additional user profile fields
        fullName: {
            type: String,
            trim: true,
        },
        phone: {
            type: String,
            trim: true,
        },
        address: {
            type: String,
            trim: true,
        },
        city: { type: String, trim: true },
        // Individual User Fields
        userType: { type: String, enum: ['individual', 'organization'], default: 'individual' },
        identityNumber: { type: String, trim: true },
        issueDate: { type: String, trim: true }, // Store as string or Date? Frontend sends string date
        issuePlace: { type: String, trim: true },
        // Organization fields
        businessName: { type: String, trim: true },
        taxCode: { type: String, trim: true },
        repName: { type: String, trim: true },
        repPhone: { type: String, trim: true },
        // Bank Info
        bankName: { type: String, trim: true },
        accountNumber: { type: String, trim: true },
        accountHolder: { type: String, trim: true },
        isProfileComplete: {
            type: Boolean,
            default: false,
        },
        lastLogin: {
            type: Date,
        },
        loginAttempts: {
            type: Number,
            default: 0,
        },
        lockUntil: {
            type: Date,
        },
        // Wallet Fields
        walletBalance: {
            type: Number,
            default: 0,
            min: [0, 'Wallet balance cannot be negative'],
        },
        lockedBalance: {
            type: Number,
            default: 0,
            min: [0, 'Locked balance cannot be negative'],
        },
        // KYC Fields
        kycStatus: {
            type: String,
            enum: ['not_submitted', 'pending', 'approved', 'rejected'],
            default: 'not_submitted',
        },
        kycVerifiedAt: {
            type: Date,
        },
        kycDocuments: [
            {
                type: {
                    type: String,
                    enum: ['id_front', 'id_back', 'selfie', 'business_license'],
                },
                url: String,
                uploadedAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        kycNotes: {
            type: String,
            trim: true,
        },
        kycRejectionReason: {
            type: String,
            trim: true,
        },
        // Bidding Restrictions
        isBiddingAllowed: {
            type: Boolean,
            default: true,
        },
        bannedUntil: {
            type: Date,
        },
        banReason: {
            type: String,
            trim: true,
        },
        // MFA Fields
        mfaSecret: {
            type: String,
            select: false,
        },
        mfaEnabled: {
            type: Boolean,
            default: false,
        },
        failedLoginAttempts: {
            type: Number,
            default: 0,
        },
        // Note: lockUntil is already defined above, removing duplicate
    },
    {
        timestamps: true,
    }
);

// Index for performance
userSchema.index({ createdAt: -1 });

// Virtual for account lock status
userSchema.virtual('isLocked').get(function () {
    return !!(this.lockUntil && this.lockUntil > Date.now());
});

/**
 * Pre-save hook: Hash password using Argon2
 */
userSchema.pre('save', async function (next) {
    // Only hash password if it's modified (or new)
    if (!this.isModified('password')) {
        return next();
    }

    try {
        this.password = await hashData(this.password);
        next();
    } catch (error) {
        next(error);
    }
});

/**
 * Instance method: Compare password using Argon2
 * @param {String} candidatePassword - Password to compare
 * @returns {Boolean} - True if password matches
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        return await verifyHash(this.password, candidatePassword);
    } catch (error) {
        throw new Error('Password comparison failed');
    }
};

/**
 * Instance method: Generate 6-digit OTP
 * @returns {String} - The generated OTP
 */
userSchema.methods.generateOTP = function () {
    const otp = crypto.randomInt(100000, 999999).toString();

    // Hash it if needed? Usually for email OTP simple storage is ok or hash it.
    // Given the `verifyOTP` compares plain text `this.otpCode === candidateOTP`, 
    // we store it plain text here (or update verifyOTP to hash).
    // The previous implementation (inferred) likely stored plain text.

    this.otpCode = otp;
    this.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    return otp;
};

/**
 * Instance method: Verify OTP code
 * @param {String} candidateOTP - OTP to verify
 * @returns {Boolean} - True if OTP is valid
 */
userSchema.methods.verifyOTP = function (candidateOTP) {
    if (!this.otpCode || !this.otpExpires) {
        return false;
    }

    const isExpired = Date.now() > this.otpExpires;
    const isMatch = this.otpCode === candidateOTP;

    return !isExpired && isMatch;
};

/**
 * Instance method: Increment login attempts
 */
userSchema.methods.incrementLoginAttempts = function () {
    // If we have a previous lock that has expired, restart at 1
    if (this.lockUntil && this.lockUntil < Date.now()) {
        return this.updateOne({
            $set: { loginAttempts: 1 },
            $unset: { lockUntil: 1 }
        });
    }

    // Otherwise increment attempts
    const updates = { $inc: { loginAttempts: 1 } };
    const maxAttempts = 5;
    const lockTime = 2 * 60 * 60 * 1000; // 2 hours

    // Lock account after max attempts
    if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked) {
        updates.$set = { lockUntil: Date.now() + lockTime };
    }

    return this.updateOne(updates);
};

/**
 * Static method: Clean up expired OTP codes (can be run periodically)
 */
userSchema.statics.cleanupExpiredOTPs = async function () {
    const result = await this.updateMany(
        { otpExpires: { $lt: Date.now() } },
        { $unset: { otpCode: 1, otpExpires: 1 } }
    );
    return result;
};

// Ensure virtual fields are serialized
userSchema.set('toJSON', {
    virtuals: true,
    transform: function (doc, ret) {
        delete ret.password;
        delete ret.otpCode;
        delete ret.otpExpires;
        delete ret.__v;
        return ret;
    }
});

const User = mongoose.model('User', userSchema);

export default User;
