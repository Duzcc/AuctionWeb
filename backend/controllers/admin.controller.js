import User from '../models/User.model.js';
import Payment from '../models/Payment.model.js';
import Session from '../models/Session.model.js';
import SessionPlate from '../models/SessionPlate.model.js';
import Registration from '../models/Registration.model.js';
import CarPlate from '../models/CarPlate.model.js';
import MotorbikePlate from '../models/MotorbikePlate.model.js';
import { AppError } from '../middleware/error.middleware.js';

/**
 * @route   GET /api/admin/stats
 * @desc    Get dashboard statistics
 * @access  Private/Admin
 */
export const getDashboardStats = async (req, res, next) => {
    try {
        const [
            totalUsers,
            revenueData,
            activeSessions,
            pendingDeposits,
            recentActivity
        ] = await Promise.all([
            User.countDocuments(),
            Payment.aggregate([
                { $match: { status: 'COMPLETED' } },
                { $group: { _id: null, total: { $sum: "$totalAmount" } } }
            ]),
            Session.countDocuments({ status: 'active' }),
            Payment.countDocuments({ status: 'PENDING', type: { $in: ['DEPOSIT', 'AUCTION_PAYMENT', 'auction_payment'] } }),
            Promise.all([
                Registration.find().sort({ createdAt: -1 }).limit(3).populate('userId', 'fullName').populate('sessionId', 'sessionName plateNumber'),
                Payment.find().sort({ createdAt: -1 }).limit(3).populate('user', 'fullName').populate('registration')
            ])
        ]);

        const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

        const mixedActivity = [];
        recentActivity[0].forEach(r => {
            if (r.userId) {
                mixedActivity.push({
                    type: 'registration',
                    text: `${r.userId.fullName} đăng ký phiên ${r.sessionId?.sessionName || 'biển số'}`,
                    time: r.createdAt,
                    icon: 'user',
                    color: 'text-purple-600',
                    bg: 'bg-purple-100'
                });
            }
        });
        recentActivity[1].forEach(p => {
            if (p.user) {
                mixedActivity.push({
                    type: 'payment',
                    text: `${p.user.fullName} thanh toán ${p.amount?.toLocaleString()}đ`,
                    time: p.createdAt,
                    icon: 'money',
                    color: 'text-green-600',
                    bg: 'bg-green-100'
                });
            }
        });

        mixedActivity.sort((a, b) => new Date(b.time) - new Date(a.time));

        res.status(200).json({
            success: true,
            data: {
                users: totalUsers,
                revenue: totalRevenue,
                activeSessions: activeSessions,
                pendingDeposits: pendingDeposits,
                recentActivity: mixedActivity.slice(0, 5)
            }
        });

    } catch (error) {
        next(error);
    }
};

/**
 * @route   PUT /api/admin/payments/:id/approve
 * @desc    Approve payment deposit
 * @access  Private/Admin
 */
export const approvePayment = async (req, res, next) => {
    try {
        const payment = await Payment.findById(req.params.id);

        if (!payment) {
            throw new AppError('Payment not found', 404);
        }

        payment.status = 'COMPLETED';
        payment.approvedBy = req.user.id;
        payment.approvedAt = new Date();
        await payment.save();

        let sessionCreationResult = null;

        // Update registration status if linked
        if (payment.registration) {
            const registration = await Registration.findByIdAndUpdate(
                payment.registration,
                {
                    depositStatus: 'paid',
                    status: 'approved'
                },
                { new: true }
            );

            // Auto-create session if registration has plate information
            if (registration && registration.plateId && registration.plateType) {
                try {
                    const { autoCreateSessionForPlate } = await import('../services/sessionService.js');

                    console.log(`🎯 Auto-creating session for plate: ${registration.plateNumber}`);

                    const result = await autoCreateSessionForPlate(
                        registration.plateId,
                        registration.plateType,
                        {
                            daysUntilStart: 3,      // Auction starts in 3 days
                            durationMinutes: 60,     // 1 hour auction
                            depositAmount: registration.depositAmount
                        }
                    );

                    sessionCreationResult = {
                        sessionId: result.session._id,
                        sessionName: result.session.sessionName,
                        startTime: result.session.startTime,
                        endTime: result.session.endTime,
                        isNew: result.isNew,
                        message: result.message
                    };

                    if (result.isNew) {
                        console.log(`✅ Created new session: ${result.session.sessionName}`);
                    } else {
                        console.log(`ℹ️  Using existing session: ${result.session.sessionName}`);
                    }

                    // Update registration with sessionId if newly created
                    if (result.isNew && registration.sessionId?.toString() !== result.session._id.toString()) {
                        await Registration.findByIdAndUpdate(registration._id, {
                            sessionId: result.session._id
                        });
                    }

                } catch (sessionError) {
                    console.error('❌ Error creating session:', sessionError.message);
                    // Don't fail the payment approval if session creation fails
                    sessionCreationResult = {
                        error: true,
                        message: `Session creation failed: ${sessionError.message}`
                    };
                }
            }
        }

        // Build response message
        let responseMessage = 'Payment approved successfully';
        if (sessionCreationResult) {
            if (sessionCreationResult.error) {
                responseMessage += '. Note: ' + sessionCreationResult.message;
            } else if (sessionCreationResult.isNew) {
                responseMessage += ` and auction session created: ${sessionCreationResult.sessionName}`;
            } else {
                responseMessage += ` and linked to existing session: ${sessionCreationResult.sessionName}`;
            }
        }

        res.status(200).json({
            success: true,
            message: responseMessage,
            data: payment,
            sessionCreated: sessionCreationResult
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   PUT /api/admin/payments/:id/reject
 * @desc    Reject payment deposit
 * @access  Private/Admin
 */
export const rejectPayment = async (req, res, next) => {
    try {
        const { reason } = req.body;
        const payment = await Payment.findById(req.params.id);

        if (!payment) {
            throw new AppError('Payment not found', 404);
        }

        payment.status = 'REJECTED';
        payment.rejectionReason = reason || 'No reason provided';
        payment.rejectedBy = req.user.id;
        payment.rejectedAt = new Date();
        await payment.save();

        // Update registration status
        if (payment.registration) {
            await Registration.findByIdAndUpdate(payment.registration, {
                depositStatus: 'rejected'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Payment rejected',
            data: payment
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   GET /api/admin/users
 * @desc    Get all users with pagination
 * @access  Private/Admin
 */
export const getAllUsers = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, search = '', role = '' } = req.query;

        const query = {};
        if (search) {
            query.$or = [
                { fullName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { username: { $regex: search, $options: 'i' } }
            ];
        }
        if (role) {
            query.role = role;
        }

        const users = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await User.countDocuments(query);

        res.status(200).json({
            success: true,
            data: users,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   PUT /api/admin/users/:id/status
 * @desc    Update user status (ban/active)
 * @access  Private/Admin
 */
export const updateUserStatus = async (req, res, next) => {
    try {
        const { isActive } = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { isActive: isActive },
            { new: true }
        ).select('-password');

        if (!user) {
            throw new AppError('User not found', 404);
        }

        res.status(200).json({
            success: true,
            message: `User ${isActive ? 'activated' : 'banned'} successfully`,
            data: user
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   PUT /api/admin/registrations/:id/approve
 * @desc    Approve registration for auction
 * @access  Private/Admin
 */
export const approveRegistration = async (req, res, next) => {
    try {
        const registration = await Registration.findByIdAndUpdate(
            req.params.id,
            { status: 'approved' },
            { new: true }
        );

        if (!registration) {
            throw new AppError('Registration not found', 404);
        }

        res.status(200).json({
            success: true,
            message: 'Registration approved',
            data: registration
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   GET /api/admin/plates
 * @desc    Get all plates (cars + motorbikes)
 * @access  Private/Admin
 */
export const getAllPlates = async (req, res, next) => {
    try {
        const { page = 1, limit = 50, search = '', type = 'car', status = '' } = req.query;

        const Model = type === 'motorbike' ? MotorbikePlate : CarPlate;

        const query = {};
        if (search) {
            query.plateNumber = { $regex: search, $options: 'i' };
        }
        if (status) {
            query.status = status;
        }

        const plates = await Model.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await Model.countDocuments(query);

        res.status(200).json({
            success: true,
            data: plates,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count,
            type: type
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   POST /api/admin/plates
 * @desc    Create new plate
 * @access  Private/Admin
 */
export const createPlate = async (req, res, next) => {
    try {
        const { type, ...plateData } = req.body;

        const Model = type === 'motorbike' ? MotorbikePlate : CarPlate;
        const plate = await Model.create(plateData);

        res.status(201).json({
            success: true,
            message: 'Plate created successfully',
            data: plate
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   PUT /api/admin/plates/:id
 * @desc    Update plate
 * @access  Private/Admin
 */
export const updatePlate = async (req, res, next) => {
    try {
        const { type, ...plateData } = req.body;

        const Model = type === 'motorbike' ? MotorbikePlate : CarPlate;
        const plate = await Model.findByIdAndUpdate(
            req.params.id,
            plateData,
            { new: true, runValidators: true }
        );

        if (!plate) {
            throw new AppError('Plate not found', 404);
        }

        res.status(200).json({
            success: true,
            message: 'Plate updated successfully',
            data: plate
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   DELETE /api/admin/plates/:id
 * @desc    Delete plate
 * @access  Private/Admin
 */
export const deletePlate = async (req, res, next) => {
    try {
        const { type } = req.query;

        const Model = type === 'motorbike' ? MotorbikePlate : CarPlate;
        const plate = await Model.findByIdAndDelete(req.params.id);

        if (!plate) {
            throw new AppError('Plate not found', 404);
        }

        res.status(200).json({
            success: true,
            message: 'Plate deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};
