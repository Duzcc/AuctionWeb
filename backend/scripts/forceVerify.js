import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.model.js';
import connectDB from '../config/database.js';

dotenv.config();

async function forceVerifyAdmin() {
    try {
        await connectDB();
        console.log('\n🔧 Force verifying admin accounts...\n');

        // Verify admin
        const adminUpdate = await User.findOneAndUpdate(
            { email: 'admin@auction.com' },
            {
                $set: {
                    isVerified: true,
                    isProfileComplete: true,
                    status: 'active'
                }
            },
            { new: true }
        );

        if (adminUpdate) {
            console.log('✅ Admin verified:', adminUpdate.email, '| isVerified:', adminUpdate.isVerified);
        } else {
            console.log('❌ Admin user not found');
        }

        // Verify test user
        const userUpdate = await User.findOneAndUpdate(
            { email: 'user@test.com' },
            {
                $set: {
                    isVerified: true,
                    isProfileComplete: true
                }
            },
            { new: true }
        );

        if (userUpdate) {
            console.log('✅ Test user verified:', userUpdate.email, '| isVerified:', userUpdate.isVerified);
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

forceVerifyAdmin();
