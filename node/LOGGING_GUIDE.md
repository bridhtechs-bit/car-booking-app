# 📋 Système de Logging Détaillé

## 🎯 Utilisation du Logger

Le système de logging fournit des messages détaillés et colorés pour chaque type d'événement.

### 1. **Logging des Erreurs**
```javascript
import logger from './utils/logger.js';

// Utilisation simple
logger.error('Erreur lors de la création', error);

// Avec informations additionnelles
logger.error('Erreur lors de la création', error, {
  userId: user._id,
  action: 'createCar',
  body: req.body
});
```

### 2. **Logging des Succès**
```javascript
// Message simple
logger.success('Voiture créée avec succès');

// Avec données
logger.success('Voiture créée', { id: car._id, name: car.name });
```

### 3. **Logging des Avertissements**
```javascript
logger.warn('Tentative d\'accès non autorisé', 'User ID: 123');
```

### 4. **Logging des Informations**
```javascript
logger.info('Connexion à la base de données', 'MongoDB connecté');
```

### 5. **Logging des Requêtes**
```javascript
logger.request('GET', '/api/cars', 200);
logger.request('POST', '/api/auth/login', 401);
```

### 6. **Logging de la Base de Données**
```javascript
logger.db('Migration démarrée', 'Création des indices');
```

### 7. **Logging Personnalisé**
```javascript
logger.log('Message personnalisé', 'red');
logger.log('Succès!', 'green');
logger.log('Avertissement', 'yellow');
```

## 📊 Exemple de Sortie Console

### ❌ Erreur
```
❌ ERROR: ValidationError
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Name: ValidationError
Message: Email already exists
Status Code: 400
Validation Errors:
  ├─ email: Email must be unique
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### ✓ Succès
```
✓ SUCCESS: Voiture créée avec succès
```

### ⚠ Avertissement
```
⚠ WARNING: Tentative d'accès non autorisé
Utilisateur non trouvé
```

### ℹ Info
```
ℹ INFO: Connexion à la base de données
MongoDB connecté
```

### 📨 Requête
```
📨 GET /api/cars [200]
📨 POST /api/auth/login [401]
```

### 🗄️ Base de Données
```
🗄️  DB: Migration démarrée
Création des indices
```

## 🎨 Couleurs Disponibles
- `red` - Rouge
- `green` - Vert
- `yellow` - Jaune
- `blue` - Bleu
- `magenta` - Magenta
- `cyan` - Cyan
- `grey` - Gris
- `brightRed` - Rouge vif
- `reset` - Défaut

## 📝 Notes

- Les erreurs en développement incluent la **stack trace complète**
- Les couleurs s'affichent dans le terminal/console supportant ANSI
- Chaque type de log a un **emoji** spécifique pour une meilleure lisibilité
- Les informations de requête incluent : method, path, IP, timestamp
