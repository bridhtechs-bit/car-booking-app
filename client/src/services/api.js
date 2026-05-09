import axios from 'axios';
import { getTokenFromLocalStorage, clearUserFromLocalStorage } from '../utils/tokenUtil';

// On définit explicitement la priorité : 
// 1. La variable d'environnement (Netlify)
// 2. Si absente, l'URL Render en dur (pour dépanner)
// 3. Si tout échoue, localhost (pour le dev)
const baseURL = "https://car-booking-app-server.onrender.com/api";

const api = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * REQUEST INTERCEPTOR
 * Adds JWT token to Authorization header for all requests
 */
api.interceptors.request.use(
  (config) => {
    const token = getTokenFromLocalStorage();
    
    if (token) {
      // Add token to Authorization header
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * RESPONSE INTERCEPTOR
 * Handles errors and special cases:
 * - 401: Token expired or invalid -> logout and redirect to login
 * - 403: Not authorized
 * - 500: Server error
 */
api.interceptors.response.use(
  (response) => {
    // Return response if successful
    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with error status
      switch (error.response.status) {
        case 401:
          // Unauthorized - token expired or invalid
          console.warn('Token expired or invalid. Redirecting to login.');
          clearUserFromLocalStorage();
          window.location.href = '/login';
          break;
          
        case 403:
          // Forbidden - user doesn't have permission
          console.error('Access forbidden:', error.response.data.message);
          break;
          
        case 404:
          // Not found
          console.error('Resource not found:', error.config.url);
          break;
          
        case 500:
          // Server error
          console.error('Server error:', error.response.data.message);
          break;
          
        default:
          // Other errors
          console.error(`API Error (${error.response.status}):`, error.response.data);
      }
    } else if (error.request) {
      // Request made but no response
      console.error('No response from server:', error.message);
    } else {
      // Error in request setup
      console.error('Error setting up request:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;
