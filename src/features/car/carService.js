import api from "../../services/api";

/**
 * Car Service - All API calls for car operations
 * Uses axios instance with automatic JWT token handling
 */

// Fetch all cars with pagination and filters
const fetchAllCars = async (page = 1, limit = 10, filters = {}) => {
  try {
    const params = new URLSearchParams({ page, limit, ...filters });
    const response = await api.get(`/cars/getcars?${params}`);
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error fetching cars:', error.response?.data?.message || error.message);
    throw error.response?.data || error;
  }
};

//get owner cars
const myCars = async () => {
  try {
    const response = await api.get("/cars/mycars");
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error fetching my cars:', error.response?.data?.message || error.message);
    throw error.response?.data || error;
  }
};


// Fetch featured cars (top rated)
const fetchFeaturedCars = async () => {
  try {
    const response = await api.get("/cars/featured");
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error fetching featured cars:', error.response?.data?.message || error.message);
    throw error.response?.data || error;
  }
};

// Fetch car by ID
const fetchCarById = async (id) => {
  try {
    const response = await api.get(`/cars/${id}`);
    return response.data.data || response.data;
  } catch (error) {
    console.error(`Error fetching car ${id}:`, error.response?.data?.message || error.message);
    throw error.response?.data || error;
  }
};

// Fetch cars by category
const fetchCarsByCategory = async (category) => {
  try {
    const response = await api.get(`/cars/category?category=${category}`);
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error fetching cars by category:', error.response?.data?.message || error.message);
    throw error.response?.data || error;
  }
};

// Filter cars by multiple criteria
const filterCars = async (filters) => {
  try {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/cars/filter?${params}`);
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error filtering cars:', error.response?.data?.message || error.message);
    throw error.response?.data || error;
  }
};

const carService = {
  fetchAllCars,
  myCars,
  fetchFeaturedCars,
  fetchCarById,
  fetchCarsByCategory,
  filterCars
};

export default carService;
