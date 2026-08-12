import express from "express";
import { 
  createUser, 
  loginUser, 
  refreshAccessToken, 
  logoutUser, 
  loginOwner,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerificationEmail
} from '../controllers/authController.js';
import { protect, ownerProtect } from "../middleware/protect.js";

const router = express.Router();

// POST /api/auth/register - Register new user
router.post('/register', createUser);

// POST /api/auth/login - Login user (NO VALIDATION - manual validation in controller)
router.post('/login', loginUser);

// POST /api/auth/loginowner - Login owner
router.post('/loginowner', loginOwner);

// POST /api/auth/forgot-password - Forgot password request
router.post('/forgot-password', forgotPassword);

// POST /api/auth/reset-password/:token - Reset password with token
router.post('/reset-password/:token', resetPassword);

// GET /api/auth/verify-email/:token - Verify email address with token
router.get('/verify-email/:token', verifyEmail);

// POST /api/auth/resend-verification - Resend verification email
router.post('/resend-verification', protect, resendVerificationEmail);

// POST /api/auth/refresh-token - Refresh access token
router.post('/refresh-token', refreshAccessToken);

// POST /api/auth/logout - Logout user
router.post('/logout', logoutUser);

export default router;