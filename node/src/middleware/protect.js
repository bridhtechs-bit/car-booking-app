/**
 * ========================================
 * AUTHENTICATION MIDDLEWARE
 * ========================================
 * Protects routes requiring authentication
 * Verifies JWT token and attaches user to request
 */

import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import logger from "../utils/logger.js";
import { isTokenBlacklisted } from "../config/refreshToken.js";

/**
 * Protect - Verify JWT token and attach user to request
 * Accepts token from:
 * 1. Authorization header: "Bearer token"
 * 2. Cookies (httpOnly)
 */
export const protect = async (req, res, next) => {
  try {
    let token;

    // Extract token from Authorization header or cookies
    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.slice(7); // Remove "Bearer "
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization) {
      token = req.headers.authorization; // Direct token
    }

    if (!token) {
      logger.warn("No authentication token provided", { ip: req.ip });
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: "No token provided. Authentication is required",
      });
    }

    if (isTokenBlacklisted(token)) {
      logger.warn("Revoked token attempted", { ip: req.ip });
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: "Token has been revoked. Please log in again",
      });
    }

    // Verify token signature and expiration
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user in database
    const user = await User.findById(decoded.id);
    if (!user) {
      logger.warn("User not found for token", { userId: decoded.id });
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: "User no longer exists",
      });
    }

    // Attach user to request for use in controllers
    req.user = {
      _id: user._id,
      id: user._id,
      role: user.role || "user",
      email: user.email,
      name: user.name,
    };

    next();
  } catch (error) {
    let message = "Invalid token";

    if (error.name === "TokenExpiredError") {
      message = "Token has expired";
      logger.warn("Token expired", { error: error.message });
    } else if (error.name === "JsonWebTokenError") {
      message = "Invalid token signature";
      logger.warn("Invalid token signature", { error: error.message });
    } else {
      logger.error("Authentication error", error);
    }

    res.status(401).json({
      success: false,
      statusCode: 401,
      message: message,
    });
  }
};

/**
 * Admin Protect - Verify user is admin
 * Should be used AFTER protect middleware
 */
export const adminProtect = (req, res, next) => {
  if (!req.user) {
    logger.warn("User not authenticated in adminProtect");
    return res.status(401).json({
      success: false,
      statusCode: 401,
      message: "Authentication required",
    });
  }

  if (req.user.role !== "admin") {
    logger.warn("Non-admin user tried admin action", {
      userId: req.user._id,
      userRole: req.user.role,
    });
    return res.status(403).json({
      success: false,
      statusCode: 403,
      message: `Access denied. Admin role required. Your role: ${req.user.role}`,
    });
  }

  next();
};

//owner protect - Verify user is owner or admin
export const ownerProtect = (req, res, next) => {
  if (!req.user) {
    logger.warn("User not authenticated in ownerProtect");
    return res.status(401).json({
      success: false,
      statusCode: 401,
      message: "Authentication required",
    });
  }

  if (req.user.role !== "owner" && req.user.role !== "admin") {
    logger.warn("Non-owner user tried owner action", {
      userId: req.user._id,
      userRole: req.user.role,
    });
    return res.status(403).json({
      success: false,
      statusCode: 403,
      message: `Access denied. Owner or admin role required. Your role: ${req.user.role}`,
    });
  }

  next();
};


export default { protect, adminProtect, ownerProtect };
