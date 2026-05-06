import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import carService from "./carService";

const initialState = {
  cars: [],
  featuredCars: [],
  selectedCar: null,
  filteredCars: [],
  filters: {
    category: "",
    transmission: "",
    fuelType: "",
    priceRange: [0, 1000],
    searchTerm: "",
  },
  loading: false,
  error: null,
};

// Async thunks
export const getAllCars = createAsyncThunk(
  "car/getAllCars",
  async (_, { rejectWithValue }) => {
    try {
      return await carService.fetchAllCars();
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const getFeaturedCars = createAsyncThunk(
  "car/getFeaturedCars",
  async (_, { rejectWithValue }) => {
    try {
      return await carService.fetchFeaturedCars();
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);


//get owner cars
export const myCars = createAsyncThunk(
  "car/myCars",
  async (_, { rejectWithValue }) => {
    try {
      return await carService.myCars();
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);


export const getCarById = createAsyncThunk(
  "car/getCarById",
  async (id, { rejectWithValue }) => {
    try {
      return await carService.fetchCarById(id);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const getCarsByCategory = createAsyncThunk(
  "car/getCarsByCategory",
  async (category, { rejectWithValue }) => {
    try {
      return await carService.fetchCarsByCategory(category);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const filterCarsAction = createAsyncThunk(
  "car/filterCars",
  async (filters, { rejectWithValue }) => {
    try {
      return await carService.filterCars(filters);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const carSlice = createSlice({
  name: "car",
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    setSearchTerm: (state, action) => {
      state.filters.searchTerm = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Get all cars
    builder.addCase(getAllCars.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(getAllCars.fulfilled, (state, action) => {
      state.loading = false;
      state.cars = action.payload;
      state.filteredCars = action.payload;
    });
    builder.addCase(getAllCars.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    //get owner cars
    builder.addCase(myCars.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(myCars.fulfilled, (state, action) => {
      state.loading = false;
      state.cars = action.payload;
      state.filteredCars = action.payload;
    });
    builder.addCase(myCars.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });


    // Get featured cars
    builder.addCase(getFeaturedCars.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(getFeaturedCars.fulfilled, (state, action) => {
      state.loading = false;
      state.featuredCars = action.payload;
    });
    builder.addCase(getFeaturedCars.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Get car by ID
    builder.addCase(getCarById.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(getCarById.fulfilled, (state, action) => {
      state.loading = false;
      state.selectedCar = action.payload;
    });
    builder.addCase(getCarById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Get cars by category
    builder.addCase(getCarsByCategory.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(getCarsByCategory.fulfilled, (state, action) => {
      state.loading = false;
      state.filteredCars = action.payload;
    });
    builder.addCase(getCarsByCategory.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Filter cars
    builder.addCase(filterCarsAction.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(filterCarsAction.fulfilled, (state, action) => {
      state.loading = false;
      state.filteredCars = action.payload;
    });
    builder.addCase(filterCarsAction.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
  },
});

export const { setFilters, resetFilters, setSearchTerm } = carSlice.actions;
export default carSlice.reducer;
