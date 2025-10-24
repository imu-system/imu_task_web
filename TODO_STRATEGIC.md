# 📋 TODO STRATÉGIQUE - ImuTask Ecosystem
**Date de création** : 24 octobre 2025  
**Vision** : Écosystème complet de services locaux pour tous les besoins

---

## 🎯 VISION GLOBALE DES 3 PLATEFORMES

```
┌─────────────────────────────────────────────────────────────────┐
│                    IMUTASK ECOSYSTEM                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │   ImuTask    │  │   ImuPro     │  │  CareLink    │        │
│  │   (V1.0)     │  │   (V2.0)     │  │   (V2.5)     │        │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤        │
│  │ Micro-tâches │  │ Services Pro │  │ Maintien à   │        │
│  │ Particuliers │  │ Certifiés    │  │ domicile     │        │
│  │              │  │              │  │              │        │
│  │ Étudiants    │  │ Artisans     │  │ Personnes    │        │
│  │ Jobbers      │  │ Auto-entre   │  │ âgées, PMR   │        │
│  │ Entraide     │  │ TPE/PME      │  │ Malades      │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
│                                                                 │
│  Panier moyen:     Panier moyen:     Panier moyen:            │
│  30-100€           200-1000€          50-200€/mois             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 PHASE ACTUELLE : MVP ImuTask (V1.0) - Q4 2025

### ✅ COMPLÉTÉ (Landing Page Optimization)

- [x] **Phase 1 - Nettoyage** : Suppression duplications (-40 lignes)
- [x] **Phase 2 - Unification Catégories** : Single source of truth (categories.ts)
- [x] **Phase 3 - Modernisation Features** : Hover effects, gradients
- [x] **Phase 4 - Consolidation Traductions** : LandingPage namespace unique
- [x] **Phase 5 - Polish Final** : Empty states, responsive check
- [x] **Correction Runtime Error** : Tasks Grid sans AuthProvider

### 🔥 EN COURS (Priorité Immédiate)

#### 1. Landing Page - Segmentation par Profils Utilisateurs
**Objectif** : Mettre en évidence les 3 segments sur la landing page actuelle

- [ ] **Ajouter section "Pour qui ?" après Hero** (30 min)
  - 3 cartes cliquables : "Particuliers", "Professionnels", "Seniors & Aidants"
  - Chaque carte redirige vers section dédiée ou page spécifique
  - Design : Cards avec gradients, icons, CTA clair

- [ ] **Créer Hero variant "Seniors"** (45 min)
  - Texte adapté : "Services à domicile pour votre bien-être"
  - Visuel : Photos de seniors souriants
  - CTA : "Découvrir nos services pour seniors"
  - Catégories prioritaires : Aide à domicile, Repas, Accompagnement

- [ ] **Badge "Certifié PMR" sur catégories** (20 min)
  - Ajouter propriété `isAccessible: boolean` dans categories.ts
  - Afficher badge ♿ sur catégories adaptées
  - Filtrage optionnel "Services PMR uniquement"

- [ ] **Section "CareLink Preview" sur landing** (1h)
  - Titre : "Besoin de services pour un proche ?"
  - 4 services phares : Repas à domicile, Aide ménagère, Accompagnement, Téléassistance
  - CTA : "En savoir plus sur CareLink" → Page dédiée (TODO V2.5)

**Traductions à ajouter (fr.json)** :
```json
"LandingPage": {
  "profiles": {
    "title": "Qui êtes-vous ?",
    "subtitle": "Choisissez le profil qui vous correspond",
    "individual": {
      "title": "Particulier",
      "description": "Trouvez de l'aide pour vos petites tâches du quotidien",
      "cta": "Découvrir les services"
    },
    "professional": {
      "title": "Professionnel",
      "description": "Développez votre activité avec des clients locaux",
      "cta": "Devenir prestataire pro"
    },
    "senior": {
      "title": "Senior ou Aidant",
      "description": "Services adaptés pour le maintien à domicile",
      "cta": "Voir les services seniors"
    }
  },
  "carelink": {
    "badge": "Bientôt disponible",
    "title": "CareLink - Services pour seniors",
    "subtitle": "Une plateforme dédiée au bien-être à domicile",
    "services": {
      "meals": "Repas à domicile",
      "help": "Aide ménagère",
      "companion": "Accompagnement",
      "telecare": "Téléassistance"
    },
    "cta": "Découvrir CareLink"
  }
}
```

#### 2. Fix TypeScript Errors Restantes (26 erreurs)
**Priorité** : Haute (bloquant pour production)

- [ ] **Triage des 26 erreurs** (30 min)
  - Catégoriser par type (roles, KYCStatus, types, assertions)
  - Prioriser les erreurs critiques (dashboard, auth)

- [ ] **Résolution systématique** (1-2h)
  - Approche identique aux 200+ erreurs précédentes
  - Tests après chaque fix

---

## 📅 ROADMAP V1.0 - MVP ImuTask (Q4 2025 - Q1 2026)

### Priorité #1 : Fondations Critiques

#### A. Profil Utilisateur & Firebase (Semaine 1-2)
- [ ] **Sauvegarde Profil Utilisateur** (2h)
  - Implémenter `updateUserProfile` dans edit/page.tsx
  - Connexion Firestore collection `profiles`
  - Gestion états loading/error

- [ ] **Upload Photo de Profil** (3h)
  - Intégration Firebase Storage
  - Path : `users/{uid}/profile.jpg`
  - Update `photoUrl` dans Firestore
  - Optimisation images (resize, compression)

- [ ] **KYC - Vérification Identité** (5h)
  - Upload documents KYC vers Storage
  - Sous-collection `kyc_attempts` dans Firestore
  - États : pending, approved, rejected
  - Interface admin de validation

#### B. UX Dashboard (Semaine 2-3)
- [ ] **Refonte Navigation Admin** (4h)
  - Groupes Collapsible : Communauté, Modération, Finance, Config
  - Auto-expand du groupe actif
  - Compteurs de notifications

- [ ] **Modales au lieu de Pages** (6h)
  - Create Task → Dialog modal
  - Edit Task → Sheet/Drawer
  - Quick actions : Accept offer, Send message

### Priorité #2 : Fonctionnalités Core (Semaine 3-6)

#### A. Système d'Offres
- [ ] **Interface Prestataire** (4h)
  - Formulaire soumission offre (prix, délai, message)
  - Historique offres envoyées
  - Notifications acceptation/refus

- [ ] **Interface Client** (3h)
  - Liste offres reçues par task
  - Comparaison offres (prix, profil, avis)
  - Bouton "Accepter l'offre" → Création Booking

#### B. Messagerie Temps Réel
- [ ] **Thread Creation** (3h)
  - Auto-création thread lors de Booking
  - Participants : client + prestataire

- [ ] **Interface Chat** (6h)
  - UI type WhatsApp/Messenger
  - Envoi messages + attachments
  - Notifications push temps réel
  - Status "lu/non lu"

#### C. Paiements Stripe
- [ ] **Stripe Connect Onboarding** (8h)
  - Création comptes Connect pour prestataires
  - KYC/KYB via Stripe
  - Dashboard revenus prestataires

- [ ] **Payment Flow** (6h)
  - Autorisation paiement lors de Booking
  - Séquestre (escrow)
  - Capture après validation mission
  - Calcul commission plateforme

#### D. Avis & Litiges
- [ ] **Système d'Avis** (4h)
  - Formulaire review (note + commentaire)
  - Mutual review (client → prestataire, prestataire → client)
  - Affichage moyenne avis profil

- [ ] **Gestion Litiges** (5h)
  - Ouverture litige par client ou prestataire
  - Interface admin médiation
  - Workflow : ouvert → en cours → résolu/fermé

### Priorité #3 : Production Ready (Semaine 7-8)
- [ ] Tests E2E critiques
- [ ] Performance optimization
- [ ] SEO & Analytics
- [ ] Documentation utilisateur

---

## 🏗️ ROADMAP V2.0 - ImuPro (Q2-Q4 2026)

### Phase 0 : Préparation (Q1 2026 - 2-3 mois)

- [ ] **Analyse Marché Approfondie** (3 semaines)
  - Benchmarking : Houzz, PagesJaunes, StarOfService, AlloVoisins
  - Interviews 20+ artisans/auto-entrepreneurs
  - Étude pricing concurrents
  - Identification pain points pros

- [ ] **Validation Juridique** (4 semaines)
  - Avocat spécialisé plateformes
  - CGU/CGV adaptées aux services pro
  - Clauses responsabilité RC Pro
  - Compliance assurances obligatoires

- [ ] **Partenariat Assurance** (2 semaines)
  - Assureur partenaire pour plateforme
  - Offre assurance optionnelle clients
  - Vérification automatique RC Pro prestataires

- [ ] **Étude UX Pro** (2 semaines)
  - Wireframes interfaces pro
  - Prototype haute fidélité
  - Tests utilisateurs avec 10 artisans

### Phase 1 : MVP ImuPro - Catégorie Pilote (Q2 2026 - 3-4 mois)

**Catégorie choisie** : **Homme/Femme à tout faire**

#### A. Extension KYC → KYB (Know Your Business)

```typescript
// Nouveaux types à créer
enum KYBDocumentType {
  SIRET = "siret",
  RC_PRO = "rc_pro",
  DIPLOME = "diplome",
  CERTIFICATION = "certification",
  KBIS = "kbis"
}

interface KYBSubmission {
  businessType: "auto_entrepreneur" | "entreprise_individuelle" | "sarl";
  siret: string;
  companyName: string;
  rcProPolicy: {
    provider: string;
    policyNumber: string;
    expiryDate: Date;
    coverage: number;
  };
  certifications: {
    type: string;
    name: string;
    issuer: string;
    date: Date;
    documentUrl: string;
  }[];
  specializations: ServiceCategory[];
}
```

**Développements** :

- [ ] **Upload Documents KYB** (6h)
  - Interface upload multi-documents
  - Validation format/taille
  - Storage path : `users/{uid}/kyb_documents/`

- [ ] **Vérification SIRET API** (4h)
  - Intégration API INSEE
  - Validation automatique SIRET
  - Récupération infos entreprise

- [ ] **Admin KYB Validation** (8h)
  - Interface admin liste soumissions KYB
  - Preview documents (PDF, images)
  - Boutons : Approuver / Rejeter (avec raison)
  - Notifications email/push validation

- [ ] **Alertes Expiration RC Pro** (3h)
  - Cron job quotidien
  - Alerte J-30, J-15, J-7 avant expiration
  - Désactivation auto profil si expiré

#### B. Profil Pro V1

- [ ] **Extension UserProfile** (5h)
  ```typescript
  interface ProProfile extends UserProfile {
    isPro: true;
    kybStatus: "pending" | "approved" | "rejected";
    businessInfo: {
      companyName: string;
      siret: string;
      tvaNumber?: string;
    };
    portfolio: {
      id: string;
      title: string;
      description: string;
      beforeUrl: string;
      afterUrl: string;
      category: ServiceCategory;
      date: Date;
    }[];
    pricing: {
      hourlyRate?: number;
      fixedPrices?: { service: string; price: number }[];
    };
    serviceRadius: number; // km
    responseTime: number; // heures moyennes
    acceptanceRate: number; // %
  }
  ```

- [ ] **Galerie Portfolio** (6h)
  - Upload jusqu'à 10 photos avant/après
  - Légendes et catégories
  - Affichage type grille masonry
  - Lightbox vue détaillée

- [ ] **Badge "Pro Vérifié"** (2h)
  - Icon check vert
  - Tooltip "Pro vérifié : SIRET, RC Pro, Diplômes"
  - Affichage permanent sur profil et cards

- [ ] **Statistiques Pro** (4h)
  - Nombre projets réalisés
  - Taux acceptation offres
  - Délai moyen réponse
  - Satisfaction moyenne

#### C. Système de Devis

- [ ] **Workflow Devis** (10h)
  ```typescript
  interface Quote {
    id: string;
    taskId: string;
    providerId: string;
    clientId: string;
    status: "draft" | "sent" | "accepted" | "rejected";
    items: {
      description: string;
      quantity: number;
      unitPrice: number;
      total: number;
    }[];
    subtotal: number;
    tva: number;
    total: number;
    validUntil: Date;
    notes?: string;
    attachments?: string[];
  }
  ```

- [ ] **Template Devis Pré-rempli** (4h)
  - Formulaire items lignes
  - Calcul auto subtotal/TVA/total
  - Preview PDF devis

- [ ] **Client Accept Quote** (3h)
  - Bouton "Accepter ce devis"
  - Création automatique Booking
  - Notification prestataire

#### D. Facturation (Manuel MVP)

- [ ] **Upload Facture PDF** (4h)
  - Pro upload facture après prestation
  - Validation format PDF
  - Vérification montant = devis accepté
  - Paiement libéré après upload

- [ ] **Historique Factures** (3h)
  - Dashboard pro : Liste factures émises
  - Dashboard client : Liste factures reçues
  - Download PDF

#### E. CGU/CGV Pro

- [ ] **Mise à jour CGU** (1 semaine avec avocat)
  - Article "Services Professionnels"
  - Responsabilités prestataire pro
  - Assurance obligatoire
  - Facturation conformité fiscale

### Phase 2 : Extension Catégories (Q3-Q4 2026 - 6 mois)

**Ordre de déploiement** :

1. **Plomberie** (Q3)
   - Certifications : CAP/BEP Plomberie + RC Pro
   - Vérification diplômes renforcée

2. **Électricité** (Q3)
   - Certifications : Habilitation électrique obligatoire
   - Partenariat organisme certification

3. **IT & Support Technique** (Q3)
   - Certifications : CompTIA A+ ou équivalent
   - Portfolio projets complexes

4. **Soutien Scolaire** (Q4 - rentrée)
   - Bac+3 minimum dans matière
   - Crédit d'impôt 50% mis en avant

**Développements additionnels** :

- [ ] **Devis Multi-lignes Avancé** (6h)
  - TVA par ligne (taux multiple)
  - Remises/promotions
  - Acompte/échéancier paiement

- [ ] **Intégration API Facturation** (15h)
  - Partenariat Pennylane/Axonaut
  - OAuth connection compte pro
  - Auto-génération factures légales
  - Envoi auto client + plateforme

- [ ] **Abonnement Pro Premium** (12h)
  - 3 formules : Starter (0€), Plus (29€), Elite (79€)
  - Paiement récurrent Stripe
  - Avantages : Commission réduite, leads exclusifs, stats avancées
  - Dashboard abonnement

---

## 🩺 ROADMAP V2.5 - CareLink (2027)

### Vision CareLink
**"La plateforme complète pour le maintien à domicile des seniors, personnes à mobilité réduite et malades"**

### Phase 0 : Préparation (Q4 2026 - 3 mois)

- [ ] **Étude Réglementaire Approfondie** (6 semaines)
  - Agrément Services à la Personne (SAP)
  - CESU, PCH, APA
  - Protection données de santé (HDS)
  - Responsabilités spécifiques

- [ ] **Partenariats Stratégiques** (8 semaines)
  - Entreprises de portage repas
  - Associations d'aide à domicile
  - EHPAD/Résidences seniors
  - CCAS/Mairies
  - Mutuelles seniors

- [ ] **Étude UX Seniors** (4 semaines)
  - Interviews 30+ seniors et aidants
  - Tests accessibilité (WCAG AAA)
  - Adaptation interface (gros textes, contraste élevé)
  - Option "Mode Simplifié"

### Phase 1 : MVP CareLink - Portage Repas (Q1 2027 - 4 mois)

#### A. Module "Repas à Domicile"

- [ ] **Catalogue Menus** (8h)
  ```typescript
  interface Meal {
    id: string;
    name: string;
    description: string;
    category: "entree" | "plat" | "dessert";
    texture: "normal" | "mixe" | "hache";
    regime: "sans_sel" | "diabetique" | "sans_gluten" | "vegetarien"[];
    allergens: string[];
    nutritionalInfo: {
      calories: number;
      proteins: number;
      carbs: number;
      fats: number;
    };
    price: number;
    imageUrl: string;
  }
  ```

- [ ] **Planificateur Hebdomadaire** (12h)
  - Calendrier 7 jours
  - Sélection menus par jour
  - Formules : Déjeuner seul, Déjeuner+Dîner
  - Récurrence : Toutes les semaines identiques

- [ ] **Gestion Restrictions Alimentaires** (6h)
  - Profil senior : Allergies, régimes, textures
  - Filtrage automatique menus compatibles
  - Alertes si menu incompatible sélectionné

- [ ] **Livraison & Tracking** (10h)
  - Créneau livraison : matin (9-12h)
  - Notification SMS/Email J-1
  - Confirmation livraison (signature électronique)

#### B. Profil Senior Adapté

- [ ] **Interface Simplifiée** (15h)
  - Mode "Gros caractères" (24px minimum)
  - Contraste élevé (ratio 7:1)
  - Boutons larges (60x60px minimum)
  - Navigation linéaire (pas de menus complexes)

- [ ] **Profil Santé** (8h)
  - Allergies graves
  - Maladies chroniques (diabète, insuffisance rénale)
  - Restrictions mobilité
  - Personnes à prévenir (aidants, famille)
  - Consentement RGPD données santé

- [ ] **Gestion Multi-Utilisateurs** (6h)
  - Compte aidant = gestion profil senior
  - Permissions : Commande, paiement, suivi
  - Notifications partagées

#### C. Facturation & Aides

- [ ] **Intégration CESU** (12h)
  - Paiement via CESU préfinancé
  - Déclaration auto URSSAF
  - Factures compatibles crédit impôt 50%

- [ ] **Simulation Aides** (8h)
  - Calculateur APA (Allocation Personnalisée d'Autonomie)
  - Calculateur PCH (Prestation Compensation du Handicap)
  - Mise en avant crédit impôt

### Phase 2 : Extension Services (Q2-Q4 2027 - 9 mois)

#### Services à Déployer (par ordre)

1. **Aide Ménagère** (Q2)
   - Ménage, repassage, courses
   - Partenariat entreprises agréées SAP

2. **Accompagnement** (Q2)
   - RDV médicaux, promenades
   - Vérification casier judiciaire B3

3. **Soins à Domicile** (Q3)
   - Coordination infirmiers libéraux
   - Lien avec Doctolib/Maiia

4. **Téléassistance** (Q3)
   - Partenariat Filien/Europ Assistance
   - Détection chute
   - Appel d'urgence

5. **Coiffure/Esthétique** (Q4)
   - Partenariat coiffeurs à domicile
   - CAP Coiffure vérifié

6. **Activités Bien-être** (Q4)
   - Ateliers créatifs
   - Gymnastique douce
   - Stimulation cognitive

#### Développements Techniques

- [ ] **Système de Permanence** (10h)
  - Dashboard aidant : Vue globale services
  - Calendrier unifié toutes interventions
  - Alertes si service manqué

- [ ] **Messagerie Adaptée** (8h)
  - Option appel vocal (bouton gros)
  - SOS : appel direct assistance
  - Messages vocaux transcrits

- [ ] **Capteurs Connectés (option)** (15h)
  - Intégration objets connectés (pilulier, détecteur chute)
  - Alertes automatiques aidants
  - Dashboard santé temps réel

---

## 📊 PRIORITISATION GLOBALE

### Semaines 1-8 (Immédiat - Q4 2025)
```
Priority 1: Landing Page Segmentation (2 jours)
Priority 2: TypeScript Errors Fix (1-2 jours)
Priority 3: MVP ImuTask Core Features (6 semaines)
  - Profil & KYC
  - Offres & Bookings
  - Messagerie
  - Paiements
```

### Q1-Q2 2026
```
ImuTask V1.0 → Production
ImuPro Préparation (Phase 0)
ImuPro MVP Pilote (Homme à tout faire)
```

### Q3-Q4 2026
```
ImuPro Extension (4 catégories pro)
CareLink Préparation (Phase 0)
```

### 2027
```
ImuPro Phase 3: Services à la Personne
CareLink MVP + Extension services
```

---

## 🎯 KPIs Clés par Plateforme

### ImuTask (V1.0)
- Utilisateurs actifs : 5000+ (fin 2026)
- Missions/mois : 2000+
- GMV/mois : 60k€
- Commission : 15%
- NPS : > 50

### ImuPro (V2.0)
- Pros actifs : 500 (fin 2026) → 2000 (2027)
- Missions/mois : 1000 → 5000
- GMV/mois : 300k€ → 1,75M€
- Commission : 10-12%
- NPS Pros : > 40

### CareLink (V2.5)
- Seniors inscrits : 500+ (fin 2027)
- Services actifs : 6+
- Repas livrés/mois : 3000+
- GMV/mois : 150k€
- Satisfaction : 4.8/5

---

## 🚨 Risques Identifiés & Mitigations

| Risque | Impact | Probabilité | Mitigation |
|--------|--------|-------------|------------|
| **Complexité réglementaire CareLink** | Haut | Moyen | Avocat spécialisé, phase pilote limitée |
| **Acquisition pros ImuPro difficile** | Moyen | Moyen | Budget marketing 50k€, proposition valeur claire |
| **Cannibalisation entre plateformes** | Faible | Faible | Segmentation claire, besoins différents |
| **Problèmes assurance ImuPro** | Haut | Faible | Vérification stricte RC Pro, partenariat assureur |
| **Accessibilité CareLink insuffisante** | Haut | Moyen | Tests UX approfondis, WCAG AAA compliance |

---

**Dernière mise à jour** : 24 octobre 2025  
**Prochaine revue** : 1er novembre 2025
