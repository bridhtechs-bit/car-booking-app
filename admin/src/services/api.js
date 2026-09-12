import axios from 'axios';
import { getTokenFromLocalStorage, clearUserFromLocalStorage } from '../utils/tokenUtil';

/**
 * Axios instance configured to communicate with the backend
 * - Auto-includes JWT token in Authorization header
 * - Handles 401 errors by redirecting to login
 * - Uses environment variable for API base URL
 */
const api = axios.create({
  baseURL: 'https://car-booking-app-server.onrender.com/api',
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
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response) {
      // Handle 429 Too Many Requests with exponential backoff retry (up to 3 times)
      if (error.response.status === 429 && originalRequest && (originalRequest._retryCount || 0) < 3) {
        originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
        const delay = Math.pow(2, originalRequest._retryCount) * 1000; // 2s, 4s, 8s
        console.warn(`[429 Too Many Requests] Retrying request (${originalRequest._retryCount}/3) in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return api(originalRequest);
      }

      switch (error.response.status) {
        case 401:
          // Unauthorized - token expired or invalid
          console.warn('Token expired or invalid. Redirecting to login.');
          // Do not redirect if the error is from a login attempt
          if (error.config && !error.config.url.includes('/login')) {
            clearUserFromLocalStorage();
            window.location.href = '/login';
          }
          break;
          
        case 403:
          console.error('Access forbidden:', error.response.data.message);
          break;
          
        case 404:
          console.error('Resource not found:', error.config.url);
          break;
          
        case 500:
          console.error('Server error:', error.response.data.message);
          break;
          
        default:
          console.error(`API Error (${error.response.status}):`, error.response.data);
      }
    } else if (error.request) {
      console.error('No response from server:', error.message);
    } else {
      console.error('Error setting up request:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;
