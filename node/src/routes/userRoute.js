import express from "express";
const router = express.Router();
import { getAllUsers, deleteUser, updateUser, getUser } from '../controllers/userController.js';
import {
  validatePagination,
  validateSorting,
} from '../middleware/validation.js';

// Get all users
router.get('/allusers', validatePagination, validateSorting, getAllUsers);

// Get user by ID
router.get('/:id', getUser);

// Update user
router.put('/:id', updateUser);

// Delete user
router.delete('/:id', deleteUser);

export default router;
