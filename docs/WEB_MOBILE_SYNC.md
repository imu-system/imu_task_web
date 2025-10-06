# 🔄 Synchronisation Web-Mobile - ImuTask

**Dernière mise à jour:** 3 octobre 2025  
**Versions:**
- Web: v0.1.0 (Next.js 15)
- Mobile: [À déterminer] (localisation: `/Users/nathanimogo/Documents/GitHub/imu_task_mobile`)

---

## 📋 Vue d'ensemble

Ce document détaille la stratégie de synchronisation entre la version web et la version mobile d'ImuTask pour assurer une expérience cohérente sur toutes les plateformes.

---

## 🎯 Objectifs de synchronisation

1. **Données unifiées:** Une seule source de vérité (Firebase Firestore)
2. **Authentification partagée:** Même compte utilisable sur web et mobile
3. **Expérience cohérente:** Design et fonctionnalités similaires
4. **Temps réel:** Synchronisation instantanée des données entre plateformes
5. **Offline-first:** Support hors ligne sur les deux plateformes

---

## 🗄️ Architecture partagée

### Backend commun: Firebase

```
Firebase Project: imutask-production
├── Authentication (partagé)
│   ├── Email/Password
│   └── Google OAuth
│
├── Firestore (partagé)
│   ├── users/
│   ├── tasks/
│   ├── proposals/
│   ├── bookings/
│   ├── messages/
│   ├── reviews/
│   └── transactions/
│
├── Storage (partagé)
│   ├── avatars/
│   ├── tasks/
│   └── chat/
│
├── Cloud Functions (backend logique)
│   ├── createUserProfile
│   ├── notifyProvidersNewTask
│   ├── processPayment
│   └── sendNotifications
│
└── Cloud Messaging (notifications push)
    ├── Web Push
    └── Mobile Push (FCM)
```

---

## 📊 Schéma de base de données unifié

### Collection: `users`

**Champs communs web/mobile:**

```typescript
interface User {
  id: string;
  email: string;
  displayName: string;
  role: 'client' | 'provider';
  avatarUrl: string | null;
  phone: string | null;
  bio: string | null;
  
  // Spécifique aux prestataires
  skills?: string[];
  availability?: boolean;
  hourlyRate?: number;
  
  // Métadonnées
  rating: number;
  completedTasks: number;
  totalEarnings?: number; // Pour providers
  totalSpent?: number; // Pour clients
  
  // Préférences
  language: 'en' | 'fr' | 'de' | 'es' | 'ja';
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  
  // Géolocalisation
  location?: {
    city: string;
    country: string;
    coordinates: GeoPoint;
  };
  
  // Métadonnées système
  deviceTokens: string[]; // Pour push notifications
  lastActiveAt: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  
  // Flags
  isVerified: boolean;
  isActive: boolean;
  isBanned: boolean;
}
```

### Collection: `tasks`

**Champs communs web/mobile:**

```typescript
interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  
  // Localisation
  location: {
    address: string;
    city: string;
    country: string;
    coordinates: GeoPoint;
  };
  
  // Budget
  budget: number;
  currency: 'USD' | 'EUR' | 'GBP'; // À étendre
  budgetType: 'fixed' | 'hourly';
  
  // Statut
  status: 'open' | 'in_progress' | 'completed' | 'cancelled' | 'disputed';
  
  // Relations
  clientId: string; // Ref to users
  providerId: string | null; // Ref to users
  
  // Media
  images: string[];
  
  // Dates
  deadline: Timestamp | null;
  scheduledDate: Timestamp | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  completedAt: Timestamp | null;
  
  // Statistiques
  viewCount: number;
  proposalCount: number;
}
```

### Collection: `proposals`

```typescript
interface Proposal {
  id: string;
  taskId: string;
  providerId: string;
  amount: number;
  message: string;
  estimatedDuration: string; // "2 hours", "3 days", etc.
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Collection: `conversations` & sous-collection `messages`

```typescript
interface Conversation {
  id: string;
  participants: string[]; // Array of user IDs
  lastMessage: {
    text: string;
    senderId: string;
    timestamp: Timestamp;
  };
  unreadCount: {
    [userId: string]: number;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  imageUrl?: string;
  fileUrl?: string;
  read: boolean;
  createdAt: Timestamp;
  
  // Pour les réactions futures
  reactions?: {
    [emoji: string]: string[]; // User IDs
  };
}
```

---

## 🔐 Authentification unifiée

### Flux d'authentification

1. **Création de compte:**
   - Web ou Mobile: Inscription via email/password ou Google
   - Cloud Function: `createUserProfile` crée automatiquement le document dans Firestore
   - Token JWT Firebase valable sur les deux plateformes

2. **Connexion:**
   - Authentification Firebase retourne le même token
   - Token stocké différemment:
     - Web: Cookie sécurisé ou localStorage
     - Mobile: Stockage sécurisé natif (Keychain iOS, Keystore Android)

3. **Synchronisation des sessions:**
   - Le champ `deviceTokens` dans le profil utilisateur stocke les tokens FCM pour push notifications
   - `lastActiveAt` mis à jour à chaque activité

### Code partagé (concept)

**Web (`/src/lib/firebase.ts`):**
```typescript
import { auth } from './firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

export async function signIn(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}
```

**Mobile (Flutter/React Native - équivalent):**
```dart
// Flutter example
import 'package:firebase_auth/firebase_auth.dart';

Future<UserCredential> signIn(String email, String password) {
  return FirebaseAuth.instance.signInWithEmailAndPassword(
    email: email,
    password: password,
  );
}
```

---

## 🔄 Synchronisation des données en temps réel

### Utilisation de Firestore Snapshots

**Web (React):**
```typescript
import { onSnapshot, collection, query, where } from 'firebase/firestore';

function useUserTasks(userId: string) {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, 'tasks'),
      where('clientId', '==', userId)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Task[];
      setTasks(tasksData);
    });

    return unsubscribe;
  }, [userId]);

  return tasks;
}
```

**Mobile (Flutter - équivalent):**
```dart
Stream<List<Task>> getUserTasks(String userId) {
  return FirebaseFirestore.instance
    .collection('tasks')
    .where('clientId', isEqualTo: userId)
    .snapshots()
    .map((snapshot) => snapshot.docs.map((doc) => 
      Task.fromFirestore(doc)
    ).toList());
}
```

---

## 📱 Notifications Push cross-platform

### Configuration Firebase Cloud Messaging

**1. Web Push (Service Worker):**

Créer `/public/firebase-messaging-sw.js`:
```javascript
importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "...",
  projectId: "...",
  messagingSenderId: "...",
  appId: "..."
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icons/icon-192x192.png'
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});
```

**2. Mobile Push:**
- iOS: Configuration APNs
- Android: Configuration FCM (déjà inclus avec Firebase)

**3. Cloud Function pour envoyer les notifications:**

```typescript
// functions/src/notifications.ts
import * as admin from 'firebase-admin';

export async function sendNewTaskNotification(task: Task) {
  // Trouver les prestataires matchants
  const providersSnapshot = await admin.firestore()
    .collection('users')
    .where('role', '==', 'provider')
    .where('availability', '==', true)
    .get();

  const tokens: string[] = [];
  providersSnapshot.forEach(doc => {
    const provider = doc.data();
    if (provider.deviceTokens) {
      tokens.push(...provider.deviceTokens);
    }
  });

  if (tokens.length > 0) {
    const message = {
      notification: {
        title: 'New Task Available!',
        body: task.title,
      },
      data: {
        taskId: task.id,
        type: 'new_task',
      },
      tokens,
    };

    await admin.messaging().sendEachForMulticast(message);
  }
}
```

---

## 🎨 Cohérence du Design

### Design Tokens partagés

**Créer un fichier de tokens partagé:**

`design-tokens.json` (à synchroniser entre web et mobile):
```json
{
  "colors": {
    "primary": {
      "hsl": "210, 60%, 50%",
      "rgb": "51, 153, 255",
      "hex": "#3399FF"
    },
    "background": {
      "hsl": "210, 20%, 98%",
      "rgb": "245, 247, 249",
      "hex": "#F5F7F9"
    },
    "accent": {
      "hsl": "180, 50%, 40%",
      "rgb": "51, 179, 179",
      "hex": "#33B3B3"
    }
  },
  "typography": {
    "fontFamily": "Inter",
    "fontSize": {
      "xs": 12,
      "sm": 14,
      "base": 16,
      "lg": 18,
      "xl": 20,
      "2xl": 24,
      "3xl": 30,
      "4xl": 36
    }
  },
  "spacing": {
    "xs": 4,
    "sm": 8,
    "md": 16,
    "lg": 24,
    "xl": 32,
    "2xl": 48
  },
  "borderRadius": {
    "sm": 4,
    "md": 8,
    "lg": 12,
    "full": 9999
  }
}
```

**Web (Tailwind):**
```javascript
// tailwind.config.ts
import tokens from './design-tokens.json';

export default {
  theme: {
    extend: {
      colors: {
        primary: tokens.colors.primary.hex,
        background: tokens.colors.background.hex,
        accent: tokens.colors.accent.hex,
      },
      spacing: tokens.spacing,
      borderRadius: tokens.borderRadius,
    }
  }
}
```

**Mobile (Flutter):**
```dart
// lib/theme/app_theme.dart
class AppColors {
  static const primary = Color(0xFF3399FF);
  static const background = Color(0xFFF5F7F9);
  static const accent = Color(0xFF33B3B3);
}

class AppSpacing {
  static const xs = 4.0;
  static const sm = 8.0;
  static const md = 16.0;
  static const lg = 24.0;
  static const xl = 32.0;
}
```

---

## 🔧 Cloud Functions partagées

### Logique métier centralisée

**Fonction: Calculer la distance entre utilisateur et tâche**

```typescript
// functions/src/utils/distance.ts
import * as admin from 'firebase-admin';

export function calculateDistance(
  point1: admin.firestore.GeoPoint,
  point2: admin.firestore.GeoPoint
): number {
  const R = 6371; // Rayon de la Terre en km
  const dLat = toRadians(point2.latitude - point1.latitude);
  const dLon = toRadians(point2.longitude - point1.longitude);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(point1.latitude)) *
    Math.cos(toRadians(point2.latitude)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}
```

**Fonction: Matcher les prestataires pour une tâche**

```typescript
// functions/src/matching.ts
export async function matchProvidersForTask(taskId: string) {
  const taskDoc = await admin.firestore().collection('tasks').doc(taskId).get();
  const task = taskDoc.data() as Task;

  const providersSnapshot = await admin.firestore()
    .collection('users')
    .where('role', '==', 'provider')
    .where('availability', '==', true)
    .get();

  const matches: Array<{providerId: string, score: number}> = [];

  providersSnapshot.forEach(doc => {
    const provider = doc.data();
    let score = 0;

    // Compétences correspondantes
    const matchingSkills = provider.skills?.filter((skill: string) =>
      task.category.toLowerCase().includes(skill.toLowerCase())
    );
    score += (matchingSkills?.length || 0) * 10;

    // Proximité géographique
    if (provider.location && task.location.coordinates) {
      const distance = calculateDistance(
        provider.location.coordinates,
        task.location.coordinates
      );
      if (distance < 10) score += 20; // Moins de 10km
      else if (distance < 50) score += 10; // Moins de 50km
    }

    // Note élevée
    score += provider.rating * 2;

    if (score > 0) {
      matches.push({ providerId: doc.id, score });
    }
  });

  // Trier par score
  matches.sort((a, b) => b.score - a.score);

  return matches.slice(0, 10); // Top 10
}
```

---

## 📦 API REST commune (optionnel)

Si besoin de logique complexe non supportée directement par Firestore:

### Créer des endpoints Cloud Functions

```typescript
// functions/src/api.ts
import * as functions from 'firebase-functions';
import * as express from 'express';
import * as cors from 'cors';

const app = express();
app.use(cors({ origin: true }));

// GET /api/tasks/nearby
app.get('/tasks/nearby', async (req, res) => {
  const { lat, lng, radius = 50 } = req.query;
  
  // Logique de recherche géospatiale
  // ...
  
  res.json({ tasks: [] });
});

// POST /api/proposals
app.post('/proposals', async (req, res) => {
  const { taskId, providerId, amount, message } = req.body;
  
  // Validation et création
  // ...
  
  res.json({ success: true, proposalId: 'xxx' });
});

export const api = functions.https.onRequest(app);
```

**Utilisation:**
- Web: `fetch('https://us-central1-imutask.cloudfunctions.net/api/tasks/nearby?lat=...&lng=...')`
- Mobile: Même URL avec HTTP client natif

---

## 🧪 Tests cross-platform

### Tests d'intégration partagés

**Scénarios à tester sur web ET mobile:**

1. **Authentification:**
   - [ ] Inscription email/password
   - [ ] Connexion email/password
   - [ ] Connexion Google OAuth
   - [ ] Déconnexion
   - [ ] Réinitialisation mot de passe

2. **Tâches:**
   - [ ] Créer une tâche
   - [ ] Voir la liste des tâches
   - [ ] Filtrer les tâches
   - [ ] Voir les détails d'une tâche
   - [ ] Modifier une tâche
   - [ ] Supprimer une tâche

3. **Propositions:**
   - [ ] Soumettre une proposition
   - [ ] Voir ses propositions
   - [ ] Accepter/refuser une proposition

4. **Messagerie:**
   - [ ] Envoyer un message
   - [ ] Recevoir un message en temps réel
   - [ ] Upload d'image dans le chat

5. **Profil:**
   - [ ] Modifier son profil
   - [ ] Upload d'avatar
   - [ ] Ajouter/retirer des compétences

### Outils de test

- **Web:** Jest, React Testing Library, Playwright
- **Mobile:** Flutter Test, Integration Tests
- **Backend:** Firebase Emulators

---

## 📅 Roadmap de synchronisation

### Phase 1: Fondations (Semaines 1-2)
- [x] Définir le schéma de base de données commun
- [ ] Configurer Firebase pour les deux plateformes
- [ ] Synchroniser les design tokens
- [ ] Créer les Cloud Functions de base

### Phase 2: Authentification (Semaines 3-4)
- [ ] Implémenter l'auth sur web
- [ ] Implémenter l'auth sur mobile
- [ ] Tester la connexion cross-platform
- [ ] Implémenter Google OAuth sur les deux

### Phase 3: Fonctionnalités core (Semaines 5-8)
- [ ] Tâches (création, liste, détails)
- [ ] Propositions
- [ ] Messagerie temps réel
- [ ] Profils utilisateurs

### Phase 4: Fonctionnalités avancées (Semaines 9-12)
- [ ] Notifications push
- [ ] Paiements Stripe
- [ ] Géolocalisation et maps
- [ ] Système d'avis

### Phase 5: Optimisation (Semaines 13-14)
- [ ] Tests cross-platform complets
- [ ] Optimisation performance
- [ ] Support offline
- [ ] Documentation finale

---

## ✅ Checklist de synchronisation

### Configuration
- [ ] Projet Firebase créé et partagé
- [ ] Web configuré avec Firebase SDK
- [ ] Mobile configuré avec Firebase SDK
- [ ] Même schéma Firestore documenté
- [ ] Cloud Functions déployées
- [ ] Règles de sécurité identiques

### Authentification
- [ ] Email/Password fonctionne sur web et mobile
- [ ] Google OAuth fonctionne sur web et mobile
- [ ] Tokens synchronisés pour notifications

### Données
- [ ] Collections Firestore créées
- [ ] Index composites configurés
- [ ] Règles de sécurité testées
- [ ] Synchronisation temps réel validée

### Notifications
- [ ] Web Push configuré
- [ ] Mobile Push configuré (iOS + Android)
- [ ] Cloud Function d'envoi créée
- [ ] Tests de notifications effectués

### Design
- [ ] Design tokens définis
- [ ] Appliqués sur web
- [ ] Appliqués sur mobile
- [ ] UI cohérente validée

---

## 📝 Conventions de développement

### Nommage

- **Collections Firestore:** Pluriel, snake_case → `users`, `tasks`, `proposals`
- **Champs:** camelCase → `displayName`, `createdAt`, `isActive`
- **Fonctions Cloud:** camelCase → `createUserProfile`, `sendNotification`
- **Endpoints API:** kebab-case → `/api/tasks-nearby`, `/api/user-profile`

### Commits Git

Format:
```
[web|mobile|shared] Type: Description

Ex:
[web] feat: Add task creation form
[mobile] fix: Fix login button padding
[shared] docs: Update database schema
```

### Branches

- `main` - Production
- `develop` - Développement
- `feature/web-*` - Features web
- `feature/mobile-*` - Features mobile
- `feature/shared-*` - Features partagées (backend)

---

## 🤝 Communication équipe

### Réunions de synchronisation

**Fréquence:** Bi-hebdomadaire (tous les mardis et vendredis)

**Ordre du jour:**
1. Revue des tâches terminées
2. Blocages et problèmes
3. Décisions sur le schéma de données
4. Planification des prochaines tâches
5. Démo des nouvelles fonctionnalités

### Outils de collaboration

- **Documentation:** Ce repo `/docs`
- **Gestion des tâches:** GitHub Projects ou Trello
- **Communication:** Slack/Discord
- **Partage de design:** Figma

---

## 📚 Ressources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Data Modeling Best Practices](https://firebase.google.com/docs/firestore/manage-data/structure-data)
- [Firebase Multi-Platform Guide](https://firebase.google.com/docs/guides)
- [Design Tokens](https://www.designtokens.org/)

---

**Dernière révision:** 3 octobre 2025  
**Prochaine réunion de synchro:** À planifier  
**Contact:** [Votre email/Slack]
