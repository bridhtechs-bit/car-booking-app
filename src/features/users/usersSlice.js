import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { base_url } from '../../utils/base_url';
import { getTokenFromLocalStorage } from '../../utils/tokenUtil';

const getConfig = () => ({
  headers: { Authorization: `Bearer ${getTokenFromLocalStorage()}` }
});

export const getUsers = createAsyncThunk('users/getUsers', async (_, { rejectWithValue }) => {
  try {
    const res = await axios.get(`${base_url}/auth/allusers`, getConfig());
    return res.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const deleteUser = createAsyncThunk('users/deleteUser', async (id, { rejectWithValue }) => {
  try {
    await axios.delete(`${base_url}/auth/${id}`, getConfig());
    return id;
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

const usersSlice = createSlice({
  name: 'users',
  initialState: { list: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getUsers.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(getUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.data || action.payload;
      })
      .addCase(getUsers.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      
      .addCase(deleteUser.pending, (state) => { state.loading = true; })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.list = state.list.filter(u => u._id !== action.payload);
      })
      .addCase(deleteUser.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  }
});

export default usersSlice.reducer;
