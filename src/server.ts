import app from "./app";
import { config } from "./configs/config";
import { connectDB } from "./configs/db";
import logger from "./utils/logger";

// Connect to database
connectDB()
  .then(() => {
    // Start server
    const server = app.listen(config.port, () =>
      logger.info(`Server running in ${config.env} mode on port ${config.port}`)
    );

    // Handle unhandled promise rejections
    process.on("unhandledRejection", (err: Error) => {
      logger.error(`Unhandled Rejection: ${err.message}`);
      // Close server & exit process
      server.close(() => process.exit(1));
    });

    // Handle uncaught exceptions
    process.on("uncaughtException", (err: Error) => {
      logger.error(`Uncaught Exception: ${err.message}`);
      // Close server & exit process
      server.close(() => process.exit(1));
    });
  })
  .catch((err: Error) => {
    logger.error(`Database connection failed: ${err.message}`);
    process.exit(1);
  });
