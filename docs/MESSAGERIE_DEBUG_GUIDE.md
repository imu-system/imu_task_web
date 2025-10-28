# Guide de Diagnostic - Messagerie

**Date**: 27 octobre 2025  
**Phase**: Debug État de Chargement  
**Auteur**: GitHub Copilot

---

## 🐛 Problème Identifié

### Symptôme
L'utilisateur voit "Chargement des conversations..." en permanence sur la page Messages, alors que tous les composants sont implémentés sans erreur TypeScript.

### Screenshot Utilisateur
- Page affiche un état de chargement persistant
- Texte "Chargement des conversations..." visible
- Aucun contenu n'apparaît

---

## 🔍 Analyse

### Code Vérifié ✅

**ThreadList Component** (`src/components/messaging/thread-list.tsx`):
```tsx
const {
  data: threads = [],
  isLoading,
  error,
} = useUserThreads(userId, {
  status: (activeTab === 'active' ? 'active' : 'archived') as ThreadStatus,
});

// Rendu conditionnel (lignes 147-158)
{isLoading || isSearching ? (
  <ThreadListSkeleton />  // ← C'est ce qui s'affiche actuellement
) : sortedThreads.length === 0 ? (
  <EmptyState
    searchQuery={searchQuery}
    activeTab={activeTab}
  />
) : (
  <div className="divide-y">
    {/* Liste des threads */}
  </div>
)}
```

### Diagnostic Probable

**Hypothèse #1: Base de données vide** ⭐ (Le plus probable)
- Aucun thread n'existe dans Firestore
- Le hook `useUserThreads` se charge correctement mais retourne un tableau vide
- L'état `isLoading` passe à `false` mais `threads.length === 0`
- **Solution**: Créer des threads de test

**Hypothèse #2: Hook ne se résout jamais**
- `isLoading` reste bloqué à `true`
- Problème de connexion Firestore
- Permissions insuffisantes
- **Solution**: Vérifier les règles Firestore et la connexion

**Hypothèse #3: Erreur silencieuse**
- Une erreur survient mais n'est pas affichée
- `error` existe mais le composant ne le gère pas correctement
- **Solution**: Vérifier la console navigateur

---

## 🛠️ Solutions Implémentées

### 1. Page de Debug (`/dashboard/messages/debug`)

**Fichier créé**: `src/app/[locale]/dashboard/messages/debug/page.tsx`

**Fonctionnalités**:
- ✅ Affiche l'état du hook `useUserThreads` en temps réel
- ✅ Affiche `isLoading`, nombre de threads, erreurs
- ✅ Statistiques de la base de données (threads, messages)
- ✅ Bouton pour créer 1 thread de test
- ✅ Bouton pour créer 4 threads de test
- ✅ Informations utilisateur actuel

**Accès**:
- Navigation: `/dashboard/messages/debug`
- Bouton "🐛 Debug" ajouté sur la page Messages (développement uniquement)

### 2. Utilitaires de Test (`src/lib/test-data-messaging.ts`)

**Fonctions créées**:

```typescript
// Créer un thread de test entre deux utilisateurs
await createTestThread(userId1, userId2, {
  taskId?: string,
  bookingId?: string,
  withMessages?: boolean
});

// Créer 4 threads de test avec différents utilisateurs
await createMultipleTestThreads(userId);

// Vérifier l'état de la base de données
const stats = await checkMessagingData();
// Retourne: { threadsCount: number, messagesCount: number }
```

**Utilisation**:
1. Via la page de debug (interface graphique)
2. Ou directement dans la console navigateur

---

## 📋 Procédure de Diagnostic

### Étape 1: Accéder à la page de Debug

1. Ouvrir l'application en mode développement
2. Se connecter avec un compte utilisateur
3. Naviguer vers `/dashboard/messages`
4. Cliquer sur le bouton "🐛 Debug" (en haut à droite)

### Étape 2: Analyser l'état du hook

**Vérifier**:
- `isLoading`: Doit être `false` après chargement
- `Threads chargés`: Nombre de threads retournés
- `Erreur`: Doit être "Aucune"

**Cas possibles**:

| isLoading | Threads | Erreur | Diagnostic |
|-----------|---------|--------|------------|
| `true` | 0 | Non | Hook en cours de chargement (normal <2s) |
| `true` | 0 | Non | ⚠️ Hook bloqué (>5s = problème Firestore) |
| `false` | 0 | Non | ✅ Base de données vide (créer des threads) |
| `false` | >0 | Non | ✅ Tout fonctionne (vérifier pourquoi page vide) |
| - | - | Oui | ❌ Erreur Firestore (vérifier règles/permissions) |

### Étape 3: Vérifier les statistiques DB

**Statistiques affichées**:
- Nombre total de threads dans Firestore
- Nombre total de messages dans Firestore

**Si tous à 0**: Base de données vide → Créer des threads de test

### Étape 4: Créer des threads de test

**Option A: Thread unique**
1. Cliquer sur "Créer 1 thread de test"
2. Attendre le message de succès
3. Retourner sur `/dashboard/messages`
4. Vérifier que le thread apparaît

**Option B: Threads multiples**
1. Cliquer sur "Créer 4 threads de test"
2. Attendre ~2-3 secondes (délais entre créations)
3. Retourner sur `/dashboard/messages`
4. Vérifier que 4 threads apparaissent avec avatars colorés

### Étape 5: Vérifier la page Messages

Après création de threads:
- La page doit afficher la liste des threads
- Chaque thread doit avoir:
  - Avatar avec initiales
  - Nom de l'utilisateur
  - Dernier message
  - Timestamp
- Cliquer sur un thread doit ouvrir la conversation

---

## 🔧 Corrections Possibles

### Si `isLoading` reste `true` indéfiniment

**Problème**: Firestore subscription ne se connecte pas

**Solutions**:
1. Vérifier les règles Firestore:
   ```javascript
   // firestore.rules
   match /threads/{threadId} {
     allow read: if request.auth != null && 
                 request.auth.uid in resource.data.participants;
     allow write: if request.auth != null;
   }
   ```

2. Vérifier la configuration Firebase (`src/lib/firebase.ts`)
3. Vérifier la console navigateur pour erreurs réseau

### Si erreur de permissions

**Problème**: Règles Firestore trop restrictives

**Solution**: Mettre à jour `firestore.rules`:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Threads: lecture si participant, écriture si authentifié
    match /threads/{threadId} {
      allow read: if request.auth != null && 
                  request.auth.uid in resource.data.participants;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
                            request.auth.uid in resource.data.participants;
    }

    // Messages: lecture si participant du thread, écriture si authentifié
    match /messages/{messageId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
                            request.auth.uid == resource.data.senderId;
    }
  }
}
```

### Si threads créés mais non visibles

**Problème**: Problème de synchronisation temps réel

**Solutions**:
1. Rafraîchir la page (`Cmd+R` / `Ctrl+R`)
2. Vérifier que `subscribeToUserThreads` est bien appelé dans le hook
3. Vérifier la console pour erreurs React Query

---

## 📊 Métriques de Succès

Après application des solutions, vérifier:

- ✅ `isLoading` passe à `false` en <2 secondes
- ✅ Threads apparaissent dans la liste
- ✅ Cliquer sur un thread ouvre la conversation
- ✅ Messages s'affichent correctement
- ✅ Pas d'erreurs dans la console navigateur
- ✅ Temps de réponse <500ms pour affichage liste
- ✅ Mise à jour en temps réel fonctionne

---

## 🚀 Prochaines Étapes

Une fois le diagnostic et les corrections appliqués:

1. **Supprimer les threads de test** (si nécessaire)
   - Via la console Firebase
   - Ou implémenter une fonction de nettoyage

2. **Créer de vrais threads**
   - Via l'interface utilisateur normale
   - En sélectionnant des tâches existantes
   - En créant des conversations avec de vrais utilisateurs

3. **Continuer avec Phase 4: Tests E2E**
   - Implémenter les tests Playwright
   - Automatiser la création de données de test
   - Vérifier tous les scénarios utilisateur

4. **Désactiver/Retirer la page de debug en production**
   - Garder uniquement en environnement de développement
   - Ou protéger par un rôle admin

---

## 📝 Notes Techniques

### Structure des threads de test

```typescript
{
  participants: [userId1, userId2],
  participantsData: {
    [userId1]: { id, name, email, photoUrl },
    [userId2]: { id, name, email, photoUrl }
  },
  status: 'active',
  unreadCount: { [userId1]: 0, [userId2]: 0 },
  typingUsers: [],
  lastMessage: "Bonjour ! Comment allez-vous ?",
  lastMessageAt: serverTimestamp(),
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp()
}
```

### Messages de test inclus

Si `withMessages: true`:
1. "Bonjour ! Comment allez-vous ?"
2. "Très bien, merci ! Et vous ?"
3. "Parfait ! Je voulais discuter du projet..."

---

## ⚠️ Avertissements

1. **Ne pas utiliser en production**: La page de debug est pour le développement uniquement
2. **Threads de test**: Utiliser des IDs préfixés par `test-` pour faciliter le nettoyage
3. **Limites Firestore**: Créer trop de threads peut impacter les quotas gratuits
4. **Règles de sécurité**: Toujours vérifier les règles avant de déployer en production

---

## 📚 Références

- Documentation Firestore: https://firebase.google.com/docs/firestore
- React Query: https://tanstack.com/query/latest
- Code source:
  - Hook: `src/hooks/use-messaging.ts`
  - Component: `src/components/messaging/thread-list.tsx`
  - Page: `src/app/[locale]/dashboard/messages/page.tsx`
  - Debug: `src/app/[locale]/dashboard/messages/debug/page.tsx`
  - Utils: `src/lib/test-data-messaging.ts`
