#!/usr/bin/env node

/**
 * Master seed script for Professional Auction System
 * Runs all seeders in correct order
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { seedProfessionalRooms } from './seeders/seedProfessionalRooms.js';
import { seedSamplePlatesWithImages } from './seeders/seedSamplePlates.js';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/auction-db';

async function runSeeds() {
    try {
        console.log('🌱 Starting Professional Auction System Seed...\n');

        // Connect to MongoDB
        console.log('📡 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // 1. Seed Professional Rooms
        console.log('🏢 Seeding Professional Auction Rooms...');
        await seedProfessionalRooms(true); // Clean existing rooms
        console.log('');

        // 2. Seed Sample Plates with Images
        console.log('🎨 Seeding Sample Plates with Images...');
        await seedSamplePlatesWithImages(false); // Don't clean, append
        console.log('');

        console.log('✅ All seeds completed successfully!\n');
        console.log('📊 Summary:');
        console.log('   - 4 Professional Auction Rooms created');
        console.log('   - Sample plates with images and features created');
        console.log('   - System ready for testing!\n');

    } catch (error) {
        console.error('❌ Seed failed:', error.message);
        console.error(error.stack);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log('👋 Disconnected from MongoDB');
        process.exit(0);
    }
}

// Run seeds
runSeeds();
