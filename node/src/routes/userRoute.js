import express from "express";
const router = express.Router();
import { getAllUsers, deleteUser, updateUser, getUser } from '../controllers/userController.js';
import {
  validatePagination,
  validateSorting,
} from '../middleware/validation.js';

import { protect, adminProtect } from '../middleware/protect.js';

// Get all users (Admin only)
router.get('/allusers', protect, adminProtect, validatePagination, validateSorting, getAllUsers);

// Get user by ID (Protected)
router.get('/:id', protect, getUser);

// Update user (Protected)
router.put('/:id', protect, updateUser);

// Delete user (Protected)
router.delete('/:id', protect, deleteUser);

export default router;
