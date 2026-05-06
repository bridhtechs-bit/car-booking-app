import jwt from 'jsonwebtoken';
import logger from '../utils/logger.js';

/**
 * Token Management System
 * - Generates access and refresh tokens
 * - Manages token lifecycle
 * - Handles token validation and revocation
 */

// Simple in-memory token blacklist (ideally use Redis in production)
// TODO: Implement Redis for production
const tokenBlacklist = new Set();

/**
 * Generate ACCESS TOKEN (short-lived)
 * Used to authenticate API requests
 * Expires in 7 days by default
 */
export const generateAccessToken = (userId, role = 'user') => {
  try {
    const token = jwt.sign(
      {
        id: userId,
        role,
        type: 'access',
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRE || '7d',
        issuer: 'car-booking-api',
        audience: 'car-booking-app',
      }
    );

    logger.info(`Access token generated for user ${userId}`);
    return token;
  } catch (error) {
    logger.error('Error generating access token', error);
    throw error;
  }
};

/**
 * Generate REFRESH TOKEN (long-lived)
 * Used to obtain new access token when current one expires
 * Expires in 30 days by default
 */
export const generateRefreshToken = (userId, role = 'user') => {
  try {
    const token = jwt.sign(
      {
        id: userId,
        role,
        type: 'refresh',
      },
      process.env.JWT_REFRESH_SECRET,
      {
        expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d',
        issuer: 'car-booking-api',
        audience: 'car-booking-app',
      }
    );

    logger.info(`Refresh token generated for user ${userId}`);
    return token;
  } catch (error) {
    logger.error('Error generating refresh token', error);
    throw error;
  }
};

/**
 * Verify ACCESS TOKEN
 */
export const verifyAccessToken = (token) => {
  try {
    if (tokenBlacklist.has(token)) {
      throw new Error('Token has been revoked');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: 'car-booking-api',
      audience: 'car-booking-app',
    });

    if (decoded.type !== 'access') {
      throw new Error('Invalid token type');
    }

    return decoded;
  } catch (error) {
    logger.warn('Access token verification failed', error.message);
    throw error;
  }
};

/**
 * Verify REFRESH TOKEN
 */
export const verifyRefreshToken = (token) => {
  try {
    if (tokenBlacklist.has(token)) {
      throw new Error('Token has been revoked');
    }

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET, {
      issuer: 'car-booking-api',
      audience: 'car-booking-app',
    });

    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }

    return decoded;
  } catch (error) {
    logger.warn('Refresh token verification failed', error.message);
    throw error;
  }
};

/**
 * Generate both tokens at once
 * Returns object with both accessToken and refreshToken
 */
export const generateTokens = (userId, role = 'user') => {
  try {
    const accessToken = generateAccessToken(userId, role);
    const refreshToken = generateRefreshToken(userId, role);

    return {
      accessToken,
      refreshToken,
      expiresIn: parseInt(process.env.JWT_EXPIRE?.replace('d', '') || '7') * 24 * 60 * 60, // in seconds
    };
  } catch (error) {
    logger.error('Error generating tokens', error);
    throw error;
  }
};

/**
 * Revoke TOKEN (add to blacklist)
 * Used when user logs out or token needs to be invalidated
 */
export const revokeToken = (token) => {
  try {
    tokenBlacklist.add(token);
    logger.info('Token revoked successfully');
  } catch (error) {
    logger.error('Error revoking token', error);
    throw error;
  }
};

/**
 * Revoke all tokens for a user (logout from all devices)
 * TODO: Implement Redis to store user sessions
 */
export const revokeAllUserTokens = (userId) => {
  try {
    // For now, just logging - would need Redis for proper implementation
    logger.info(`All tokens for user ${userId} should be revoked`);
    // In production: delete all user sessions from Redis
  } catch (error) {
    logger.error('Error revoking all user tokens', error);
    throw error;
  }
};

/**
 * Check if token is blacklisted
 */
export const isTokenBlacklisted = (token) => {
  return tokenBlacklist.has(token);
};

/**
 * Get token expiration time
 */
export const getTokenExpiration = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) {
      return null;
    }

    const expirationDate = new Date(decoded.exp * 1000);
    const now = new Date();
    const timeRemaining = expirationDate - now; // in milliseconds

    return {
      expiresAt: expirationDate,
      timeRemainingMs: Math.max(0, timeRemaining),
      isExpired: timeRemaining <= 0,
    };
  } catch (error) {
    logger.error('Error getting token expiration', error);
    return null;
  }
};

export default {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateTokens,
  revokeToken,
  revokeAllUserTokens,
  isTokenBlacklisted,
  getTokenExpiration,
};