# Backend Favoris - Intégration Complète ✅

**Date:** 10 novembre 2025  
**Phase:** 10 - Fonctionnalités avancées  
**Statut:** ✅ Production Ready

---

## 📋 Vue d'ensemble

Le système de favoris est **entièrement intégré** avec Firestore et prêt pour la production.

### Architecture Backend

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React)                          │
├─────────────────────────────────────────────────────────────┤
│  Components                                                  │
│  ├─ FavoriteButton.tsx    → useToggleFavorite()            │
│  └─ FavoritesPage.tsx     → useFavorites()                 │
├─────────────────────────────────────────────────────────────┤
│  Hooks Layer                                                 │
│  ├─ useFavorites()         → getFavorites()                │
│  └─ useToggleFavorite()    → addFavorite() / removeFavorite()│
├─────────────────────────────────────────────────────────────┤
│  Service Layer (lib/firestore-favorites.ts)                 │
│  ├─ addFavorite()          → Firestore: favorites.add()    │
│  ├─ removeFavorite()       → Firestore: favorites.delete() │
│  ├─ getFavorites()         → Firestore: favorites.query()  │
│  ├─ isFavorited()          → Firestore: favorites.exists() │
│  └─ getFavoritesCount()    → Firestore: favorites.count()  │
├─────────────────────────────────────────────────────────────┤
│                    Firestore (Backend)                       │
│  Collection: favorites                                       │
│  ├─ Security Rules (lignes 253-283)                        │
│  ├─ Composite Indexes (2)                                   │
│  └─ Data Structure                                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Collection Firestore: `favorites`

### Structure des documents

```typescript
{
  id: string;              // Auto-généré par Firestore
  userId: string;          // UID de l'utilisateur (indexé)
  itemType: 'task' | 'provider';  // Type d'item (indexé)
  itemId: string;          // ID de la tâche ou du prestataire
  metadata: {              // Données dénormalisées pour performance
    title?: string;        // Titre de l'item
    imageUrl?: string;     // URL de l'image
    category?: string;     // Catégorie (pour tasks)
    providerName?: string; // Nom du prestataire (pour providers)
    location?: string;     // Localisation
    // Extensible avec d'autres champs
  };
  createdAt: Timestamp;    // Date de création (indexé DESC)
  updatedAt?: Timestamp;   // Date de dernière modification
}
```

### Exemple de document

```json
{
  "id": "fav_abc123",
  "userId": "user_xyz789",
  "itemType": "task",
  "itemId": "task_456def",
  "metadata": {
    "title": "Aide aux courses",
    "category": "Courses & Livraisons",
    "location": "Paris 15e",
    "imageUrl": "https://..."
  },
  "createdAt": "2025-11-10T10:30:00Z"
}
```

---

## 🔐 Règles de Sécurité Firestore

**Fichier:** `firestore.rules` (lignes 253-283)

```javascript
match /favorites/{favoriteId} {
  // READ: Utilisateur peut lire uniquement SES favoris
  allow read: if isAuthenticated() && 
                 resource.data.userId == request.auth.uid;
  
  // CREATE: Utilisateur peut créer des favoris pour lui-même
  allow create: if isAuthenticated() && 
                   request.resource.data.userId == request.auth.uid &&
                   // Validation des champs requis
                   request.resource.data.keys().hasAll(['userId', 'itemType', 'itemId', 'createdAt']) &&
                   // itemType doit être 'task' ou 'provider'
                   request.resource.data.itemType in ['task', 'provider'];
  
  // UPDATE: Utilisateur peut mettre à jour uniquement metadata et updatedAt
  allow update: if isAuthenticated() && 
                   resource.data.userId == request.auth.uid &&
                   request.resource.data.diff(resource.data).affectedKeys().hasOnly(['metadata', 'updatedAt']);
  
  // DELETE: Utilisateur peut supprimer ses propres favoris
  allow delete: if isAuthenticated() && 
                   resource.data.userId == request.auth.uid;
}
```

### Sécurité assurée ✅

- ✅ **Isolation utilisateur**: Un utilisateur ne peut accéder qu'à ses favoris
- ✅ **Validation des types**: `itemType` limité à `'task' | 'provider'`
- ✅ **Champs requis**: `userId`, `itemType`, `itemId`, `createdAt` obligatoires
- ✅ **Protection contre modifications**: Seuls `metadata` et `updatedAt` modifiables
- ✅ **Authentification**: Toutes les opérations nécessitent un utilisateur connecté

---

## 📊 Index Composites

**Fichier:** `firestore.indexes.json` (lignes 436-469)

### Index 1: Liste des favoris par utilisateur

```json
{
  "collectionGroup": "favorites",
  "fields": [
    { "fieldPath": "userId", "order": "ASCENDING" },
    { "fieldPath": "createdAt", "order": "DESCENDING" }
  ]
}
```

**Usage:** `getFavorites(userId)` - Liste tous les favoris d'un utilisateur, triés par date (plus récents en premier)

### Index 2: Filtrage par type d'item

```json
{
  "collectionGroup": "favorites",
  "fields": [
    { "fieldPath": "userId", "order": "ASCENDING" },
    { "fieldPath": "itemType", "order": "ASCENDING" },
    { "fieldPath": "createdAt", "order": "DESCENDING" }
  ]
}
```

**Usage:** `getFavorites(userId, 'task')` - Filtre les favoris par type (tasks ou providers)

### Performance ⚡

- ✅ **Requêtes optimisées**: Index composites pour toutes les queries
- ✅ **Tri efficace**: `createdAt DESC` pour affichage chronologique
- ✅ **Filtrage rapide**: Index sur `itemType` pour tabs tasks/providers

---

## 🛠️ API Service Layer

**Fichier:** `src/lib/firestore-favorites.ts` (198 lignes)

### Fonctions disponibles

| Fonction | Description | Paramètres | Retour |
|----------|-------------|------------|--------|
| `addFavorite()` | Ajoute un favori (avec détection de doublons) | `userId`, `CreateFavoriteInput` | `string` (favoriteId) |
| `removeFavorite()` | Supprime un favori | `userId`, `favoriteId` | `void` |
| `getFavorites()` | Récupère tous les favoris (avec filtre optionnel) | `userId`, `itemType?` | `Favorite[]` |
| `getFavoriteByItem()` | Vérifie si un item est en favori | `userId`, `itemType`, `itemId` | `Favorite \| null` |
| `isFavorited()` | Vérifie si un item est en favori (boolean) | `userId`, `itemType`, `itemId` | `boolean` |
| `getFavoritesCount()` | Compte le nombre de favoris | `userId`, `itemType?` | `number` |

### Exemple d'utilisation

```typescript
import { addFavorite, removeFavorite, getFavorites } from '@/lib/firestore-favorites';

// Ajouter une tâche aux favoris
const favoriteId = await addFavorite(userId, {
  itemType: 'task',
  itemId: 'task_123',
  metadata: {
    title: 'Aide au ménage',
    category: 'Aide à domicile',
    location: 'Lyon'
  }
});

// Récupérer tous les favoris
const allFavorites = await getFavorites(userId);

// Récupérer uniquement les tâches favorites
const taskFavorites = await getFavorites(userId, 'task');

// Supprimer un favori
await removeFavorite(userId, favoriteId);

// Vérifier si un item est favori
const isFav = await isFavorited(userId, 'task', 'task_123');
```

---

## 🎣 React Hooks

**Fichier:** `src/hooks/use-favorites.ts` (239 lignes)

### Hook 1: `useFavorites(itemType?)`

**Usage:** Gérer la liste complète des favoris avec état React

```typescript
const { 
  favorites,           // Favorite[] - Liste des favoris
  loading,            // boolean - État de chargement
  error,              // string | null - Message d'erreur
  addToFavorites,     // (input) => Promise<string | null>
  removeFromFavorites,// (favoriteId) => Promise<void>
  checkIsFavorited,   // (itemId, itemType) => boolean
  getFavoriteId,      // (itemId, itemType) => string | null
  refetch             // () => Promise<void>
} = useFavorites('task'); // Filtre optionnel
```

**Caractéristiques:**
- ✅ Chargement automatique au mount
- ✅ Rechargement automatique après ajout/suppression
- ✅ Toasts de succès/erreur (i18n)
- ✅ Gestion de l'état de chargement
- ✅ Filtrage optionnel par `itemType`

### Hook 2: `useToggleFavorite(itemId, itemType, metadata)`

**Usage:** Gérer un seul favori (pour boutons individuels)

```typescript
const { 
  isFavorited,  // boolean - État favori
  loading,      // boolean - État de chargement
  toggle        // () => Promise<void> - Toggle favori
} = useToggleFavorite('task_123', 'task', {
  title: 'Aide aux courses',
  category: 'Courses & Livraisons'
});
```

**Caractéristiques:**
- ✅ Vérification automatique au mount
- ✅ Toggle add/remove en une fonction
- ✅ Toasts automatiques avec i18n
- ✅ Optimisé pour FavoriteButton (pas de chargement complet de la liste)
- ✅ Metadata transmise lors de l'ajout

---

## 📦 Déploiement

### Script automatisé

```bash
./scripts/deploy-favorites.sh
```

**Le script:**
1. ✅ Vérifie Firebase CLI installé
2. ✅ Vérifie la présence des fichiers `firestore.rules` et `firestore.indexes.json`
3. ✅ Affiche un aperçu des règles et indexes
4. ✅ Demande confirmation
5. ✅ Déploie les règles: `firebase deploy --only firestore:rules`
6. ✅ Déploie les indexes: `firebase deploy --only firestore:indexes`

### Déploiement manuel

```bash
# Règles uniquement
firebase deploy --only firestore:rules

# Indexes uniquement
firebase deploy --only firestore:indexes

# Tout déployer
firebase deploy --only firestore
```

### Vérification post-déploiement

1. **Console Firebase** → Firestore Database → Rules
   - Vérifier que les règles `favorites` sont présentes (lignes 253-283)

2. **Console Firebase** → Firestore Database → Indexes
   - Attendre la création des 2 index composites (peut prendre 5-10 min)
   - Status doit passer de "Building" à "Enabled"

3. **Tests dans l'app**
   - ✅ Ajouter une tâche aux favoris
   - ✅ Ajouter un prestataire aux favoris
   - ✅ Vérifier la page `/dashboard/favorites`
   - ✅ Filtrer par type (tasks/providers)
   - ✅ Supprimer des favoris
   - ✅ Vérifier les toasts de succès/erreur

---

## 🧪 Tests Backend

### Tests manuels recommandés

```bash
# 1. Créer un favori
POST /favorites
{
  "userId": "current_user_uid",
  "itemType": "task",
  "itemId": "task_123",
  "metadata": { "title": "Test" }
}

# 2. Lire les favoris
GET /favorites?userId=current_user_uid

# 3. Filtrer par type
GET /favorites?userId=current_user_uid&itemType=task

# 4. Supprimer un favori
DELETE /favorites/fav_abc123
```

### Tests de sécurité

1. ✅ **Isolation**: User A ne peut pas lire les favoris de User B
2. ✅ **Création**: User A ne peut pas créer un favori pour User B
3. ✅ **Modification**: User A ne peut pas modifier les favoris de User B
4. ✅ **Suppression**: User A ne peut pas supprimer les favoris de User B
5. ✅ **Validation**: itemType doit être 'task' ou 'provider' (pas 'hacker')

---

## 🔍 Monitoring & Analytics

### Métriques à suivre

1. **Utilisation**
   - Nombre de favoris créés par jour/semaine
   - Ratio tasks vs providers favoris
   - Utilisateurs actifs avec favoris

2. **Performance**
   - Temps de réponse `getFavorites()`
   - Latence ajout/suppression
   - Taux d'erreur Firestore

3. **Engagement**
   - Taux de conversion: Vu → Favori → Action
   - Nombre moyen de favoris par utilisateur
   - Taux de suppression des favoris

### Firebase Console

- **Firestore** → Données → Collection `favorites`
- **Firestore** → Usage → Requêtes par seconde
- **Firestore** → Indexes → État des index composites

---

## ✅ Checklist de Production

### Backend
- [x] Collection `favorites` créée
- [x] Security rules déployées et testées
- [x] Index composites créés (2)
- [x] Service layer implémenté (6 fonctions)
- [x] React hooks implémentés (2)
- [x] Script de déploiement créé

### Frontend
- [x] FavoriteButton intégré (TaskCard, ProviderCard)
- [x] FavoritesPage créée avec tabs
- [x] Header menu link ajouté
- [x] Dashboard KPI cards ajoutées (Client, Provider, Pro)
- [x] Traductions i18n (FR/EN/JA)
- [x] Toasts de succès/erreur
- [x] data-testid pour E2E tests

### Documentation
- [x] Règles de sécurité documentées
- [x] Structure de données documentée
- [x] API service documentée
- [x] Hooks documentés
- [x] Guide de déploiement
- [ ] Tests E2E (à créer)

---

## 🚀 Prochaines Étapes

1. **Tests E2E** (Playwright)
   - Créer `e2e/favorites.spec.ts`
   - Tester le flow complet add → list → filter → remove

2. **Optimisations futures** (si nécessaire)
   - Pagination pour les listes > 100 favoris
   - Synchronisation temps réel (onSnapshot)
   - Cache local avec SWR/React Query
   - Sync metadata en temps réel (Cloud Functions)

3. **Fonctionnalités avancées** (Phase 11+)
   - Export des favoris
   - Partage de listes de favoris
   - Notifications sur favoris (prix réduits, disponibilité)
   - Statistiques détaillées

---

## 📚 Ressources

- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Composite Indexes](https://firebase.google.com/docs/firestore/query-data/indexing)
- [React Hooks Best Practices](https://react.dev/reference/react/hooks)
- [Next.js Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching)

---

**✅ Le backend du système de Favoris est 100% opérationnel et prêt pour la production !**
