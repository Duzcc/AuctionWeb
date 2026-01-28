import { io } from 'socket.io-client';
import store from '../store';
import { toast } from 'react-hot-toast';

let socket = null;

/**
 * Connect to Socket.io server
 * @param {String} token - JWT access token
 */
export const connectSocket = (token) => {
    if (socket?.connected) {
        console.log('Socket already connected');
        return socket;
    }

    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

    socket = io(SOCKET_URL, {
        auth: {
            token,
        },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
    });

    // Connection successful
    socket.on('connect', () => {
        console.log('✅ Socket.io connected:', socket.id);
    });

    // Listen for notifications
    socket.on('notification', (data) => {
        console.log('📩 Notification received:', data);

        if (data.type === 'login_success') {
            toast.success(data.message, {
                icon: '👋',
                duration: 4000,
            });
        }
    });

    // Listen for login notifications
    socket.on('login_notification', (data) => {
        console.log('🔐 Login notification:', data);
        toast(data.message, {
            icon: '🔐',
            duration: 5000,
        });
    });

    // Listen for device alerts
    socket.on('device_alert', (data) => {
        console.log('⚠️ Device alert:', data);
        toast.error(data.message, {
            icon: '⚠️',
            duration: 6000,
        });
    });

    // Broadcast notifications
    socket.on('broadcast_notification', (data) => {
        console.log('📢 Broadcast notification:', data);
        toast(data.message, {
            icon: '📢',
        });
    });

    // Connection error
    socket.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error);
        if (error.message === 'Invalid authentication token') {
            toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        }
    });

    // Disconnection
    socket.on('disconnect', (reason) => {
        console.log('👋 Socket disconnected:', reason);
    });

    return socket;
};

/**
 * Disconnect from Socket.io server
 */
export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
        console.log('Socket disconnected manually');
    }
};

/**
 * Get current socket instance
 * @returns {Object|null} Socket instance
 */
export const getSocket = () => {
    return socket;
};

/**
 * Emit custom event to server
 * @param {String} event - Event name
 * @param {Object} data - Event data
 */
export const emitEvent = (event, data) => {
    if (socket?.connected) {
        socket.emit(event, data);
    } else {
        console.warn('Socket not connected. Cannot emit event:', event);
    }
};

export default {
    connectSocket,
    disconnectSocket,
    getSocket,
    emitEvent,
};
