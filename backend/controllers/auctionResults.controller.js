import SessionPlate from '../models/SessionPlate.model.js';
import '../models/CarPlate.model.js';
import '../models/MotorbikePlate.model.js';
import '../models/Asset.model.js';
import { getPaginationParams, getSortParams, buildPaginationResponse } from '../utils/pagination.utils.js';

// Helper to map vehicleType query to itemType
const mapVehicleTypeToItemType = (type) => {
    const map = {
        'car': 'CarPlate',
        'motorcycle': 'MotorbikePlate',
        'asset': 'Asset'
    };
    return map[type] || null;
};

/**
 * @route   GET /api/auction-results
 * @desc    Get auction results (sold plates with winner info)
 * @access  Public
 */
export const getAuctionResults = async (req, res) => {
    try {
        const { page, limit, skip } = getPaginationParams(req.query);
        const sort = getSortParams(req.query.sortBy, '-updatedAt');

        // Build filter for sold plates
        const filter = {
            status: 'sold'
        };

        // Filter by vehicle type (mapped to itemType)
        if (req.query.vehicleType) {
            const itemType = mapVehicleTypeToItemType(req.query.vehicleType);
            if (itemType) {
                filter.itemType = itemType;
            }
        }

        // Get sold session plates with winner info
        let query = SessionPlate.find(filter)
            .populate({
                path: 'plateId',
                // Removed vehicleType as it doesn't exist in new models.
                // We select common fields. Note: Asset has 'name' instead of 'plateNumber', but SessionPlate copies plateNumber/name to its own field 'plateNumber'.
                select: 'plateNumber province plateType plateColor startingPrice description name type image'
            })
            .populate({
                path: 'sessionId',
                select: 'sessionName startTime endTime'
            })
            .sort(sort);

        const [sessionPlates, total] = await Promise.all([
            query.skip(skip).limit(limit).lean(),
            SessionPlate.countDocuments(filter)
        ]);

        // Filter by province if needed (after population, as province is in the related doc)
        let filteredPlates = sessionPlates;

        // Note: For Assets, 'province' is a field. For Plates, 'province' is a field.
        if (req.query.province) {
            filteredPlates = filteredPlates.filter(sp =>
                sp.plateId?.province === req.query.province
            );
        }

        if (req.query.search) {
            const searchTerm = req.query.search.toLowerCase();
            filteredPlates = filteredPlates.filter(sp =>
                // SessionPlate has plateNumber cached, so we can use that directly
                sp.plateNumber.toLowerCase().includes(searchTerm)
            );
        }

        const response = buildPaginationResponse(filteredPlates, total, page, limit);
        res.status(200).json(response);
    } catch (error) {
        console.error('Error fetching auction results:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy kết quả đấu giá',
            error: error.message
        });
    }
};

/**
 * @route   GET /api/available-plates
 * @desc    Get available plates in active sessions (for registration)
 * @access  Public
 */
export const getAvailablePlates = async (req, res) => {
    try {
        const { page, limit, skip } = getPaginationParams(req.query);
        const sort = getSortParams(req.query.sortBy, 'orderNumber');

        // Build filter for available plates in sessions
        const filter = {
            status: { $in: ['pending', 'bidding'] }
        };

        // Filter by vehicle type (mapped to itemType) directly in DB query
        if (req.query.vehicleType) {
            const itemType = mapVehicleTypeToItemType(req.query.vehicleType);
            if (itemType) {
                filter.itemType = itemType;
            }
        }

        // Get session plates that are available
        let query = SessionPlate.find(filter)
            .populate({
                path: 'plateId',
                select: 'plateNumber province plateType plateColor startingPrice description name type image'
            })
            .populate({
                path: 'sessionId',
                select: 'sessionName startTime endTime registrationStart registrationEnd status depositAmount',
                match: { status: { $in: ['ongoing', 'upcoming', 'registration_open', 'registration_closed'] } }
            })
            .sort(sort);

        const [sessionPlates, total] = await Promise.all([
            query.skip(skip).limit(limit).lean(),
            SessionPlate.countDocuments(filter)
        ]);

        // Filter out plates where session is null (completed/cancelled sessions matched by populate)
        let filteredPlates = sessionPlates.filter(sp => sp.sessionId !== null);

        // Apply additional filters (Province, Colors, Types)
        if (req.query.province) {
            filteredPlates = filteredPlates.filter(sp =>
                sp.plateId?.province === req.query.province
            );
        }

        if (req.query.search) {
            const searchTerm = req.query.search.toLowerCase();
            filteredPlates = filteredPlates.filter(sp =>
                sp.plateNumber.toLowerCase().includes(searchTerm)
            );
        }

        if (req.query.types) {
            const types = Array.isArray(req.query.types) ? req.query.types : [req.query.types];
            filteredPlates = filteredPlates.filter(sp =>
                sp.plateId && types.includes(sp.plateId.plateType)
            );
        }

        if (req.query.colors) {
            const colors = Array.isArray(req.query.colors) ? req.query.colors : [req.query.colors];
            filteredPlates = filteredPlates.filter(sp =>
                sp.plateId && colors.includes(sp.plateId.plateColor)
            );
        }

        const response = buildPaginationResponse(filteredPlates, total, page, limit);
        res.status(200).json(response);
    } catch (error) {
        console.error('Error fetching available plates:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách biển số',
            error: error.message
        });
    }
};
