import kycService from '../services/kyc.service.js';

/**
 * Submit KYC documents
 */
export const submitKYC = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { documents } = req.body;

        // Validate documents
        if (!documents || !Array.isArray(documents) || documents.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Documents array is required'
            });
        }

        // Validate each document has type and url
        for (const doc of documents) {
            if (!doc.type || !doc.url) {
                return res.status(400).json({
                    success: false,
                    message: 'Each document must have type and url'
                });
            }
        }

        const result = await kycService.submitKYC(userId, documents);

        res.status(200).json({
            success: true,
            message: result.message,
            data: {
                kycStatus: result.kycStatus,
                documents: result.documents
            }
        });
    } catch (error) {
        console.error('Submit KYC error:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to submit KYC'
        });
    }
};

/**
 * Get KYC status
 */
export const getKYCStatus = async (req, res) => {
    try {
        const userId = req.user.userId;
        const result = await kycService.getKYCStatus(userId);

        res.status(200).json(result);
    } catch (error) {
        console.error('Get KYC status error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get KYC status'
        });
    }
};

/**
 * Admin: Get all pending KYC submissions
 */
export const getPendingKYC = async (req, res) => {
    try {
        const filters = {
            page: parseInt(req.query.page) || 1,
            limit: parseInt(req.query.limit) || 20,
            status: req.query.status || 'pending',
            userType: req.query.userType
        };

        const result = await kycService.getPendingKYC(filters);

        res.status(200).json({
            success: true,
            message: 'Pending KYC retrieved successfully',
            data: result.data,
            pagination: result.pagination
        });
    } catch (error) {
        console.error('Get pending KYC error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get pending KYC'
        });
    }
};

/**
 * Admin: Approve KYC
 */
export const approveKYC = async (req, res) => {
    try {
        const { userId } = req.params;
        const adminId = req.user.userId;
        const { notes } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        const result = await kycService.approveKYC(userId, adminId, notes);

        res.status(200).json(result);
    } catch (error) {
        console.error('Approve KYC error:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to approve KYC'
        });
    }
};

/**
 * Admin: Reject KYC
 */
export const rejectKYC = async (req, res) => {
    try {
        const { userId } = req.params;
        const adminId = req.user.userId;
        const { reason } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        if (!reason || reason.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Rejection reason is required'
            });
        }

        const result = await kycService.rejectKYC(userId, adminId, reason);

        res.status(200).json(result);
    } catch (error) {
        console.error('Reject KYC error:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to reject KYC'
        });
    }
};

/**
 * Admin: Get KYC statistics
 */
export const getKYCStats = async (req, res) => {
    try {
        const result = await kycService.getKYCStats();

        res.status(200).json(result);
    } catch (error) {
        console.error('Get KYC stats error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get KYC statistics'
        });
    }
};

/**
 * Get user's KYC details (Admin only)
 */
export const getUserKYC = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        const result = await kycService.getKYCStatus(userId);

        res.status(200).json(result);
    } catch (error) {
        console.error('Get user KYC error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get user KYC details'
        });
    }
};

/**
 * Check if user can participate in auctions
 */
export const checkParticipation = async (req, res) => {
    try {
        const userId = req.user.userId;
        const sessionId = req.query.sessionId; // Optional sessionId for bypass check
        const result = await kycService.canParticipate(userId, sessionId);

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Check participation error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to check participation status'
        });
    }
};
