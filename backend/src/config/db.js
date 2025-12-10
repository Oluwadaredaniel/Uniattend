// src/config/db.js

import mongoose from 'mongoose';
import { MONGO_URI } from './env.js';
import createSuperAdmin from './initialSetup.js'; // 👈 NEW IMPORT

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        
        // --- NEW: Run Initial Setup ---
        await createSuperAdmin();
        // ------------------------------

    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;