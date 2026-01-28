import dotenv from 'dotenv';
import connectDB from '../../config/database.js';
import { seedRooms } from './seedRooms.js';
import { seedPlates } from './seedPlates.js';
import { seedSessions } from './seedSessions.js';

// Load environment variables
dotenv.config();

/**
 * Main seeding function
 */
async function seedDatabase() {
    const clean = process.argv.includes('--clean');
    const itemsCount = parseInt(process.argv.find(arg => arg.startsWith('--count='))?.split('=')[1]) || 1000;

    console.log('\n🌱 Starting database seeding...\n');
    console.log(`   Options: ${clean ? 'CLEAN MODE (will delete existing data)' : 'APPEND MODE'}\n`);

    try {
        // Connect to database
        await connectDB();
        console.log('');

        // Seed in order (due to dependencies)
        console.log('📍 Step 1: Seeding rooms...');
        const rooms = await seedRooms(clean);
        console.log('');

        console.log('🚗 Step 2: Seeding license plates and assets...');
        const seededData = await seedPlates(itemsCount, clean);
        // seededData is { cars: [], motorbikes: [], assets: [] }
        console.log('');

        console.log('📅 Step 3: Seeding auction sessions...');
        const sessions = await seedSessions(rooms, seededData, clean);
        console.log('');

        console.log('✅ Database seeding completed successfully!\n');
        console.log('📊 Summary:');
        console.log(`   - Rooms: ${rooms.length}`);
        console.log(`   - Cars: ${seededData.cars.length}`);
        console.log(`   - Motorbikes: ${seededData.motorbikes.length}`);
        console.log(`   - Assets: ${seededData.assets.length}`);
        console.log(`   - Sessions: ${sessions.length}`);
        console.log('');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Error during seeding:', error);
        process.exit(1);
    }
}

// Run seeder
seedDatabase();
