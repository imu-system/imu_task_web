# Cloud Functions Admin - Gestion des Rôles Utilisateurs

## 📋 Résumé

Implémentation complète du système d'administration des rôles utilisateurs via Cloud Functions Firebase v2, avec interface admin React intégrée au dashboard.

## ✅ Composants Créés

### 1. **Cloud Functions Backend** (`/functions/src/admin/user-roles.ts`)

Trois fonctions Cloud Functions sécurisées pour la gestion des rôles :

#### `assignUserRole(targetUid, role)`
- **Fonction** : Assigner un rôle à un utilisateur
- **Sécurité** : Admin uniquement
- **Validation** :
  - Vérification authentification (request.auth)
  - Validation du rôle (client, provider, admin)
  - Vérification que l'utilisateur cible existe
  - Détecte si le rôle existe déjà (évite doublons)
- **Audit** : Logs dans `admin_logs` collection
  ```typescript
  {
    action: 'assign_role',
    performedBy: callerId,
    targetUser: targetUid,
    role: role,
    timestamp: new Date()
  }
  ```

#### `removeUserRole(targetUid, role)`
- **Fonction** : Retirer un rôle d'un utilisateur
- **Sécurité** : Admin uniquement
- **Protection spéciale** : Empêche un admin de retirer son propre rôle admin
  ```typescript
  if (callerId === targetUid && role === UserRole.admin) {
    throw new HttpsError('permission-denied', 'Cannot remove your own admin role');
  }
  ```
- **Audit** : Logs dans `admin_logs` collection

#### `listUsersWithRoles(limit, startAfter)`
- **Fonction** : Liste paginée des utilisateurs avec leurs rôles
- **Sécurité** : Admin uniquement
- **Pagination** :
  - Limite par défaut : 50 utilisateurs
  - Tri par `createdAt` décroissant
  - Support de `startAfter` pour la pagination
- **Retour** :
  ```typescript
  {
    success: true,
    users: [
      { uid, email, roles, profile, createdAt },
      ...
    ],
    hasMore: boolean
  }
  ```

### 2. **Types Partagés** (`/functions/src/types/user.ts`)

Définition des types pour les Cloud Functions (séparés de `src/lib/types.ts`) :

```typescript
export enum UserRole {
    client = 'client',
    provider = 'provider',
    admin = 'admin',
}

export interface UserProfile {
    displayName?: string;
    bio?: string;
    phone?: string;
    location?: string;
    hourlyRate?: number;
    skills?: string[];
    availability?: boolean;
}

export interface User {
    uid: string;
    email: string;
    roles: UserRole[];
    profile: UserProfile;
    createdAt: Date;
    updatedAt: Date;
}
```

### 3. **Interface Admin React** (`/src/components/admin/user-roles-panel.tsx`)

Composant React complet pour la gestion des rôles depuis le dashboard admin :

**Fonctionnalités** :
- Formulaire d'attribution/retrait de rôle
  - Sélection d'action (assign/remove)
  - Sélection de rôle (client/provider/admin)
  - Champ UID utilisateur cible
- Liste des utilisateurs avec leurs rôles
  - Affichage du nom, email, UID
  - Badges de rôles colorés
  - Bouton d'actualisation
- Gestion des états
  - Loading states avec spinners
  - Alertes d'erreur (destructive)
  - Alertes de succès (green)
- Sécurité : Vérification du rôle admin côté client

**Utilisation des Cloud Functions** :
```typescript
const assignRoleFn = httpsCallable(functions, 'assignUserRole');
await assignRoleFn({ targetUid, role });

const removeRoleFn = httpsCallable(functions, 'removeUserRole');
await removeRoleFn({ targetUid, role });

const listUsersFn = httpsCallable(functions, 'listUsersWithRoles');
const result = await listUsersFn({ limit: 50 });
```

### 4. **Intégration Dashboard** (`/src/app/[locale]/dashboard/admin/page.tsx`)

Le composant `AdminUserRolesPanel` a été intégré dans la page admin existante :

```tsx
import { AdminUserRolesPanel } from "@/components/admin/user-roles-panel";

// ... dans le return
<AdminUserRolesPanel />
```

## 🔧 Architecture de Sécurité

### Vérification Multi-niveaux

1. **Authentification Firebase** : `if (!request.auth)`
2. **Vérification Admin** : Lecture du document utilisateur et check du rôle
3. **Validation Paramètres** : Vérification de tous les paramètres requis
4. **Protection Auto-suppression** : Empêche de retirer son propre admin

### Gestion des Erreurs

Utilisation de `HttpsError` avec codes appropriés :
- `unauthenticated` : Non authentifié
- `invalid-argument` : Paramètres invalides ou manquants
- `permission-denied` : Pas les permissions requises
- `not-found` : Utilisateur cible introuvable
- `internal` : Erreurs serveur

### Audit Trail

Toutes les opérations admin sont loggées dans `admin_logs` :
```typescript
{
  action: 'assign_role' | 'remove_role',
  performedBy: string, // UID de l'admin
  targetUser: string,  // UID de l'utilisateur cible
  role: UserRole,
  timestamp: Date
}
```

## 📦 Déploiement

### Prérequis

⚠️ **Le projet Firebase doit être sur le plan Blaze (pay-as-you-go)**

Les Cloud Functions v2 nécessitent l'API Artifact Registry qui n'est disponible que sur le plan Blaze.

### Commande de Déploiement

```bash
firebase deploy --only functions:assignUserRole,removeUserRole,listUsersWithRoles
```

### Étapes Post-Déploiement

1. **Vérifier le déploiement** dans Firebase Console > Functions
2. **Tester assignUserRole** avec un compte admin
   ```typescript
   const result = await assignUserRole({ 
     targetUid: 'test-user-uid', 
     role: 'provider' 
   });
   ```
3. **Vérifier les audit logs** dans Firestore > admin_logs
4. **Tester l'interface admin** à `/dashboard/admin`

## 🧪 Tests Recommandés

### Tests Backend (Cloud Functions)

```typescript
// Test 1: Non-admin ne peut pas assigner de rôle
expect(() => assignUserRole({ targetUid, role }))
  .toThrow('permission-denied');

// Test 2: Admin peut assigner un rôle
const result = await assignUserRole({ targetUid, role: 'provider' });
expect(result.success).toBe(true);

// Test 3: Ne peut pas retirer son propre rôle admin
expect(() => removeUserRole({ targetUid: ownUid, role: 'admin' }))
  .toThrow('Cannot remove your own admin role');

// Test 4: Audit log créé après opération
const logs = await db.collection('admin_logs')
  .where('performedBy', '==', adminUid)
  .get();
expect(logs.docs.length).toBeGreaterThan(0);
```

### Tests Frontend (Interface Admin)

```typescript
// Test 1: Formulaire d'attribution
await page.selectOption('select[name="action"]', 'assign');
await page.selectOption('select[name="role"]', 'provider');
await page.fill('input#targetUid', 'test-uid-123');
await page.click('button[type="submit"]');
await expect(page.locator('.alert-success')).toBeVisible();

// Test 2: Liste des utilisateurs chargée
await expect(page.locator('[data-testid="user-list"]')).toBeVisible();
await expect(page.locator('.badge:has-text("admin")')).toBeVisible();

// Test 3: Non-admin redirigé
// Se connecter avec compte non-admin
await page.goto('/dashboard/admin');
await expect(page.locator('text=Accès refusé')).toBeVisible();
```

## 📊 Utilisation dans le Code

### Assigner un rôle (Frontend)

```typescript
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';

const assignUserRole = httpsCallable(functions, 'assignUserRole');

try {
  const result = await assignUserRole({
    targetUid: 'user-uid-here',
    role: 'provider',
  });
  console.log(result.data); // { success: true, message: '...' }
} catch (error) {
  console.error(error.code); // 'permission-denied', etc.
  console.error(error.message);
}
```

### Lister les utilisateurs avec pagination

```typescript
const listUsersWithRoles = httpsCallable(functions, 'listUsersWithRoles');

let lastUser = null;

// Première page
const page1 = await listUsersWithRoles({ limit: 50 });
console.log(page1.data.users); // 50 utilisateurs
console.log(page1.data.hasMore); // true si plus de résultats

// Page suivante
if (page1.data.hasMore) {
  lastUser = page1.data.users[page1.data.users.length - 1];
  const page2 = await listUsersWithRoles({
    limit: 50,
    startAfter: lastUser.uid
  });
}
```

## 🔐 Bonnes Pratiques de Sécurité

1. **Ne jamais exposer les UIDs publiquement** : Utiliser l'interface admin uniquement
2. **Logs d'audit obligatoires** : Toutes les opérations admin sont tracées
3. **Protection admin** : Impossible de retirer son propre rôle admin
4. **Validation stricte** : Tous les paramètres sont validés avant exécution
5. **Gestion d'erreurs** : Messages d'erreur clairs sans exposer d'infos sensibles

## 📈 Prochaines Étapes

1. ✅ **Upgrade Firebase vers plan Blaze** pour activer Cloud Functions v2
2. ✅ **Déployer les fonctions** avec la commande fournie
3. ⏳ **Tester en production** avec un compte admin réel
4. ⏳ **Créer un premier admin** via Firebase Console (ajouter manuellement le rôle dans Firestore)
5. ⏳ **Configurer le monitoring** (Firebase Analytics + Performance)
6. ⏳ **Ajouter des alertes** pour les opérations admin sensibles

## 🚀 Status

- ✅ **Code Backend** : Complet et prêt au déploiement
- ✅ **Code Frontend** : Interface admin complète
- ✅ **Intégration Dashboard** : Composant ajouté à la page admin
- ✅ **Types Partagés** : Types définis pour Cloud Functions
- ⏳ **Déploiement** : En attente d'upgrade vers plan Blaze
- ⏳ **Tests Production** : En attente de déploiement
- ⏳ **Monitoring** : À configurer après déploiement

## 📝 Notes Importantes

- Les Cloud Functions v2 utilisent `onCall` au lieu de `https.onCall` (v1)
- Les imports doivent utiliser `firebase-admin/firestore` (modular SDK)
- Les types sont dupliqués dans `/functions/src/types/` car les Cloud Functions ne peuvent pas importer depuis `/src/lib/`
- L'audit trail utilise `new Date()` au lieu de `admin.firestore.FieldValue.serverTimestamp()` pour compatibilité avec les logs

---

**Auteur** : GitHub Copilot  
**Date** : Janvier 2025  
**Version** : 1.0.0
