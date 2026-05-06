# Car Booking App - Root Configuration

Structure du projet avec trois applications:

## 📁 Structure

```
car-booking-app/
├── webApp/           # Version web React (Admin & Client)
│   ├── admin/       # Tableau de bord admin
│   ├── client/      # Application client
│   └── node/        # Backend API (Node/Express)
│
├── mobilapp/        # Version mobile React Native (Nouveau)
│   ├── src/
│   └── package.json
│
└── docs/            # [Optionnel] Documentation générale
```

## 🚀 Premiers Pas

### Installation des dépendances

```bash
# Web - Client
cd webApp/client
npm install

# Web - Admin
cd webApp/admin
npm install

# Web - Backend
cd webApp/node
npm install

# Mobile
cd mobilapp
npm install
```

### Démarrage du développement

```bash
# Backend (depuis webApp/node)
npm start

# Client Web (depuis webApp/client)
npm start

# Admin Web (depuis webApp/admin)
npm start

# Mobile (depuis mobilapp)
npm start
```

## 📋 Configuration

### Variables d'environnement

Chaque application a un fichier `.env.example` - copier et adapter:

```bash
cp .env.example .env
```

#### Backend (webApp/node/.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/carbooking
JWT_SECRET=your_secret_key
```

#### Client Web (webApp/client/.env)
```
REACT_APP_API_BASE_URL=http://localhost:5000/api
```

#### Admin Web (webApp/admin/.env)
```
REACT_APP_API_BASE_URL=http://localhost:5000/api
```

#### Mobile (mobilapp/.env)
```
REACT_APP_API_BASE_URL=http://localhost:5000/api
```

## 🏗️ Architecture API

Toutes les applications utilisent la même API Backend:
- **URL**: http://localhost:5000/api
- **Authentification**: JWT Bearer tokens
- **Stockage**: MongoDB
- **Documentation**: Voir `webApp/node/LOGGING_GUIDE.md`

## 👥 Versions

### Website Client (webApp/client)
- Accueil avec recherche
- Catalogue de voitures
- Détails et réservation
- Mes réservations
- Authentification utilisateur

### Website Admin (webApp/admin)
- Gestion des voitures
- Gestion des réservations
- Gestion des utilisateurs
- Paramètres

### Mobile App (mobilapp)
- Version mobile avec React Native/Expo
- Même fonctionnalités que client web
- Optimisé pour téléphones

### Backend API (webApp/node)
- Express.js
- MongoDB
- JWT authentification
- RESTful API

## 📚 Documentation

- [Web App README](./webApp/README.md)
- [Mobile App README](./mobilapp/README.md)
- [Backend Logging Guide](./webApp/node/LOGGING_GUIDE.md)

## 🔧 Scripts Globaux (À ajouter si nécessaire)

```bash
# Démarrer tous les services (depuis la racine avec concurrently)
npm run dev:all

# Builder toutes les applications
npm run build:all

# Tests
npm run test:all
```

## 🐛 Troubleshooting

### Port 3000 déjà utilisé
```bash
# Changer le port pour React
PORT=3001 npm start
```

### Port 5000 déjà utilisé
```bash
# Changer le port pour Express
PORT=5001 npm start
```

### Problèmes de CORS
Vérifier la configuration CORS dans `webApp/node/src/app.js`

## 📝 Convention de Commit

```
feat: Ajouter nouvelle fonctionnalité
fix: Corriger un bug
docs: Mettre à jour la documentation
style: Changements de formatage
refactor: Restructurer du code
test: Ajouter des tests
chore: Mises à jour des dépendances
```

## ⚖️ License

Propriétaire - Tous droits réservés
