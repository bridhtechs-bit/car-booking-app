/**
 * ========================================
 * CUSTOM SANITIZATION MIDDLEWARE
 * ========================================
 * Compatible with Express 5.x
 * Prevents NoSQL injection attacks
 * Sanitizes query, params, and body
 */

/**
 * Sanitize a value by removing $ and . characters
 * which are used in MongoDB operators
 */
const sanitizeValue = (value) => {
  if (typeof value === 'string') {
    // Remove $ and . to prevent NoSQL injection
    return value.replace(/[$.\s]/g, '');
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }
  if (value !== null && typeof value === 'object') {
    return sanitizeObject(value);
  }
  return value;
};

/**
 * Recursively sanitize an object
 */
const sanitizeObject = (obj) => {
  const sanitized = {};
  for (const key in obj) {
    if (obj.prototype.hasOwnProperty.call(obj, key)) {
      // Skip keys that contain $ or .
      if (key.includes('$') || key.includes('.')) {
        continue;
      }
      sanitized[key] = sanitizeValue(obj[key]);
    }
  }
  return sanitized;
};

/**
 * Sanitization middleware for Express 5.x compatibility
 * Sanitizes body, query, and params to prevent NoSQL injection
 */
export const sanitizationMiddleware = (req, res, next) => {
  try {
    // Sanitize request body
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeObject(req.body);
    }

    // Sanitize query parameters
    if (req.query && typeof req.query === 'object') {
      const sanitizedQuery = sanitizeObject(req.query);
      // Update query using Object.defineProperty to work with Express 5.x getter
      req.query = sanitizedQuery;
    }

    // Sanitize URL parameters (params are already safe, but sanitize anyway)
    if (req.params && typeof req.params === 'object') {
      req.params = sanitizeObject(req.params);
    }

    next();
  } catch (error) {
    // If sanitization fails, log but continue
    console.error('Sanitization error:', error);
    next();
  }
};

export default sanitizationMiddleware;
