import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as bookingService from "./bookingService";

const initialState = {
  bookings: [],
  currentBooking: null,
  loading: false,
  error: null,
  success: false,
  message:'',
};

// Async thunks
export const createNewBooking = createAsyncThunk(
  "booking/createBooking", async (bookingData, thunkAPI) => {
    try {
      const res = await bookingService.createBooking(bookingData);
      return res;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message || error);
    }
  }
);

export const fetchUserBookings = createAsyncThunk(
  "booking/getUserBookings",
  async (_, { rejectWithValue }) => {
    try {
      const res = await bookingService.getUserBookings();
      return res;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// export const fetchBookingById = createAsyncThunk(
//   "booking/getBookingById",
//   async (id, { rejectWithValue }) => {
//     try {
//       const res = await bookingService.getBookingById(id);
//       return res;
//     } catch (error) {
//       return rejectWithValue(error);
//     }
//   }
// );

export const removeBooking = createAsyncThunk(
  "booking/cancelBooking",
  async (id, thunkAPI) => {
    try {
      const res = await bookingService.cancelBooking(id);
      return res;
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

export const updateExistingBooking = createAsyncThunk(
  "booking/updateBooking",
  async ({ id, bookingData }, thunkAPI) => {
    try {
      const res = await bookingService.updateBooking(id, bookingData);
      return res;
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

const bookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    resetBookingState: (state) => {
      state.success = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Create booking
    builder.addCase(createNewBooking.pending, (state) => {
      state.loading = true;
      state.success = false;
    });
    builder.addCase(createNewBooking.fulfilled, (state, action) => {
      state.loading = false;
      state.currentBooking = action.payload;
      state.bookings.push(action.payload);
      state.success = true;
    });
    builder.addCase(createNewBooking.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || 'Failed to create booking';
      state.success = false;
      state.message= action.payload
    });

    // Get user bookings
    builder.addCase(fetchUserBookings.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchUserBookings.fulfilled, (state, action) => {
      state.loading = false;
      // action.payload est maintenant directement un array []
      state.bookings = Array.isArray(action.payload) ? action.payload : [];
      // ✅ Do NOT set success = true for data fetching
      // Only createNewBooking should set success = true
    });
    builder.addCase(fetchUserBookings.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Cancel booking
    builder.addCase(removeBooking.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(removeBooking.fulfilled, (state, action) => {
      state.loading = false;
      state.bookings = state.bookings.filter((b) => b._id !== action.payload._id);
      state.success = true;
    });
    builder.addCase(removeBooking.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Update booking
    builder.addCase(updateExistingBooking.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(updateExistingBooking.fulfilled, (state, action) => {
      state.loading = false;
      const index = state.bookings.findIndex(
        (b) => b._id === action.payload._id
      );
      if (index > -1) {
        state.bookings[index] = action.payload;
      }
      state.currentBooking = action.payload;
      state.success = true;
    });
    builder.addCase(updateExistingBooking.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
  },
});

export const { resetBookingState } = bookingSlice.actions;
export default bookingSlice.reducer;
