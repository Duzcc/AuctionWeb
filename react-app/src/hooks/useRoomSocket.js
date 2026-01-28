import { useState, useEffect, useCallback, useRef } from 'react';
import { getSocket } from '../services/socketService';

/**
 * Custom hook for room-specific socket features
 * @param {String} sessionPlateId - ID of the session plate
 * @param {Boolean} enabled - Whether to enable the socket connection
 * @returns {Object} Socket state and handlers
 */
export function useRoomSocket(sessionPlateId, enabled = true) {
    const [messages, setMessages] = useState([]);
    const [participants, setParticipants] = useState([]);
    const [typingUsers, setTypingUsers] = useState([]);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState(null);

    const socketRef = useRef(null);
    const typingTimeoutRef = useRef({});

    useEffect(() => {
        if (!enabled || !sessionPlateId) return;

        const socket = getSocket();
        if (!socket) {
            setError('Socket not initialized');
            return;
        }

        socketRef.current = socket;

        // Connection status
        const handleConnect = () => {
            console.log('Room socket connected');
            setIsConnected(true);
            setError(null);

            // Request initial data
            socket.emit('get_chat_history', { sessionPlateId, limit: 50 });
            socket.emit('get_participants', { sessionPlateId });
        };

        const handleDisconnect = () => {
            console.log('Room socket disconnected');
            setIsConnected(false);
        };

        const handleConnectError = (err) => {
            console.error('Room socket connection error:', err);
            setError(err.message || 'Connection error');
            setIsConnected(false);
        };

        // Chat events
        const handleNewChatMessage = (data) => {
            setMessages(prev => [...prev, data]);
        };

        const handleChatHistory = (data) => {
            setMessages(data.messages || []);
        };

        // Typing events
        const handleUserTyping = (data) => {
            const { userId, userName, isTyping } = data;

            if (isTyping) {
                setTypingUsers(prev => {
                    const exists = prev.find(u => u.userId === userId);
                    if (exists) return prev;
                    return [...prev, { userId, userName }];
                });

                // Clear previous timeout for this user
                if (typingTimeoutRef.current[userId]) {
                    clearTimeout(typingTimeoutRef.current[userId]);
                }

                // Set timeout to remove typing indicator
                typingTimeoutRef.current[userId] = setTimeout(() => {
                    setTypingUsers(prev => prev.filter(u => u.userId !== userId));
                    delete typingTimeoutRef.current[userId];
                }, 3000);
            } else {
                setTypingUsers(prev => prev.filter(u => u.userId !== userId));
                if (typingTimeoutRef.current[userId]) {
                    clearTimeout(typingTimeoutRef.current[userId]);
                    delete typingTimeoutRef.current[userId];
                }
            }
        };

        // Participants events
        const handleParticipantsList = (data) => {
            setParticipants(data.participants || []);
        };

        const handleUserJoined = (data) => {
            // Update participants count (actual list will be refreshed on next get_participants call)
            socket.emit('get_participants', { sessionPlateId });
        };

        const handleUserLeft = (data) => {
            socket.emit('get_participants', { sessionPlateId });
        };

        // Register event listeners
        socket.on('connect', handleConnect);
        socket.on('disconnect', handleDisconnect);
        socket.on('connect_error', handleConnectError);
        socket.on('new_chat_message', handleNewChatMessage);
        socket.on('chat_history', handleChatHistory);
        socket.on('user_typing', handleUserTyping);
        socket.on('participants_list', handleParticipantsList);
        socket.on('user_joined', handleUserJoined);
        socket.on('user_left', handleUserLeft);

        // Check if already connected
        if (socket.connected) {
            handleConnect();
        }

        // Cleanup
        return () => {
            socket.off('connect', handleConnect);
            socket.off('disconnect', handleDisconnect);
            socket.off('connect_error', handleConnectError);
            socket.off('new_chat_message', handleNewChatMessage);
            socket.off('chat_history', handleChatHistory);
            socket.off('user_typing', handleUserTyping);
            socket.off('participants_list', handleParticipantsList);
            socket.off('user_joined', handleUserJoined);
            socket.off('user_left', handleUserLeft);

            // Clear all typing timeouts
            Object.values(typingTimeoutRef.current).forEach(clearTimeout);
        };
    }, [sessionPlateId, enabled]);

    // Send chat message
    const sendMessage = useCallback((message) => {
        if (!socketRef.current || !isConnected) {
            console.error('Cannot send message: socket not connected');
            return false;
        }

        socketRef.current.emit('send_chat_message', {
            sessionPlateId,
            message,
        });

        return true;
    }, [sessionPlateId, isConnected]);

    // Send typing indicator
    const sendTyping = useCallback((isTyping) => {
        if (!socketRef.current || !isConnected) return;

        socketRef.current.emit('typing_indicator', {
            sessionPlateId,
            isTyping,
        });
    }, [sessionPlateId, isConnected]);

    // Refresh participants list
    const refreshParticipants = useCallback(() => {
        if (!socketRef.current || !isConnected) return;

        socketRef.current.emit('get_participants', {
            sessionPlateId,
        });
    }, [sessionPlateId, isConnected]);

    // Refresh chat history
    const refreshChatHistory = useCallback((limit = 50) => {
        if (!socketRef.current || !isConnected) return;

        socketRef.current.emit('get_chat_history', {
            sessionPlateId,
            limit,
        });
    }, [sessionPlateId, isConnected]);

    return {
        // State
        messages,
        participants,
        typingUsers,
        isConnected,
        error,

        // Actions
        sendMessage,
        sendTyping,
        refreshParticipants,
        refreshChatHistory,

        // Socket instance for custom events
        socket: socketRef.current,
    };
}

export default useRoomSocket;
