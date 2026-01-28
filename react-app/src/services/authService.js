import axiosInstance from './axiosInstance';

/**
 * Login user
 * @param {Object} credentials - { email, password }
 * @returns {Promise}
 */
export const login = async (credentials) => {
    return await axiosInstance.post('/auth/login', credentials);
};

/**
 * Register new user
 * @param {Object} userData - User registration data with optional avatar file
 * @returns {Promise}
 */
export const register = async (userData) => {
    // Check if avatar file is present
    const hasAvatar = userData.avatar && userData.avatar instanceof File;

    if (hasAvatar) {
        // Create FormData for multipart/form-data (to handle avatar upload)
        const formData = new FormData();

        Object.keys(userData).forEach((key) => {
            if (key === 'avatar' && userData[key]) {
                // Handle file upload
                formData.append('avatar', userData[key]);
            } else if (userData[key] !== null && userData[key] !== undefined) {
                formData.append(key, userData[key]);
            }
        });

        return await axiosInstance.post('/auth/register', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    } else {
        // Send as JSON when no avatar
        const { avatar, ...dataWithoutAvatar } = userData;
        return await axiosInstance.post('/auth/register', dataWithoutAvatar);
    }
};

/**
 * Refresh access token
 * @param {String} refreshToken
 * @returns {Promise}
 */
export const refreshToken = async () => {
    return await axiosInstance.post('/auth/refresh');
};

/**
 * Verify OTP code
 * @param {Object} otpData - { email, otpCode }
 * @returns {Promise}
 */
export const verifyOTP = async (otpData) => {
    return await axiosInstance.post('/auth/verify-otp', otpData);
};

/**
 * Resend OTP code
 * @param {String} email
 * @returns {Promise}
 */
export const resendOTP = async (email) => {
    return await axiosInstance.post('/auth/resend-otp', { email });
};

/**
 * Request password reset
 * @param {String} email
 * @returns {Promise}
 */
export const forgotPassword = async (email) => {
    return await axiosInstance.post('/auth/forgot-password', { email });
};

/**
 * Reset password with OTP
 * @param {Object} resetData - { email, otpCode, newPassword }
 * @returns {Promise}
 */
export const resetPassword = async (resetData) => {
    return await axiosInstance.post('/auth/reset-password', resetData);
};

/**
 * Get current user profile
 * @returns {Promise}
 */
export const getCurrentUser = async () => {
    return await axiosInstance.get('/auth/me');
};

export default {
    login,
    register,
    refreshToken,
    verifyOTP,
    resendOTP,
    forgotPassword,
    resetPassword,
    getCurrentUser,
};
