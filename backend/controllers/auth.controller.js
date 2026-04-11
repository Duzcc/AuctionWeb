import User from '../models/User.model.js';
import RefreshToken from '../models/RefreshToken.model.js';
import { generateAccessToken, generateRefreshToken, verifyToken } from '../utils/jwt.js';
import { hashTokenFn, verifyHash } from '../utils/crypto.utils.js';
import { uploadAvatar } from '../services/cloudinary.service.js';
import { sendWelcomeEmail, sendOTPEmail, sendPasswordResetEmail } from '../services/email.service.js';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import crypto from 'crypto';

// Helper: Generate Token Pair and Handle Refresh Token Storage
const createTokens = async (user, req, res) => {
    const payload = {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
    };

    const accessToken = generateAccessToken(payload);
    const refreshTokenString = generateRefreshToken(payload);

    // Store Refresh Token in DB (Rotation Logic)
    // Create a new Family ID or use existing? 
    // For new login -> New Family. For refresh -> Same Family.
    // This helper is for NEW logins mainly. Refresh logic is separate.

    const familyId = crypto.randomUUID();
    const tokenHash = hashTokenFn(refreshTokenString);

    await RefreshToken.create({
        user: user._id,
        tokenHash,
        familyId,
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
    });

    // Set Refresh Token in httpOnly Cookie
    res.cookie('refreshToken', refreshTokenString, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax', // Lax is better for dev (frontend/backend different ports)
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return { accessToken };
};

/**
 * @route   POST /api/auth/register
 */
export const registerUser = async (req, res) => {
    try {
        const { username, email, password, fullName, phone, address } = req.body;

        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: existingUser.email === email ? 'Email đã được sử dụng' : 'Tên đăng nhập đã tồn tại',
            });
        }

        const userData = { username, email, password, fullName, phone, address };

        if (req.file) {
            try {
                // Mock user ID for folder structure if needed or just use timestamp
                const avatarUrl = await uploadAvatar(req.file.buffer, 'temp-' + Date.now());
                userData.avatar = avatarUrl;
            } catch (error) {
                console.error('Avatar upload failed', error);
            }
        }

        const user = new User(userData);
        const otpCode = user.generateOTP(); // Email OTP for verification (not MFA)
        await user.save();

        sendWelcomeEmail(email, username).catch(e => console.error(e));
        sendOTPEmail(email, otpCode).catch(e => console.error(e));

        const userResponse = user.toJSON();

        res.status(201).json({
            success: true,
            message: 'Đăng ký thành công! Vui lòng kiểm tra email.',
            data: { user: userResponse, requiresVerification: true },
        });

    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @route   POST /api/auth/login
 */
export const loginUser = async (req, res) => {
    try {
        const { email, password, otpCode } = req.body;

        if (!email || !password) return res.status(400).json({ success: false, message: 'Thiếu thông tin đăng nhập' });

        const user = await User.findOne({ email }).select('+password +otpCode +otpExpires +mfaEnabled +mfaSecret +loginAttempts +lockUntil');

        if (!user) return res.status(401).json({ success: false, message: 'Thông tin đăng nhập không đúng' });

        if (user.isLocked) {
            return res.status(423).json({ success: false, message: 'Tài khoản tạm thời bị khóa' });
        }

        // 1. Password Check (Always first)
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            await user.incrementLoginAttempts();
            return res.status(401).json({ success: false, message: 'Thông tin đăng nhập không đúng' });
        }

        // Reset attempts if password correct
        if (user.loginAttempts > 0) {
            await user.updateOne({ $set: { loginAttempts: 0 }, $unset: { lockUntil: 1 } });
        }

        // 2. Admin Enforced OTP Check
        const isAdmin = user.role === 'admin' || user.email === process.env.EMAIL_USER; // OR process.env.ADMIN_EMAIL if used

        // If Admin, Enforce OTP
        if (isAdmin) { // Bỏ TEST BYPASS
            // Case A: OTP Submitted -> Verify and Login
            if (otpCode) {
                if (!user.verifyOTP(otpCode)) {
                    return res.status(400).json({ success: false, message: 'Mã xác thực không đúng hoặc đã hết hạn' });
                }
                // OTP Valid -> Proceed to Token Issue
                // Clear OTP
                user.otpCode = undefined;
                user.otpExpires = undefined;
                await user.save();
            }
            // Case B: No OTP -> Generate and Ask for it
            else {
                const newOtp = user.generateOTP();
                await user.save();
                
                // Send to valid admin email in .env instead of fake seed email
                const emailToReceiveOTP = isAdmin ? (process.env.ADMIN_NOTIFICATION_EMAIL || user.email) : user.email;
                await sendOTPEmail(emailToReceiveOTP, newOtp);

                return res.status(200).json({
                    success: true,
                    message: 'Vui lòng nhập mã xác thực đã gửi tới email admin',
                    data: { requireOtp: true, email: user.email }
                });
            }
        }

        // 3. Regular User (No OTP required anymore per request)
        // We skip the isVerified check as requested "user thì khong cần"
        // But maybe keep isVerified logic if they clicked link? 
        // User said: "sửa lại... user thì khong cần [xác thực qua mail]" implying they can login immediately.

        user.lastLogin = new Date();
        await user.save();

        // Issue real tokens
        const { accessToken } = await createTokens(user, req, res);

        res.status(200).json({
            success: true,
            message: 'Đăng nhập thành công',
            data: {
                user: user.toJSON(),
                accessToken
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @route POST /api/auth/refresh
 * @desc Refresh Access Token using HttpOnly Cookie & Rotation
 */
export const refreshToken = async (req, res) => {
    try {
        const refreshTokenString = req.cookies?.refreshToken;
        if (!refreshTokenString) return res.status(401).json({ success: false, message: 'No refresh token' });

        // Decode to get payload (without verifying signature yet if we want to check DB first? No, verify first)
        let decoded;
        try {
            decoded = verifyToken(refreshTokenString);
        } catch (e) {
            // If token expired, we still check DB to see if it was a valid family... 
            // Simplifying: If expired logic, user logs in again.
            return res.status(401).json({ success: false, message: 'Invalid token' });
        }

        const tokenHash = hashTokenFn(refreshTokenString);

        // Find token in DB
        const existingToken = await RefreshToken.findOne({ tokenHash });

        // REUSE DETECTION //
        if (!existingToken) {
            // It might be a reused token (rotated out already and deleted) OR just invalid/fake.
            // If we keep used tokens with isRevoked=true, we can detect reuse.
            // Let's assume we find it via family if it was rotated? 
            // Implementation: We look for a token with this hash. 
            // If NOT found, but decoded is valid, it means it was deleted (rotated). 
            // This is suspicious if the expiry was long.

            // To properly detect reuse, we should probably query by FAMILY ID (if we encoded it in token? No usually just UserID)
            // Let's rely on the concept: If client sends a token that is valid JWT but not in DB -> Possible Reuse or Logged Out.
            // Aggressive stance: Revoke all refresh tokens for this user.

            await RefreshToken.deleteMany({ user: decoded.id });
            res.clearCookie('refreshToken');
            return res.status(403).json({ success: false, message: 'Token reuse detected. Please login again.' });
        }

        if (existingToken.isRevoked) {
            // Reuse of revoked token -> Breach!
            await RefreshToken.deleteMany({ user: decoded.id });
            res.clearCookie('refreshToken');
            return res.status(403).json({ success: false, message: 'Security Alert: Token reuse.' });
        }

        // Token is valid and current. Rotate it!
        const user = await User.findById(decoded.id);
        if (!user) return res.status(401).json({ success: false, message: 'User not found' });

        // Revoke current (or delete?) -> Mark revoked is better for audit, but clean up old ones.
        existingToken.isRevoked = true;
        await existingToken.save();

        // Issue new Pair
        const payload = { id: user._id, email: user.email, username: user.username, role: user.role };
        const newAccessToken = generateAccessToken(payload);
        const newRefreshTokenString = generateRefreshToken(payload);
        const newTokenHash = hashTokenFn(newRefreshTokenString);

        await RefreshToken.create({
            user: user._id,
            tokenHash: newTokenHash,
            familyId: existingToken.familyId, // Keep same family
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
        });

        res.cookie('refreshToken', newRefreshTokenString, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(200).json({
            success: true,
            data: {
                accessToken: newAccessToken,
                user: user.toJSON()
            }
        });

    } catch (error) {
        console.error('Refresh error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};


/**
 * @route POST /api/auth/logout
 */
export const logoutUser = async (req, res) => {
    try {
        const refreshTokenString = req.cookies?.refreshToken;
        if (refreshTokenString) {
            const tokenHash = hashTokenFn(refreshTokenString);
            // Revoke specific token
            await RefreshToken.findOneAndUpdate({ tokenHash }, { isRevoked: true });
        }

        res.clearCookie('refreshToken');
        res.status(200).json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Keep existing exports but updated
export const verifyOTP = async (req, res) => { /* Same as old but ensure User import correct */
    /* ... reuse old logic if needed or rewrite simplified ... */
    // For brevity, assuming basic email OTP logic remains same as original file, 
    // just ensure standard exports.
    // I will skip implementation detail for this specific function in this artifact 
    // to focus on the core replacement, assuming the user can copy-paste from old if needed?
    // BETTER: Include it to avoid breaking app.

    try {
        const { email, otpCode } = req.body;
        const user = await User.findOne({ email }).select('+otpCode +otpExpires');
        if (!user || !user.verifyOTP(otpCode)) {
            return res.status(400).json({ success: false, message: 'Invalid OTP' });
        }
        user.isVerified = true;
        user.otpCode = undefined;
        user.otpExpires = undefined;
        await user.save();
        res.status(200).json({ success: true, message: 'Verified' });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
};

export const resendOTP = async (req, res) => {
    // Simplified reimplementation
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'Not found' });
        const otp = user.generateOTP();
        await user.save();
        sendOTPEmail(email, otp);
        res.status(200).json({ success: true, message: 'Sent' });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (user) {
            const otp = user.generateOTP();
            await user.save();
            sendPasswordResetEmail(email, otp);
        }
        res.status(200).json({ success: true, message: 'If email exists, OTP sent' });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { email, otpCode, newPassword } = req.body;
        const user = await User.findOne({ email }).select('+otpCode +otpExpires');
        if (!user || !user.verifyOTP(otpCode)) return res.status(400).json({ message: 'Invalid OTP' });

        user.password = newPassword; // Will be hashed by hooks
        user.otpCode = undefined;
        user.otpExpires = undefined;
        await user.save();
        res.status(200).json({ success: true, message: 'Password reset' });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

export const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json({ success: true, data: { user } });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

/**
 * @route PUT /api/auth/profile
 * @desc Update user profile details
 */
export const updateUserProfile = async (req, res) => {
    try {
        const updates = req.body;
        const allowedUpdates = [
            'fullName', 'phone', 'address', 'city', 'userType',
            'identityNumber', 'issueDate', 'issuePlace',
            'businessName', 'taxCode', 'repName', 'repPhone',
            'bankName', 'accountNumber', 'accountHolder'
        ];

        // Filter out non-allowed fields
        const filteredUpdates = Object.keys(updates)
            .filter(key => allowedUpdates.includes(key))
            .reduce((obj, key) => {
                obj[key] = updates[key];
                return obj;
            }, {});

        // Mark profile as complete if core fields are present
        // (Simple heuristic, can be more robust)
        if (filteredUpdates.fullName && filteredUpdates.phone && filteredUpdates.address && filteredUpdates.city) {
            filteredUpdates.isProfileComplete = true;
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: filteredUpdates },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Cập nhật thông tin thành công',
            data: { user }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export default { registerUser, loginUser, refreshToken, logoutUser, verifyOTP, resendOTP, forgotPassword, resetPassword, getCurrentUser, updateUserProfile };

