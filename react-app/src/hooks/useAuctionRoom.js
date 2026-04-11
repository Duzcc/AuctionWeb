import { useState, useEffect, useCallback, useRef } from 'react';
import { getSocket } from '../services/socketService';

/**
 * useAuctionRoom — Hook duy nhất quản lý toàn bộ real-time state của phòng đấu giá.
 *
 * Thay thế việc dùng song song useAuction + useRoomSocket (dual socket connection).
 * Tất cả events đi qua một socket connection từ socketService (singleton pattern).
 *
 * @param {String} sessionPlateId - ID của SessionPlate cần tham gia
 * @returns {Object} State và actions của phòng đấu giá
 */
export function useAuctionRoom(sessionPlateId) {
    // ─── Auction State ───────────────────────────────────────
    const [auctionData, setAuctionData] = useState(null);      // Thông tin SessionPlate
    const [currentPrice, setCurrentPrice] = useState(0);
    const [endTime, setEndTime] = useState(null);
    const [status, setStatus] = useState('loading');           // loading | active | ended | error
    const [viewers, setViewers] = useState(0);
    const [totalExtensions, setTotalExtensions] = useState(0);
    const [winner, setWinner] = useState(null);                // { userId, userName, finalPrice }

    // ─── Bid History State ───────────────────────────────────
    const [bids, setBids] = useState([]);
    const [latestBid, setLatestBid] = useState(null);          // Bid mới nhất để trigger animation
    const [newBidFlash, setNewBidFlash] = useState(false);     // Flag để trigger price flip animation

    // ─── Chat State ──────────────────────────────────────────
    const [messages, setMessages] = useState([]);
    const [typingUsers, setTypingUsers] = useState([]);
    const typingTimeoutRef = useRef({});

    // ─── Participants State ───────────────────────────────────
    const [participants, setParticipants] = useState([]);

    // ─── Connection State ─────────────────────────────────────
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState(null);
    const [reconnectCount, setReconnectCount] = useState(0);

    // ─── Bidding State ────────────────────────────────────────
    const [isPlacingBid, setIsPlacingBid] = useState(false);
    const [bidError, setBidError] = useState(null);
    const [rateLimitRemaining, setRateLimitRemaining] = useState(0); // giây còn lại cooldown

    const socketRef = useRef(null);
    const rateLimitTimerRef = useRef(null);

    // ────────────────────────────────────────────────────────────────────
    //  SETUP SOCKET EVENTS
    // ────────────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!sessionPlateId) return;

        const socket = getSocket();
        if (!socket) {
            setError('Không thể kết nối socket. Vui lòng đăng nhập lại.');
            setStatus('error');
            return;
        }
        socketRef.current = socket;

        // ── Connection handlers ──────────────────────────────
        const onConnect = () => {
            setIsConnected(true);
            setError(null);
            // Tự động join lại phòng khi reconnect
            socket.emit('join_auction', { sessionPlateId });
            // Yêu cầu sync state
            socket.emit('request_auction_state', { sessionPlateId });
            socket.emit('get_chat_history', { sessionPlateId, limit: 50 });
            socket.emit('get_participants', { sessionPlateId });
        };

        const onDisconnect = (reason) => {
            setIsConnected(false);
            if (reason === 'io server disconnect') {
                // Server ngắt chủ động → kết nối lại thủ công
                socket.connect();
            }
        };

        const onConnectError = (err) => {
            setIsConnected(false);
            setReconnectCount(c => c + 1);
            setError(`Mất kết nối: ${err.message}. Đang thử kết nối lại...`);
        };

        // ── Auction events ────────────────────────────────────
        const onAuctionJoined = (data) => {
            const sp = data.sessionPlate;
            setAuctionData(sp);
            setCurrentPrice(sp.currentPrice || 0);
            // Guard: new Date(undefined) → Invalid Date → NaN timer
            setEndTime(sp.auctionEndTime ? new Date(sp.auctionEndTime) : null);
            setTotalExtensions(sp.totalExtensions || 0);
            // Normalise status: backend dùng 'bidding', hook dùng 'active'
            const normStatus = sp.status === 'bidding' ? 'active'
                : sp.status === 'ended' ? 'ended'
                : sp.status === 'upcoming' ? 'upcoming'
                : sp.status || 'loading';
            setStatus(normStatus);
            setBids(data.recentBids || []);
            setViewers(data.currentViewers || 1);
            setError(null);
        };

        const onAuctionState = (data) => {
            const sp = data.sessionPlate;
            setCurrentPrice(sp.currentPrice || 0);
            setEndTime(sp.auctionEndTime ? new Date(sp.auctionEndTime) : null);
            setTotalExtensions(sp.totalExtensions || 0);
            const normStatus = sp.status === 'bidding' ? 'active'
                : sp.status === 'ended' ? 'ended'
                : sp.status === 'upcoming' ? 'upcoming'
                : sp.status || 'loading';
            setStatus(normStatus);
            if (data.recentBids?.length) setBids(data.recentBids);
        };

        const onNewBid = (data) => {
            // Thêm bid mới vào đầu danh sách (giữ tối đa 50)
            setBids(prev => [data, ...prev].slice(0, 50));
            setCurrentPrice(data.bidAmount);
            setLatestBid(data);

            // Trigger flash animation ngắn (300ms)
            setNewBidFlash(true);
            setTimeout(() => setNewBidFlash(false), 600);
        };

        const onTimeExtended = (data) => {
            setEndTime(new Date(data.newEndTime));
            setTotalExtensions(data.totalExtensions);
        };

        const onAuctionEnded = (data) => {
            setStatus('ended');
            if (data.winnerId) {
                setWinner({
                    userId: data.winnerId,
                    userName: data.winnerName,
                    finalPrice: data.finalPrice,
                });
            }
            setAuctionData(prev => prev ? ({
                ...prev,
                status: data.status,
                winnerId: data.winnerId,
                winnerName: data.winnerName,
                finalPrice: data.finalPrice,
            }) : prev);
        };

        const onUserJoined = (data) => setViewers(data.totalViewers);
        const onUserLeft = (data) => setViewers(data.totalViewers);

        // ── Bid response events ───────────────────────────────
        const onBidConfirmed = (data) => {
            setIsPlacingBid(false);
            setBidError(null);
        };

        const onBidError = (data) => {
            setIsPlacingBid(false);
            setBidError(data.message || 'Đặt giá thất bại');

            if (data.code === 'RATE_LIMITED' && data.retryAfter) {
                setRateLimitRemaining(data.retryAfter);
                if (rateLimitTimerRef.current) clearInterval(rateLimitTimerRef.current);
                rateLimitTimerRef.current = setInterval(() => {
                    setRateLimitRemaining(prev => {
                        if (prev <= 1) {
                            clearInterval(rateLimitTimerRef.current);
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);
            }
        };

        // ── Chat events ───────────────────────────────────────
        const onNewChatMessage = (data) => {
            setMessages(prev => [...prev, data]);
        };

        const onChatHistory = (data) => {
            setMessages(data.messages || []);
        };

        const onUserTyping = ({ userId, userName, isTyping }) => {
            if (isTyping) {
                setTypingUsers(prev => {
                    if (prev.find(u => u.userId === userId)) return prev;
                    return [...prev, { userId, userName }];
                });
                if (typingTimeoutRef.current[userId]) clearTimeout(typingTimeoutRef.current[userId]);
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

        // ── Participants events ───────────────────────────────
        const onParticipantsList = (data) => {
            setParticipants(data.participants || []);
        };

        const onSocketError = (data) => {
            console.error('Socket error:', data);
            setError(data.message || 'Lỗi kết nối');
        };

        // ── Register all listeners ────────────────────────────
        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('connect_error', onConnectError);
        socket.on('auction_joined', onAuctionJoined);
        socket.on('auction_state', onAuctionState);
        socket.on('new_bid', onNewBid);
        socket.on('time_extended', onTimeExtended);
        socket.on('auction_ended', onAuctionEnded);
        socket.on('user_joined', onUserJoined);
        socket.on('user_left', onUserLeft);
        socket.on('bid_confirmed', onBidConfirmed);
        socket.on('bid_error', onBidError);
        socket.on('new_chat_message', onNewChatMessage);
        socket.on('chat_history', onChatHistory);
        socket.on('user_typing', onUserTyping);
        socket.on('participants_list', onParticipantsList);
        socket.on('error', onSocketError);

        // Join ngay nếu đã kết nối
        if (socket.connected) {
            onConnect();
        }

        // Cleanup
        return () => {
            socket.emit('leave_auction', { sessionPlateId });
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('connect_error', onConnectError);
            socket.off('auction_joined', onAuctionJoined);
            socket.off('auction_state', onAuctionState);
            socket.off('new_bid', onNewBid);
            socket.off('time_extended', onTimeExtended);
            socket.off('auction_ended', onAuctionEnded);
            socket.off('user_joined', onUserJoined);
            socket.off('user_left', onUserLeft);
            socket.off('bid_confirmed', onBidConfirmed);
            socket.off('bid_error', onBidError);
            socket.off('new_chat_message', onNewChatMessage);
            socket.off('chat_history', onChatHistory);
            socket.off('user_typing', onUserTyping);
            socket.off('participants_list', onParticipantsList);
            socket.off('error', onSocketError);

            // Clear typing timeouts
            Object.values(typingTimeoutRef.current).forEach(clearTimeout);
            if (rateLimitTimerRef.current) clearInterval(rateLimitTimerRef.current);
        };
    }, [sessionPlateId]);

    // ────────────────────────────────────────────────────────────────────
    //  ACTIONS
    // ────────────────────────────────────────────────────────────────────

    /**
     * Đặt giá qua Socket (latency thấp hơn HTTP)
     * @param {Number} bidAmount - Số tiền bid
     */
    const placeBid = useCallback((bidAmount) => {
        if (!socketRef.current || !isConnected) {
            setBidError('Mất kết nối. Vui lòng thử lại.');
            return false;
        }
        if (isPlacingBid) {
            setBidError('Vui lòng chờ lượt bid trước hoàn thành');
            return false;
        }
        if (rateLimitRemaining > 0) {
            setBidError(`Vui lòng chờ ${rateLimitRemaining} giây`);
            return false;
        }

        setIsPlacingBid(true);
        setBidError(null);
        socketRef.current.emit('place_bid', { sessionPlateId, bidAmount });
        return true;
    }, [sessionPlateId, isConnected, isPlacingBid, rateLimitRemaining]);

    /**
     * Gửi tin nhắn chat
     */
    const sendMessage = useCallback((message) => {
        if (!socketRef.current || !isConnected) return false;
        socketRef.current.emit('send_chat_message', { sessionPlateId, message });
        return true;
    }, [sessionPlateId, isConnected]);

    /**
     * Gửi typing indicator
     */
    const sendTyping = useCallback((isTyping) => {
        if (!socketRef.current || !isConnected) return;
        socketRef.current.emit('typing_indicator', { sessionPlateId, isTyping });
    }, [sessionPlateId, isConnected]);

    /**
     * Refresh danh sách participants
     */
    const refreshParticipants = useCallback(() => {
        if (!socketRef.current || !isConnected) return;
        socketRef.current.emit('get_participants', { sessionPlateId });
    }, [sessionPlateId, isConnected]);

    // ────────────────────────────────────────────────────────────────────
    //  DERIVED VALUES
    // ────────────────────────────────────────────────────────────────────
    const priceStep = auctionData?.priceStep || 0;
    const minimumNextBid = currentPrice + priceStep;
    const canBid = isConnected && status === 'active' && !isPlacingBid && rateLimitRemaining === 0;

    return {
        // Auction state
        auctionData,
        currentPrice,
        endTime,
        status,
        viewers,
        totalExtensions,
        winner,
        priceStep,
        minimumNextBid,

        // Bid history
        bids,
        latestBid,
        newBidFlash,        // boolean: true khi vừa có bid mới → trigger animation

        // Chat
        messages,
        typingUsers,

        // Participants
        participants,

        // Connection
        isConnected,
        error,
        reconnectCount,

        // Bidding
        isPlacingBid,
        bidError,
        rateLimitRemaining,
        canBid,

        // Actions
        placeBid,
        sendMessage,
        sendTyping,
        refreshParticipants,
    };
}

export default useAuctionRoom;
