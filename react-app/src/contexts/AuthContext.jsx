import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { axiosPrivate } from '../utils/axiosPrivate';
import { setCredentials, logout as logoutAction } from '../store/slices/authSlice';

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [accessToken, setAccessToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Verify user authentication on app load using refresh token
    useEffect(() => {
        const verifyUser = async () => {
            const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

            if (!isLoggedIn) {
                setLoading(false);
                return;
            }

            try {
                // Get new access token via refresh token cookie
                const response = await axiosPrivate.post('/auth/refresh');
                const { accessToken, user } = response.data.data;
                setAccessToken(accessToken);
                localStorage.setItem('token', accessToken);

                // Fetch user data if not included in refresh response
                let userData = user;
                if (!userData) {
                    const meRes = await axiosPrivate.get('/auth/me');
                    userData = meRes.data.data.user;
                }
                setUser(userData);

                // Sync with Redux
                dispatch(setCredentials({ user: userData, accessToken, refreshToken: null }));

            } catch (error) {
                // Clear authentication state if refresh fails
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('token');
                setUser(null);
                setAccessToken(null);
                dispatch(logoutAction());
            } finally {
                setLoading(false);
            }
        };

        verifyUser();
    }, [dispatch]);

    const login = async (email, password, otpCode) => {
        const response = await axiosPrivate.post('/auth/login', { email, password, otpCode });

        // Handle Admin OTP Challenge
        if (response.data.data?.requireOtp) {
            return { success: true, requireOtp: true, message: response.data.message };
        }

        if (response.data.data.mfaRequired) {
            return { mfaRequired: true, tempToken: response.data.data.tempToken };
        }

        const { user, accessToken } = response.data.data;
        setUser(user);
        setAccessToken(accessToken);
        localStorage.setItem('isLoggedIn', 'true');
        // Save token to localStorage so axios can access it
        localStorage.setItem('token', accessToken);

        // Sync with Redux
        dispatch(setCredentials({ user, accessToken, refreshToken: null }));

        return { success: true };
    };

    const register = async (formData) => {
        // Register logic (usually just redirects to login or auto-login)
        await axiosPrivate.post('/auth/register', formData);
        return { success: true };
    };

    const logout = async () => {
        try {
            await axiosPrivate.post('/auth/logout');
        } catch (e) {
            console.error('Logout failed', e);
        }
        setUser(null);
        setAccessToken(null);
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('token');
        dispatch(logoutAction());
        navigate('/login');
    };

    const checkProfileComplete = () => {
        if (!user) return false;
        return !!(user.fullName && user.email && user.phone);
    };

    const updateProfile = async (data) => {
        try {
            const response = await axiosPrivate.put('/auth/profile', data, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            const updatedUser = response.data.data.user;
            setUser(updatedUser);
            // Sync with Redux
            dispatch(setCredentials({ user: updatedUser, accessToken, refreshToken: null }));
            return { success: true };
        } catch (error) {
            console.error('Update profile error:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Cập nhật thất bại'
            };
        }
    };

    const value = {
        user,
        accessToken,
        isAuthenticated: !!user,
        checkProfileComplete,
        updateProfile,
        setAccessToken,
        login,
        register,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
