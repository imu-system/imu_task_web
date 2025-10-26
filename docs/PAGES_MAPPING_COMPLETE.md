# Mapping Complet - Pages Admin & Dashboard à Implémenter

**Date**: 20 octobre 2025  
**Dernière mise à jour**: 26 octobre 2025 - Session MVP V1.0 Complétée  
**Projet**: IMU Task Web  
**Objectif**: Inventaire exhaustif des pages à connecter à Firebase/Firestore

---

## � Nouveautés Session MVP V1.0 - COMPLÉTÉE (26 oct 2025)

### MVP V1.0 : 16/16 tâches terminées ✅

**Dashboards implémentés** :
- ✅ `/dashboard/client/page.tsx` - Dashboard particuliers (données réelles Firestore)
- ✅ `/dashboard/professional/page.tsx` - Dashboard pros (stats temps réel, CA, missions)
- ✅ `/dashboard/senior/page.tsx` - Dashboard seniors (accessibilité avancée, vocal, GPS, SOS)

**Fonctionnalités majeures** :
- ✅ Recherche Algolia ultra-rapide (<20ms, typo tolerance, highlighting)
- ✅ Upload photo profil (WebP compression, Firebase Storage)
- ✅ Analytics Firebase complet (tracking événements)
- ✅ Page édition AccountType (`/profile/account-type`)
- ✅ Tests e2e Playwright (60+ tests, 80%+ coverage)

**Documentation production** :
- ✅ Guide déploiement complet (40 tâches)
- ✅ Quick start guide (5 étapes, <30 min)
- ✅ Credentials production template
- ✅ Guide indexation Algolia

**Statut** : 🟢 **PRODUCTION READY**

---

## 🚀 Prochaine Phase : Pages Publiques & Authentification

**Objectif** : Améliorer expérience publique et onboarding (2-3 jours)

**À implémenter** :
- [ ] Landing page - Section "Pour qui ?" (3 cards profils)
- [ ] Pages /signup et /signin modernisées (layout 2 colonnes)
- [ ] Page /onboarding améliorée (choix accountType)
- [ ] Navigation cohérente (i18n routing, breadcrumbs)
- [ ] Tests e2e authentification complète

---

## �🆕 Nouveautés Session 5 - Phase 1 (Historique)

### Système AccountType implémenté ✅

**Nouvelles pages ajoutées** :
- `/onboarding/page.tsx` - Sélection type de compte après signup
- `/dashboard/page.tsx` - Router intelligent (redirection selon accountType)
- `/dashboard/client/page.tsx` - Dashboard particuliers
- `/dashboard/senior/page.tsx` - Dashboard seniors (CareLink)

**Hook créé** :
- `useAccountType()` - Lecture temps réel du accountType depuis Firestore

**Navigation adaptée** :
- `DashboardNav` affiche des menus différents selon le type de compte (Individual, Professional, Senior)

**i18n fixes appliqués** :
- 4 fichiers corrigés pour utiliser `@/navigation` au lieu de `next/navigation`
- Documentation complète dans `I18N_LINKS_AUDIT.md`

---

## 📊 Vue d'ensemble

### Statistiques globales

| Catégorie | Pages identifiées | Implémentées | À implémenter | Priorité |
|-----------|------------------|--------------|---------------|----------|
| **Admin** | 95 pages | ~15 (16%) | ~80 (84%) | 🔴 Haute |
| **Dashboard User** | 71 pages | ~24 (34%) | ~47 (66%) | 🟡 Moyenne |
| **TOTAL** | **166 pages** | **~39 (23%)** | **~127 (77%)** | - |

---

## 🔴 PAGES ADMIN (95 pages totales)

### ✅ DÉJÀ IMPLÉMENTÉES (15 pages - 16%)

#### Validation & Vérification
1. ✅ `/admin/kyb/page.tsx` - Validation SIRET professionnels (Task 8)
2. ✅ `/admin/kyc/page.tsx` - Validation documents KYC (existant)
3. ✅ `/admin/invoices/page.tsx` - Validation factures pros (Task 8)

#### Gestion Utilisateurs
4. ✅ `/admin/users/page.tsx` - Liste utilisateurs (existant partiel)
5. ✅ `/admin/users/[id]/page.tsx` - Détail utilisateur

#### Professionnels
6. ✅ `/admin/professionals/page.tsx` - Liste professionnels (Task 8)

#### Réservations
7. ✅ `/admin/bookings/page.tsx` - Liste réservations
8. ✅ `/admin/bookings/[id]/page.tsx` - Détail réservation

#### Notifications
9. ✅ `/admin/notifications/page.tsx` - Gestion notifications
10. ✅ `/admin/notifications/[id]/page.tsx` - Détail notification

#### Dashboard
11. ✅ `/admin/page.tsx` - Dashboard principal admin
12. ✅ `/admin/analytics/page.tsx` - Statistiques globales

#### Tâches
13. ✅ `/admin/tasks/page.tsx` - Liste tâches
14. ✅ `/admin/tasks/[id]/page.tsx` - Détail tâche

#### Avis
15. ✅ `/admin/reviews/page.tsx` - Gestion avis clients
16. ✅ `/admin/reviews/[id]/page.tsx` - Détail avis

---

### 🔴 À IMPLÉMENTER (80 pages - 84%)

#### 🟥 PRIORITÉ CRITIQUE (15 pages)

##### Paiements & Finances
1. ⚠️ `/admin/payments/transactions/page.tsx`
   - **Description**: Liste toutes les transactions de la plateforme
   - **Collections Firestore**: `transactions`, `payments`
   - **Fonctionnalités**:
     * Liste paginée avec filtres (date, statut, montant, utilisateur)
     * Recherche par transaction ID, user email, booking ID
     * Calcul totaux (volume journalier, commission plateforme)
     * Export CSV pour comptabilité
     * Graphiques évolution des paiements
   - **Complexité**: 🔴 Élevée (stripe integration)

2. ⚠️ `/admin/payments/payouts/page.tsx`
   - **Description**: Gestion des virements vers professionnels
   - **Collections**: `payouts`, `professionals`, `bankAccounts`
   - **Fonctionnalités**:
     * Calcul automatique commission plateforme
     * Validation virements (pending → processing → completed)
     * Détection fraude (montants suspects, fréquence anormale)
     * Export SEPA pour banque
     * Historique des rejets
   - **Complexité**: 🔴 Élevée (banking, compliance)

3. ⚠️ `/admin/payments/transfers/page.tsx`
   - **Description**: Suivi des transferts entre comptes
   - **Collections**: `transfers`, `wallets`
   - **Fonctionnalités**:
     * Monitoring transferts temps réel
     * Alertes échecs de paiement
     * Réconciliation automatique
   - **Complexité**: 🟡 Moyenne

4. ⚠️ `/admin/payments/recon/page.tsx`
   - **Description**: Réconciliation bancaire automatique
   - **Collections**: `transactions`, `bankStatements`, `reconciliations`
   - **Fonctionnalités**:
     * Import relevés bancaires CSV
     * Matching automatique transactions
     * Détection écarts (missing, duplicates)
     * Export rapports comptables
   - **Complexité**: 🔴 Très élevée (algorithmes matching)

##### Litiges & Support
5. ⚠️ `/admin/disputes/page.tsx`
   - **Description**: Gestion des litiges client/pro
   - **Collections**: `disputes`, `bookings`, `messages`
   - **Fonctionnalités**:
     * Workflow dispute: ouvert → investigation → résolu/refusé
     * Timeline événements (messages, remboursements, preuves)
     * Assignation admin responsable
     * Templates réponses pré-écrites
     * Statistiques taux résolution
   - **Complexité**: 🟡 Moyenne

6. ⚠️ `/admin/disputes/[id]/page.tsx`
   - **Description**: Détail dispute avec chat intégré
   - **Fonctionnalités**:
     * Vue complète historique booking
     * Chat 3-parties (client, pro, admin)
     * Upload preuves (photos, factures)
     * Actions: rembourser, fermer, escalader
   - **Complexité**: 🟡 Moyenne

7. ⚠️ `/admin/support/tickets/page.tsx`
   - **Description**: Système de tickets support
   - **Collections**: `tickets`, `users`, `ticketMessages`
   - **Fonctionnalités**:
     * Queue tickets par priorité (low, medium, high, urgent)
     * Assignation auto/manuelle
     * SLA tracking (temps réponse, résolution)
     * Tags catégories (billing, technical, account)
     * Statistiques agent (tickets résolus, temps moyen)
   - **Complexité**: 🟡 Moyenne

8. ⚠️ `/admin/support/tickets/[id]/page.tsx`
   - **Description**: Détail ticket avec thread
   - **Fonctionnalités**:
     * Conversation complète
     * Actions rapides (templates, macros)
     * Change status, priority, assignee
     * Notes internes admin
   - **Complexité**: 🟢 Faible

##### Modération
9. ⚠️ `/admin/moderation/content/page.tsx`
   - **Description**: Modération contenu signalé
   - **Collections**: `contentReports`, `professionals`, `reviews`, `listings`
   - **Fonctionnalités**:
     * Queue contenu flaggé (spam, inappropriate, scam)
     * Revue profils pros suspects
     * Revue avis frauduleux
     * Actions: approuver, supprimer, bannir utilisateur
     * Machine learning flags (toxicity score)
   - **Complexité**: 🔴 Élevée (ML, moderation tools)

10. ⚠️ `/admin/moderation/reports/page.tsx`
    - **Description**: Rapports de signalement
    - **Collections**: `reports`, `users`
    - **Fonctionnalités**:
      * Liste signalements (abuse, harassment, fraud)
      * Détail incident avec preuves
      * Actions disciplinaires (warning, suspension, ban)
      * Historique sanctions par utilisateur
    - **Complexité**: 🟡 Moyenne

11. ⚠️ `/admin/moderation/watchlist/page.tsx`
    - **Description**: Liste surveillance utilisateurs suspects
    - **Collections**: `watchlist`, `users`, `fraudAlerts`
    - **Fonctionnalités**:
      * Détection comportements anormaux
      * Scoring risque utilisateur
      * Alertes automatiques (multiples comptes, cartes volées)
    - **Complexité**: 🔴 Élevée (fraud detection)

##### Pricing & Promotions
12. ⚠️ `/admin/pricing/fees/page.tsx`
    - **Description**: Configuration frais plateforme
    - **Collections**: `pricingRules`, `categories`
    - **Fonctionnalités**:
      * Définir % commission par catégorie service
      * Frais fixes/variables
      * Règles promotionnelles
      * Simulation impact changements prix
    - **Complexité**: 🟡 Moyenne

13. ⚠️ `/admin/pricing/coupons/page.tsx`
    - **Description**: Gestion codes promo
    - **Collections**: `coupons`, `couponUsage`
    - **Fonctionnalités**:
      * Créer coupons (%, montant fixe, livraison gratuite)
      * Limites usage (par user, total, dates)
      * Codes uniques vs génériques
      * Statistiques utilisation
    - **Complexité**: 🟢 Faible

14. ⚠️ `/admin/pricing/coupons/edit/[id]/page.tsx`
    - **Description**: Éditer coupon existant
    - **Complexité**: 🟢 Faible

15. ⚠️ `/admin/offers/page.tsx`
    - **Description**: Offres spéciales et campagnes
    - **Collections**: `offers`, `campaigns`
    - **Fonctionnalités**:
      * Créer offres limitées (early bird, flash sale)
      * Ciblage géographique
      * AB testing offres
    - **Complexité**: 🟡 Moyenne

---

#### 🟧 PRIORITÉ HAUTE (25 pages)

##### CMS (Content Management)
16. 🟠 `/admin/cms/pages/page.tsx`
    - **Description**: Gestion pages statiques (About, FAQ, etc.)
    - **Collections**: `cmsPages`
    - **Fonctionnalités**:
      * Éditeur WYSIWYG ou Markdown
      * Versioning pages
      * Preview avant publication
      * SEO metadata (title, description, OG tags)
      * i18n support
    - **Complexité**: 🟡 Moyenne

17. 🟠 `/admin/cms/pages/new/page.tsx` - Créer page
18. 🟠 `/admin/cms/pages/edit/[id]/page.tsx` - Éditer page
19. 🟠 `/admin/cms/pages/view/[id]/page.tsx` - Preview page

20. 🟠 `/admin/cms/posts/page.tsx`
    - **Description**: Blog/articles plateforme
    - **Collections**: `posts`, `authors`, `postCategories`
    - **Fonctionnalités**:
      * Éditeur rich text
      * Upload images (featured, gallery)
      * Catégories et tags
      * Scheduling publication
      * Statistiques (vues, engagement)
    - **Complexité**: 🟡 Moyenne

21. 🟠 `/admin/cms/posts/new/page.tsx` - Nouveau post
22. 🟠 `/admin/cms/posts/edit/[id]/page.tsx` - Éditer post
23. 🟠 `/admin/cms/posts/preview/[id]/page.tsx` - Preview post

24. 🟠 `/admin/cms/faq/page.tsx`
    - **Description**: Questions fréquentes
    - **Collections**: `faqItems`, `faqCategories`
    - **Fonctionnalités**:
      * Gestion Q&A par catégorie
      * Ordering (drag & drop)
      * Recherche intelligente FAQ
      * Statistiques questions populaires
    - **Complexité**: 🟢 Faible

25. 🟠 `/admin/cms/policies/page.tsx`
    - **Description**: Politiques légales (CGU, CGV, etc.)
    - **Collections**: `policies`
    - **Fonctionnalités**:
      * Versioning (tracking changes)
      * Signature électronique requise
      * Audit trail acceptations
    - **Complexité**: 🟡 Moyenne

##### Services & Catégories
26. 🟠 `/admin/services/categories/page.tsx`
    - **Description**: Catégories de services
    - **Collections**: `serviceCategories`, `services`
    - **Fonctionnalités**:
      * Arbre hiérarchique catégories
      * Icônes et images catégorie
      * Activer/désactiver catégories
      * Mapping avec professionnels
    - **Complexité**: 🟡 Moyenne

27. 🟠 `/admin/services/categories/new/page.tsx` - Nouvelle catégorie
28. 🟠 `/admin/services/categories/edit/[id]/page.tsx` - Éditer catégorie

29. 🟠 `/admin/categories/page.tsx`
    - **Description**: Gestion générale catégories
    - **Complexité**: 🟡 Moyenne

##### Notifications
30. 🟠 `/admin/notifications/broadcast/page.tsx`
    - **Description**: Envoi notifications en masse
    - **Collections**: `broadcasts`, `users`
    - **Fonctionnalités**:
      * Ciblage audience (rôle, location, activity)
      * Templates prédéfinis
      * Scheduling envoi
      * Tracking délivrabilité et clics
    - **Complexité**: 🟡 Moyenne

31. 🟠 `/admin/notifications/templates/page.tsx`
    - **Description**: Templates notifications
    - **Collections**: `notificationTemplates`
    - **Fonctionnalités**:
      * Variables dynamiques {{user.name}}
      * Multi-canal (push, email, SMS)
      * A/B testing templates
    - **Complexité**: 🟢 Faible

32. 🟠 `/admin/notifications/templates/edit/[id]/page.tsx` - Éditer template

##### Intégrations
33. 🟠 `/admin/integrations/page.tsx`
    - **Description**: Intégrations tierces
    - **Collections**: `integrations`, `apiKeys`
    - **Fonctionnalités**:
      * Liste intégrations (Stripe, Twilio, SendGrid, etc.)
      * Configuration API keys
      * Health checks
      * Logs événements
    - **Complexité**: 🟡 Moyenne

34. 🟠 `/admin/integrations/webhooks/page.tsx`
    - **Description**: Gestion webhooks
    - **Collections**: `webhooks`, `webhookLogs`
    - **Fonctionnalités**:
      * Créer endpoints webhook
      * Retry logic échecs
      * Logs requêtes/réponses
      * Signature HMAC sécurité
    - **Complexité**: 🟡 Moyenne

35. 🟠 `/admin/integrations/webhooks/edit/[id]/page.tsx` - Éditer webhook

##### Partenariats
36. 🟠 `/admin/partnerships/page.tsx`
    - **Description**: Gestion partenaires B2B
    - **Collections**: `partners`, `partnerContracts`
    - **Fonctionnalités**:
      * Onboarding partenaires
      * Accès API partenaire
      * Revenue sharing tracking
      * Contrats et factures
    - **Complexité**: 🟡 Moyenne

37. 🟠 `/admin/partnerships/[id]/page.tsx` - Détail partenaire

38. 🟠 `/admin/offers/[id]/page.tsx` - Détail offre

##### Academy (Formation)
39. 🟠 `/admin/academy/page.tsx`
    - **Description**: Gestion plateforme formation pros
    - **Collections**: `courses`, `lessons`, `certifications`
    - **Fonctionnalités**:
      * Créer cours vidéo
      * Quiz et évaluations
      * Certifications
      * Progression apprenants
    - **Complexité**: 🔴 Élevée (LMS)

40. 🟠 `/admin/catalog-analytics/page.tsx`
    - **Description**: Analytics catalogue services
    - **Collections**: `analytics`, `services`, `searches`
    - **Fonctionnalités**:
      * Services populaires
      * Taux conversion par catégorie
      * Recherches infructueuses
      * Recommandations optimisation
    - **Complexité**: 🟡 Moyenne

---

#### 🟨 PRIORITÉ MOYENNE (25 pages)

##### i18n (Internationalisation)
41. 🟡 `/admin/i18n/keys/page.tsx`
    - **Description**: Gestion clés traduction
    - **Collections**: `translations`, `locales`
    - **Fonctionnalités**:
      * Liste clés FR/EN/JA
      * Détection clés manquantes
      * Import/export JSON
      * Validation syntaxe
    - **Complexité**: 🟡 Moyenne

42. 🟡 `/admin/i18n/io/page.tsx`
    - **Description**: Import/Export traductions
    - **Fonctionnalités**:
      * Upload CSV/JSON
      * Export pour traducteurs
      * Merge automatique
    - **Complexité**: 🟢 Faible

##### Settings & Configuration
43. 🟡 `/admin/settings/page.tsx`
    - **Description**: Paramètres généraux plateforme
    - **Collections**: `settings`, `config`
    - **Fonctionnalités**:
      * Nom plateforme, logo
      * Maintenance mode
      * Contact emails
      * Social media links
    - **Complexité**: 🟢 Faible

44. 🟡 `/admin/settings/flags/page.tsx`
    - **Description**: Feature flags
    - **Collections**: `featureFlags`
    - **Fonctionnalités**:
      * Activer/désactiver features
      * Rollout progressif (%)
      * AB testing
      * Targeting par user segment
    - **Complexité**: 🟡 Moyenne

45. 🟡 `/admin/settings/sla/page.tsx`
    - **Description**: SLA (Service Level Agreements)
    - **Collections**: `slaRules`, `slaMetrics`
    - **Fonctionnalités**:
      * Définir temps réponse max
      * Alertes dépassement SLA
      * Rapports conformité
    - **Complexité**: 🟢 Faible

##### Rapports
46. 🟡 `/admin/reports/page.tsx`
    - **Description**: Centre rapports
    - **Collections**: `reports`
    - **Fonctionnalités**:
      * Rapports pré-définis
      * Rapports personnalisés
      * Scheduling envoi email
      * Export PDF/Excel
    - **Complexité**: 🟡 Moyenne

47. 🟡 `/admin/reports/availability/page.tsx`
    - **Description**: Disponibilité professionnels
    - **Collections**: `availability`, `professionals`
    - **Fonctionnalités**:
      * Taux disponibilité par zone
      * Heures creuses/pleines
      * Prédictions demande
    - **Complexité**: 🟡 Moyenne

48. 🟡 `/admin/reports/schedules/page.tsx`
    - **Description**: Planning global
    - **Collections**: `bookings`, `professionals`
    - **Fonctionnalités**:
      * Vue calendrier global
      * Détection conflits
      * Optimisation affectation
    - **Complexité**: 🟡 Moyenne

49. 🟡 `/admin/reports/schedules/edit/[id]/page.tsx` - Éditer planning

##### Support - Réponses pré-écrites
50. 🟡 `/admin/support/canned/page.tsx`
    - **Description**: Réponses pré-écrites support
    - **Collections**: `cannedResponses`
    - **Fonctionnalités**:
      * Templates réponses fréquentes
      * Variables {{user.name}}
      * Catégorisation
      * Statistiques usage
    - **Complexité**: 🟢 Faible

51. 🟡 `/admin/support/canned/edit/[id]/page.tsx` - Éditer réponse

52. 🟡 `/admin/support/tickets/new/page.tsx` - Créer ticket

##### Audit & Conformité
53. 🟡 `/admin/audit/page.tsx`
    - **Description**: Logs audit complets
    - **Collections**: `auditLogs`
    - **Fonctionnalités**:
      * Tracking actions admin (CRUD)
      * Who/What/When/Where
      * Filtres par user, action, date
      * Export RGPD
    - **Complexité**: 🟡 Moyenne

54. 🟡 `/admin/kyc/[providerId]/page.tsx`
    - **Description**: KYC par professionnel
    - **Fonctionnalités**:
      * Détail documents soumis
      * Historique validation
      * Comparaison versions
    - **Complexité**: 🟢 Faible

##### Modération - Détails
55. 🟡 `/admin/moderation/reports/view/[id]/page.tsx`
    - **Description**: Détail rapport signalement
    - **Complexité**: 🟢 Faible

##### Pricing - Guidance
56. 🟡 `/admin/pricing/guidance/page.tsx`
    - **Description**: Recommandations prix pros
    - **Collections**: `pricingRecommendations`, `marketData`
    - **Fonctionnalités**:
      * Prix moyens par service/zone
      * Benchmarking concurrence
      * Suggestions optimisation
    - **Complexité**: 🔴 Élevée (market analysis)

---

#### 🟩 PRIORITÉ BASSE (15 pages)

##### CMS Posts - Preview
57. 🟢 `/admin/cms/posts/[id]/preview/page.tsx` - Preview post ID

##### Support Tickets - Nouveau
58. 🟢 `/admin/support/tickets/new/page.tsx` - Déjà compté ci-dessus

59-65. **Pages en doublon ou déjà comptées**

---

## 🔵 PAGES DASHBOARD UTILISATEUR (71 pages totales)

### ✅ DÉJÀ IMPLÉMENTÉES (24 pages - 34%)

#### Onboarding
1. ✅ `/onboarding/page.tsx` - Sélection type de compte (AccountType)
   - **Collections**: `users`
   - **Fonctionnalités**:
     * Choix entre Individual, Professional, Senior
     * Enregistrement du accountType dans Firestore
     * Redirection vers dashboard approprié
   - **Complexité**: 🟢 Faible

2. ✅ `/dashboard/become-pro/onboarding/page.tsx` - Onboarding professionnel
   - **Collections**: `users`, `professionals`
   - **Fonctionnalités**:
     * Multi-step (SIRET, services, planning)
     * Validation KYC basique
     * Configuration initiale profil pro
   - **Complexité**: 🟡 Moyenne

#### Profil & KYC
3. ✅ `/dashboard/profile/page.tsx` - Profil utilisateur
4. ✅ `/dashboard/profile/edit/page.tsx` - Édition profil
5. ✅ `/dashboard/kyc-submit/page.tsx` - Soumission KYC

#### Dashboards par type de compte (System AccountType - Phase 1)
6. ✅ `/dashboard/page.tsx` - Router intelligent basé sur accountType
   - **Fonctionnalités**:
     * Lecture accountType depuis Firestore
     * Redirection vers /client, /pro ou /senior
     * Gestion états de chargement
   - **Hook**: `useAccountType` (lecture temps réel)
   - **Complexité**: 🟢 Faible

7. ✅ `/dashboard/client/page.tsx` - Dashboard particulier (Individual)
   - **Collections**: `tasks`, `bookings`, `messages`
   - **Fonctionnalités**:
     * Focus publication tâches
     * Statistiques simplifiées (tâches actives, réservations)
     * Accès rapide création tâche
   - **Complexité**: 🟢 Faible

8. ✅ `/dashboard/senior/page.tsx` - Dashboard senior (CareLink)
   - **Collections**: `tasks`, `bookings`, `careProviders`
   - **Fonctionnalités**:
     * Interface simplifiée (grande typo, contraste élevé)
     * Tâches d'assistance quotidienne
     * Contact rapide aidants
   - **Complexité**: 🟢 Faible

#### Professionnel
9. ✅ `/dashboard/pro/page.tsx` - Dashboard pro (Professional)
   - **Utilise**: accountType system
   - **Fonctionnalités**: Statistiques revenus, réservations à venir, avis clients
10. ✅ `/dashboard/pro/invoices/page.tsx` - Factures pro (Task 6)
11. ✅ `/dashboard/pro/quotes/page.tsx` - Devis pro (Task 5)
12. ✅ `/dashboard/pro/portfolio/page.tsx` - Portfolio (Task 4)

#### Réservations
13. ✅ `/dashboard/bookings/page.tsx` - Réservations
14. ✅ `/dashboard/bookings/[id]/page.tsx` - Détail réservation

#### Messages
15. ✅ `/dashboard/messages/page.tsx` - Messagerie
16. ✅ `/dashboard/messages/[threadId]/page.tsx` - Thread message

#### Notifications
17. ✅ `/dashboard/notifications/page.tsx` - Notifications

#### Tâches
18. ✅ `/dashboard/tasks/page.tsx` - Liste tâches
19. ✅ `/dashboard/tasks/[id]/page.tsx` - Détail tâche
20. ✅ `/dashboard/tasks/create/page.tsx` - Créer tâche
21. ✅ `/dashboard/tasks/new/page.tsx` - Nouvelle tâche

#### Avis
22. ✅ `/dashboard/reviews/page.tsx` - Avis

#### Recherche
23. ✅ `/dashboard/search/page.tsx` - Recherche

#### Hors ligne
24. ✅ `/dashboard/offline/page.tsx` - Mode offline

---

### 🔴 À IMPLÉMENTER (47 pages - 66%)

#### 🟥 PRIORITÉ CRITIQUE (12 pages)

##### Wallet & Paiements
1. ⚠️ `/dashboard/wallet/page.tsx`
   - **Description**: Portefeuille utilisateur
   - **Collections**: `wallets`, `transactions`
   - **Fonctionnalités**:
     * Solde actuel
     * Historique transactions
     * Graphiques dépenses/revenus
     * Ajout fonds (carte bancaire)
   - **Complexité**: 🔴 Élevée (Stripe integration)

2. ⚠️ `/dashboard/wallet/transactions/page.tsx`
   - **Description**: Historique détaillé transactions
   - **Collections**: `transactions`
   - **Fonctionnalités**:
     * Liste paginée avec filtres
     * Export PDF/CSV
     * Catégorisation dépenses
   - **Complexité**: 🟡 Moyenne

3. ⚠️ `/dashboard/wallet/payouts/page.tsx`
   - **Description**: Retraits pour professionnels
   - **Collections**: `payouts`, `bankAccounts`
   - **Fonctionnalités**:
     * Demander virement
     * Ajouter/modifier IBAN
     * Historique virements
     * Statuts (pending, processing, completed)
   - **Complexité**: 🔴 Élevée (banking, KYC requis)

4. ⚠️ `/dashboard/wallet/withdraw/page.tsx`
   - **Description**: Retrait vers carte bancaire
   - **Collections**: `withdrawals`
   - **Fonctionnalités**:
     * Montant à retirer
     * Frais appliqués
     * Délai traitement estimé
   - **Complexité**: 🟡 Moyenne

##### Quotes (Devis) - Détail
5. ⚠️ `/dashboard/quotes/[id]/page.tsx`
   - **Description**: Détail devis reçu
   - **Collections**: `quotes`
   - **Fonctionnalités**:
     * Voir détail lignes devis
     * Accepter/refuser devis
     * Chat avec professionnel
     * Convertir en réservation
   - **Complexité**: 🟡 Moyenne

##### Become Professional
6. ⚠️ `/dashboard/become-pro/page.tsx`
   - **Description**: Devenir professionnel
   - **Collections**: `users`, `professionals`
   - **Fonctionnalités**:
     * Page info devenir pro
     * Prérequis (KYC, SIRET)
     * Avantages plateforme
     * CTA démarrer onboarding
   - **Complexité**: 🟢 Faible

7. ⚠️ `/dashboard/become-pro/onboarding/page.tsx`
   - **Description**: Onboarding professionnel
   - **Collections**: `onboardingProgress`
   - **Fonctionnalités**:
     * Wizard 7 étapes (déjà créé Task 7)
     * Progression sauvegardée
     * Validation à chaque étape
   - **Complexité**: 🟡 Moyenne (déjà implémenté ?)

##### Become Provider
8. ⚠️ `/dashboard/become-provider/page.tsx`
   - **Description**: Devenir fournisseur services
   - **Collections**: `providers`
   - **Fonctionnalités**:
     * Similaire become-pro
     * Formulaire inscription provider
   - **Complexité**: 🟢 Faible

##### Provider Dashboard
9. ⚠️ `/dashboard/provider/page.tsx`
   - **Description**: Dashboard fournisseur
   - **Collections**: `providers`, `providerStats`
   - **Fonctionnalités**:
     * Stats ventes
     * Commandes en cours
     * Revenus
   - **Complexité**: 🟡 Moyenne

##### Offers
10. ⚠️ `/dashboard/offers/page.tsx`
    - **Description**: Offres reçues (deals, promos)
    - **Collections**: `userOffers`, `offers`
    - **Fonctionnalités**:
      * Liste offres personnalisées
      * Filtrage (actives, expirées)
      * Actions (utiliser, ignorer)
    - **Complexité**: 🟢 Faible

##### Partnerships
11. ⚠️ `/dashboard/partnerships/page.tsx`
    - **Description**: Partenariats utilisateur
    - **Collections**: `userPartnerships`, `partners`
    - **Fonctionnalités**:
      * Programmes fidélité
      * Cashback partenaires
      * Offres exclusives
    - **Complexité**: 🟢 Faible

##### Referrals
12. ⚠️ `/dashboard/referrals/page.tsx`
    - **Description**: Programme parrainage
    - **Collections**: `referrals`, `referralRewards`
    - **Fonctionnalités**:
      * Code parrainage unique
      * Liste parrainés
      * Récompenses gagnées
      * Partage social
    - **Complexité**: 🟡 Moyenne

---

#### 🟧 PRIORITÉ HAUTE (15 pages)

##### Academy (Formation)
13. 🟠 `/dashboard/academy/page.tsx`
    - **Description**: Catalogue cours
    - **Collections**: `courses`, `enrollments`
    - **Fonctionnalités**:
      * Liste cours disponibles
      * Filtres (catégorie, niveau, durée)
      * Inscription cours
    - **Complexité**: 🟡 Moyenne

14. 🟠 `/dashboard/academy/course/[id]/page.tsx`
    - **Description**: Détail cours
    - **Collections**: `courses`, `lessons`, `progress`
    - **Fonctionnalités**:
      * Vidéos leçons
      * Quiz
      * Téléchargements ressources
      * Tracking progression
    - **Complexité**: 🔴 Élevée (video player, progress tracking)

15. 🟠 `/dashboard/academy/certificates/page.tsx`
    - **Description**: Certificats obtenus
    - **Collections**: `certificates`
    - **Fonctionnalités**:
      * Liste certifications
      * Télécharger PDF
      * Partager LinkedIn
    - **Complexité**: 🟢 Faible

16. 🟠 `/dashboard/academy/certificate/[id]/page.tsx`
    - **Description**: Détail certificat
    - **Complexité**: 🟢 Faible

##### Stats & Analytics
17. 🟠 `/dashboard/stats/page.tsx`
    - **Description**: Statistiques personnelles
    - **Collections**: `userStats`
    - **Fonctionnalités**:
      * Réservations ce mois
      * Dépenses totales
      * Services favoris
      * Graphiques évolution
    - **Complexité**: 🟡 Moyenne

18. 🟠 `/dashboard/stats/compare/page.tsx`
    - **Description**: Comparaison périodes
    - **Fonctionnalités**:
      * Comparer mois/années
      * Économies réalisées
      * Tendances
    - **Complexité**: 🟡 Moyenne

19. 🟠 `/dashboard/stats/goals/page.tsx`
    - **Description**: Objectifs utilisateur
    - **Collections**: `userGoals`
    - **Fonctionnalités**:
      * Définir objectifs (budget, fréquence)
      * Tracking progression
      * Notifications rappels
    - **Complexité**: 🟢 Faible

20. 🟠 `/dashboard/stats/missions/page.tsx`
    - **Description**: Missions/challenges
    - **Collections**: `missions`, `userMissions`
    - **Fonctionnalités**:
      * Gamification
      * Récompenses déblocables
      * Leaderboard
    - **Complexité**: 🟡 Moyenne

21. 🟠 `/dashboard/stats/tax/page.tsx`
    - **Description**: Documents fiscaux
    - **Collections**: `taxDocuments`
    - **Fonctionnalités**:
      * Récapitulatif annuel dépenses
      * Export pour déclaration impôts
      * Factures téléchargeables
    - **Complexité**: 🟡 Moyenne

##### Templates
22. 🟠 `/dashboard/templates/page.tsx`
    - **Description**: Templates tâches récurrentes
    - **Collections**: `taskTemplates`
    - **Fonctionnalités**:
      * Créer template tâche
      * Réutiliser templates
      * Partager templates publics
    - **Complexité**: 🟢 Faible

23. 🟠 `/dashboard/templates/[id]/page.tsx` - Détail template
24. 🟠 `/dashboard/templates/edit/[id]/page.tsx` - Éditer template
25. 🟠 `/dashboard/templates/new/page.tsx` - Nouveau template
26. 🟠 `/dashboard/templates/share/[id]/page.tsx` - Partager template

27. 🟠 `/dashboard/referrals/history/page.tsx`
    - **Description**: Historique parrainages
    - **Complexité**: 🟢 Faible

---

#### 🟨 PRIORITÉ MOYENNE (12 pages)

##### Availability
28. 🟡 `/dashboard/availability/page.tsx`
    - **Description**: Disponibilités (pour pros)
    - **Collections**: `availability`
    - **Fonctionnalités**:
      * Calendrier disponibilités
      * Plages horaires
      * Jours off
    - **Complexité**: 🟡 Moyenne

29. 🟡 `/dashboard/availability/settings/page.tsx`
    - **Description**: Paramètres disponibilité
    - **Fonctionnalités**:
      * Délai préavis min
      * Durée rendez-vous par défaut
      * Temps déplacement
    - **Complexité**: 🟢 Faible

##### Market (Marketplace)
30. 🟡 `/dashboard/market/page.tsx`
    - **Description**: Place de marché
    - **Collections**: `marketplaceListings`
    - **Fonctionnalités**:
      * Catalogue produits/services
      * Filtres avancés
      * Comparateur prix
    - **Complexité**: 🟡 Moyenne

31. 🟡 `/dashboard/market/performance/page.tsx`
    - **Description**: Performance vendeur
    - **Collections**: `sellerStats`
    - **Fonctionnalités**:
      * Ventes ce mois
      * Note moyenne
      * Taux réponse
    - **Complexité**: 🟡 Moyenne

32. 🟡 `/dashboard/market/pricing/page.tsx`
    - **Description**: Stratégie prix marketplace
    - **Complexité**: 🟡 Moyenne

33. 🟡 `/dashboard/market/zones/page.tsx`
    - **Description**: Zones intervention marketplace
    - **Complexité**: 🟢 Faible

##### Notifications Settings
34. 🟡 `/dashboard/notifications/preferences/page.tsx`
    - **Description**: Préférences notifications
    - **Collections**: `notificationPreferences`
    - **Fonctionnalités**:
      * Activer/désactiver par type
      * Canaux (push, email, SMS)
      * Fréquence digest
    - **Complexité**: 🟢 Faible

##### Profile - KYC
35. 🟡 `/dashboard/profile/kyc/page.tsx`
    - **Description**: Statut KYC utilisateur
    - **Fonctionnalités**:
      * Voir documents soumis
      * Statut validation
      * Resoumission si rejeté
    - **Complexité**: 🟢 Faible

##### Referrals - Rewards
36. 🟡 `/dashboard/referrals/rewards/page.tsx`
    - **Description**: Récompenses parrainage
    - **Collections**: `referralRewards`
    - **Fonctionnalités**:
      * Liste récompenses disponibles
      * Utiliser/échanger points
      * Historique
    - **Complexité**: 🟢 Faible

##### Dev Tools (Développeurs)
37. 🟡 `/dashboard/dev/page.tsx`
    - **Description**: Outils développeurs
    - **Collections**: `apiKeys`, `webhooks`
    - **Fonctionnalités**:
      * API keys
      * Documentation API
      * Sandbox testing
    - **Complexité**: 🟡 Moyenne

38. 🟡 `/dashboard/dev/audiences/page.tsx` - Gestion audiences
39. 🟡 `/dashboard/dev/audit/page.tsx` - Logs API
40. 🟡 `/dashboard/dev/fixtures/page.tsx` - Données test
41. 🟡 `/dashboard/dev/flags/page.tsx` - Feature flags user
42. 🟡 `/dashboard/dev/health/page.tsx` - Santé API
43. 🟡 `/dashboard/dev/rollouts/page.tsx` - Rollouts progressifs
44. 🟡 `/dashboard/dev/sdk-keys/page.tsx` - Clés SDK
45. 🟡 `/dashboard/dev/webhook-tester/page.tsx` - Test webhooks

---

#### 🟩 PRIORITÉ BASSE (9 pages)

46-48. **Pages Admin dupliquées dans dashboard** (à supprimer ou refactoriser)

---

## 📋 RÉSUMÉ ACTIONNABLE

### Par priorité

| Priorité | Admin | Dashboard | Total | Effort estimé |
|----------|-------|-----------|-------|---------------|
| 🔴 **CRITIQUE** | 15 | 12 | **27** | 8-10 semaines |
| 🟠 **HAUTE** | 25 | 15 | **40** | 10-12 semaines |
| 🟡 **MOYENNE** | 25 | 12 | **37** | 6-8 semaines |
| 🟢 **BASSE** | 15 | 8 | **23** | 3-4 semaines |
| **TOTAL** | **80** | **47** | **127** | **27-34 semaines** |

### Roadmap suggérée

#### Phase 1 : Paiements & Finances (6 semaines)
- Admin Payments (transactions, payouts, transfers, recon)
- User Wallet (page, transactions, payouts, withdraw)
- Stripe integration complète

#### Phase 2 : Support & Modération (4 semaines)
- Admin Support (tickets, disputes)
- Admin Moderation (content, reports, watchlist)
- User Referrals & Offers

#### Phase 3 : Content & Marketing (5 semaines)
- Admin CMS (pages, posts, FAQ, policies)
- Admin Pricing (fees, coupons, guidance)
- Admin Notifications (broadcast, templates)

#### Phase 4 : Marketplace & Academy (6 semaines)
- Admin Academy & Catalog Analytics
- User Academy (courses, certificates)
- User Market (performance, pricing, zones)

#### Phase 5 : Configuration & Outils (4 semaines)
- Admin Settings, i18n, Integrations
- Admin Reports & Analytics
- User Dev Tools, Stats, Templates

#### Phase 6 : Polissage & Optimisation (2 semaines)
- Pages priorité basse
- Refactorisation doublons
- Tests E2E ajoutés

---

## 🎯 Prochaines étapes recommandées

1. **Valider la roadmap** avec les stakeholders
2. **Prioriser Phase 1** (Paiements) car critique business
3. **Créer tickets Jira/GitHub** pour chaque page
4. **Estimer en story points** chaque feature
5. **Assigner équipe** (frontend, backend, design)
6. **Commencer Sprint 1** : Admin Payments Transactions

---

**Total estimation** : **27-34 semaines** (6-8 mois) avec une équipe de 2-3 développeurs full-stack.

**Note** : Certaines pages complexes (ML moderation, fraud detection, LMS academy) peuvent nécessiter des sprints supplémentaires ou des expertises spécialisées.
