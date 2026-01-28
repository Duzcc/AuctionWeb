import Room from '../models/Room.model.js';

/**
 * @route   GET /api/rooms
 * @desc    Get all rooms
 * @access  Public
 */
export const getRooms = async (req, res) => {
    try {
        const filter = {};

        // Filter by active status
        if (req.query.isActive !== undefined) {
            filter.isActive = req.query.isActive === 'true';
        }

        const rooms = await Room.find(filter).sort('roomName');

        res.status(200).json({
            success: true,
            data: rooms
        });
    } catch (error) {
        console.error('Error fetching rooms:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách phòng',
            error: error.message
        });
    }
};

/**
 * @route   GET /api/rooms/:id
 * @desc    Get single room by ID
 * @access  Public
 */
export const getRoomById = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);

        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy phòng đấu giá'
            });
        }

        res.status(200).json({
            success: true,
            data: room
        });
    } catch (error) {
        console.error('Error fetching room:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy thông tin phòng',
            error: error.message
        });
    }
};

/**
 * @route   POST /api/rooms
 * @desc    Create new room (Admin only)
 * @access  Private/Admin
 */
export const createRoom = async (req, res) => {
    try {
        const { roomName, location, capacity, description } = req.body;

        const room = await Room.create({
            roomName,
            location,
            capacity,
            description,
            isActive: true
        });

        res.status(201).json({
            success: true,
            message: 'Tạo phòng đấu giá thành công',
            data: room
        });
    } catch (error) {
        console.error('Error creating room:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi tạo phòng đấu giá',
            error: error.message
        });
    }
};

/**
 * @route   PUT /api/rooms/:id
 * @desc    Update room (Admin only)
 * @access  Private/Admin
 */
export const updateRoom = async (req, res) => {
    try {
        const { roomName, location, capacity, description, isActive } = req.body;

        const room = await Room.findById(req.params.id);

        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy phòng đấu giá'
            });
        }

        if (roomName) room.roomName = roomName;
        if (location) room.location = location;
        if (capacity !== undefined) room.capacity = capacity;
        if (description !== undefined) room.description = description;
        if (isActive !== undefined) room.isActive = isActive;

        await room.save();

        res.status(200).json({
            success: true,
            message: 'Cập nhật phòng thành công',
            data: room
        });
    } catch (error) {
        console.error('Error updating room:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi cập nhật phòng',
            error: error.message
        });
    }
};
