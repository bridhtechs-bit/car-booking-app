# Frontend - Backend Integration Guide

## Configuration Actuelle

### Backend (Node.js/Express)
- **URL**: `http://localhost:5000/api`
- **Port**: 5000
- **Status**: ✅ Actif

### Frontend (React Client)
- **URL**: `http://localhost:3000`
- **API Base URL**: Configuré via `.env` -> `http://localhost:5000/api`
- **Port**: 3000

---

## 📝 Fichiers de Configuration Frontend

### 1. **`.env`** - Variables d'environnement
```env
REACT_APP_API_BASE_URL=http://localhost:5000/api
REACT_APP_STRIPE_PUBLIC_KEY=pk_test_your_key_here
REACT_APP_APP_NAME=Car Booking App
REACT_APP_VERSION=1.0.0
REACT_APP_DEBUG=false
```

### 2. **`src/config/appConfig.js`** - Configuration centralisée
Contient:
- API base URL
- Token keys
- Feature flags
- Endpoints map
- Error messages

### 3. **`src/services/api.js`** - Axios instance configurée
Fonctionnalités:
- Auto-include JWT token dans les headers
- Gestion des erreurs 401 (logout automatique)
- Logging des erreurs
- Interceptors request/response

### 4. **`src/utils/tokenUtil.js`** - Gestion des tokens
Fonctionnalités:
- Vérification d'expiration du token
- Sauvegarde/récupération depuis localStorage
- Support `accessToken` et `token`

### 5. **`src/features/auth/authService.js`** - Services d'authentification
- `register(userData)` - Créer un compte
- `login(credentials)` - Se connecter
- `logout()` - Se déconnecter
- `refreshToken()` - Renouveler le token
- `isAuthenticated()` - Vérifier si connecté

### 6. **`src/features/car/carService.js`** - Services voitures
- `fetchAllCars()` - Toutes les voitures
- `fetchFeaturedCars()` - Voitures en vedette
- `fetchCarById(id)` - Détails voiture
- `filterCars(filters)` - Filtrer voitures

### 7. **`src/features/auth/bookingService.js`** - Services réservations
- `createBooking(data)` - Créer réservation
- `getUserBookings()` - Mes réservations
- `cancelBooking(id)` - Annuler réservation
- `getBookingDetails(id)` - Détails réservation

---

## 🔐 Flux d'Authentification

1. **Login**:
   ```
   User → Login Form → authService.login()
   ↓
   API POST /auth/login
   ↓
   Backend validates → Returns { accessToken, user, ... }
   ↓
   Frontend saves to localStorage (via tokenUtil)
   ↓
   Redux store updated
   ↓
   Redirect to home/dashboard
   ```

2. **Requête API subsequent**:
   ```
   Redux dispatch action
   ↓
   Service calls api.get/post/etc()
   ↓
   api.interceptors.request adds Authorization header
   ↓
   API request with: Authorization: Bearer <token>
   ↓
   Backend validates token
   ↓
   Return data to frontend
   ```

3. **Token Expiré**:
   ```
   Frontend makes request with expired token
   ↓
   Backend returns 401 Unauthorized
   ↓
   api.interceptors.response catches 401
   ↓
   Logout automatique + Redirect to login
   ↓
   User prompt to login again
   ```

---

## 🧪 Tests d'Intégration

### Test 1: Health Check
```bash
curl http://localhost:5000/api/health
```
Réponse attendue:
```json
{
  "success": true,
  "message": "Server is healthy"
}
```

### Test 2: Register
```javascript
// Frontend
import authService from '@/features/auth/authService';

const response = await authService.register({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'Password123'
});
console.log(response);
```

### Test 3: Login
```javascript
const response = await authService.login({
  email: 'john@example.com',
  password: 'Password123'
});
console.log(response.accessToken); // Should print token
```

### Test 4: Get Cars
```javascript
import { fetchAllCars } from '@/features/car/carService';

const cars = await fetchAllCars();
console.log(cars); // Array of car objects
```

---

## ✅ Checklist d'Intégration

- [x] API base URL configurée (port 5000)
- [x] Axios instance avec interceptors
- [x] Token storage et récupération
- [x] Token refresh handling
- [x] 401 logout redirect
- [x] Service layer configurée
- [x] Redux store connecté
- [ ] Environment variables testées
- [ ] Toutes les routes testées
- [ ] SSL/HTTPS en production

---

## 🚀 Prochaines Étapes

1. **Tester le frontend**:
   ```bash
   cd webApp/client
   npm start
   ```

2. **Tester chaque endpoint**:
   - Register
   - Login
   - Fetch cars
   - Create booking
   - My bookings

3. **Améliorer Phase 1**:
   - Email notifications
   - Password reset
   - User profile

4. **Phase 2**:
   - Backend robustesse
   - Testing
   - Admin dashboard

---

## 📞 Troubleshooting

### Problème: CORS Error
**Solution**: Vérifier que backend a CORS configuré pour `http://localhost:3000`

### Problème: 401 Unauthorized
**Solution**: Token expiré ou invalide. Forcer logout et re-login

### Problème: API not responding
**Solution**: Vérifier que backend tourne sur port 5000

### Problème: Network Error
**Solution**: Vérifier la connexion et les ports

---

## 📚 Resources

- [Axios Documentation](https://axios-http.com/)
- [JWT.io](https://jwt.io/)
- [React Redux](https://react-redux.js.org/)
- [Express.js](https://expressjs.com/)
