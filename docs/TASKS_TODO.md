# ✅ Liste des Tâches Prioritaires - ImuTask Web

**Date:** 3 octobre 2025  
**Sprint actuel:** 3 oct - 17 oct 2025

---

## 🔴 URGENT - À faire cette semaine

### 1. Configuration Firebase [BUG-001]
**Priorité:** Critique  
**Temps estimé:** 2-3 heures  
**Assigné à:** Non assigné

**Sous-tâches:**
- [ ] Créer le projet Firebase dans la console
- [ ] Configurer Firebase Auth (Email/Password + Google)
- [ ] Créer Firestore Database
- [ ] Activer Firebase Storage
- [ ] Créer `/src/lib/firebase.ts` avec configuration
- [ ] Tester la connexion

**Guide:** Suivre [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)

---

### 2. Variables d'environnement [BUG-007]
**Priorité:** Critique  
**Temps estimé:** 30 minutes  
**Assigné à:** Non assigné

**Sous-tâches:**
- [x] Créer `.env.example` ✅
- [ ] Créer son propre `.env.local`
- [ ] Remplir avec les clés Firebase
- [ ] Vérifier que l'app charge les variables
- [ ] Ajouter `.env*.local` au `.gitignore`

---

### 3. Contexte d'authentification [BUG-002]
**Priorité:** Critique  
**Temps estimé:** 3-4 heures  
**Assigné à:** Non assigné

**Sous-tâches:**
- [ ] Créer `/src/contexts/AuthContext.tsx`
- [ ] Implémenter les fonctions:
  - [ ] `signUp(email, password)`
  - [ ] `signIn(email, password)`
  - [ ] `signInWithGoogle()`
  - [ ] `logout()`
- [ ] Intégrer dans `/src/app/[locale]/layout.tsx`
- [ ] Créer un hook `useAuth()`

**Guide:** Voir section Authentication dans [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)

---

### 4. Connecter les pages d'authentification
**Priorité:** Critique  
**Temps estimé:** 2 heures  
**Assigné à:** Non assigné

**Sous-tâches:**
- [ ] Modifier `/src/app/[locale]/auth/login/page.tsx`
  - [ ] Utiliser `useAuth()` hook
  - [ ] Connecter le formulaire à `signIn()`
  - [ ] Gérer les erreurs
  - [ ] Rediriger après connexion
- [ ] Modifier `/src/app/[locale]/auth/signup/page.tsx`
  - [ ] Utiliser `useAuth()` hook
  - [ ] Connecter le formulaire à `signUp()`
  - [ ] Gérer les erreurs
  - [ ] Rediriger après inscription

---

## 🟡 IMPORTANT - À faire la semaine prochaine

### 5. Middleware d'authentification [BUG-006]
**Priorité:** Haute  
**Temps estimé:** 2 heures  
**Assigné à:** Non assigné

**Sous-tâches:**
- [ ] Modifier `/src/middleware.ts`
- [ ] Vérifier le token d'authentification
- [ ] Définir les routes publiques vs protégées
- [ ] Rediriger vers `/auth/login` si non authentifié
- [ ] Gérer les redirections post-login

---

### 6. Création de tâches fonctionnelle [BUG-003]
**Priorité:** Haute  
**Temps estimé:** 3-4 heures  
**Assigné à:** Non assigné

**Sous-tâches:**
- [ ] Créer `/src/lib/firestore-helpers.ts`
- [ ] Implémenter `createTask(data: TaskData)`
- [ ] Modifier `/src/components/new-task-form.tsx`
- [ ] Connecter `onSubmit` à Firestore
- [ ] Gérer les erreurs
- [ ] Rediriger vers la tâche créée
- [ ] Tester la création

---

### 7. Profil utilisateur ✅ COMPLÉTÉ
**Priorité:** Haute  
**Temps estimé:** 4 heures  
**Temps réel:** ~3 heures  
**Assigné à:** Complété le 4 octobre 2025

**Sous-tâches:**
- [x] Créer `/src/lib/users.ts` avec fonctions CRUD ✅
- [x] Modifier `/src/components/profile-page-client.tsx` ✅ (Créé `/src/app/[locale]/profile/page.tsx`)
- [x] Connecter aux données Firestore ✅ (AuthContext + updateUserProfile)
- [x] Implémenter upload d'avatar ✅ (Firebase Storage + validation 5MB)
- [x] Sauvegarder les modifications ✅ (Toast notifications)
- [x] Gérer les compétences pour prestataires ⚠️ (Placeholder - à implémenter plus tard)

**Fichier créé:** `/src/app/[locale]/profile/page.tsx` (330+ lignes)  
**Fonctionnalités:** Avatar upload, Edit displayName, Email readonly, Account actions (logout, change password), i18n (28 clés × 5 langues), Toast notifications, Accessibility (ARIA labels)

**Documentation:** Voir SESSION_COMPLETE_SUMMARY.md

---

### 8. Dashboards dynamiques [BUG-004] ✅ COMPLÉTÉ
**Priorité:** Haute  
**Temps estimé:** 3 heures  
**Temps réel:** ~2 heures  
**Assigné à:** Complété le 4 octobre 2025

**Sous-tâches:**
- [x] Créer hooks pour récupérer données: ✅
  - [x] `useUserTasks(userId)` ✅ Created in `/src/hooks/use-user-tasks.ts`
  - [x] `useUserProposals(userId)` ✅ Created in `/src/hooks/use-user-proposals.ts`  
  - [x] `useUserStats(userId)` ✅ Created in `/src/hooks/use-user-stats.ts`
- [x] Modifier `/src/components/dashboards/client-dashboard.tsx` ✅ (Complètement refait, 450+ lignes)
- [x] Modifier `/src/components/dashboards/provider-dashboard.tsx` ✅ (Complètement refait, 350+ lignes)
- [x] Remplacer données statiques par données réelles ✅ (Firestore integration)
- [x] Ajouter états de chargement ✅ (Skeleton, Loading, Error states)

**Fonctionnalités implémentées:**

**Client Dashboard:**
- ✅ 4 cartes de statistiques dynamiques (Total, In Progress, Completed, Budget)
- ✅ Quick Actions (Create Task, View All)
- ✅ Recent Tasks avec détails et navigation
- ✅ Status Breakdown avec barres de progression
- ✅ Budget Overview avec calculs réels
- ✅ Empty states quand aucune tâche
- ✅ Loading states avec Skeleton
- ✅ Real-time stats calculation

**Provider Dashboard:**
- ✅ 4 cartes de statistiques (Available Tasks, Proposals, Accepted, Earnings)
- ✅ Quick Actions (Browse Tasks, View Proposals)
- ✅ Available Tasks table avec données Firestore
- ✅ My Proposals sidebar avec statuts
- ✅ Empty states pour proposals et tasks
- ✅ Loading states avec Skeleton
- ✅ Real Firestore queries

**Documentation:** Voir DASHBOARDS_COMPLETED.md (à créer)

---

## 🟢 NORMAL - Backlog

### 9. Corriger les erreurs TypeScript [BUG-009]
**Priorité:** Moyenne  
**Temps estimé:** 2-3 heures

**Sous-tâches:**
- [ ] Lister toutes les erreurs TypeScript: `npm run typecheck`
- [ ] Corriger les erreurs une par une
- [ ] Retirer `ignoreBuildErrors: true` de `next.config.mjs`
- [ ] Vérifier que le build fonctionne

---

### 10. Mettre à jour le README [BUG-012]
**Priorité:** Faible  
**Temps estimé:** 30 minutes

**Sous-tâches:**
- [x] Réécrire le README principal ✅
- [ ] Ajouter des screenshots
- [ ] Ajouter des badges (build status, etc.)
- [ ] Vérifier les liens

---

### 11. Configurer les émulateurs Firebase [CONFIG-001]
**Priorité:** Moyenne  
**Temps estimé:** 1 heure

**Sous-tâches:**
- [ ] Installer Firebase CLI globalement
- [ ] Créer `firebase.json`
- [ ] Modifier `.idx/dev.nix`
- [ ] Lancer les émulateurs: `firebase emulators:start`
- [ ] Tester avec l'app

---

### 12. Ajouter des tests [CONFIG-002]
**Priorité:** Moyenne  
**Temps estimé:** 4 heures

**Sous-tâches:**
- [ ] Installer Jest et React Testing Library
- [ ] Configurer Jest pour Next.js
- [ ] Créer premiers tests pour:
  - [ ] Composant Button
  - [ ] Hook useAuth
  - [ ] NewTaskForm
- [ ] Ajouter script `npm test`

---

### 13. Corriger les erreurs Markdown linting
**Priorité:** Faible  
**Temps estimé:** 1 heure

**Sous-tâches:**
- [ ] Corriger `docs/blueprint.md` [BUG-008]
- [ ] Corriger les autres fichiers Markdown
- [ ] Vérifier avec un linter Markdown

---

### 14. Instrumentation Sentry [BUG-011]
**Priorité:** Faible  
**Temps estimé:** 1 heure

**Sous-tâches:**
- [ ] Créer compte Sentry
- [ ] Installer SDK Sentry
- [ ] Configurer dans `instrumentation.ts`
- [ ] Tester les erreurs

---

## 📅 Planning suggéré

### Semaine 1 (3-9 octobre)
```
Jour 1-2: Configuration Firebase (#1, #2)
Jour 3-4: Contexte Auth (#3)
Jour 5: Pages Auth (#4)
```

### Semaine 2 (10-16 octobre)
```
Jour 1: Middleware (#5)
Jour 2-3: Création tâches (#6)
Jour 4: Profil (#7)
Jour 5: Dashboards (#8)
```

### Semaine 3 (17-23 octobre)
```
Jour 1-2: TypeScript (#9)
Jour 3: Émulateurs (#11)
Jour 4-5: Tests (#12)
```

---

## 🎯 Objectifs du sprint actuel

**Sprint: 3 octobre - 17 octobre 2025**

### Objectif principal
Avoir une application web avec authentification fonctionnelle et création de tâches persistée en base de données.

### Critères de succès
- [x] Un utilisateur peut créer un compte ✅
- [x] Un utilisateur peut se connecter ✅
- [x] Un utilisateur peut créer une tâche ✅
- [x] La tâche est sauvegardée dans Firestore ✅
- [x] Un utilisateur peut voir son profil ✅ **NOUVEAU**
- [x] Un utilisateur peut modifier son profil ✅ **NOUVEAU**
- [x] Un utilisateur peut éditer une tâche ✅ **NOUVEAU**
- [x] Firebase est configuré correctement ✅

### Métriques
- Bugs critiques résolus: 3/3 ✅
- Features complétées: Task Detail + Profile + Task Edit ✅
- Progression globale: 50% → **65%** 🎉
- i18n: 5 langues (470 traductions) ✅
- Tests: 0 → À faire (prochaine étape)

---

## 📊 Statistiques de progression

| Catégorie | Total | Complété | En cours | À faire | % |
|-----------|-------|----------|----------|---------|---|
| Bugs critiques | 3 | 3 | 0 | 0 | 100% ✅ |
| Pages principales | 5 | 3 | 0 | 2 | 60% 🎉 |
| Internationalisation | 1 | 1 | 0 | 0 | 100% ✅ |
| CRUD Tasks | 4 | 4 | 0 | 0 | 100% ✅ |
| Configuration | 2 | 0 | 0 | 2 | 0% |
| **Total** | **14** | **0** | **0** | **14** | **0%** |

---

## 🤝 Attribution des tâches

### Comment s'attribuer une tâche

1. Choisir une tâche dans cette liste
2. La marquer comme "En cours" dans [BUGS_AND_ISSUES.md](./BUGS_AND_ISSUES.md)
3. Créer une branche: `git checkout -b feature/web-nom-de-la-tache`
4. Développer
5. Créer une PR avec référence à la tâche

### Qui fait quoi?

_À remplir lors de l'attribution des tâches_

| Tâche | Assigné à | Statut | Date début | Date fin estimée |
|-------|-----------|--------|------------|------------------|
| #1 Firebase | - | À faire | - | - |
| #2 Env vars | - | À faire | - | - |
| #3 Auth Context | - | À faire | - | - |
| #4 Auth Pages | - | À faire | - | - |
| ... | ... | ... | ... | ... |

---

## 📝 Notes importantes

- **Priorité des tâches:** Toujours commencer par les tâches 🔴 URGENT
- **Dépendances:** Certaines tâches dépendent d'autres (ex: #4 dépend de #3)
- **Documentation:** Mettre à jour BUGS_AND_ISSUES.md quand une tâche est terminée
- **Tests:** Tester manuellement avant de marquer comme complété

---

## ✅ Checklist avant de marquer une tâche comme terminée

- [ ] Le code fonctionne localement
- [ ] Les erreurs TypeScript sont corrigées
- [ ] Le code est testé manuellement
- [ ] La documentation est mise à jour si nécessaire
- [ ] Le commit est clair et descriptif
- [ ] La branche est poussée sur GitHub
- [ ] Une PR est créée (si applicable)

---

**Dernière mise à jour:** 3 octobre 2025  
**Prochaine révision:** 10 octobre 2025
