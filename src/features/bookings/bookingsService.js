import api from '../../services/api';

/**
 * Get all bookings for current admin's cars
 * @returns {array} - List of bookings for admin's cars
 */
const getBookings = async () => {
  try {
    const response = await api.get('/bookings/admin-bookings');
    return response.data?.data || response.data || [];
  } catch (error) {
    console.error('Get bookings error:', error.response?.data || error.message);
    throw error.response?.data || error.message;
  }
};

/**
 * Get single booking by ID
 * @param {string} id - Booking ID
 * @returns {object} - Booking details
 */
const getBookingById = async (id) => {
  try {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  } catch (error) {
    console.error('Get booking error:', error.response?.data || error.message);
    throw error.response?.data || error.message;
  }
};

/**
 * Update booking status (approved, rejected, completed, cancelled)
 * @param {string} id - Booking ID
 * @param {string} status - New status
 * @returns {object} - Updated booking
 */
const updateBookingStatus = async (id, status) => {
  try {
    if (!id) throw new Error('Booking ID is required');
    const url = `/bookings/update/${id}`;
    const response = await api.put(url, { status });
    return response.data?.data || response.data;
  } catch (error) {
    console.error('Update booking status error:', error.response?.data || error.message);
    throw error.response?.data || error.message;
  }
};

/**
 * Cancel a booking
 * @param {string} id - Booking ID
 * @returns {object} - Cancelled booking
 */
const cancelBooking = async (id) => {
  try {
    if (!id) throw new Error('Booking ID is required');
    const url = `/bookings/${id}`;
    const response = await api.delete(url);
    return response.data;
  } catch (error) {
    console.error('Cancel booking error:', error.response?.data || error.message);
    throw error.response?.data || error.message;
  }
};

/**
 * Update booking details
 * @param {string} id - Booking ID
 * @param {object} bookingData - Data to update
 * @returns {object} - Updated booking
 */
const updateBooking = async (_id, bookingData) => {
  try {
    if (!_id) throw new Error('Booking ID is required');
    const url = `/bookings/${_id}`;
    const response = await api.put(url, bookingData);
    return response.data?.data || response.data;
  } catch (error) {
    console.error('Update booking error:', error.response?.data || error.message);
    throw error.response?.data || error.message;
  }
};

/**
 * Get booking statistics for admin
 * @returns {object} - Booking stats (total, approved, pending, etc.)
 */
const getBookingStats = async () => {
  try {
    const response = await api.get('/bookings/stats');
    return response.data;
  } catch (error) {
    console.error('Get booking stats error:', error.response?.data || error.message);
    return {};
  }
};

const bookingsService = {
  getBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
  updateBooking,
  getBookingStats,
};

export default bookingsService;
