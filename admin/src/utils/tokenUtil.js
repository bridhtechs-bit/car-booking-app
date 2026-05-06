import { jwtDecode } from 'jwt-decode';

/**
 * Check if JWT token is expired
 * @param {string} token - JWT token to check
 * @returns {boolean} - true if expired or no token
 */
export const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch (error) {
    console.error('Error decoding token:', error);
    return true;
  }
};

/**
 * Get valid token from localStorage
 * Checks 'adminToken' first, falls back to token in 'user' object
 * @returns {string|null} - Valid token or null if none found
 */
export const getTokenFromLocalStorage = () => {
  // Check adminToken (set by authSlice after login)
  const adminToken = localStorage.getItem('adminToken');
  if (adminToken && !isTokenExpired(adminToken)) {
    return adminToken;
  }

  // Fallback to token in user object
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token && !isTokenExpired(user.token)) {
      // Sync with adminToken for consistency
      localStorage.setItem('adminToken', user.token);
      return user.token;
    }
  } catch (error) {
    console.error('Error parsing user from localStorage:', error);
  }

  return null;
};

/**
 * Save token to localStorage
 * Stores in both 'adminToken' and 'user' object for consistency
 * @param {string} token - JWT token to store
 */
export const saveTokenToLocalStorage = (token) => {
  if (!token) return;
  localStorage.setItem('adminToken', token);
  try {
    const user = JSON.parse(localStorage.getItem('user')) || {};
    user.token = token;
    localStorage.setItem('user', JSON.stringify(user));
  } catch (error) {
    console.error('Error saving token to user object:', error);
  }
};

/**
 * Clear user and token from localStorage
 * Called on logout or 401 errors
 */
export const clearUserFromLocalStorage = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('adminToken');
  localStorage.removeItem('token');
};

/**
 * Get current user from localStorage
 * @returns {object|null} - User object or null
 */
export const getCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user')) || null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};
