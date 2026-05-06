import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import carService from './carService';

const carDefaultState = {
    _id:null,
    name: '',
    brand:'',
    pricePerDay: 0,
    category: '',
    fuelType: '',
    transmission: '',
    seats: 5,
}

const initialState = {
  cars: [],
  car: carDefaultState,
    loading: false,
    isError: null,
    isSuccess: false,
    message: '',
};

export const getCars = createAsyncThunk('cars/getCars', async (_, { rejectWithValue }) => {
  try {
    const res = await carService.getCars();
    return res;
  } catch (error) {
    return rejectWithValue(error);
  }
});

export const getAdminCar = createAsyncThunk('cars/getAdminCar', async (_, thunkAPI) => {
  try {
    const res = await carService.getAdminCars();
    return res;
  } catch (error) {
    return thunkAPI.rejectWithValue(error);
  }
});


export const createCar = createAsyncThunk('cars/createCar', async (carData, thunkAPI) => {
  try {
    const res = await carService.createCar(carData);
    return res;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.error || error.message);
  }
});

export const updateCar = createAsyncThunk('cars/updateCar', async ({ id, updateData }, thunkAPI) => {
  try {
    const res = await carService.updateCar(id, updateData);
    return res;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response.data.message);
  }
});

export const deleteCar = createAsyncThunk('cars/deleteCar', async (id, thunkAPI) => {
  try {
    await carService.deleteCar(id);
    return id;
  } catch (error) {
    return thunkAPI.rejectWithValue(error);
  }
});

export const toggleFeatured = createAsyncThunk('cars/toggleFeatured', async ({ id, featured }, thunkAPI) => {
  try {
    const res = await carService.toggleFeatured(id, featured);
    return res;
  } catch (error) {
    return thunkAPI.rejectWithValue(error);
  }
});

const carsSlice = createSlice({
    name: 'cars',
    initialState,
    reducers: {
      resetSuccess: (state) => {
        state.isSuccess = false;
      }
    },
    extraReducers: (builder) => {
    builder
      .addCase(getCars.pending, (state) => { 
        state.loading = true; 
        state.error = null; 
       })

      .addCase(getCars.fulfilled, (state, action) => 
        { state.loading = false; 
        state.cars = action.payload.data || action.payload; 
     })

    .addCase(getCars.rejected, (state, action) => 
        { state.loading = false; 
        state.isError = action.payload; 
    })

    //get admin cars
    .addCase(getAdminCar.pending, (state) => { state.loading = true; state.isError = null; })
    .addCase(getAdminCar.fulfilled, (state, action) => { state.loading = false; state.cars = action.payload.data || action.payload; })
    .addCase(getAdminCar.rejected, (state, action) => { state.loading = false; state.isError = action.payload; })

    //create car
      .addCase(createCar.pending, (state) => { state.loading = true; state.isError = null; })
      .addCase(createCar.fulfilled, (state, action) => 
        { state.car = action.payload.data || action.payload; 
        state.isSuccess = true; 
        state.cars.unshift(state.car);
        })
      .addCase(createCar.rejected, (state, action) => 
        { state.loading = false;
          state.isSuccess = false;
          state.isError = action.payload;
         })

         //update car
         .addCase(updateCar.pending, (state) => { state.loading = true; state.isError = null; })
        .addCase(updateCar.fulfilled, (state, action) => {
          state.car = action.payload;
          state.isSuccess = true;
        })
      .addCase(updateCar.rejected, (state, action) => { 
        state.isError = action.payload; 
        state.isSuccess = false;
      })

      .addCase(deleteCar.fulfilled, (state, action) => { state.cars = state.cars.filter(c => c._id !== action.payload); state.isSuccess = true; })
      .addCase(deleteCar.rejected, (state, action) => { state.isError = action.payload; })

      .addCase(toggleFeatured.fulfilled, (state, action) => { state.cars = state.cars.map(c => c._id === action.payload._id ? action.payload : c); })
  }
});
export const { resetSuccess } = carsSlice.actions;
export default carsSlice.reducer;
