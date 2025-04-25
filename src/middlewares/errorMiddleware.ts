import { NextFunction, Request, Response } from "express";
import { config } from "../configs/config";
import logger from "../utils/logger";
import { APIResponse } from "../types";
import { MongooseError } from "mongoose";
import mongoose from "mongoose";

interface ErrorWithCode extends Error {
  code?: number;
  keyValue?: Record<string, any>;
}

export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Error handling middleware
export const errorHandler = (
  err: ErrorWithCode,
  req: Request,
  res: Response<APIResponse<null>>,
  next: NextFunction
) => {
  // Log error
  logger.error(`${err.name}: ${err.message}`);
  if (config.env === "development") {
    logger.error(err.stack);
  }

  // Mongoose validation error
  if (err instanceof mongoose.Error.ValidationError) {
    const messages = Object.values(err.errors).map((val) => val.message);
    res.status(400).json({
      success: false,
      message: "Validation Error",
      errors: messages,
    });
    return;
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      success: false,
      message: `Duplicate field value entered: ${field}`,
    });
  }

  // JWT error
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }

  // JWT expired error
  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token expired",
    });
  }

  // Set status code
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);

  // Send error response
  res.json({
    success: false,
    message: err.message,
  });
};
