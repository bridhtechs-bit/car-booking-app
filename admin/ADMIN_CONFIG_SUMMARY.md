# Admin Frontend Configuration Summary

**Date**: Now
**Status**: ✅ Configured for Backend Integration (Port 5000)

## Changes Made

### 1. Environment Configuration
**File**: `.env`
```env
REACT_APP_API_BASE_URL=http://localhost:5000/api  # ✅ Fixed from 8000
REACT_APP_STRIPE_PUBLIC_KEY=pk_test_your_key_here
REACT_APP_APP_NAME=Car Booking App Admin
REACT_APP_VERSION=1.0.0
REACT_APP_DEBUG=false
```

### 2. API Base URL
**File**: `src/utils/base_url.js`
```javascript
// Uses environment variable with fallback
export const base_url = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
```

### 3. Centralized API Instance with Interceptors
**File**: `src/services/api.js` (Enhanced)
- **Request Interceptor**: Auto-includes JWT token in Authorization header
- **Response Interceptor**: Handles errors (401, 403, 404, 500)
- **401 Handling**: Automatically logs out and redirects to login
- **Base URL**: From environment variable (port 5000)

### 4. Token Management Utilities
**File**: `src/utils/tokenUtil.js` (ENHANCED)
- `getTokenFromLocalStorage()` - Gets valid token (checks expiration)
- `isTokenExpired(token)` - Validates token expiration using JWT decode
- `saveTokenToLocalStorage(token)` - Stores token in both places for consistency
- `clearUserFromLocalStorage()` - Clears all auth data on logout/401
- `getCurrentUser()` - Gets stored user object

**Storage Structure**:
```javascript
localStorage:
  - adminToken: "JWT_TOKEN"
  - user: { id, email, name, role, token }
```

### 5. Auth Service Refactored
**File**: `src/features/auth/authService.js` (REWRITTEN)
```javascript
- register(userData) - Register new admin user
- login(credentials) - Login with email/password
- logout() - Clear auth data
- getCurrentUser() - Get stored user
- isAuthenticated() - Check if token exists
- refreshToken() - Refresh expired token
- updateProfile(updateData) - Update user profile
```

**Uses**: Centralized `api` instance (auto-includes token via interceptor)

### 6. Car Service Refactored
**File**: `src/features/cars/carService.js` (REWRITTEN)
```javascript
- getCars() - Get all public cars
- getAdminCars() - Get cars owned by current admin
- getCarById(id) - Get single car details
- createCar(carData) - Create new car listing
- updateCar(id, updateData) - Update car
- deleteCar(id) - Delete car
- toggleFeatured(id, featured) - Toggle featured status
```

**Uses**: Centralized `api` instance (token auto-included)

### 7. Bookings Service Refactored
**File**: `src/features/bookings/bookingsService.js` (REWRITTEN)
```javascript
- getBookings() - Get all bookings for admin's cars
- getBookingById(id) - Get single booking
- updateBookingStatus(id, status) - Update booking status
- cancelBooking(id) - Cancel booking
- updateBooking(id, bookingData) - Update booking details
- getBookingStats() - Get booking statistics
```

**Uses**: Centralized `api` instance (token auto-included)

## Backend Integration Points

### Authentication Flow
1. User submits login form → `authService.login(credentials)`
2. Backend validates and returns JWT token
3. Token stored in `localStorage` (adminToken + user object)
4. Interceptor includes token in all future requests
5. On 401: Auto-logout and redirect to /login

### API Communication
- All services use **centralized `api` instance**
- **No manual header configuration** needed
- **Automatic token inclusion** in all requests
- **Consistent error handling** across all services

### Protected Routes
- `RequireAuth` component checks `authService.isAuthenticated()`
- Redirects unauthenticated users to /login
- Routes protected: /admin/dashboard, /admin/cars, /admin/bookings, /admin/users

## Backend Endpoints (Expected)

### Auth (5000/api/auth)
- POST `/auth/register` - Register admin
- POST `/auth/login` - Login
- POST `/auth/refresh-token` - Refresh token
- PUT `/auth/update-profile` - Update profile

### Cars (5000/api/cars)
- GET `/cars/getcars` - Get all cars
- GET `/cars/mycars` - Get admin's cars
- GET `/cars/{id}` - Get car details
- POST `/cars/create` - Create car
- PUT `/cars/update/{id}` - Update car
- DELETE `/cars/delete/{id}` - Delete car
- PUT `/cars/{id}/featured` - Toggle featured

### Bookings (5000/api/bookings)
- GET `/bookings/admin-bookings` - Get admin's bookings
- GET `/bookings/{id}` - Get booking details
- GET `/bookings/stats` - Get statistics
- PUT `/bookings/update/{id}` - Update status
- PUT `/bookings/{id}` - Update booking
- DELETE `/bookings/{id}` - Cancel booking

## Running Admin App

```bash
cd webApp/admin
npm install
npm start
```

**Access**: `http://localhost:3001`

## Verification Checklist

- [x] `.env` uses port 5000
- [x] `api.js` has request/response interceptors
- [x] `tokenUtil.js` handles token storage/validation
- [x] `authService.js` uses centralized API
- [x] `carService.js` uses centralized API
- [x] `bookingsService.js` uses centralized API
- [x] All services handle errors consistently
- [x] 401 responses trigger auto-logout
- [x] Token included automatically in all requests
- [x] Protected routes check `isAuthenticated()`

## Comparison with Client Setup

| Aspect | Client | Admin |
|--------|--------|-------|
| API Base URL | port 5000 ✅ | port 5000 ✅ |
| API Instance | Centralized | Centralized |
| Request Interceptor | JWT auto-include | JWT auto-include |
| Response Interceptor | 401 handling | 401 handling |
| Services | auth, car, booking | auth, car, booking |
| Token Storage | adminToken + user | adminToken + user |
| Protected Routes | RequireAuth | RequireAuth |

## Next Steps

1. **Test Admin Login**: Verify credentials work against backend
2. **Test Car Operations**: Create, read, update, delete cars
3. **Test Booking Management**: View and manage bookings
4. **Test Token Refresh**: Verify token refresh on expiration
5. **Full End-to-End**: Test complete admin workflow
6. **Load Testing**: Verify performance under load

## Notes

- Admin and Client share **identical architecture**
- Both use centralized API instances with interceptors
- Both handle 401 auto-logout consistently
- Token management is standardized across both frontends
- Running on port 3001 (admin) and port 3000 (client) simultaneously
