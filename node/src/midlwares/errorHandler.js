// Error Handler Middleware
// Catches errors and sends structured error responses

import logger from '../utils/logger.js';

const errorHandler = (err, req, res, next) => {
  // Default error values
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Prepare additional info for logging
  const additionalInfo = {
    method: req.method,
    path: req.originalUrl,
    ip: req.ip,
    timestamp: new Date().toISOString(),
  };

  // Handle validation errors
  if (err.name === "ValidationError") {
    statusCode = 400;
    const messages = Object.values(err.errors).map((e) => e.message);
    message = messages.join(", ");
  }

  // Handle duplicate key error
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyPattern)[0];
    message = `${field} already exists`;
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
  }

  // Handle cast errors
  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid ID";
  }

  // Log the error with detailed information
  logger.error(`${err.name || 'Error'}`, err, additionalInfo);

  // Send error response
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    ...(process.env.NODE_ENV === "development" && { 
      stack: err.stack,
      errorName: err.name,
      timestamp: new Date().toISOString()
    }),
  });
};

export default errorHandler;
