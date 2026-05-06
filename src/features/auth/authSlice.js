import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from './authService';
import { getTokenFromLocalStorage } from '../../utils/tokenUtil';

// Fonction sécurisée pour récupérer l'utilisateur au démarrage
const getInitialUser = () => {
    try {
        const token = getTokenFromLocalStorage();
        const storedUser = localStorage.getItem('user');
        
        // Si la chaîne est "undefined" ou nulle, on ne parse pas
        if (!token || !storedUser || storedUser === "undefined") {
            return null;
        }
        return JSON.parse(storedUser);
    } catch (error) {
        return null;
    }
};

const initialUser = getInitialUser();

const initialState = {
    user: initialUser,
    isAuthenticated: !!initialUser, // true si initialUser n'est pas nul
    loading: false,
    error: null,
};

// Login action
export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async (credentials, thunkAPI) => {
        try {
            return await authService.login(credentials);
        } catch (error) {
            return thunkAPI.rejectWithValue(error.message || 'Échec de connexion');
        }
    }
);

// Register action
export const registerUser = createAsyncThunk(
    'auth/registerUser',
    async (userData, thunkAPI) => {
        try {
            return await authService.register(userData);
        } catch (error) {
            return thunkAPI.rejectWithValue(error.message || 'Échec inscription');
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.error = null;
            authService.logout(); // Nettoie le localStorage via le service
        },
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Login
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.user = action.payload;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.isAuthenticated = false;
            })
            // Register
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.user = action.payload;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.isAuthenticated = false;
            });
    },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;