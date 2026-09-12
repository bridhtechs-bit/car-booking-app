import logger from '../utils/logger.js';

// In-memory request counters by path
const routeMetrics = {};
const statusMetrics = { '2xx': 0, '3xx': 0, '4xx': 0, '429': 0, '5xx': 0 };

/**
 * Lightweight API usage metrics middleware
 * Tracks request counts per route and HTTP status distribution
 */
export const metricsMiddleware = (req, res, next) => {
  const route = req.baseUrl || req.path || 'unknown';

  // Increment route request counter
  routeMetrics[route] = (routeMetrics[route] || 0) + 1;

  res.on('finish', () => {
    const status = res.statusCode;
    if (status === 429) {
      statusMetrics['429'] += 1;
      logger.warn(`⚠️ 429 Rate Limit triggered on ${req.method} ${req.originalUrl} from IP ${req.ip}`);
    } else if (status >= 200 && status < 300) {
      statusMetrics['2xx'] += 1;
    } else if (status >= 300 && status < 400) {
      statusMetrics['3xx'] += 1;
    } else if (status >= 400 && status < 500) {
      statusMetrics['4xx'] += 1;
    } else if (status >= 500) {
      statusMetrics['5xx'] += 1;
    }
  });

  next();
};

/**
 * Get current metrics summary (Admin function)
 */
export const getMetricsSummary = () => {
  return {
    routes: routeMetrics,
    statusCodes: statusMetrics,
    timestamp: new Date().toISOString(),
  };
};

export default metricsMiddleware;
