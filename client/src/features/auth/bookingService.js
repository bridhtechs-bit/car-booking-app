import api from "../../services/api";

/**
 * Booking Service - All API calls for booking operations
 * Uses axios instance with automatic JWT token handling
 */

// Create a new booking
export const createBooking = async (bookingData) => {
  try {
    const response = await api.post("/bookings/createbooking", bookingData);
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error creating booking:', error.response?.data?.message || error.message);
    throw error.response?.data || error;
  }
};

// Get user's bookings
export const getUserBookings = async (page = 1, limit = 10) => {
  try {
    const response = await api.get(`/bookings/my-bookings?page=${page}&limit=${limit}`);
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching user bookings:', error.response?.data?.message || error.message);
    throw error.response?.data || error;
  }
};

// Cancel a booking
export const cancelBooking = async (id) => {
  try {
    const response = await api.put(`/bookings/update/${id}`, { status: 'cancelled' });
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error cancelling booking:', error.response?.data?.message || error.message);
    throw error.response?.data || error;
  }
};

// Get booking details
export const getBookingDetails = async (id) => {
  try {
    const response = await api.get(`/bookings/${id}`);
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error fetching booking details:', error.response?.data?.message || error.message);
    throw error.response?.data || error;
  }
};

// Update booking
export const updateBooking = async (id, bookingData) => {
  try {
    const response = await api.put(`/bookings/update/${id}`, bookingData);
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error updating booking:', error.response?.data?.message || error.message);
    throw error.response?.data || error;
  }
};
