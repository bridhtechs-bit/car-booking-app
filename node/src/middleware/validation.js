import { body, validationResult, param, query } from "express-validator";
import { ApiError } from "./errorHandler.js";

/**
 * Custom validation middleware to check for errors
 * Properly handles validation errors by passing to error handler
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((error) => ({
      field: error.param,
      message: error.msg,
      value: error.value,
    }));

    // Create error and pass to error handler via next()
    const errorMessage = formattedErrors.map((e) => `${e.field}: ${e.message}`).join(", ");
    const validationError = new ApiError(400, `Validation error: ${errorMessage}`);
    
    // Pass error to express error handler
    return next(validationError);
  }
  
  next();
};

// ========== AUTH VALIDATION ==========
export const validateRegister = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2 })
    .withMessage("Name must be at least 2 characters"),
  body("email")
    .trim()
    .toLowerCase()
    .isEmail()
    .withMessage("Valid email is required")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters")
    .matches(/^(?=.*[A-Za-z])(?=.*\d)/)
    .withMessage("Password must contain letters and numbers"),
  handleValidationErrors,
];

export const validateLogin = [
  body("email")
    .trim()
    .toLowerCase()
    .isEmail()
    .withMessage("Valid email is required")
    .normalizeEmail(),
  body("password")
    .notEmpty()
    .withMessage("Password is required"),
  handleValidationErrors,
];

export const validateChangePassword = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters")
    .matches(/^(?=.*[A-Za-z])(?=.*\d)/)
    .withMessage("Password must contain letters and numbers"),
  body("confirmPassword")
    .custom((value, { req }) => value === req.body.newPassword)
    .withMessage("Passwords do not match"),
  handleValidationErrors,
];

// ========== CAR VALIDATION ==========
export const validateCreateCar = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Car name is required"),
  body("brand")
    .trim()
    .notEmpty()
    .withMessage("Brand is required"),
  body("category")
    .trim()
    .notEmpty()
    .withMessage("Category is required")
    .isIn(["sedan", "suv", "hatchback", "coupe", "convertible", "van", "sport"])
    .withMessage("Invalid category"),
  body("pricePerDay")
    .isFloat({ min: 0.01 })
    .withMessage("Price must be a positive number"),
  body("year")
    .optional()
    .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
    .withMessage("Invalid year"),
  body("fuelType")
    .trim()
    .notEmpty()
    .withMessage("Fuel type is required")
    .isIn(["Petrol", "Diesel", "Hybrid", "Electric"])
    .withMessage("Invalid fuel type"),
  body("transmission")
    .trim()
    .notEmpty()
    .withMessage("Transmission is required")
    .isIn(["automatic", "manual"])
    .withMessage("Invalid transmission"),
  body("seats")
    .isInt({ min: 2, max: 10 })
    .withMessage("Seating must be between 2 and 10"),
  body("mileage")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Mileage cannot be empty"),
  body("color")
    .optional()
    .trim(),
  body("description")
    .optional()
    .trim(),
  body("features")
    .optional()
    .isArray()
    .withMessage("Features must be an array"),
  body("images")
    .optional()
    .isArray()
    .withMessage("Images must be an array"),
  body("available")
    .optional()
    .isBoolean()
    .withMessage("Available must be true or false"),
  body("featured")
    .optional()
    .isBoolean()
    .withMessage("Featured must be true or false"),
  handleValidationErrors,
];

export const validateUpdateCar = [
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Car name cannot be empty"),
  body("brand")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Brand cannot be empty"),
  body("pricePerDay")
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage("Price must be a positive number"),
  body("seats")
    .optional()
    .isInt({ min: 2, max: 10 })
    .withMessage("Seating must be between 2 and 10"),
  body("fuelType")
    .optional()
    .trim()
    .isIn(["Petrol", "Diesel", "Hybrid", "Electric"])
    .withMessage("Invalid fuel type"),
  body("transmission")
    .optional()
    .trim()
    .isIn(["automatic", "manual"])
    .withMessage("Invalid transmission"),
  body("category")
    .optional()
    .trim()
    .isIn(["sedan", "suv", "hatchback", "coupe", "convertible", "van", "sport"])
    .withMessage("Invalid category"),
  body("mileage")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Mileage cannot be empty"),
  body("color")
    .optional()
    .trim(),
  body("description")
    .optional()
    .trim(),
  body("features")
    .optional()
    .isArray()
    .withMessage("Features must be an array"),
  body("images")
    .optional()
    .isArray()
    .withMessage("Images must be an array"),
  body("available")
    .optional()
    .isBoolean()
    .withMessage("Available must be true or false"),
  body("featured")
    .optional()
    .isBoolean()
    .withMessage("Featured must be true or false"),
  handleValidationErrors,
];

// ========== BOOKING VALIDATION ==========
export const validateCreateBooking = [
  body("carId")
    .trim()
    .notEmpty()
    .withMessage("Car ID is required")
    .isMongoId()
    .withMessage("Invalid car ID"),
  body("startDate")
    .notEmpty()
    .withMessage("Start date is required")
    .isISO8601()
    .withMessage("Invalid start date format")
    .custom((value) => {
      const startDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (startDate < today) {
        throw new Error("Start date must be in the future");
      }
      return true;
    }),
  body("endDate")
    .notEmpty()
    .withMessage("End date is required")
    .isISO8601()
    .withMessage("Invalid end date format")
    .custom((value, { req }) => {
      const endDate = new Date(value);
      const startDate = new Date(req.body.startDate);
      
      if (endDate <= startDate) {
        throw new Error("End date must be after start date");
      }
      
      const diffTime = Math.abs(endDate - startDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 1) {
        throw new Error("Booking must be at least 1 day");
      }
      
      if (diffDays > 365) {
        throw new Error("Booking cannot be longer than 365 days");
      }
      
      return true;
    }),
  body("insurance")
    .optional()
    .isBoolean()
    .withMessage("Insurance must be true or false"),
  body("additionalDriver")
    .optional()
    .isBoolean()
    .withMessage("Additional driver must be true or false"),
  handleValidationErrors,
];

export const validateCancelBooking = [
  body("cancellationReason")
    .optional()
    .trim(),
  handleValidationErrors,
];

// ========== USER VALIDATION ==========
export const validateUpdateProfile = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage("Name must be at least 2 characters"),
  body("email")
    .optional()
    .trim()
    .toLowerCase()
    .isEmail()
    .withMessage("Valid email is required"),
  body("phone")
    .optional()
    .trim()
    .isMobilePhone()
    .withMessage("Valid phone number is required"),
  body("dateOfBirth")
    .optional()
    .isISO8601()
    .withMessage("Invalid date format"),
  handleValidationErrors,
];

// ========== PARAM VALIDATION ==========
export const validateMongoId = [
  param("_id")
    .isMongoId()
    .withMessage("Invalid ID format"),
  handleValidationErrors,
];

// ========== QUERY VALIDATION ==========
export const validatePagination = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
  handleValidationErrors,
];

export const validateCarFilters = [
  query("category")
    .optional()
    .trim()
    .custom((value) => {
      const validCategories = ["sedan", "suv", "hatchback", "coupe", "convertible", "van"];
      if (!validCategories.includes(value.toLowerCase())) {
        throw new Error("Invalid category");
      }
      return true;
    }),
  query("minPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Min price must be a positive number"),
  query("maxPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Max price must be a positive number"),
  query("fuel")
    .optional()
    .trim()
    .custom((value) => {
      const validFuels = ["petrol", "diesel", "hybrid", "electric"];
      if (!validFuels.includes(value.toLowerCase())) {
        throw new Error("Invalid fuel type");
      }
      return true;
    }),
  query("transmission")
    .optional()
    .trim()
    .custom((value) => {
      const validTransmissions = ["automatic", "manual"];
      if (!validTransmissions.includes(value.toLowerCase())) {
        throw new Error("Invalid transmission");
      }
      return true;
    }),
  query("search")
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage("Search term cannot be empty"),
  handleValidationErrors,
];

export default {
  validateRegister,
  validateLogin,
  validateChangePassword,
  validateCreateCar,
  validateUpdateCar,
  validateCreateBooking,
  validateCancelBooking,
  validateUpdateProfile,
  validateMongoId,
  validatePagination,
  validateCarFilters,
  handleValidationErrors,
};
