import { Server } from 'socket.io';
import { verifyToken } from '../utils/jwt.js';
import Registration from '../models/Registration.model.js';
import SessionPlate from '../models/SessionPlate.model.js';
import Bid from '../models/Bid.model.js';
import Session from '../models/Session.model.js';

let io;

/**
 * Initialize Socket.io server
 * @param {Object} httpServer - HTTP server instance
 */
export const initializeSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:5173',
            methods: ['GET', 'POST'],
            credentials: true,
        },
        pingTimeout: 60000,
        pingInterval: 25000,
    });

    // Middleware: Authenticate socket connections
    io.use((socket, next) => {
        try {
            const token = socket.handshake.auth.token;

            if (!token) {
                return next(new Error('Authentication token required'));
            }

            const decoded = verifyToken(token);
            socket.user = decoded;
            next();
        } catch (error) {
            next(new Error('Invalid authentication token'));
        }
    });

    // Connection handler
    io.on('connection', (socket) => {
        const userId = socket.user.id;
        const username = socket.user.username;

        console.log(`✅ User connected: ${username} (${userId})`);

        // Join user-specific room
        socket.join(`user:${userId}`);

        // Send welcome message
        socket.emit('notification', {
            type: 'login_success',
            message: `Chào mừng ${username}! Bạn đã đăng nhập thành công.`,
            timestamp: new Date(),
        });

        // JOIN AUCTION ROOM - for specific SessionPlate
        socket.on('join_auction', async (data) => {
            try {
                console.log('📥 join_auction request:', data);
                console.log('User from socket:', socket.user);

                // Support both sessionId and sessionPlateId
                const requestedSessionId = data.sessionId || data.sessionPlateId; // Renamed to avoid conflict with session.sessionId

                if (!requestedSessionId) {
                    console.error('❌ Missing sessionId/sessionPlateId in join_auction data');
                    return socket.emit('error', { message: 'Session ID is required' });
                }

                // Find the session
                const session = await Session.findById(requestedSessionId);
                if (!session) {
                    console.error('❌ Session not found:', requestedSessionId);
                    console.error('Available sessions count:', await Session.countDocuments());
                    return socket.emit('error', { message: 'Auction not found' });
                }

                console.log('✅ Session found:', session.sessionName);

                // Check access: Must have APPROVED registration
                const registration = await Registration.findOne({
                    userId: userId,
                    sessionId: session._id, // Use the found session's ID
                    status: 'approved',
                    depositStatus: 'paid'
                });
                console.log('✅ Registration found:', registration);
                console.log('User is allowed to join auction.');
                console.log('User ID:', userId);
                console.log('Session ID:', session._id);

                if (!registration) {
                    socket.emit('error', {
                        message: 'You must be registered and approved to join this auction'
                    });
                    return;
                }

                // Join auction room
                const roomName = `auction:${sessionPlateId}`;
                socket.join(roomName);
                socket.currentAuction = sessionPlateId;

                // Get current state
                const now = new Date();
                const timeLeft = Math.max(0, sessionPlate.auctionEndTime - now);
                const viewers = io.sockets.adapter.rooms.get(roomName)?.size || 1;

                // Get recent bids
                const recentBids = await Bid.find({ sessionPlateId })
                    .sort({ bidTime: -1 })
                    .limit(10)
                    .populate('userId', 'username avatar');

                console.log(`User ${username} joined auction room: ${sessionPlateId}`);

                socket.emit('auction_joined', {
                    message: 'Joined auction room successfully',
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
                        maxExtensions: sessionPlate.maxExtensions
                    },
                    recentBids,
                    currentViewers: viewers
                });

                // Notify others
                socket.to(roomName).emit('user_joined', {
                    totalViewers: viewers
                });

            } catch (error) {
                console.error('Join auction error:', error);
                socket.emit('error', { message: 'Error joining auction room' });
            }
        });

        // LEAVE AUCTION ROOM
        socket.on('leave_auction', (data) => {
            const { sessionPlateId } = data;
            if (!sessionPlateId) return;

            const roomName = `auction:${sessionPlateId}`;
            socket.leave(roomName);

            const viewers = io.sockets.adapter.rooms.get(roomName)?.size || 0;
            socket.to(roomName).emit('user_left', {
                totalViewers: viewers
            });

            console.log(`User ${username} left auction ${sessionPlateId}`);
        });

        // SEND CHAT MESSAGE
        socket.on('send_chat_message', async (data) => {
            try {
                const { sessionPlateId, message } = data;

                if (!message || !message.trim()) {
                    return socket.emit('error', { message: 'Message cannot be empty' });
                }

                if (message.length > 500) {
                    return socket.emit('error', { message: 'Message too long (max 500 characters)' });
                }

                // Get session plate to find roomId and sessionId
                const sessionPlate = await SessionPlate.findById(sessionPlateId).populate('sessionId');
                if (!sessionPlate) {
                    return socket.emit('error', { message: 'Auction not found' });
                }

                // Import ChatMessage model
                const ChatMessage = (await import('../models/ChatMessage.model.js')).default;

                // Create chat message
                const chatMessage = await ChatMessage.create({
                    roomId: sessionPlate.sessionId.roomId,
                    sessionId: sessionPlate.sessionId._id,
                    userId: userId,
                    userName: username,
                    userAvatar: socket.user.avatar || '',
                    message: message.trim(),
                    messageType: 'text',
                });

                // Broadcast to room
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

                console.log(`Chat message from ${username} in auction ${sessionPlateId}`);
            } catch (error) {
                console.error('Send chat message error:', error);
                socket.emit('error', { message: 'Error sending message' });
            }
        });

        // TYPING INDICATOR
        socket.on('typing_indicator', (data) => {
            const { sessionPlateId, isTyping } = data;
            if (!sessionPlateId) return;

            const roomName = `auction:${sessionPlateId}`;
            socket.to(roomName).emit('user_typing', {
                userId: userId,
                userName: username,
                isTyping,
            });
        });

        // GET PARTICIPANTS LIST
        socket.on('get_participants', async (data) => {
            try {
                const { sessionPlateId } = data;
                const roomName = `auction:${sessionPlateId}`;

                // Get all socket IDs in the room
                const socketsInRoom = io.sockets.adapter.rooms.get(roomName);
                const participants = [];

                if (socketsInRoom) {
                    for (const socketId of socketsInRoom) {
                        const participantSocket = io.sockets.sockets.get(socketId);
                        if (participantSocket && participantSocket.user) {
                            participants.push({
                                userId: participantSocket.user.id,
                                userName: participantSocket.user.username,
                                userAvatar: participantSocket.user.avatar || '',
                            });
                        }
                    }
                }

                socket.emit('participants_list', {
                    participants,
                    totalCount: participants.length,
                });
            } catch (error) {
                console.error('Get participants error:', error);
                socket.emit('error', { message: 'Error fetching participants' });
            }
        });

        // GET CHAT HISTORY
        socket.on('get_chat_history', async (data) => {
            try {
                const { sessionPlateId, limit = 50 } = data;

                const sessionPlate = await SessionPlate.findById(sessionPlateId);
                if (!sessionPlate) {
                    return socket.emit('error', { message: 'Auction not found' });
                }

                const ChatMessage = (await import('../models/ChatMessage.model.js')).default;

                const messages = await ChatMessage.getRecentMessages(
                    sessionPlate.sessionId,
                    limit
                );

                socket.emit('chat_history', {
                    messages: messages.reverse(), // Oldest first
                });
            } catch (error) {
                console.error('Get chat history error:', error);
                socket.emit('error', { message: 'Error fetching chat history' });
            }
        });

        // REQUEST CURRENT AUCTION STATE
        socket.on('request_auction_state', async (data) => {
            try {
                const { sessionPlateId } = data;
                const sessionPlate = await SessionPlate.findById(sessionPlateId);

                if (!sessionPlate) {
                    return socket.emit('error', { message: 'Auction not found' });
                }

                const now = new Date();
                const recentBids = await Bid.find({ sessionPlateId })
                    .sort({ bidTime: -1 })
                    .limit(10)
                    .populate('userId', 'username avatar');

                socket.emit('auction_state', {
                    sessionPlate: {
                        currentPrice: sessionPlate.currentPrice,
                        status: sessionPlate.status,
                        timeLeft: Math.max(0, sessionPlate.auctionEndTime - now),
                        totalExtensions: sessionPlate.totalExtensions
                    },
                    recentBids
                });
            } catch (error) {
                console.error('Request auction state error:', error);
                socket.emit('error', { message: 'Error fetching auction state' });
            }
        });

        // HEARTBEAT/PING
        socket.on('ping', () => {
            socket.emit('pong', { timestamp: new Date() });
        });

        // Handle custom events
        socket.on('request_notification', (data) => {
            socket.emit('notification', {
                type: 'info',
                message: data.message || 'Notification received',
                timestamp: new Date(),
            });
        });

        // Disconnect handler
        socket.on('disconnect', () => {
            if (socket.currentAuction) {
                const roomName = `auction:${socket.currentAuction}`;
                const viewers = io.sockets.adapter.rooms.get(roomName)?.size || 0;
                socket.to(roomName).emit('user_left', {
                    totalViewers: viewers
                });
            }
            console.log(`👋 User disconnected: ${username} (${userId})`);
        });
    });

    console.log('✅ Socket.io initialized');
    return io;
};

/**
 * Get Socket.io instance
 * @returns {Object} Socket.io server instance
 */
export const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
};

/**
 * Emit login notification to specific user
 * @param {String} userId - User ID
 * @param {Object} data - Notification data
 */
export const emitLoginNotification = (userId, data) => {
    try {
        const io = getIO();
        io.to(`user:${userId}`).emit('login_notification', {
            type: 'login',
            message: 'Đăng nhập mới phát hiện',
            ...data,
            timestamp: new Date(),
        });
    } catch (error) {
        console.error('Error emitting login notification:', error);
    }
};

/**
 * Emit device alert to specific user
 * @param {String} userId - User ID
 * @param {Object} deviceInfo - Device information
 */
export const emitDeviceAlert = (userId, deviceInfo) => {
    try {
        const io = getIO();
        io.to(`user:${userId}`).emit('device_alert', {
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
 * Broadcast notification to all connected users
 * @param {Object} data - Notification data
 */
export const broadcastNotification = (data) => {
    try {
        const io = getIO();
        io.emit('broadcast_notification', {
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
