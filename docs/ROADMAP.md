# 🗺️ Feuille de Route - ImuTask Web

**Version:** 0.3.0  
**Dernière mise à jour:** 24 octobre 2025  
**Statut global:** 🟡 En développement actif

---

## 📊 Vue d'ensemble du projet

**Pitch:** ImuTask est une plateforme mobile-first et web (admin/marketing) qui met en relation des jeunes (18–30 ans) offrant des micro-services locaux (courses, ménage, accompagnement, aide numérique, etc.) et des particuliers/associations ayant besoin d'un service occasionnel — avec paiements sécurisés, traçabilité complète et montée en compétences via des badges et micro-formations.

**Vision long terme:** Devenir l'écosystème local référent où les jeunes gagnent un revenu légal, se forment et montrent leur valeur, tandis que les communautés locales accèdent à une main-d'œuvre fiable, traçable et qualifiée.

**Stack technique:** Next.js 15, Firebase/Postgres, Expo React Native, architecture multilingue (en, fr, de, es, ja, it, pt).

### 🎯 Objectifs principaux
- **Pour les jeunes/prestataires:** revenus flexibles, traçabilité, badges/certificats, micro-formations, sécurité
- **Pour les clients:** accès rapide à des prestataires locaux vérifiables, paiement sécurisé, résolution de litiges
- **Pour les partenaires:** canaux d'engagement local, reporting RSE, co-financement de missions solidaires
- **Pour la plateforme:** revenus via commissions (12-20%), abonnements ImuPro, services premium, sponsoring

### 👥 Publics cibles & Personas

- **Jeune Prestataire (18–30, étudiant):** chercheur de revenus d'appoint, flexible, mobile-first, valeurs sociales
- **Client particulier:** parent occupé, senior, personne active, cherche simplicité et sécurité
- **Association locale/ONG:** besoin de volontaires rémunérés ponctuels
- **Admin/Opérations:** modération, KYC, payouts, support
- **Sponsor/Partenaire campus:** recherche d'impact et visibilité

### 🎯 Périmètre MVP → V1 → V2

**MVP (Priorité absolue - Version Web):**
- Auth/profils multi-rôles (client/provider)
- Création/recherche Tasks (texte + géoloc + créneau)
- Offers (propositions providers)
- Booking (acceptation + statut)
- Paiements Stripe Connect (authorize/capture/refund)
- Messagerie in-app (texte + attachements, traçabilité)
- KYC basique (upload pièce + selfie)
- Reviews & rating post-mission
- Admin minimal (KYC queue, disputes, paiements)

**V1 (Post-validation MVP):**
- Disponibilités/calendrier prestataire
- Auto-accept rules & matching basique
- Offline queue, retry & status page
- Notifications push & email
- Templates/Packs
- ImuAcademy (mini-cours + badges)
- Referrals & Rewards

**V2 (Scale & Growth):**
- ImuChallenge (concours)
- WebRTC audio (calls + recording avec consentement)
- Pricing intelligence (IA suggest_pricing)
- Advanced Trust & Safety (ML detection)
- Feature flags & experiments
- Marketplace professionnel/packs premium

---

## 🚀 Phases de développement

### Phase 1: Fondations & Infrastructure ✅ (100% complété)

**Statut:** ✅ Complété

#### ✅ Complété
- [x] Configuration Next.js 15 avec TypeScript
- [x] Structure de projet organisée (features, components, lib)
- [x] Configuration Tailwind CSS + shadcn/ui
- [x] Système d'internationalisation (i18n) avec next-intl (5 langues)
- [x] Configuration de base Firebase App Hosting
- [x] Composants UI de base (boutons, cartes, formulaires, etc.)
- [x] Layout principal avec navigation
- [x] Système de routing Next.js App Router
- [x] Configuration Genkit AI pour catégorisation des compétences
- [x] Configuration Firebase complète (Auth, Firestore, Storage)
- [x] Variables d'environnement et secrets
- [x] Middleware d'authentification
- [x] Règles de sécurité Firestore & Storage
- [x] Tests unitaires de base (authentification, Firebase)
- [x] Configuration Playwright pour tests E2E

**Date complétée:** 20 octobre 2025

---

### Phase 2: Authentification & Profils ✅ (100% complété)

**Statut:** ✅ Complété

#### ✅ Complété
- [x] Pages de connexion/inscription (UI)
- [x] Design des formulaires d'authentification
- [x] Traductions pour l'authentification
- [x] Intégration Firebase Authentication
- [x] Connexion avec Google OAuth
- [x] Gestion des sessions utilisateur
- [x] Middleware de protection des routes
- [x] Réinitialisation de mot de passe
- [x] Page de profil fonctionnelle
- [x] Upload d'avatar utilisateur
- [x] Gestion des rôles (Client/Prestataire/Admin)
- [x] Système de compétences pour les prestataires
- [x] Page "Become Provider" complète
- [x] Validation des profils prestataires
- [x] Tests unitaires authentification (12 tests)
- [x] Tests E2E authentification flow (7 scénarios)
- [x] Redirection automatique après signup/signin
- [x] AuthContext avec support multi-rôles
- [x] Gestion des erreurs d'authentification

#### 📋 À faire (V2)
- [ ] Vérification d'email obligatoire
- [ ] Authentification 2FA
- [ ] Connexion avec Apple/Facebook

**Date complétée:** 20 octobre 2025

---

### Phase 3: Gestion des Tâches 🟡 (75% complété)

**Statut:** � En cours

#### ✅ Complété
- [x] Composant NewTaskForm avec validation multi-étapes
- [x] Schéma de validation Zod pour les tâches
- [x] Interface utilisateur du formulaire de tâche
- [x] Types TypeScript pour les tâches
- [x] Données de test (placeholder-data.ts)
- [x] Intégration Firestore pour la création de tâches
- [x] Système de catégories de tâches (8 catégories principales)
- [x] **Catalogue de services complet:**
  - [x] ServiceCategorySelector component (250+ lignes)
  - [x] TaskTemplateSelector component (400+ lignes)
  - [x] Wizard création tâche 3 étapes (500+ lignes)
  - [x] 16 templates prédéfinis avec auto-fill
  - [x] 39 tags de compétences organisés
  - [x] Intégration complète i18n (5 langues)
  - [x] Tests manuels validés (responsive + fonctionnel)
  - [x] Documentation complète (API, exemples, guidelines)

#### � En cours
- [ ] Géolocalisation des tâches (Google Maps API)
- [ ] Page de liste des tâches avec filtres

#### 📋 À faire
- [ ] Page de détails d'une tâche (photos, map, provider suggestions)
- [ ] Édition/suppression de tâches
- [ ] Recherche de tâches (texte + filtres + géolocalisation)
- [ ] Système de statuts: draft → publish → offers → accept → booking → complete → review
- [ ] Intégration de cartes (PostGIS/ElasticSearch pour recherche locale)
- [ ] Matching automatique des prestataires (algorithme basé skills + distance + rating)
- [ ] Notifications de nouvelles tâches pertinentes
- [ ] **Trust & Safety:** PII detection (messages), on-platform communications enforced
- [ ] Photo before/after, check-in/out proof
- [ ] SOS button (urgences)

**Date cible:** 30 novembre 2025

---

### Phase 4: Système d'Offres & Réservations 🔴 (10% complété)

**Statut:** 🔴 Planifié

#### ✅ Complété
- [x] Structure de dossiers pour les features (offers, bookings)
- [x] Types TypeScript pour les propositions

#### 📋 À faire
- [ ] Page de soumission d'offres pour prestataires
- [ ] Validation et notifications d'offres
- [ ] Système de comparaison d'offres pour clients
- [ ] Acceptation/refus d'offres
- [ ] Création automatique de réservation après acceptation
- [ ] Calendrier de disponibilité pour prestataires
- [ ] Système de confirmation de réservation
- [ ] Gestion des annulations
- [ ] Historique des réservations

**Date cible:** 20 décembre 2025

---

### Phase 5: Messagerie & Notifications ✅ (100% complété)

**Statut:** ✅ Complété

#### ✅ Complété
- [x] Structure de dossiers pour le chat
- [x] Types TypeScript pour les messages
- [x] Bibliothèques backend Firestore (conversations + messages)
- [x] Hooks React personnalisés (useConversations + useMessages)
- [x] Composants UI (ConversationList, MessageThread, MessageInput, etc.)
- [x] Interface de messagerie en temps réel
- [x] Intégration Firestore pour les messages
- [x] Liste des conversations
- [x] Indicateur de lecture des messages
- [x] Traductions i18n (EN, FR, ES, DE, JA)
- [x] Page route /messages
- [x] Real-time listeners Firestore
- [x] Unread counts par utilisateur
- [x] **Système de notifications complet** (Phases 1-5)
  - [x] Infrastructure Firestore (types, helpers, real-time listeners)
  - [x] Hooks React Query (pagination, infinite scroll, optimistic updates)
  - [x] Composants UI (NotificationBell, NotificationList, NotificationCenter)
  - [x] Intégration i18n (5 langues)
  - [x] Tests unitaires + E2E (Jest + Playwright)
  - [x] Monitoring & Analytics (Firebase Performance + Analytics + Error Tracking)
  - [x] Création d'index Firestore pour requêtes notifications

#### 📋 À faire (V2)
- [ ] Upload de fichiers/images dans le chat
- [ ] Système de notifications push natives (mobile)
- [ ] Archivage de conversations
- [ ] Security rules Firestore pour messages (production)

**Date complétée:** 6 octobre 2025

---

### Phase 6: Paiements & Portefeuille ✅ (100% complété)

**Statut:** ✅ Complété

#### ✅ Complété
- [x] Structure de dossiers pour les paiements
- [x] Traductions complètes pour les paiements (~500 clés FR + EN)
- [x] **Système KYC complet:**
  - [x] Cloud Functions KYC (submitKYC, approveKYC, rejectKYC, getKYCStatus)
  - [x] Page soumission KYC utilisateur avec upload documents
  - [x] Interface admin KYC (liste demandes, approve/reject, historique)
  - [x] Validation fichiers (PDF/images, 10MB max)
  - [x] Storage rules pour documents KYC
  - [x] Tests E2E KYC (10 scénarios Playwright - infrastructure prête)
  - [x] Notifications KYC (approval/rejection)
- [x] **Pages de gestion des paiements (10 pages):**
  - [x] Admin: Transactions, Payouts, Bank Accounts, Disputes
  - [x] Pro: Payouts Dashboard, Transactions
  - [x] User: Transactions
  - [x] Settings: Payment (bank accounts), Billing (payment methods)
- [x] **API Stripe Webhooks complète:**
  - [x] Endpoint `/api/webhooks/stripe/route.ts` (770 lignes)
  - [x] 9 événements gérés (payment_intent, payout, dispute, refund, account)
  - [x] Signature verification & audit logs
  - [x] Système de notifications automatiques
- [x] **Firestore Configuration:**
  - [x] 11 collections (transactions, payouts, bankAccounts, disputes, etc.)
  - [x] Rules de sécurité
  - [x] Indices pour requêtes
  - [x] Crypto helper (IBAN encryption)
- [x] **Types TypeScript:**
  - [x] PaymentMethodDetails interface
  - [x] DisputeReasonValues enum
  - [x] PaymentMethodStatus enum
- [x] **Documentation:**
  - [x] STRIPE_WEBHOOKS_SETUP.md (guide complet)
  - [x] PHASE1_PAYMENTS_COMPLETED.md (résumé)

#### 📋 À faire (V2)
- [ ] **Déploiement Cloud Functions** (⚠️ Requiert Blaze plan Firebase)
  - [ ] Upgrade vers plan Blaze
  - [ ] Déployer 11 fonctions (4 notifications + 3 admin + 4 KYC)
  - [ ] Tester endpoints en production
  - [ ] Monitoring & logs
- [ ] Intégration Stripe Connect avancée (accounts, transfers)
- [ ] Système de dépôt sécurisé (escrow: authorize → capture à complétion)
- [ ] Système de commissions configurable (take-rate 12-20%)
- [ ] Tips optionnels post-mission
- [ ] Factures automatiques (PDF génération)
- [ ] Réconciliation automatique (BullMQ workers)

**Date complétée:** 23 octobre 2025

---

### Phase 7: Avis & Évaluations 🔴 (0% complété)

**Statut:** 🔴 Non démarré

#### 📋 À faire
- [ ] Système d'évaluation 5 étoiles
- [ ] Rédaction d'avis clients
- [ ] Réponses aux avis par prestataires
- [ ] Affichage des notes moyennes
- [ ] Filtrage et tri par évaluations
- [ ] Signalement d'avis inappropriés
- [ ] Badges de qualité pour prestataires

**Date cible:** 15 février 2026

---

### Phase 8: Tableaux de Bord & Analytics 🟡 (60% complété)

**Statut:** 🟡 En développement

#### ✅ Complété
- [x] Composants de dashboard (client et prestataire)
- [x] Cartes de statistiques de base
- [x] Intégration Recharts pour graphiques
- [x] **Tableau de bord admin complet:**
  - [x] Dashboard admin KYC avec liste demandes
  - [x] Filtres par statut (pending/approved/rejected)
  - [x] Visualisation documents uploadés
  - [x] Actions approve/reject avec raisons
  - [x] Historique des actions admin
  - [x] Cloud Functions gestion rôles admin (assign/revoke/list)
  - [x] Protection routes admin dans middleware

#### 📋 À faire
- [ ] Connexion aux données réelles
- [ ] Graphiques de revenus pour prestataires
- [ ] Statistiques de tâches pour clients
- [ ] Analytics d'activité utilisateur
- [ ] Export de rapports
- [ ] Dashboard analytics global (GMV, bookings, etc.)

**Date cible:** 28 février 2026

---

### Phase 9: Fonctionnalités Avancées 🔴 (0% complété)

**Statut:** 🔴 Non démarré

#### 📋 À faire
- [ ] Système de disputes et résolution
- [ ] Programme de parrainage
- [ ] Favoris et listes sauvegardées
- [ ] Mode sombre
- [ ] Progressive Web App (PWA)
- [ ] Notifications push natives
- [ ] Accessibilité (WCAG 2.1)
- [ ] SEO avancé
- [ ] Intégration réseaux sociaux
- [ ] Support client intégré

**Date cible:** 31 mars 2026

---

### Phase 10: IA & Intelligence 🔴 (0% complété)

**Statut:** 🔴 Non démarré

#### 📋 À faire
- [ ] **NL→Form:** création task via vocal/texte (Genkit + LLM)
- [ ] **Pricing suggéré:** suggestion locale (p50/p75/max) par catégorie & ville
- [ ] **Moderation assistée:** LLM classifier + small models (toxicité/spam)
- [ ] **Ops Copilot:** résumé automatique disputes pour admin
- [ ] **RAG:** stockage docs (TOS, pricing guidance) pour réponses factuelles
- [ ] **Smart Matching:** ML-based provider suggestions
- [ ] **Risk Scoring:** détection patterns suspects (no-show, disputes, chargebacks)
- [ ] **OCR Images:** détection coordonnées dans photos uploadées

**Date cible:** 15 mars 2026

---

### Phase 11: Tests, Optimisation & Lancement � (35% complété)

**Statut:** � En cours

#### ✅ Complété
- [x] **Infrastructure tests E2E (Playwright)**
  - [x] Configuration Playwright avec Chromium
  - [x] Tests E2E authentification (7 scénarios)
  - [x] Tests E2E KYC flow (10 scénarios - infrastructure prête)
  - [x] Génération fixtures de test
  - [x] data-testid ajoutés aux composants critiques
- [x] **Tests unitaires**
  - [x] Tests authentification (12 tests)
  - [x] Tests Firebase initialization
  - [x] Tests hooks personnalisés
- [x] **Documentation technique**
  - [x] Documentation catalogue services (API, exemples)
  - [x] Documentation vision ImuPro
  - [x] Guides de test (manuel + E2E)
  - [x] Documentation sessions de développement

#### 📋 À faire
- [ ] Tests de charge et performance (Artillery/k6)
- [ ] Optimisation des images et assets (Next.js Image)
- [ ] Optimisation SEO (meta tags, sitemap, structured data)
- [ ] Configuration du monitoring (Sentry + Prometheus + Grafana)
- [ ] Documentation utilisateur (guides, FAQs, vidéos)
- [ ] Guide de démarrage pour campus pilotes
- [ ] Beta testing avec utilisateurs réels (50 providers + 50 clients)
- [ ] Corrections finales & polish UX
- [ ] Déploiement en production (Vercel + infra backend)
- [ ] Plan de rollback & incident response

**Date cible:** 30 avril 2026

---

## 📈 Métriques de progression

| Phase | Progression | Priorité | Statut |
|-------|------------|----------|---------|
| Phase 1: Fondations | 100% | 🔴 Critique | ✅ Complété |
| Phase 2: Authentification | 100% | 🔴 Critique | ✅ Complété |
| Phase 3: Tâches | 75% | 🔴 Critique | 🟡 En cours |
| Phase 4: Offres & Réservations | 10% | 🟡 Haute | 🔴 Planifié |
| Phase 5: Messagerie & Notifications | 100% | 🟡 Haute | ✅ Complété |
| Phase 6: Paiements & Portefeuille | 100% | 🟡 Haute | ✅ Complété |
| Phase 7: Avis | 0% | 🟢 Moyenne | 🔴 Non démarré |
| Phase 8: Dashboards | 60% | 🟢 Moyenne | 🟡 En cours |
| Phase 9: Avancées | 0% | ⚪ Faible | 🔴 Non démarré |
| Phase 10: IA & Intelligence | 0% | 🟡 Haute | 🔴 Non démarré |
| Phase 11: Tests & Lancement | 35% | 🔴 Critique | 🟡 En cours |

**Progression globale du projet: 57.7%** 🎉

### 📊 KPIs & Métriques à tracker

**Business:**
- GMV daily/monthly, Take-rate, AOV, #bookings
- Fill rate (#bookings / #tasks published)
- Conversion publish→booking
- Time publish→first offer

**Qualité:**
- No-show rate, Dispute rate
- KYC pass rate, Fraud detection rate
- Review average rating

**Growth:**
- Retention cohorts (D7/D30/D90)
- NPS (Net Promoter Score)
- CAC/LTV ratio
- Referral conversion rate

---

## 🎯 Prochaines étapes prioritaires (Sprint actuel)

### Sprint actuel: 24 octobre - 7 novembre 2025

#### 🎉 Réalisations Sprint précédent (20-24 octobre)
- ✅ **Phase 6 complétée à 100% (Paiements & Portefeuille)**
- ✅ 10 pages de gestion des paiements (Admin, Pro, User, Settings)
- ✅ API Stripe Webhooks complète (9 événements)
- ✅ 11 collections Firestore configurées
- ✅ ~500 clés i18n ajoutées (FR + EN)
- ✅ Types TypeScript complets (PaymentMethodDetails, DisputeReasonValues)
- ✅ Documentation Stripe Webhooks
- ✅ Système de notifications automatiques

#### 🎯 Objectifs Sprint actuel

1. **Compléter Phase 3: Tâches** (Priorité: Critique)
   - [ ] Implémenter géolocalisation (Google Maps API)
   - [ ] Page liste des tâches avec filtres
   - [ ] Page détails d'une tâche
   - [ ] Édition/suppression de tâches
   - [ ] Système de statuts (draft → publish → offers)

2. **Démarrer Phase 4: Offres & Réservations** (Priorité: Haute)
   - [ ] Page soumission d'offres pour prestataires
   - [ ] Système de comparaison d'offres
   - [ ] Acceptation/refus d'offres
   - [ ] Création automatique de réservation

3. **Optimisation & Polish** (Priorité: Moyenne)
   - [ ] Optimisation images (Next.js Image)
   - [ ] SEO de base (meta tags, sitemap)
   - [ ] Performance monitoring
   - [ ] Documentation utilisateur

4. **Tests & Validation** (Priorité: Haute)
   - [ ] Tests manuels des pages paiements
   - [ ] Configuration webhook Stripe en développement
   - [ ] Validation des flows de paiement end-to-end
   - [ ] Tests de sécurité (Firestore rules)

5. **Déploiement Cloud Functions** (⚠️ En attente)
   - ⏳ Requiert upgrade vers Blaze plan Firebase
   - 11 fonctions prêtes à déployer (notifications, admin, KYC)
   - Tests E2E KYC en attente de déploiement

---

## 🔗 Synchronisation avec la version mobile

**Localisation mobile:** `/Users/nathanimogo/Documents/GitHub/imu_task_mobile`

### Points de synchronisation nécessaires:
- [ ] Schéma de base de données Firestore commun
- [ ] API REST ou Cloud Functions partagées
- [ ] Système d'authentification unifié
- [ ] Format de données cohérent
- [ ] Notifications push cross-platform
- [ ] Logique métier partagée

### Réunions de synchronisation:
- Fréquence: Hebdomadaire
- Prochaine réunion: À planifier

---

## 📝 Notes importantes

- Le projet utilise Firebase App Hosting (voir `apphosting.yaml`)
- L'IA Genkit est configurée pour la catégorisation des compétences
- Support de 5 langues: en, fr, de, es, ja
- Architecture basée sur les features pour une meilleure maintenabilité
- Utilisation de shadcn/ui pour les composants UI
- **⚠️ Cloud Functions en attente de déploiement** (requiert Blaze plan)
- Infrastructure tests E2E complète avec Playwright
- Système KYC prêt (UI + backend, déploiement en attente)
- 2900+ lignes de code ajoutées depuis dernière mise à jour

## 🚨 Bloqueurs & Dépendances

### Bloqueurs actifs
- **Cloud Functions déploiement:** Requiert upgrade vers Firebase Blaze plan (payant)
  - 11 fonctions prêtes: 4 notifications + 3 admin + 4 KYC
  - Tests E2E KYC bloqués (soumission nécessite fonction submitKYC)
  - Estimé: ~$5-10/mois en coûts Cloud Functions

### Dépendances externes
- Google Maps API (pour géolocalisation tâches)
- Stripe Connect (pour paiements - Phase 6)
- Service d'email transactionnel (SendGrid/Mailgun)

---

## 🤝 Contribution

Pour contribuer au projet:
1. Vérifier les issues dans le tracker de bugs
2. Consulter cette roadmap pour les tâches prioritaires
3. Suivre les conventions de code établies
4. Créer des branches descriptives
5. Soumettre des PRs avec descriptions détaillées

---

**Dernière révision:** 24 octobre 2025  
**Prochaine révision prévue:** 7 novembre 2025

---

## 📊 Statistiques du projet

**Lignes de code ajoutées depuis 3 octobre 2025:** ~4800+ lignes  
**Tests créés:** 19 tests unitaires + 17 tests E2E  
**Cloud Functions développées:** 11 fonctions (en attente de déploiement)  
**Composants UI créés:** 25+ nouveaux composants  
**Pages complétées:** 18 pages (auth, profils, KYC, admin, catalogue, paiements)  
**Collections Firestore:** 11 collections configurées (paiements)  
**API Webhooks:** 1 endpoint complet (9 événements Stripe)  
**Clés i18n:** ~2500+ clés (5 langues)  
**Documentation:** 12+ fichiers de documentation technique

**Équipe:** 1 développeur full-stack  
**Stack:** Next.js 15, Firebase, Stripe, TypeScript, Tailwind CSS, shadcn/ui, Playwright
