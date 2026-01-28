import Plate from '../models/Plate.model.js';
import {
    getPaginationParams,
    getSortParams,
    buildPaginationResponse,
    buildPlateFilter
} from '../utils/pagination.utils.js';

/**
 * @route   GET /api/plates
 * @desc    Get all plates with pagination, filtering, and sorting
 * @access  Public
 */
export const getPlates = async (req, res) => {
    try {
        // Get pagination params
        const { page, limit, skip } = getPaginationParams(req.query);

        // Build filter
        const filter = buildPlateFilter(req.query);

        // Get sort params
        const sort = getSortParams(req.query.sortBy, '-createdAt');

        // Execute query with pagination
        const [plates, total] = await Promise.all([
            Plate.find(filter)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .lean(),
            Plate.countDocuments(filter)
        ]);

        // Build response
        const response = buildPaginationResponse(plates, total, page, limit);

        res.status(200).json(response);
    } catch (error) {
        console.error('Error fetching plates:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách biển số',
            error: error.message
        });
    }
};

/**
 * @route   GET /api/plates/:id
 * @desc    Get single plate by ID
 * @access  Public
 */
export const getPlateById = async (req, res) => {
    try {
        const plate = await Plate.findById(req.params.id);

        if (!plate) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy biển số'
            });
        }

        res.status(200).json({
            success: true,
            data: plate
        });
    } catch (error) {
        console.error('Error fetching plate:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy thông tin biển số',
            error: error.message
        });
    }
};

/**
 * @route   POST /api/plates
 * @desc    Create new plate (Admin only)
 * @access  Private/Admin
 */
export const createPlate = async (req, res) => {
    try {
        const {
            plateNumber,
            province,
            vehicleType,
            plateType,
            plateColor,
            startingPrice,
            description
        } = req.body;

        // Check if plate number already exists
        const existingPlate = await Plate.findOne({ plateNumber });
        if (existingPlate) {
            return res.status(400).json({
                success: false,
                message: 'Biển số đã tồn tại'
            });
        }

        const plate = await Plate.create({
            plateNumber,
            province,
            vehicleType,
            plateType,
            plateColor,
            startingPrice,
            description,
            status: 'available'
        });

        res.status(201).json({
            success: true,
            message: 'Tạo biển số thành công',
            data: plate
        });
    } catch (error) {
        console.error('Error creating plate:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi tạo biển số',
            error: error.message
        });
    }
};

/**
 * @route   PUT /api/plates/:id
 * @desc    Update plate (Admin only)
 * @access  Private/Admin
 */
export const updatePlate = async (req, res) => {
    try {
        const {
            province,
            vehicleType,
            plateType,
            plateColor,
            startingPrice,
            description,
            status
        } = req.body;

        const plate = await Plate.findById(req.params.id);

        if (!plate) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy biển số'
            });
        }

        // Update fields
        if (province) plate.province = province;
        if (vehicleType) plate.vehicleType = vehicleType;
        if (plateType) plate.plateType = plateType;
        if (plateColor) plate.plateColor = plateColor;
        if (startingPrice !== undefined) plate.startingPrice = startingPrice;
        if (description !== undefined) plate.description = description;
        if (status) plate.status = status;

        await plate.save();

        res.status(200).json({
            success: true,
            message: 'Cập nhật biển số thành công',
            data: plate
        });
    } catch (error) {
        console.error('Error updating plate:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi cập nhật biển số',
            error: error.message
        });
    }
};

/**
 * @route   DELETE /api/plates/:id
 * @desc    Delete plate (Admin only)
 * @access  Private/Admin
 */
export const deletePlate = async (req, res) => {
    try {
        const plate = await Plate.findById(req.params.id);

        if (!plate) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy biển số'
            });
        }

        // Check if plate is in auction
        if (plate.status === 'in_auction') {
            return res.status(400).json({
                success: false,
                message: 'Không thể xóa biển số đang trong phiên đấu giá'
            });
        }

        await plate.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Xóa biển số thành công'
        });
    } catch (error) {
        console.error('Error deleting plate:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi xóa biển số',
            error: error.message
        });
    }
};

/**
 * @route   GET /api/plates/stats
 * @desc    Get plate statistics
 * @access  Public
 */
export const getPlateStats = async (req, res) => {
    try {
        const [
            total,
            available,
            inAuction,
            sold,
            cars,
            motorcycles,
            typeStats
        ] = await Promise.all([
            Plate.countDocuments(),
            Plate.countDocuments({ status: 'available' }),
            Plate.countDocuments({ status: 'in_auction' }),
            Plate.countDocuments({ status: 'sold' }),
            Plate.countDocuments({ vehicleType: 'car' }),
            Plate.countDocuments({ vehicleType: 'motorcycle' }),
            Plate.aggregate([
                {
                    $group: {
                        _id: '$plateType',
                        count: { $sum: 1 }
                    }
                }
            ])
        ]);

        const stats = {
            total,
            byStatus: {
                available,
                inAuction,
                sold
            },
            byVehicleType: {
                cars,
                motorcycles
            },
            byPlateType: typeStats.reduce((acc, item) => {
                acc[item._id] = item.count;
                return acc;
            }, {})
        };

        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error fetching plate stats:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy thống kê biển số',
            error: error.message
        });
    }
};
