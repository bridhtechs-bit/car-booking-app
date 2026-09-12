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
    const refreshData = () => {
      // Skip fetching if the tab is hidden to save bandwidth and server load
      if (document.hidden) return;

      console.log('🔄 Refreshing cars and bookings data...');
      dispatch(getAllCars());
      if (shouldFetchBookings) {
        dispatch(fetchUserBookings());
      }
    };

    // Fetch data immediately on mount
    refreshData();

    // Set up interval to refresh data
    const intervalId = setInterval(refreshData, intervalMs);

    // Refresh when user returns to active tab
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refreshData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup interval on component unmount
    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [dispatch, intervalMs, shouldFetchBookings]);
};

export default useRefreshData;
