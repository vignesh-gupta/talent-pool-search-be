import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import profileRoute from "./routes/profiles-route";
import searchesRoute from "./routes/searches-route";

import { config as dotenvConfig } from "dotenv";
import { config } from "./configs/config";
import { errorHandler, notFound } from "./middlewares/errorMiddleware";
import logger from "./utils/logger";

const app = express();

dotenvConfig({ path: __dirname + "/.env" });

// Security headers
app.use(helmet());

// CORS
app.use(cors());

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Compression
app.use(compression());

// Request logger
if (config.env !== "test") {
  app.use(
    morgan(config.logs, {
      stream: {
        write: (message: string) => logger.http(message.trim()),
      },
    })
  );
}

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, please try again later",
  },
});
app.use("/api", limiter);

// API Health Check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.env,
  });
});

// API Routes
app.use("/api/v1/profiles", profileRoute);
app.use("/api/v1/searches", searchesRoute);

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

export default app;
