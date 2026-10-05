# ImuTask - Web Application

**Version:** 0.2.0  
**Statut:** � Prêt pour staging (13/15 fonctionnalités complètes)  
**Dernière mise à jour:** 17 octobre 2025 - Partie 2

Une plateforme web moderne de mise en relation pour **micro-services de proximité**, construite avec Next.js 15 et Firebase.

ImuTask connecte des **jeunes motivés** (étudiants, auto-entrepreneurs) avec des **particuliers** ayant besoin d'aide ponctuelle pour des tâches du quotidien : courses, montage de meubles, aide numérique, jardinage, et bien plus.

---

## � Nouveautés - Session du 17 octobre 2025

### 1. Règles de Sécurité Firestore & Storage

- Configuration complète des règles pour la collection `kyc_submissions`
- Règles Storage pour documents KYC avec validation taille/type
- Isolation des données utilisateurs + contrôle d'accès admin

### 2. Tests E2E pour Flux KYC

- 10 scénarios de test Playwright créés
- Couverture complète : soumission → approbation/rejet → vérification
- Gestion des erreurs (Storage, timeout, validation)
- Fixtures générées automatiquement

### 3. Catalogue de Services UI

- **8 catégories de services** avec métadonnées complètes
- **16 templates pré-remplis** pour création rapide de tâches
- **Wizard 3 étapes** : Catégorie → Template → Détails
- Composants réutilisables : `ServiceCategorySelector`, `TaskTemplates`
- Interface responsive et moderne

 **Guide de test** : [TESTING_GUIDE_NEW_FEATURES.md](docs/TESTING_GUIDE_NEW_FEATURES.md)

---

## À propos du projet

ImuTask permet aux utilisateurs de:

- Poster des tâches avec descriptions détaillées et budgets
- Choisir parmi 8 catégories de services avec templates
- Trouver des prestataires qualifiés automatiquement
- Communiquer directement via messagerie intégrée
- Gérer les paiements de manière sécurisée
- Évaluer et être évalué après chaque mission
- Système KYC pour devenir prestataire vérifié

---

## Démarrage rapide

### Prérequis

- Node.js 20+
- pnpm (recommandé) ou npm
- Compte Firebase (pour la configuration backend)

### Installation

```bash
# Cloner le repo
git clone https://github.com/imu-system/imu_task_web.git
cd imu_task_web

# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env.local
# Puis éditer .env.local avec vos clés Firebase

# Lancer en mode développement
npm run dev
```

L'application sera disponible sur [http://localhost:9002](http://localhost:9002)

---

## Documentation

La documentation complète du projet se trouve dans le dossier `/docs`:

### Commencer Ici

- **[QUICK_START_GUIDE.md](./docs/QUICK_START_GUIDE.md)** ⚡ — Guide complet pour nouveaux développeurs
- **[GETTING_STARTED.md](./docs/GETTING_STARTED.md)** — Setup environnement de développement
- **[PROJECT_SUMMARY.md](./docs/PROJECT_SUMMARY.md)** — Synthèse exécutive et métriques

### Produit & Stratégie

- **[PRODUCT_VISION.md](./docs/PRODUCT_VISION.md)** — Vision produit, business model, personas
- **[SERVICES_CATALOG.md](./docs/SERVICES_CATALOG.md)** 🆕 — Catalogue détaillé des 8 catégories de services MVP
- **[IMUPRO_VISION.md](./docs/IMUPRO_VISION.md)** 🆕 — Roadmap V2 : Services professionnels certifiés
- **[ROADMAP.md](./docs/ROADMAP.md)** — Feuille de route développement (phases MVP→V2)

### Fonctionnalités Clés

- **[KYC_INTEGRATION_COMPLETED.md](./docs/KYC_INTEGRATION_COMPLETED.md)** 🆕 — Système de validation KYC complet
- **[FIREBASE_SETUP.md](./docs/FIREBASE_SETUP.md)** — Configuration Firebase complète
- **[TECHNICAL_ARCHITECTURE.md](./docs/TECHNICAL_ARCHITECTURE.md)** — Architecture technique

### Sessions & Changelog

- **[SESSION_2025-10-17_KYC_AND_DOCS.md](./docs/SESSION_2025-10-17_KYC_AND_DOCS.md)** 🆕 — Dernière session de dev
- **[TASKS_TODO.md](./docs/TASKS_TODO.md)** — Tâches prioritaires et sprints
- **[INDEX.md](./docs/INDEX.md)** — Index de toute la documentation

### Quick Start

```bash
# 1. Installer dépendances
pnpm install

# 2. Configuration Firebase
cp .env.example .env.local
# Éditer .env.local avec vos clés Firebase

# 3. Lancer le serveur
pnpm dev
# → http://localhost:9002
```

**Voir:** [docs/NEXT_STEPS.md](./docs/NEXT_STEPS.md) pour les actions prioritaires

---

## Stack technique

- **Framework:** Next.js 15 (App Router)
- **Langage:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui (Radix UI)
- **Backend:** Firebase (Auth, Firestore, Storage)
- **AI:** Genkit (Google Gemini)
- **Internationalisation:** next-intl (5 langues: en, fr, de, es, ja)
- **Forms:** React Hook Form + Zod
- **Charts:** Recharts

---

## Structure du projet

```txt
imu_task_web/
├── docs/                   # Documentation complète
│   ├── INDEX.md            # Point d'entrée
│   ├── ROADMAP.md          # Feuille de route
│   ├── BUGS_AND_ISSUES.md  # Tracker de bugs
│   ├── FIREBASE_SETUP.md   # Guide Firebase
│   └── WEB_MOBILE_SYNC.md  # Sync web/mobile
│
├── public/                  # Assets statiques
│   ├── locales/            # Fichiers de traduction (5 langues)
│   └── icons/              # Icônes et images
│
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── [locale]/       # Routes internationalisées
│   │   └── api/            # API routes
│   │
│   ├── components/         # Composants React
│   │   ├── ui/             # shadcn/ui components
│   │   └── dashboards/     # Dashboards client/provider
│   │
│   ├── features/           # Features organisées par domaine
│   │   ├── auth/           # Authentification
│   │   ├── tasks/          # Gestion des tâches
│   │   ├── chat/           # Messagerie
│   │   ├── payments/       # Paiements
│   │   └── ...
│   │
│   ├── lib/                # Utilitaires et helpers
│   │   ├── firebase.ts     # Config Firebase
│   │   ├── types.ts        # Types TypeScript
│   │   └── utils.ts        # Fonctions utilitaires
│   │
│   └── ai/                 # Genkit AI flows
│
└── ...
```

---

## Progression actuelle

**Globale: 19.5%**

- ✅ **Phase 1 - Fondations:** 80%
- 🟡 **Phase 2 - Authentification:** 30%
- 🟡 **Phase 3 - Tâches:** 40%
- 🔴 **Phases 4-10:** En planification

Consultez [ROADMAP.md](./docs/ROADMAP.md) pour les détails complets.

---

## Bugs connus

**Critiques (à corriger en priorité):**

1. Configuration Firebase manquante
2. Pages d'authentification non fonctionnelles
3. Formulaire de tâches non connecté à la base de données

Voir [BUGS_AND_ISSUES.md](./docs/BUGS_AND_ISSUES.md) pour la liste complète.

---

## Contribution

### Pour contribuer

1. Lire la [documentation](./docs/INDEX.md)
2. Choisir une tâche dans [BUGS_AND_ISSUES.md](./docs/BUGS_AND_ISSUES.md)
3. Créer une branche: `feature/web-nom-de-la-feature`
4. Développer et tester
5. Soumettre une Pull Request

### Conventions de commits

```
[web] type: Description

Exemples:
[web] feat: Add task creation form
[web] fix: Fix login button styling
[web] docs: Update Firebase setup guide
```

---

## Liens utiles

- **Version mobile:** `/Users/nathanimogo/Documents/GitHub/imu_task_mobile`
- **Firebase Console:** [https://console.firebase.google.com/](https://console.firebase.google.com/)
- **Documentation Next.js:** [https://nextjs.org/docs](https://nextjs.org/docs)
- **Documentation Firebase:** [https://firebase.google.com/docs](https://firebase.google.com/docs)

---

## Scripts disponibles

```bash
# Développement
npm run dev              # Lancer le serveur de dev (port 9002)
npm run build            # Build pour production
npm run start            # Lancer en mode production
npm run lint             # Linter le code

# Genkit AI
npm run genkit:dev       # Lancer Genkit en mode dev
npm run genkit:watch     # Lancer Genkit avec auto-reload

# Type checking
npm run typecheck        # Vérifier les types TypeScript
```

---

## Langues supportées

- 🇬🇧 English (en)
- 🇫🇷 Français (fr)
- 🇩🇪 Deutsch (de)
- 🇪🇸 Español (es)
- 🇯🇵 日本語 (ja)

---

## License

[À définir]

---

## Contact

Pour toute question, consulter la documentation dans `/docs` ou créer une issue GitHub.

---

**Développé avec ❤️ par l'équipe ImuTask**
