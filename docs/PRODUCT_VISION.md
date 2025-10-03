# 🎯 ImuTask — Vision Produit & Business

**Version:** 1.0.0  
**Date:** 3 octobre 2025  
**Statut:** Document de référence

---

## 1. Pitch & Vision

### Pitch (1 phrase)

ImuTask est une plateforme mobile-first et web (admin/marketing) qui met en relation des jeunes (18–30 ans) offrant des micro-services locaux (courses, ménage, accompagnement, aide numérique, etc.) et des particuliers/associations ayant besoin d'un service occasionnel — avec paiements sécurisés, traçabilité complète et montée en compétences via des badges et micro-formations.

### Vision long terme

Devenir l'écosystème local référent où les jeunes gagnent un revenu légal, se forment et montrent leur valeur, tandis que les communautés locales accèdent à une main-d'œuvre fiable, traçable et qualifiée.

### Valeurs fondamentales

- **Transparence** — Traçabilité complète des interactions et paiements
- **Sécurité** — KYC, on-platform communications, escrow payments
- **Développement** — Badges, micro-formations, montée en compétences
- **Inclusion** — Accessible aux jeunes sans expérience professionnelle préalable
- **Local** — Focus sur l'économie de proximité et l'impact communautaire

---

## 2. Valeur Proposée (par partie prenante)

### Pour les jeunes / prestataires

✅ **Revenus flexibles**
- Choisir ses horaires et missions
- Paiements sécurisés et rapides (Stripe)
- Compléments de revenus pour étudiants

✅ **Traçabilité & preuve d'expérience**
- Historique complet de missions
- Portfolio de compétences vérifiables
- Références et ratings clients

✅ **Badges & certificats valorisables**
- Reconnaissance de compétences
- Progression visible (gamification)
- Certificats exportables (CV, LinkedIn)

✅ **Micro-formations (ImuAcademy)**
- Cours courts et pratiques
- Validation par quiz
- Nouvelles compétences = nouvelles opportunités

✅ **Sécurité**
- KYC optionnel pour débloquer features
- Protection juridique (contrats types)
- Assurance recommandée (partenariats)

### Pour les clients (particuliers / associations)

✅ **Accès rapide à des prestataires locaux vérifiables**
- Recherche par géolocalisation
- Filtres par compétences, ratings, prix
- Profils détaillés avec historique

✅ **Paiement sécurisé**
- Escrow (fonds bloqués jusqu'à validation)
- Pas d'échange d'argent en main propre
- Factures automatiques

✅ **Résolution de litiges centralisée**
- Processus de dispute standardisé
- Médiation par l'équipe ImuTask
- Remboursements automatisés si justifiés

✅ **Qualité garantie**
- Système de reviews & ratings
- Prestataires vérifiés (KYC)
- SOS button en cas d'urgence

### Pour les partenaires (collectivités, associations)

✅ **Canaux d'engagement local**
- Onboarding de jeunes en insertion
- Missions solidaires sponsorisées
- Visibilité sur plateforme engagée

✅ **Reporting RSE**
- Analytics d'impact social
- Nombre de jeunes aidés
- Heures de missions locales

✅ **Co-financement de missions**
- Possibilité de subventionner des tâches
- Programmes d'aide spécifiques
- Partenariats campus/associations

### Pour la plateforme (ImuTask)

✅ **Revenus diversifiés**
- Commissions sur bookings (12-20%)
- Abonnements ImuPro
- Services premium & sponsoring

✅ **Données & insights**
- Compréhension de l'économie locale
- Tendances de compétences
- Valorisation B2B (reporting RSE)

---

## 3. Publics Cibles & Personas

### 👤 Persona 1: Jeune Prestataire

**Marie, 22 ans, étudiante en licence**

- **Profil:** Cherche revenus d'appoint pour financer ses études
- **Comportement:** Mobile-first, réseaux sociaux, valeurs sociales
- **Besoins:** Flexibilité horaires, paiements rapides, sécurité
- **Compétences:** Ménage, courses, garde d'animaux, aide aux devoirs
- **Motivations:** Argent + expérience + CV enrichi
- **Freins:** Peur des arnaques, manque de confiance en soi

### 👤 Persona 2: Client Particulier

**Jean, 45 ans, parent occupé**

- **Profil:** Travaille à temps plein, 2 enfants
- **Comportement:** Recherche simplicité et rapidité
- **Besoins:** Aide ménage, courses, bricolage léger, garde enfants
- **Budget:** 15-30€/h selon tâche
- **Motivations:** Gagner du temps, soutenir jeunes locaux
- **Freins:** Confiance (qui vient chez moi?), qualité du service

### 👤 Persona 3: Association Locale

**Sophie, responsable asso quartier**

- **Profil:** ONG locale, budget limité
- **Comportement:** Recherche bénévoles/rémunérés ponctuels
- **Besoins:** Aide événements, distribution, accompagnement seniors
- **Budget:** Variable selon subventions
- **Motivations:** Impact social, emploi jeunes
- **Freins:** Fiabilité, formalités administratives

### 👤 Persona 4: Admin / Modérateur

**Thomas, 28 ans, support ImuTask**

- **Profil:** Employé ImuTask, gestion opérations
- **Comportement:** Interface admin web, outils de modération
- **Besoins:** KYC queue, disputes, payouts, analytics
- **Objectifs:** Résoudre litiges rapidement, valider KYC sous 48h
- **Outils:** Admin dashboard, logs, communication tools

### 👤 Persona 5: Sponsor / Partenaire Campus

**Laura, chargée RSE entreprise**

- **Profil:** Entreprise locale cherchant impact & visibilité
- **Comportement:** Recherche partenariats étudiants
- **Besoins:** Visibilité marque employeur, reporting RSE
- **Budget:** 5k-20k€/an selon taille entreprise
- **Motivations:** Responsabilité sociale, recrutement futur
- **Freins:** ROI incertain, image de marque

---

## 4. Périmètre Produit (MVP → V1 → V2)

### 🚀 MVP (Priorité absolue) — 6 mois

**Objectif:** Valider le product-market fit sur un campus pilote

**Features critiques:**

✅ **Auth & Profils**
- Inscription/connexion email + Google OAuth
- Profils multi-rôles (client / provider)
- Upload avatar, bio, compétences

✅ **Tasks**
- Création de tâche (titre, description, catégorie, budget, créneau)
- Géolocalisation (adresse ou zone)
- Recherche/filtres (distance, catégorie, prix, date)
- Statuts: draft → publish → offers → booked → completed → reviewed

✅ **Offers**
- Providers proposent prix + créneau + message
- Auto-expiration (24-48h)
- Client accepte/refuse

✅ **Bookings**
- Création automatique après acceptation offre
- Statuts: confirmed → in_progress → completed → cancelled
- Check-in/out (optionnel)
- Photos before/after (proof of work)

✅ **Payments (Stripe Connect)**
- Onboarding Stripe Connect pour providers
- Authorize payment à la création booking
- Capture à la completion (escrow)
- Refunds automatiques si dispute justifiée
- Platform fee (take-rate 12-20%)
- Tips optionnels

✅ **Messaging**
- Threads par task
- Texte + images + fichiers
- Détection PII (emails, tels, URLs)
- On-platform communications enforced
- Reporting de messages inappropriés

✅ **KYC Basique**
- Upload pièce d'identité + selfie
- Validation manuelle (queue admin)
- Statuts: pending → approved → rejected
- Déblocage de features premium (paiements >100€, etc.)

✅ **Reviews & Ratings**
- Post-mission rating (1-5 étoiles)
- Commentaire texte optionnel
- Modération des avis
- Calcul rating moyen provider

✅ **Admin Dashboard**
- KYC queue (review docs)
- Disputes list
- Payments overview
- Users management (suspend, verify)
- Basic analytics

✅ **Mobile App (Expo React Native)**
- App iOS/Android pour providers & clients
- Notifications push
- Camera pour photos KYC & proof of work

✅ **Web Admin + Marketing**
- Site vitrine Next.js
- Admin dashboard
- Landing pages multilingues

**Critères de succès MVP:**
- 50 providers actifs
- 50 clients
- 200 tasks créées
- 80 bookings complétés
- 4.0+ rating moyen
- <5% dispute rate

---

### 📈 V1 (Post-validation MVP) — 6 mois supplémentaires

**Objectif:** Scaler régionalement et optimiser l'expérience

**Features V1:**

🔄 **Disponibilités / Calendrier**
- Providers définissent leurs créneaux disponibles
- Synchronisation calendrier externe (Google Cal)
- Blocage automatique de créneaux

🔄 **Auto-accept Rules & Matching**
- Providers définissent règles auto-acceptation
- Algorithme matching intelligent (skills + distance + rating)
- Notifications ciblées

🔄 **Offline Queue & Retry**
- Mode offline dans l'app mobile
- Outbox pour actions en attente
- Synchronisation automatique
- Status page (incidents, maintenance)

🔄 **Notifications Push & Email**
- Système de notifications multi-canal
- Personnalisation préférences
- Digest hebdomadaire
- Reminders (booking J-1, review pending)

🔄 **Templates / Packs**
- Clients sauvegardent tâches récurrentes
- Providers créent packs de services
- Marketplace de packs
- Pricing bundles

🔄 **ImuAcademy (micro-formations)**
- Catalogue de cours courts (5-20 min)
- Vidéos + quiz validation
- Badges de compétences
- Impact sur visibilité (boost providers formés)

🔄 **Referrals & Rewards**
- Programme parrainage multi-tiers
- Codes promo personnalisés
- Catalogue de récompenses
- Tracking conversions

**Critères de succès V1:**
- 500 providers actifs
- 3 villes couvertes
- 50k€ GMV/mois
- 30% providers formés (Academy)
- 20% des bookings via referrals

---

### 🚀 V2 (Scale & Growth) — 12 mois

**Objectif:** Devenir la plateforme référence et monétiser pleinement

**Features V2:**

🎯 **ImuChallenge (concours)**
- Concours multi-domaines (photo, vidéo, talents)
- Soumissions via app
- Jury + votes communautaires
- Récompenses & sponsoring
- Intégration écosystème ImuTask

🎯 **WebRTC Audio Calls**
- Appels audio in-app
- Enregistrement optionnel (consentement requis)
- Transcription automatique
- Proof of contact pour litiges

🎯 **Pricing Intelligence (IA)**
- Suggestion prix basée historique local
- P50/P75/Max par catégorie & ville
- ML model pour optimal pricing
- A/B testing prix

🎯 **Advanced Trust & Safety**
- ML detection de fraude
- Risk scoring utilisateurs
- Pattern detection (no-show, disputes)
- Auto-suspension comptes suspects
- OCR images (détection coordonnées)

🎯 **Feature Flags & Experiments**
- A/B testing intégré
- Feature flags par région/segment
- Analytics avancées (Amplitude/Mixpanel)
- Optimisation conversion funnels

🎯 **Marketplace Professionnel**
- Packs premium providers
- Services récurrents (abonnements)
- Entreprises clientes (B2B)
- Facturation automatisée

**Critères de succès V2:**
- 2000+ providers actifs
- 10+ villes
- 500k€ GMV/mois
- Profitabilité atteinte
- NPS >50

---

## 5. Fonctionnalités Détaillées

### 🔄 Task Lifecycle Complète

```
draft → publish → offers → accept → booking → complete → review
  ↓        ↓         ↓        ↓         ↓          ↓         ↓
client   public   providers client   both     provider  client
edits    visible  propose   accepts  track    marks     rates
         search   price/    offer    status   done      provider
                  time
```

**États détaillés:**

1. **Draft** — Client rédige tâche (privée)
2. **Published** — Visible providers (recherche, matching)
3. **Offers** — Providers soumettent offres (prix + créneau)
4. **Accepted** — Client accepte une offre → Booking créé
5. **Booked** — Paiement autorisé, attente exécution
6. **In Progress** — Provider a check-in (optionnel)
7. **Completed** — Provider marque terminé + photos
8. **Reviewed** — Client rate & review
9. **Closed** — Archivé (paiement capturé)

**Cas particuliers:**

- **Cancelled** — Avant exécution (remboursement)
- **Disputed** — Litige ouvert (freeze funds)
- **Expired** — Aucune offre acceptée sous X jours
- **No-show** — Provider ou client absent

---

### 💰 Payments & Escrow (Stripe Connect)

**Flow complet:**

1. **Provider Onboarding**
   - Création Stripe Connect Account
   - KYC Stripe (ou notre KYC custom)
   - Verification status

2. **Booking Creation**
   - Client authorize payment (hold funds)
   - PaymentIntent created
   - Status: requires_capture

3. **Task Completion**
   - Provider marks completed
   - Client validates (ou auto après 48h)
   - Capture PaymentIntent
   - Transfer to provider (minus platform fee)

4. **Disputes**
   - Freeze funds
   - Evidence upload (both sides)
   - Admin review
   - Decision: refund client OR release provider

5. **Payouts**
   - Weekly/Monthly automatic payouts
   - Stripe Dashboard pour providers
   - Transaction history

**Take-rate:**
- Standard: 15%
- ImuPro subscribers: 10%
- Missions >200€: 12%
- Configurable par catégorie

**Tips:**
- Optionnel post-completion
- 5%, 10%, 15%, custom
- 100% au provider (pas de fee)

---

### 💬 Messaging & Trust

**Features:**

✅ **On-platform only enforced**
- Détection automatique emails, tels, URLs
- Warning messages
- Floutage coordonnées
- OCR images (détection texte)

✅ **Thread par task**
- Conversation contextuelle
- Historique complet (audit)
- Attachments (images, PDF)
- Status delivery/read

✅ **Moderation**
- Reporting messages
- PII detection (ML)
- Toxicity classifier
- Manual review queue

✅ **Audit & Compliance**
- Logs complets (RGPD)
- Export conversations (disputes)
- Retention policy (7 ans pour France)

---

### 🛡️ Trust & Safety (Opérations)

**Détection automatique:**

- PII dans messages (regex + NLP)
- URLs/emails dans texte et images (OCR)
- Profils suspects (fake photos, coordonnées en bio)
- Patterns de fraude (chargebacks, no-shows répétés)

**Score de risque utilisateur:**

```
Risk Score = f(
  no_show_rate,
  dispute_rate,
  chargebacks,
  negative_reviews,
  account_age,
  kyc_status
)
```

- **Low (0-30):** Trusted, aucune restriction
- **Medium (31-60):** Modération accrue
- **High (61-100):** Freeze funds, manual review, possible ban

**Playbooks opérations:**

1. **Dispute resolution** (SLA 72h)
   - Evidence review
   - Both parties contacted
   - Decision communiquée
   - Refund/release automatique

2. **KYC review** (SLA 48h)
   - Documents authenticity check
   - Selfie matching
   - Approve/reject/request more info

3. **Fraud suspected** (SLA 24h)
   - Freeze account
   - Notify user
   - Investigation
   - Ban or unfreeze

**SOS Button:**
- In-app emergency button
- Alerts admin + emergency contact
- Geolocation shared
- SMS/call automatique (partenariat)

---

### 🎓 ImuAcademy (Micro-formations)

**Objectif:** Monter en compétences et débloquer plus d'opportunités

**Catalogue:**

- **Soft skills:** Communication, ponctualité, gestion conflits
- **Techniques:** Ménage pro, bricolage, jardinage
- **Numérique:** Bureautique, réseaux sociaux, dépannage PC
- **Sécurité:** Gestes premiers secours, manipulation produits

**Format:**

- Vidéos courtes (5-15 min)
- Quiz validation (80% requis)
- Badge débloqué
- Certificat PDF exportable

**Impact:**

- Providers formés = boost visibilité (+20% dans recherche)
- Badges affichés sur profil
- Clients filtrent par compétences certifiées
- Nouvelles catégories de tâches débloquées

**Monétisation:**

- Gratuit pour cours basiques
- Premium (ImuPro) pour cours avancés
- Sponsors (entreprises) financent formations spécifiques

---

### 🏆 ImuChallenge (Concours)

**Concept:** Concours créatifs pour engager communauté

**Types de challenges:**

- Photo contest (meilleure réalisation)
- Vidéo talent (skills showcase)
- Speed challenge (tâche en X temps)
- Innovation (nouvelle idée service)

**Workflow:**

1. Annonce challenge (thème, dates, prizes)
2. Inscriptions (optionnel: frais 5-10€)
3. Soumissions via app (photo/vidéo + description)
4. Votes communautaires (pondération)
5. Jury final (partenaires + team ImuTask)
6. Résultats & récompenses

**Récompenses:**

- Cash prizes (sponsors)
- Crédits ImuTask
- Badges exclusifs
- Visibilité (featured profiles)

**Monétisation:**

- Frais inscription participants
- Sponsoring entreprises
- Promoted submissions (payant)

---

## 6. Architecture Technique (Synthèse)

### Frontend

**Web (Next.js 15 + TypeScript)**
- Marketing site multilingue (7 langues)
- Admin dashboard
- Client dashboard (optionnel, mobile-first)
- Vercel hosting

**Mobile (Expo React Native)**
- iOS + Android
- Providers & clients
- Push notifications (FCM)
- Camera (KYC, proof of work)

### Backend

**API (Node.js + TypeScript)**
- tRPC pour type-safety
- REST endpoints pour webhooks
- Rate limiting (Redis)
- Authentication (JWT + refresh tokens)

**Database**
- **Postgres (principal):** Users, Tasks, Bookings, Payments
- **Redis:** Cache, sessions, rate-limit, presence
- **ElasticSearch/PostGIS:** Recherche géolocalisée

**Storage**
- **S3/R2:** Images, KYC docs, attachments
- Presigned URLs upload
- CDN (CloudFront)

**Workers (BullMQ)**
- Upload scanning (antivirus)
- Payouts automatiques
- Email/SMS notifications
- Webhook retries
- Analytics aggregation

**Payments (Stripe Connect)**
- Connected Accounts providers
- PaymentIntents (authorize/capture)
- Transfers avec platform fee
- Webhooks (payment, dispute, payout)

**Real-time**
- **WebSocket (Socket.IO):** Messaging, presence
- Rooms par thread
- Typing indicators
- Read receipts

**KYC (Optionnel 3rd party)**
- Onfido/Veriff pour vérification auto
- Fallback: manual review queue

**Calls (V2)**
- WebRTC avec TURN server (coturn)
- Ou 3rd party (Daily.co, Agora)
- Recording (S3) avec consentement

### Infra & DevOps

**Hosting:**
- Vercel (web frontend)
- Kubernetes (EKS/GKE) ou serverless (Lambda) pour backend
- Multi-region (EU + US)

**CI/CD:**
- GitHub Actions
- Preview deployments (Vercel)
- Automated tests (unit + E2E)
- Infrastructure as Code (Terraform)

**Observability:**
- **Errors:** Sentry
- **Metrics:** Prometheus + Grafana
- **Logs:** Loki / CloudWatch
- **Tracing:** Jaeger / DataDog

**Security:**
- TLS everywhere
- Secrets management (AWS Secrets Manager)
- RBAC (admin/moderator/dev)
- Audit logs (toutes actions sensibles)

---

## 7. Sécurité & Conformité

### RGPD

✅ **Droits utilisateurs:**
- Export données (JSON)
- Suppression compte (anonymisation transactions)
- Rectification
- Opposition au traitement

✅ **Journalisation DSAR:**
- Toutes requêtes tracées
- Délai réponse: 30 jours
- Automation (self-service si possible)

✅ **Retention:**
- Données personnelles: supprimées 3 ans après inactivité
- Transactions financières: 7 ans (obligation légale France)
- Messages: 2 ans après clôture task

### PCI-DSS

✅ **Tokenisation Stripe:**
- Jamais de carte stockée côté ImuTask
- Stripe Checkout ou Elements
- SAQ-A (simplification compliance)

### Consentement

✅ **Enregistrements calls (V2):**
- Consentement explicite avant call
- Notification in-call
- Possibilité refuser (désactive recording)
- Export/suppression sur demande

### Chiffrement

✅ **In transit:** TLS 1.3
✅ **At rest:** Server-side encryption (AWS KMS)
✅ **Messages sensibles:** Optionnel end-to-end (V2)

### Audit

✅ **Actions sensibles tracées:**
- Refunds
- Suspensions
- KYC approvals
- Access to PII
- Admin actions

---

## 8. IA & Fonctionnalités Intelligentes

### 🤖 NL → Form (Natural Language to Task)

**Use case:** Client crée tâche en parlant/écrivant librement

**Input:** "J'ai besoin de quelqu'un pour faire mes courses demain après-midi chez Carrefour République, budget 20€"

**Output (extraction):**
- **Catégorie:** Courses
- **Date:** Demain 14h-18h
- **Lieu:** Carrefour République (géocodé)
- **Budget:** 20€
- **Description:** "Faire courses chez Carrefour"

**Tech:**
- Genkit + Gemini/Claude
- Prompt engineering
- Validation avec utilisateur avant publish

---

### 💡 Pricing Intelligence

**Objectif:** Suggérer prix optimal basé données locales

**Input:**
- Catégorie task
- Ville/zone
- Durée estimée
- Historique bookings similaires

**Output:**
- **p50 (médiane):** 25€
- **p75 (bon prix):** 30€
- **Max raisonnable:** 40€
- **Suggestion:** "La plupart des clients payent entre 25-30€ pour cette tâche"

**Tech:**
- Agrégation données Postgres
- ML model (regression)
- Update hebdomadaire

---

### 🛡️ Modération Assistée

**PII Detection:**
- Regex (emails, tels, adresses)
- NLP (named entities)
- OCR images (Tesseract + GPT-4 Vision)

**Toxicity Classifier:**
- Small model (DistilBERT fine-tuned)
- Score 0-100
- Auto-hide si >80, review queue si 50-80

**Spam Detection:**
- Repeated messages
- External links patterns
- Account age + activity

---

### 🤝 Ops Copilot (Admin)

**Use case:** Admin review dispute

**Input:** Dispute ID

**Output:**
```
RÉSUMÉ AUTOMATIQUE:
- Client: Marie D. (4.8★, 12 bookings)
- Provider: Jean P. (4.2★, 45 bookings)
- Task: Ménage 2h - 30€
- Litige: "Travail non terminé, salle de bain non faite"
- Evidence client: 2 photos
- Evidence provider: 1 message "Client absent au RDV"
- Recommandation IA: Refund partiel 50% (ambiguïté)
```

**Tech:**
- RAG (documents TOS, playbooks)
- LLM summarization
- Aide décision (final call = humain)

---

## 9. Business Model Détaillé

### 💰 Sources de Revenus

#### 1. Commission sur Bookings (Take-rate)

**Principal revenu (70%)**

- **Standard:** 15% par transaction
- **ImuPro:** 10% (providers abonnés)
- **Gros montants (>200€):** 12%
- **Petites transactions (<10€):** Frais fixe 1.5€ + 5%

**Exemple:**
- Booking 50€
- Fee ImuTask: 7.5€
- Provider reçoit: 42.5€ (moins frais Stripe ~1.5€)

**Projection:**
- Mois 1 (pilote): 5k€ GMV → 750€ revenus
- Mois 6 (scale): 50k€ GMV → 7.5k€ revenus
- Mois 12 (multi-villes): 200k€ GMV → 30k€ revenus

---

#### 2. Abonnements ImuPro (Providers)

**15% des revenus**

**Offre:**
- **Mensuel:** 9.99€/mois
- **Annuel:** 99€/an (2 mois gratuits)

**Avantages:**
- Take-rate réduit (10% vs 15%)
- Visibilité accrue (+30% dans recherche)
- Templates illimités
- Badge "Pro" sur profil
- Analytics avancées
- Support prioritaire

**Projection:**
- 10% des providers actifs s'abonnent
- 500 providers × 10% × 10€ = 500€/mois à M6
- 2000 providers × 15% × 10€ = 3k€/mois à M12

---

#### 3. Promoted Listings / Sponsoring

**10% des revenus**

**Offre clients:**
- Task mise en avant: 2.99€
- Top search 24h: 5.99€
- Featured homepage 7j: 14.99€

**Offre partenaires:**
- Sponsor catégorie: 200€/mois
- Banner homepage: 500€/mois
- Package campus: 1k€/mois

**Projection:**
- 5% des tasks promoted: 1000 tasks/mois × 5% × 3€ = 150€
- 2-3 sponsors: 1.5k€/mois

---

#### 4. ImuChallenge (Concours)

**5% des revenus (V2)**

**Modèle:**
- Frais inscription: 5-10€ par participant
- Sponsoring entreprises: 2k-10k€ par challenge
- Promoted submissions: 4.99€

**Projection:**
- 1 challenge/mois avec 100 participants × 5€ = 500€
- 1 sponsor × 3k€ = 3k€
- Total: 3.5k€/mois (année 2)

---

#### 5. Data / Reporting B2B (V2)

**Service premium pour collectivités/entreprises**

**Offre:**
- Dashboard RSE personnalisé: 500€/mois
- Reporting impact social: 200€/rapport
- Analytics marché local: sur devis

**Projection:**
- 2-3 clients B2B: 1.5k€/mois (année 2)

---

### 📊 Estimation Revenus Totaux

**Année 1:**

| Mois | GMV | Take-rate | ImuPro | Promoted | Total Revenus |
|------|-----|-----------|--------|----------|---------------|
| M1-3 | 15k€ | 2.25k€ | 100€ | 50€ | 2.4k€ |
| M4-6 | 150k€ | 22.5k€ | 1.5k€ | 500€ | 24.5k€ |
| M7-9 | 400k€ | 60k€ | 4k€ | 1.5k€ | 65.5k€ |
| M10-12 | 700k€ | 105k€ | 8k€ | 3k€ | 116k€ |
| **Total An 1** | **1.265M€** | **189.75k€** | **13.6k€** | **5.05k€** | **208.4k€** |

**Année 2 (avec V2):**

| Trimestre | GMV | Revenus Plateforme |
|-----------|-----|--------------------|
| Q1 | 900k€ | 145k€ |
| Q2 | 1.2M€ | 195k€ |
| Q3 | 1.5M€ | 245k€ |
| Q4 | 1.8M€ | 295k€ |
| **Total An 2** | **5.4M€** | **880k€** |

---

## 10. Go-to-Market (Plan Détaillé)

### 🎯 Phase Pilote (0-3 mois)

**Objectif:** Valider le product-market fit sur 1 campus

**Stratégie:**

1. **Partenariat campus**
   - Contact BDE, CROUS, assos étudiantes
   - Stand présentation rentrée
   - Sponsoring événements (soirées, galas)

2. **Recrutement providers (50)**
   - Pitch direct (amphithéâtres avec accord)
   - Affiches campus (QR code signup)
   - Ambassadeurs (5-10 étudiants payés)
   - Bonus signup (10€ crédit)

3. **Acquisition clients (50)**
   - Flyers quartier résidentiel proche campus
   - Facebook Ads hyper-local (5km)
   - Partenariat résidence seniors
   - Promo 1ère tâche -50%

4. **Activation & Engagement**
   - Onboarding call personnalisé
   - Tutoriels vidéo courts (TikTok/Insta)
   - Incentives premières missions (double rating)
   - Groupe WhatsApp/Discord communauté

**Budget pilote:** 5k€
- Marketing: 2k€
- Ambassadeurs: 1.5k€
- Promos signup: 1k€
- Events: 500€

**KPIs pilote:**
- 50 providers onboardés M1
- 50 clients M2
- 100 tasks publiées M3
- 60 bookings complétés M3
- 4.0+ rating moyen

---

### 📈 Phase Scale (3-9 mois)

**Objectif:** Expansion 3-5 villes universitaires

**Stratégie:**

1. **Réplication modèle campus**
   - Lyon, Toulouse, Bordeaux, Nantes
   - 1 city lead par ville (recrutement local)
   - Playbook standardisé
   - Budget 3k€ par ville

2. **Growth digital**
   - TikTok (stories providers, before/after)
   - Instagram (UGC, testimonials)
   - SEO local (landing pages par ville)
   - Google Ads (recherche locale)

3. **Partenariats ONG & assos**
   - Missions solidaires co-financées
   - Reporting impact social
   - Visibilité mutuelle

4. **Referral program**
   - Parraine ami: 10€ chacun
   - Leaderboard ambassadeurs
   - Récompenses (merchandise, crédits)

**Budget scale:** 25k€
- Expansion villes: 15k€
- Marketing digital: 7k€
- Partenariats: 2k€
- Referral incentives: 1k€

**KPIs scale:**
- 500 providers actifs M9
- 5 villes couvertes
- 50k€ GMV/mois M9
- 30% croissance MoM
- 25% bookings via referral

---

### 🚀 Phase Consolidation (9-18 mois)

**Objectif:** Profitabilité et features premium

**Stratégie:**

1. **ImuChallenge rollout**
   - 1 concours/mois
   - Sponsors locaux (5-10k€)
   - Viralité réseaux sociaux

2. **Monétisation élargie**
   - Push ImuPro (email campaigns, in-app)
   - Promoted listings (A/B testing prix)
   - Partenariats B2B (collectivités)

3. **Expansion géographique**
   - 10 villes total
   - Zones rurales (test)
   - International (si succès France)

4. **Optimisation opérations**
   - Automatisation modération (IA)
   - Self-service support (chatbot)
   - Réduction coûts acquisition (SEO, organic)

**Budget consolidation:** 50k€
- Expansion: 30k€
- Product (challenges): 10k€
- Marketing: 7k€
- Operations: 3k€

**KPIs consolidation:**
- 2000 providers M18
- 10 villes
- 200k€ GMV/mois
- Breakeven operationnel
- NPS >50

---

## 11. Roadmap Indicative (Sprints)

### Sprint 0 (Setup) — 2 semaines

- Architecture monorepo (Turborepo)
- Infra basics (AWS/GCP, CI/CD)
- Next.js skeleton + i18n
- Expo app skeleton
- Stripe sandbox
- Design system (Figma → Tailwind)

### MVP (Sprint 1-8) — 4 mois

**S1-S2:** Auth & Profils
**S3-S4:** Tasks & Offers
**S5:** Bookings & Payments
**S6:** Messaging
**S7:** KYC + Reviews
**S8:** Admin dashboard + Polish

### V1 (Sprint 9-20) — 6 mois

**S9-S10:** Calendrier & Disponibilités
**S11-S12:** Matching & Auto-accept
**S13-S14:** Offline/Outbox
**S15-S16:** Notifications
**S17-S18:** Templates & ImuAcademy
**S19-S20:** Referrals + Analytics

### V2 (Sprint 21-40) — 10 mois

**S21-S25:** ImuChallenge
**S26-S30:** WebRTC Calls
**S31-S35:** IA (pricing, moderation, NL→Form)
**S36-S40:** Advanced T&S + Feature flags + Polish

---

## 12. KPIs & Métriques (Tracking)

### 📊 Business Metrics

**Revenus:**
- GMV (Gross Merchandise Value) daily/weekly/monthly
- Platform Revenue (take-rate + subs + promoted)
- AOV (Average Order Value)
- Take-rate effectif moyen

**Activité:**
- \# Active providers (au moins 1 booking/mois)
- \# Active clients
- \# Tasks published
- \# Bookings completed
- Fill rate (#bookings / #tasks published)

**Conversion:**
- Signup → Profile completed
- Profile → First task published (client)
- Profile → First offer sent (provider)
- Offer sent → Offer accepted
- Publish → Booking (end-to-end)

**Time metrics:**
- Time publish → first offer
- Time offer → acceptance
- Time booking → completion

---

### 🎯 Qualité & Satisfaction

**Ratings:**
- Average provider rating
- Average client rating
- Distribution ratings (% 5★, 4★, etc.)

**Issues:**
- No-show rate (provider & client)
- Dispute rate (#disputes / #bookings)
- Dispute resolution time (median)
- Refund rate

**Trust & Safety:**
- KYC pass rate
- Fraud detection rate
- PII violations detected
- Account suspensions

---

### 📈 Growth & Retention

**Acquisition:**
- CAC (Customer Acquisition Cost) par canal
- Signups by source (organic, paid, referral)
- Conversion rate landing → signup

**Retention:**
- D7, D30, D90 retention cohorts
- Churn rate (providers & clients)
- Reactivation rate

**Engagement:**
- DAU/MAU ratio
- Sessions per user
- Time in app
- Bookings per active user (monthly)

**Referral:**
- Referral conversion rate
- K-factor (viralité)
- % bookings via referral

---

### ⭐ Satisfaction

**NPS (Net Promoter Score):**
- Survey post-booking (aléatoire 20%)
- Target: >50

**CSAT (Customer Satisfaction):**
- Post-support interaction
- Target: >4.5/5

**Feedback:**
- Feature requests count
- Bug reports
- Support tickets volume

---

## 13. Risques & Stratégies d'Atténuation

### 🔴 Fraude & Contournement

**Risque:** Utilisateurs échangent coordonnées pour payer hors plateforme

**Atténuation:**
- Détection PII automatique (messages + images)
- On-platform communications enforced
- Warnings puis sanctions (suspension)
- Incentives à rester on-platform (escrow, reviews)
- KYC pour débloquer features
- Education utilisateurs (sécurité, garanties)

---

### 🔴 Faible Adoption Initiale

**Risque:** Poulet-œuf (pas de providers → pas de clients → pas de providers)

**Atténuation:**
- Pilote campus hyper-ciblé (densité critique)
- Recrutement providers d'abord (supply-first)
- Incentives signup (bonus, promos)
- Ambassadeurs payés
- Partenariats assos (missions garanties)

---

### 🔴 Problèmes Paiements

**Risque:** Réconciliations, chargebacks, erreurs transferts

**Atténuation:**
- Stripe Connect (robuste, testé)
- Tests exhaustifs (sandbox)
- Monitoring temps réel (webhooks)
- Automation réconciliation (workers)
- Support prioritaire paiements
- Buffer funds (reserve)

---

### 🔴 Réglementations Locales

**Risque:** Législation travail, fiscalité (auto-entrepreneur, seuils)

**Atténuation:**
- Consulter juriste local (France, EU)
- Terms clairs (providers = indépendants)
- Assistance déclaration revenus (guides)
- Partenariats experts-comptables
- Limites automatiques (seuils micro-entrepreneur)

---

### 🔴 Burn & Cashflow

**Risque:** Coûts infra/ops explosent avant revenus suffisants

**Atténuation:**
- Features à revenus priorisées (MVP lean)
- Serverless jusqu'à scale (Lambda > K8s initial)
- Freemium agressif (ImuPro early)
- Fundraising préventif (si trajectoire validée)
- Monitoring coûts temps réel (alertes)

---

## 14. Organisation & Ressources

### 👥 Équipe Cible MVP (6 mois)

**Product & Design:**
- 1 Product Manager / PO (full-time)
- 1 UX/UI Designer (full-time)

**Engineering:**
- 1 Tech Lead / Backend (full-time)
- 1 Fullstack (Next.js + tRPC) (full-time)
- 1 Mobile Dev (React Native / Expo) (full-time)
- 1 DevOps (part-time 50%)

**Quality & Ops:**
- 1 QA (part-time 50%)
- 1 Community & Growth (part-time 50%)

**Support & Moderation:**
- External / shared initially (on-demand)
- Internal hire à partir 500 users actifs

**Total:** ~5.5 FTE

---

### 💰 Estimations Coûts

**Développement MVP (6 mois):**

**Équipe (France/EU):**
- PM: 5k€/mois × 6 = 30k€
- Designer: 4k€/mois × 6 = 24k€
- Tech Lead: 7k€/mois × 6 = 42k€
- Fullstack: 5k€/mois × 6 = 30k€
- Mobile: 5k€/mois × 6 = 30k€
- DevOps: 3k€/mois × 6 = 18k€
- QA: 2k€/mois × 6 = 12k€
- Growth: 2k€/mois × 6 = 12k€

**Total salaires:** ~200k€

**OU Outsource (Nearshore):**
- Team externe: 60-100k€ (délais +risque)

---

**Infra & Run (6 mois):**

- AWS/GCP: 500-2k€/mois = 3-12k€
- Stripe fees: ~2.5% GMV (variable)
- Tools (GitHub, Sentry, etc.): 200€/mois = 1.2k€
- Domaines, certs: 500€

**Total infra:** 5-15k€

---

**Marketing Pilote:**

- Campus activation: 5k€
- Digital ads: 2k€
- Ambassadeurs: 1.5k€
- Events: 1k€

**Total marketing:** 10k€

---

**TOTAL MVP (6 mois):** **215-225k€** (équipe EU) ou **75-125k€** (outsource)

---

**Run Rate Post-MVP (mensuel):**

- Salaires: 30k€/mois (équipe core)
- Infra: 2-5k€/mois
- Marketing: 5-10k€/mois (scale)
- Ops: 1-2k€/mois

**Total:** 38-47k€/mois

**Breakeven estimé:** ~120-150k€ GMV/mois (avec take-rate 15%)

---

## 15. Prochaines Étapes Immédiates

### ✅ Semaine 1-2: Validation & Specs

- [ ] Valider business model avec stakeholders
- [ ] Finaliser specs techniques détaillées
- [ ] Créer maquettes Figma (key flows)
- [ ] Setup repository (monorepo Turborepo)
- [ ] Recruter/assigner équipe

### ✅ Semaine 3-4: Infrastructure

- [ ] Provisioning cloud (AWS/GCP)
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Stripe account + sandbox
- [ ] Domaines + SSL
- [ ] Monitoring basics (Sentry)

### ✅ Semaine 5-8: Sprint 1 (Auth)

- [ ] Schema DB (Postgres)
- [ ] Auth backend (JWT)
- [ ] Pages signup/login (web + mobile)
- [ ] OAuth Google
- [ ] Profile pages

### ✅ Semaine 9-12: Sprint 2 (Tasks)

- [ ] CRUD tasks
- [ ] Search & filters
- [ ] Geolocation integration
- [ ] Categories & tags

---

**Document maintenu par:** Product Team ImuTask  
**Dernière révision:** 3 octobre 2025  
**Prochaine révision:** Après validation pilote (Décembre 2025)
