import CarPlate from '../../models/CarPlate.model.js';
import MotorbikePlate from '../../models/MotorbikePlate.model.js';
import Asset from '../../models/Asset.model.js';

/**
 * Sample CarPlates with images and complete information
 */
const sampleCarPlates = [
    {
        plateNumber: '30A-999.99',
        province: 'Hà Nội',
        plateType: 'Ngũ quý',
        plateColor: 'Biển trắng',
        startingPrice: 500000000,
        priceStep: 5000000,
        images: [
            'https://via.placeholder.com/800x600/1E40AF/ffffff?text=30A-999.99',
            'https://via.placeholder.com/800x600/3B82F6/ffffff?text=Detail+View'
        ],
        features: ['Ngũ quý 9', 'Dễ nhớ', 'Phong thủy tốt', 'Số VIP'],
        detailedDescription: 'Biển số ngũ quý 9 cực kỳ đẹp và hiếm. Phù hợp cho xe sang, mang lại may mắn và thịnh vượng. Biển trắng chính chủ, đầy đủ giấy tờ pháp lý.',
        status: 'available'
    },
    {
        plateNumber: '29A-888.88',
        province: 'Hà Nội',
        plateType: 'Tứ quý',
        plateColor: 'Biển trắng',
        startingPrice: 300000000,
        priceStep: 3000000,
        images: [
            'https://via.placeholder.com/800x600/1E40AF/ffffff?text=29A-888.88'
        ],
        features: ['Tứ quý 8', 'Phát tài phát lộc', 'Số đẹp'],
        detailedDescription: 'Biển số tứ quý 8 rất đẹp, mang ý nghĩa phát tài phát lộc. Phù hợp cho doanh nhân và những người làm kinh doanh.',
        status: 'available'
    },
    {
        plateNumber: '30G-777.77',
        province: 'Hà Nội',
        plateType: 'Ngũ quý',
        plateColor: 'Biển vàng',
        startingPrice: 250000000,
        priceStep: 2500000,
        images: [
            'https://via.placeholder.com/800x600/F59E0B/ffffff?text=30G-777.77'
        ],
        features: ['Ngũ quý 7', 'May mắn', 'Biển vàng'],
        detailedDescription: 'Biển số ngũ quý 7 biển vàng, rất hiếm và quý. Số 7 mang ý nghĩa may mắn và thành công.',
        status: 'available'
    }
];

/**
 * Sample MotorbikePlates with images
 */
const sampleMotorbikePlates = [
    {
        plateNumber: '29P1-888.88',
        province: 'Hà Nội',
        plateType: 'Tứ quý',
        plateColor: 'Biển trắng',
        startingPrice: 150000000,
        priceStep: 1500000,
        images: [
            'https://via.placeholder.com/800x600/DC2626/ffffff?text=29P1-888.88'
        ],
        features: ['Tứ quý 8', 'Phát tài', 'Dễ nhớ'],
        detailedDescription: 'Biển số xe máy tứ quý 8 đẹp, phù hợp cho các dòng xe PKL cao cấp. Mang lại may mắn và thịnh vượng.',
        status: 'available'
    },
    {
        plateNumber: '29H1-666.66',
        province: 'Hà Nội',
        plateType: 'Ngũ quý',
        plateColor: 'Biển trắng',
        startingPrice: 120000000,
        priceStep: 1000000,
        images: [
            'https://via.placeholder.com/800x600/DC2626/ffffff?text=29H1-666.66'
        ],
        features: ['Ngũ quý 6', 'Lộc lộc', 'Số đẹp'],
        detailedDescription: 'Biển số ngũ quý 6 cho xe máy, ý nghĩa lộc lộc, phát tài. Biển trắng đẹp, đầy đủ giấy tờ.',
        status: 'available'
    }
];

/**
 * Sample Assets with images and specifications
 */
const sampleAssets = [
    {
        name: 'Căn hộ chung cư Vinhomes',
        type: 'Bất động sản',
        province: 'Hà Nội',
        startingPrice: 5000000000,
        priceStep: 50000000,
        images: [
            'https://via.placeholder.com/800x600/059669/ffffff?text=Vinhomes+Apartment',
            'https://via.placeholder.com/800x600/10B981/ffffff?text=Living+Room',
            'https://via.placeholder.com/800x600/10B981/ffffff?text=Bedroom'
        ],
        specifications: {
            area: '120 m²',
            location: 'Vinhomes Smart City, Nam Từ Liêm, Hà Nội',
            condition: 'Mới 100%, chưa qua sử dụng',
            yearBuilt: 2023,
            legalStatus: 'Sổ đỏ chính chủ'
        },
        description: 'Căn hộ 3 phòng ngủ view công viên, nội thất cao cấp. Đầy đủ tiện ích: bể bơi, gym, công viên, trường học. Giá đầu tư hấp dẫn.',
        status: 'available'
    },
    {
        name: 'Đất nền KĐT Thanh Hà',
        type: 'Bất động sản',
        province: 'Hà Nội',
        startingPrice: 2000000000,
        priceStep: 20000000,
        images: [
            'https://via.placeholder.com/800x600/059669/ffffff?text=Land+Plot'
        ],
        specifications: {
            area: '100 m²',
            location: 'KĐT Thanh Hà, Hà Đông, Hà Nội',
            condition: 'Đất trống, đã san lấp',
            yearBuilt: null,
            legalStatus: 'Sổ đỏ đầy đủ'
        },
        description: 'Lô đất nền khu đô thị Thanh Hà, vị trí đẹp, hạ tầng hoàn chỉnh. Thích hợp xây nhà ở hoặc đầu tư.',
        status: 'available'
    }
];

/**
 * Seed sample plates with images and complete information
 * @param {boolean} clean - Whether to clean existing data
 */
export async function seedSamplePlatesWithImages(clean = false) {
    try {
        if (clean) {
            await CarPlate.deleteMany({});
            await MotorbikePlate.deleteMany({});
            await Asset.deleteMany({});
            console.log('   ✓ Cleared existing plates and assets');
        }

        // Seed CarPlates
        const carPlates = await CarPlate.insertMany(sampleCarPlates);
        console.log(`   ✓ Created ${carPlates.length} sample car plates with images`);

        // Seed MotorbikePlates
        const motorPlates = await MotorbikePlate.insertMany(sampleMotorbikePlates);
        console.log(`   ✓ Created ${motorPlates.length} sample motorbike plates with images`);

        // Seed Assets
        const assets = await Asset.insertMany(sampleAssets);
        console.log(`   ✓ Created ${assets.length} sample assets with images`);

        console.log(`   ✓ Total: ${carPlates.length + motorPlates.length + assets.length} products with rich data`);

        return { carPlates, motorPlates, assets };
    } catch (error) {
        console.error('   ✗ Error seeding sample plates:', error.message);
        throw error;
    }
}
