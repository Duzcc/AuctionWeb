import Room from '../../models/Room.model.js';

const roomsData = [
    {
        roomName: "Phòng đấu giá số 1 - Hà Nội",
        location: "Số 123 Đường Láng, Quận Đống Đa, Hà Nội",
        capacity: 200,
        description: "Phòng đấu giá chính tại Hà Nội, được trang bị đầy đủ thiết bị hiện đại",
        isActive: true
    },
    {
        roomName: "Phòng đấu giá số 2 - Hà Nội",
        location: "Số 45 Phố Huế, Quận Hai Bà Trưng, Hà Nội",
        capacity: 150,
        description: "Phòng đấu giá phụ tại Hà Nội",
        isActive: true
    },
    {
        roomName: "Phòng đấu giá TP.HCM",
        location: "Số 789 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh",
        capacity: 250,
        description: "Phòng đấu giá quy mô lớn tại TP.HCM",
        isActive: true
    },
    {
        roomName: "Phòng đấu giá Đà Nẵng",
        location: "Số 56 Bạch Đằng, Quận Hải Châu, Đà Nẵng",
        capacity: 120,
        description: "Phòng đấu giá khu vực miền Trung",
        isActive: true
    },
    {
        roomName: "Phòng đấu giá Hải Phòng",
        location: "Số 234 Lê Lợi, Quận Ngô Quyền, Hải Phòng",
        capacity: 100,
        description: "Phòng đấu giá tại Hải Phòng",
        isActive: true
    },
    {
        roomName: "Phòng đấu giá Cần Thơ",
        location: "Số 67 Hai Bà Trưng, Quận Ninh Kiều, Cần Thơ",
        capacity: 100,
        description: "Phòng đấu giá khu vực miền Tây",
        isActive: true
    },
    {
        roomName: "Phòng đấu giá Huế",
        location: "Số 12 Lê Duẩn, Thành phố Huế",
        capacity: 80,
        description: "Phòng đấu giá tại Huế",
        isActive: true
    },
    {
        roomName: "Phòng đấu giá trực tuyến 1",
        location: "Online",
        capacity: 1000,
        description: "Phòng đấu giá trực tuyến, hỗ trợ tham gia từ xa",
        isActive: true
    }
];

/**
 * Seed rooms data
 * @param {boolean} clean - Whether to clean existing data
 */
export async function seedRooms(clean = false) {
    try {
        if (clean) {
            await Room.deleteMany({});
            console.log('   ✓ Cleared existing rooms');
        }

        const rooms = await Room.insertMany(roomsData);
        console.log(`   ✓ Created ${rooms.length} rooms`);

        return rooms;
    } catch (error) {
        console.error('   ✗ Error seeding rooms:', error.message);
        throw error;
    }
}
