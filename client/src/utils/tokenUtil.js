import { jwtDecode } from 'jwt-decode';

/**
 * Check if JWT token is expired
 * @param {string} token - JWT token to check
 * @returns {boolean} - true if expired, false if valid
 */
export const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    // If expiration time has passed, token is invalid
    return decoded.exp < currentTime;
  } catch (error) {
    console.warn('Error decoding token:', error);
    return true; // Decoding error = token invalid
  }
};

/**
 * Save user data with tokens to localStorage
 * @param {object} user - User object with accessToken and refreshToken
 */
export const saveUserToLocalStorage = (user) => {
  try {
    localStorage.setItem('user', JSON.stringify(user));
  } catch (error) {
    console.error('Error saving user to localStorage:', error);
  }
};

/**
 * Clear user data from localStorage
 */
export const clearUserFromLocalStorage = () => {
  try {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
};

/**
 * Get current user from localStorage
 * @returns {object|null} - User object or null
 */
export const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    // Sécurité contre null, undefined ou la chaîne "undefined"
    if (!userStr || userStr === "undefined") return null; 
    
    return JSON.parse(userStr);
  } catch (error) {
    console.warn('Error retrieving user:', error);
    return null;
  }
};

/**
 * Get access token from localStorage
 * Checks if token exists and is not expired
 * @returns {string|null} - Valid access token or null
 */
export const getTokenFromLocalStorage = () => {
  try {
    const user = getCurrentUser(); // On réutilise la fonction sécurisée au-dessus
    
    const token = user?.accessToken || user?.token;
    
    if (token && !isTokenExpired(token)) {
      return token;
    }
    return null;
  } catch (error) {
    return null;
  }
};