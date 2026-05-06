import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice'
import carReducer from '../features/car/carSlice'
import bookingReducer from '../features/auth/bookingSlice'

export default configureStore({
  reducer: {
    auth: authReducer,
    car: carReducer,
    booking: bookingReducer,
  }
})