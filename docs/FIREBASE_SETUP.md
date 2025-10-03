# 🔥 Guide de Configuration Firebase - ImuTask Web

**Version:** 1.0  
**Dernière mise à jour:** 3 octobre 2025  
**Statut:** 🔴 Non configuré

---

## 📋 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Prérequis](#prérequis)
3. [Configuration initiale](#configuration-initiale)
4. [Firebase Authentication](#firebase-authentication)
5. [Cloud Firestore](#cloud-firestore)
6. [Firebase Storage](#firebase-storage)
7. [Cloud Functions](#cloud-functions-optionnel)
8. [Règles de sécurité](#règles-de-sécurité)
9. [Variables d'environnement](#variables-denvironnement)
10. [Émulateurs locaux](#émulateurs-locaux)
11. [Déploiement](#déploiement)
12. [Checklist de configuration](#checklist-de-configuration)

---

## 🎯 Vue d'ensemble

ImuTask nécessite Firebase pour:
- **Authentication:** Connexion utilisateur (email/password, Google OAuth)
- **Firestore:** Base de données NoSQL pour les tâches, profils, messages, etc.
- **Storage:** Stockage des avatars, images de tâches, documents
- **App Hosting:** Hébergement de l'application Next.js
- **Cloud Functions:** (Optionnel) Logique backend, notifications, paiements

---

## ✅ Prérequis

- [ ] Compte Google/Firebase
- [ ] Node.js 20+ installé
- [ ] Firebase CLI installé globalement
- [ ] Accès au projet Firebase (ou création d'un nouveau)

### Installation Firebase CLI

```bash
npm install -g firebase-tools
firebase login
```

---

## 🚀 Configuration initiale

### Étape 1: Créer ou sélectionner un projet Firebase

**Option A: Créer un nouveau projet**

1. Aller sur [Firebase Console](https://console.firebase.google.com/)
2. Cliquer sur "Ajouter un projet"
3. Nom du projet: `imutask-web` (ou autre)
4. Activer Google Analytics (recommandé)
5. Créer le projet

**Option B: Utiliser un projet existant**

```bash
firebase use <project-id>
```

### Étape 2: Initialiser Firebase dans le projet

```bash
cd /Users/nathanimogo/Documents/GitHub/imu_task_web
firebase init
```

Sélectionner:
- [x] Firestore
- [x] Functions (optionnel)
- [x] Hosting (si non configuré avec App Hosting)
- [x] Storage
- [x] Emulators

### Étape 3: Créer la configuration Firebase

Créer le fichier `/src/lib/firebase.ts`:

```typescript
// src/lib/firebase.ts
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase (singleton pattern)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
```

---

## 🔐 Firebase Authentication

### Configuration dans la Console

1. Aller dans **Authentication** > **Sign-in method**
2. Activer les fournisseurs:
   - ✅ Email/Password
   - ✅ Google OAuth

### Configuration Google OAuth

1. Cliquer sur Google
2. Activer le fournisseur
3. Configurer l'email de support du projet
4. Ajouter les domaines autorisés:
   - `localhost` (dev)
   - Votre domaine de production

### Créer le contexte d'authentification

Créer `/src/contexts/AuthContext.tsx`:

```typescript
// src/contexts/AuthContext.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signUp = async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
```

### Intégrer dans le layout

Modifier `/src/app/[locale]/layout.tsx`:

```typescript
import { AuthProvider } from '@/contexts/AuthContext';

export default async function LocaleLayout({ children, params }: Props) {
  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AuthProvider>
            {/* Reste du contenu */}
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

---

## 🗄️ Cloud Firestore

### Structure de la base de données

```
imutask (database)
├── users/
│   └── {userId}
│       ├── email: string
│       ├── displayName: string
│       ├── role: "client" | "provider"
│       ├── avatarUrl: string | null
│       ├── phone: string | null
│       ├── bio: string | null
│       ├── skills: string[] (pour providers)
│       ├── availability: boolean (pour providers)
│       ├── rating: number
│       ├── completedTasks: number
│       ├── createdAt: timestamp
│       └── updatedAt: timestamp
│
├── tasks/
│   └── {taskId}
│       ├── title: string
│       ├── description: string
│       ├── category: string
│       ├── location: {
│       │   ├── address: string
│       │   ├── city: string
│       │   ├── coordinates: GeoPoint
│       │   }
│       ├── budget: number
│       ├── status: "open" | "in_progress" | "completed" | "cancelled"
│       ├── clientId: string (ref to users)
│       ├── providerId: string | null (ref to users)
│       ├── images: string[]
│       ├── deadline: timestamp | null
│       ├── createdAt: timestamp
│       └── updatedAt: timestamp
│
├── proposals/
│   └── {proposalId}
│       ├── taskId: string (ref to tasks)
│       ├── providerId: string (ref to users)
│       ├── amount: number
│       ├── message: string
│       ├── estimatedDuration: string
│       ├── status: "pending" | "accepted" | "rejected"
│       ├── createdAt: timestamp
│       └── updatedAt: timestamp
│
├── bookings/
│   └── {bookingId}
│       ├── taskId: string (ref to tasks)
│       ├── clientId: string (ref to users)
│       ├── providerId: string (ref to users)
│       ├── proposalId: string (ref to proposals)
│       ├── scheduledDate: timestamp
│       ├── status: "confirmed" | "in_progress" | "completed" | "cancelled"
│       ├── createdAt: timestamp
│       └── completedAt: timestamp | null
│
├── conversations/
│   └── {conversationId}
│       ├── participants: string[] (refs to users)
│       ├── lastMessage: {
│       │   ├── text: string
│       │   ├── senderId: string
│       │   ├── timestamp: timestamp
│       │   }
│       └── updatedAt: timestamp
│
├── messages/
│   └── {conversationId}/
│       └── messages/
│           └── {messageId}
│               ├── senderId: string
│               ├── text: string
│               ├── imageUrl: string | null
│               ├── read: boolean
│               ├── createdAt: timestamp
│
├── reviews/
│   └── {reviewId}
│       ├── taskId: string
│       ├── bookingId: string
│       ├── reviewerId: string (ref to users)
│       ├── revieweeId: string (ref to users)
│       ├── rating: number (1-5)
│       ├── comment: string
│       ├── createdAt: timestamp
│
└── transactions/
    └── {transactionId}
        ├── type: "payment" | "refund" | "withdrawal"
        ├── amount: number
        ├── fromUserId: string
        ├── toUserId: string
        ├── taskId: string | null
        ├── status: "pending" | "completed" | "failed"
        ├── stripePaymentIntentId: string | null
        ├── createdAt: timestamp
        └── completedAt: timestamp | null
```

### Créer les index composites

Dans la Firebase Console, aller dans **Firestore** > **Indexes**:

1. **Tasks par statut et date:**
   - Collection: `tasks`
   - Champs: `status` (Ascending), `createdAt` (Descending)

2. **Tasks par client:**
   - Collection: `tasks`
   - Champs: `clientId` (Ascending), `createdAt` (Descending)

3. **Proposals par tâche:**
   - Collection: `proposals`
   - Champs: `taskId` (Ascending), `createdAt` (Descending)

4. **Messages par conversation:**
   - Collection group: `messages`
   - Champs: `createdAt` (Ascending)

---

## 📦 Firebase Storage

### Structure des dossiers

```
storage/
├── avatars/
│   └── {userId}/
│       └── avatar.jpg
│
├── tasks/
│   └── {taskId}/
│       ├── image_1.jpg
│       ├── image_2.jpg
│       └── image_3.jpg
│
└── chat/
    └── {conversationId}/
        └── {messageId}/
            └── file.pdf
```

### Helper pour upload d'images

Créer `/src/lib/storage.ts`:

```typescript
// src/lib/storage.ts
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const storageRef = ref(storage, `avatars/${userId}/avatar.jpg`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

export async function uploadTaskImage(
  taskId: string,
  file: File,
  index: number
): Promise<string> {
  const ext = file.name.split('.').pop();
  const storageRef = ref(storage, `tasks/${taskId}/image_${index}.${ext}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

export async function uploadChatFile(
  conversationId: string,
  messageId: string,
  file: File
): Promise<string> {
  const ext = file.name.split('.').pop();
  const storageRef = ref(
    storage,
    `chat/${conversationId}/${messageId}/${file.name}`
  );
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}
```

---

## ⚡ Cloud Functions (Optionnel)

### Créer le dossier functions

```bash
firebase init functions
# Choisir TypeScript
```

### Exemples de fonctions utiles

**1. Créer un profil utilisateur lors de l'inscription:**

```typescript
// functions/src/index.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

export const createUserProfile = functions.auth.user().onCreate(async (user) => {
  const { uid, email, displayName, photoURL } = user;

  await admin.firestore().collection('users').doc(uid).set({
    email,
    displayName: displayName || null,
    avatarUrl: photoURL || null,
    role: 'client', // Par défaut
    rating: 0,
    completedTasks: 0,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
});
```

**2. Notifier les prestataires de nouvelles tâches:**

```typescript
export const notifyProvidersNewTask = functions.firestore
  .document('tasks/{taskId}')
  .onCreate(async (snap, context) => {
    const task = snap.data();
    
    // Logique pour trouver les prestataires matchants
    // Envoyer des notifications
    
    return null;
  });
```

**3. Calculer la note moyenne d'un prestataire:**

```typescript
export const updateProviderRating = functions.firestore
  .document('reviews/{reviewId}')
  .onCreate(async (snap, context) => {
    const review = snap.data();
    const providerId = review.revieweeId;

    const reviewsSnapshot = await admin
      .firestore()
      .collection('reviews')
      .where('revieweeId', '==', providerId)
      .get();

    const totalRating = reviewsSnapshot.docs.reduce(
      (sum, doc) => sum + doc.data().rating,
      0
    );
    const averageRating = totalRating / reviewsSnapshot.size;

    await admin.firestore().collection('users').doc(providerId).update({
      rating: averageRating,
    });
  });
```

---

## 🔒 Règles de sécurité

### Firestore Security Rules

Créer/modifier `firestore.rules`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && isOwner(userId);
      allow update: if isAuthenticated() && isOwner(userId);
      allow delete: if false; // Soft delete only
    }
    
    // Tasks collection
    match /tasks/{taskId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && 
                       request.resource.data.clientId == request.auth.uid;
      allow update: if isAuthenticated() && (
        resource.data.clientId == request.auth.uid ||
        resource.data.providerId == request.auth.uid
      );
      allow delete: if isAuthenticated() && 
                       resource.data.clientId == request.auth.uid;
    }
    
    // Proposals collection
    match /proposals/{proposalId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && 
                       request.resource.data.providerId == request.auth.uid;
      allow update: if isAuthenticated() && (
        resource.data.providerId == request.auth.uid ||
        get(/databases/$(database)/documents/tasks/$(resource.data.taskId)).data.clientId == request.auth.uid
      );
      allow delete: if isAuthenticated() && 
                       resource.data.providerId == request.auth.uid;
    }
    
    // Bookings collection
    match /bookings/{bookingId} {
      allow read: if isAuthenticated() && (
        resource.data.clientId == request.auth.uid ||
        resource.data.providerId == request.auth.uid
      );
      allow create: if isAuthenticated();
      allow update: if isAuthenticated() && (
        resource.data.clientId == request.auth.uid ||
        resource.data.providerId == request.auth.uid
      );
      allow delete: if false;
    }
    
    // Conversations
    match /conversations/{conversationId} {
      allow read, write: if isAuthenticated() && 
        request.auth.uid in resource.data.participants;
    }
    
    // Messages (subcollection)
    match /conversations/{conversationId}/messages/{messageId} {
      allow read: if isAuthenticated() && 
        request.auth.uid in get(/databases/$(database)/documents/conversations/$(conversationId)).data.participants;
      allow create: if isAuthenticated() && 
        request.auth.uid in get(/databases/$(database)/documents/conversations/$(conversationId)).data.participants;
      allow update, delete: if false;
    }
    
    // Reviews
    match /reviews/{reviewId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && 
                       request.resource.data.reviewerId == request.auth.uid;
      allow update, delete: if false;
    }
    
    // Transactions
    match /transactions/{transactionId} {
      allow read: if isAuthenticated() && (
        resource.data.fromUserId == request.auth.uid ||
        resource.data.toUserId == request.auth.uid
      );
      allow write: if false; // Only server-side
    }
  }
}
```

Déployer les règles:

```bash
firebase deploy --only firestore:rules
```

### Storage Security Rules

Créer/modifier `storage.rules`:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // Avatars
    match /avatars/{userId}/{fileName} {
      allow read: if true; // Public read
      allow write: if request.auth != null && 
                      request.auth.uid == userId &&
                      request.resource.size < 5 * 1024 * 1024 && // 5MB max
                      request.resource.contentType.matches('image/.*');
    }
    
    // Task images
    match /tasks/{taskId}/{fileName} {
      allow read: if true; // Public read
      allow write: if request.auth != null &&
                      request.resource.size < 10 * 1024 * 1024 && // 10MB max
                      request.resource.contentType.matches('image/.*');
    }
    
    // Chat files
    match /chat/{conversationId}/{messageId}/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
                      request.resource.size < 20 * 1024 * 1024; // 20MB max
    }
  }
}
```

Déployer les règles:

```bash
firebase deploy --only storage:rules
```

---

## 🌍 Variables d'environnement

### Créer `.env.local`

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Genkit AI
GOOGLE_GENAI_API_KEY=your_gemini_api_key

# Stripe (pour Phase 6)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:9002
```

### Créer `.env.example` (pour Git)

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=

# Genkit AI
GOOGLE_GENAI_API_KEY=

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:9002
```

### Ajouter à `.gitignore`

```
.env*.local
.env.production
```

---

## 🧪 Émulateurs locaux

### Configuration

Créer/modifier `firebase.json`:

```json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "storage": {
    "rules": "storage.rules"
  },
  "emulators": {
    "auth": {
      "port": 9099
    },
    "firestore": {
      "port": 8080
    },
    "storage": {
      "port": 9199
    },
    "ui": {
      "enabled": true,
      "port": 4000
    }
  }
}
```

### Modifier `.idx/dev.nix`

```nix
services.firebase.emulators = {
  detect = true; # ACTIVER les émulateurs
  projectId = "imutask-demo";
  services = ["auth" "firestore" "storage"];
};
```

### Variables d'environnement pour les émulateurs

Créer `.env.development.local`:

```env
# Use emulators in development
NEXT_PUBLIC_USE_FIREBASE_EMULATORS=true
NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
NEXT_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_HOST=localhost:8080
NEXT_PUBLIC_FIREBASE_STORAGE_EMULATOR_HOST=localhost:9199
```

### Modifier `firebase.ts` pour supporter les émulateurs

```typescript
// src/lib/firebase.ts
import { connectAuthEmulator } from 'firebase/auth';
import { connectFirestoreEmulator } from 'firebase/firestore';
import { connectStorageEmulator } from 'firebase/storage';

// ... (code existant)

// Connect to emulators in development
if (
  process.env.NODE_ENV === 'development' &&
  process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === 'true'
) {
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectStorageEmulator(storage, 'localhost', 9199);
}
```

### Lancer les émulateurs

```bash
firebase emulators:start
```

Interface UI disponible sur: `http://localhost:4000`

---

## 🚀 Déploiement

### Déployer les règles et index

```bash
firebase deploy --only firestore:rules,firestore:indexes,storage:rules
```

### Déployer les Functions (si utilisées)

```bash
firebase deploy --only functions
```

### Déployer l'application (Firebase App Hosting)

```bash
# Via Firebase CLI
firebase deploy --only hosting

# Ou via Git (si configuré avec App Hosting)
git push origin main
```

---

## ✅ Checklist de configuration

### Configuration initiale
- [ ] Projet Firebase créé
- [ ] Firebase CLI installé et connecté
- [ ] `firebase init` exécuté
- [ ] Fichier `.env.local` créé avec les bonnes valeurs
- [ ] Fichier `.env.example` créé pour Git

### Authentication
- [ ] Email/Password activé dans la console
- [ ] Google OAuth configuré
- [ ] Domaines autorisés ajoutés
- [ ] `AuthContext` créé et intégré
- [ ] Pages login/signup connectées

### Firestore
- [ ] Collections créées manuellement ou via code
- [ ] Index composites configurés
- [ ] Règles de sécurité déployées
- [ ] Helpers de requêtes créés (`/src/lib/firestore-helpers.ts`)

### Storage
- [ ] Règles de sécurité déployées
- [ ] Helpers d'upload créés
- [ ] Limite de taille testée

### Émulateurs
- [ ] `firebase.json` configuré
- [ ] Émulateurs activés dans `.idx/dev.nix`
- [ ] Variables d'environnement pour émulateurs
- [ ] Test de connexion aux émulateurs

### Cloud Functions (optionnel)
- [ ] Functions initialisées
- [ ] Function de création de profil
- [ ] Functions de notifications
- [ ] Déployées en production

### Tests
- [ ] Connexion/déconnexion fonctionne
- [ ] Création de tâche sauvegarde en Firestore
- [ ] Upload d'avatar fonctionne
- [ ] Messages en temps réel fonctionnent
- [ ] Règles de sécurité testées

---

## 📚 Ressources

- [Documentation Firebase](https://firebase.google.com/docs)
- [Firebase avec Next.js](https://firebase.google.com/docs/hosting/frameworks/nextjs)
- [Firestore Data Modeling](https://firebase.google.com/docs/firestore/manage-data/structure-data)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [Firebase Emulators](https://firebase.google.com/docs/emulator-suite)

---

## 🆘 Problèmes courants

### Erreur: "Firebase not initialized"
**Solution:** Vérifier que les variables d'environnement sont bien chargées.

### Erreur: "Permission denied" sur Firestore
**Solution:** Vérifier les règles de sécurité et que l'utilisateur est authentifié.

### Émulateurs ne démarrent pas
**Solution:** Vérifier que les ports ne sont pas déjà utilisés. Tuer les processus si nécessaire.

### OAuth Google ne fonctionne pas
**Solution:** Vérifier que le domaine est bien autorisé dans la console Firebase.

---

**Dernière révision:** 3 octobre 2025  
**Prochaine révision:** Après configuration complète
