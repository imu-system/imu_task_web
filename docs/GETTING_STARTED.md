# 🚀 Guide de Démarrage - ImuTask Web

**Pour:** Nouveaux développeurs  
**Temps estimé:** 1-2 heures  
**Dernière mise à jour:** 3 octobre 2025

---

## 📋 Vue d'ensemble

Ce guide vous aidera à configurer votre environnement de développement local pour ImuTask Web en quelques étapes simples.

---

## ✅ Prérequis

Avant de commencer, assurez-vous d'avoir:

- [ ] **Node.js 20+** installé ([télécharger](https://nodejs.org/))
- [ ] **npm** ou **yarn** installé (inclus avec Node.js)
- [ ] **Git** installé
- [ ] **Un compte Google** (pour Firebase)
- [ ] **Un éditeur de code** (VS Code recommandé)

### Vérifier les installations

```bash
node --version  # Devrait afficher v20.x.x ou supérieur
npm --version   # Devrait afficher 10.x.x ou supérieur
git --version   # Devrait afficher 2.x.x ou supérieur
```

---

## 📥 Étape 1: Cloner le projet

```bash
# Cloner le repository
cd ~/Documents/GitHub
git clone https://github.com/imu-system/imu_task_web.git

# Ou si vous êtes déjà dans le dossier:
cd /Users/nathanimogo/Documents/GitHub/imu_task_web
```

---

## 📦 Étape 2: Installer les dépendances

```bash
# Installer toutes les dépendances npm
npm install

# Cela peut prendre 2-3 minutes
```

**Dépendances principales installées:**
- Next.js 15
- React 18
- Firebase SDK
- Tailwind CSS
- shadcn/ui components
- Et bien plus...

---

## 🔧 Étape 3: Configuration de l'environnement

### A. Créer votre fichier d'environnement

```bash
# Copier le fichier exemple
cp .env.example .env.local
```

### B. Obtenir vos clés Firebase

#### Option 1: Utiliser un projet Firebase existant

Si un projet Firebase existe déjà pour ImuTask:

1. Contactez l'administrateur du projet pour obtenir les clés
2. Collez-les dans votre `.env.local`

#### Option 2: Créer votre propre projet Firebase (dev local)

1. **Aller sur [Firebase Console](https://console.firebase.google.com/)**

2. **Cliquer sur "Ajouter un projet"**
   - Nom: `imutask-dev-votrenom` (ex: `imutask-dev-nathan`)
   - Activer Google Analytics (optionnel pour le dev)

3. **Dans le projet, cliquer sur l'icône Web (`</>`)**
   - Nom de l'app: `ImuTask Web Dev`
   - Ne pas cocher "Firebase Hosting" pour l'instant
   - Cliquer sur "Enregistrer l'application"

4. **Copier les valeurs de configuration**

   Vous verrez un code comme:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "imutask-dev-nathan.firebaseapp.com",
     projectId: "imutask-dev-nathan",
     storageBucket: "imutask-dev-nathan.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abc123",
     measurementId: "G-XXXXXXXXXX"
   };
   ```

5. **Ouvrir `.env.local` et remplir:**

   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=imutask-dev-nathan.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=imutask-dev-nathan
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=imutask-dev-nathan.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
   NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
   ```

### C. Obtenir votre clé Genkit (optionnel pour l'instant)

1. Aller sur [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Créer une clé API
3. Copier dans `.env.local`:
   ```env
   GOOGLE_GENAI_API_KEY=votre_clé_ici
   ```

### D. Configuration Stripe (pas nécessaire maintenant)

Pour l'instant, laissez les clés Stripe vides. Elles seront nécessaires en Phase 6.

---

## 🔥 Étape 4: Activer les services Firebase

### A. Activer Authentication

1. Dans Firebase Console, aller dans **Authentication**
2. Cliquer sur **Get started**
3. Onglet **Sign-in method**
4. Activer **Email/Password**
5. Activer **Google** (optionnel pour l'instant)

### B. Créer Firestore Database

1. Dans Firebase Console, aller dans **Firestore Database**
2. Cliquer sur **Create database**
3. Choisir **Start in test mode** (pour le dev)
4. Sélectionner une région proche (ex: `europe-west1` pour l'Europe)
5. Cliquer sur **Enable**

### C. Activer Storage

1. Dans Firebase Console, aller dans **Storage**
2. Cliquer sur **Get started**
3. Choisir **Start in test mode**
4. Utiliser la même région que Firestore
5. Cliquer sur **Done**

---

## 🚀 Étape 5: Lancer l'application

```bash
# Lancer le serveur de développement
npm run dev
```

**Vous devriez voir:**
```
▲ Next.js 15.3.3
- Local:        http://localhost:9002
- Network:      http://192.168.x.x:9002

✓ Ready in 2.5s
```

### Ouvrir dans le navigateur

Aller sur: [http://localhost:9002](http://localhost:9002)

**Vous devriez voir:**
- La page d'accueil d'ImuTask
- Le header avec navigation
- Le contenu "Landing Page"

---

## 🧪 Étape 6: Tester les fonctionnalités

### A. Navigation

Testez les liens dans le header:
- Dashboard
- Tasks
- Messages
- Notifications

**Note:** Ces pages existent mais ne sont pas encore connectées aux vraies données.

### B. Pages d'authentification

1. Aller sur: [http://localhost:9002/en/auth/login](http://localhost:9002/en/auth/login)
2. Vous devriez voir le formulaire de connexion
3. Aller sur: [http://localhost:9002/en/auth/signup](http://localhost:9002/en/auth/signup)
4. Vous devriez voir le formulaire d'inscription

**Note:** Ces formulaires ne sont pas encore fonctionnels (voir BUGS_AND_ISSUES.md)

### C. Internationalisation

Testez les différentes langues:
- Anglais: [http://localhost:9002/en](http://localhost:9002/en)
- Français: [http://localhost:9002/fr](http://localhost:9002/fr)
- Allemand: [http://localhost:9002/de](http://localhost:9002/de)
- Espagnol: [http://localhost:9002/es](http://localhost:9002/es)
- Japonais: [http://localhost:9002/ja](http://localhost:9002/ja)

---

## 🔍 Étape 7: Explorer le code

### Structure recommandée à explorer

1. **`/src/app/[locale]/page.tsx`** - Page d'accueil
2. **`/src/components/ui/`** - Composants UI réutilisables
3. **`/src/app/[locale]/auth/login/page.tsx`** - Page de login
4. **`/src/components/new-task-form.tsx`** - Formulaire de création de tâche
5. **`/src/lib/types.ts`** - Types TypeScript

### Ouvrir avec VS Code

```bash
code .
```

**Extensions VS Code recommandées:**
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript and JavaScript Language Features
- Firebase Explorer (optionnel)

---

## 📚 Étape 8: Lire la documentation

Maintenant que tout fonctionne, prenez le temps de lire:

1. **[docs/INDEX.md](./docs/INDEX.md)** - Point d'entrée de toute la doc
2. **[docs/ROADMAP.md](./docs/ROADMAP.md)** - Comprendre où en est le projet
3. **[docs/BUGS_AND_ISSUES.md](./docs/BUGS_AND_ISSUES.md)** - Voir ce qui doit être fait

---

## 🛠️ Commandes utiles

```bash
# Développement
npm run dev              # Lancer le serveur de dev
npm run build            # Build pour production
npm run start            # Lancer en production
npm run lint             # Vérifier le code

# Genkit AI
npm run genkit:dev       # Lancer Genkit
npm run genkit:watch     # Genkit avec auto-reload

# TypeScript
npm run typecheck        # Vérifier les types
```

---

## 🐛 Problèmes courants

### Problème 1: Port 9002 déjà utilisé

**Erreur:** `Error: listen EADDRINUSE: address already in use :::9002`

**Solution:**
```bash
# Tuer le processus sur le port 9002
lsof -ti:9002 | xargs kill -9

# Ou utiliser un autre port
npm run dev -- -p 3000
```

### Problème 2: Erreurs TypeScript

**Erreur:** Plein d'erreurs TypeScript

**Solution:** C'est normal pour l'instant. Dans `next.config.mjs`, les erreurs TypeScript sont ignorées temporairement:
```javascript
typescript: {
  ignoreBuildErrors: true,
}
```

Voir BUG-009 dans BUGS_AND_ISSUES.md

### Problème 3: Variables d'environnement non chargées

**Erreur:** `Error: Firebase configuration not found`

**Solution:**
1. Vérifier que `.env.local` existe
2. Redémarrer le serveur de dev (`Ctrl+C` puis `npm run dev`)
3. Vérifier que les variables commencent par `NEXT_PUBLIC_`

### Problème 4: Firebase initialization error

**Erreur:** `Firebase: Error (auth/configuration-not-found)`

**Solution:**
1. Vérifier que Firebase Auth est activé dans la console
2. Vérifier que les clés dans `.env.local` sont correctes
3. Créer le fichier `/src/lib/firebase.ts` (voir FIREBASE_SETUP.md)

---

## ✅ Checklist de démarrage complet

- [ ] Node.js 20+ installé
- [ ] Projet cloné
- [ ] Dépendances installées (`npm install`)
- [ ] Fichier `.env.local` créé et rempli
- [ ] Projet Firebase créé
- [ ] Firebase Auth activé
- [ ] Firestore Database créé
- [ ] Firebase Storage activé
- [ ] Serveur de dev lancé et accessible
- [ ] Pages testées dans le navigateur
- [ ] Documentation lue (au moins INDEX.md)
- [ ] VS Code configuré avec extensions

---

## 🎯 Prochaines étapes

Maintenant que votre environnement est configuré:

### Pour les développeurs frontend

1. Lire [ROADMAP.md](./docs/ROADMAP.md) pour comprendre les phases
2. Choisir une tâche dans [BUGS_AND_ISSUES.md](./docs/BUGS_AND_ISSUES.md)
3. Créer une branche: `git checkout -b feature/web-votre-feature`
4. Développer et tester
5. Commiter: `git commit -m "[web] feat: Description"`
6. Pousser: `git push origin feature/web-votre-feature`

### Pour les développeurs backend/Firebase

1. Lire [FIREBASE_SETUP.md](./docs/FIREBASE_SETUP.md) en détail
2. Créer `/src/lib/firebase.ts` (configuration Firebase)
3. Créer `/src/contexts/AuthContext.tsx` (contexte d'auth)
4. Implémenter les premières fonctions d'authentification

### Pour tous

1. Rejoindre les canaux de communication (Slack/Discord)
2. Participer à la prochaine réunion de synchro
3. Poser des questions si quelque chose n'est pas clair

---

## 💡 Conseils pour bien démarrer

### 1. Comprendre la structure
Prenez 30 minutes pour explorer la structure du projet et comprendre où se trouve quoi.

### 2. Lire le code existant
Avant d'écrire du code, lisez les composants existants pour comprendre les conventions.

### 3. Tester avant de coder
Utilisez l'application comme un utilisateur final pour comprendre ce qui fonctionne et ce qui ne fonctionne pas.

### 4. Petits commits fréquents
Faites des commits petits et fréquents avec des messages clairs.

### 5. Communiquer
N'hésitez pas à poser des questions et à partager vos idées.

---

## 📞 Besoin d'aide?

### Documentation
- Consultez d'abord [docs/INDEX.md](./docs/INDEX.md)
- Recherchez dans [BUGS_AND_ISSUES.md](./docs/BUGS_AND_ISSUES.md)
- Lisez [FIREBASE_SETUP.md](./docs/FIREBASE_SETUP.md) pour Firebase

### Support
- Créez une issue GitHub pour les bugs
- Utilisez Slack/Discord pour les questions rapides
- Demandez lors des réunions de synchro

### Ressources externes
- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## 🎉 Félicitations!

Votre environnement de développement est prêt. Bienvenue dans l'équipe ImuTask! 🚀

**Bon développement!**

---

**Dernière mise à jour:** 3 octobre 2025  
**Maintenu par:** L'équipe ImuTask
