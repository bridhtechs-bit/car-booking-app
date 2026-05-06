import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import carsReducer from '../features/cars/carsSlice';
import usersReducer from '../features/users/usersSlice';
import bookingsReducer from '../features/bookings/bookingsSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    cars: carsReducer,
    users: usersReducer,
    bookings: bookingsReducer,
  },
});

export default store;
