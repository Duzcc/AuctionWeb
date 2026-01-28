import '../config/database.js'; // This already loads .env and connects
import User from '../models/User.model.js';

const createAdmin = async () => {
    try {
        const adminEmail = 'admin@prmindx.com';
        const adminPass = 'Admin123!';

        const existing = await User.findOne({ email: adminEmail });
        if (existing) {
            console.log('✅ Admin already exists');
            process.exit(0);
        }

        const admin = new User({
            username: 'admin',
            email: adminEmail,
            password: adminPass,
            role: 'admin',
            fullName: 'System Administrator',
            isVerified: true,
            isProfileComplete: true
        });

        await admin.save();
        console.log('🎉 Admin created!');
        console.log(`Email: ${adminEmail}`);
        console.log(`Password: ${adminPass}`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

// Give DB time to connect
setTimeout(createAdmin, 2000);
