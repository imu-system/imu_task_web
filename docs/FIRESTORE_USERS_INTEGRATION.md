# 🔥 Intégration Firestore Users - Documentation

**Date:** 17 octobre 2025  
**Statut:** ✅ Complété  
**Auteur:** Système ImuTask

---

## 📋 Vue d'ensemble

Implémentation de la persistance des utilisateurs dans Firestore pour remplacer les rôles hardcodés par des données dynamiques de la base de données.

### 🎯 Objectifs atteints

- ✅ Collection `users` avec structure complète (uid, email, roles, profile, createdAt)
- ✅ Création automatique du document lors de l'inscription
- ✅ Récupération des données dans `onAuthStateChanged`
- ✅ Règles de sécurité Firestore pour protéger les données utilisateur
- ✅ Support de l'authentification Google avec création de document

---

## 🏗️ Architecture

### Structure de la collection `users`

```typescript
interface UserDocument {
    uid: string;                    // Firebase Auth UID
    email: string;                  // Email de l'utilisateur
    roles: UserRole[];              // ['client', 'provider', 'admin']
    profile: UserProfile;           // Informations de profil
    skills?: string[];              // Compétences (pour providers)
    availability?: boolean;         // Disponibilité (pour providers)
    createdAt: Timestamp;           // Date de création
    updatedAt: Timestamp;           // Dernière mise à jour
}

interface UserProfile {
    displayName?: string;           // Nom d'affichage
    photoUrl?: string;              // URL de l'avatar
    phoneNumber?: string;           // Numéro de téléphone
    bio?: string;                   // Biographie
    location?: string;              // Localisation
}
```

### Fonctions principales

#### 1. `createUserDocument(uid, email, displayName?)`

Crée un nouveau document utilisateur dans Firestore lors de l'inscription.

```typescript
const userData: UserDocument = {
    uid,
    email,
    roles: [UserRole.client],        // Rôle par défaut
    profile: {
        displayName: displayName || email.split('@')[0],
    },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
};
```

**Appelée par:**
- `signUp()` après création du compte Firebase Auth
- `signInWithGoogle()` si le document n'existe pas

#### 2. `getUserDocument(uid)`

Récupère le document utilisateur depuis Firestore.

```typescript
const userDoc = await getUserDocument(firebaseUser.uid);
// Returns: UserDocument | null
```

**Utilisée par:**
- `onAuthStateChanged()` pour charger les rôles et le profil
- `signInWithGoogle()` pour vérifier l'existence du document

#### 3. `updateUserDocument(uid, updates)`

Met à jour les données utilisateur dans Firestore.

```typescript
await updateUserDocument(uid, {
    profile: { bio: "Nouvelle bio" },
    skills: ["plomberie", "électricité"],
});
```

#### 4. `addUserRole(uid, role)`

Ajoute un rôle à un utilisateur (ex: upgrade vers provider).

```typescript
await addUserRole(uid, UserRole.provider);
```

---

## 🔄 Flux d'authentification

### 1️⃣ Inscription (Sign Up)

```
Utilisateur remplit le formulaire
       ↓
createUserWithEmailAndPassword()
       ↓
updateProfile(displayName)
       ↓
createUserDocument()  ← NOUVEAU
       ↓
Document créé dans Firestore
       ↓
onAuthStateChanged() déclenché
       ↓
getUserDocument()  ← NOUVEAU
       ↓
AppUser créé avec roles depuis Firestore
       ↓
Redirection vers dashboard
```

### 2️⃣ Connexion (Sign In)

```
Utilisateur se connecte
       ↓
signInWithEmailAndPassword()
       ↓
onAuthStateChanged() déclenché
       ↓
getUserDocument()  ← NOUVEAU
       ↓
AppUser créé avec roles depuis Firestore
       ↓
Redirection vers dashboard
```

### 3️⃣ Google OAuth

```
Utilisateur clique "Sign in with Google"
       ↓
signInWithPopup(GoogleAuthProvider)
       ↓
getUserDocument(uid)
       ↓
Document existe? NON → createUserDocument()  ← NOUVEAU
                 OUI → Continuer
       ↓
onAuthStateChanged() déclenché
       ↓
getUserDocument()
       ↓
AppUser créé avec roles depuis Firestore
       ↓
Redirection vers dashboard
```

---

## 🔐 Règles de sécurité Firestore

### Protection de la collection `users`

```javascript
match /users/{userId} {
  // Lecture: tous les utilisateurs authentifiés
  allow read: if isAuthenticated();
  
  // Création: seulement son propre document
  allow create: if isAuthenticated() && isOwner(userId);
  
  // Mise à jour: seulement son propre document
  // SAUF les roles (protection contre l'auto-élévation)
  allow update: if isAuthenticated() && isOwner(userId) && 
                   (!request.resource.data.diff(resource.data).affectedKeys().hasAny(['roles']));
  
  // Suppression: interdite (soft delete uniquement)
  allow delete: if false;
}
```

### Sécurité des rôles

⚠️ **IMPORTANT:** Les utilisateurs **ne peuvent pas** modifier leurs propres rôles.

- Les rôles sont assignés par défaut (`UserRole.client`) lors de l'inscription
- Seul un admin peut ajouter/modifier les rôles via Cloud Functions (à implémenter)
- La règle Firestore empêche la modification du champ `roles` par l'utilisateur

**Exemple de tentative malveillante:**

```javascript
// ❌ Cette tentative sera rejetée par Firestore Rules
await updateUserDocument(myUid, {
    roles: [UserRole.client, UserRole.admin], // REFUSÉ
});
```

---

## 📝 Modifications de code

### 1. `/src/lib/firestore-users.ts`

**Ajouté:**
- Interface `UserDocument` avec structure complète
- Interface `UserProfile` pour les données de profil
- `createUserDocument()` - Création de document Firestore
- `getUserDocument()` - Récupération de document
- `updateUserDocument()` - Mise à jour de document
- `addUserRole()` - Ajout de rôle

**Imports requis:**
```typescript
import { setDoc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { UserRole } from './types';
```

### 2. `/src/contexts/AuthContext.tsx`

**Modifié:**
- Import de `createUserDocument` et `getUserDocument`
- `signUp()`: Appel de `createUserDocument()` après création du compte
- `signInWithGoogle()`: Vérification et création du document si nécessaire
- `onAuthStateChanged()`: Récupération des données Firestore au lieu des valeurs hardcodées

**Avant:**
```typescript
const appUser: AppUser = {
    ...firebaseUser,
    roles: [UserRole.client], // ❌ Hardcodé
    profile: { ... },
};
```

**Après:**
```typescript
const userDoc = await getUserDocument(firebaseUser.uid);
const appUser: AppUser = {
    ...firebaseUser,
    roles: userDoc.roles, // ✅ Depuis Firestore
    profile: {
        displayName: userDoc.profile.displayName || ...,
        photoUrl: userDoc.profile.photoUrl || ...,
    },
};
```

### 3. `/firestore.rules`

**Ajouté:**
- Protection contre la modification des rôles par l'utilisateur
- Règle empêchant la modification du champ `roles`

---

## 🧪 Tests

### Test manuel du flux complet

1. **Inscription d'un nouvel utilisateur**
   ```
   ✅ Document créé dans Firestore `users/{uid}`
   ✅ roles = ['client']
   ✅ profile.displayName défini
   ✅ createdAt et updatedAt définis
   ```

2. **Connexion d'un utilisateur existant**
   ```
   ✅ getUserDocument() récupère les données
   ✅ AppUser contient les roles depuis Firestore
   ✅ Dashboard affiche les bonnes permissions
   ```

3. **Google OAuth (nouveau compte)**
   ```
   ✅ Document créé automatiquement
   ✅ Données Google (nom, photo) synchronisées
   ✅ Rôle par défaut assigné
   ```

4. **Google OAuth (compte existant)**
   ```
   ✅ Document existant récupéré
   ✅ Pas de duplication
   ✅ Données à jour
   ```

### Vérification dans la console Firestore

Naviguer vers: `Firebase Console > Firestore Database > users`

Structure attendue:
```
users/
  └── {uid}/
      ├── uid: "abc123..."
      ├── email: "user@example.com"
      ├── roles: ["client"]
      ├── profile:
      │   └── displayName: "John Doe"
      ├── createdAt: Timestamp
      └── updatedAt: Timestamp
```

---

## 🚀 Prochaines étapes

### 1. Upgrade vers Provider

Créer une page/formulaire pour permettre aux clients de devenir prestataires:

```typescript
// À implémenter dans /src/app/[locale]/dashboard/become-provider/page.tsx
const handleBecomeProvider = async () => {
    await addUserRole(user.uid, UserRole.provider);
    // Ajouter skills, availability, etc.
};
```

### 2. Admin Panel

Créer un panel admin pour gérer les rôles:

```typescript
// Cloud Function pour admin uniquement
export const assignRole = onCall(async (request) => {
    // Vérifier que l'appelant est admin
    const callerDoc = await getUserDocument(request.auth.uid);
    if (!callerDoc.roles.includes(UserRole.admin)) {
        throw new Error('Unauthorized');
    }
    
    // Assigner le rôle
    await addUserRole(targetUid, role);
});
```

### 3. KYC Integration

Lier le processus KYC au rôle provider:

```typescript
// Après validation KYC
if (kycStatus === 'approved') {
    await addUserRole(uid, UserRole.provider);
    await updateUserDocument(uid, {
        kycVerified: true,
        kycVerifiedAt: serverTimestamp(),
    });
}
```

### 4. Skills & Availability

Étendre le profil provider:

```typescript
await updateUserDocument(uid, {
    skills: ['plomberie', 'électricité', 'jardinage'],
    availability: true,
    hourlyRate: 25,
    location: { city: 'Paris', region: 'Île-de-France' },
});
```

---

## 📊 Métriques & Monitoring

### Logs à surveiller

```typescript
✅ User document created: {uid}
✅ User loaded from Firestore with roles: ['client']
⚠️ User document missing, creating with defaults
❌ Error creating user document: {error}
❌ Error getting user document: {error}
```

### Firebase Console

- **Firestore > users:** Vérifier la croissance de la collection
- **Authentication:** Comparer le nombre d'utilisateurs Auth vs Firestore
- **Rules:** Vérifier les rejets de requêtes (indicateur de tentatives malveillantes)

---

## 🐛 Troubleshooting

### Problème: "User document missing"

**Cause:** Document Firestore non créé lors de l'inscription

**Solution:** 
- Vérifier que `createUserDocument()` est bien appelée dans `signUp()`
- Vérifier les permissions Firestore Rules
- Vérifier la connexion Firebase

### Problème: Rôles non chargés

**Cause:** `getUserDocument()` retourne `null`

**Solution:**
- Vérifier que le document existe dans Firestore
- Vérifier la structure du document (champ `roles` présent)
- Vérifier les logs du navigateur

### Problème: "Permission denied"

**Cause:** Firestore Rules bloquent l'opération

**Solution:**
- Vérifier que l'utilisateur est authentifié
- Vérifier que le userId correspond à auth.uid
- Vérifier que la tentative n'est pas de modifier `roles`

---

## ✅ Checklist de déploiement

- [x] Collection `users` définie avec types TypeScript
- [x] `createUserDocument()` implémentée
- [x] `getUserDocument()` implémentée
- [x] `updateUserDocument()` implémentée
- [x] `addUserRole()` implémentée
- [x] `signUp()` crée le document Firestore
- [x] `signInWithGoogle()` gère la création du document
- [x] `onAuthStateChanged()` charge les données Firestore
- [x] Firestore Rules protègent la collection
- [x] Firestore Rules empêchent la modification des rôles
- [ ] Tests unitaires pour les fonctions Firestore
- [ ] Tests E2E pour le flux d'authentification complet
- [ ] Documentation utilisateur pour "Devenir prestataire"
- [ ] Cloud Functions pour l'administration des rôles
- [ ] Monitoring et alertes configurés

---

## 📚 Références

- [Firebase Auth Documentation](https://firebase.google.com/docs/auth)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [TypeScript avec Firestore](https://firebase.google.com/docs/firestore/query-data/get-data#typescript)

---

**✅ Intégration Firestore Users complétée le 17 octobre 2025**
