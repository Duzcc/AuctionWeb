import Room from '../../models/Room.model.js';

const professionalRooms = [
    {
        roomName: 'Phòng Xe Hơi Cao Cấp',
        roomType: 'CarPlate',
        specialization: 'Biển số xe hơi VIP',
        location: 'Online',
        capacity: 500,
        description: 'Chuyên đấu giá biển số xe hơi ngũ quý, tứ quý, sảnh tiến cao cấp. Phòng được trang bị hệ thống đấu giá hiện đại, hỗ trợ livestream chất lượng cao.',
        bannerImage: '/assets/banners/car-auction-banner.jpg',
        theme: {
            primaryColor: '#1E40AF',   // Blue for elegance
            secondaryColor: '#3B82F6',
            backgroundImage: ''
        },
        isActive: true,
        settings: {
            allowChat: true,
            maxParticipants: 500,
            autoStartDelay: 30,
            enableSoundEffects: true,
            enableNotifications: true
        }
    },
    {
        roomName: 'Phòng Xe Máy Phân Khối Lớn',
        roomType: 'MotorbikePlate',
        specialization: 'Biển số xe máy đẹp',
        location: 'Online',
        capacity: 400,
        description: 'Chuyên đấu giá biển số xe máy ngũ quý, biển đẹp, dễ nhớ. Đặc biệt phù hợp cho các chủ xe PKL và xe phân khối lớn.',
        bannerImage: '/assets/banners/motorbike-auction-banner.jpg',
        theme: {
            primaryColor: '#DC2626',   // Red for energy
            secondaryColor: '#EF4444',
            backgroundImage: ''
        },
        isActive: true,
        settings: {
            allowChat: true,
            maxParticipants: 400,
            autoStartDelay: 30,
            enableSoundEffects: true,
            enableNotifications: true
        }
    },
    {
        roomName: 'Phòng Tài Sản Giá Trị Cao',
        roomType: 'Asset',
        specialization: 'Bất động sản và tài sản',
        location: 'Hybrid (Online + Offline)',
        capacity: 200,
        description: 'Phòng đấu giá bất động sản, đất đai, tài sản giá trị. Hỗ trợ cả tham dự trực tiếp và online. Có chuyên viên tư vấn pháp lý.',
        bannerImage: '/assets/banners/asset-auction-banner.jpg',
        theme: {
            primaryColor: '#059669',   // Green for prosperity
            secondaryColor: '#10B981',
            backgroundImage: ''
        },
        isActive: true,
        settings: {
            allowChat: true,
            maxParticipants: 200,
            autoStartDelay: 60,        // Longer for high-value assets
            enableSoundEffects: true,
            enableNotifications: true
        }
    },
    {
        roomName: 'Phòng Đấu Giá Tổng Hợp',
        roomType: 'General',
        specialization: 'Đa dạng sản phẩm',
        location: 'Online',
        capacity: 1000,
        description: 'Phòng đấu giá tổng hợp cho tất cả các loại sản phẩm. Phù hợp cho các phiên đấu giá đặc biệt và sự kiện lớn.',
        bannerImage: '',
        theme: {
            primaryColor: '#D4AF37',   // Gold
            secondaryColor: '#1F2937',
            backgroundImage: ''
        },
        isActive: true,
        settings: {
            allowChat: true,
            maxParticipants: 1000,
            autoStartDelay: 30,
            enableSoundEffects: true,
            enableNotifications: true
        }
    }
];

/**
 * Seed professional auction rooms
 * @param {boolean} clean - Whether to clean existing rooms
 */
export async function seedProfessionalRooms(clean = false) {
    try {
        if (clean) {
            await Room.deleteMany({});
            console.log('   ✓ Cleared existing rooms');
        }

        const rooms = await Room.insertMany(professionalRooms);
        console.log(`   ✓ Created ${rooms.length} professional auction rooms`);

        return rooms;
    } catch (error) {
        console.error('   ✗ Error seeding professional rooms:', error.message);
        throw error;
    }
}
