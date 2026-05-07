/**
 * ========================================
 * ENTRY POINT - index.js
 * ========================================
 * Unified server initialization with:
 * - Environment variables loading
 * - Express app configuration
 * - Security middleware
 * - Database connection
 * - Email service initialization
 * - Error handling
 */

import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import nodemailer from 'nodemailer';

import connectDB from './src/config/db.js';
import { errorHandler, notFoundHandler } from './src/middleware/errorHandler.js';
import sanitizationMiddleware from './src/middleware/sanitizer.js';
import logger from './src/utils/logger.js';

// Import Routes
import authRoute from './src/routes/authRoute.js';
import carRoute from './src/routes/carRoute.js';
import userRoute from './src/routes/userRoute.js';
import bookingRoute from './src/routes/bookingRoute.js';

// Import Email Service
import { initializeEmailService } from './src/services/emailService.js';
import { startExpiredBookingsCron } from './src/jobs/expiredBookingsCron.js';

// Load environment variables FIRST
dotenv.config();

// ========== CREATE EXPRESS APP ==========
const app = express();

// ========== LOGGING ==========
app.use(morgan("combined", {
  stream: {
    write: (message) => logger.info(message.trim()),
  },
}));

// ========== SECURITY MIDDLEWARE ==========
// Helmet helps secure Express apps by setting various HTTP headers
app.use(helmet());

// CORS Configuration
const corsOptions = {
  origin: [
    "https://bridh-drivio-client.netlify.app/"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: "true",
  optionsSuccessStatus: 200,
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));

// Body Parser Middleware (with size limits)
app.use(bodyParser.json({ limit: "10kb" }));
app.use(bodyParser.urlencoded({ limit: "10kb", extended: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie Parser
app.use(cookieParser());

// Data Sanitization against NoSQL injection (Custom middleware for Express 5.x compatibility)
app.use(sanitizationMiddleware);

// ========== RATE LIMITING ==========
// General API rate limiter
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // Max 100 requests per window
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limiter for authentication
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Max 5 attempts per window
  skipSuccessfulRequests: true,
  message: "Too many login attempts, please try again after 15 minutes",
});

//test sending email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASSWORD,
  },
});



// ========== HEALTH CHECK ENDPOINTS ==========
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API Car Booking is running 🚗",
    timestamp: new Date().toISOString(),
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: process.env.EMAIL_TO,
    subject: "Test Email from Car Booking API",
    text: "This is a test email to verify the email service is working correctly.",
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      logger.error('❌ Failed to send test email', error);
    } else {
      logger.success('✅ Test email sent successfully');
    }
  });
});


//get movies from this link
const url = "https://123movienow.cc/spa/videoPlayPage/movies/bel-air-version-francaise-ad8KTmVZkB2?id=2184055813143152208&type=/movie/detail&detailSe=&detailEp=&lang=fr"

app.get('/movie',async (req,res)=>{
  try{
    const response = await fetch(url);
    const data = await response.json();
    res.status(200).json({
      success: true,
      data: data,
    });
  }catch(error){
    logger.error('❌ Failed to fetch movie data', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch movie data',
    });
  }
})

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
  });
});

// ========== APPLY RATE LIMITING ==========
app.use("/api/", limiter);

// ========== API ROUTES ==========
app.use('/api/auth', authLimiter, authRoute);
app.use('/api/cars', carRoute);
app.use('/api/users', userRoute);
app.use('/api/bookings', bookingRoute);

// ========== ERROR HANDLING ==========
// 404 Handler - must be after all routes
app.use(notFoundHandler);

// Global Error Handler - must be last
app.use(errorHandler);

// ========== SERVER INITIALIZATION ==========
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    logger.info('✅ Database connected successfully');

    // Initialize Email Service
    try {
      await initializeEmailService();
      logger.info('✅ Email service initialized');
    } catch (emailError) {
      logger.warn('⚠️  Email service not available - continuing without email', emailError.message);
      // Continue even if email service fails
    }

    // Start Server
    app.listen(PORT, () => {
      logger.success(`🚀 Server is running on port ${PORT}`);
      logger.info(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🔗 API URL: http://localhost:${PORT}/api`);
      logger.info(`💚 Health Check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    logger.error('❌ Failed to start server', error);
    process.exit(1);
  }
};

startExpiredBookingsCron(); // Start cron job for expired bookings

// ========== GLOBAL ERROR HANDLERS ==========
process.on('unhandledRejection', (reason, promise) => {
  logger.error('⚠️  Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// ========== START ==========
startServer();