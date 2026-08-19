// import 'dotenv/config'
import './env.js';
import mongoose from 'mongoose';
import dns from 'dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);

/**
 * Connects to MongoDB using the URI from environment variables.
 * We exit the process on failure rather than let the server run
 * in a broken half-alive state — a server that "starts" but can't
 * talk to its database is worse than one that fails loudly and fast.
 */
export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // fail fast instead of hanging on a dead DB
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};
