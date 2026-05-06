# Admin Frontend-Backend Integration Guide

## Overview

This guide documents how the Admin dashboard communicates with the Node.js backend API server.

**Backend**: Node.js Express (Port 5000)  
**Admin Frontend**: React (Port 3001)  
**API Base URL**: `http://localhost:5000/api`

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Admin Dashboard (3001)                  │
├─────────────────────────────────────────────────────────────┤
│  ┌─ Services Layer ──────────────────────────────────────┐  │
│  │ • authService.js (login, register, token refresh)    │  │
│  │ • carService.js (CRUD for cars)                      │  │
│  │ • bookingsService.js (booking management)            │  │
│  │ • usersService.js (user management)                  │  │
│  └───────────────────────────────────────────────────────┘  │
│               ▼ (Uses Centralized API)                      │
│  ┌─ Centralized API (api.js) ────────────────────────────┐  │
│  │ • Request Interceptor: Add JWT token header         │  │
│  │ • Response Interceptor: Handle 401, 403, errors     │  │
│  │ • Base URL: http://localhost:5000/api              │  │
│  └───────────────────────────────────────────────────────┘  │
│               ▼ (HTTP Requests)                             │
└─────────────────────────────────────────────────────────────┘
                            │
                   (Axios HTTP Requests)
                            │
        ┌───────────────────▼──────────────────┐
        │  Node.js Backend (Port 5000)         │
        ├──────────────────────────────────────┤
        │ Routes:                              │
        │ • POST /api/auth/login               │
        │ • POST /api/auth/register            │
        │ • POST /api/auth/refresh-token       │
        │ • GET /api/cars                      │
        │ • POST /api/cars/create              │
        │ • PUT /api/cars/update/:id           │
        │ • DELETE /api/cars/delete/:id        │
        │ • GET /api/bookings/admin-bookings   │
        │ • PUT /api/bookings/update/:id       │
        │ • GET /api/users                     │
        └──────────────────────────────────────┘
                      │
              (MongoDB - Local)
```

## Key Features

### 1. Automatic JWT Token Management

**Where**: `src/services/api.js` (Request Interceptor)

The API instance automatically includes JWT token in all requests:

```javascript
// Token is added automatically by interceptor
const response = await api.get('/cars/mycars');
// Becomes: GET /api/cars/mycars with header: Authorization: Bearer {token}
```

### 2. Automatic Token Storage

**Where**: `src/utils/tokenUtil.js`

After login, token is stored in two places for redundancy:

```javascript
localStorage.adminToken = "JWT_TOKEN"
localStorage.user = { id, email, name, role, token }
```

### 3. Auto-Logout on Token Expiration

**Where**: `src/services/api.js` (Response Interceptor)

When backend returns 401:

```
1. User makes API request
2. Server returns 401 (Unauthorized)
3. Interceptor detects 401
4. Calls clearUserFromLocalStorage()
5. Redirects to /login
6. User must login again
```

### 4. Consistent Error Handling

**Where**: All services use `api` instance

Errors are handled consistently across all services:

```javascript
// Standard error handling pattern
try {
  const response = await api.get('/endpoint');
  return response.data;
} catch (error) {
  console.error('Operation error:', error.response?.data || error.message);
  throw error.response?.data || error.message;
}
```

## Configuration

### Environment Variables

**File**: `.env`

```env
REACT_APP_API_BASE_URL=http://localhost:5000/api
REACT_APP_APP_NAME=Car Booking App Admin
REACT_APP_VERSION=1.0.0
REACT_APP_DEBUG=false
```

### API Base URL

**File**: `src/utils/base_url.js`

```javascript
export const base_url = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
```

## Request/Response Flow

### Successful Request

```
1. User Action (e.g., click "Get Cars" button)
   ▼
2. carService.getAdminCars() called
   ▼
3. API Interceptor runs:
   - Gets token from localStorage
   - Adds to headers: Authorization: Bearer {token}
   ▼
4. Axios sends request:
   GET http://localhost:5000/api/cars/mycars
   Headers: { Authorization: "Bearer eyJ..." }
   ▼
5. Backend receives, validates token, returns data
   ▼
6. Response Interceptor runs:
   - Checks status code
   - Returns response.data
   ▼
7. Service returns data to component
   ▼
8. Component updates UI
```

### Error Request (401 - Token Expired)

```
1. User makes request
   ▼
2. API Interceptor adds old/invalid token
   ▼
3. Backend returns 401 Unauthorized
   ▼
4. Response Interceptor detects 401:
   - Logs message
   - Calls clearUserFromLocalStorage()
   - Sets window.location.href = '/login'
   ▼
5. User redirected to login page
   ▼
6. User must provide credentials again
```

## Authentication Flow

### Login Process

```javascript
// 1. User submits email & password
const user = await authService.login({ email, password });

// 2. Behind the scenes:
// - Send: POST /api/auth/login { email, password }
// - Backend validates credentials
// - Backend returns: { _id, email, name, token }

// 3. Service stores token:
localStorage.adminToken = token;
localStorage.user = { id, email, name, role, token };

// 4. Interceptor includes in future requests automatically
```

### Token Refresh

```javascript
// Called when token is about to expire
const newTokenData = await authService.refreshToken();

// Behind the scenes:
// - Send: POST /api/auth/refresh-token
// - Backend validates refresh token in request
// - Backend returns new access token
// - Service updates localStorage with new token
```

### Logout Process

```javascript
authService.logout();

// Behind the scenes:
// - Clears localStorage.adminToken
// - Clears localStorage.user
// - Removes header: Authorization
// - User redirected to /login (in components)
```

## Service Layer Pattern

Each service follows the same pattern:

```javascript
import api from '../../services/api';

// All methods use 'api' instance which has interceptors

const serviceMethod = async (params) => {
  try {
    const response = await api.get('/endpoint', config);
    // Token added automatically by interceptor ✅
    // Error handling by interceptor ✅
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
```

### Available Services

#### 1. authService.js
- `register(userData)` - Create admin account
- `login(credentials)` - Login with email/password
- `logout()` - Logout user
- `refreshToken()` - Refresh expired token
- `getCurrentUser()` - Get logged-in user
- `isAuthenticated()` - Check if user is logged in
- `updateProfile(data)` - Update user profile

#### 2. carService.js
- `getCars()` - Get all public cars
- `getAdminCars()` - Get cars owned by logged-in admin
- `getCarById(id)` - Get single car details
- `createCar(carData)` - Create new car listing
- `updateCar(id, data)` - Update car details
- `deleteCar(id)` - Delete car
- `toggleFeatured(id, featured)` - Toggle featured status

#### 3. bookingsService.js
- `getBookings()` - Get all bookings for admin's cars
- `getBookingById(id)` - Get booking details
- `updateBookingStatus(id, status)` - Change booking status
- `cancelBooking(id)` - Cancel booking
- `updateBooking(id, data)` - Update booking details
- `getBookingStats()` - Get booking statistics

## Protected Routes

**File**: `src/components/RequireAuth.js`

Routes are protected using `RequireAuth` component:

```javascript
<Route 
  path="/admin" 
  element={
    <RequireAuth>
      <AdminLayout />
    </RequireAuth>
  }
>
```

**How it works**:
1. Component checks `authService.isAuthenticated()`
2. If no valid token, redirects to `/login`
3. If token valid, renders protected component
4. If token expires during session, interceptor catches 401 and redirects

## Token Utilities

**File**: `src/utils/tokenUtil.js`

```javascript
// Check if token is expired (compares exp claim with current time)
isTokenExpired(token) -> boolean

// Get valid token from storage (checks expiration)
getTokenFromLocalStorage() -> string|null

// Store token in localStorage  
saveTokenToLocalStorage(token) -> void

// Clear all auth data on logout/401
clearUserFromLocalStorage() -> void

// Get current user object
getCurrentUser() -> object|null
```

## Common Operations

### Getting Admin's Cars

```javascript
import carService from '../services/carService';

// In component
useEffect(() => {
  const fetchCars = async () => {
    try {
      // Request automatically includes token ✅
      const cars = await carService.getAdminCars();
      setCars(cars);
    } catch (error) {
      setError(error.message);
    }
  };
  
  fetchCars();
}, []);
```

### Creating a Car

```javascript
import carService from '../services/carService';

const handleCreateCar = async (carData) => {
  try {
    // Request automatically includes token ✅
    const newCar = await carService.createCar(carData);
    console.log('Car created:', newCar);
  } catch (error) {
    console.error('Failed to create car:', error);
  }
};
```

### Managing Bookings

```javascript
import bookingsService from '../services/bookingsService';

// Get all bookings for admin's cars
const bookings = await bookingsService.getBookings();

// Update booking status
await bookingsService.updateBookingStatus(bookingId, 'approved');

// Cancel booking
await bookingsService.cancelBooking(bookingId);
```

## Debugging

### Check if Token is Stored

```javascript
// In browser console
localStorage.getItem('adminToken')
localStorage.getItem('user')
```

### Check Request Headers

```javascript
// In Network tab, click on API request
// Go to Request Headers tab
// Should see: Authorization: Bearer {token}
```

### Enable Debug Logging

Set `REACT_APP_DEBUG=true` in `.env`:

```env
REACT_APP_DEBUG=true
```

Services will log more details to console.

### Common Issues

| Issue | Solution |
|-------|----------|
| 401 Unauthorized | Token expired or invalid. User needs to login again. |
| 404 Not Found | Endpoint doesn't exist. Check backend route configuration. |
| 500 Server Error | Backend crashed. Check backend logs and fix issue. |
| CORS Error | Backend CORS not configured. Check backend `index.js`. |
| Network Error | Backend not running. Start with `npm start` on port 5000. |

## Performance Considerations

1. **Token Refresh**: Not every request checks expiration (done on demand)
2. **Request Caching**: Consider Redux for caching frequently accessed data
3. **Rate Limiting**: Backend limits to 100 req/15min for general calls
4. **Timeout**: API requests timeout after 10 seconds

## Security

- ✅ JWT tokens used for stateless authentication
- ✅ Tokens stored in localStorage (vulnerable to XSS, use httpOnly if possible)
- ✅ Token sent only in Authorization header
- ✅ Refresh tokens handled server-side
- ✅ 401 responses trigger immediate logout
- ✅ All requests over HTTPS recommended in production

## Testing

### Manual Testing Checklist

- [ ] Login with valid credentials
- [ ] Verify token stored in localStorage
- [ ] Get cars list
- [ ] Create new car
- [ ] Update car
- [ ] Delete car
- [ ] Get bookings
- [ ] Update booking status
- [ ] Logout
- [ ] Verify token cleared
- [ ] Try accessing admin page (redirects to login)
- [ ] Wait for token to expire, verify auto-logout

## Production Deployment

Before deploying:

1. Update `.env` with production API URL
2. Set `REACT_APP_DEBUG=false`
3. Enable HTTPS for token transmission
4. Configure CORS on backend for production domain
5. Test all authentication flows
6. Monitor logs for authentication errors

## References

- [JWT Documentation](https://jwt.io)
- [Axios Interceptors](https://axios-http.com/docs/interceptors)
- [Redux for state management](https://redux.js.org)
- [React Router Protected Routes](https://reactrouter.com)
