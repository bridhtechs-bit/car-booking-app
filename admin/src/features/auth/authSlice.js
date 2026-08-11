import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from './authService';
import { getTokenFromLocalStorage } from '../../utils/tokenUtil';

const initialState = {
  admin: null,
  token: localStorage.getItem('adminToken') || null,
  loading: false,
  error: null,
  isAuthenticated: getTokenFromLocalStorage() ? true : false,
};

export const loginAdmin = createAsyncThunk(
  'auth/loginAdmin',
  async (credentials, thunkAPI) => {
    try {
      const res = await authService.login(credentials);
      return res;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);

//owner login for admin panel access
export const loginOwner = createAsyncThunk(
  'auth/loginOwner',
  async (credentials, thunkAPI) => {
    try {
      const res = await authService.loginOwner(credentials);
      return res;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);


//logout admin user
export const logoutAdmin = createAsyncThunk(
  'auth/logoutAdmin',
  async (_, thunkAPI) => {
    try {
      await authService.logout();
      return;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);


const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loginAdmin.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.admin = action.payload;
        state.token = action.payload.accessToken;
        localStorage.setItem('adminToken', action.payload.accessToken);
        state.isAuthenticated = true;
      })
      .addCase(loginAdmin.rejected, (state, action) => { 
        state.loading = false; 
        state.error = action.payload?.message || action.error?.message || 'Login failed'; 
      })

      //owner login cases
      .addCase(loginOwner.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loginOwner.fulfilled, (state, action) => {
        state.loading = false;
        state.admin = action.payload;
        state.token = action.payload.accessToken;
        localStorage.setItem('adminToken', action.payload.accessToken);
        state.isAuthenticated = true;
      })
      .addCase(loginOwner.rejected, (state, action) => { 
        state.loading = false; 
        state.error = action.payload?.message || action.error?.message || 'Login failed'; 
      })

      //logout cases
      .addCase(logoutAdmin.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(logoutAdmin.fulfilled, (state) => {
        state.loading = false;
        state.admin = null;
        state.token = null;
        localStorage.removeItem('adminToken');
        state.isAuthenticated = false;
      })
      .addCase(logoutAdmin.rejected, (state, action) => { 
        state.loading = false; 
        state.error = action.payload?.message || action.error?.message || 'Logout failed'; 
      })
  }
});


export default authSlice.reducer;
