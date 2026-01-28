import { useEffect } from 'react';
import { axiosPrivate } from '../utils/axiosPrivate';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const useAxiosPrivate = () => {
    const { accessToken, setAccessToken } = useAuth();

    useEffect(() => {
        const requestIntercept = axiosPrivate.interceptors.request.use(
            config => {
                if (!config.headers['Authorization']) {
                    config.headers['Authorization'] = `Bearer ${accessToken}`;
                }
                return config;
            }, (error) => Promise.reject(error)
        );

        const responseIntercept = axiosPrivate.interceptors.response.use(
            response => response,
            async (error) => {
                const prevRequest = error?.config;
                if (error?.response?.status === 401 && !prevRequest?.sent) {
                    prevRequest.sent = true;
                    try {
                        // Call refresh endpoint
                        // Note: We use a raw axios instance here to avoid infinite loops if refresh fails
                        const response = await axios.post('http://localhost:5050/api/auth/refresh', {}, {
                            withCredentials: true
                        });

                        const newAccessToken = response.data.data.accessToken;
                        setAccessToken(newAccessToken);

                        prevRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                        return axiosPrivate(prevRequest);
                    } catch (refreshError) {
                        // Refresh failed (expired or revoked)
                        // Redirect to login or handle logout in Context?
                        // Ideally, AuthContext should handle this state update.
                        // For now, let it fail, and UI will react to null user.
                        return Promise.reject(refreshError);
                    }
                }
                return Promise.reject(error);
            }
        );

        return () => {
            axiosPrivate.interceptors.request.eject(requestIntercept);
            axiosPrivate.interceptors.response.eject(responseIntercept);
        }
    }, [accessToken, setAccessToken]);

    return axiosPrivate;
};

export default useAxiosPrivate;
