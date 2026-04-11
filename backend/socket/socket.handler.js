import { Server } from 'socket.io';
import { verifyToken } from '../utils/jwt.js';
import Registration from '../models/Registration.model.js';
import SessionPlate from '../models/SessionPlate.model.js';
import Bid from '../models/Bid.model.js';
import Session from '../models/Session.model.js';
import biddingService from '../services/bidding.service.js';

let io;

/**
 * Map lưu thời gian bid gần nhất của mỗi user để socket-level rate limiting
 * Format: Map<userId, timestamp_ms>
 */
const bidRateLimits = new Map();
const BID_COOLDOWN_MS = 2000; // 2 giây giữa các lượt bid

/**
 * Dọn dẹp rate limit map định kỳ để tránh memory leak (mỗi 5 phút)
 */
setInterval(() => {
    const cutoff = Date.now() - 60000;
    for (const [key, ts] of bidRateLimits.entries()) {
        if (ts < cutoff) bidRateLimits.delete(key);
    }
}, 5 * 60 * 1000);

/**
 * Khởi tạo Socket.io server
 * @param {Object} httpServer - HTTP server instance
 */
export const initializeSocket = (httpServer) => {
    const allowedOrigins = [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
        'http://localhost:5176',
        process.env.FRONTEND_URL
    ].filter(Boolean);

    io = new Server(httpServer, {
        cors: {
            origin: allowedOrigins,
            methods: ['GET', 'POST'],
            credentials: true,
        },
        pingTimeout: 60000,
        pingInterval: 25000,
        // Tăng buffer để handle concurrent events tốt hơn
        maxHttpBufferSize: 1e6,
    });

    // Middleware: Xác thực kết nối socket
    io.use((socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) return next(new Error('Authentication token required'));

            const decoded = verifyToken(token);
            socket.user = decoded;
            next();
        } catch (error) {
            next(new Error('Invalid authentication token'));
        }
    });

    // =========================================================
    //  Connection Handler
    // =========================================================
    // Helper: đếm số user duy nhất trong phòng (tránh đếm trùng multi-tab)
    const getUniqueViewers = (roomName) => {
        const socketsInRoom = io.sockets.adapter.rooms.get(roomName);
        if (!socketsInRoom) return 0;
        const userIds = new Set();
        for (const sid of socketsInRoom) {
            const s = io.sockets.sockets.get(sid);
            if (s?.user?.id) userIds.add(s.user.id);
        }
        return userIds.size;
    };

    io.on('connection', (socket) => {
        const userId = socket.user.id;
        const username = socket.user.username;

        console.log(`✅ User connected: ${username} (${userId}) | socketId: ${socket.id}`);

        // Join user-specific room để nhận thông báo cá nhân
        socket.join(`user:${userId}`);

        socket.emit('notification', {
            type: 'login_success',
            message: `Chào mừng ${username}!`,
            timestamp: new Date(),
        });

        // =====================================================
        // JOIN AUCTION ROOM
        // =====================================================
        socket.on('join_auction', async (data) => {
            try {
                const { sessionPlateId } = data;

                if (!sessionPlateId) {
                    return socket.emit('error', { message: 'SessionPlate ID là bắt buộc' });
                }

                // Tìm SessionPlate
                const sessionPlate = await SessionPlate.findById(sessionPlateId);
                if (!sessionPlate) {
                    return socket.emit('error', { message: 'Không tìm thấy phiên đấu giá' });
                }

                // Tìm Session cha
                const session = await Session.findById(sessionPlate.sessionId);
                if (!session) {
                    return socket.emit('error', { message: 'Không tìm thấy phòng đấu giá' });
                }

                // Kiểm tra quyền tham gia: Admin hoặc user đã được duyệt đăng ký
                const isAdmin = socket.user.role === 'admin';
                if (!isAdmin) {
                    const registration = await Registration.findOne({
                        userId,
                        sessionId: session._id,
                        status: { $in: ['approved', 'won_paid'] }
                    });

                    if (!registration) {
                        return socket.emit('error', {
                            message: 'Bạn chưa đăng ký hoặc chưa được duyệt tham gia phiên đấu giá này'
                        });
                    }
                }

                // Join room theo sessionPlateId
                const roomName = `auction:${sessionPlateId}`;
                socket.join(roomName);
                socket.currentAuction = sessionPlateId;

                // Lấy dữ liệu hiện tại
                const now = new Date();
                const timeLeft = sessionPlate.auctionEndTime
                    ? Math.max(0, new Date(sessionPlate.auctionEndTime) - now)
                    : 0;
                const viewers = getUniqueViewers(roomName);

                // Lấy lịch sử bid gần nhất
                const recentBids = await Bid.find({ sessionPlateId })
                    .sort({ bidTime: -1 })
                    .limit(20)
                    .populate('userId', 'username avatar')
                    .lean();

                console.log(`✅ ${username} joined auction room: ${sessionPlateId}`);

                // Gửi state hiện tại cho user mới join
                socket.emit('auction_joined', {
                    message: 'Đã vào phòng đấu giá thành công',
                    sessionPlate: {
                        _id: sessionPlate._id,
                        plateNumber: sessionPlate.plateNumber,
                        currentPrice: sessionPlate.currentPrice,
                        startingPrice: sessionPlate.startingPrice,
                        priceStep: sessionPlate.priceStep,
                        status: sessionPlate.status,
                        auctionStartTime: sessionPlate.auctionStartTime,
                        auctionEndTime: sessionPlate.auctionEndTime,
                        timeLeft,
                        totalExtensions: sessionPlate.totalExtensions,
                        maxExtensions: sessionPlate.maxExtensions,
                        bidExtensionSeconds: sessionPlate.bidExtensionSeconds,
                    },
                    recentBids,
                    currentViewers: viewers,
                });

                // Thông báo cho các user khác trong phòng
                socket.to(roomName).emit('user_joined', { totalViewers: getUniqueViewers(roomName) });

            } catch (error) {
                console.error('join_auction error:', error);
                socket.emit('error', { message: 'Lỗi khi vào phòng đấu giá' });
            }
        });

        // =====================================================
        // PLACE BID QUA SOCKET (thay vì chỉ HTTP)
        // Giúp giảm latency đáng kể so với REST API call
        // =====================================================
        socket.on('place_bid', async (data) => {
            const { sessionPlateId, bidAmount } = data;

            // --- Rate Limiting tại socket level ---
            const rateLimitKey = `bid:${userId}`;
            const lastBidTime = bidRateLimits.get(rateLimitKey) || 0;
            const now = Date.now();
            const timeSinceLast = now - lastBidTime;

            if (timeSinceLast < BID_COOLDOWN_MS) {
                const retryAfter = Math.ceil((BID_COOLDOWN_MS - timeSinceLast) / 1000);
                return socket.emit('bid_error', {
                    message: `Vui lòng chờ ${retryAfter} giây trước khi đặt giá tiếp`,
                    retryAfter,
                    code: 'RATE_LIMITED'
                });
            }

            // Validate input cơ bản
            if (!sessionPlateId || typeof bidAmount !== 'number' || bidAmount <= 0) {
                return socket.emit('bid_error', {
                    message: 'Dữ liệu đặt giá không hợp lệ',
                    code: 'INVALID_DATA'
                });
            }

            // Cập nhật rate limit TRƯỚC khi xử lý (pessimistic)
            bidRateLimits.set(rateLimitKey, now);

            try {
                const ipAddress = socket.handshake.address;
                const result = await biddingService.placeBid(
                    sessionPlateId,
                    userId,
                    username,
                    bidAmount,
                    ipAddress
                );

                // Xác nhận thành công cho người đặt
                socket.emit('bid_confirmed', {
                    success: true,
                    bidAmount: result.currentPrice,
                    timeExtended: result.timeExtended,
                    newEndTime: result.newEndTime,
                    message: result.message,
                });

                // Broadcast new_bid tới cả phòng đã được handle trong biddingService.emitBidEvents()

            } catch (error) {
                // Nếu thất bại → reset rate limit để user thử lại ngay
                bidRateLimits.set(rateLimitKey, 0);
                console.error(`❌ place_bid error (${username}):`, error.message);

                socket.emit('bid_error', {
                    message: error.message || 'Đặt giá thất bại',
                    code: 'BID_FAILED'
                });
            }
        });

        // =====================================================
        // LEAVE AUCTION ROOM
        // =====================================================
        socket.on('leave_auction', (data) => {
            const { sessionPlateId } = data;
            if (!sessionPlateId) return;

            const roomName = `auction:${sessionPlateId}`;
            socket.leave(roomName);
            socket.currentAuction = null;

            const viewers = getUniqueViewers(roomName);
            socket.to(roomName).emit('user_left', { totalViewers: viewers });

            console.log(`👋 ${username} left auction ${sessionPlateId}`);
        });

        // =====================================================
        // CHAT MESSAGE
        // =====================================================
        socket.on('send_chat_message', async (data) => {
            try {
                const { sessionPlateId, message } = data;

                if (!message?.trim()) {
                    return socket.emit('error', { message: 'Tin nhắn không được trống' });
                }
                if (message.length > 500) {
                    return socket.emit('error', { message: 'Tin nhắn quá dài (tối đa 500 ký tự)' });
                }

                const sessionPlate = await SessionPlate.findById(sessionPlateId).populate('sessionId');
                if (!sessionPlate) {
                    return socket.emit('error', { message: 'Không tìm thấy phiên đấu giá' });
                }

                const ChatMessage = (await import('../models/ChatMessage.model.js')).default;
                const chatMessage = await ChatMessage.create({
                    roomId: sessionPlate.sessionId.roomId,
                    sessionId: sessionPlate.sessionId._id,
                    userId,
                    userName: username,
                    userAvatar: socket.user.avatar || '',
                    message: message.trim(),
                    messageType: 'text',
                });

                const roomName = `auction:${sessionPlateId}`;
                io.to(roomName).emit('new_chat_message', {
                    _id: chatMessage._id,
                    userId: chatMessage.userId,
                    userName: chatMessage.userName,
                    userAvatar: chatMessage.userAvatar,
                    message: chatMessage.message,
                    messageType: chatMessage.messageType,
                    createdAt: chatMessage.createdAt,
                });

            } catch (error) {
                console.error('send_chat_message error:', error);
                socket.emit('error', { message: 'Lỗi khi gửi tin nhắn' });
            }
        });

        // =====================================================
        // TYPING INDICATOR
        // =====================================================
        socket.on('typing_indicator', (data) => {
            const { sessionPlateId, isTyping } = data;
            if (!sessionPlateId) return;

            socket.to(`auction:${sessionPlateId}`).emit('user_typing', {
                userId,
                userName: username,
                isTyping,
            });
        });

        // =====================================================
        // GET PARTICIPANTS
        // =====================================================
        socket.on('get_participants', async (data) => {
            try {
                const { sessionPlateId } = data;
                const roomName = `auction:${sessionPlateId}`;
                const socketsInRoom = io.sockets.adapter.rooms.get(roomName);

                // Dùng Map để dedup theo userId (tránh cùng user nhiều tab)
                const participantMap = new Map();

                if (socketsInRoom) {
                    for (const socketId of socketsInRoom) {
                        const s = io.sockets.sockets.get(socketId);
                        if (s?.user && !participantMap.has(s.user.id)) {
                            participantMap.set(s.user.id, {
                                userId: s.user.id,
                                userName: s.user.username,
                                userAvatar: s.user.avatar || '',
                            });
                        }
                    }
                }

                const participants = Array.from(participantMap.values());

                socket.emit('participants_list', {
                    participants,
                    totalCount: participants.length,
                });
            } catch (error) {
                console.error('get_participants error:', error);
                socket.emit('error', { message: 'Lỗi lấy danh sách người tham gia' });
            }
        });

        // =====================================================
        // GET CHAT HISTORY
        // =====================================================
        socket.on('get_chat_history', async (data) => {
            try {
                const { sessionPlateId, limit = 50 } = data;

                const sessionPlate = await SessionPlate.findById(sessionPlateId);
                if (!sessionPlate) {
                    return socket.emit('error', { message: 'Không tìm thấy phiên đấu giá' });
                }

                const ChatMessage = (await import('../models/ChatMessage.model.js')).default;
                const messages = await ChatMessage.getRecentMessages(sessionPlate.sessionId, limit);

                socket.emit('chat_history', { messages: messages.reverse() });
            } catch (error) {
                console.error('get_chat_history error:', error);
                socket.emit('error', { message: 'Lỗi lấy lịch sử chat' });
            }
        });

        // =====================================================
        // REQUEST AUCTION STATE (sync lại khi reconnect)
        // =====================================================
        socket.on('request_auction_state', async (data) => {
            try {
                const { sessionPlateId } = data;
                const sessionPlate = await SessionPlate.findById(sessionPlateId);

                if (!sessionPlate) {
                    return socket.emit('error', { message: 'Không tìm thấy phiên đấu giá' });
                }

                const now = new Date();
                const recentBids = await Bid.find({ sessionPlateId })
                    .sort({ bidTime: -1 })
                    .limit(20)
                    .populate('userId', 'username avatar')
                    .lean();

                socket.emit('auction_state', {
                    sessionPlate: {
                        currentPrice: sessionPlate.currentPrice,
                        status: sessionPlate.status,
                        timeLeft: Math.max(0, sessionPlate.auctionEndTime - now),
                        auctionEndTime: sessionPlate.auctionEndTime,
                        totalExtensions: sessionPlate.totalExtensions,
                        winnerId: sessionPlate.winnerId,
                        winnerName: sessionPlate.winnerName,
                    },
                    recentBids
                });
            } catch (error) {
                console.error('request_auction_state error:', error);
                socket.emit('error', { message: 'Lỗi lấy trạng thái đấu giá' });
            }
        });

        // =====================================================
        // HEARTBEAT
        // =====================================================
        socket.on('ping', () => {
            socket.emit('pong', { timestamp: new Date() });
        });

        // =====================================================
        // DISCONNECT
        // =====================================================
        socket.on('disconnect', (reason) => {
            if (socket.currentAuction) {
                const roomName = `auction:${socket.currentAuction}`;
                // socket đã rời room trước khi disconnect event fire -> dùng getUniqueViewers
                const viewers = getUniqueViewers(roomName);
                socket.to(roomName).emit('user_left', { totalViewers: viewers });
            }
            // Dọn rate limit entry khi user ngắt kết nối
            bidRateLimits.delete(`bid:${userId}`);
            console.log(`👋 User disconnected: ${username} (${userId}) | reason: ${reason}`);
        });
    });

    console.log('✅ Socket.io initialized with place_bid handler & rate limiting');
    return io;
};

/**
 * Lấy Socket.io instance
 */
export const getIO = () => {
    if (!io) throw new Error('Socket.io chưa được khởi tạo');
    return io;
};

/**
 * Gửi thông báo đăng nhập tới user cụ thể
 */
export const emitLoginNotification = (userId, data) => {
    try {
        getIO().to(`user:${userId}`).emit('login_notification', {
            type: 'login',
            message: 'Phát hiện đăng nhập mới',
            ...data,
            timestamp: new Date(),
        });
    } catch (error) {
        console.error('Error emitting login notification:', error);
    }
};

/**
 * Gửi cảnh báo thiết bị mới tới user
 */
export const emitDeviceAlert = (userId, deviceInfo) => {
    try {
        getIO().to(`user:${userId}`).emit('device_alert', {
            type: 'security',
            message: 'Cảnh báo: Đăng nhập từ thiết bị mới',
            device: deviceInfo,
            timestamp: new Date(),
        });
    } catch (error) {
        console.error('Error emitting device alert:', error);
    }
};

/**
 * Broadcast thông báo toàn hệ thống
 */
export const broadcastNotification = (data) => {
    try {
        getIO().emit('broadcast_notification', {
            ...data,
            timestamp: new Date(),
        });
    } catch (error) {
        console.error('Error broadcasting notification:', error);
    }
};

export default {
    initializeSocket,
    getIO,
    emitLoginNotification,
    emitDeviceAlert,
    broadcastNotification,
};
