import mongoose from 'mongoose';
import SessionPlate from '../models/SessionPlate.model.js';
import dotenv from 'dotenv';
dotenv.config();

const uri = "mongodb+srv://vduc31100_db_user:xOnft2rr7RbqFO13@webdevelopment.aecdtt6.mongodb.net/auctions_db";

async function run() {
    await mongoose.connect(uri);
    
    // Find the most recent SessionPlate
    const plate = await SessionPlate.findOne().sort({ createdAt: -1 });
    if (plate) {
        plate.plateNumber = '29A-555.55'; // Using standard format or what user asked
        // User asked for "29A.55555"
        plate.plateNumber = '29A.55555';
        await plate.save();
        console.log(`Updated plate ${plate._id} to 29A.55555`);
    } else {
        console.log("No SessionPlates found.");
    }
    
    mongoose.disconnect();
}

run().catch(console.error);
