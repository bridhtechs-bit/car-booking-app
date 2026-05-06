import { createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import bookingsService from './bookingsService';

const initialState = {
  bookings: [],
  currentBooking: null,
  loading: false,
  error: null,
  success: false,
  message: '',
};

// Async thunks


//owner geting is booking
export const getBookings = createAsyncThunk('bookings/getBookings', async (_, thunkApi) => {
  try {
    const res = await bookingsService.getBookings();
    return res;
  } catch (error) {
    return thunkApi.rejectWithValue(error.response?.data || error.message);
  }
});

export const updateBookingStatus = createAsyncThunk(
  'bookings/updateStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const res = await bookingsService.updateBookingStatus(id, status);
      return res.data.data || res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const cancelBooking = createAsyncThunk('bookings/cancelBooking', async (id, { rejectWithValue }) => {
  try {
    await bookingsService.cancelBooking(id);
    return id;
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

const bookingsSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
      resetBookingState: (state) => {
        state.bookings = [];
        state.currentBooking = null;
        state.loading = false;
        state.error = null;
        state.success = false;
        state.message = '';
      },
        setCurrentBooking: (state, action) => {
          state.currentBooking = action.payload;
        }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getBookings.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(getBookings.fulfilled, (state, action) => {
        state.loading = false;
        // action.payload est maintenant directement un array []
        state.bookings = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(getBookings.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      
      .addCase(cancelBooking.pending, (state) => { state.loading = true; })
      .addCase(cancelBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload;
      })
      .addCase(updateBookingStatus.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.bookings.findIndex(r => r._id === action.payload._id);
        if (idx >= 0) state.bookings[idx] = action.payload;
      });
  }
});

export const { resetBookingState, setCurrentBooking } = bookingsSlice.actions;

export default bookingsSlice.reducer;
