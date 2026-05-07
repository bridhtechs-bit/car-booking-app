/**
 * Centralized Configuration for Admin App
 * 
 * This file provides all configuration values needed for the admin application
 * including API endpoints, authentication settings, and feature flags.
 * 
 * Environment Variables Used:
 * - REACT_APP_API_BASE_URL: Backend API base URL (e.g. http://localhost:5000/api)
 * - REACT_APP_STRIPE_PUBLIC_KEY: Stripe public key for payments
 * - REACT_APP_APP_NAME: Application name
 * - REACT_APP_VERSION: App version
 * - REACT_APP_DEBUG: Enable debug logging
 */

export const appConfig = {
  // API Configuration
  api: {
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  },

  // Authentication
  auth: {
    tokenKey: 'adminToken',
    userKey: 'user',
    refreshThreshold: 60, // seconds before expiry to refresh
  },

  // Authentication Endpoints
  endpoints: {
    auth: {
      register: '/auth/register',
      login: '/auth/login',
      logout: '/auth/logout',
      refresh: '/auth/refresh-token',
      updateProfile: '/auth/update-profile',
    },
    cars: {
      list: '/cars/getcars',
      myList: '/cars/mycars',
      get: '/cars/:id',
      create: '/cars/create',
      update: '/cars/update/:id',
      delete: '/cars/delete/:id',
      toggleFeatured: '/cars/:id/featured',
    },
    bookings: {
      list: '/bookings/admin-bookings',
      get: '/bookings/:id',
      updateStatus: '/bookings/update/:id',
      update: '/bookings/:id',
      cancel: '/bookings/:id',
      stats: '/bookings/stats',
    },
    users: {
      list: '/users',
      get: '/users/:id',
      update: '/users/:id',
      delete: '/users/:id',
    },
  },

  // UI Configuration
  ui: {
    theme: 'light',
    itemsPerPage: 10,
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'HH:mm',
  },

  // Feature Flags
  features: {
    payments: false,
    notifications: true,
    analytics: true,
    emailNotifications: true,
  },

  // App Info
  app: {
    name: process.env.REACT_APP_APP_NAME || 'Car Booking App Admin',
    version: process.env.REACT_APP_VERSION || '1.0.0',
    debug: process.env.REACT_APP_DEBUG === 'true',
  },

  // Stripe Configuration (if enabled)
  stripe: {
    publicKey: process.env.REACT_APP_STRIPE_PUBLIC_KEY || '',
  },

  // Booking Statuses
  bookingStatuses: [
    { value: 'pending', label: 'Pending', color: 'warning' },
    { value: 'approved', label: 'Approved', color: 'info' },
    { value: 'rejected', label: 'Rejected', color: 'danger' },
    { value: 'completed', label: 'Completed', color: 'success' },
    { value: 'cancelled', label: 'Cancelled', color: 'secondary' },
  ],

  // Car Categories
  carCategories: [
    'Economy',
    'Compact',
    'Mid-size',
    'Full-size',
    'SUV',
    'Luxury',
    'Sports',
    'Family',
  ],

  // Validation Rules
  validation: {
    password: {
      minLength: 8,
      requireUppercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
    },
    car: {
      priceMin: 10,
      priceMax: 10000,
      mileageMin: 0,
      maxImageSize: 5 * 1024 * 1024, // 5MB
    },
  },
};

// Helper function to get endpoint URL
export const getEndpointUrl = (endpoint) => {
  return `${appConfig.api.baseURL}${endpoint}`;
};

// Helper function to check feature
export const isFeatureEnabled = (featureName) => {
  return appConfig.features[featureName] === true;
};

// Helper function to get booking status display
export const getBookingStatusDisplay = (status) => {
  return appConfig.bookingStatuses.find((s) => s.value === status);
};

export default appConfig;
