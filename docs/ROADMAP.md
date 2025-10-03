# 🗺️ Feuille de Route - ImuTask Web

**Version:** 0.1.0  
**Dernière mise à jour:** 3 octobre 2025  
**Statut global:** 🟡 En développement actif

---

## 📊 Vue d'ensemble du projet

ImuTask est une plateforme web permettant de connecter des clients avec des prestataires de services pour diverses tâches. Le projet utilise Next.js 15, Firebase, et une architecture multilingue (en, fr, de, es, ja).

### 🎯 Objectifs principaux
- Permettre aux utilisateurs de poster des tâches avec des budgets
- Matcher automatiquement les prestataires qualifiés
- Faciliter la communication directe client-prestataire
- Gérer les paiements et les réservations de manière sécurisée

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
- [ ] Page de liste des tâches avec filtres
- [ ] Page de détails d'une tâche
- [ ] Édition/suppression de tâches
- [ ] Recherche de tâches (texte + filtres)
- [ ] Système de statuts de tâches (Open, In Progress, Completed, Cancelled)
- [ ] Intégration de cartes pour la localisation
- [ ] Matching automatique des prestataires (algorithme)
- [ ] Notifications de nouvelles tâches pertinentes

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

### Phase 5: Messagerie & Communication 🔴 (5% complété)

**Statut:** 🔴 Planifié

#### ✅ Complété
- [x] Structure de dossiers pour le chat
- [x] Types TypeScript pour les messages

#### 📋 À faire
- [ ] Interface de messagerie en temps réel
- [ ] Intégration Firebase Realtime Database ou Firestore
- [ ] Liste des conversations
- [ ] Notifications de nouveaux messages
- [ ] Upload de fichiers/images dans le chat
- [ ] Système de notifications push (web)
- [ ] Indicateur de lecture des messages
- [ ] Archivage de conversations

**Date cible:** 10 janvier 2026

---

### Phase 6: Paiements & Portefeuille 🔴 (5% complété)

**Statut:** 🔴 Planifié

#### ✅ Complété
- [x] Structure de dossiers pour les paiements
- [x] Traductions pour les paiements

#### 📋 À faire
- [ ] Intégration Stripe ou solution de paiement
- [ ] Page de portefeuille utilisateur
- [ ] Système de dépôt sécurisé (escrow)
- [ ] Historique des transactions
- [ ] Gestion des retraits pour prestataires
- [ ] Système de commissions
- [ ] Factures automatiques
- [ ] Remboursements et litiges

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

### Phase 10: Tests, Optimisation & Lancement 🔴 (0% complété)

**Statut:** 🔴 Non démarré

#### 📋 À faire
- [ ] Tests E2E (Playwright/Cypress)
- [ ] Tests de charge et performance
- [ ] Optimisation des images et assets
- [ ] Optimisation SEO
- [ ] Configuration du monitoring (Sentry)
- [ ] Documentation utilisateur
- [ ] Guide de démarrage
- [ ] Beta testing avec utilisateurs réels
- [ ] Corrections finales
- [ ] Déploiement en production

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
| Phase 10: Lancement | 0% | 🔴 Critique | 🔴 Non démarré |

**Progression globale du projet: 19.5%**

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
