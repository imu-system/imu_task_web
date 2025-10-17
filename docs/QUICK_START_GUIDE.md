# 🚀 Guide de Démarrage Rapide - ImuTask

**Dernière mise à jour** : 17 octobre 2025  
**Pour** : Nouveaux développeurs rejoignant le projet

---

## 📋 Vue d'Ensemble du Projet

**ImuTask** est une plateforme de mise en relation pour **micro-services de proximité** :

- 🎓 **Prestataires** : Jeunes (étudiants, auto-entrepreneurs) proposant leurs services
- 👥 **Clients** : Particuliers ayant besoin d'aide ponctuelle (courses, montage meubles, aide numérique...)
- 🏪 **Business model** : Commission 15-20% sur chaque transaction

**Stack technique** :
- **Frontend** : Next.js 15.3.3, React, TypeScript, Tailwind CSS
- **Backend** : Firebase (Auth, Firestore, Storage, Cloud Functions)
- **Tests** : Jest (unit), Playwright (E2E)
- **Déploiement** : Firebase Hosting + Cloud Functions

---

## 🛠️ Installation Initiale

### Prérequis

```bash
# Node.js 18+ requis
node --version  # Doit afficher v18.x ou supérieur

# pnpm (package manager)
npm install -g pnpm

# Firebase CLI
npm install -g firebase-tools
```

### Clone & Setup

```bash
# 1. Cloner le repo
git clone https://github.com/imu-system/imu_task_web.git
cd imu_task_web

# 2. Installer les dépendances
pnpm install

# 3. Installer les dépendances Cloud Functions
cd functions
pnpm install
cd ..

# 4. Copier le fichier d'environnement
cp .env.example .env.local

# 5. Configurer les variables Firebase dans .env.local
# (Demander les credentials à l'équipe)
```

### Configuration Firebase

```bash
# Login Firebase
firebase login

# Sélectionner le projet
firebase use imutask

# Lancer les émulateurs (optionnel pour dev local)
firebase emulators:start
```

---

## 🚀 Lancement du Projet

### Mode Développement

```bash
# Terminal 1 : Next.js dev server
pnpm dev
# Accessible sur http://localhost:9002

# Terminal 2 : Firebase Emulators (optionnel)
firebase emulators:start
# Firestore UI: http://localhost:4000
```

### Tests

```bash
# Tests unitaires (Jest)
pnpm test

# Tests unitaires en watch mode
pnpm test:watch

# Tests E2E (Playwright)
npx playwright test

# Tests E2E avec UI
npx playwright test --ui
```

---

## 📁 Structure du Projet

```
imu_task_web/
├── src/
│   ├── app/                    # Pages Next.js (App Router)
│   │   ├── [locale]/          # Routes internationalisées
│   │   │   ├── dashboard/     # Pages dashboard (client/provider/admin)
│   │   │   ├── sign-in/       # Connexion
│   │   │   ├── sign-up/       # Inscription
│   │   │   └── page.tsx       # Landing page
│   │   └── globals.css        # Styles globaux
│   │
│   ├── components/            # Composants React réutilisables
│   │   ├── ui/               # Composants UI de base (shadcn/ui)
│   │   ├── admin/            # Composants admin (KYC panel, User roles...)
│   │   └── ...
│   │
│   ├── contexts/             # Contextes React (Auth, Theme...)
│   │   └── AuthContext.tsx   # Gestion authentification
│   │
│   ├── lib/                  # Utilitaires et configurations
│   │   ├── firebase.ts       # Configuration Firebase client
│   │   ├── types.ts          # Types TypeScript partagés
│   │   ├── firestore/        # Fonctions Firestore
│   │   └── __tests__/        # Tests unitaires
│   │
│   └── i18n/                 # Internationalisation (fr/en)
│
├── functions/                # Cloud Functions Firebase
│   ├── src/
│   │   ├── admin/           # Fonctions admin (roles)
│   │   ├── kyc/             # Fonctions KYC (validation)
│   │   ├── notifications/   # Fonctions notifications
│   │   ├── types/           # Types partagés
│   │   └── index.ts         # Point d'entrée
│   └── package.json
│
├── e2e/                     # Tests End-to-End (Playwright)
│   └── auth-flow.spec.ts
│
├── docs/                    # Documentation projet
│   ├── KYC_INTEGRATION_COMPLETED.md
│   ├── SERVICES_CATALOG.md
│   ├── IMUPRO_VISION.md
│   └── ...
│
├── public/                  # Assets statiques
├── firebase.json            # Config Firebase
├── firestore.rules          # Règles de sécurité Firestore
├── storage.rules            # Règles de sécurité Storage
└── package.json
```

---

## 🔑 Concepts Clés

### 1. Système de Rôles

```typescript
enum UserRole {
  user = "user",         // Utilisateur par défaut
  provider = "provider", // Prestataire (après validation KYC)
  admin = "admin",       // Administrateur
}
```

**Flux** :
1. Inscription → Rôle `user`
2. Soumission KYC → Status `pending`
3. Admin approuve → Rôle `provider` + Status `approved`

### 2. Authentification (AuthContext)

Le contexte Auth est utilisé partout :

```tsx
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Chargement...</div>;
  if (!user) return <div>Non connecté</div>;
  
  return <div>Bonjour {user.displayName}</div>;
}
```

### 3. Firestore Collections

**users** :
```typescript
{
  uid: string;
  email: string;
  displayName: string;
  roles: UserRole[];
  kycStatus?: "pending" | "approved" | "rejected";
  createdAt: Timestamp;
}
```

**kyc_submissions** :
```typescript
{
  userId: string;
  status: "pending" | "approved" | "rejected";
  documents: { type, url, uploadedAt, verified }[];
  submittedAt: Timestamp;
  reviewedAt?: Timestamp;
}
```

**tasks** :
```typescript
{
  title: string;
  description: string;
  category: ServiceCategory;
  clientId: string;
  status: "open" | "in_progress" | "completed";
  budget: number;
  createdAt: Timestamp;
}
```

### 4. Cloud Functions

Toutes les fonctions utilisent `onCall` (v2) :

```typescript
import { onCall, HttpsError } from "firebase-functions/v2/https";

export const myFunction = onCall(async (request) => {
  // Vérifier auth
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "User must be authenticated");
  }
  
  // Logique métier
  const result = await doSomething();
  
  return { success: true, data: result };
});
```

**Appel depuis le frontend** :

```typescript
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';

const myFunction = httpsCallable(functions, 'myFunction');
const result = await myFunction({ param: "value" });
```

---

## 🎨 Standards de Code

### TypeScript

```typescript
// ✅ Bon : Typage explicite
interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
}

function getUser(uid: string): Promise<UserProfile> {
  // ...
}

// ❌ Éviter : any
function getUser(uid: any): any {
  // ...
}
```

### React Components

```tsx
// ✅ Bon : Functional components avec types
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export function Button({ label, onClick, disabled = false }: ButtonProps) {
  return (
    <button onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
}

// ❌ Éviter : Class components
class Button extends React.Component { ... }
```

### Naming Conventions

```typescript
// Variables & Functions : camelCase
const userName = "John";
function getUserName() { ... }

// Components : PascalCase
function UserProfile() { ... }

// Constants : UPPER_SNAKE_CASE
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Types/Interfaces : PascalCase
interface UserData { ... }
type UserRole = "user" | "provider" | "admin";

// Enums : PascalCase (keys et values)
enum UserRole {
  User = "user",
  Provider = "provider",
  Admin = "admin",
}
```

---

## 🧪 Tests

### Tests Unitaires (Jest)

```typescript
// src/lib/__tests__/example.test.ts
import { myFunction } from '../example';

describe('myFunction', () => {
  it('should return expected result', () => {
    const result = myFunction('input');
    expect(result).toBe('expected output');
  });
  
  it('should throw error for invalid input', () => {
    expect(() => myFunction(null)).toThrow();
  });
});
```

### Tests E2E (Playwright)

```typescript
// e2e/user-flow.spec.ts
import { test, expect } from '@playwright/test';

test('user can sign up', async ({ page }) => {
  await page.goto('/sign-up');
  
  await page.fill('[data-testid="email-input"]', 'test@example.com');
  await page.fill('[data-testid="password-input"]', 'Password123');
  await page.click('[data-testid="submit-button"]');
  
  await expect(page).toHaveURL('/dashboard');
});
```

**Important** : Toujours ajouter `data-testid` pour les éléments testés :

```tsx
<input data-testid="email-input" type="email" />
<button data-testid="submit-button">S'inscrire</button>
```

---

## 🚨 Résolution de Problèmes Courants

### 1. Erreur Firebase "No Firebase App"

**Symptôme** : `FirebaseError: Firebase: No Firebase App '[DEFAULT]' has been created`

**Solution** :
```bash
# Vérifier que .env.local contient toutes les variables
cat .env.local

# Redémarrer le serveur dev
pnpm dev
```

### 2. Erreur Hydration

**Symptôme** : `Text content does not match server-rendered HTML`

**Solution** :
- Vérifier qu'il n'y a pas de rendu conditionnel basé sur `window` côté serveur
- Ajouter `suppressHydrationWarning` si nécessaire (extensions navigateur)

### 3. Erreur Tailwind CSS

**Symptôme** : Les classes Tailwind ne fonctionnent pas

**Solution** :
```bash
# Vérifier que tailwind.config.ts est à la racine
ls -la tailwind.config.ts

# Si absent, copier depuis src/
cp src/tailwind.config.ts tailwind.config.ts

# Redémarrer
pnpm dev
```

### 4. Cloud Functions timeout

**Symptôme** : `Function execution took too long`

**Solution** :
```typescript
// Augmenter le timeout dans la config
export const myFunction = onCall(
  { timeoutSeconds: 300 }, // 5 minutes au lieu de 60s par défaut
  async (request) => { ... }
);
```

---

## 📚 Ressources Utiles

### Documentation Officielle

- [Next.js 15 Docs](https://nextjs.org/docs)
- [Firebase Docs](https://firebase.google.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Documentation Projet

- [KYC Integration](/docs/KYC_INTEGRATION_COMPLETED.md) - Système de validation
- [Services Catalog](/docs/SERVICES_CATALOG.md) - Catalogue des services MVP
- [ImuPro Vision](/docs/IMUPRO_VISION.md) - Roadmap V2 (services pro)
- [Technical Architecture](/docs/TECHNICAL_ARCHITECTURE.md) - Architecture globale

### Outils de Développement

- **VS Code Extensions recommandées** :
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - Firebase Explorer
  - GitHub Copilot

- **Chrome Extensions utiles** :
  - React Developer Tools
  - Redux DevTools (si Redux utilisé)
  - Firebase Debugger

---

## 🔐 Sécurité & Bonnes Pratiques

### 1. Ne JAMAIS commiter de secrets

```bash
# ❌ JAMAIS commiter .env.local
git add .env.local  # NON !

# ✅ Toujours dans .gitignore
echo ".env.local" >> .gitignore
```

### 2. Firestore Rules strictes

```javascript
// ✅ Bon : Vérifier l'authentification
allow read, write: if request.auth != null && request.auth.uid == userId;

// ❌ Éviter : Règles trop permissives
allow read, write: if true;
```

### 3. Validation des inputs

```typescript
// ✅ Bon : Valider côté serveur (Cloud Functions)
export const createTask = onCall(async (request) => {
  const { title, budget } = request.data;
  
  if (!title || title.length < 3) {
    throw new HttpsError("invalid-argument", "Title must be at least 3 characters");
  }
  
  if (typeof budget !== "number" || budget < 0) {
    throw new HttpsError("invalid-argument", "Budget must be a positive number");
  }
  
  // Créer la tâche
});
```

---

## 🎯 Workflow de Développement

### 1. Créer une Feature

```bash
# 1. Créer une branche depuis main
git checkout main
git pull origin main
git checkout -b feature/ma-nouvelle-feature

# 2. Développer + commiter régulièrement
git add .
git commit -m "feat: ajout de la fonctionnalité X"

# 3. Push + créer PR
git push origin feature/ma-nouvelle-feature
# Ouvrir PR sur GitHub
```

### 2. Convention de Commits

Suivre [Conventional Commits](https://www.conventionalcommits.org/) :

```bash
# Types
feat:     # Nouvelle fonctionnalité
fix:      # Correction de bug
docs:     # Documentation
style:    # Formatage (pas de changement de code)
refactor: # Refactoring
test:     # Ajout/modification de tests
chore:    # Tâches de maintenance

# Exemples
git commit -m "feat: ajout système de paiement Stripe"
git commit -m "fix: correction erreur upload fichier"
git commit -m "docs: mise à jour README avec instructions KYC"
```

### 3. Revue de Code

**Avant de soumettre une PR** :

- [ ] Code compile sans erreur (`pnpm build`)
- [ ] Tests passent (`pnpm test`)
- [ ] Pas d'erreurs ESLint (`pnpm lint`)
- [ ] Documentation mise à jour si nécessaire
- [ ] Variables sensibles dans .env (pas en dur)
- [ ] Firestore rules ajustées si nouveau modèle de données

---

## 🆘 Besoin d'Aide ?

### Contacts Équipe

- **Tech Lead** : [À définir]
- **Product Manager** : [À définir]
- **DevOps** : [À définir]

### Channels de Communication

- **Slack** : #dev-imutask
- **GitHub Issues** : Pour bugs et features
- **GitHub Discussions** : Pour questions générales

### Debugging

```bash
# Logs Firebase Functions
firebase functions:log --only functionName

# Logs Next.js (mode verbose)
DEBUG=* pnpm dev

# Logs Firestore Emulator
firebase emulators:start --debug
```

---

## 🎉 Félicitations !

Vous êtes prêt à contribuer au projet ImuTask ! 🚀

**Prochaines étapes recommandées** :

1. Lire la [Technical Architecture](/docs/TECHNICAL_ARCHITECTURE.md)
2. Explorer le code dans `/src/app/[locale]/dashboard`
3. Lancer les tests : `pnpm test`
4. Créer votre première PR (fix typo dans README = parfait pour commencer !)

**Bon code !** 💻✨
