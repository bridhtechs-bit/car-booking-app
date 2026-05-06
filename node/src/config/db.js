import mongoose from "mongoose";
import logger from "../utils/logger.js";

/**
 * Connect to MongoDB
 * Uses MONGODB_URI from environment variables
 */
const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    logger.success("✅ MongoDB connected successfully");
  } catch (error) {
    logger.error("❌ MongoDB Connection Error", error);
    throw error;
  }
};

export default connectDB;