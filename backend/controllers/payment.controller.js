import Payment from '../models/Payment.model.js';
import Registration from '../models/Registration.model.js';
import { AppError } from '../middleware/error.middleware.js';
import emailService from '../services/email.service.js';
import auctionPaymentService from '../services/auctionPayment.service.js';

// ========================
// EXISTING DEPOSIT PAYMENT ENDPOINTS
// ========================

// Create a new deposit payment initialization
export const createDepositPayment = async (req, res, next) => {
    try {
        const { registrationId, amount, feeAmount, method, transactionCode } = req.body;
        const userId = req.user.id;

        const registration = await Registration.findById(registrationId);
        if (!registration) {
            throw new AppError('Registration not found', 404);
        }

        if (registration.userId.toString() !== userId.toString()) {
            throw new AppError('Unauthorized', 403);
        }

        const totalAmount = Number(amount || 0) + Number(feeAmount || 0);

        const payment = await Payment.create({
            user: userId,
            registration: registrationId,
            type: 'DEPOSIT',
            amount: Number(amount),
            feeAmount: Number(feeAmount),
            totalAmount: totalAmount,
            method: method || 'VIETQR',
            transactionCode: transactionCode,
            status: 'PENDING'
        });

        if (req.user.email) {
            emailService.sendPaymentPendingEmail(
                req.user.email,
                req.user.fullName,
                totalAmount,
                transactionCode || `DP ${registrationId.slice(-6).toUpperCase()}`,
                new Date(Date.now() + 24 * 60 * 60 * 1000)
            );
        }

        res.status(201).json({
            success: true,
            data: payment
        });
    } catch (error) {
        next(error);
    }
};

// Confirm payment with proof
export const confirmPayment = async (req, res, next) => {
    try {
        const { paymentId } = req.params;
        const { proofImage, transactionCode } = req.body;

        let payment;

        if (paymentId && paymentId !== 'new') {
            payment = await Payment.findById(paymentId);
            if (!payment) throw new AppError('Payment not found', 404);

            payment.proofImage = proofImage;
            payment.transactionCode = transactionCode || payment.transactionCode;
            payment.status = 'PENDING';
            await payment.save();
        } else {
            const { registrationId, amount, feeAmount, method, type } = req.body;

            if (!registrationId) {
                throw new AppError('Registration ID is required', 400);
            }
            if (!amount) {
                throw new AppError('Amount is required', 400);
            }
            if (!transactionCode) {
                throw new AppError('Transaction code is required', 400);
            }

            const registration = await Registration.findById(registrationId);
            if (!registration) throw new AppError('Registration not found', 404);

            payment = await Payment.create({
                user: req.user.id,
                registration: registrationId,
                type: type || 'DEPOSIT',
                amount: Number(amount),
                feeAmount: Number(feeAmount || 100000),
                totalAmount: Number(amount) + Number(feeAmount || 100000),
                method: method || 'VIETQR',
                transactionCode: transactionCode,
                proofImage: proofImage,
                status: 'PENDING'
            });

            registration.depositStatus = 'pending';
            registration.depositProof = proofImage;
            registration.depositProofUploadedAt = new Date();
            await registration.save();
        }

        res.status(200).json({
            success: true,
            message: 'Payment proof submitted successfully',
            data: payment
        });

        if (req.user.email) {
            emailService.sendPaymentReceivedEmail(
                req.user.email,
                req.user.fullName,
                payment.totalAmount || payment.amount,
                payment.transactionCode
            );
        }

    } catch (error) {
        next(error);
    }
};

export const getUserPayments = async (req, res, next) => {
    try {
        const payments = await Payment.find({ user: req.user.id })
            .populate({
                path: 'registration',
                populate: { path: 'sessionId', select: 'plateNumber' }
            })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: payments.length,
            data: payments
        });
    } catch (error) {
        next(error);
    }
};

// Admin: Get All Payments
export const getAllPayments = async (req, res, next) => {
    try {
        const { status, type } = req.query;
        const filter = {};
        if (status) filter.status = status;
        if (type) filter.type = type;

        const payments = await Payment.find(filter)
            .populate('user', 'fullName email phone')
            .populate({
                path: 'registration',
                populate: { path: 'sessionId', select: 'sessionName plateNumber' }
            })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: payments.length,
            data: payments
        });
    } catch (error) {
        next(error);
    }
};

// Admin: Approve Payment
export const approvePayment = async (req, res, next) => {
    try {
        const { paymentId } = req.params;

        const payment = await Payment.findById(paymentId);
        if (!payment) throw new AppError('Payment not found', 404);

        if (payment.status === 'COMPLETED') {
            return res.status(200).json({ success: true, message: 'Already completed', data: payment });
        }

        payment.status = 'COMPLETED';
        payment.adminNotes = req.body.reason || 'Approved by admin';
        await payment.save();

        if (payment.registration) {
            const registration = await Registration.findById(payment.registration);
            if (registration) {
                if (payment.type === 'auction_payment' || payment.type === 'auction_remaining') {
                    registration.status = 'won_paid';
                } else {
                    registration.depositStatus = 'paid';
                    registration.status = 'approved';
                }
                await registration.save();
            }
        }

        res.status(200).json({
            success: true,
            message: 'Payment approved',
            data: payment
        });

        const fullPayment = await Payment.findById(paymentId)
            .populate('user')
            .populate({
                path: 'registration',
                populate: { path: 'sessionId' }
            });

        if (fullPayment && fullPayment.user && fullPayment.user.email) {
            emailService.sendPaymentApprovedEmail(
                fullPayment.user.email,
                fullPayment.user.fullName,
                fullPayment.totalAmount,
                fullPayment.registration?.sessionId?.plateNumber || 'Unknown'
            );
        }
    } catch (error) {
        next(error);
    }
};

// Admin: Reject Payment
export const rejectPayment = async (req, res, next) => {
    try {
        const { paymentId } = req.params;
        const { reason } = req.body;

        const payment = await Payment.findById(paymentId);
        if (!payment) throw new AppError('Payment not found', 404);

        payment.status = 'FAILED';
        payment.adminNotes = reason || 'Rejected by admin';
        await payment.save();

        if (payment.registration) {
            const registration = await Registration.findById(payment.registration);
            if (registration) {
                registration.depositStatus = 'pending';
                await registration.save();
            }
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

// ========================
// NEW AUCTION PAYMENT ENDPOINTS
// ========================

/**
 * User: Get my payment status for an auction
 * GET /api/payments/auction/:sessionPlateId/status
 */
export const getMyAuctionPaymentStatus = async (req, res) => {
    try {
        const { sessionPlateId } = req.params;
        const userId = req.user.userId;

        const result = await auctionPaymentService.getPaymentStatus(sessionPlateId, userId);

        res.status(200).json({
            success: true,
            message: 'Payment status retrieved',
            data: result
        });
    } catch (error) {
        console.error('Get auction payment status error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get payment status'
        });
    }
};

/**
 * Admin: Process winner payment manually
 * POST /api/payments/auction/:sessionPlateId/process-winner
 */
export const adminProcessWinnerPayment = async (req, res) => {
    try {
        const { sessionPlateId } = req.params;

        const result = await auctionPaymentService.processWinnerPayment(sessionPlateId);

        res.status(200).json({
            success: true,
            message: 'Winner payment processed',
            data: result
        });
    } catch (error) {
        console.error('Process winner payment error:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to process winner payment'
        });
    }
};

/**
 * Admin: Refund non-winners for a session
 * POST /api/payments/auction/session/:sessionId/refund-non-winners
 */
export const adminRefundNonWinners = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { excludeUserIds } = req.body;

        const result = await auctionPaymentService.refundNonWinners(
            sessionId,
            excludeUserIds || []
        );

        res.status(200).json({
            success: true,
            message: `Refunded ${result.refundCount} users`,
            data: result
        });
    } catch (error) {
        console.error('Refund non-winners error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to refund non-winners'
        });
    }
};

/**
 * Admin: Complete full auction settlement (winner payment + refunds)
 * POST /api/payments/auction/:sessionPlateId/settle
 */
export const adminCompleteSettlement = async (req, res) => {
    try {
        const { sessionPlateId } = req.params;

        const result = await auctionPaymentService.completeAuctionSettlement(sessionPlateId);

        res.status(200).json({
            success: true,
            message: 'Auction settlement completed',
            data: result
        });
    } catch (error) {
        console.error('Complete settlement error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to complete settlement'
        });
    }
};

/**
 * Admin: Handle payment timeout (penalize winner)
 * POST /api/payments/auction/:sessionPlateId/timeout
 */
export const adminHandlePaymentTimeout = async (req, res) => {
    try {
        const { sessionPlateId } = req.params;

        const result = await auctionPaymentService.handlePaymentTimeout(sessionPlateId);

        res.status(200).json({
            success: true,
            message: 'Payment timeout handled',
            data: result
        });
    } catch (error) {
        console.error('Handle payment timeout error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to handle payment timeout'
        });
    }
};

/**
 * Admin: Get all pending auction payments
 * GET /api/payments/auction/pending
 */
export const adminGetPendingPayments = async (req, res) => {
    try {
        const result = await auctionPaymentService.getPendingPayments();

        res.status(200).json({
            success: true,
            message: 'Pending payments retrieved',
            data: result.pendingPayments,
            count: result.count
        });
    } catch (error) {
        console.error('Get pending payments error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get pending payments'
        });
    }
};
