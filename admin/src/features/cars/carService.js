import api from '../../services/api';

/**
 * Get all cars (public listing)
 * @returns {array} - List of all cars
 */
const getCars = async () => {
  try {
    const response = await api.get('/cars/getcars');
    return response.data?.data || response.data || [];
  } catch (error) {
    console.error('Get cars error:', error.response?.data || error.message);
    throw error.response?.data || error.message;
  }
};

/**
 * Get cars owned by current admin user
 * @returns {array} - List of admin's cars
 */
const getAdminCars = async () => {
  try {
    const response = await api.get('/cars/mycars');
    return response.data?.data || response.data || [];
  } catch (error) {
    console.error('Get admin cars error:', error.response?.data || error.message);
    throw error.response?.data || error.message;
  }
};

/**
 * Get single car by ID
 * @param {string} id - Car ID
 * @returns {object} - Car details
 */
const getCarById = async (id) => {
  try {
    if (!id) throw new Error('Car ID is required');
    const url = `/cars/${id}`;
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Get car by ID error:', error.response?.data || error.message);
    throw error.response?.data || error.message;
  }
};

/**
 * Create new car listing
 * @param {object} carData - { brand, model, price, image, seats, ...}
 * @returns {object} - Created car
 */
const createCar = async (carData) => {
  try {
    const response = await api.post('/cars/create', carData);
    return response.data?.data || response.data;
  } catch (error) {
    console.error('Create car error:', error.response?.data || error.message);
    throw error.response?.data || error.message;
  }
};

/**
 * Update car listing
 * @param {string} id - Car ID
 * @param {object} updateData - Fields to update
 * @returns {object} - Updated car
 */
const updateCar = async (id, updateData) => {
  try {
    if (!id) throw new Error('Car ID is required');
    const url = `/cars/update/${id}`;
    const response = await api.put(url, updateData);
    return response.data?.data || response.data;
  } catch (error) {
    console.error('Update car error:', error.response?.data || error.message);
    throw error.response?.data || error.message;
  }
};

/**
 * Delete car listing
 * @param {string} id - Car ID
 */
const deleteCar = async (id) => {
  try {
    if (!id) throw new Error('Car ID is required');
    const url = `/cars/delete/${id}`;
    await api.delete(url);
  } catch (error) {
    console.error('Delete car error:', error.response?.data || error.message);
    throw error.response?.data || error.message;
  }
};

/**
 * Toggle featured status of a car
 * @param {string} id - Car ID
 * @param {boolean} featured - Featured status
 * @returns {object} - Updated car
 */
const toggleFeatured = async (id, featured) => {
  try {
    if (!id) throw new Error('Car ID is required');
    const url = `/cars/${id}`;
    const response = await api.put(url, { featured });
    return response.data?.data || response.data;
  } catch (error) {
    console.error('Toggle featured error:', error.response?.data || error.message);
    throw error.response?.data || error.message;
  }
};

const carService = {
  getCars,
  getAdminCars,
  getCarById,
  createCar,
  updateCar,
  deleteCar,
  toggleFeatured,
};

export default carService;
