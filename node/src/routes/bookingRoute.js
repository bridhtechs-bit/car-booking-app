import express from "express";
import {
  createBooking,
  getAllBookings,
  updateBookingStatus,
  deleteBooking,
  getBooking,
  getUserBookings,
  getAdminBookings
} from '../controllers/bookingController.js';
import { protect, adminProtect } from "../middleware/protect.js";
import {
  validateCreateBooking,
  validateCancelBooking,
  validateMongoId,
  validatePagination,
  validateSorting,
} from '../middleware/validation.js';

const router = express.Router();


// Update booking status with validation (Protected - must be before GET /:id)
router.put('/update/:_id', protect, validateMongoId, updateBookingStatus);

// Create booking with validation (Protected)
router.post('/createbooking', protect, validateCreateBooking, createBooking);

// Get bookings for authenticated user
router.get('/my-bookings', protect, validatePagination, validateSorting, getUserBookings);

// Get bookings for admin (their cars' bookings)
router.get('/admin-bookings', protect, validatePagination, validateSorting, getAdminBookings);
    
// Get all bookings (Admin only)
router.get('/all-bookings', protect, adminProtect, validatePagination, validateSorting, getAllBookings);

// Get booking by ID with validation (Protected)
router.get('/:_id', protect, validateMongoId, getBooking);

// Delete booking with validation (Protected)
router.delete('/:_id', protect, validateMongoId, deleteBooking);

export default router;
