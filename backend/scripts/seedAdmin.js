import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.model.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Config setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const adminEmail = process.env.ADMIN_EMAIL || 'admin@admin.com';
        const adminPass = process.env.ADMIN_PASSWORD || 'Admin123!';

        // Check if admin exists
        const existingAdmin = await User.findOne({ email: adminEmail });
        if (existingAdmin) {
            console.log('⚠️ Admin already exists');
            process.exit(0);
        }

        const admin = new User({
            username: 'admin',
            email: adminEmail,
            password: adminPass, // Pre-save hook will hash this
            role: 'admin',
            fullName: 'System Administrator',
            isVerified: true,
            isProfileComplete: true
        });

        await admin.save();
        console.log('Admin created successfully');
        console.log(`Email: ${adminEmail}`);
        console.log(`Password: ${adminPass}`);

        process.exit(0);
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
};

seedAdmin();
