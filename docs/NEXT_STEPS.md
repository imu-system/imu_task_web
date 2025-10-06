# 🚀 Prochaines Étapes — Guide de Démarrage Rapide

**Date:** 3 octobre 2025  
**Objectif:** Passer de 19.5% → 40% de completion en 2 semaines

---

## ⚡ Actions Immédiates (Cette Semaine)

### 🔥 PRIORITÉ 1: Configuration Firebase (CRITIQUE)

**Temps estimé:** 3-4 heures  
**Bloque:** Toutes les fonctionnalités backend

**Actions:**

1. **Créer projet Firebase** (30 min)
   ```bash
   # Se connecter à Firebase Console
   # https://console.firebase.google.com
   
   # Créer nouveau projet "imu-task-web"
   # Activer Google Analytics (optionnel)
   ```

2. **Activer services** (30 min)
   - ✅ Authentication (Email/Password + Google OAuth)
   - ✅ Firestore Database (mode production)
   - ✅ Storage (règles production)
   - ✅ Hosting (optionnel, on utilise Vercel)

3. **Créer fichier de configuration** (1h)
   ```bash
   # Créer .env.local à la racine du projet
   cp .env.example .env.local
   
   # Remplir avec les clés Firebase
   # (disponibles dans Firebase Console > Project Settings)
   ```

4. **Initialiser Firebase dans le code** (1-2h)
   ```bash
   # Créer /src/lib/firebase.ts
   # Suivre le guide: docs/FIREBASE_SETUP.md
   ```

5. **Tester la connexion** (30 min)
   ```bash
   npm run dev
   # Vérifier dans la console qu'il n'y a pas d'erreurs Firebase
   ```

**✅ Critères de succès:**
- Firebase initialisé sans erreur
- Peut créer un utilisateur test
- Peut lire/écrire dans Firestore
- Peut upload une image dans Storage

**📖 Guide détaillé:** [docs/FIREBASE_SETUP.md](./FIREBASE_SETUP.md)

---

### 🔥 PRIORITÉ 2: Authentification Fonctionnelle (CRITIQUE)

**Temps estimé:** 6-8 heures  
**Dépend de:** PRIORITÉ 1 (Firebase)

**Actions:**

1. **Créer AuthContext** (2h)
   ```typescript
   // /src/contexts/AuthContext.tsx
   // Fournit: currentUser, signUp(), signIn(), signOut(), loading
   ```

2. **Connecter page signup** (1h)
   ```typescript
   // /src/app/[locale]/auth/signup/page.tsx
   // Utiliser AuthContext.signUp()
   // Rediriger vers dashboard après succès
   ```

3. **Connecter page login** (1h)
   ```typescript
   // /src/app/[locale]/auth/login/page.tsx
   // Utiliser AuthContext.signIn()
   ```

4. **Ajouter Google OAuth** (1h)
   ```typescript
   // Bouton "Sign in with Google"
   // Firebase signInWithPopup(googleProvider)
   ```

5. **Implémenter middleware de protection** (2h)
   ```typescript
   // /src/middleware.ts
   // Vérifier auth avant d'accéder aux routes /dashboard/*
   ```

6. **Créer page profile basique** (1-2h)
   ```typescript
   // /src/app/[locale]/dashboard/profile/page.tsx
   // Afficher infos user
   // Formulaire update profile
   ```

**✅ Critères de succès:**
- Peut créer un compte via email
- Peut se connecter via email
- Peut se connecter via Google
- Redirection automatique si non authentifié
- Profile page affiche les bonnes données

**📋 Tâche associée:** [TASKS_TODO.md#3](./TASKS_TODO.md) - Task #3

---

### 🔥 PRIORITÉ 3: Persistance Création de Tâches (HAUTE)

**Temps estimé:** 4-5 heures  
**Dépend de:** PRIORITÉ 1 & 2

**Actions:**

1. **Créer collection Firestore `tasks`** (30 min)
   ```typescript
   // Schema dans docs/FIREBASE_SETUP.md
   // Collection: tasks
   // Documents: {id, clientId, title, description, ...}
   ```

2. **Connecter NewTaskForm à Firestore** (2h)
   ```typescript
   // /src/components/new-task-form.tsx
   // Dans onSubmit():
   await addDoc(collection(db, 'tasks'), {
     ...formData,
     clientId: currentUser.uid,
     status: 'draft',
     createdAt: serverTimestamp()
   });
   ```

3. **Afficher tâches utilisateur** (1-2h)
   ```typescript
   // /src/app/[locale]/dashboard/tasks/page.tsx
   // Query Firestore: where('clientId', '==', currentUser.uid)
   // Afficher liste avec statut
   ```

4. **Ajouter géolocalisation** (1h)
   ```typescript
   // Utiliser Geocoding API (Google Maps ou Mapbox)
   // Convertir adresse → lat/lng
   // Stocker dans Firestore
   ```

**✅ Critères de succès:**
- Formulaire new-task sauvegarde dans Firestore
- Liste des tâches affiche les vraies données
- Refresh page = données persistent
- Géolocalisation fonctionne

**📋 Tâche associée:** [TASKS_TODO.md#5](./TASKS_TODO.md) - Task #5

---

## 📅 Planning Sprint 1 (Oct 3-17)

### Semaine 1 (Oct 3-9): Firebase + Auth

| Jour | Tâche | Temps | Owner |
|------|-------|-------|-------|
| Lun 3 | Setup Firebase projet | 2h | Dev 1 |
| Lun 3 | Créer .env.local + init Firebase | 2h | Dev 1 |
| Mar 4 | AuthContext création | 3h | Dev 1 |
| Mar 4 | Page signup connexion | 1h | Dev 1 |
| Mer 5 | Page login connexion | 1h | Dev 1 |
| Mer 5 | Google OAuth | 2h | Dev 1 |
| Jeu 6 | Middleware protection routes | 2h | Dev 1 |
| Jeu 6 | Profile page basique | 2h | Dev 2 |
| Ven 7 | Tests auth flow | 2h | QA |
| Ven 7 | Bug fixes | 2h | Dev 1 + 2 |

**Objectif semaine 1:** ✅ Auth complètement fonctionnelle

---

### Semaine 2 (Oct 10-16): Tasks + Profils

| Jour | Tâche | Temps | Owner |
|------|-------|-------|-------|
| Lun 10 | Schema Firestore tasks | 1h | Dev 1 |
| Lun 10 | NewTaskForm → Firestore | 2h | Dev 1 |
| Mar 11 | Liste tasks (query Firestore) | 2h | Dev 2 |
| Mar 11 | Géolocalisation API setup | 2h | Dev 1 |
| Mer 12 | Task detail page | 3h | Dev 2 |
| Mer 12 | Geocoding intégration | 2h | Dev 1 |
| Jeu 13 | Profile page full (avatar upload) | 3h | Dev 2 |
| Jeu 13 | Skills management | 2h | Dev 1 |
| Ven 14 | Tests E2E | 3h | QA |
| Ven 14 | Polish UI | 2h | Dev 1 + 2 |

**Objectif semaine 2:** ✅ Tasks + Profils fonctionnels

---

## 🎯 Objectifs Sprint 1 (Success Metrics)

### Must Have (CRITIQUE - Bloquant)

- [x] Firebase configuré et fonctionnel
- [x] Auth email + Google OAuth
- [x] Middleware protection routes
- [x] Tasks sauvegardées dans Firestore
- [x] Liste tasks affiche vraies données
- [x] Profile page avec update

### Should Have (IMPORTANT - Haute valeur)

- [ ] Géolocalisation tasks
- [ ] Avatar upload
- [ ] Skills management (providers)
- [ ] Task detail page
- [ ] Basic search tasks

### Could Have (NICE TO HAVE)

- [ ] Email verification
- [ ] Password reset
- [ ] Notifications in-app basiques
- [ ] Dark mode toggle

---

## 🐛 Bugs Critiques à Résoudre

### BUG-001: Firebase Non Configuré
**Status:** 🔴 BLOQUANT  
**Action:** Suivre PRIORITÉ 1 ci-dessus  
**ETA:** 4h

### BUG-002: Auth Pages Non Fonctionnelles
**Status:** 🔴 BLOQUANT  
**Action:** Suivre PRIORITÉ 2 ci-dessus  
**ETA:** 6h

### BUG-003: Task Form Non Connecté DB
**Status:** 🔴 BLOQUANT  
**Action:** Suivre PRIORITÉ 3 ci-dessus  
**ETA:** 4h

**Total temps résolution bugs critiques:** ~14h (1.5-2 jours dev)

**📖 Détails complets:** [docs/BUGS_AND_ISSUES.md](./BUGS_AND_ISSUES.md)

---

## 📚 Ressources Essentielles

### Lecture Obligatoire (Avant de Coder)

1. **[PRODUCT_VISION.md](./PRODUCT_VISION.md)** (30 min)
   - Comprendre le produit, les personas, le business model
   - Savoir pourquoi on construit quoi

2. **[TECHNICAL_ARCHITECTURE.md](./TECHNICAL_ARCHITECTURE.md)** (45 min)
   - Architecture complète
   - DB schema, API design, stack technique

3. **[FIREBASE_SETUP.md](./FIREBASE_SETUP.md)** (20 min)
   - Guide pas-à-pas configuration
   - Références pendant le développement

### Consultation Régulière

- **[TASKS_TODO.md](./TASKS_TODO.md)** — Choisir sa prochaine tâche
- **[ROADMAP.md](./ROADMAP.md)** — Vision long terme
- **[BUGS_AND_ISSUES.md](./BUGS_AND_ISSUES.md)** — Problèmes connus

---

## 🛠️ Commandes Utiles

### Setup Initial

```bash
# Installer dépendances
pnpm install

# Copier fichier environnement
cp .env.example .env.local

# Éditer .env.local avec vos clés Firebase
code .env.local

# Lancer dev server
pnpm dev
# → http://localhost:9002
```

### Firebase Emulators (Recommandé pour Dev)

```bash
# Installer Firebase CLI
npm install -g firebase-tools

# Login Firebase
firebase login

# Initialiser Firebase dans le projet
firebase init

# Lancer émulateurs (Auth + Firestore + Storage)
firebase emulators:start

# Dans .env.local, pointer vers émulateurs:
# NEXT_PUBLIC_USE_FIREBASE_EMULATORS=true
```

### Tests

```bash
# Linter
pnpm lint

# Type check
pnpm type-check

# Tests unitaires (quand configurés)
pnpm test

# Build production (vérifier erreurs)
pnpm build
```

### Git Workflow

```bash
# Créer branche feature
git checkout -b feature/firebase-setup

# Commit réguliers
git add .
git commit -m "feat: configure Firebase Auth"

# Push et créer PR
git push origin feature/firebase-setup

# Dans GitHub: Create Pull Request
# Assigner reviewer, lier issue si applicable
```

---

## 🎓 Best Practices à Suivre

### Code Quality

✅ **TypeScript strict**
- Pas de `any` (utiliser `unknown` si nécessaire)
- Typer tous les props/fonctions
- Activer `"strict": true` dans tsconfig.json

✅ **Composants réutilisables**
- Extraire logique commune
- Props typés avec interfaces
- Documentation JSDoc pour composants complexes

✅ **Error Handling**
- Try/catch pour async operations
- Messages d'erreur user-friendly
- Logger erreurs (Sentry plus tard)

### Firebase Best Practices

✅ **Sécurité**
- JAMAIS exposer clés API côté serveur dans repo public
- Utiliser Security Rules Firestore
- Valider données côté serveur (Cloud Functions)

✅ **Performance**
- Indexes Firestore pour queries complexes
- Pagination (limit/offset)
- Cache avec React Query

✅ **Coûts**
- Utiliser émulateurs en dev (gratuit)
- Limiter reads/writes (pagination, cache)
- Monitorer usage Firebase Console

### Git & Collaboration

✅ **Commits clairs**
```
feat: add Firebase Authentication
fix: resolve login redirect issue
docs: update FIREBASE_SETUP.md
refactor: extract AuthContext logic
```

✅ **Pull Requests**
- Description claire du changement
- Screenshots si UI
- Tests effectués
- Lier issue (#123)

✅ **Code Review**
- Reviewer au moins 1 personne
- Répondre aux commentaires
- Merge après approbation

---

## ⚠️ Pièges à Éviter

### ❌ Erreurs Fréquentes

1. **Oublier .env.local**
   - Créer depuis .env.example
   - NE JAMAIS commit .env.local

2. **Ignorer les erreurs TypeScript**
   - Les corriger immédiatement
   - Ne pas utiliser `@ts-ignore`

3. **Pas de gestion d'erreurs**
   - Toujours try/catch async
   - Afficher messages utilisateur

4. **Hardcoder des valeurs**
   - Utiliser variables d'environnement
   - Créer constantes pour valeurs réutilisées

5. **Oublier la sécurité Firestore**
   - Configurer rules AVANT production
   - Tester avec utilisateurs différents

### 🚨 Red Flags

Si vous voyez ça, ARRÊTEZ et demandez de l'aide:

- 🔴 Erreurs Firebase Auth non résolues
- 🔴 "Permission denied" dans Firestore
- 🔴 Données ne persistent pas après refresh
- 🔴 Builds qui échouent
- 🔴 Clés API exposées dans le code

---

## 📞 Support & Communication

### Questions Techniques

1. **Vérifier la documentation**
   - docs/TECHNICAL_ARCHITECTURE.md
   - docs/FIREBASE_SETUP.md

2. **Chercher dans les issues GitHub**
   - Issues existantes
   - Discussions

3. **Demander de l'aide**
   - Slack/Discord team channel
   - Tag @tech-lead pour questions urgentes

### Rapporter un Bug

1. **Créer une issue GitHub**
   ```markdown
   ## Description
   [Décrire le bug]
   
   ## Steps to Reproduce
   1. ...
   2. ...
   
   ## Expected Behavior
   [Ce qui devrait se passer]
   
   ## Actual Behavior
   [Ce qui se passe réellement]
   
   ## Screenshots
   [Si applicable]
   
   ## Environment
   - OS: macOS
   - Browser: Chrome 120
   - Node: 20.x
   ```

2. **Ajouter au BUGS_AND_ISSUES.md**

### Stand-ups & Sync

**Daily Standup (10 min):**
- Hier: ce que j'ai fait
- Aujourd'hui: ce que je vais faire
- Blockers: ce qui me bloque

**Weekly Review (Vendredi, 1h):**
- Demo features complétées
- Metrics sprint (velocity, bugs)
- Planning semaine suivante

---

## 🎯 Définition of Done

Une tâche est DONE quand:

- ✅ Code écrit et testé localement
- ✅ Types TypeScript corrects (pas d'erreurs)
- ✅ Linter passe (pnpm lint)
- ✅ Build réussit (pnpm build)
- ✅ Tests unitaires passent (si applicable)
- ✅ Documentation mise à jour (si nécessaire)
- ✅ PR créée et reviewée
- ✅ Merged dans main
- ✅ Déployé en preview/staging (Vercel)
- ✅ Testé en staging par QA
- ✅ BUGS_AND_ISSUES.md mis à jour (si bug fix)

---

## 📊 Tracking Progress

### Daily

- [ ] Mettre à jour statut tâches (TASKS_TODO.md)
- [ ] Logger temps passé (optionnel mais recommandé)
- [ ] Pusher code en fin de journée

### Weekly

- [ ] Review metrics sprint (PROJECT_SUMMARY.md)
- [ ] Update ROADMAP.md (% completion phases)
- [ ] Review bugs (BUGS_AND_ISSUES.md)
- [ ] Célébrer les wins! 🎉

---

## 🚀 Let's Go!

**Prochaine action:** Ouvrir [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) et commencer PRIORITÉ 1

**Time to ship:** 2 semaines pour passer de 19.5% → 40%+

**Questions?** Ping l'équipe dans #imu-task-dev

---

**Dernière mise à jour:** 3 octobre 2025  
**Next review:** 10 octobre 2025 (fin semaine 1)
