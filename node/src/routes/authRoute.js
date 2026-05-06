import express from "express";
import { createUser, loginUser, refreshAccessToken, logoutUser, loginOwner } from '../controllers/authController.js';
import { ownerProtect } from "../middleware/protect.js";

const router = express.Router();

// POST /api/auth/register - Register new user
router.post('/register', createUser);

// POST /api/auth/login - Login user (NO VALIDATION - manual validation in controller)
router.post('/login', loginUser);

// POST /api/auth/refresh-token - Refresh access token
router.post('/refresh-token', refreshAccessToken);

// POST /api/auth/logout - Logout user
router.post('/logout', logoutUser);

export default router;