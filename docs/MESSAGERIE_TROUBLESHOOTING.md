# 🔧 Messagerie - Résolution de Problèmes

**Date**: 28 octobre 2025  
**Version**: 1.0

---

## ❌ Erreur: "useAuth must be used within an AuthProvider"

### Symptôme
```
Error: useAuth must be used within an AuthProvider
src/hooks/use-auth.tsx (337:11) @ useAuth
```

### Cause
La page utilise le hook `useAuth` directement au lieu de `useRequireAuth`, qui est le hook approprié pour les pages du dashboard.

### Solution ✅
**Remplacer `useAuth` par `useRequireAuth`**

```typescript
// ❌ INCORRECT
import { useAuth } from '@/hooks/use-auth';

export default function MyPage() {
  const { user } = useAuth();
  // ...
}

// ✅ CORRECT
import { useRequireAuth } from '@/hooks/use-require-auth';

export default function MyPage() {
  const { user, loading } = useRequireAuth();
  
  if (loading) {
    return <MyPageSkeleton />;
  }
  
  if (!user) {
    return null; // Redirect handled by useRequireAuth
  }
  
  // ...
}
```

### Différences entre `useAuth` et `useRequireAuth`

| Hook | Usage | Redirection | Loading State |
|------|-------|-------------|---------------|
| `useAuth` | Composants généraux | ❌ Non | ✅ Oui |
| `useRequireAuth` | Pages dashboard | ✅ Oui (vers /login) | ✅ Oui |

---

## ❌ Erreur: Type ThreadStatus

### Symptôme
```
Impossible d'assigner le type '"active"' au type 'ThreadStatus | undefined'
```

### Cause
Utilisation d'une chaîne littérale au lieu de l'enum `ThreadStatus`.

### Solution ✅
```typescript
// ❌ INCORRECT
useUserThreads(userId, { status: 'active' });

// ✅ CORRECT
import { ThreadStatus } from '@/lib/types';
useUserThreads(userId, { status: ThreadStatus.active });
```

---

## ❌ Erreur: Type lastMessage

### Symptôme
```
Impossible d'assigner le type 'LastMessage | undefined' au type 'ReactNode'
```

### Cause
Le champ `lastMessage` peut être soit une chaîne, soit un objet `{ content, senderId, createdAt }`.

### Solution ✅
```typescript
// ❌ INCORRECT
<p>{thread.lastMessage}</p>

// ✅ CORRECT
<p>
  {typeof thread.lastMessage === 'string' 
    ? thread.lastMessage 
    : thread.lastMessage?.content || 'Pas de message'}
</p>
```

---

## ⚠️ Avertissement: Hook avec userId vide

### Symptôme
Le hook `useUserThreads` est appelé avec un userId vide (`''`).

### Problème
```typescript
// ⚠️ PROBLÈME POTENTIEL
useUserThreads(user?.uid || '', { status: ThreadStatus.active });
// Si user est null, userId = '' → Firestore query invalide
```

### Solution ✅
**Option A: Attendre que user soit chargé**
```typescript
const { user, loading } = useRequireAuth();

if (loading || !user) {
  return <Skeleton />;
}

// Maintenant user.uid est garanti
useUserThreads(user.uid, { status: ThreadStatus.active });
```

**Option B: Désactiver le hook si pas d'utilisateur**
```typescript
const { data: threads = [] } = useUserThreads(
  user?.uid || '', 
  { 
    status: ThreadStatus.active,
    enabled: !!user?.uid  // Désactiver si pas d'uid
  }
);
```

---

## 🔍 Debug: Page blanche sans erreur

### Symptôme
La page de debug s'affiche blanche sans message d'erreur.

### Vérifications
1. **Console navigateur** (F12)
   - Regarder l'onglet "Console"
   - Regarder l'onglet "Network" pour erreurs API

2. **Composants de chargement**
   - Vérifier que `DebugPageSkeleton` s'affiche pendant le chargement
   - Vérifier que `authLoading` devient `false`

3. **Données utilisateur**
   - Vérifier que `user` n'est pas `null`
   - Vérifier que `user.uid` existe

### Solution
Ajouter des logs de débogage :
```typescript
console.log('Debug Page - authLoading:', authLoading);
console.log('Debug Page - user:', user);
console.log('Debug Page - threads:', threads);
```

---

## 🚫 Erreur: Firebase not initialized

### Symptôme
```
Error: Firebase has not been initialized
```

### Cause
Firebase n'est pas configuré ou les variables d'environnement sont manquantes.

### Solution ✅
1. **Vérifier `.env.local`** :
   ```bash
   NEXT_PUBLIC_FIREBASE_API_KEY=...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
   NEXT_PUBLIC_FIREBASE_APP_ID=...
   ```

2. **Vérifier `src/lib/firebase.ts`** :
   ```typescript
   import { initializeApp, getApps } from 'firebase/app';
   
   const firebaseConfig = {
     apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
     // ...
   };
   
   // Initialiser seulement si pas déjà fait
   const app = getApps().length === 0 
     ? initializeApp(firebaseConfig) 
     : getApps()[0];
   
   export const db = getFirestore(app);
   ```

3. **Redémarrer le serveur de développement** :
   ```bash
   pnpm dev
   ```

---

## 🔐 Erreur: Firestore permission denied

### Symptôme
```
FirebaseError: Missing or insufficient permissions
```

### Cause
Les règles Firestore sont trop restrictives.

### Solution ✅
Mettre à jour `firestore.rules` :
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Threads
    match /threads/{threadId} {
      allow read: if request.auth != null && 
                  request.auth.uid in resource.data.participants;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null;
    }

    // Messages
    match /messages/{messageId} {
      allow read, create: if request.auth != null;
      allow update, delete: if request.auth != null && 
                            request.auth.uid == resource.data.senderId;
    }
  }
}
```

Déployer les règles :
```bash
firebase deploy --only firestore:rules
```

---

## 📊 Debug: Hook isLoading reste true

### Symptôme
Le hook `useUserThreads` reste en état `isLoading: true` indéfiniment.

### Causes possibles
1. **Firestore pas connecté** - Vérifier la console pour erreurs réseau
2. **Règles Firestore** - Permission denied bloque la requête
3. **userId invalide** - uid vide ou null
4. **Subscription bloquée** - onSnapshot ne se résout pas

### Solution de diagnostic
```typescript
const { data, isLoading, error } = useUserThreads(userId, { status });

// Ajouter des logs
useEffect(() => {
  console.log('useUserThreads state:', { 
    isLoading, 
    threadsCount: data?.length, 
    error 
  });
}, [isLoading, data, error]);

// Timeout de sécurité
useEffect(() => {
  const timeout = setTimeout(() => {
    if (isLoading) {
      console.error('Hook timeout: still loading after 10s');
    }
  }, 10000);
  
  return () => clearTimeout(timeout);
}, [isLoading]);
```

---

## 🛠️ Outils de Diagnostic

### Page de Debug
- **URL**: `/dashboard/messages/debug`
- **Accès**: Bouton "🐛 Debug" sur `/dashboard/messages`
- **Fonctionnalités**:
  - État du hook `useUserThreads`
  - Statistiques base de données
  - Création de threads de test

### Console Navigateur
```javascript
// Vérifier l'état de Firebase
import { getApps } from 'firebase/app';
console.log('Firebase apps:', getApps());

// Vérifier les threads
import { checkMessagingData } from '@/lib/test-data-messaging';
const stats = await checkMessagingData();
console.log('DB stats:', stats);

// Créer des threads de test
import { createMultipleTestThreads } from '@/lib/test-data-messaging';
await createMultipleTestThreads('YOUR_USER_ID');
```

---

## 📚 Références

- **Guide de Debug**: `MESSAGERIE_DEBUG_GUIDE.md`
- **Guide Rapide**: `MESSAGERIE_QUICK_DEBUG.md`
- **Documentation Technique**: `MESSAGERIE.md`

---

## 💡 Checklist de Résolution

Avant de signaler un problème, vérifier :

- [ ] Firebase est initialisé (variables d'environnement)
- [ ] Utilisateur est authentifié (`user` non null)
- [ ] Règles Firestore permettent la lecture
- [ ] Console navigateur ne montre pas d'erreurs
- [ ] Page de debug accessible et fonctionnelle
- [ ] Threads de test créés avec succès
- [ ] Hook `useRequireAuth` utilisé (pas `useAuth`)
- [ ] Enums TypeScript utilisés (`ThreadStatus.active` pas `'active'`)

---

**Dernière mise à jour**: 28 octobre 2025
