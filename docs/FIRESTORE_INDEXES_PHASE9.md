# Firestore Indexes - Phase 9 Dashboard Optimization

**Date**: 7 novembre 2024  
**Phase**: 9.6 - Optimisation & Indexes

---

## 🎯 Objectif

Créer des indexes composites Firestore pour optimiser les requêtes des dashboards (provider, client, notifications).

---

## 📊 Indexes Requis

### 1. **Bookings - Provider Dashboard** 
**Collection**: `bookings`  
**Champs**:
- `providerId` (ASCENDING)
- `status` (ASCENDING)  
- `scheduledDate` (ASCENDING)

**Requête optimisée**:
```typescript
query(
  collection(db, 'bookings'),
  where('providerId', '==', userId),
  where('status', 'in', ['accepted', 'in_progress']),
  orderBy('scheduledDate', 'asc'),
  limit(5)
);
```

**Console Firebase**:
```
https://console.firebase.google.com/project/imutask/firestore/indexes?create_composite=Ck5wcm9qZWN0cy9pbXV0YXNrL2RhdGFiYXNlcy8oZGVmYXVsdCkvY29sbGVjdGlvbkdyb3Vwcy9ib29raW5ncy9pbmRleGVzL18SEgoKcHJvdmlkZXJJZBACEggKBnN0YXR1cxACEg8KDXNjaGVkdWxlZERhdGUQAhoMCghfX25hbWVfXxAC
```

---

### 2. **Bookings - Client Dashboard**
**Collection**: `bookings`  
**Champs**:
- `clientId` (ASCENDING)
- `status` (ASCENDING)
- `scheduledDate` (ASCENDING)

**Requête optimisée**:
```typescript
query(
  collection(db, 'bookings'),
  where('clientId', '==', userId),
  where('status', 'in', ['accepted', 'in_progress']),
  orderBy('scheduledDate', 'asc'),
  limit(5)
);
```

**Console Firebase**:
```
https://console.firebase.google.com/project/imutask/firestore/indexes?create_composite=Ck1wcm9qZWN0cy9pbXV0YXNrL2RhdGFiYXNlcy8oZGVmYXVsdCkvY29sbGVjdGlvbkdyb3Vwcy9ib29raW5ncy9pbmRleGVzL18SEQoJY2xpZW50SWQQAhIICgZzdGF0dXMQAhIPCg1zY2hlZHVsZWREYXRlEAIaDAoIX19uYW1lX18QAg
```

---

### 3. **Notifications - Recent Notifications**
**Collection**: `notifications`  
**Champs**:
- `userId` (ASCENDING)
- `createdAt` (DESCENDING)

**Requête optimisée**:
```typescript
query(
  collection(db, 'notifications'),
  where('userId', '==', userId),
  orderBy('createdAt', 'desc'),
  limit(5)
);
```

**Console Firebase**:
```
https://console.firebase.google.com/project/imutask/firestore/indexes?create_composite=ClNwcm9qZWN0cy9pbXV0YXNrL2RhdGFiYXNlcy8oZGVmYXVsdCkvY29sbGVjdGlvbkdyb3Vwcy9ub3RpZmljYXRpb25zL2luZGV4ZXMvXxIKCgZ1c2VySWQQAhINCgljcmVhdGVkQXQQAxoMCghfX25hbWVfXxAC
```

---

## 📝 Statut Déploiement

### ✅ Indexes Définis
- [x] Ajoutés dans `firestore.indexes.json`
- [x] Validés avec `jq` (structure correcte)

### ⏳ Indexes En Attente
- [ ] `bookings` (providerId + status + scheduledDate)
- [ ] `bookings` (clientId + status + scheduledDate)
- [ ] `notifications` (userId + createdAt)

### 🚫 Problème Rencontré
**Erreur**: `409 - index already exists` pour collection `users`

**Cause**: Conflit entre indexes `users` existants en production et ceux définis dans `firestore.indexes.json`

**Indexes users en conflit**:
1. `(users) -- (isProvider,ASCENDING) (skills,CONTAINS) -- Density:SPARSE_ALL`
2. `(users) -- (isProvider,ASCENDING) (availability,ASCENDING) (skills,CONTAINS) -- Density:SPARSE_ALL`

**Solution temporaire**: Création manuelle via Console Firebase

---

## 🔧 Création Manuelle des Indexes

### Option 1: Console Firebase Web
1. Aller sur https://console.firebase.google.com/project/imutask/firestore/indexes
2. Cliquer sur "Create Index"
3. Pour chaque index:
   - Sélectionner la collection
   - Ajouter les champs avec l'ordre correct
   - Mode de requête: "Collection"
   - Cliquer sur "Create"

### Option 2: Via URL directe
Utiliser les URLs générées ci-dessus (une par index) pour création automatique.

### Option 3: Attendre erreur en production
Quand une requête échoue en production, Firebase affiche un lien direct pour créer l'index manquant dans les logs.

---

## 📈 Performance Attendue

### Avant Indexes
- **Requête bookings**: Scan de tous les documents → ~100-500ms
- **Requête notifications**: Scan de tous les documents → ~50-200ms

### Après Indexes
- **Requête bookings**: Index lookup → ~10-50ms ⚡ (5-10x plus rapide)
- **Requête notifications**: Index lookup → ~5-20ms ⚡ (10x plus rapide)

### Impact Dashboards
- **Provider Dashboard**: Chargement initial ~1s → ~200ms
- **Client Dashboard**: Chargement initial ~800ms → ~150ms
- **Notifications**: Temps de réponse ~100ms → ~20ms

---

## ✅ Validation Post-Déploiement

### 1. Vérifier création indexes
```bash
firebase firestore:indexes
```

### 2. Tester requêtes
```typescript
// Dans la console Firebase > Firestore > Query
// Collection: bookings
// Filters:
//   - providerId == [test-user-id]
//   - status in ['accepted', 'in_progress']
// Order: scheduledDate asc
// Limit: 5
```

### 3. Monitorer performance
- Ouvrir Firebase Console > Firestore > Usage
- Vérifier temps de réponse des requêtes (doit être < 50ms)
- Vérifier nombre de lectures (doit correspondre au limit)

---

## 📁 Fichier de Configuration

**Chemin**: `/firestore.indexes.json`

**Indexes ajoutés** (lignes 372-421):
```json
{
  "collectionGroup": "bookings",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "providerId", "order": "ASCENDING" },
    { "fieldPath": "status", "order": "ASCENDING" },
    { "fieldPath": "scheduledDate", "order": "ASCENDING" }
  ]
},
{
  "collectionGroup": "bookings",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "clientId", "order": "ASCENDING" },
    { "fieldPath": "status", "order": "ASCENDING" },
    { "fieldPath": "scheduledDate", "order": "ASCENDING" }
  ]
},
{
  "collectionGroup": "notifications",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "userId", "order": "ASCENDING" },
    { "fieldPath": "createdAt", "order": "DESCENDING" }
  ]
}
```

---

## 🚀 Prochaines Optimisations (Optionnelles)

### 1. Pagination Cursor-Based
```typescript
export function useUpcomingBookings(
  userId: string,
  role: 'client' | 'provider',
  limit: number = 5,
  lastDoc?: DocumentSnapshot // 👈 Nouveau paramètre
) {
  const q = query(
    collection(db, 'bookings'),
    where(userIdField, '==', userId),
    where('status', 'in', ['accepted', 'in_progress']),
    orderBy('scheduledDate', 'asc'),
    ...(lastDoc ? [startAfter(lastDoc)] : []), // 👈 Pagination
    firestoreLimit(limit)
  );
}
```

### 2. Caching avec SWR
```typescript
import useSWR from 'swr';

const { data, error } = useSWR(
  ['providerStats', userId],
  () => fetchProviderStats(userId),
  { revalidateOnFocus: false, refreshInterval: 60000 } // 1 min cache
);
```

### 3. Real-time Updates avec onSnapshot
```typescript
useEffect(() => {
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const bookings = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setState({ data: bookings, loading: false, error: null });
  });
  
  return () => unsubscribe();
}, [userId]);
```

---

## 📊 Métriques Phase 9.6

| Métrique | Valeur |
|----------|--------|
| Indexes définis | 3 |
| Indexes déployés | 0 (en attente création manuelle) |
| Collections optimisées | 2 (bookings, notifications) |
| Gain performance estimé | 5-10x |
| Temps déploiement | ~5 min (manuel) |

---

## 📝 Notes

- Les indexes `users` existants ne doivent PAS être supprimés (utilisés par d'autres features)
- La création manuelle via Console Firebase est la solution la plus sûre
- Une fois créés, les indexes apparaîtront automatiquement dans `firebase firestore:indexes`
- Les indexes peuvent prendre 1-2 minutes à se construire pour les grandes collections

---

**Auteur**: Session GitHub Copilot  
**Date**: 7 novembre 2024  
**Status**: ⏳ En attente création manuelle via Console Firebase
