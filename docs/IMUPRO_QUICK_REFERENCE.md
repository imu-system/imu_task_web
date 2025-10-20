# 🎯 ImuPro - Quick Reference Guide

## 📍 État Actuel

**Phase** : Tâche 4 terminée (40% du projet)  
**Prochaine** : Tâche 5 - Système de devis  
**Date** : 20 octobre 2025

---

## 🗂️ Structure du Projet

### Backend (functions/src/)

```
types/
├── kyb.ts (180 lignes)
│   ├── KYBDocumentType (10 types de docs)
│   ├── BusinessType (6 statuts juridiques)
│   ├── ProServiceCategory (10 catégories)
│   └── ProVerificationStatus (6 états)
│
├── pro-profile.ts (280 lignes)
│   ├── PortfolioItem (title, images, category, featured)
│   ├── ProBadges (7 badges)
│   ├── PricingModel (fixed/hourly/quote)
│   ├── WorkingHours, ServiceArea, ProStats
│   └── ProProfile (interface principale)
│
└── quote-invoice.ts (260 lignes)
    ├── QuoteStatus (7 états)
    ├── PaymentTerms (6 options)
    ├── InvoiceStatus (7 états)
    ├── Quote (lineItems, workflow)
    └── Invoice (seller/buyer, legal)

kyb/
└── kyb-validation.ts (480 lignes)
    ├── submitKYB() → Soumission pro
    ├── approveKYB() → Validation admin
    ├── rejectKYB() → Rejet avec raison
    ├── listKYBSubmissions() → Liste admin
    └── verifySiret() → Validation SIRET
```

### Frontend (src/app/[locale]/)

```
dashboard/
├── become-pro/
│   └── page.tsx (1200 lignes) ✅
│       └── Wizard 8 étapes inscription
│
└── pro/
    ├── page.tsx (800 lignes) ✅
    │   └── Dashboard KPI + tabs
    │
    └── portfolio/
        └── page.tsx (900 lignes) ✅
            └── Gestion réalisations

pro/
└── [userId]/
    └── page.tsx (800 lignes) ✅
        └── Profil public client
```

---

## 🔑 Collections Firestore

```
kyb_submissions/
├── {submissionId}
│   ├── userId: string
│   ├── businessInfo: BusinessInfo
│   ├── documents: DocumentUpload[]
│   ├── insurance: ProfessionalInsurance
│   ├── certifications: Certification[]
│   ├── requestedCategories: string[]
│   ├── status: ProVerificationStatus
│   ├── submittedAt: Timestamp
│   └── reviewedBy?: string

pro_profiles/
├── {userId}
│   ├── userId: string
│   ├── businessInfo: BusinessInfo
│   ├── verificationStatus: "verified"
│   ├── categories: string[]
│   ├── badges: ProBadges
│   ├── portfolio: PortfolioItem[]
│   ├── stats: ProStats
│   ├── pricing?: PricingModel
│   ├── workingHours?: WorkingHours
│   ├── serviceArea?: ServiceArea
│   └── subscription: { tier, startDate }

siret_cache/
├── {siret}
│   ├── isValid: boolean
│   ├── companyName?: string
│   ├── verifiedAt: Timestamp
│   └── expiresAt: Timestamp
```

---

## 🚀 Workflows Utilisateur

### 1. Inscription Professionnelle

```
User → /dashboard/become-pro
  │
  ├─ Étape 1: Infos entreprise + SIRET
  ├─ Étape 2: Adresse et contact
  ├─ Étape 3: Catégories (10 choix)
  ├─ Étape 4: Assurance RC Pro
  ├─ Étape 5: Certifications
  ├─ Étape 6: Upload docs (KBIS, RC Pro, ID)
  ├─ Étape 7: Description
  └─ Étape 8: Récap + CGU
       │
       └─ submitKYB() → kyb_submissions
            │
            └─ Notification admin
```

### 2. Validation Admin (Tâche 8 - à créer)

```
Admin → /dashboard/admin/kyb
  │
  ├─ Liste des soumissions
  │   └─ Filtres: status, date, businessType
  │
  └─ Clic sur soumission
       │
       └─ /dashboard/admin/kyb/{id}
            │
            ├─ Vue documents (PDF/images)
            ├─ Détails business
            │
            └─ Actions:
                 ├─ Approuver → approveKYB()
                 │   └─ Création pro_profiles
                 │       └─ Badge "Vérifié"
                 │           └─ Notification user
                 │
                 └─ Rejeter → rejectKYB()
                     └─ Raison obligatoire
                         └─ Notification user
```

### 3. Dashboard Professionnel

```
Pro → /dashboard/pro
  │
  ├─ 4 KPI Cards
  │   ├─ Revenus ce mois (+/-% vs dernier)
  │   ├─ Missions actives
  │   ├─ Note moyenne ⭐
  │   └─ Taux d'acceptation
  │
  ├─ 3 Tabs
  │   ├─ Devis récents
  │   ├─ Missions (total/complétées/annulées)
  │   └─ Revenus (total/mois/moyenne)
  │
  ├─ Actions rapides
  │   ├─ Portfolio → /dashboard/pro/portfolio
  │   ├─ Devis → /dashboard/pro/quotes
  │   ├─ Agenda → /dashboard/pro/calendar
  │   └─ Messages → /dashboard/messages
  │
  └─ Abonnement
      └─ Basic/Premium/Enterprise
```

### 4. Gestion Portfolio

```
Pro → /dashboard/pro/portfolio
  │
  ├─ 3 KPI Cards
  │   ├─ Total (X/20)
  │   ├─ Featured (⭐)
  │   └─ Images (total)
  │
  └─ Grid réalisations
       │
       ├─ Ajouter nouvelle
       │   └─ Dialog form:
       │       ├─ Titre, description
       │       ├─ Catégorie, date
       │       ├─ Upload images (max 5)
       │       ├─ Témoignage client
       │       ├─ Tags
       │       └─ ☑ Featured
       │
       ├─ Éditer existante
       │   └─ Même form pré-rempli
       │
       ├─ Toggle featured
       │   └─ Eye/EyeOff icon
       │
       └─ Supprimer
           └─ AlertDialog confirmation
```

### 5. Profil Public

```
Client → /pro/{userId}
  │
  ├─ Header
  │   ├─ Avatar + Nom entreprise
  │   ├─ Badges (✅ Vérifié, ⭐ Top Rated)
  │   ├─ Catégories
  │   ├─ Stats (note, missions, temps réponse)
  │   └─ CTAs (Demander devis, Appeler)
  │
  ├─ Main Content
  │   ├─ À propos (description)
  │   ├─ Portfolio (4 featured + "+X more")
  │   └─ Avis (10 derniers)
  │
  └─ Sidebar
      ├─ Tarification (€/h ou sur devis)
      ├─ Zone d'intervention
      ├─ Horaires (lun-dim)
      ├─ Certifications
      ├─ Contact (tel, email)
      └─ Légal (SIRET, RC Pro)
```

---

## 🔧 Commandes Utiles

### Development

```bash
# Démarrer le dev server
pnpm dev

# Build production
pnpm build

# Lint
pnpm lint

# Tests (à créer)
pnpm test
```

### Firebase

```bash
# Deploy functions
firebase deploy --only functions

# Deploy tout
firebase deploy

# Voir logs
firebase functions:log
```

---

## 📝 Checklist Avant Tâche 5

- [x] Backend types complets (kyb, pro-profile, quote-invoice)
- [x] Cloud Functions KYB (submit, approve, reject, list)
- [x] Page inscription pro (8 étapes)
- [x] Dashboard pro (KPI + tabs)
- [x] Profil public (badges + portfolio)
- [x] Gestion portfolio (CRUD + images)
- [ ] Cloud Functions quotes (create, send, accept, decline)
- [ ] Page création devis
- [ ] Page liste devis
- [ ] Page vue client devis
- [ ] Workflow notifications devis

---

## 🎨 Design Tokens

### Colors

- **Primary** : ImuPro brand color
- **Success** : Green (#22c55e) - Verified badge
- **Warning** : Yellow (#eab308) - Featured items
- **Destructive** : Red (#ef4444) - Delete actions

### Components

- **Cards** : border, rounded-lg, shadow-sm
- **Buttons** : primary, outline, ghost, destructive
- **Badges** : default, secondary, outline, destructive
- **Inputs** : border, focus:ring-2, focus:ring-primary

### Icons (lucide-react)

Plus, Edit, Trash2, Upload, X, Star, Eye, EyeOff, Award, ShieldCheck, Building2, Euro, MapPin, Clock, CheckCircle2, AlertCircle, Loader2, ArrowLeft, FileText, Phone, MessageSquare, Calendar, TrendingUp, Briefcase, DollarSign

---

## 📚 Documentation

1. **IMUPRO_PHASE1_INFRASTRUCTURE.md** : Backend (tâches 1-3)
2. **IMUPRO_SESSION1_RECAP.md** : Récap session backend
3. **IMUPRO_SESSION2_UI_UX.md** : UI/UX complète (tâche 4)
4. **IMUPRO_TASK4_COMPLETED.md** : Résumé tâche 4
5. **IMUPRO_PROJECT_STATUS.md** : État global projet
6. **IMUPRO_QUICK_REFERENCE.md** : Ce fichier

---

## 🚦 Next Steps

### Immédiat (Tâche 5)

1. Créer `functions/src/quotes/quotes-management.ts`
2. Implémenter `createQuote()`, `sendQuote()`, `acceptQuote()`, `declineQuote()`
3. Créer `/dashboard/pro/quotes/new/page.tsx`
4. Créer `/dashboard/pro/quotes/page.tsx`
5. Créer `/dashboard/quotes/[id]/page.tsx`
6. Tester workflow complet

### Court terme (Tâches 6-7)

- Upload factures (tâche 6)
- Onboarding pro (tâche 7)

### Moyen terme (Tâches 8-9)

- Interface admin (tâche 8)
- CGU et légal (tâche 9)

### Avant Production (Tâche 10)

- Tests E2E complets
- Tests performance
- Validation MVP

---

**Prêt à démarrer la Tâche 5** 🚀
