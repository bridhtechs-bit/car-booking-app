# Plan d'implementation des performances

## Objectif

Corriger les principaux problemes de performance identifies dans le client React et le serveur Express, puis verifier les resultats avec des mesures reproductibles.

## Priorites

### 1. Optimiser les images

**Fichiers concernes :**

- `client/src/components/CarCard.js`
- `client/src/pages/CarDetails.js`
- `client/src/pages/MyBookings.js`
- `node/src/controllers/carController.js`

**Actions :**

- Corriger l'utilisation de `car.images` pour fournir une URL d'image valide.
- Ajouter `loading="lazy"` aux images situees sous le pliage.
- Conserver le chargement immediat uniquement pour les images critiques du premier ecran.
- Ajouter `width` et `height`, ou un ratio CSS stable, pour eviter le CLS.
- Configurer Cloudinary avec `f_auto` et `q_auto`.
- Ajouter des largeurs adaptees (`w_...`) et, si necessaire, `srcSet` et `sizes`.
- Convertir ou remplacer les images lourdes qui ne sont pas necessaires en PNG/JPEG.

**Validation :**

- Les images sont servies en WebP ou AVIF lorsque le navigateur le permet.
- Les images sous le pliage sont lazy-loadées.
- Les dimensions affichees correspondent aux dimensions demandees.
- Aucun decalage visuel important n'apparait au chargement.

### 2. Configurer le cache des assets statiques

**Fichiers concernes :**

- `node/index.js`
- Configuration de deploiement Render/Cloudflare

**Actions :**

- Configurer `/uploads` avec `etag`, `maxAge: '1y'` et `immutable` lorsque les URLs sont versionnees.
- Servir les fichiers fingerprintes du frontend avec :

```http
Cache-Control: public, max-age=31536000, immutable
```

- Servir `index.html` avec une politique courte :

```http
Cache-Control: no-cache, must-revalidate
```

- Conserver les noms fingerprintes generes par Create React App pour le cache-busting.
- Ne pas appliquer de cache longue duree aux reponses personnalisees ou authentifiees.

**Validation :**

- Les fichiers `main.[hash].js`, CSS et medias ont une duree de cache d'un an.
- `index.html` est revalide apres un deploiement.
- Une nouvelle version du build genere de nouveaux noms de fichiers.

### 3. Formaliser la configuration CDN

**Actions :**

- Conserver Cloudflare/Render pour les assets statiques.
- Utiliser Cloudinary comme CDN pour les images hebergees.
- Verifier les indicateurs `Server`, `CF-Cache-Status` et `Age`.
- Verifier qu'une deuxieme requete retourne `CF-Cache-Status: HIT`.
- Documenter les regles CDN dans la documentation de deploiement.

**Validation :**

- Les assets statiques retournent `Server: cloudflare`.
- Les assets chaques retournent `CF-Cache-Status: HIT` apres la premiere requete.
- Les reponses API dynamiques ne sont pas mises en cache par erreur.

### 4. Ajouter un cache pour les donnees frequentes

**Endpoints candidats :**

- `GET /api/cars`
- `GET /api/cars/featured`
- `GET /api/cars/category`
- `GET /api/cars/:id`

**Actions :**

- Utiliser Redis en production pour partager le cache entre les instances.
- Utiliser un TTL de 30 a 120 secondes pour les listes de voitures.
- Utiliser un TTL d'environ 5 minutes pour les categories et les voitures vedettes.
- Construire les cles avec les parametres de pagination, tri et filtrage.
- Invalider les cles concernees apres creation, modification ou suppression d'une voiture.
- Ne pas mettre en cache l'authentification, les reservations ou les reponses dependantes de l'utilisateur.
- Utiliser un cache memoire uniquement comme solution de developpement ou pour une instance unique.

**Validation :**

- La deuxieme requete identique est servie depuis le cache.
- Une mutation invalide les donnees precedemment cachees.
- Le cache n'expose aucune donnee privee entre utilisateurs.

### 5. Implementer le code splitting

**Fichier principal :** `client/src/App.js`

**Actions :**

- Remplacer les imports directs des pages par `React.lazy()`.
- Ajouter `Suspense` avec un fallback leger.
- Charger les pages de maniere differente : accueil, catalogue, details, connexion et reservations.
- Garder dans le bundle initial uniquement le layout et les composants necessaires au premier rendu.

Exemple :

```js
const Home = lazy(() => import('./pages/Home'));
const CarListing = lazy(() => import('./pages/CarListing'));
const CarDetail = lazy(() => import('./pages/carDetail'));
```

**Validation :**

- Le build genere plusieurs chunks JavaScript.
- La page de connexion ne telecharge pas les chunks de reservations ou de catalogue.
- La navigation reste fonctionnelle avec un fallback de chargement.

### 6. Optimiser le chargement des polices

**Etat actuel :** l'application utilise des polices systeme et ne charge pas de police web distante.

**Actions possibles :**

- Conserver les polices systeme pour eviter une requete reseau supplementaire ; ou
- Ajouter une police locale WOFF2 uniquement si elle est necessaire au design.
- Dans ce second cas, utiliser `font-display: swap`.
- Precharger uniquement la police critique avec `rel="preload"`.

**Validation :**

- Aucune police ne bloque le rendu.
- Aucun texte ne reste invisible pendant le chargement.
- Le nombre de ressources critiques n'augmente pas inutilement.

### 7. Restaurer la chaine de mesure

**Actions :**

- Reinstaller les dependances du client si necessaire.
- Corriger l'installation locale incomplete signalee par `escodegen`.
- Executer la build de production.
- Lancer Lighthouse sur le build ou sur le deploiement.
- Conserver les mesures dans la CI pour detecter les regressions.

Commandes de reference :

```powershell
Push-Location client
npm install
npm run build
Pop-Location

npx serve -s client/build
npx lighthouse http://localhost:3000 --view
```

**Objectifs :**

- Score Performance Lighthouse : au moins 90.
- LCP : moins de 2,5 secondes.
- CLS : moins de 0,1.
- INP : moins de 200 millisecondes.
- Reduction du poids JavaScript initial.
- Reduction du poids moyen des images.

## Ordre d'execution recommande

1. Corriger les images et leurs dimensions.
2. Implementer le code splitting.
3. Configurer le cache longue duree des assets fingerprintes.
4. Optimiser les URLs Cloudinary et verifier le CDN.
5. Ajouter le cache API avec invalidation.
6. Confirmer la strategie de polices.
7. Mesurer Lighthouse et ajouter les controles de regression.

## Critere de cloture

Le chantier est termine lorsque :

- la build de production est reproductible ;
- les images critiques et non critiques suivent la strategie definie ;
- les headers CDN et cache sont verifies sur HTML, JS, CSS et images ;
- le cache API possede une invalidation testee ;
- plusieurs chunks sont generes par le build ;
- le score Lighthouse, le LCP et les autres Core Web Vitals sont mesures et documentes.
