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
            } else {
                console.log('🆕 Creating NEW session for plate:', plate.plateNumber);

                // 2. Create New Session
                // A. Find/Create Room
                let room = await Room.findOne({ roomName: 'Public Auction Room' });
                if (!room) {
                    room = await Room.create({
                        roomName: 'Public Auction Room',
                        location: 'Online',
                        capacity: 1000,
                        description: 'Default room for auto-created sessions',
                        isActive: true
                    });
                }

                // B. Calculate Times (Default: 7 days from now)
                const now = new Date();
                const startTime = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // +7 days
                const endTime = new Date(startTime.getTime() + 30 * 60 * 1000);      // +30 mins duration

                // Registration open now, close 1 hour before start
                const regStart = now;
                const regEnd = new Date(startTime.getTime() - 60 * 60 * 1000);

                const newSession = await Session.create({
                    sessionName: `Auction for ${plate.plateNumber}`,
                    roomId: room._id,
                    startTime,
                    endTime,
                    registrationStart: regStart,
                    registrationEnd: regEnd,
                    status: 'registration_open',
                    depositAmount: 40000000, // Default 40M
                    description: `Auto-generated auction session for ${plate.plateNumber}`
                });

                // C. Create SessionPlate
                await SessionPlate.create({
                    sessionId: newSession._id,
                    plateId: plate._id,
                    itemType: itemType, // 'CarPlate' or 'MotorbikePlate'
                    plateNumber: plate.plateNumber,
                    orderNumber: 1,
                    startingPrice: plate.startingPrice,
                    currentPrice: plate.startingPrice,
                    priceStep: 1000000, // 1M step default? Or derived? Assuming 1M usually
                    status: 'pending'
                });

                // Update Plate status to 'in_auction' IF you want to lock it? 
                // Usually good practice:
                // await CarPlate.findByIdAndUpdate(plate._id, { status: 'in_auction' });

                targetSessionId = newSession._id;
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

        // 4. Create Registration
        const actualDeposit = depositAmount || session.depositAmount || 40000000;

        const registration = await Registration.create({
            sessionId: targetSessionId,
            userId,
            userName: user.fullName || user.username || 'Unknown',
            depositAmount: actualDeposit,
            depositStatus: 'pending',
            status: 'registered',
            notes
        });

        res.status(201).json({
            success: true,
            data: registration
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
