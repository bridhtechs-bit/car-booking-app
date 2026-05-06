import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { getAllCars } from '../features/car/carSlice';
import { fetchUserBookings } from '../features/auth/bookingSlice';

/**
 * Custom hook to refresh cars and bookings data periodically
 * This ensures frontend stays in sync with backend data changes
 * 
 * Usage: useRefreshData(intervalMs, shouldFetchBookings)
 * Example: useRefreshData(5 * 60 * 1000, true) // 5 minutes, fetch bookings too
 */
export const useRefreshData = (intervalMs = 5 * 60 * 1000, shouldFetchBookings = true) => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Fetch data immediately on mount
    dispatch(getAllCars());
    if (shouldFetchBookings) {
      dispatch(fetchUserBookings());
    }

    // Set up interval to refresh data
    const intervalId = setInterval(() => {
      console.log('🔄 Refreshing cars and bookings data...');
      dispatch(getAllCars());
      if (shouldFetchBookings) {
        dispatch(fetchUserBookings());
      }
    }, intervalMs);

    // Cleanup interval on component unmount
    return () => {
      clearInterval(intervalId);
    };
  }, [dispatch, intervalMs, shouldFetchBookings]);
};

export default useRefreshData;
