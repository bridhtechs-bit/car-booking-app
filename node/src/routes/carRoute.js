import express from 'express';
import {
  getAllCars,
  getFeaturedCars,
  getCarById,
  getCarsByCategory,
  filterCars,
  createCar,
  updateCar,
  deleteCar,
  changeAvailability,
  changeFeatured,
  getMyCars
} from '../controllers/carController.js';
import { adminProtect, protect } from '../middleware/protect.js';
import {
  validateCreateCar,
  validateUpdateCar,
  validateMongoId,
  validatePagination,
  validateCarFilters,
  validateSorting,
} from '../middleware/validation.js';
import { upload } from '../middleware/uploadMidlware.js';

const router = express.Router();

// Public routes with validation
router.get('/getcars', validatePagination, validateSorting, validateCarFilters, getAllCars);
router.get('/featured', getFeaturedCars);
router.get('/filter', validatePagination, validateSorting, validateCarFilters, filterCars);
router.get('/category', getCarsByCategory);

// Protected routes (Admin only)
router.get('/mycars', protect, adminProtect, validatePagination, validateSorting, getMyCars);
// Featured status change with validation (Admin only)
router.put('/:_id/featured', protect, adminProtect, validateMongoId, changeFeatured);

// Create car with validation (Admin only)
router.post('/create', protect, adminProtect, upload.array('images', 5), validateCreateCar, createCar);

// Update car with validation (Admin only)
router.put('/update/:_id', protect, adminProtect, upload.array('images', 5), validateMongoId, validateUpdateCar, updateCar);

// Delete car with validation (Admin only)
router.delete('/delete/:_id', protect, adminProtect, validateMongoId, deleteCar);

// Availability change with validation (Admin only)
router.put('/:_id/availability', protect, adminProtect, validateMongoId, changeAvailability);

// Get car by ID (must be last) with validation
router.get('/:_id', validateMongoId, getCarById);

export default router;
