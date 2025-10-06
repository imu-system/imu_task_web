# 🗺️ Feuille de Route - ImuTask Web

**Version:** 0.1.0  
**Dernière mise à jour:** 3 octobre 2025  
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

### Phase 1: Fondations & Infrastructure ✅ (80% complété)

**Statut:** 🟢 En cours

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

#### 🔄 En cours
- [ ] Configuration Firebase complète (Auth, Firestore, Storage)
- [ ] Variables d'environnement et secrets
- [ ] Middleware d'authentification

#### 📋 À faire
- [ ] Tests unitaires de base
- [ ] Documentation technique des composants
- [ ] Configuration CI/CD

---

### Phase 2: Authentification & Profils 🟡 (30% complété)

**Statut:** 🟡 En développement

#### ✅ Complété
- [x] Pages de connexion/inscription (UI)
- [x] Design des formulaires d'authentification
- [x] Traductions pour l'authentification

#### 🔄 En cours
- [ ] Intégration Firebase Authentication
- [ ] Connexion avec Google OAuth
- [ ] Gestion des sessions utilisateur
- [ ] Middleware de protection des routes

#### 📋 À faire
- [ ] Réinitialisation de mot de passe
- [ ] Vérification d'email
- [ ] Page de profil fonctionnelle
- [ ] Upload d'avatar utilisateur
- [ ] Gestion des rôles (Client/Prestataire)
- [ ] Système de compétences pour les prestataires
- [ ] Validation des profils prestataires

**Date cible:** 15 novembre 2025

---

### Phase 3: Gestion des Tâches 🟡 (40% complété)

**Statut:** 🟡 En développement

#### ✅ Complété
- [x] Composant NewTaskForm avec validation multi-étapes
- [x] Schéma de validation Zod pour les tâches
- [x] Interface utilisateur du formulaire de tâche
- [x] Types TypeScript pour les tâches
- [x] Données de test (placeholder-data.ts)

#### 🔄 En cours
- [ ] Intégration Firestore pour la création de tâches
- [ ] Système de catégories de tâches
- [ ] Géolocalisation des tâches

#### 📋 À faire
- [ ] Page de liste des tâches avec filtres (catégorie, prix, distance)
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

### Phase 5: Messagerie & Communication � (85% complété)

**Statut:** � En développement actif

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

#### 📋 À faire
- [ ] Notifications de nouveaux messages
- [ ] Upload de fichiers/images dans le chat
- [ ] Système de notifications push (web)
- [ ] Archivage de conversations
- [ ] Integration dashboard (stats + recent messages)
- [ ] Security rules Firestore pour messages
- [ ] Tests avec données réelles

**Date cible:** 10 janvier 2026

---

### Phase 6: Paiements & Portefeuille 🔴 (5% complété)

**Statut:** 🔴 Planifié

#### ✅ Complété
- [x] Structure de dossiers pour les paiements
- [x] Traductions pour les paiements

#### 📋 À faire
- [ ] Intégration Stripe Connect (accounts, transfers, webhooks)
- [ ] Page de portefeuille utilisateur (balance, transactions)
- [ ] Système de dépôt sécurisé (escrow: authorize → capture à complétion)
- [ ] Historique des transactions avec filtres & export
- [ ] Gestion des retraits pour prestataires (payouts, KYC requis)
- [ ] Système de commissions (take-rate 12-20% configurable)
- [ ] Tips optionnels post-mission
- [ ] Factures automatiques (PDF génération)
- [ ] Remboursements et litiges (automatic refund triggers)
- [ ] Webhooks Stripe (payment_intent, transfer, dispute)
- [ ] Réconciliation automatique (BullMQ workers)

**Date cible:** 31 janvier 2026

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

### Phase 8: Tableaux de Bord & Analytics 🟡 (25% complété)

**Statut:** 🟡 En développement

#### ✅ Complété
- [x] Composants de dashboard (client et prestataire)
- [x] Cartes de statistiques de base
- [x] Intégration Recharts pour graphiques

#### 📋 À faire
- [ ] Connexion aux données réelles
- [ ] Graphiques de revenus pour prestataires
- [ ] Statistiques de tâches pour clients
- [ ] Analytics d'activité utilisateur
- [ ] Export de rapports
- [ ] Tableau de bord admin

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

### Phase 11: Tests, Optimisation & Lancement 🔴 (0% complété)

**Statut:** 🔴 Non démarré

#### 📋 À faire
- [ ] Tests E2E (Playwright/Cypress)
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
| Phase 1: Fondations | 80% | 🔴 Critique | 🟢 En cours |
| Phase 2: Authentification | 30% | 🔴 Critique | 🟡 En cours |
| Phase 3: Tâches | 40% | 🔴 Critique | 🟡 En cours |
| Phase 4: Offres & Réservations | 10% | 🟡 Haute | 🔴 Planifié |
| Phase 5: Messagerie | 5% | 🟡 Haute | 🔴 Planifié |
| Phase 6: Paiements | 5% | 🟡 Haute | 🔴 Planifié |
| Phase 7: Avis | 0% | 🟢 Moyenne | 🔴 Non démarré |
| Phase 8: Dashboards | 25% | 🟢 Moyenne | 🟡 En cours |
| Phase 9: Avancées | 0% | ⚪ Faible | 🔴 Non démarré |
| Phase 10: IA & Intelligence | 0% | 🟡 Haute | 🔴 Non démarré |
| Phase 11: Lancement | 0% | 🔴 Critique | 🔴 Non démarré |

**Progression globale du projet: 19.5%**

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

### Sprint actuel: 3 octobre - 17 octobre 2025

1. **Configuration Firebase complète** (Priorité: Critique)
   - Configurer Firebase Auth
   - Créer les collections Firestore
   - Configurer Firebase Storage
   - Mettre en place les règles de sécurité

2. **Authentification fonctionnelle** (Priorité: Critique)
   - Implémenter la connexion/inscription
   - Ajouter OAuth Google
   - Créer le middleware de protection

3. **Création de tâches fonctionnelle** (Priorité: Haute)
   - Connecter le formulaire à Firestore
   - Implémenter la validation côté serveur
   - Ajouter la géolocalisation

4. **Profils utilisateurs** (Priorité: Haute)
   - Page de profil fonctionnelle
   - Upload d'avatar
   - Gestion des compétences

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

---

## 🤝 Contribution

Pour contribuer au projet:
1. Vérifier les issues dans le tracker de bugs
2. Consulter cette roadmap pour les tâches prioritaires
3. Suivre les conventions de code établies
4. Créer des branches descriptives
5. Soumettre des PRs avec descriptions détaillées

---

**Dernière révision:** 3 octobre 2025  
**Prochaine révision prévue:** 17 octobre 2025
