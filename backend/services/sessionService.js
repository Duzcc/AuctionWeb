import Session from '../models/Session.model.js';
import SessionPlate from '../models/SessionPlate.model.js';
import Room from '../models/Room.model.js';
import CarPlate from '../models/CarPlate.model.js';
import MotorbikePlate from '../models/MotorbikePlate.model.js';
import Asset from '../models/Asset.model.js';

/**
 * Auto-create auction session for a specific plate
 * @param {String} plateId - ID of the plate (CarPlate, MotorbikePlate, or Asset)
 * @param {String} plateType - Type of plate: 'CarPlate', 'MotorbikePlate', or 'Asset'
 * @param {Object} options - Optional configuration
 * @param {Number} options.daysUntilStart - Days until auction starts (default: 3)
 * @param {Number} options.durationMinutes - Auction duration in minutes (default: 60)
 * @param {Number} options.depositAmount - Deposit amount (default: 40000000)
 * @returns {Object} Created session and sessionPlate
 */
export const autoCreateSessionForPlate = async (plateId, plateType, options = {}) => {
    try {
        // Input validation
        if (!plateId) {
            throw new Error('plateId is required');
        }
        if (!plateType) {
            throw new Error('plateType is required');
        }
        if (!['CarPlate', 'MotorbikePlate', 'Asset'].includes(plateType)) {
            throw new Error(`Invalid plateType: ${plateType}. Must be CarPlate, MotorbikePlate, or Asset`);
        }

        const {
            daysUntilStart = 3,
            durationMinutes = 60,
            depositAmount = 40000000
        } = options;

        // Validate options
        if (daysUntilStart < 0) {
            throw new Error('daysUntilStart must be non-negative');
        }
        if (durationMinutes <= 0) {
            throw new Error('durationMinutes must be positive');
        }
        if (depositAmount < 0) {
            throw new Error('depositAmount must be non-negative');
        }

        // 1. Get the plate document
        let PlateModel;
        switch (plateType) {
            case 'CarPlate':
                PlateModel = CarPlate;
                break;
            case 'MotorbikePlate':
                PlateModel = MotorbikePlate;
                break;
            case 'Asset':
                PlateModel = Asset;
                break;
            default:
                throw new Error(`Invalid plate type: ${plateType}`);
        }

        const plate = await PlateModel.findById(plateId);
        if (!plate) {
            throw new Error(`${plateType} not found with ID: ${plateId}`);
        }

        console.log(`📋 Checking session for plate: ${plate.plateNumber || plate.name}`);

        // 2. Check if session already exists for this plate (advanced check)
        const existingSessionPlate = await SessionPlate.findOne({
            plateId: plate._id,
            status: { $in: ['pending', 'bidding'] }
        }).populate('sessionId');

        if (existingSessionPlate && existingSessionPlate.sessionId) {
            const session = existingSessionPlate.sessionId;

            // Check if session is still valid (not ended)
            const now = new Date();
            if (session.endTime && new Date(session.endTime) > now) {
                console.log(`ℹ️  Session already exists for plate ${plate.plateNumber || plate.name}: ${session.sessionName}`);
                return {
                    session: session,
                    sessionPlate: existingSessionPlate,
                    isNew: false,
                    message: 'Using existing active session'
                };
            }
        }

        // 3. Check if plate is already sold or unavailable
        if (plate.status === 'sold') {
            throw new Error(`Plate ${plate.plateNumber || plate.name} is already sold`);
        }

        // 4. Find or create appropriate room based on plate type
        let room = await findOrCreateRoomForType(plateType);

        console.log(`📍 Selected room: ${room.roomName} (${room.roomType})`);

        // 5. Calculate session timing
        const now = new Date();
        const startTime = new Date(now.getTime() + daysUntilStart * 24 * 60 * 60 * 1000);
        const endTime = new Date(startTime.getTime() + durationMinutes * 60 * 1000);

        // Registration open immediately, close 1 hour before auction starts
        const registrationStart = now;
        const registrationEnd = new Date(startTime.getTime() - 60 * 60 * 1000);

        // 6. Create new session
        console.log(`🆕 Creating new session for ${plate.plateNumber || plate.name}...`);

        const newSession = await Session.create({
            sessionName: `Đấu giá ${plate.plateNumber || plate.name}`,
            roomId: room._id,
            startTime,
            endTime,
            registrationStart,
            registrationEnd,
            status: 'registration_open',
            depositAmount: depositAmount,
            description: `Phiên đấu giá tự động cho ${plate.plateNumber || plate.name}`
        });

        // 7. Create SessionPlate
        const sessionPlate = await SessionPlate.create({
            sessionId: newSession._id,
            plateId: plate._id,
            itemType: plateType,
            plateNumber: plate.plateNumber || plate.name,
            orderNumber: 1,
            startingPrice: plate.startingPrice || 0,
            currentPrice: plate.startingPrice || 0,
            priceStep: plate.priceStep || 1000000, // Default 1M VND
            status: 'pending',
            auctionStartTime: startTime,
            auctionEndTime: endTime
        });

        // 8. Update plate status to 'in_auction'
        await PlateModel.findByIdAndUpdate(plate._id, {
            status: 'in_auction',
            updatedAt: new Date()
        });

        console.log(`✅ Successfully created session for ${plate.plateNumber || plate.name}`);
        console.log(`   Session ID: ${newSession._id}`);
        console.log(`   Session Name: ${newSession.sessionName}`);
        console.log(`   Start Time: ${startTime.toISOString()}`);

        return {
            session: newSession,
            sessionPlate: sessionPlate,
            isNew: true,
            message: 'Successfully created new auction session'
        };

    } catch (error) {
        console.error('❌ Error auto-creating session:', error.message);
        console.error('Stack trace:', error.stack);
        throw error;
    }
};

/**
 * Find or create session for a plate
 * Will not create duplicate sessions for the same plate
 */
export const findOrCreateSessionForPlate = async (plateId, plateType, options = {}) => {
    return await autoCreateSessionForPlate(plateId, plateType, options);
};

/**
 * Find or create appropriate room for a given plate type
 * @param {String} plateType - 'CarPlate', 'MotorbikePlate', or 'Asset'
 * @returns {Object} Room document
 */
async function findOrCreateRoomForType(plateType) {
    // 1. Try to find specialized room of matching type (with load balancing)
    let room = await Room.findOne({
        roomType: plateType,
        isActive: true
    }).sort({ 'statistics.totalSessions': 1 }); // Load balancing: choose room with fewest sessions

    if (room) {
        console.log(`✅ Found specialized ${plateType} room: ${room.roomName}`);
        return room;
    }

    // 2. Fallback to general room
    room = await Room.findOne({
        roomType: 'General',
        isActive: true
    });

    if (room) {
        console.log(`ℹ️  Using general room: ${room.roomName}`);
        return room;
    }

    // 3. Create default specialized room if none exists
    console.log(`🆕 Creating default ${plateType} room...`);
    return await createDefaultRoomForType(plateType);
}

/**
 * Create default room configuration for a specific type
 * @param {String} roomType - 'CarPlate', 'MotorbikePlate', or 'Asset'
 * @returns {Object} Created room document
 */
async function createDefaultRoomForType(roomType) {
    const roomConfigs = {
        'CarPlate': {
            roomName: 'Phòng Đấu Giá Biển Số Xe Hơi',
            roomType: 'CarPlate',
            specialization: 'Biển số xe hơi cao cấp',
            location: 'Online',
            capacity: 500,
            description: 'Phòng chuyên đấu giá biển số xe hơi ngũ quý, tứ quý, sảnh tiến và các biển đẹp',
            bannerImage: '/assets/banners/car-auction-banner.jpg',
            theme: {
                primaryColor: '#1E40AF',   // Blue
                secondaryColor: '#3B82F6',
                backgroundImage: ''
            },
            isActive: true
        },
        'MotorbikePlate': {
            roomName: 'Phòng Đấu Giá Biển Số Xe Máy',
            roomType: 'MotorbikePlate',
            specialization: 'Biển số xe máy đẹp',
            location: 'Online',
            capacity: 400,
            description: 'Phòng chuyên đấu giá biển số xe máy ngũ quý, dễ nhớ, phong thủy tốt',
            bannerImage: '/assets/banners/motorbike-auction-banner.jpg',
            theme: {
                primaryColor: '#DC2626',   // Red
                secondaryColor: '#EF4444',
                backgroundImage: ''
            },
            isActive: true
        },
        'Asset': {
            roomName: 'Phòng Đấu Giá Tài Sản',
            roomType: 'Asset',
            specialization: 'Bất động sản và tài sản giá trị',
            location: 'Hybrid (Online + Offline)',
            capacity: 200,
            description: 'Phòng đấu giá bất động sản, đất đai, tài sản giá trị cao',
            bannerImage: '/assets/banners/asset-auction-banner.jpg',
            theme: {
                primaryColor: '#059669',   // Green
                secondaryColor: '#10B981',
                backgroundImage: ''
            },
            isActive: true
        },
        'General': {
            roomName: 'Phòng Đấu Giá Tổng Hợp',
            roomType: 'General',
            specialization: 'Đa dạng sản phẩm',
            location: 'Online',
            capacity: 1000,
            description: 'Phòng đấu giá tổng hợp cho tất cả các loại sản phẩm',
            bannerImage: '',
            theme: {
                primaryColor: '#D4AF37',   // Gold
                secondaryColor: '#1F2937',
                backgroundImage: ''
            },
            isActive: true
        }
    };

    const config = roomConfigs[roomType] || roomConfigs['General'];
    const room = await Room.create(config);

    console.log(`✅ Created default room: ${room.roomName}`);
    return room;
}

export default {
    autoCreateSessionForPlate,
    findOrCreateSessionForPlate
};
