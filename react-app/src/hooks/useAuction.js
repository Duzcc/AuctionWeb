import { useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';

/**
 * Custom hook for real-time auction functionality
 * @param {String} sessionPlateId - ID of the session plate to connect to
 * @param {String} token - JWT authentication token
 */
export function useAuction(sessionPlateId, token) {
    const [auctionData, setAuctionData] = useState(null);
    const [bids, setBids] = useState([]);
    const [currentPrice, setCurrentPrice] = useState(0);
    const [endTime, setEndTime] = useState(null);
    const [status, setStatus] = useState('loading');
    const [viewers, setViewers] = useState(0);
    const [error, setError] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [totalExtensions, setTotalExtensions] = useState(0);

    const socketRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);
    const reconnectAttemptsRef = useRef(0);

    useEffect(() => {
        if (!sessionPlateId || !token) return;

        // Create socket connection
        const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5050', {
            auth: { token },
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: 5
        });

        socketRef.current = socket;

        // Connection established
        socket.on('connect', () => {
            console.log('✅ Socket connected');
            setIsConnected(true);
            setError(null);
            reconnectAttemptsRef.current = 0;

            // Join auction room
            socket.emit('join_auction', { sessionPlateId });
        });

        // Auction joined successfully
        socket.on('auction_joined', (data) => {
            console.log('Joined auction:', data);
            setAuctionData(data.sessionPlate);
            setBids(data.recentBids || []);
            setCurrentPrice(data.sessionPlate.currentPrice);
            setEndTime(new Date(data.sessionPlate.auctionEndTime));
            setViewers(data.currentViewers);
            setTotalExtensions(data.sessionPlate.totalExtensions || 0);
            setStatus('active');
        });

        // New bid placed
        socket.on('new_bid', (data) => {
            console.log('New bid:', data);
            setBids(prev => [data, ...prev].slice(0, 50)); // Keep last 50 bids
            setCurrentPrice(data.bidAmount);

            // Play sound notification
            try {
                const audio = new Audio('/sounds/bid-placed.mp3');
                audio.play().catch(e => console.log('Audio play failed:', e));
            } catch (e) {
                console.log('Audio error:', e);
            }
        });

        // Time extended
        socket.on('time_extended', (data) => {
            console.log('⏰ Time extended:', data);
            setEndTime(new Date(data.newEndTime));
            setTotalExtensions(data.totalExtensions);

            // Show notification
            if (typeof window !== 'undefined' && window.showToast) {
                window.showToast(
                    `Time extended! +${data.extensionSeconds} seconds`,
                    'info'
                );
            }
        });

        // Auction ended
        socket.on('auction_ended', (data) => {
            console.log('🏁 Auction ended:', data);
            setStatus('ended');
            setAuctionData(prev => ({
                ...prev,
                status: data.status,
                winnerId: data.winnerId,
                winnerName: data.winnerName,
                finalPrice: data.finalPrice
            }));
        });

        // User joined/left
        socket.on('user_joined', (data) => {
            setViewers(data.totalViewers);
        });

        socket.on('user_left', (data) => {
            setViewers(data.totalViewers);
        });

        // Error handling
        socket.on('error', (data) => {
            console.error('Socket error:', data);
            // Extract error message from various formats
            const errorMessage = data?.message || data?.error || JSON.stringify(data) || 'Unknown socket error';
            console.error('Error message:', errorMessage);
            setError(errorMessage);
        });

        socket.on('connect_error', (err) => {
            console.error('Connection error:', err);
            console.error('Error details:', {
                message: err.message,
                description: err.description,
                context: err.context,
                type: err.type
            });
            setIsConnected(false);
            reconnectAttemptsRef.current++;

            if (reconnectAttemptsRef.current >= 5) {
                const errorMsg = err.message || 'Failed to connect to auction';
                setError(`${errorMsg}. Please refresh the page.`);
            } else {
                setError(`Reconnecting... (Attempt ${reconnectAttemptsRef.current}/5)`);
            }
        });

        socket.on('disconnect', (reason) => {
            console.log('Disconnected:', reason);
            setIsConnected(false);

            if (reason === 'io server disconnect') {
                // Server disconnected, manual reconnect needed
                socket.connect();
            }
        });

        // Cleanup
        return () => {
            if (socketRef.current) {
                socketRef.current.emit('leave_auction', { sessionPlateId });
                socketRef.current.disconnect();
            }
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
        };
    }, [sessionPlateId, token]);

    // Ping/heartbeat
    useEffect(() => {
        if (!isConnected || !socketRef.current) return;

        const pingInterval = setInterval(() => {
            socketRef.current.emit('ping');
        }, 30000); // Every 30 seconds

        return () => clearInterval(pingInterval);
    }, [isConnected]);

    return {
        auctionData,
        bids,
        currentPrice,
        endTime,
        status,
        viewers,
        error,
        isConnected,
        totalExtensions
    };
}
