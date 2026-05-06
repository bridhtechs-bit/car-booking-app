import api from '../../services/api';
import { saveTokenToLocalStorage, clearUserFromLocalStorage, getTokenFromLocalStorage } from '../../utils/tokenUtil';

/**
 * Register new admin user
 * @param {object} userData - { email, password, name }
 * @returns {object} - User data with token
 */
const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    // Handle both 'token' and 'accessToken' field names
    const token = response.data.token || response.data.accessToken;
    if (response.data && token) {
      const user = {
        id: response.data._id || response.data.id,
        email: response.data.email,
        name: response.data.name,
        role: response.data.role || 'admin',
        token: token,
        accessToken: token,
      };
      localStorage.setItem('user', JSON.stringify(user));
      saveTokenToLocalStorage(token);
    }
    return response.data;
  } catch (error) {
    console.error('Registration error:', error.response?.data || error.message);
    throw error.response?.data || error.message;
  }
};

/**
 * Login admin user
 * @param {object} credentials - { email, password }
 * @returns {object} - User data with token
 */
const login = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    // Handle both 'token' and 'accessToken' field names
    const token = response.data.token || response.data.accessToken;
    if (response.data && token) {
      const user = {
        id: response.data._id || response.data.id,
        email: response.data.email,
        name: response.data.name,
        role: response.data.role || 'admin',
        token: token,
        accessToken: token,
      };
      localStorage.setItem('user', JSON.stringify(user));
      saveTokenToLocalStorage(token);
    }
    return response.data;
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    throw error.response?.data || error.message;
  }
};

// Login owner user (for admin panel access)
const loginOwner = async (credentials) => {
  try {
    const response = await api.post('/auth/loginowner', credentials);
    // Handle both 'token' and 'accessToken' field names
    const token = response.data.token || response.data.accessToken;
    if (response.data && token) {
      const user = {
        id: response.data._id || response.data.id,
        email: response.data.email,
        name: response.data.name,
        role: response.data.role || 'owner',
        token: token,
        accessToken: token,
      };
      localStorage.setItem('user', JSON.stringify(user));
      saveTokenToLocalStorage(token);
    }
    return response.data;
  } catch (error) {
    console.error('Login owner error:', error.response?.data || error.message);
    throw error.response?.data || error.message;
  }
};


/**
 * Refresh access token using refresh token
 * @returns {object} - New token
 */
const refreshToken = async () => {
  try {
    const response = await api.post('/auth/refresh-token');
    if (response.data && response.data.token) {
      saveTokenToLocalStorage(response.data.token);
    }
    return response.data;
  } catch (error) {
    console.error('Refresh token error:', error.response?.data || error.message);
    clearUserFromLocalStorage();
    throw error.response?.data || error.message;
  }
};

/**
 * Logout admin user
 * Clears tokens and user data from localStorage
 */
const logout = () => {
  clearUserFromLocalStorage();
};

/**
 * Get current logged-in user
 * @returns {object|null} - User data or null if not logged in
 */
const getCurrentUser = () => {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

/**
 * Check if user is authenticated
 * @returns {boolean} - true if valid token exists
 */
const isAuthenticated = () => {
  return !!getTokenFromLocalStorage();
};

/**
 * Update user profile
 * @param {object} updateData - Fields to update
 * @returns {object} - Updated user
 */
const updateProfile = async (updateData) => {
  try {
    const response = await api.put('/auth/update-profile', updateData);
    if (response.data) {
      const user = getCurrentUser();
      const updatedUser = { ...user, ...response.data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
    return response.data;
  } catch (error) {
    console.error('Update profile error:', error.response?.data || error.message);
    throw error.response?.data || error.message;
  }
};

const authService = {
  register,
  login,
  loginOwner,
  logout,
  getCurrentUser,
  isAuthenticated,
  refreshToken,
  updateProfile,
};

export default authService;