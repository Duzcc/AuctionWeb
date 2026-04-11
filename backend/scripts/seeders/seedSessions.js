import Session from '../../models/Session.model.js';
import SessionPlate from '../../models/SessionPlate.model.js';
import CarPlate from '../../models/CarPlate.model.js';
import MotorbikePlate from '../../models/MotorbikePlate.model.js';
import Asset from '../../models/Asset.model.js';

/**
 * Seed sessions data
 * @param {Array} rooms - Array of room documents
 * @param {Object} data - Object containing cars, motorbikes, and assets arrays
 * @param {boolean} clean - Whether to clean existing data
 */
export async function seedSessions(rooms, { cars = [], motorbikes = [], assets = [] }, clean = false) {
    try {
        if (clean) {
            await Session.deleteMany({});
            await SessionPlate.deleteMany({});
            console.log('   ✓ Cleared existing sessions and session plates');
        }

        if (!rooms || rooms.length === 0) {
            throw new Error('Rooms data is required');
        }

        const now = new Date();
        const sessions = [];

        // Helper to create session objects
        const createSession = (name, relativeStartDay, roomId, type) => {
            const startTime = new Date(now);
            startTime.setDate(startTime.getDate() + relativeStartDay);
            startTime.setHours(9, 0, 0, 0);

            const endTime = new Date(startTime);
            endTime.setHours(17, 0, 0, 0);

            const registrationStart = new Date(startTime);
            registrationStart.setDate(registrationStart.getDate() - 14);

            const registrationEnd = new Date(startTime);
            registrationEnd.setDate(registrationEnd.getDate() - 1);

            // Determine status
            let status = 'upcoming';
            if (relativeStartDay < 0) status = 'completed'; // Past
            else if (relativeStartDay === 0) status = 'ongoing'; // Today
            else {
                // Future logic
                if (now >= registrationStart && now <= registrationEnd) status = 'registration_open';
                else if (now > registrationEnd && now < startTime) status = 'registration_closed';
            }

            return {
                sessionName: name,
                roomId: roomId,
                startTime,
                endTime,
                registrationStart,
                registrationEnd,
                status,
                depositAmount: type === 'Asset' ? 50000000 : 10000000,
                description: `Phiên đấu giá ${type} - ${status}`
            };
        };

        // Create sessions for each type
        // Strategy: 
        // - Cars: 1 Ongoing, 2 Past, 5 Upcoming
        // - Motorbikes: 1 Ongoing, 2 Past, 5 Upcoming
        // - Assets: 1 Ongoing, 1 Past, 2 Upcoming (fewer assets)

        // --- CAR SESSIONS ---
        sessions.push(createSession('Đấu giá Ô tô (Đang diễn ra)', 0, rooms[0]._id, 'Ô tô'));
        sessions.push(createSession('Đấu giá Ô tô (Tuần trước)', -7, rooms[0]._id, 'Ô tô'));
        sessions.push(createSession('Đấu giá Ô tô (2 tuần trước)', -14, rooms[0]._id, 'Ô tô'));
        for (let i = 1; i <= 5; i++) {
            sessions.push(createSession(`Đấu giá Ô tô (Sắp tới ${i})`, i * 3, rooms[0]._id, 'Ô tô'));
        }

        // --- MOTORBIKE SESSIONS ---
        sessions.push(createSession('Đấu giá Xe máy (Đang diễn ra)', 0, rooms[1]._id, 'Xe máy'));
        sessions.push(createSession('Đấu giá Xe máy (Tuần trước)', -7, rooms[1]._id, 'Xe máy'));
        sessions.push(createSession('Đấu giá Xe máy (2 tuần trước)', -14, rooms[1]._id, 'Xe máy'));
        for (let i = 1; i <= 5; i++) {
            sessions.push(createSession(`Đấu giá Xe máy (Sắp tới ${i})`, i * 3 + 1, rooms[1]._id, 'Xe máy')); // Offset slightly
        }

        // --- ASSET SESSIONS ---
        sessions.push(createSession('Đấu giá Tài sản (Đang diễn ra)', 0, rooms[2]._id, 'Tài sản'));
        sessions.push(createSession('Đấu giá Tài sản (Tháng trước)', -30, rooms[2]._id, 'Tài sản'));
        sessions.push(createSession('Đấu giá Tài sản (Sắp tới)', 10, rooms[2]._id, 'Tài sản'));


        const insertedSessions = await Session.insertMany(sessions);
        console.log(`   ✓ Created ${insertedSessions.length} sessions`);

        // Distribute Items to Sessions
        console.log(`   → Adding items to sessions...`);
        const sessionPlates = [];

        // Helper to distribute items
        const distributeItems = (items, sessionRegex, itemType, Model) => {
            const typeSessions = insertedSessions.filter(s => s.sessionName.includes(sessionRegex));
            let itemIndex = 0;

            typeSessions.forEach(session => {
                const itemsPerSession = Math.min(20, Math.floor(items.length / typeSessions.length)) || 5;

                for (let i = 0; i < itemsPerSession && itemIndex < items.length; i++) {
                    const item = items[itemIndex++];

                    let status = 'pending';
                    let { startingPrice } = item;
                    let currentPrice = startingPrice;
                    let finalPrice = null;

                    let auctionStartTime = null;
                    let auctionEndTime = null;

                    if (session.status === 'completed') {
                        status = Math.random() < 0.7 ? 'sold' : 'unsold';
                        if (status === 'sold') {
                            finalPrice = currentPrice + Math.floor(Math.random() * currentPrice * 0.5);
                            currentPrice = finalPrice;
                        }
                    } else if (session.status === 'ongoing') {
                        // Force the very first item (our 29A.55555) to be 'pending' so the user can test the Admin "Force Start" flow interactively
                        if (itemIndex - 1 === 0 && itemType === 'CarPlate') {
                            status = 'pending';
                        } 
                        else if (i < 5 && Math.random() < 0.5) {
                            status = 'bidding';
                            currentPrice = startingPrice + Math.floor(Math.random() * startingPrice * 0.2);
                            // To prevent time errors, mock the start and end times
                            auctionStartTime = new Date();
                            // End time 60 minutes from now
                            auctionEndTime = new Date(auctionStartTime.getTime() + 60 * 60 * 1000); 
                        }
                    }

                    sessionPlates.push({
                        sessionId: session._id,
                        plateId: item._id,
                        itemType: itemType, // 'CarPlate', 'MotorbikePlate', 'Asset'
                        plateNumber: item.plateNumber || item.name, // Use name for assets
                        orderNumber: i + 1,
                        startingPrice: item.startingPrice, // Required field
                        priceStep: item.priceStep || 1000000, // Required field, default 1M VND
                        currentPrice,
                        finalPrice,
                        status,
                        auctionStartTime,
                        auctionEndTime
                    });
                }
            });
        };

        // Distribute Cars
        distributeItems(cars, 'Ô tô', 'CarPlate', CarPlate);

        // Distribute Motorbikes
        distributeItems(motorbikes, 'Xe máy', 'MotorbikePlate', MotorbikePlate);

        // Distribute Assets
        distributeItems(assets, 'Tài sản', 'Asset', Asset);

        const insertedSessionPlates = await SessionPlate.insertMany(sessionPlates);
        console.log(`   ✓ Added ${insertedSessionPlates.length} items to sessions`);

        // Update status of used items
        // We need to update 3 different collections now
        const updateStatus = async (Model, type) => {
            const ids = sessionPlates.filter(sp => sp.itemType === type).map(sp => sp.plateId);
            if (ids.length > 0) {
                await Model.updateMany({ _id: { $in: ids } }, { $set: { status: 'in_auction' } });
            }
        };

        await updateStatus(CarPlate, 'CarPlate');
        await updateStatus(MotorbikePlate, 'MotorbikePlate');
        await updateStatus(Asset, 'Asset');

        console.log(`   ✓ Updated items status to 'in_auction'`);

        return insertedSessions;
    } catch (error) {
        console.error('   ✗ Error seeding sessions:', error.message);
        throw error;
    }
}
