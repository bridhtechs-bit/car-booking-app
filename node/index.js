import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';

// Configuration
import connectDB from './src/config/db.js';

// Middleware
import { errorHandler, notFoundHandler } from './src/middleware/errorHandler.js';
import sanitizationMiddleware from './src/middleware/sanitizer.js';

// Utils
import logger from './src/utils/logger.js';

// Routes
import authRoute from './src/routes/authRoute.js';
import carRoute from './src/routes/carRoute.js';
import userRoute from './src/routes/userRoute.js';
import bookingRoute from './src/routes/bookingRoute.js';
import uploadRoute from './src/routes/uploadRoutes.js';

// Services / Jobs
import { initializeEmailService } from './src/services/emailService.js';
import { startExpiredBookingsCron } from './src/jobs/expiredBookingsCron.js';

// ============================================================
// ENVIRONMENT
// ============================================================

dotenv.config();

// ============================================================
// UPLOAD DIRECTORY
// ============================================================

const uploadPath = process.env.FILE_UPLOAD_PATH || 'uploads';

// Prevent absolute paths from escaping the project directory
const safeUploadPath = uploadPath.replace(/^[/\\]+/, '');

const uploadDir = path.resolve(
  process.cwd(),
  safeUploadPath
);

// Create upload directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });

  logger.info(
    `📁 Created uploads directory at ${uploadDir}`
  );
}

// ============================================================
// EXPRESS APP
// ============================================================

const app = express();

const PORT = Number(process.env.PORT) || 5000;

// ============================================================
// TRUST PROXY
// ============================================================

// Render / reverse proxy support.
// Required so rate-limiters can correctly identify client IPs
// when the application is deployed behind a proxy.
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// ============================================================
// LOGGING
// ============================================================

app.use(
  morgan('combined', {
    stream: {
      write: (message) => {
        logger.info(message.trim());
      },
    },
  })
);

// ============================================================
// SECURITY MIDDLEWARE
// ============================================================

// Helmet security headers
app.use(
  helmet()
);

// ============================================================
// CORS
// ============================================================

const allowedOrigins = [
  'https://car-booking-app-client.onrender.com',
  'https://car-booking-app-admin.onrender.com',
];

// Allow localhost during development
if (process.env.NODE_ENV !== 'production') {
  allowedOrigins.push(
    'http://localhost:3000',
    'http://localhost:5173'
  );
}

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests without Origin
    // (Postman, server-to-server requests, etc.)
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(
      new Error('Not allowed by CORS')
    );
  },

  methods: [
    'GET',
    'POST',
    'PUT',
    'DELETE',
    'PATCH',
    'OPTIONS',
  ],

  credentials: true,

  optionsSuccessStatus: 200,

  allowedHeaders: [
    'Content-Type',
    'Authorization',
  ],
};

app.use(
  cors(corsOptions)
);

// ============================================================
// BODY PARSING
// ============================================================

// Limit JSON payloads to 10 KB
app.use(
  express.json({
    limit: '10kb',
  })
);

// Limit URL-encoded payloads to 10 KB
app.use(
  express.urlencoded({
    limit: '10kb',
    extended: true,
  })
);

// ============================================================
// COOKIE PARSER
// ============================================================

app.use(
  cookieParser()
);

// ============================================================
// DATA SANITIZATION
// ============================================================

// Protection against NoSQL injection
// Custom middleware compatible with Express 5
app.use(
  sanitizationMiddleware
);

// ============================================================
// STATIC FILES
// ============================================================

app.use(
  '/uploads',
  express.static(uploadDir)
);

// ============================================================
// RATE LIMITING
// ============================================================

// General API rate limiter
const limiter = rateLimit({
  windowMs:
    Number(process.env.RATE_LIMIT_WINDOW_MS) ||
    15 * 60 * 1000,

  max:
    Number(process.env.RATE_LIMIT_MAX_REQUESTS) ||
    100,

  message: {
    success: false,
    message:
      'Too many requests from this IP, please try again later.',
  },

  standardHeaders: true,
  legacyHeaders: false,

  // Avoid rate limiting health checks
  skip: (req) => {
    return req.path === '/health';
  },
});

// Authentication rate limiter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  max: 5,

  skipSuccessfulRequests: true,

  message: {
    success: false,
    message:
      'Too many authentication attempts. Please try again after 15 minutes.',
  },

  standardHeaders: true,
  legacyHeaders: false,
});

// ============================================================
// HEALTH CHECK
// ============================================================

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API Car Booking is running 🚗',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    environment:
      process.env.NODE_ENV || 'development',
  });
});

// ============================================================
// API RATE LIMITING
// ============================================================

app.use(
  '/api',
  limiter
);

// ============================================================
// API ROUTES
// ============================================================

// Authentication
app.use(
  '/api/auth',
  authLimiter,
  authRoute
);

// Cars
app.use(
  '/api/cars',
  carRoute
);

// Users
app.use(
  '/api/users',
  userRoute
);

// Bookings
app.use(
  '/api/bookings',
  bookingRoute
);

// File uploads
app.use(
  '/api/uploads',
  uploadRoute
);

// ============================================================
// 404 HANDLER
// ============================================================

// Must be after all routes
app.use(
  notFoundHandler
);

// ============================================================
// GLOBAL ERROR HANDLER
// ============================================================

// Must be the last Express middleware
app.use(
  errorHandler
);

// ============================================================
// SERVER STARTUP
// ============================================================

const startServer = async () => {
  try {
    // --------------------------------------------------------
    // MongoDB
    // --------------------------------------------------------

    await connectDB();

    logger.info(
      '✅ Database connected successfully'
    );

    // --------------------------------------------------------
    // Email service
    // --------------------------------------------------------

    try {
      await initializeEmailService();

      logger.info(
        '✅ Email service initialized'
      );
    } catch (emailError) {
      logger.warn(
        `⚠️ Email service unavailable: ${emailError.message}`
      );

      // Email is not critical for server startup
      // The application can continue running.
    }

    // --------------------------------------------------------
    // Start HTTP server
    // --------------------------------------------------------

    const server = app.listen(
      PORT,
      '0.0.0.0',
      () => {
        logger.success(
          `🚀 Server is running on port ${PORT}`
        );

        logger.info(
          `📍 Environment: ${
            process.env.NODE_ENV || 'development'
          }`
        );

        logger.info(
          `🔗 API URL: http://localhost:${PORT}/api`
        );

        logger.info(
          `💚 Health Check: http://localhost:${PORT}/api/health`
        );

        logger.info(
          `📁 Uploads: ${uploadDir}`
        );
      }
    );

    // --------------------------------------------------------
    // Graceful shutdown
    // --------------------------------------------------------

    const shutdown = (signal) => {
      logger.info(
        `🛑 ${signal} received. Shutting down server...`
      );

      server.close(() => {
        logger.info(
          '✅ HTTP server closed'
        );

        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error(
          '❌ Forced shutdown after timeout'
        );

        process.exit(1);
      }, 10000);
    };

    process.on(
      'SIGTERM',
      () => shutdown('SIGTERM')
    );

    process.on(
      'SIGINT',
      () => shutdown('SIGINT')
    );

  } catch (error) {
    logger.error(
      '❌ Failed to start server',
      error
    );

    process.exit(1);
  }
};

// ============================================================
// CRON JOB
// ============================================================

startExpiredBookingsCron();

// ============================================================
// GLOBAL PROCESS ERROR HANDLERS
// ============================================================

process.on(
  'unhandledRejection',
  (reason) => {
    logger.error(
      '⚠️ Unhandled Promise Rejection:',
      reason
    );
  }
);

process.on(
  'uncaughtException',
  (error) => {
    logger.error(
      '❌ Uncaught Exception:',
      error
    );

    process.exit(1);
  }
);

// ============================================================
// START APPLICATION
// ============================================================

startServer();

// ============================================================
// EXPORT APP
// ============================================================

// Useful for testing with Supertest
export default app;