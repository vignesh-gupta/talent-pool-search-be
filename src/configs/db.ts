import mongoose from "mongoose";
import { config } from "./config";
import logger from "../utils/logger";
let connection = null;

export const connectDB = async () => {
  try {
    if (connection) {
      logger.info("Reusing existing MongoDB connection");
      return connection;
    }

    connection = await mongoose.connect(config.mongoUri);
    logger.info("MongoDB connected successfully");
    return connection;
  } catch (error) {
    logger.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

// Handle unexpected disconnections
mongoose.connection.on("disconnected", () => {
  logger.warn("MongoDB disconnected! Reconnecting...");
  connection = null;
  setTimeout(connectDB, 5000);
});

mongoose.connection.on("error", (err) => {
  logger.error(`MongoDB connection error: ${err.message}`);
  connection = null;
  setTimeout(connectDB, 5000);
});

// If Node process ends, close the MongoDB connection
process.on("SIGINT", async () => {
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.close();
    logger.info("MongoDB connection closed due to app termination");
  }
  process.exit(0);
});

export const getConnection = () => connection;
