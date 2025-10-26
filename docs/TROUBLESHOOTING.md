# 🔧 Guide de Troubleshooting - IMU Task

**Date** : 25 octobre 2025  
**Version** : 1.0

---

## 🐛 Erreurs courantes et solutions

### 1. Erreur : `isAlgoliaConfigured is not a function`

**Erreur complète** :
```
Error: (0 , {imported module}.isAlgoliaConfigured) is not a function
src/components/dashboard/dashboard-header.tsx (52:37)
```

**Cause** :
`isAlgoliaConfigured` est une **constante boolean**, pas une fonction.

**Solution** :
```typescript
// ❌ INCORRECT
setUseAlgolia(isAlgoliaConfigured());

// ✅ CORRECT
setUseAlgolia(isAlgoliaConfigured);
```

**Fichiers à vérifier** :
- `/src/components/dashboard/dashboard-header.tsx`
- Tout composant utilisant `isAlgoliaConfigured`

**Status** : ✅ **CORRIGÉ**

---

### 2. Erreur : `Failed to fetch tasks. Please try again.`

**Erreur complète** :
```
Error: Failed to fetch tasks. Please try again.
src/lib/firestore-tasks.ts (301:15)
```

**Causes possibles** :
1. **Firestore non initialisé** : Firebase config manquante
2. **Permissions Firestore** : Règles de sécurité bloquent la lecture
3. **Connexion réseau** : Pas d'accès Internet
4. **Collection vide** : Aucune tâche dans Firestore

**Solutions** :

#### Solution 1 : Vérifier Firebase config

Fichier `.env.local` doit contenir :
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

#### Solution 2 : Vérifier règles Firestore

Fichier `firestore.rules` :
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read for authenticated users
    match /tasks/{taskId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

#### Solution 3 : Utiliser les données mock (fallback)

Le code a déjà un fallback automatique :
```typescript
try {
  const openTasks = await getTasksWithFilters({ status: 'open' });
  setTasks(openTasks.slice(0, 6));
} catch (error) {
  console.error('Error fetching tasks:', error);
  // ✅ Fallback vers mock data
  const mockTasks = getTasks();
  setTasks(mockTasks.slice(0, 6));
}
```

**Status** : ⚠️ **GÉRÉ PAR FALLBACK** (application fonctionne avec mock data)

---

### 3. Erreur : `appId is missing` (Algolia)

**Erreur complète** :
```
Error: `appId` is missing.
src/lib/algolia-config.ts (31:41)
```

**Cause** :
Variables d'environnement Algolia non définies.

**Solution** :

#### Option 1 : Configurer Algolia (recommandé en production)

Créer `.env.local` :
```env
NEXT_PUBLIC_ALGOLIA_APP_ID=your_app_id
NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY=your_search_api_key
ALGOLIA_ADMIN_API_KEY=your_admin_api_key
```

#### Option 2 : Ignorer (graceful degradation)

L'application fonctionne **sans Algolia** :
- Badge "Algolia non configuré" affiché
- Recherche désactivée temporairement
- Aucun crash

**Status** : ✅ **GÉRÉ PAR GRACEFUL DEGRADATION**

---

### 4. Erreur : `Failed to compile` (TypeScript)

**Causes possibles** :
1. Import manquant
2. Type incompatible
3. Syntaxe invalide

**Solution** :

```bash
# Vérifier les erreurs TypeScript
pnpm tsc --noEmit

# Nettoyer le cache Next.js
rm -rf .next
pnpm dev
```

**Vérifier les imports** :
```typescript
// ✅ CORRECT
import { isAlgoliaConfigured } from '@/lib/algolia-config';

// ❌ INCORRECT
import isAlgoliaConfigured from '@/lib/algolia-config';
```

---

### 5. Erreur : `Module not found` (Dépendances)

**Erreur exemple** :
```
Module not found: Can't resolve 'algoliasearch'
```

**Cause** :
Dépendances npm non installées.

**Solution** :

```bash
# Installer les dépendances
pnpm install

# Si problème persiste, nettoyer et réinstaller
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

**Vérifier `package.json`** :
```json
{
  "dependencies": {
    "algoliasearch": "^5.17.0",
    "react-instantsearch": "^7.13.4"
  }
}
```

---

### 6. Erreur : `Hydration failed` (React)

**Erreur complète** :
```
Error: Hydration failed because the initial UI does not match what was rendered on the server.
```

**Causes possibles** :
1. Utilisation de `window` côté serveur
2. Date/temps différents entre serveur et client
3. Ordre des composants changé

**Solution** :

#### Protéger code client-side :
```typescript
// ❌ INCORRECT
const isClient = window !== undefined;

// ✅ CORRECT
const [isClient, setIsClient] = useState(false);
useEffect(() => {
  setIsClient(true);
}, []);
```

#### Utiliser `'use client'` :
```typescript
'use client';

import { useState } from 'react';
// ... reste du composant
```

---

### 7. Erreur : `Firebase auth not initialized`

**Erreur** :
```
Error: Firebase has not been correctly initialized
```

**Cause** :
Firebase config manquante ou invalide.

**Solution** :

#### Vérifier `/src/lib/firebase.ts` :
```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  // ... autres configs
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

#### Vérifier que toutes les variables commencent par `NEXT_PUBLIC_` :
```env
# ✅ CORRECT (accessible côté client)
NEXT_PUBLIC_FIREBASE_API_KEY=xxx

# ❌ INCORRECT (seulement côté serveur)
FIREBASE_API_KEY=xxx
```

---

### 8. Erreur : `localStorage is not defined`

**Erreur** :
```
ReferenceError: localStorage is not defined
```

**Cause** :
Code exécuté côté serveur (SSR) où `localStorage` n'existe pas.

**Solution** :

```typescript
// ❌ INCORRECT
const value = localStorage.getItem('key');

// ✅ CORRECT
const value = typeof window !== 'undefined' 
  ? localStorage.getItem('key') 
  : null;

// OU avec useEffect
useEffect(() => {
  const value = localStorage.getItem('key');
  // ...
}, []);
```

---

### 9. Erreur : Tests Playwright timeout

**Erreur** :
```
TimeoutError: page.waitForSelector: Timeout 10000ms exceeded
```

**Cause** :
Serveur de développement non démarré.

**Solution** :

```bash
# Terminal 1 : Démarrer le serveur
pnpm dev

# Terminal 2 : Lancer les tests
pnpm test:e2e
```

**Vérifier le port** :
```typescript
// playwright.config.ts
webServer: {
  command: 'pnpm dev',
  url: 'http://localhost:3000', // Ou votre port
  reuseExistingServer: !process.env.CI,
}
```

---

### 10. Erreur : Recharts not rendering

**Erreur** :
Graphiques Recharts ne s'affichent pas.

**Cause** :
Composant Recharts rendu côté serveur.

**Solution** :

```typescript
'use client';

import dynamic from 'next/dynamic';

// Charger Recharts uniquement côté client
const RechartsLineChart = dynamic(
  () => import('recharts').then(mod => mod.LineChart),
  { ssr: false }
);
```

---

## 🔍 Commandes de diagnostic

### Vérifier les erreurs TypeScript

```bash
pnpm tsc --noEmit
```

### Vérifier les erreurs ESLint

```bash
pnpm lint
```

### Nettoyer le projet

```bash
# Supprimer .next et node_modules
rm -rf .next node_modules pnpm-lock.yaml

# Réinstaller
pnpm install

# Redémarrer
pnpm dev
```

### Vérifier les variables d'environnement

```bash
# Afficher les variables (sans valeurs sensibles)
env | grep NEXT_PUBLIC_
```

### Logs Firebase

```typescript
// Activer les logs Firebase
import { setLogLevel } from 'firebase/firestore';
setLogLevel('debug');
```

---

## 📊 Checklist de débogage

Avant de signaler un bug, vérifier :

- [ ] **Variables d'environnement** : `.env.local` existe et contient toutes les clés
- [ ] **Dépendances** : `pnpm install` exécuté
- [ ] **Cache Next.js** : `.next` supprimé et régénéré
- [ ] **Port disponible** : Port 3000 (ou autre) non utilisé
- [ ] **Firebase initialisé** : Config Firebase valide
- [ ] **TypeScript** : `pnpm tsc --noEmit` sans erreur
- [ ] **ESLint** : `pnpm lint` sans erreur bloquante
- [ ] **Navigateur** : Cache navigateur vidé
- [ ] **Console** : Logs d'erreur dans la console browser
- [ ] **Terminal** : Logs d'erreur dans le terminal serveur

---

## 🆘 Obtenir de l'aide

### Logs utiles

```typescript
// Firebase auth
console.log('User:', auth.currentUser);

// Firestore query
console.log('Query result:', await getDocs(query));

// Algolia
console.log('Algolia configured:', isAlgoliaConfigured);
console.log('Search client:', searchClient);

// Environment
console.log('API Key exists:', !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
```

### Informations à fournir

Quand vous signalez un bug, inclure :

1. **Message d'erreur complet** (stack trace)
2. **Fichier concerné** (path + numéro de ligne)
3. **Étapes pour reproduire** (1, 2, 3...)
4. **Version Node.js** : `node -v`
5. **Version pnpm** : `pnpm -v`
6. **Navigateur** : Chrome 119, Firefox 120, etc.
7. **OS** : macOS 14.5, Windows 11, etc.

---

## ✅ Résolutions appliquées

### Session du 25 octobre 2025

1. **✅ `isAlgoliaConfigured is not a function`**
   - Cause : Appelé comme fonction au lieu de constante
   - Fichier : `src/components/dashboard/dashboard-header.tsx:52`
   - Fix : `isAlgoliaConfigured()` → `isAlgoliaConfigured`

2. **✅ Graceful degradation Algolia**
   - Ajout `isAlgoliaConfigured` boolean
   - `searchClient` retourne `null` si non configuré
   - Badge "Algolia non configuré" affiché
   - Application fonctionne sans credentials

3. **⚠️ Firestore tasks error**
   - Fallback vers mock data déjà en place
   - Application continue de fonctionner
   - Logs d'erreur pour debugging

---

**Dernière mise à jour** : 25 octobre 2025  
**Erreurs résolues** : 2/3  
**Erreurs gérées** : 1/3 (fallback)
