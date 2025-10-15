const mongoose = require("mongoose");

// Cache the MongoDB connection across serverless function invocations
let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
    // If we have a cached connection, use it
    if (cached.conn) {
        console.log('✅ Using cached MongoDB connection');
        return cached.conn;
    }

    // If we don't have a connection promise, create one
    if (!cached.promise) {
        const opts = {
            bufferCommands: false, // Disable mongoose buffering
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        };

        console.log('🔄 Creating new MongoDB connection...');
        
        cached.promise = mongoose.connect(process.env.MONGODB_URI, opts)
            .then((mongoose) => {
                console.log('✅ MongoDB connected successfully');
                console.log(`mongodb connection: ${mongoose.connection.host}`);
                return mongoose;
            })
            .catch((error) => {
                console.error('❌ db connection error:', error.message);
                cached.promise = null; // Reset promise on error
                throw error;
            });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
};

module.exports = connectDB;