import Session from '../models/Session.model.js';
import SessionPlate from '../models/SessionPlate.model.js';
import Room from '../models/Room.model.js';
import Registration from '../models/Registration.model.js';
import Bid from '../models/Bid.model.js';
import {
    getPaginationParams,
    getSortParams,
    buildPaginationResponse,
    buildSessionFilter
} from '../utils/pagination.utils.js';

/**
 * @route   GET /api/sessions
 * @desc    Get all sessions with pagination and filtering
 * @access  Public
 */
export const getSessions = async (req, res) => {
    try {
        const { page, limit, skip } = getPaginationParams(req.query);
        const filter = buildSessionFilter(req.query);
        const sort = getSortParams(req.query.sortBy, '-startTime');

        const [sessions, total] = await Promise.all([
            Session.find(filter)
                .populate('roomId', 'roomName location')
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .lean(),
            Session.countDocuments(filter)
        ]);

        const response = buildPaginationResponse(sessions, total, page, limit);
        res.status(200).json(response);
    } catch (error) {
        console.error('Error fetching sessions:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách phiên đấu giá',
            error: error.message
        });
    }
};

/**
 * @route   GET /api/sessions/:id
 * @desc    Get single session by ID
 * @access  Public
 */
export const getSessionById = async (req, res) => {
    try {
        const session = await Session.findById(req.params.id)
            .populate('roomId');

        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy phiên đấu giá'
            });
        }

        res.status(200).json({
            success: true,
            data: session
        });
    } catch (error) {
        console.error('Error fetching session:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy thông tin phiên đấu giá',
            error: error.message
        });
    }
};

/**
 * @route   GET /api/sessions/:id/plates
 * @desc    Get all plates in a session with pagination
 * @access  Public
 */
export const getSessionPlates = async (req, res) => {
    try {
        const { page, limit, skip } = getPaginationParams(req.query);
        const sort = getSortParams(req.query.sortBy, 'orderNumber');

        const [sessionPlates, total] = await Promise.all([
            SessionPlate.find({ sessionId: req.params.id })
                .populate('plateId')
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .lean(),
            SessionPlate.countDocuments({ sessionId: req.params.id })
        ]);

        const response = buildPaginationResponse(sessionPlates, total, page, limit);
        res.status(200).json(response);
    } catch (error) {
        console.error('Error fetching session plates:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách biển trong phiên',
            error: error.message
        });
    }
};

/**
 * @route   POST /api/sessions
 * @desc    Create new session (Admin only)
 * @access  Private/Admin
 */
export const createSession = async (req, res) => {
    try {
        const {
            sessionName,
            roomId,
            startTime,
            endTime,
            registrationStart,
            registrationEnd,
            depositAmount,
            description
        } = req.body;

        // Verify room exists
        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy phòng đấu giá'
            });
        }

        const session = await Session.create({
            sessionName,
            roomId,
            startTime,
            endTime,
            registrationStart,
            registrationEnd,
            depositAmount,
            description,
            status: 'upcoming'
        });

        res.status(201).json({
            success: true,
            message: 'Tạo phiên đấu giá thành công',
            data: session
        });
    } catch (error) {
        console.error('Error creating session:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi tạo phiên đấu giá',
            error: error.message
        });
    }
};

/**
 * @route   PUT /api/sessions/:id
 * @desc    Update session (Admin only)
 * @access  Private/Admin
 */
export const updateSession = async (req, res) => {
    try {
        const {
            sessionName,
            startTime,
            endTime,
            registrationStart,
            registrationEnd,
            depositAmount,
            description,
            status
        } = req.body;

        const session = await Session.findById(req.params.id);

        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy phiên đấu giá'
            });
        }

        // Update fields
        if (sessionName) session.sessionName = sessionName;
        if (startTime) session.startTime = startTime;
        if (endTime) session.endTime = endTime;
        if (registrationStart) session.registrationStart = registrationStart;
        if (registrationEnd) session.registrationEnd = registrationEnd;
        if (depositAmount !== undefined) session.depositAmount = depositAmount;
        if (description !== undefined) session.description = description;
        if (status) session.status = status;

        await session.save();

        res.status(200).json({
            success: true,
            message: 'Cập nhật phiên đấu giá thành công',
            data: session
        });
    } catch (error) {
        console.error('Error updating session:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi cập nhật phiên đấu giá',
            error: error.message
        });
    }
};

/**
 * @route   POST /api/sessions/:id/finalize
 * @desc    Finalize auction session (Admin)
 * @access  Private/Admin
 */
export const finalizeAuction = async (req, res) => {
    try {
        const sessionId = req.params.id;
        const session = await Session.findById(sessionId);

        if (!session) {
            return res.status(404).json({ success: false, message: 'Session not found' });
        }

        // Logic to determine winners...
        // 1. Get all SessionPlates for this session
        const plates = await SessionPlate.find({ sessionId });

        // 2. For each plate, find the highest bid
        for (const plate of plates) {
            // Get highest bid
            const highestBid = await Bid.findOne({ sessionPlateId: plate._id })
                .sort({ amount: -1 });

            if (highestBid) {
                plate.winnerId = highestBid.userId;
                plate.currentPrice = highestBid.amount;
                plate.status = 'sold'; // or 'ended'
                await plate.save();

                // Update Registration status to 'won_unpaid'
                await Registration.findOneAndUpdate(
                    { userId: highestBid.userId, sessionId: sessionId },
                    { status: 'won_unpaid' }
                );
            } else {
                plate.status = 'unsold'; // No bids
                await plate.save();
            }
        }

        session.status = 'ended';
        await session.save();

        res.status(200).json({
            success: true,
            message: 'Auction finalized successfully'
        });

    } catch (error) {
        console.error('Finalize error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
