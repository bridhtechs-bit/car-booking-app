/**
 * Frontend Configuration
 * Centralized configuration for the React application
 */

const config = {
  // API Configuration
  api: {
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
    timeout: 10000, // 10 seconds
    retryAttempts: 3,
    retryDelay: 1000, // 1 second
  },

  // Authentication
  auth: {
    tokenKey: 'access_token',
    userKey: 'user',
    refreshTokenKey: 'refresh_token',
    tokenCookieName: 'authToken',
  },

  // Application Settings
  app: {
    name: process.env.REACT_APP_APP_NAME || 'Car Booking App',
    version: process.env.REACT_APP_VERSION || '1.0.0',
    debug: process.env.REACT_APP_DEBUG === 'true',
  },

  // Stripe Configuration
  stripe: {
    publicKey: process.env.REACT_APP_STRIPE_PUBLIC_KEY || 'pk_test_your_key_here',
  },

  // Feature Flags
  features: {
    enableEmailNotifications: true,
    enableSMSNotifications: false,
    enablePushNotifications: false,
    enablePayments: true,
    enableRatings: true,
  },

  // Pagination
  pagination: {
    defaultPageSize: 10,
    maxPageSize: 100,
  },

  // Booking Settings
  booking: {
    minDays: 1,
    maxDays: 365,
    cancellationDeadlineHours: 24,
  },

  // Error Messages
  errors: {
    NETWORK_ERROR: 'Network error. Please check your connection.',
    AUTH_ERROR: 'Authentication failed. Please login again.',
    VALIDATION_ERROR: 'Please check your input and try again.',
    SERVER_ERROR: 'Server error. Please try again later.',
    NOT_FOUND: 'Resource not found.',
  },

  // API Endpoints (for reference)
  endpoints: {
    auth: {
      register: '/auth/register',
      login: '/auth/login',
      logout: '/auth/logout',
      refreshToken: '/auth/refresh-token',
      forgotPassword: '/auth/forgot-password',
      resetPassword: '/auth/reset-password',
    },
    cars: {
      list: '/cars/getcars',
      featured: '/cars/featured',
      details: '/cars/:id',
      filter: '/cars/filter',
      category: '/cars/category',
    },
    bookings: {
      create: '/bookings/createbooking',
      myBookings: '/bookings/my-bookings',
      details: '/bookings/:id',
      cancel: '/bookings/:id/cancel',
      update: '/bookings/:id',
    },
    users: {
      profile: '/users/profile',
      updateProfile: '/users/profile',
      changePassword: '/users/change-password',
      uploadAvatar: '/users/upload-avatar',
    },
  },
};

export default config;
