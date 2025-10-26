# 🚀 Guide de Déploiement Rapide - ImuTask MVP V1.0

**Version**: MVP V1.0  
**Status**: ✅ Production Ready  
**Date**: 26 Octobre 2025

---

## ⚡ Déploiement en 5 étapes (< 30 minutes)

### Étape 1: Préparer Firebase (5 min)

```bash
# 1. Créer projet Firebase Production
# https://console.firebase.google.com

# 2. Activer les services
- Authentication (Email/Password)
- Firestore Database
- Storage
- Analytics

# 3. Récupérer credentials
# Project Settings > General > Your apps > Web app
```

**Copier dans `.env.local` :**

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

---

### Étape 2: Configurer Algolia (10 min)

```bash
# 1. Créer compte Algolia (gratuit)
# https://www.algolia.com/users/sign_up

# 2. Créer application "ImuTask Production"
# Region: Europe (eu)

# 3. Récupérer credentials
# Settings > API Keys
```

**Copier dans `.env.local` :**

```env
NEXT_PUBLIC_ALGOLIA_APP_ID=your_app_id
NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY=your_search_key
ALGOLIA_ADMIN_API_KEY=your_admin_key  # ⚠️ Privée!
```

**Lancer l'indexation initiale :**

```bash
pnpm algolia:index
```

**Résultat attendu :**

```
✅ Tasks indexés: 1,234 documents
✅ Users indexés: 567 documents
✅ Services indexés: 42 documents
✅ Indexation terminée! Total: 1,843 documents
```

---

### Étape 3: Déployer sur Vercel (10 min)

```bash
# 1. Installer Vercel CLI (si nécessaire)
npm i -g vercel

# 2. Login Vercel
vercel login

# 3. Importer projet
vercel
# Suivre les prompts:
# - Link to existing project? No
# - Project name: imu-task-production
# - Directory: ./
```

**Configurer variables d'environnement Vercel :**

```bash
# Settings > Environment Variables
# Copier TOUTES les variables de .env.local
# Scope: Production
```

**Déployer :**

```bash
vercel --prod
```

---

### Étape 4: Tests post-déploiement (3 min)

```bash
# Ouvrir l'URL de production
# Exemple: https://imu-task-production.vercel.app

# Vérifier:
✓ Landing page charge
✓ Sign up fonctionne
✓ Dashboard charge (client/pro/senior)
✓ Recherche Algolia fonctionne (<20ms)
✓ Upload photo fonctionne
```

---

### Étape 5: Monitoring (2 min)

**Dashboards à surveiller :**

1. **Vercel** : https://vercel.com/dashboard
   - Deployments
   - Analytics
   - Logs

2. **Algolia** : https://www.algolia.com/dashboard
   - Usage (recherches/mois)
   - Latency
   - Quotas

3. **Firebase** : https://console.firebase.google.com
   - Authentication (users)
   - Firestore (documents)
   - Storage (photos)
   - Analytics (events)

---

## 📋 Checklist Complète

Pour un déploiement complet avec toutes les vérifications :

👉 **Voir** : `/docs/DEPLOYMENT_CHECKLIST.md` (40 tâches)

---

## 🆘 Troubleshooting

### Problème 1: Build échoue sur Vercel

**Symptôme** : `Error: Build failed`

**Solution** :
```bash
# Vérifier localement
pnpm build

# Si erreurs TypeScript
pnpm type-check

# Si erreurs dépendances
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

---

### Problème 2: Algolia ne fonctionne pas

**Symptôme** : Badge "Algolia non configuré" affiché

**Solution** :
1. Vérifier variables Vercel (NEXT_PUBLIC_ALGOLIA_APP_ID, etc.)
2. Relancer indexation : `pnpm algolia:index`
3. Vérifier dashboard Algolia : 3 indices avec données

---

### Problème 3: Firebase authentication échoue

**Symptôme** : Impossible de sign up/login

**Solution** :
1. Vérifier Firebase Authentication activé
2. Vérifier Email/Password provider activé
3. Vérifier credentials Vercel (NEXT_PUBLIC_FIREBASE_*)

---

## 📚 Documentation

### Guides complets

- **Indexation Algolia** : `/docs/ALGOLIA_PRODUCTION_INDEXATION.md` (500+ lignes)
- **Checklist déploiement** : `/docs/DEPLOYMENT_CHECKLIST.md` (40 tâches)
- **Troubleshooting** : `/docs/TROUBLESHOOTING.md`
- **Configuration .env** : `/.env.production` (template)

### Récapitulatifs

- **Session finale** : `/docs/MVP_V1.0_FINALE_COMPLETE.md` (1,500+ lignes)
- **Récap visuel** : `/docs/MVP_V1.0_RECAP_VISUAL.md`

---

## 🎯 KPIs Post-Launch (Premier Mois)

### Objectifs

```
┌────────────────────────────┬─────────────┐
│ Metric                     │ Target      │
├────────────────────────────┼─────────────┤
│ Utilisateurs actifs (DAU)  │ 100+        │
│ Tâches créées / jour       │ 50+         │
│ Recherches Algolia / jour  │ 200+        │
│ Taux conversion signup     │ >10%        │
│ Performance (Lighthouse)   │ >90         │
│ Algolia latency (p50)      │ <20ms       │
└────────────────────────────┴─────────────┘
```

---

## 🎉 Félicitations !

Si vous avez suivi les 5 étapes, votre application est maintenant **LIVE en production** ! 🚀

**Prochaines étapes :**

1. ✅ Monitoring quotidien (Vercel + Algolia + Firebase)
2. ✅ Configurer Firestore Triggers pour sync temps réel
3. ✅ Configurer Cron job réindexation hebdomadaire
4. ✅ Optimisations continues (cache, CDN, etc.)
5. ✅ Marketing et acquisition utilisateurs ! 📣

---

**Besoin d'aide ?**

- 📖 Documentation : `/docs/`
- 🐛 Troubleshooting : `/docs/TROUBLESHOOTING.md`
- 💬 Support : [Votre email support]

---

**Déployé avec ❤️ par l'équipe ImuTask**
