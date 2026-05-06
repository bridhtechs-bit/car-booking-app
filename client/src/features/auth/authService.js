import api from '../../services/api';
import { saveUserToLocalStorage, clearUserFromLocalStorage, getCurrentUser } from '../../utils/tokenUtil';

/**
 * Authentication Service
 * Handles all auth-related API calls
 * Note: JWT token is automatically added by api.interceptors
 */

/**
 * Register a new user
 * @param {object} userData - User registration data { name, email, password }
 * @returns {object} - User object with tokens
 */
const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    const user = response.data.data || response.data;
    
    if (user) {
      // Standardize token field name to accessToken
      if (user.token && !user.accessToken) {
        user.accessToken = user.token;
      }
      saveUserToLocalStorage(user);
      return user;
    }
    throw new Error('Invalid registration response');
  } catch (error) {
    console.error('Registration error:', error.response?.data?.message || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Login user
 * @param {object} credentials - Login credentials { email, password }
 * @returns {object} - User object with tokens
 */
const login = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    const user = response.data.data || response.data;
    
    if (user) {
      // Standardize token field name to accessToken
      if (user.token && !user.accessToken) {
        user.accessToken = user.token;
      }
      saveUserToLocalStorage(user);
      return user;
    }
    throw new Error('Invalid login response');
  } catch (error) {
    console.error('Login error:', error.response?.data?.message || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Logout user
 * Clears user data from localStorage
 */
const logout = () => {
  try {
    // Call logout endpoint if available
    api.post('/auth/logout').catch(() => {
      // Ignore errors, logout locally regardless
    });
  } finally {
    clearUserFromLocalStorage();
  }
};

/**
 * Refresh access token
 * @returns {object} - New user object with fresh tokens
 */
const refreshToken = async () => {
  try {
    const response = await api.post('/auth/refresh-token');
    const user = response.data.data || response.data;
    
    if (user) {
      // Standardize token field name
      if (user.token && !user.accessToken) {
        user.accessToken = user.token;
      }
      saveUserToLocalStorage(user);
      return user;
    }
    throw new Error('Failed to refresh token');
  } catch (error) {
    console.error('Token refresh error:', error.response?.data?.message || error.message);
    clearUserFromLocalStorage();
    throw error;
  }
};

/**
 * Get current logged-in user
 * @returns {object|null} - Current user object or null if not logged in
 */
const getCurrentUserData = () => {
  return getCurrentUser();
};

/**
 * Check if user is authenticated
 * @returns {boolean} - true if user has valid token
 */
const isAuthenticated = () => {
  const user = getCurrentUser();
  return user && (user.accessToken || user.token) ? true : false;
};

/**
 * Forgot password request
 * @param {string} email - User email
 * @returns {object} - Response from server
 */
const forgotPassword = async (email) => {
  try {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  } catch (error) {
    console.error('Forgot password error:', error.response?.data?.message || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Reset password with token
 * @param {string} token - Password reset token
 * @param {string} newPassword - New password
 * @returns {object} - Response from server
 */
const resetPassword = async (token, newPassword) => {
  try {
    const response = await api.post(`/auth/reset-password/${token}`, { password: newPassword });
    return response.data;
  } catch (error) {
    console.error('Reset password error:', error.response?.data?.message || error.message);
    throw error.response?.data || error;
  }
};

const authService = {
  register,
  login,
  logout,
  refreshToken,
  getCurrentUser: getCurrentUserData,
  isAuthenticated,
  forgotPassword,
  resetPassword,
};

export default authService;
