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
  reducers: {
    loginAdminStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginAdminSuccess: (state, action) => {
      state.loading = false;
      state.admin = action.payload;
      state.token = action.payload.accessToken;
      localStorage.setItem('adminToken', action.payload.accessToken);
      state.isAuthenticated = true;
    },
    loginAdminFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload || 'Login failed';
    },
    loginOwnerStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginOwnerSuccess: (state, action) => {
      state.loading = false;
      state.admin = action.payload;
      state.token = action.payload.accessToken;
      localStorage.setItem('adminToken', action.payload.accessToken);
      state.isAuthenticated = true;
    },
    loginOwnerFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload || 'Login failed';
    },
  },
  extraReducers: (builder) => {
    builder
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

export const {
  loginAdminStart,
  loginAdminSuccess,
  loginAdminFailure,
  loginOwnerStart,
  loginOwnerSuccess,
  loginOwnerFailure,
} = authSlice.actions;

export const loginAdmin = (credentials) => async (dispatch) => {
  dispatch(loginAdminStart());
  try {
    const res = await authService.login(credentials);
    dispatch(loginAdminSuccess(res));
    return res;
  } catch (err) {
    const error = err?.message || err || 'Login failed';
    dispatch(loginAdminFailure(error));
    return Promise.reject(error);
  }
};

export const loginOwner = (credentials) => async (dispatch) => {
  dispatch(loginOwnerStart());
  try {
    const res = await authService.loginOwner(credentials);
    dispatch(loginOwnerSuccess(res));
    return res;
  } catch (err) {
    const error = err?.message || err || 'Login failed';
    dispatch(loginOwnerFailure(error));
    return Promise.reject(error);
  }
};


export default authSlice.reducer;
