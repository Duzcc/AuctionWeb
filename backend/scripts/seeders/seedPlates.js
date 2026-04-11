import CarPlate from '../../models/CarPlate.model.js';
import MotorbikePlate from '../../models/MotorbikePlate.model.js';
import Asset from '../../models/Asset.model.js';
import {
    generateCarPlate,
    generateMotorbikePlate,
    generatePrice,
    getAllProvinces,
    getAllPlateTypes
} from './plateGenerator.js';

/**
 * Seed plates and assets data
 * @param {number} totalItems - Base number for generation (used for cars/bikes)
 * @param {boolean} clean - Whether to clean existing data
 */
export async function seedPlates(totalItems = 1000, clean = false) {
    try {
        if (clean) {
            await CarPlate.deleteMany({});
            await MotorbikePlate.deleteMany({});
            await Asset.deleteMany({});
            console.log('   ✓ Cleared existing car plates, motorbike plates, and assets');
        }

        const provinces = getAllProvinces();
        const plateTypes = getAllPlateTypes();
        const plateColors = ['Biển trắng', 'Biển vàng'];

        // List of Northern Provinces for weighted generation (User Request)
        const NORTHERN_PROVINCES = [
            "Thành phố Hà Nội", "Thành phố Hải Phòng", "Quảng Ninh", "Bắc Ninh", "Hải Dương",
            "Hưng Yên", "Vĩnh Phúc", "Thái Nguyên", "Bắc Giang", "Phú Thọ", "Nam Định",
            "Thái Bình", "Hà Nam", "Ninh Bình", "Tuyên Quang", "Yên Bái", "Lào Cai",
            "Điện Biên", "Lai Châu", "Sơn La", "Hòa Bình", "Hà Giang", "Cao Bằng",
            "Bắc Kạn", "Lạng Sơn"
        ];

        // --- 1. Generate Car Plates ---
        const carPlates = [];
        const generatedCarNumbers = new Set();
        // Use full totalItems count for cars or a ratio? Let's use 70% of total for cars as before
        const numCars = Math.floor(totalItems * 0.7);
        console.log(`   → Generating ${numCars} car plates...`);

        const allProvincesList = [...provinces];

        for (let i = 0; i < numCars; i++) {
            let province;

            // Phase 1: Guaranteed Coverage
            if (i < allProvincesList.length) {
                province = allProvincesList[i];
            }
            // Phase 2: Weighted Distribution (90% Northern)
            else {
                if (Math.random() < 0.9) {
                    province = NORTHERN_PROVINCES[Math.floor(Math.random() * NORTHERN_PROVINCES.length)];
                    if (!provinces.includes(province)) province = provinces[Math.floor(Math.random() * provinces.length)];
                } else {
                    province = provinces[Math.floor(Math.random() * provinces.length)];
                }
            }

            // Weight distribution for plate types
            let plateType;
            const rand = Math.random();
            if (rand < 0.05) plateType = 'Ngũ quý';
            else if (rand < 0.10) plateType = 'Sảnh tiến';
            else if (rand < 0.25) plateType = 'Tứ quý';
            else if (rand < 0.35) plateType = 'Tam hoa';
            else if (rand < 0.45) plateType = 'Thần tài';
            else if (rand < 0.55) plateType = 'Lộc phát';
            else if (rand < 0.65) plateType = 'Ông địa';
            else if (rand < 0.75) plateType = 'Số gánh';
            else if (rand < 0.85) plateType = 'Lặp đôi';
            else plateType = 'Biển đẹp';

            const plateColor = plateColors[Math.floor(Math.random() * plateColors.length)];

            // Generate unique plate number
            let plateNumber;
            let attempts = 0;
            do {
                if (i === 0) {
                    province = 'Thành phố Hà Nội';
                    plateType = 'Ngũ quý';
                    plateNumber = '29A.55555';
                    break;
                }
                plateNumber = generateCarPlate(province, plateType);
                attempts++;
                if (attempts > 100) break;
            } while (generatedCarNumbers.has(plateNumber));

            if (attempts > 100 && i !== 0) continue;

            generatedCarNumbers.add(plateNumber);

            const startingPrice = generatePrice(plateType);

            carPlates.push({
                plateNumber,
                province,
                plateType,
                plateColor,
                startingPrice,
                status: 'available',
                description: `Biển số xe ô tô ${plateType.toLowerCase()} tại ${province}`
            });
        }

        // --- 2. Generate Motorbike Plates ---
        const motorbikePlates = [];
        const generatedBikeNumbers = new Set();
        const numMotorbikes = totalItems - numCars; // Remaining 30%
        console.log(`   → Generating ${numMotorbikes} motorcycle plates...`);

        for (let i = 0; i < numMotorbikes; i++) {
            let province;
            // Phase 1: Guaranteed Coverage (Reuse logic)
            if (i < allProvincesList.length) {
                province = allProvincesList[i];
            }
            // Phase 2: Weighted Distribution (90% Northern)
            else {
                if (Math.random() < 0.9) {
                    province = NORTHERN_PROVINCES[Math.floor(Math.random() * NORTHERN_PROVINCES.length)];
                    if (!provinces.includes(province)) province = provinces[Math.floor(Math.random() * provinces.length)];
                } else {
                    province = provinces[Math.floor(Math.random() * provinces.length)];
                }
            }

            // Weight distribution for plate types (same as cars for simplicity)
            let plateType;
            const rand = Math.random();
            if (rand < 0.03) plateType = 'Ngũ quý';
            else if (rand < 0.06) plateType = 'Sảnh tiến';
            else if (rand < 0.20) plateType = 'Tứ quý';
            else if (rand < 0.30) plateType = 'Tam hoa';
            else if (rand < 0.40) plateType = 'Thần tài';
            else if (rand < 0.50) plateType = 'Lộc phát';
            else if (rand < 0.60) plateType = 'Ông địa';
            else if (rand < 0.70) plateType = 'Số gánh';
            else if (rand < 0.80) plateType = 'Lặp đôi';
            else plateType = 'Biển đẹp';

            const plateColor = plateColors[Math.floor(Math.random() * plateColors.length)];

            let plateNumber;
            let attempts = 0;
            do {
                plateNumber = generateMotorbikePlate(province, plateType);
                attempts++;
                if (attempts > 100) break;
            } while (generatedBikeNumbers.has(plateNumber));

            if (attempts > 100) continue;

            generatedBikeNumbers.add(plateNumber);

            let startingPrice = generatePrice(plateType);
            startingPrice = Math.floor(startingPrice * 0.4); // 40% of car price

            motorbikePlates.push({
                plateNumber,
                province,
                plateType,
                plateColor,
                startingPrice,
                status: 'available',
                description: `Biển số xe máy ${plateType.toLowerCase()} tại ${province}`
            });
        }

        // --- 3. Generate Assets ---
        console.log(`   → Generating assets...`);
        const assets = [
            { name: "Du thuyền 5 sao Pelican", type: "Du thuyền", province: "Quảng Ninh", startingPrice: 5000000000, description: "Du thuyền hạng sang hạ thủy năm 2024" },
            { name: "Tranh sơn dầu 'Phố Cổ'", type: "Nghệ thuật", province: "Thành phố Hà Nội", startingPrice: 150000000, description: "Tác phẩm gốc của họa sĩ nổi tiếng" },
            { name: "Đồng hồ Rolex Daytona", type: "Trang sức", province: "Thành phố Hồ Chí Minh", startingPrice: 800000000, description: "Phiên bản giới hạn, đầy đủ giấy tờ" },
            { name: "Biệt thự nghỉ dưỡng Sapa", type: "Bất động sản", province: "Lào Cai", startingPrice: 12000000000, description: "View núi Fansipan, diện tích 500m2" },
            { name: "Vòng cổ kim cương PNJ", type: "Trang sức", province: "Thành phố Đà Nẵng", startingPrice: 250000000, description: "Kim cương tự nhiên 5 carat" },
            { name: "Sim số đẹp 098.888.8888", type: "Sim số", province: "Thành phố Hà Nội", startingPrice: 3000000000, description: "Sim bát quý đẳng cấp" }
        ];

        // Insert Data
        console.log(`   → Inserting data into separate collections...`);

        const insertedCars = await CarPlate.insertMany(carPlates);
        console.log(`   ✓ Created ${insertedCars.length} car plates`);

        const insertedBikes = await MotorbikePlate.insertMany(motorbikePlates);
        console.log(`   ✓ Created ${insertedBikes.length} motorbike plates`);

        const insertedAssets = await Asset.insertMany(assets);
        console.log(`   ✓ Created ${insertedAssets.length} assets`);

        // Statistics
        console.log(`\n   📊 Seeding Statistics:`);
        console.log(`      - Car Plates: ${insertedCars.length}`);
        console.log(`      - Motorbike Plates: ${insertedBikes.length}`);
        console.log(`      - Assets: ${insertedAssets.length}`);

        // Return all for checking (though index.js might need update if it expects a single array)
        return {
            cars: insertedCars,
            motorbikes: insertedBikes,
            assets: insertedAssets
        };

    } catch (error) {
        console.error('   ✗ Error seeding plates/assets:', error.message);
        throw error;
    }
}
