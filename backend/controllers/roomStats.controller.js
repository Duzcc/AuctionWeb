import Room from '../models/Room.model.js';
import Session from '../models/Session.model.js';
import Registration from '../models/Registration.model.js';
import SessionPlate from '../models/SessionPlate.model.js';
import Bid from '../models/Bid.model.js';
import AuctionLog from '../models/AuctionLog.model.js';
import { getIO } from '../socket/socket.handler.js';

/**
 * @route   GET /api/rooms/:id/stats
 * @desc    Get detailed statistics for a room
 * @access  Public
 */
export const getRoomStats = async (req, res) => {
    try {
        const { id } = req.params;

        const room = await Room.findById(id);
        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy phòng đấu giá',
            });
        }

        // Get all sessions in this room
        const sessions = await Session.find({ roomId: id });
        const sessionIds = sessions.map(s => s._id);

        // Get statistics
        const totalSessions = sessions.length;
        const completedSessions = sessions.filter(s => s.status === 'completed').length;
        const ongoingSessions = sessions.filter(s => s.status === 'ongoing').length;

        // Get total registrations
        const totalRegistrations = await Registration.countDocuments({
            sessionId: { $in: sessionIds },
        });

        const approvedRegistrations = await Registration.countDocuments({
            sessionId: { $in: sessionIds },
            status: 'approved',
        });

        // Get total revenue (from sold items)
        const soldPlates = await SessionPlate.find({
            sessionId: { $in: sessionIds },
            status: 'sold',
        });

        const totalRevenue = soldPlates.reduce((sum, plate) => sum + (plate.finalPrice || 0), 0);

        // Get total bids
        const sessionPlateIds = (await SessionPlate.find({
            sessionId: { $in: sessionIds }
        })).map(sp => sp._id);

        const totalBids = await Bid.countDocuments({
            sessionPlateId: { $in: sessionPlateIds },
        });

        // Get average bids per session
        const averageBidsPerSession = totalSessions > 0
            ? Math.round(totalBids / totalSessions)
            : 0;

        // Get recent activity logs
        const recentActivity = await AuctionLog.find({
            sessionPlateId: { $in: sessionPlateIds },
        })
            .sort({ createdAt: -1 })
            .limit(20)
            .populate('userId', 'username avatar');

        // Update room statistics if needed
        if (room.statistics.totalSessions !== totalSessions) {
            room.statistics.totalSessions = totalSessions;
            room.statistics.totalParticipants = approvedRegistrations;
            room.statistics.totalRevenue = totalRevenue;
            room.statistics.averageBidsPerSession = averageBidsPerSession;
            await room.save();
        }

        res.status(200).json({
            success: true,
            data: {
                room: {
                    _id: room._id,
                    roomName: room.roomName,
                    location: room.location,
                },
                statistics: {
                    totalSessions,
                    completedSessions,
                    ongoingSessions,
                    totalRegistrations,
                    approvedRegistrations,
                    totalRevenue,
                    totalBids,
                    averageBidsPerSession,
                },
                recentActivity,
            },
        });
    } catch (error) {
        console.error('Error fetching room stats:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy thống kê phòng',
            error: error.message,
        });
    }
};

/**
 * @route   GET /api/rooms/:id/participants
 * @desc    Get current participants in room (live)
 * @access  Public
 */
export const getRoomParticipants = async (req, res) => {
    try {
        const { id } = req.params;

        const room = await Room.findById(id);
        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy phòng đấu giá',
            });
        }

        // Get active sessions in this room
        const activeSessions = await Session.find({
            roomId: id,
            status: { $in: ['ongoing', 'registration_open'] },
        });

        const participants = [];

        // Get socket.io participants from active auction rooms
        try {
            const io = getIO();

            for (const session of activeSessions) {
                const sessionPlates = await SessionPlate.find({ sessionId: session._id });

                for (const plate of sessionPlates) {
                    const roomName = `auction:${plate._id}`;
                    const room = io.sockets.adapter.rooms.get(roomName);

                    if (room) {
                        participants.push({
                            sessionId: session._id,
                            sessionName: session.sessionName,
                            plateId: plate._id,
                            plateNumber: plate.plateNumber,
                            viewerCount: room.size,
                        });
                    }
                }
            }
        } catch (error) {
            console.error('Error getting socket participants:', error);
        }

        res.status(200).json({
            success: true,
            data: {
                room: {
                    _id: room._id,
                    roomName: room.roomName,
                },
                participants,
                totalViewers: participants.reduce((sum, p) => sum + p.viewerCount, 0),
            },
        });
    } catch (error) {
        console.error('Error fetching room participants:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách người tham gia',
            error: error.message,
        });
    }
};

/**
 * @route   GET /api/rooms/:id/activity-log
 * @desc    Get activity log for a room
 * @access  Public
 */
export const getRoomActivityLog = async (req, res) => {
    try {
        const { id } = req.params;
        const { page = 1, limit = 50, eventType } = req.query;

        const room = await Room.findById(id);
        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy phòng đấu giá',
            });
        }

        // Get all sessions in this room
        const sessions = await Session.find({ roomId: id });
        const sessionIds = sessions.map(s => s._id);

        // Get session plates
        const sessionPlates = await SessionPlate.find({
            sessionId: { $in: sessionIds },
        });
        const sessionPlateIds = sessionPlates.map(sp => sp._id);

        // Build query
        const query = {
            sessionPlateId: { $in: sessionPlateIds },
        };

        if (eventType) {
            query.eventType = eventType;
        }

        // Get logs with pagination
        const logs = await AuctionLog.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .populate('userId', 'username avatar')
            .populate('sessionPlateId', 'plateNumber');

        const total = await AuctionLog.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                logs,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            },
        });
    } catch (error) {
        console.error('Error fetching room activity log:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy lịch sử hoạt động',
            error: error.message,
        });
    }
};

export default {
    getRoomStats,
    getRoomParticipants,
    getRoomActivityLog,
};
