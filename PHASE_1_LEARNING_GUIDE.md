# 📚 GUIDE D'APPRENTISSAGE COMPLÈTE - PHASE 1

**Objectif**: Comprendre chaque concept de la Phase 1 avant de passer à la Phase 2

---

## 📍 TABLE DES MATIÈRES

1. [Architecture Globale](#architecture-globale)
2. [Étape 1: Variables d'Environnement](#étape-1-variables-denvironnement)
3. [Étape 2: Gestion des Erreurs](#étape-2-gestion-des-erreurs)
4. [Étape 3: Validation des Inputs](#étape-3-validation-des-inputs)
5. [Étape 4: Sécurité](#étape-4-sécurité)
6. [Étape 5: Configuration Email](#étape-5-configuration-email)
7. [Étape 6: JWT Tokens](#étape-6-jwt-tokens)
8. [Flux de Requête Complet](#flux-de-requête-complet)
9. [Guide de Test](#guide-de-test)
10. [Exercices Pratiques](#exercices-pratiques)
11. [Ressources d'Apprentissage](#ressources-dapprentissage)

---

## 🏗️ ARCHITECTURE GLOBALE

### Diagramme Global

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (React)                            │
│  - Envoie requête HTTP avec données + token                     │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                      RÉSEAU (HTTP/HTTPS)                        │
│  - Chiffré par SSL/TLS en production                           │
│  - Rate limiting appliqué                                       │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SERVER ENTRY (server.js)                     │
│  - Charge .env variables                                        │
│  - Initializes email service                                    │
│  - Connecte MongoDB                                             │
│  - Lance express app                                            │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    APP MIDDLEWARE CHAIN                          │
│                                                                  │
│  1. Morgan Logging    (logs HTTP requests)                      │
│  2. Helmet Headers    (security headers)                        │
│  3. CORS              (cross-origin protection)                 │
│  4. Body Parser       (parse JSON/form data)                    │
│  5. Cookie Parser     (parse cookies)                           │
│  6. Data Sanitization (prevent NoSQL injection)                 │
│  7. Rate Limiting     (limit requests per IP)                  │
│                       ↓                                          │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                      ROUTE HANDLER                               │
│                                                                  │
│  1. Input Validation  (express-validator)                       │
│  2. Authentication    (verify JWT token)                        │
│  3. Authorization     (check user role)                         │
│  4. Business Logic    (controller function)                     │
│  5. Database Query    (MongoDB/Mongoose)                        │
│                       ↓                                          │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                   DATABASE & SERVICES                            │
│                                                                  │
│  - MongoDB (data storage)                                       │
│  - Email Service (SMTP/SendGrid)                                │
│  - File Storage (local/S3)                                      │
│                       ↓                                          │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                 ERROR HANDLER MIDDLEWARE                         │
│                                                                  │
│  - Catch les erreurs                                            │
│  - Formate la réponse d'erreur                                  │
│  - Logs l'erreur                                                │
│  - Informe le client                                            │
│                       ↓                                          │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                  RESPONSE (JSON)                                 │
│                                                                  │
│  {                                                              │
│    "success": true/false,                                       │
│    "statusCode": 200,                                           │
│    "message": "...",                                            │
│    "data": {...}                                                │
│  }                                                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📝 ÉTAPE 1: Variables d'Environnement

### Qu'est-ce que c'est?

Les variables d'environnement sont des **paramètres de configuration** qui varient selon l'environnement (dev, test, production).

### Pourquoi c'est important?

❌ **Mauvais** (credentials exposées):
```javascript
const password = "m8wxqRDgKLKOJEUB"; // Visible dans le code!
const stripe_key = "sk_live_..."; // Exposé sur GitHub!
```

✅ **Bon** (sécurisé):
```javascript
const password = process.env.MONGODB_PASSWORD; // Dans .env
const stripe_key = process.env.STRIPE_SECRET_KEY; // Caché
```

### Structure du fichier `.env`

```env
# ========== SERVER ==========
PORT=5000
NODE_ENV=development

# ========== DATABASE ==========
MONGODB_URI=mongodb://localhost:27017/carbooking

# ========== AUTH ==========
JWT_SECRET=supersecretkey123456789...
JWT_EXPIRE=7d

# ========== EMAIL ==========
EMAIL_SERVICE=smtp
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=...
SMTP_PASSWORD=...

# ========== STRIPE ==========
STRIPE_SECRET_KEY=sk_test_...
```

### Comment ça fonctionne?

**File: `.env`**
```env
MONGODB_URI=mongodb+srv://user:pass@cluster...
```

**File: `server.js`**
```javascript
import dotenv from 'dotenv';
dotenv.config(); // Load le fichier .env

console.log(process.env.MONGODB_URI);
// Output: mongodb+srv://user:pass@cluster...
```

### Configuration par Environnement

```
┌──────────────────────────────────────────┐
│        TOUTES LES ENVS (.env)            │
├──────────────────────────────────────────┤
│  PORT=5000                               │
│  NODE_ENV=development                    │
│  MONGODB_URI=mongodb://local...          │
│  JWT_SECRET=localkey123...               │
│  STRIPE_PUBLIC_KEY=pk_test_...           │
└──────────────────────────────────────────┘

              vs (en production)

┌──────────────────────────────────────────┐
│    PRODUCTION ENV (.env.production)      │
├──────────────────────────────────────────┤
│  PORT=8080 (hébergeur définit)           │
│  NODE_ENV=production                     │
│  MONGODB_URI=mongodb+srv://prod...       │
│  JWT_SECRET=verystrongrandomkey...       │
│  STRIPE_PUBLIC_KEY=pk_live_...           │
│  CORS_ORIGIN=https://yourdomain.com     │
└──────────────────────────────────────────┘
```

### Checklist Sécurité Variable d'Environnement

- ✅ `.env` est dans `.gitignore` (jamais commité)
- ✅ `.env.example` existe pour documentation
- ✅ Secrets générés aléatoirement (min 32 chars)
- ✅ Différents secrets pour dev/prod/test
- ✅ Pas hardcoder les secrets nulle part
- ✅ Rotation des secrets régulière

---

## 🚨 ÉTAPE 2: Gestion des Erreurs

### Concept de Base

Sans gestion d'erreurs:
```javascript
// ❌ Mauvais
app.get('/user/:id', (req, res) => {
  const user = User.findById(req.params.id); // Crash si erreur!
  res.json(user);
});
```

Avec gestion d'erreurs:
```javascript
// ✅ Bon
app.get('/user/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    res.json(user);
  } catch (error) {
    next(error); // Passe au error handler
  }
});
```

### Architecture du Error Handling

```
┌─────────────────────────────────────┐
│      Route Handler (throws error)   │
│  throw new ApiError(400, "msg")     │
└────────────────┬────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│    Try-Catch ou next(error)         │
│    (passes to error handler)        │
└────────────────┬────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│   GLOBAL ERROR HANDLER MIDDLEWARE   │
│   errorHandler(err, req, res, next) │
│                                     │
│  1. Log l'erreur                    │
│  2. Détermine status code           │
│  3. Formate le message              │
│  4. Envoie la réponse JSON          │
└────────────────┬────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│    CLIENT reçoit réponse d'erreur   │
│  {                                  │
│    "success": false,                │
│    "statusCode": 400,               │
│    "message": "Email invalide",     │
│    "errors": [...]                  │
│  }                                  │
└─────────────────────────────────────┘
```

### Types d'Erreurs Gérés

| Type | Cause | HTTP Code | Action |
|------|-------|-----------|--------|
| ValidationError | Données invalides | 400 | Envoyer erreurs au client |
| DuplicateKeyError | Email existe déjà | 400 | Informer l'utilisateur |
| CastError | ID MongoDB invalide | 400 | Format invalide |
| JsonWebTokenError | Token invalide | 401 | Forcer login |
| TokenExpiredError | Token expiré | 401 | Refresh token |
| NotFoundError | Ressource inexistante | 404 | Infomer utilisateur |
| InternalServerError | Bug serveur | 500 | Logger, generique au user |

### Exemple: Flow d'Erreur Réelle

```javascript
// ❌ User envoie email invalide
POST /api/auth/register
Body: { email: "notanemail", password: "password123" }

// 1️⃣ Middleware validation
validateRegister || body("email").isEmail() // ❌ FAIL

// 2️⃣ handleValidationErrors throw
throw new ApiError(400, "Valid email is required");

// 3️⃣ Catch par try-catch ou next(error)
next(error);

// 4️⃣ Global Error Handler
errorHandler(err, req, res, next) {
  statusCode = 400;
  message = "Valid email is required";
  errors = [{ field: "email", message: "..." }]
}

// 5️⃣ Client reçoit
{
  "success": false,
  "statusCode": 400,
  "message": "Valid email is required",
  "errors": [{ field: "email", message: "..." }]
}
```

### Logging des Erreurs

```javascript
// File: middleware/errorHandler.js
logger.error('Error creating user', error, {
  userId: req.user?._id,
  action: 'createUser',
  requestBody: req.body,
  ip: req.ip,
  timestamp: new Date().toISOString()
});

// Output dans logs/app.log:
// ❌ ERROR: ValidationError
// User: 507f1f77bcf86cd799439011
// Action: createUser
// IP: 192.168.1.1
// Message: Email must be unique
// ...
```

---

## ✔️ ÉTAPE 3: Validation des Inputs

### Pourquoi la Validation?

**Scenario sans validation:**
```javascript
// ❌ DANGEREUX
app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  // email = "<img src=x onerror='alert(1)'>" (XSS!)
  // password = "" (vide!)
  const user = await User.create({ email, password });
  // BUG! User créé avec données dangereuses
});
```

**Scenario avec validation:**
```javascript
// ✅ SÉCURISÉ
router.post('/register', 
  body("email").isEmail(),
  body("password").isLength({ min: 6 }),
  createUser // Appelle seulement si valide
);
```

### Pipeline de Validation

```
┌────────────────────────────────┐
│   Client envoie requête        │
│   POST /api/auth/register      │
│   {                            │
│     "email": "...",            │
│     "password": "..."          │
│   }                            │
└────────────┬───────────────────┘
             │
             ▼
┌────────────────────────────────┐
│   Validation Rules             │
│   (chaîne de middlewares)      │
│                                │
│   1. body("name")              │
│      .notEmpty()               │
│      .isLength({ min: 2 })    │
│                                │
│   2. body("email")             │
│      .isEmail()                │
│      .normalizeEmail()         │
│                                │
│   3. body("password")          │
│      .isLength({ min: 6 })    │
│      .matches(/regex/)         │
│                                │
│   4. handleValidationErrors    │
│      (throw si erreur)         │
└────────────┬───────────────────┘
             │
        ✅ VALIDE?
        ├─ NON ──→ Throw ApiError(400)
        │         └─→ Global error handler
        │             └─→ Client reçoit erreur
        │
        └─ OUI ──→ Continue
                  Appelle createUser
```

### Règles de Validation Importantes

```javascript
// STRINGS
body("name")
  .trim()                    // Enlève espaces avant/après
  .notEmpty()               // Doit pas être vide
  .isLength({ min: 2 })     // Min 2 caractères

// EMAILS
body("email")
  .trim()
  .toLowerCase()            // Normalise case
  .isEmail()               // Format valide
  .normalizeEmail()        // Normalise (john@gmail.com = john@gmail.com)

// PASSWORDS
body("password")
  .isLength({ min: 6 })
  .matches(/^(?=.*[A-Za-z])(?=.*\d)/) // Min 1 lettre + 1 chiffre

// NUMBERS
body("price")
  .isFloat({ min: 0 })     // Float positif seulement

body("year")
  .isInt({ min: 1900, max: 2025 })

// DATES
body("startDate")
  .isISO8601()             // Format ISO (2024-01-01)
  .custom((value) => {
    if (new Date(value) < new Date()) {
      throw new Error("Date must be future");
    }
  })

// MONGO IDs
param("id")
  .isMongoId()             // Valide format MongoDB ObjectId

// ENUMS
body("category")
  .isIn(["sedan", "suv", "truck"]) // Seulement ces valeurs
```

### Sanitization (Anti-Injection)

```javascript
// AVANT sanitization
const name = "'; DROP TABLE users; --"; // Injection SQL!

// APRÈS sanitization (express-validator)
const name = "&#x27;; DROP TABLE users; --";
// Caractères spéciaux échappés!

// En MongoDB, express-mongo-sanitize prévient:
// { $ne: "" } → { "$ne": "" } (key name quoted)
```

---

## 🔒 ÉTAPE 4: Sécurité

### Helmet Security Headers

Helmet ajoute automatiquement des headers HTTP pour sécurité:

```javascript
// Sans Helmet
GET /api/data
Response Headers: (rien de sécurisé)

// Avec Helmet
GET /api/data
Response Headers:
  Content-Security-Policy: default-src 'self'
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Strict-Transport-Security: max-age=31536000
  X-XSS-Protection: 1; mode=block
```

**Ce que chaque header prévient:**

| Header | Prévient | Exemple |
|--------|----------|---------|
| CSP | XSS, injection script | `<script src="evil.com"></script>` |
| X-Frame-Options | Clickjacking | Site dans iframe |
| X-Content-Type-Options | MIME sniffing | Fichier .txt interprété .js |
| HSTS | Man-in-the-middle | Force HTTPS |
| X-XSS-Protection | Vieux navigateurs XSS | Internet Explorer |

### CORS (Cross-Origin Resource Sharing)

**Problème:** Le browser bloque les requêtes inter-domaines par défaut

```html
<!-- Depuis https://myapp.com -->
<script>
  fetch('https://api.example.com/data') 
  // BLOCKED par browser! Same-origin policy
</script>
```

**Solution:** CORS middleware autorise domaines spécifiques

```javascript
const corsOptions = {
  origin: "https://myapp.com", // Seulement ce domaine
  methods: ["GET", "POST"],     // Seulement ces méthodes
  credentials: true,            // Accepte cookies
  allowedHeaders: ["Content-Type", "Authorization"]
};
app.use(cors(corsOptions));
```

### Rate Limiting

**Problème:** Quelqu'un peut faire 1000 requêtes login par seconde

```
GET /api/auth/login (1000x par sec)
GET /api/auth/login
GET /api/auth/login
... (brute force attack)
```

**Solution:** Rate limiter limite requêtes par IP

```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // Fenêtre 15 min
  max: 5,                      // Max 5 attempts
  message: "Too many attempts"
});

router.post('/login', limiter, loginUser);

// IP 192.168.1.1:
// Attempt 1: ✅ OK
// Attempt 2: ✅ OK
// Attempt 3: ✅ OK
// Attempt 4: ✅ OK
// Attempt 5: ✅ OK
// Attempt 6: ❌ BLOCKED (429 Too Many Requests)
// (Essaye après 15 min)
```

### Data Sanitization (NoSQL Injection)

**Problème:** NoSQL injection

```javascript
// ❌ DANGEUREUX - Sans sanitization
POST /api/login
Body: {
  "email": { "$ne": "" }, // "Not equals" operator!
  "password": { "$ne": "" }
}

// Query MongoDB:
db.users.findOne({
  email: { $ne: "" },    // Trouve TOUT email != ""!
  password: { $ne: "" }  // Login bypass!
})
```

**Solution:** Sanitization with express-mongo-sanitize

```javascript
// ✅ SÉCURISÉ - Après sanitization
Body: {
  "email": { "$ne": "" }, // KEY est quoted
  "password": { "$ne": "" }
}

// Query MongoDB:
db.users.findOne({
  "$ne": "",  // Now it searches for string "$ne"!
  // Pas une injection!
})
```

---

## 📧 ÉTAPE 5: Configuration Email

### Architecture Service Email

```
┌────────────────────────────────────────┐
│   Code Backend                         │
│   sendBookingConfirmationEmail(...)    │
└────────────┬───────────────────────────┘
             │
             ▼
┌────────────────────────────────────────┐
│   emailService.js                      │
│   - Prépare template HTML              │
│   - Valide adresse email               │
│   - Construit email objet              │
└────────────┬───────────────────────────┘
             │
             ▼
    ┌────────┴────────┐
    │                 │
    ▼ Option 1        ▼ Option 2
┌─────────────┐   ┌──────────────┐
│   SMTP      │   │   SendGrid   │
│ (Mailtrap)  │   │   (Cloud)    │
└─────────────┘   └──────────────┘
    │                 │
    ▼                 ▼
┌────────────────────────────────────────┐
│   Email Provider                       │
│   - Valide email                       │
│   - Queue l'envoi                      │
│   - Retry si échoue                    │
└────────────┬───────────────────────────┘
             │
             ▼
┌────────────────────────────────────────┐
│   INTERNET (SMTP Protocol)             │
│   - Chiffre (TLS/SSL)                  │
│   - Route vers serveur mail recipient  │
└────────────┬───────────────────────────┘
             │
             ▼
┌────────────────────────────────────────┐
│   Recipient Mailbox                    │
│   user@example.com                     │
└────────────────────────────────────────┘
```

### Configuration Setup

**Option 1: SMTP (Développement)**
```env
EMAIL_SERVICE=smtp
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=myuser@example
SMTP_PASSWORD=mypassword
EMAIL_FROM=noreply@carbooking.com
```

**Option 2: SendGrid (Production)**
```env
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=SG.your_key_here
EMAIL_FROM=noreply@carbooking.com
```

### Template Email Exemple

```html
<!DOCTYPE html>
<html>
  <head>
    <style>
      body { font-family: Arial; }
      .container { max-width: 600px; margin: auto; }
      .header { background: #667eea; color: white; padding: 20px; }
      .footer { background: #f5f5f5; text-align: center; padding: 20px; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>✓ Booking Confirmed!</h1>
      </div>
      
      <div class="content">
        <h2>Hello {{ user_name }},</h2>
        <p>Your booking has been confirmed:</p>
        
        <p>
          <strong>Car:</strong> {{ car_name }}<br>
          <strong>Dates:</strong> {{ start_date }} to {{ end_date }}<br>
          <strong>Total:</strong> ${{ total_amount }}
        </p>
      </div>
      
      <div class="footer">
        <p>Car Booking App - Your Rental Partner</p>
      </div>
    </div>
  </body>
</html>
```

### Sending Email Flow

```javascript
// 1. Controller appelle le service
await sendBookingConfirmationEmail(booking, user, car);

// 2. Service prépare les données
const emailData = {
  bookingDate: new Date(booking.startDate).toLocaleDateString(),
  totalAmount: booking.totalAmount,
  carName: car.name,
  userName: user.name
};

// 3. Service génère HTML
const html = generateEmailTemplate(emailData);

// 4. Service envoie via transporter (SMTP ou SendGrid)
const result = await transporter.sendMail({
  from: 'noreply@carbooking.com',
  to: user.email,
  subject: 'Booking Confirmation',
  html: html
});

// 5. Log succès
console.log(`Email sent: ${result.messageId}`);

// 6. Si erreur, log et notify admin
// (Ne pas fail la réservation pour email error)
```

---

## 🔐 ÉTAPE 6: JWT Tokens

### Qu'est-ce qu'un JWT?

JWT = **J**son **W**eb **T**oken

Structure: `header.payload.signature`

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
eyJpZCI6IjEyMzQ1Njc4OTAiLCJuYW1lIjoiSm9obiJ9.
TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ

│                                      │
└──────────┬──────────────────────────┘
           │
┌──────────┴──────────────────────────────────┐
│                                             │
▼                  ▼                         ▼
HEADER        PAYLOAD                    SIGNATURE
{             {                          HMAC256(
  "alg":        "id": "12345",            base64(header) +
  "HS256",      "name": "John"            base64(payload),
  "typ":        "iat": 1234567           SECRET
  "JWT"       }                          )
}
```

### Comment JWT Fonctionne

```
┌─────────────────────────────────────────┐
│ 1. User Login                           │
│                                         │
│ POST /api/auth/login                   │
│ { email: "john@example.com",           │
│   password: "password123" }            │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│ 2. Server Verifies Credentials          │
│                                         │
│ - Password match? ✅                    │
│ - User active? ✅                       │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│ 3. Server Generates JWT                 │
│                                         │
│ payload = {                             │
│   id: "507f1f77bcf86cd799439011",      │
│   role: "user",                         │
│   iat: 1234567890,  // Issued at       │
│   exp: 1234567890 + 7days // Expiry   │
│ }                                       │
│                                         │
│ token = sign(payload, JWT_SECRET)      │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│ 4. Server Sends Tokens to Client       │
│                                         │
│ {                                       │
│   "accessToken": "eyJhbG...",          │
│   "refreshToken": "eyJhbG...",         │
│   "expiresIn": 604800  // 7 days       │
│ }                                       │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│ 5. Client Stores Tokens                │
│                                         │
│ localStorage:                           │
│   accessToken: "eyJhbG..."              │
│ cookies (httpOnly):                     │
│   refreshToken: "eyJhbG..." (secure)   │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│ 6. Client Uses Token for Requests      │
│                                         │
│ GET /api/cars                           │
│ Headers: {                              │
│   "Authorization": "Bearer eyJhbG..."   │
│ }                                       │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│ 7. Server Verifies Token                │
│                                         │
│ token = request.headers.authorization   │
│ decoded = verify(token, JWT_SECRET)    │
│                                         │
│ ✅ Valid? Continue                      │
│ ❌ Invalid? Return 401 Unauthorized     │
│ ❌ Expired? Return 401                  │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│ 8. Request Processed                    │
│                                         │
│ req.user = decoded  // User info        │
│ Continue with controller logic          │
└─────────────────────────────────────────┘
```

### Access Token vs Refresh Token

| Aspect | Access Token | Refresh Token |
|--------|--------------|---------------|
| **Durée** | 7 jours | 30 jours |
| **Utilisation** | Chaque requête API | Obtenir nouveau access |
| **Stockage** | localStorage (XSS risk) | httpOnly cookies (sécurisé) |
| **Scope** | Accès ressources | Renouvellement seulement |
| **Révocation** | Difficile | Facile (DB) |

### Token Refresh Flow

```
Hour 0: User logs in
├─ accessToken = jwt(valid for 7 days)
├─ refreshToken = jwt(valid for 30 days, httpOnly cookie)
└─ Client stores both

Hour 6:
├─ User makes request with accessToken
├─ accessToken still valid
└─ Request succeeds ✅

Day 7:
├─ accessToken expires!
├─ Client makes request with accessToken
├─ Server: accessToken expired ❌
├─ Return 401 Unauthorized
└─ Client should refresh

Day 7 - Refresh:
├─ Client sends POST /api/auth/refresh-token
├─ Sends refreshToken in cookie + body
├─ Server verifies refreshToken
├─ Server generates NEW accessToken
├─ Server generates NEW refreshToken (rotation)
├─ Client updates tokens in storage
└─ Request retried with new accessToken ✅

Day 30:
├─ refreshToken expires!
├─ Cannot refresh anymore
├─ User must login again
└─ Redirect to login page
```

### Token Blacklist (Logout)

```javascript
// In-memory set (for dev)
const tokenBlacklist = new Set();

// When user logs out:
app.post('/logout', (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  tokenBlacklist.add(token);  // Add to blacklist
  res.json({ success: true });
});

// When verifying token:
function verifyAccessToken(token) {
  if (tokenBlacklist.has(token)) {
    throw new Error('Token revoked');  // Can't use
  }
  // ... verify signature
}
```

---

## 🔄 FLUX DE REQUÊTE COMPLET

### Exemple Complet: User Registration

```
┌──────────────────────────────────────────────────────────────┐
│  ÉTAPE 1: Client envoie la requête                          │
│                                                              │
│  POST /api/auth/register                                    │
│  Content-Type: application/json                             │
│  Body: {                                                     │
│    "name": "John Doe",                                       │
│    "email": "john@example.com",                              │
│    "password": "MyP@ssw0rd123"                               │
│  }                                                           │
└────────────────┬─────────────────────────────────────────────┘
                 │ (HTTP Request envoyé)
                 ▼
┌──────────────────────────────────────────────────────────────┐
│  ÉTAPE 2: Middleware Chain dans server.js                   │
│                                                              │
│  2.1. Morgan Logger                                          │
│       Logs: POST /api/auth/register                          │
│                                                              │
│  2.2. Helmet Security Headers                                │
│       Ajoute headers sécurisés                               │
│                                                              │
│  2.3. CORS Middleware                                        │
│       Vérifie origin   ✅                                    │
│                                                              │
│  2.4. Body Parser                                            │
│       Parse JSON → req.body                                  │
│       req.body now = {name, email, password}               │
│                                                              │
│  2.5. Rate Limiter                                           │
│       Client IP bucket: 1 attempt ✅                         │
│                                                              │
│  Passe au next middleware...                                 │
└────────────────┬─────────────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────────────┐
│  ÉTAPE 3: Route avec Validation                             │
│                                                              │
│  router.post('/register',                                    │
│    validateRegister,  // 👈 Middleware de validation        │
│    createUser         // 👈 Controller                       │
│  )                                                           │
│                                                              │
│  validateRegister:                                           │
│  ├─ body('name').notEmpty() ✅ "John Doe"                  │
│  ├─ body('email').isEmail() ✅ "john@example.com"          │
│  ├─ body('password').isLength({min:6}) ✅ "MyP@ssw0rd123"  │
│  └─ handleValidationErrors ✅ Pas d'erreur                 │
│                                                              │
│  → Validation passed! Passe à createUser                    │
└────────────────┬─────────────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────────────┐
│  ÉTAPE 4: Controller (authController.js)                    │
│                                                              │
│  createUser = asyncHandler(async (req, res) => {            │
│    // 4.1 Extraire les données                              │
│    const { name, email, password } = req.body;              │
│                                                              │
│    // 4.2 Vérifier que user n'existe pas                    │
│    const userExists = await User.findOne({email});          │
│    if (userExists) throw Error("User exists"); ❌           │
│                                                              │
│    // 4.3 Créer le user                                     │
│    const user = await User.create(req.body);                │
│    // (Password auto-hashed par mongoose pre-hook)         │
│                                                              │
│    // 4.4 Envoyer welcome email (async, ne bloquera pas)   │
│    sendWelcomeEmail(user).catch(err =>                      │
│      logger.warn('Email failed')                            │
│    );                                                        │
│                                                              │
│    // 4.5 Renvoyer réponse                                  │
│    res.status(201).json({                                   │
│      success: true,                                         │
│      _id: user._id,                                         │
│      name: user.name,                                       │
│      email: user.email                                      │
│    });                                                       │
│  })                                                          │
└────────────────┬─────────────────────────────────────────────┘
                 │
                 ▼  (Si erreur quelque part dans asyncHandler)
┌──────────────────────────────────────────────────────────────┐
│  ÉTAPE 5: Global Error Handler (si erreur)                  │
│                                                              │
│  // Supposons email existe déjà:                            │
│  const userExists = User.findOne({email});  // Found!       │
│  throw new Error("Email already exists");   // ❌ ERROR      │
│                                                              │
│  // Catch par asyncHandler                                  │
│  // Appelle next(error) automatiquement                      │
│                                                              │
│  // Global Error Handler:                                   │
│  errorHandler(error, req, res, next) {                      │
│    statusCode = 400;  // Validation error                   │
│    message = "Email already exists";                        │
│    errors = [{field: "email", message: "..."}];            │
│                                                              │
│    logger.error("User registration failed", error);         │
│                                                              │
│    res.status(400).json({                                   │
│      success: false,                                        │
│      statusCode: 400,                                       │
│      message: "Email already exists",                       │
│      errors: [{...}]                                        │
│    });                                                       │
│  }                                                           │
└────────────────┬─────────────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────────────┐
│  ÉTAPE 6: Client reçoit la réponse                          │
│                                                              │
│  Status: 201 Created (ou 400 si erreur)                     │
│  Body: {                                                     │
│    "success": true,                                         │
│    "_id": "507f1f77bcf86cd799439011",                       │
│    "name": "John Doe",                                      │
│    "email": "john@example.com"                              │
│  }                                                           │
│                                                              │
│  OU (si erreur)                                              │
│                                                              │
│  Status: 400 Bad Request                                    │
│  Body: {                                                     │
│    "success": false,                                        │
│    "statusCode": 400,                                       │
│    "message": "Email already exists",                       │
│    "errors": [{                                             │
│      "field": "email",                                      │
│      "message": "Email already exists"                      │
│    }]                                                        │
│  }                                                           │
└──────────────────────────────────────────────────────────────┘
```

---

## 🧪 GUIDE DE TEST

### Test 1: Variables d'Environnement

```bash
# Vérifier que .env est chargé
node -e "console.log(process.env.PORT)"
# Output: 5000

# Vérifier que secrets ne sont pas en dur
grep -r "sk_live_" src/  # Devrait être vide
grep -r "password123" src/  # Devrait être vide
```

### Test 2: Error Handling

```bash
# Start server
npm run dev

# Test validation error (GET au lieu de POST pour body vide)
curl -X GET http://localhost:5000/api/auth/login
# Erreur 400: "email is required"

# Test error format
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "invalid"}'
# Response:
# {
#   "success": false,
#   "statusCode": 400,
#   "message": "Validation error: ...",
#   "errors": [{...}]
# }
```

### Test 3: Input Validation

```bash
# Test email validation
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "J",
    "email": "notanemail",
    "password": "short"
  }'
# Errors:
# - name too short (min 2)
# - email not valid
# - password too short (min 6)

# Test valid registration
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "MyP@ssword123"
  }'
# Success 201: User créé
```

### Test 4: Rate Limiting

```bash
# Faire 6 requests rapidement
for i in {1..6}; do
  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email": "test@test.com", "password": "test"}'
  echo "\nAttempt $i"
done

# Résultats:
# Attempt 1-5: 401 (password wrong, mais pas throttled)
# Attempt 6: 429 (Too Many Requests - THROTTLED!)
```

### Test 5: Security Headers

```bash
# Check Helmet headers
curl -I http://localhost:5000/

# Devrait voir:
# X-Content-Type-Options: nosniff
# X-Frame-Options: DENY
# Strict-Transport-Security: max-age=31536000
# Content-Security-Policy: ...
```

### Test 6: Email Service

```javascript
// Test manually in Node REPL
import { sendEmail } from './src/services/emailService.js';
import { initializeEmailService } from './src/services/emailService.js';

await initializeEmailService();

await sendEmail({
  to: 'test@example.com',
  subject: 'Test Email',
  html: '<h1>Hello</h1>',
  text: 'Hello'
});

// Check Mailtrap ou email reçu
```

### Test 7: JWT Tokens

```bash
# 1. Login pour obtenir tokens
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "MyP@ssword123"
  }'
# Response: { "accessToken": "eyJ...", ... }

# 2. Copier le token

# 3. Utiliser token pour requête protégée
curl -X GET http://localhost:5000/api/cars \
  -H "Authorization: Bearer eyJ..."
# Success 200: Cars returned

# 4. Sans token
curl -X GET http://localhost:5000/api/cars
# Error 401: Unauthorized

# 5. Avec token expiré (attendre)
# Attendre 7 jours...
curl -X GET http://localhost:5000/api/cars \
  -H "Authorization: Bearer OLD_TOKEN"
# Error 401: Token expired

# 6. Faire refresh
curl -X POST http://localhost:5000/api/auth/refresh-token \
  -H "Cookie: refreshToken=..."
# Response: { "accessToken": "NEW_TOKEN", ... }

# 7. Utiliser nouveau token
curl -X GET http://localhost:5000/api/cars \
  -H "Authorization: Bearer NEW_TOKEN"
# Success 200
```

---

## 💪 EXERCICES PRATIQUES

### Exercice 1: Ajouter nouvelle variable d'environnement

**Objectif:** Ajouter support pour Twilio SMS

**Steps:**
1. Ajouter à `.env.example`:
```env
# TWILIO
TWILIO_ACCOUNT_SID=your-sid
TWILIO_AUTH_TOKEN=your-token
TWILIO_PHONE_NUMBER=+1234567890
```

2. Ajouter à `.env` (dev values):
```env
TWILIO_ACCOUNT_SID=AC123456789
TWILIO_AUTH_TOKEN=token123
TWILIO_PHONE_NUMBER=+15551234567
```

3. Créer service: `src/services/smsService.js`
```javascript
import twilio from 'twilio';

export const sendSMS = async (to, message) => {
  const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
  
  return await client.messages.create({
    body: message,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: to
  });
};
```

4. Tester: `node -e "await sendSMS('+334567890', 'Test')"`

---

### Exercice 2: Créer nouvelle validation rule

**Objectif:** Valider un field custom

**Steps:**
1. Ajouter à `middleware/validation.js`:
```javascript
export const validatePhoneNumber = [
  body("phone")
    .isMobilePhone('fr-FR')
    .withMessage("Valid French phone number required")
    .matches(/^(?:\+33|0)[1-9](?:[0-9]{8})$/)
    .withMessage("Phone must be valid FR format"),
  handleValidationErrors,
];
```

2. Utiliser dans route:
```javascript
router.post('/profile', validatePhoneNumber, updateProfile);
```

3. Tester:
```bash
# Valid
curl -X POST /profile -d '{"phone": "+33612345678"}'  # ✅

# Invalid
curl -X POST /profile -d '{"phone": "notaphone"}'     # ❌
```

---

### Exercice 3: Ajouter custom error class

**Objectif:** Créer UnauthorizedError

**Steps:**
1. Ajouter à `middleware/errorHandler.js`:
```javascript
export class UnauthorizedError extends ApiError {
  constructor(message = 'Unauthorized') {
    super(401, message);
    this.name = 'UnauthorizedError';
  }
}
```

2. Utiliser dans controller:
```javascript
const user = await User.findById(userId);
if (!user.isAdmin) {
  throw new UnauthorizedError('Admin access required');
}
```

3. Tester error handler react à correctement

---

### Exercice 4: Implement email template rendering

**Objectif:** Utiliser templates dynamiques

**Steps:**
1. Installer handlebars: `npm install handlebars`

2. Créer template `src/templates/booking-confirmation.hbs`:
```handlebars
<h1>Booking Confirmed</h1>
<p>Hello {{userName}},</p>
<p>Car: {{carName}}</p>
<p>Total: ${{totalAmount}}</p>
```

3. Compiler et utiliser:
```javascript
import Handlebars from 'handlebars';

const template = Handlebars.compile(hbsString);
const html = template({
  userName: user.name,
  carName: car.name,
  totalAmount: booking.totalAmount
});

await sendEmail({...html});
```

---

### Exercice 5: Implement token rotation

**Objectif:** Renouveler refreshToken à chaque refresh

**Steps:**
1. Modifier `refreshAccessToken` controller:
```javascript
const newAccessToken = generateAccessToken(user._id, user.role);
const newRefreshToken = generateRefreshToken(user._id, user.role);
// Sauvegarder newRefreshToken en DB
await User.findByIdAndUpdate(
  user._id,
  { refreshToken: newRefreshToken }
);

return res.json({
  accessToken: newAccessToken,
  refreshToken: newRefreshToken  // Nouveau token!
});
```

2. Tester:
```bash
# 1. Login
curl -X POST /login → token1

# 2. Refresh
curl -X POST /refresh-token?token=token1 → token2

# 3. Refresh again
curl -X POST /refresh-token?token=token2 → token3

# token1 ne marche plus, seulement token3!
```

---

## 📚 RESSOURCES D'APPRENTISSAGE

### Concepts Clés

- **Authentication vs Authorization**
  - https://www.keycloak.org/guides#documentation/getting-started
  
- **JWT Deep Dive**
  - https://jwt.io/introduction
  - https://auth0.com/learn/json-web-tokens

- **Security Best Practices**
  - https://owasp.org/www-project-top-ten/
  - https://expressjs.com/en/advanced/best-practice-security.html

- **Validation & Sanitization**
  - https://express-validator.github.io/docs/
  - https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html

### Tools & Services

- **Mailtrap** (Email Testing)
  - https://mailtrap.io/
  - Sandbox SMTP pour dev

- **SendGrid** (Production Email)
  - https://sendgrid.com/
  - Production email service

- **Postman** (API Testing)
  - https://www.postman.com/
  - Test tous les endpoints

- **JWT.io** (Decode Tokens)
  - https://jwt.io/
  - Décode et vérifie tokens

### Tutorials Video

- **Express Middleware**
  - Traversy Media: Express Middleware Tutorial

- **JWT Authentication**
  - Coder with Aaronn: JWT Authentication in Node.js

- **Error Handling**
  - Web Dev Simplified: Error Handling in Express

### Books

- **Node.js Design Patterns** - Mario Casciaro
  - Ch. 7: Server Architecture

- **Secure by Design** - Lilian Danylevich
  - Security architecture patterns

---

## 🎯 PROCHAIN CHECKPOINT

**Avant de passer à Phase 2, assurez-vous que vous comprenez:**

- [ ] Comment .env variables fonctionnent et pourquoi c'est sécurisé
- [ ] Comment les erreurs sont catchées et formatées globalement
- [ ] Pourquoi la validation est crucial pour sécurité
- [ ] Quels types d'attaques Helmet/CORS/Rate Limit préviennent
- [ ] Comment envoyer un email de A à Z
- [ ] Différence entre access token et refresh token
- [ ] Flow complet d'une requête register/login
- [ ] Comment tester chaque partie manuellement

**Si vous comprenez tout ça, vous êtes prêt pour Phase 2! 🚀**

---

*Document créé le 14 avril 2026*
*Dernière mise à jour: Phase 1 Complete*
