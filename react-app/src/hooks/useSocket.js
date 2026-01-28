import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { connectSocket, disconnectSocket } from '../services/socketService';

/**
 * Custom hook to manage Socket.io connection
 * Automatically connects when user is authenticated and disconnects on logout
 */
const useSocket = () => {
    const { isAuthenticated, accessToken } = useSelector((state) => state.auth);

    useEffect(() => {
        if (isAuthenticated && accessToken) {
            // Connect to Socket.io server with access token
            const socket = connectSocket(accessToken);

            // Cleanup on unmount or when auth state changes
            return () => {
                disconnectSocket();
            };
        } else {
            // Disconnect if user logs out
            disconnectSocket();
        }
    }, [isAuthenticated, accessToken]);
};

export default useSocket;
