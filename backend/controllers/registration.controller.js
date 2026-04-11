import User from '../models/User.model.js';
import Registration from '../models/Registration.model.js';
import Session from '../models/Session.model.js';
import SessionPlate from '../models/SessionPlate.model.js';
import Room from '../models/Room.model.js';
import CarPlate from '../models/CarPlate.model.js';
import MotorbikePlate from '../models/MotorbikePlate.model.js';
import { AppError } from '../middleware/error.middleware.js';

/**
 * @desc    Register for an auction session (Create pending registration)
 * @route   POST /api/registrations
 * @access  Private
 */
export const createRegistration = async (req, res, next) => {
    try {
        console.log('Register Request Body:', req.body);
        console.log('Register User:', req.user);

        const { sessionId, notes, depositAmount } = req.body;

        // Ensure user is authenticated properly
        // Support both 'id' (new tokens) and '_id' (legacy/mongoose)
        const userId = req.user?.id || req.user?._id;

        if (!userId) {
            console.error('Registration: Missing User ID in token', req.user);
            throw new AppError('User authentication failed. No ID found in token.', 401);
        }

        let targetSessionId = sessionId;
        let sessionCreated = false; // Track if we created a new session

        // --- AUTO-CREATE SESSION LOGIC ---
        // If sessionId is NOT provided but plateId/plateNumber IS provided
        if (!targetSessionId && (req.body.plateId || req.body.plateNumber)) {
            console.log('ℹ️ Auto-creating session for plate registration...');
            const plateId = req.body.plateId;
            const plateNumber = req.body.plateNumber;
            // distinct itemType if provided, default to CarPlate if not specified but often implied
            const itemType = req.body.itemType || 'CarPlate';

            // 1. Check if session already exists for this plate
            // We search by plateId (if provided) or find plate first
            let plate;
            if (plateId) {
                if (itemType === 'CarPlate') plate = await CarPlate.findById(plateId);
                else plate = await MotorbikePlate.findById(plateId);
            } else if (plateNumber) {
                // Find by number
                if (itemType === 'CarPlate') plate = await CarPlate.findOne({ plateNumber });
                else plate = await MotorbikePlate.findOne({ plateNumber });
            }

            if (!plate) {
                throw new AppError('Plate not found to register', 404);
            }

            // Check existing SessionPlate (active/pending)
            const existingSessionPlate = await SessionPlate.findOne({
                plateId: plate._id,
                status: { $in: ['pending', 'bidding'] }
            });

            if (existingSessionPlate) {
                console.log('✅ Found existing session for plate, using it.');
                targetSessionId = existingSessionPlate.sessionId;
                sessionCreated = false;
            } else {
                console.log('🆕 Creating NEW session for plate:', plate.plateNumber);

                // Use sessionService to create session
                const { autoCreateSessionForPlate } = await import('../services/sessionService.js');

                const result = await autoCreateSessionForPlate(plate._id, itemType, {
                    daysUntilStart: 7,      // 7 days from now
                    durationMinutes: 30,    // 30 minutes
                    depositAmount: 40000000 // 40M VND
                });

                targetSessionId = result.session._id;
                sessionCreated = result.isNew || true; // Mark that we created a new session
            }
        }
        // --- END AUTO-CREATE ---

        if (!targetSessionId) {
            console.error('Missing sessionId. Request body:', req.body);
            throw new AppError('Session ID is required (or valid Plate ID to auto-register)', 400);
        }

        // Validate sessionId format (MongoDB ObjectId)
        if (!targetSessionId.match(/^[0-9a-fA-F]{24}$/)) {
            console.error('Invalid sessionId format:', targetSessionId);
            throw new AppError('Invalid session ID format', 400);
        }

        // 1. Check if session exists
        console.log('Looking up session with ID:', targetSessionId);
        const session = await Session.findById(targetSessionId);
        if (!session) {
            console.error('Session not found for ID:', targetSessionId);
            console.error('Available sessions count:', await Session.countDocuments());
            throw new AppError('Session not found', 404);
        }

        console.log('✅ Session found:', session.sessionName);

        // 2. Check if already registered
        const existingRegistration = await Registration.findOne({ sessionId: targetSessionId, userId });
        if (existingRegistration) {
            return res.status(200).json({
                success: true,
                message: 'Already registered',
                data: existingRegistration,
                isExisting: true
            });
        }

        // 3. Get User Details
        const user = await User.findById(userId);
        if (!user) {
            console.error('User not found for ID:', userId);
            throw new AppError('User not found', 404);
        }

        // DEBUG: Log what we're about to save
        console.log('DEBUG Registration Data:', {
            sessionId: targetSessionId,
            userId,
            userName: user.fullName || user.username || 'Unknown',
            depositAmount: depositAmount || session.depositAmount || 40000000,
            depositStatus: 'pending',
            status: 'registered'
        });

        // 4. Create Registration with plate information
        const actualDeposit = depositAmount || session.depositAmount || 40000000;

        // Extract plate info from request (if provided)
        const plateId = req.body.plateId;
        const plateNumber = req.body.plateNumber;
        const plateType = req.body.itemType || req.body.plateType;

        const registration = await Registration.create({
            sessionId: targetSessionId,
            userId,
            userName: user.fullName || user.username || 'Unknown',
            depositAmount: actualDeposit,
            depositStatus: 'pending',
            status: 'registered',
            plateId: plateId || undefined,
            plateNumber: plateNumber || undefined,
            plateType: plateType || undefined,
            notes
        });

        // Populate session with room information for comprehensive response
        const populatedRegistration = await Registration.findById(registration._id)
            .populate({
                path: 'sessionId',
                populate: {
                    path: 'roomId',
                    select: 'roomName location capacity description'
                }
            });

        // Get SessionPlate info for the registered session with full plate details
        const sessionPlate = await SessionPlate.findOne({ sessionId: targetSessionId })
            .populate({
                path: 'plateId',
                select: 'plateNumber images features detailedDescription priceStep startingPrice province plateType plateColor name type specifications'
            })
            .select('plateNumber plateId itemType startingPrice currentPrice orderNumber status priceStep');

        res.status(201).json({
            success: true,
            data: populatedRegistration,
            sessionCreated: sessionCreated, // Indicate if session was newly created
            sessionPlate: sessionPlate, // Include plate information
            message: sessionCreated
                ? 'Đã tạo phiên đấu giá mới và đăng ký thành công!'
                : 'Đăng ký phiên đấu giá thành công!'
        });

    } catch (error) {
        console.error('Create Registration Error:', error);
        // FORCE DEBUG RESPONSE
        return res.status(500).json({
            success: false,
            message: 'DEBUG SERVER ERROR: ' + error.message,
            stack: error.stack,
            details: error
        });
    }
};

/**
 * @desc    Get my registrations
 * @route   GET /api/registrations/my
 * @access  Private
 */
export const getMyRegistrations = async (req, res, next) => {
    try {
        const userId = req.user?.id || req.user?._id;
        const registrations = await Registration.find({ userId })
            .populate({
                path: 'sessionId',
                select: 'sessionName startTime endTime status depositAmount',
                populate: { path: 'roomId', select: 'roomName' }
            })
            .sort({ createdAt: -1 });

        // Enrich registrations with plate number information
        const enrichedRegistrations = await Promise.all(
            registrations.map(async (registration) => {
                const regObj = registration.toObject();

                // Get first plate for this session to display as the representative plate
                if (regObj.sessionId) {
                    const sessionPlate = await SessionPlate.findOne({ sessionId: regObj.sessionId._id })
                        .select('plateNumber')
                        .sort({ orderNumber: 1 }); // Get the first plate by order

                    if (sessionPlate) {
                        regObj.sessionId.plateNumber = sessionPlate.plateNumber;
                    }
                }

                return regObj;
            })
        );

        res.status(200).json({
            success: true,
            count: enrichedRegistrations.length,
            data: enrichedRegistrations
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get single registration
 * @route   GET /api/registrations/:id
 * @access  Private
 */
export const getRegistrationById = async (req, res, next) => {
    try {
        const registration = await Registration.findById(req.params.id)
            .populate({
                path: 'sessionId',
                select: 'sessionName startTime endTime status depositAmount'
            });

        if (!registration) {
            throw new AppError('Registration not found', 404);
        }

        // Check ownership
        const userId = req.user?.id || req.user?._id;
        if (registration.userId.toString() !== userId.toString() && req.user.role !== 'admin') {
            throw new AppError('Not authorized', 403);
        }

        // Enrich with plate number information
        const regObj = registration.toObject();

        if (regObj.sessionId) {
            const sessionPlate = await SessionPlate.findOne({ sessionId: regObj.sessionId._id })
                .select('plateNumber')
                .sort({ orderNumber: 1 }); // Get the first plate by order

            if (sessionPlate) {
                regObj.sessionId.plateNumber = sessionPlate.plateNumber;
            }
        }

        res.status(200).json({
            success: true,
            data: regObj
        });
    } catch (error) {
        next(error);
    }
};
