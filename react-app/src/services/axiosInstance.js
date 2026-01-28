import axios from 'axios';
import store from '../store';
import { refreshAccessToken, logout } from '../store/slices/authSlice';

// Create axios instance with default config
const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5050/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// Request interceptor - attach access token to every request
axiosInstance.interceptors.request.use(
    (config) => {
        const state = store.getState();
        const accessToken = state.auth.accessToken;

        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - handle token refresh on 401
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });

    failedQueue = [];
};

axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Handle 403 Forbidden from refresh endpoint specifically
        if (error.response?.status === 403 && originalRequest.url?.includes('/auth/refresh')) {
            console.error('🔒 Refresh token invalid or revoked. Logging out...');

            // Clear auth state and redirect to login
            store.dispatch(logout());

            if (typeof window !== 'undefined') {
                // Store the message for login page to display
                sessionStorage.setItem('authError', 'Your session has expired. Please log in again.');
                window.location.href = '/login';
            }

            return Promise.reject(error);
        }

        // Check if error is 401 and we haven't tried to refresh yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (error.response?.data?.code === 'TOKEN_EXPIRED' && !isRefreshing) {
                originalRequest._retry = true;
                isRefreshing = true;

                try {
                    // Dispatch refresh token action
                    const result = await store.dispatch(refreshAccessToken()).unwrap();

                    isRefreshing = false;
                    processQueue(null, result.accessToken);

                    // Retry original request with new token
                    originalRequest.headers.Authorization = `Bearer ${result.accessToken}`;
                    return axiosInstance(originalRequest);
                } catch (refreshError) {
                    isRefreshing = false;
                    processQueue(refreshError, null);

                    console.error('🔒 Token refresh failed. Logging out...');

                    // Refresh failed, logout user
                    store.dispatch(logout());

                    // Redirect to login
                    if (typeof window !== 'undefined') {
                        sessionStorage.setItem('authError', 'Your session has expired. Please log in again.');
                        window.location.href = '/login';
                    }

                    return Promise.reject(refreshError);
                }
            }

            // If already refreshing, queue this request
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return axiosInstance(originalRequest);
                    })
                    .catch((err) => {
                        return Promise.reject(err);
                    });
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
