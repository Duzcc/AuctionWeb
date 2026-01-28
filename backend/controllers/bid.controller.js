import biddingService from '../services/bidding.service.js';

/**
 * Place a bid on an auction
 * POST /api/bids
 */
export const placeBid = async (req, res) => {
    try {
        const { sessionPlateId, bidAmount } = req.body;
        const userId = req.user.userId;
        const userName = req.user.username;
        const ipAddress = req.ip || req.connection.remoteAddress;

        // Validate required fields
        if (!sessionPlateId || !bidAmount) {
            return res.status(400).json({
                success: false,
                message: 'sessionPlateId and bidAmount are required'
            });
        }

        // Validate bid amount is a number
        if (typeof bidAmount !== 'number' || bidAmount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Bid amount must be a positive number'
            });
        }

        const result = await biddingService.placeBid(
            sessionPlateId,
            userId,
            userName,
            bidAmount,
            ipAddress
        );

        res.status(200).json({
            success: true,
            message: result.message,
            data: {
                bid: result.bid,
                currentPrice: result.currentPrice,
                timeExtended: result.timeExtended,
                newEndTime: result.newEndTime,
                totalExtensions: result.totalExtensions
            }
        });
    } catch (error) {
        console.error('Place bid controller error:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to place bid'
        });
    }
};

/**
 * Get bid history for a session plate
 * GET /api/bids/session-plate/:sessionPlateId
 */
export const getBidHistory = async (req, res) => {
    try {
        const { sessionPlateId } = req.params;
        const { page, limit, sortBy, sortOrder } = req.query;

        const result = await biddingService.getBidHistory(sessionPlateId, {
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 50,
            sortBy: sortBy || 'bidTime',
            sortOrder: sortOrder || 'desc'
        });

        res.status(200).json({
            success: true,
            message: 'Bid history retrieved successfully',
            data: result.bids,
            pagination: result.pagination
        });
    } catch (error) {
        console.error('Get bid history error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get bid history'
        });
    }
};

/**
 * Get user's bid history
 * GET /api/bids/my-bids
 */
export const getMyBids = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { page = 1, limit = 20 } = req.query;

        const Bid = (await import('../models/Bid.model.js')).default;

        const bids = await Bid.find({ userId })
            .sort({ bidTime: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .populate('sessionPlateId', 'plateNumber status finalPrice winnerId')
            .lean();

        const total = await Bid.countDocuments({ userId });

        res.status(200).json({
            success: true,
            message: 'Your bids retrieved successfully',
            data: bids,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get my bids error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get your bids'
        });
    }
};

/**
 * Get current auction state
 * GET /api/bids/auction-state/:sessionPlateId
 */
export const getAuctionState = async (req, res) => {
    try {
        const { sessionPlateId } = req.params;

        const result = await biddingService.getAuctionState(sessionPlateId);

        res.status(200).json({
            success: true,
            message: 'Auction state retrieved successfully',
            data: result
        });
    } catch (error) {
        console.error('Get auction state error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get auction state'
        });
    }
};

/**
 * Admin: Manually determine winner (for testing or edge cases)
 * POST /api/bids/determine-winner/:sessionPlateId
 */
export const adminDetermineWinner = async (req, res) => {
    try {
        const { sessionPlateId } = req.params;

        const result = await biddingService.determineWinner(sessionPlateId);

        res.status(200).json({
            success: true,
            message: 'Winner determined successfully',
            data: result
        });
    } catch (error) {
        console.error('Admin determine winner error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to determine winner'
        });
    }
};
