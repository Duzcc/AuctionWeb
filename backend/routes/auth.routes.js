import express from 'express';
import {
    registerUser,
    loginUser,
    logoutUser,
    refreshToken,
    verifyOTP,
    resendOTP,
    forgotPassword,
    resetPassword,
    getCurrentUser,
    updateUserProfile,
} from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { uploadAvatar, handleUploadError } from '../middleware/upload.middleware.js';

const router = express.Router();

// Public routes
router.post('/register', uploadAvatar, registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/refresh', refreshToken);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes
router.get('/me', authenticate, getCurrentUser);
router.put('/profile', authenticate, updateUserProfile);

export default router;
