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
import { protect } from "../middleware/protect.js";
import {
  validateCreateBooking,
  validateCancelBooking,
  validateMongoId,
  validatePagination,
} from '../middleware/validation.js';

const router = express.Router();


// Update booking status with validation (Protected - must be before GET /:id)
router.put('/update/:_id', protect, validateMongoId, updateBookingStatus);

// Create booking with validation (Protected)
router.post('/createbooking', protect, validateCreateBooking, createBooking);

// Get bookings for authenticated user
router.get('/my-bookings', protect, validatePagination, getUserBookings);

// Get bookings for admin (their cars' bookings)
router.get('/admin-bookings', protect, validatePagination, getAdminBookings);
    
// Get all bookings
router.get('/all-bookings', validatePagination, getAllBookings);

// Get booking by ID with validation
router.get('/:_id', validateMongoId, getBooking);

// Delete booking with validation
router.delete('/:_id', validateMongoId, deleteBooking);

export default router;
