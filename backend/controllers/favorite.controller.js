import Favorite from '../models/Favorite.model.js';
import Plate from '../models/Plate.model.js';
import { getPaginationParams, getSortParams, buildPaginationResponse } from '../utils/pagination.utils.js';

/**
 * @route   GET /api/favorites
 * @desc    Get user's favorite plates
 * @access  Private
 */
export const getFavorites = async (req, res) => {
    try {
        const { page, limit, skip } = getPaginationParams(req.query);
        const sort = getSortParams(req.query.sortBy, '-addedDate');

        const [favorites, total] = await Promise.all([
            Favorite.find({ userId: req.user.id })
                .populate('plateId')
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .lean(),
            Favorite.countDocuments({ userId: req.user.id })
        ]);

        const response = buildPaginationResponse(favorites, total, page, limit);
        res.status(200).json(response);
    } catch (error) {
        console.error('Error fetching favorites:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách yêu thích',
            error: error.message
        });
    }
};

/**
 * @route   POST /api/favorites
 * @desc    Add plate to favorites
 * @access  Private
 */
export const addFavorite = async (req, res) => {
    try {
        const { plateId } = req.body;

        // Check if plate exists
        const plate = await Plate.findById(plateId);
        if (!plate) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy biển số'
            });
        }

        // Check if already in favorites
        const existing = await Favorite.findOne({
            userId: req.user.id,
            plateId
        });

        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'Biển số đã có trong danh sách yêu thích'
            });
        }

        const favorite = await Favorite.create({
            userId: req.user.id,
            plateId,
            plateNumber: plate.plateNumber
        });

        res.status(201).json({
            success: true,
            message: 'Đã thêm vào yêu thích',
            data: favorite
        });
    } catch (error) {
        console.error('Error adding favorite:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi thêm vào yêu thích',
            error: error.message
        });
    }
};

/**
 * @route   DELETE /api/favorites/:plateId
 * @desc    Remove plate from favorites
 * @access  Private
 */
export const removeFavorite = async (req, res) => {
    try {
        const favorite = await Favorite.findOneAndDelete({
            userId: req.user.id,
            plateId: req.params.plateId
        });

        if (!favorite) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy trong danh sách yêu thích'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Đã xóa khỏi yêu thích'
        });
    } catch (error) {
        console.error('Error removing favorite:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi xóa khỏi yêu thích',
            error: error.message
        });
    }
};

/**
 * @route   GET /api/favorites/check/:plateId
 * @desc    Check if plate is in user's favorites
 * @access  Private
 */
export const checkFavorite = async (req, res) => {
    try {
        const favorite = await Favorite.findOne({
            userId: req.user.id,
            plateId: req.params.plateId
        });

        res.status(200).json({
            success: true,
            data: {
                isFavorite: !!favorite
            }
        });
    } catch (error) {
        console.error('Error checking favorite:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi kiểm tra yêu thích',
            error: error.message
        });
    }
};
