# ✅ Checklist Déploiement Production ImuTask V1.0

**Date de préparation**: 26 Octobre 2025  
**Version**: MVP V1.0  
**Cible**: Production  
**Status**: 🟡 Prêt pour déploiement

---

## 📋 Vue d'ensemble

Cette checklist garantit que **toutes les étapes** nécessaires au déploiement production sont complétées avant la mise en ligne.

**Progression globale**: 0/40 (0%)

---

## 🔐 1. Configuration Firebase (0/5)

### Firebase Console

- [ ] **1.1** Créer projet Firebase Production
  - Nom : `imu-task-production`
  - Region : Europe (europe-west1)
  - Plan : Blaze (Pay as you go)

- [ ] **1.2** Activer les services
  - [ ] Authentication (Email/Password, Google)
  - [ ] Firestore Database
  - [ ] Storage
  - [ ] Cloud Functions
  - [ ] Analytics

- [ ] **1.3** Configurer Firestore Rules
  ```bash
  firebase deploy --only firestore:rules
  ```
  - [ ] Vérifier règles tasks
  - [ ] Vérifier règles users
  - [ ] Vérifier règles notifications
  - [ ] Vérifier règles messages

- [ ] **1.4** Configurer Storage Rules
  ```bash
  firebase deploy --only storage
  ```
  - [ ] Règles profile_photos
  - [ ] Règles documents

- [ ] **1.5** Récupérer credentials Firebase
  - [ ] API Key
  - [ ] Auth Domain
  - [ ] Project ID
  - [ ] Storage Bucket
  - [ ] Messaging Sender ID
  - [ ] App ID
  - [ ] Measurement ID

**Documentation**: `/docs/FIREBASE_SETUP.md`

---

## 🔍 2. Configuration Algolia (0/6)

### Algolia Dashboard

- [ ] **2.1** Créer compte Algolia
  - URL : https://www.algolia.com/users/sign_up
  - Plan : Free (10k recherches/mois)

- [ ] **2.2** Créer application
  - Nom : `ImuTask Production`
  - Region : Europe (eu)

- [ ] **2.3** Récupérer credentials
  - [ ] App ID
  - [ ] Search-Only API Key (public, read-only)
  - [ ] Admin API Key (privée, server-side)

- [ ] **2.4** Vérifier configuration indices
  - [ ] `imu_tasks_production`
  - [ ] `imu_users_production`
  - [ ] `imu_services_production`

- [ ] **2.5** Lancer indexation initiale
  ```bash
  pnpm algolia:index
  ```
  - [ ] Vérifier console output
  - [ ] Vérifier dashboard Algolia (nombre de records)

- [ ] **2.6** Tester recherche
  - [ ] Recherche tasks
  - [ ] Recherche users
  - [ ] Recherche services
  - [ ] Vérifier latence (<20ms)

**Documentation**: `/docs/ALGOLIA_PRODUCTION_INDEXATION.md`

---

## 🌐 3. Configuration Vercel (0/8)

### Vercel Dashboard

- [ ] **3.1** Créer nouveau projet
  - Import depuis GitHub
  - Repository : `imu_task_web`
  - Branch : `main`

- [ ] **3.2** Configurer domaine
  - [ ] Domaine custom : `imutask.com` (ou autre)
  - [ ] SSL/TLS automatique
  - [ ] Redirect www → non-www

- [ ] **3.3** Configurer variables d'environnement
  
  **Firebase:**
  ```
  NEXT_PUBLIC_FIREBASE_API_KEY=
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
  NEXT_PUBLIC_FIREBASE_PROJECT_ID=
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
  NEXT_PUBLIC_FIREBASE_APP_ID=
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
  ```
  
  **Algolia:**
  ```
  NEXT_PUBLIC_ALGOLIA_APP_ID=
  NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY=
  ALGOLIA_ADMIN_API_KEY=
  ```

- [ ] **3.4** Scope variables : Production uniquement

- [ ] **3.5** Configurer build settings
  - Framework Preset : Next.js
  - Build Command : `pnpm build`
  - Output Directory : `.next`
  - Install Command : `pnpm install`

- [ ] **3.6** Activer Analytics
  - Vercel Analytics
  - Web Vitals tracking

- [ ] **3.7** Configurer Redirects (si nécessaire)
  - Exemple : `/old-path → /new-path`

- [ ] **3.8** Premier déploiement
  ```bash
  git push origin main
  ```
  - [ ] Vérifier build success
  - [ ] Vérifier deployment URL

**Documentation**: Vercel docs

---

## 🧪 4. Tests pré-déploiement (0/7)

### Tests locaux

- [ ] **4.1** Build local
  ```bash
  pnpm build
  ```
  - [ ] Vérifier 0 erreur TypeScript
  - [ ] Vérifier 0 warning build

- [ ] **4.2** Tests unitaires
  ```bash
  pnpm test
  ```
  - [ ] Coverage >80%

- [ ] **4.3** Tests e2e
  ```bash
  pnpm test:e2e
  ```
  - [ ] Tests responsive dashboards (25 tests)
  - [ ] Tests AlgoliaSearchBox (35+ tests)
  - [ ] Tests auth (10+ tests)

- [ ] **4.4** Lighthouse audit
  - [ ] Performance >90
  - [ ] Accessibility >90
  - [ ] Best Practices >90
  - [ ] SEO >90

- [ ] **4.5** Test navigation
  - [ ] Landing page
  - [ ] Sign up / Sign in
  - [ ] Dashboard Client
  - [ ] Dashboard Pro
  - [ ] Dashboard Senior
  - [ ] Profile / Settings
  - [ ] AccountType change

- [ ] **4.6** Test Algolia search
  - [ ] Recherche tasks
  - [ ] Typo tolerance
  - [ ] Highlighting
  - [ ] Recent searches
  - [ ] Navigation résultats

- [ ] **4.7** Test graceful degradation
  - [ ] Sans Algolia (badge affiché)
  - [ ] Sans Firebase (fallback mock data)

**Commandes:**
```bash
pnpm build && pnpm test && pnpm test:e2e
```

---

## 📝 5. Documentation (0/4)

### Fichiers à vérifier

- [ ] **5.1** README.md
  - [ ] Instructions setup
  - [ ] Variables d'environnement listées
  - [ ] Commandes principales

- [ ] **5.2** ROADMAP.md
  - [ ] MVP V1.0 marqué comme complété

- [ ] **5.3** Guides utilisateurs
  - [ ] `/docs/QUICK_START_GUIDE.md`
  - [ ] `/docs/TESTING_GUIDE_NEW_FEATURES.md`

- [ ] **5.4** Guides déploiement
  - [ ] `/docs/ALGOLIA_PRODUCTION_INDEXATION.md`
  - [ ] `.env.production` template

---

## 🔒 6. Sécurité (0/6)

### Audit sécurité

- [ ] **6.1** Variables d'environnement
  - [ ] Toutes les clés privées sont server-side (pas de NEXT_PUBLIC_)
  - [ ] Admin API Key Algolia jamais exposée côté client
  - [ ] Firebase Admin SDK credentials sécurisées

- [ ] **6.2** Firestore Rules
  - [ ] Authentification requise pour lecture/écriture
  - [ ] Users peuvent uniquement modifier leurs propres données
  - [ ] Validation des données (types, longueurs)

- [ ] **6.3** Storage Rules
  - [ ] Upload photos limité aux users authentifiés
  - [ ] Taille max fichiers : 5MB
  - [ ] Types autorisés : image/jpeg, image/png, image/webp

- [ ] **6.4** CORS
  - [ ] Configured pour domaine production uniquement
  - [ ] Pas de wildcard `*`

- [ ] **6.5** Rate limiting
  - [ ] Vercel rate limit configuré
  - [ ] Algolia quota monitoring

- [ ] **6.6** Content Security Policy
  - [ ] CSP headers configurés (next.config.mjs)

---

## 📊 7. Monitoring & Analytics (0/4)

### Outils de monitoring

- [ ] **7.1** Firebase Analytics
  - [ ] Events tracking configuré
  - [ ] Dashboards créés

- [ ] **7.2** Vercel Analytics
  - [ ] Web Vitals tracking activé
  - [ ] Custom events configurés

- [ ] **7.3** Algolia Analytics
  - [ ] Dashboard configuré
  - [ ] Alertes quotas (>80%)

- [ ] **7.4** Error tracking
  - [ ] Sentry ou équivalent (optionnel)

---

## 🚀 8. Déploiement final (0/5)

### Go Live

- [ ] **8.1** Code review final
  - [ ] Pull request approuvée
  - [ ] 0 erreur TypeScript
  - [ ] 0 warning ESLint

- [ ] **8.2** Merge to main
  ```bash
  git checkout main
  git pull origin main
  git merge develop
  git push origin main
  ```

- [ ] **8.3** Vérifier déploiement Vercel
  - [ ] Build success
  - [ ] Deployment URL active
  - [ ] Domaine custom configuré

- [ ] **8.4** Tests post-déploiement
  - [ ] Landing page charge
  - [ ] Sign up fonctionne
  - [ ] Dashboards chargent
  - [ ] Recherche Algolia fonctionne
  - [ ] Upload photo fonctionne

- [ ] **8.5** Monitoring 24h
  - [ ] Vérifier erreurs console
  - [ ] Vérifier quotas Algolia
  - [ ] Vérifier usage Firebase

---

## 🔄 9. Post-déploiement (0/5)

### Optimisations continues

- [ ] **9.1** Configurer Firestore Triggers
  - [ ] Sync Algolia on task create/update/delete
  - [ ] Sync users
  - [ ] Sync services

- [ ] **9.2** Configurer Cron jobs
  - [ ] Réindexation hebdomadaire Algolia (dimanche 2h)
  - [ ] Backup Firestore quotidien

- [ ] **9.3** Documentation équipe
  - [ ] Onboarding nouveaux développeurs
  - [ ] Guide contribution

- [ ] **9.4** Communication utilisateurs
  - [ ] Annonce lancement
  - [ ] Guide premiers pas
  - [ ] Support email configuré

- [ ] **9.5** Plan de rollback
  - [ ] Branch `main-stable` créée
  - [ ] Procédure rollback documentée

---

## 📈 10. KPIs à monitorer (0/0)

### Metrics importantes

**Performance:**
- [ ] Latence Algolia : <20ms (p50)
- [ ] Latence Algolia : <50ms (p95)
- [ ] Page load : <2s
- [ ] Core Web Vitals : "Good" (>75%)

**Usage:**
- [ ] Utilisateurs actifs quotidiens (DAU)
- [ ] Taux conversion sign up
- [ ] Tâches créées / jour
- [ ] Recherches Algolia / jour

**Quotas:**
- [ ] Algolia : <80% quota gratuit (10k recherches/mois)
- [ ] Firebase : <80% quotas gratuits
- [ ] Vercel : bandwidth <80%

**Erreurs:**
- [ ] Taux erreur <1%
- [ ] 0 erreur critique
- [ ] Temps résolution <24h

---

## 🎯 Critères de succès

### Must-have avant Go Live

✅ **Tous les tests passent** (unitaires + e2e)  
✅ **0 erreur TypeScript**  
✅ **Firestore + Storage configurés**  
✅ **Algolia indexation complétée**  
✅ **Variables environnement configurées Vercel**  
✅ **Domaine custom + SSL**  
✅ **Documentation complète**  
✅ **Monitoring configuré**

### Nice-to-have (post-launch)

🔲 Firestore Triggers pour sync temps réel  
🔲 Cron job réindexation hebdomadaire  
🔲 Error tracking (Sentry)  
🔲 A/B testing placeholders recherche  
🔲 Cache Redis pour Algolia results  

---

## 📞 Support & Escalation

**En cas de problème:**

1. **Consulter documentation** :
   - `/docs/TROUBLESHOOTING.md`
   - `/docs/ALGOLIA_PRODUCTION_INDEXATION.md`

2. **Vérifier logs** :
   - Vercel dashboard > Logs
   - Firebase Console > Logs
   - Algolia dashboard > Logs

3. **Rollback si nécessaire** :
   ```bash
   git revert HEAD
   git push origin main
   ```

4. **Contact support** :
   - Vercel Support (plan Pro)
   - Algolia Support (plans payants)
   - Firebase Support (Google Cloud)

---

## 🎉 Finalisation

### Après complétion de TOUTES les tâches

- [ ] **Tous les checkboxes cochés** (40/40)
- [ ] **Tests post-déploiement passés**
- [ ] **Monitoring actif et stable**
- [ ] **Communication équipe envoyée**
- [ ] **Annonce utilisateurs programmée**

**Status** : 🟢 **PRODUCTION LIVE !** 🚀

---

**Checklist mise à jour le** : 26 Octobre 2025  
**Responsable déploiement** : [Nom]  
**Date Go Live prévue** : [Date]
