# 🐛 Debug Messagerie - Instructions Rapides

## Problème: "Chargement des conversations..." ne disparaît pas

### Cause la plus probable
Votre base de données Firestore est vide - aucun thread n'a encore été créé.

---

## ✅ Solution Rapide (2 minutes)

### Étape 1: Accéder à la page de debug
1. Assurez-vous d'être connecté à l'application
2. Allez sur `/dashboard/messages`
3. Cliquez sur le bouton **"🐛 Debug"** (en haut à droite)

### Étape 2: Créer des threads de test
1. Sur la page de debug, cliquez sur **"Créer 4 threads de test"**
2. Attendez le message de succès (~3 secondes)
3. Cliquez sur le bouton "Retour" ou naviguez vers `/dashboard/messages`

### Étape 3: Vérifier
Vous devriez maintenant voir:
- ✅ 4 conversations dans la liste
- ✅ Avatar avec initiales colorées
- ✅ Nom de l'utilisateur (Alice, Bob, Clara, David)
- ✅ Dernier message affiché
- ✅ Timestamp

---

## 🔍 Si le problème persiste

### Vérifier l'état du système
Sur la page de debug (`/dashboard/messages/debug`), vérifiez:

**Section "Hook useUserThreads"**:
- `isLoading` doit être **false** (✓ vert)
- `Threads chargés` doit être **> 0**
- `Erreur` doit être **"Aucune"**

**Section "État de la base de données"**:
- `Threads` doit être **> 0**
- `Messages` doit être **> 0**

### Si `isLoading` reste `true` indéfiniment

**Problème**: Firestore ne se connecte pas

**Solutions**:
1. Vérifiez votre connexion internet
2. Vérifiez que Firebase est bien configuré dans `.env.local`
3. Regardez la console navigateur (F12) pour des erreurs
4. Vérifiez les règles Firestore (voir ci-dessous)

### Si vous voyez une erreur

**Problème**: Permissions Firestore

**Solution**: Mettez à jour `firestore.rules`:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /threads/{threadId} {
      allow read: if request.auth != null && 
                  request.auth.uid in resource.data.participants;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null;
    }

    match /messages/{messageId} {
      allow read, create: if request.auth != null;
      allow update, delete: if request.auth != null && 
                            request.auth.uid == resource.data.senderId;
    }
  }
}
```

Déployez les règles:
```bash
firebase deploy --only firestore:rules
```

---

## 📚 Documentation Complète

Pour un guide de diagnostic approfondi, consultez:
- **`docs/MESSAGERIE_DEBUG_GUIDE.md`** - Guide complet de diagnostic
- **`docs/MESSAGERIE.md`** - Documentation technique complète

---

## 🎯 Résultat Attendu

Après avoir créé des threads de test, votre page Messages devrait ressembler à ceci:

```
┌─────────────────────────────────────────┐
│ ← Messages                    🐛 Debug  │
├─────────────────────────────────────────┤
│ 🔍 Rechercher...                        │
│ [Active ●4] [Archived]                  │
├─────────────────────────────────────────┤
│ AM  Alice Martin              12:34    │
│     Parfait ! Je voulais...   ●         │
├─────────────────────────────────────────┤
│ BD  Bob Dupont                12:33    │
│     Très bien, merci ! Et...  ●         │
├─────────────────────────────────────────┤
│ CB  Clara Bernard             12:32    │
│     Parfait ! Je voulais...   ●         │
├─────────────────────────────────────────┤
│ DP  David Petit               12:31    │
│     Très bien, merci ! Et...  ●         │
└─────────────────────────────────────────┘
```

Cliquer sur une conversation ouvrira l'interface de chat complète avec:
- Header WhatsApp-style (gradient vert)
- Messages avec bulles colorées
- Input avec emoji picker
- Fonctionnalités temps réel

---

## ⚡ Commandes de Console (Alternative)

Si vous préférez utiliser la console navigateur:

```javascript
// Ouvrir la console (F12)

// Importer les utilitaires
import { createTestThread, createMultipleTestThreads } from '@/lib/test-data-messaging';

// Obtenir votre userId (depuis le contexte auth)
// Remplacez 'YOUR_USER_ID' par votre vrai ID
const userId = 'YOUR_USER_ID';

// Créer 4 threads de test
await createMultipleTestThreads(userId);

// Ou créer un seul thread
await createTestThread(userId, 'test-user-1', { withMessages: true });
```

---

## 🗑️ Nettoyage (après les tests)

Pour supprimer les threads de test après validation:

1. Allez dans la **Console Firebase** (https://console.firebase.google.com)
2. Sélectionnez votre projet
3. Menu **Firestore Database**
4. Collection `threads`
5. Supprimez manuellement les threads de test (participants contiennent `test-user-`)

Ou attendez l'implémentation de la fonction de nettoyage automatique (à venir).

---

## 🚀 Prochaines Étapes

Une fois que tout fonctionne:
1. ✅ Validez l'interface utilisateur
2. ✅ Testez l'envoi de messages
3. ✅ Testez les filtres (Active/Archived)
4. ✅ Testez la recherche
5. ➡️ Continuez avec **Phase 4: Tests E2E** (Playwright)

---

## 💡 Besoin d'Aide ?

Si vous rencontrez d'autres problèmes:
1. Consultez `MESSAGERIE_DEBUG_GUIDE.md` (diagnostic complet)
2. Vérifiez la console navigateur pour les erreurs
3. Vérifiez que Firebase est correctement configuré
4. Assurez-vous d'être authentifié avec un compte valide
