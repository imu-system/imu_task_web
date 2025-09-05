# Feuille de Route de Développement pour ImuTask

Ce document décrit les étapes planifiées pour faire évoluer le prototype ImuTask en une application web complète, sécurisée et intelligente.

---

### **Étape 1 : Authentification et Gestion des Utilisateurs**

**Objectif :** Mettre en place un système d'authentification sécurisé et une base de données pour les informations des utilisateurs.

1.  **Mise en place de Firebase Authentication :**
    *   [ ] Créer un fichier de configuration Firebase (`src/lib/firebase.ts`) pour initialiser les services Firebase côté client.
    *   [ ] Implémenter la logique d'inscription (`Sign Up`) avec email/mot de passe en utilisant `firebase/auth`.
    *   [ ] Implémenter la logique de connexion (`Sign In`) et de déconnexion.
    *   [ ] Afficher les erreurs d'authentification à l'utilisateur (ex: mot de passe incorrect).

2.  **Création d'une collection `users` dans Firestore :**
    *   [ ] Lors de l'inscription, créer un document dans une collection `users` de Firestore avec l'UID de l'utilisateur comme identifiant de document.
    *   [ ] Stocker les informations de base : nom, email, rôle (client/prestataire), date de création du compte.

3.  **Gestion de la Session Utilisateur :**
    *   [ ] Créer un `AuthProvider` (React Context) pour gérer l'état de l'utilisateur connecté et le rendre accessible dans toute l'application.
    *   [ ] Protéger les routes du `/dashboard` pour rediriger les utilisateurs non connectés vers la page de connexion.
    *   [ ] Mettre à jour l'interface (header, etc.) pour afficher dynamiquement l'état connecté/déconnecté.

---

### **Étape 2 : Gestion des Missions avec Firestore**

**Objectif :** Remplacer les données statiques par une base de données temps réel pour rendre les missions dynamiques.

1.  **Migration vers Firestore :**
    *   [ ] Créer une collection `tasks` dans Firestore.
    *   [ ] Modifier le formulaire de création de mission (`CreateTaskForm`) pour écrire un nouveau document dans la collection `tasks`. Le document doit contenir un `clientId` correspondant à l'UID de l'utilisateur connecté.
    *   [ ] Modifier la page du dashboard (`/dashboard`) pour lire et afficher la liste des missions depuis Firestore en temps réel.
    *   [ ] Modifier la page de détail de mission (`/dashboard/tasks/[id]`) pour récupérer les données de la mission correspondante depuis Firestore.

2.  **Règles de Sécurité Firestore :**
    *   [ ] Écrire et déployer des règles de sécurité pour la collection `tasks`.
    *   [ ] Permettre la lecture de toutes les missions par tout utilisateur authentifié.
    *   [ ] Restreindre la création de missions aux utilisateurs authentifiés.
    *   [ ] N'autoriser la modification ou la suppression d'une mission qu'à son créateur (`clientId`).

---

### **Étape 3 : Système d'Offres et de Messagerie**

**Objectif :** Permettre l'interaction cruciale entre les clients et les prestataires.

1.  **Logique des Offres :**
    *   [ ] Créer une sous-collection `offers` pour chaque document `task`.
    *   [ ] Implémenter la logique du formulaire `OfferForm` pour qu'un prestataire puisse créer un nouveau document dans la sous-collection `offers`.
    *   [ ] Afficher les offres soumises sur la page de détail de la mission pour le client.
    *   [ ] Ajouter une fonctionnalité "Accepter l'offre" qui met à jour le statut de la mission (`assigned`) et de l'offre (`accepted`), et assigne un `providerId` à la mission.

2.  **Messagerie en Temps Réel :**
    *   [ ] Concevoir un modèle de données pour les conversations, par exemple une collection `chats` où chaque document représente une conversation entre deux utilisateurs concernant une mission.
    *   [ ] Créer une page de messagerie (`/dashboard/messages`) qui liste les conversations de l'utilisateur.
    *   [ ] Développer une interface de chat qui permet l'échange de messages en temps réel en utilisant `onSnapshot` de Firestore.

---

### **Étape 4 : Améliorations avec l'IA (Genkit)**

**Objectif :** Enrichir l'expérience utilisateur avec des fonctionnalités intelligentes.

1.  **Modération de Contenu :**
    *   [ ] Créer un flow Genkit qui prend un texte en entrée et utilise un modèle de langage pour évaluer s'il contient du contenu inapproprié (discours haineux, spam, etc.).
    *   [ ] Intégrer ce flow (de manière asynchrone) lors de la création d'une mission et de l'envoi d'un message pour signaler les contenus problématiques.

2.  **Matching Intelligent Prestataire-Mission :**
    *   [ ] Enrichir le profil utilisateur avec des champs pour les compétences et les zones géographiques préférées.
    *   [ ] Développer un flow Genkit qui reçoit l'ID d'un prestataire et renvoie une liste de missions recommandées en fonction de son profil et des missions disponibles.
    *   [ ] Afficher ces recommandations sur le dashboard du prestataire.

3.  **Aide à la Tarification :**
    *   [ ] Créer un flow Genkit qui analyse la description et la catégorie d'une nouvelle mission.
    *   [ ] Le flow recherchera dans la base de données des missions similaires terminées pour suggérer une fourchette de prix juste au client lors de la création de la mission.

---

### **Étape 5 : Paiements et Finalisation**

**Objectif :** Sécuriser les transactions et implémenter un système de réputation.

1.  **Intégration des Paiements (ex: Stripe Connect) :**
    *   [ ] Mettre en place l'onboarding des prestataires pour qu'ils puissent recevoir des paiements.
    *   [ ] Intégrer le tunnel de paiement pour que le client paie la mission lorsqu'il accepte une offre. Les fonds seront séquestrés.
    *   [ ] Créer un mécanisme pour que le client puisse "libérer" le paiement une fois la mission terminée.
    *   [ ] Gérer les remboursements et les litiges simples.

2.  **Système d'Avis et de Notation :**
    *   [ ] Une fois le paiement libéré, permettre aux deux parties de se laisser mutuellement une note (sur 5 étoiles) et un commentaire.
    *   [ ] Stocker ces avis dans une collection `reviews`.
    *   [ ] Calculer et afficher la note moyenne sur le profil de chaque utilisateur.

---

### **Étape 6 : Internationalisation (i18n) et Accessibilité**

**Objectif :** Rendre l'application accessible à un public plus large et améliorer l'inclusivité.

1.  **Mise en place de l'Internationalisation :**
    *   [ ] Intégrer une bibliothèque d'i18n compatible avec Next.js (ex: `next-intl`).
    *   [ ] Extraire toutes les chaînes de caractères codées en dur (en français) des composants et les placer dans des fichiers de ressources (ex: `fr.json`, `en.json`).
        *   [ ] Pages et navigation du dashboard
        *   [ ] Formulaire de création de mission
        *   [ ] Page de profil et détails de mission
    *   [ ] Implémenter un sélecteur de langue dans l'interface utilisateur (par exemple, dans l'en-tête ou le pied de page).
    *   [ ] Configurer le routage pour prendre en charge différentes langues (ex: `/fr/dashboard`, `/en/dashboard`).

2.  **Amélioration de l'Accessibilité (a11y) :**
    *   [ ] Effectuer un audit d'accessibilité de l'application.
    *   [ ] S'assurer que tous les éléments interactifs sont accessibles au clavier.
    *   [ ] Ajouter des attributs ARIA (Accessible Rich Internet Applications) pertinents là où c'est nécessaire.
    *   [ ] Garantir un contraste de couleurs suffisant pour une bonne lisibilité.
