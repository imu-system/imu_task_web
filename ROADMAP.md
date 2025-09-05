# Feuille de Route de Développement pour ImuTask (Version Complète)

Ce document décrit les étapes planifiées pour construire ImuTask en se basant sur le schéma de données détaillé.

---

### **Étape 1 : Fondations - Authentification et Profil Utilisateur (Enrichi)**

**Objectif :** Mettre en place une base solide pour la gestion des utilisateurs, allant au-delà de la simple connexion.

1.  **Authentification (Terminé) :**
    *   [x] Configuration de Firebase Auth.
    *   [x] Logique d'inscription, connexion, déconnexion.

2.  **Création des collections `users` et `profiles` :**
    *   [ ] À l'inscription, créer un document dans `users` avec les informations de base (`email`, `roles`, `status`, `createdAt`, etc.).
    *   [ ] Simultanément, créer un document lié dans une nouvelle collection `profiles` avec `userId`, `displayName`, et des valeurs par défaut pour `averageRating: 0`, `reviewsCount: 0`, `languages: ['fr']`, etc.
    *   [ ] Mettre à jour le hook `useAuth` pour qu'il retourne non seulement l'objet `User` de Firebase Auth, mais aussi le profil Firestore.

3.  **Page de Profil Utilisateur :**
    *   [ ] Créer une page `/dashboard/profile/edit` permettant à l'utilisateur de modifier son `displayName`, `bio`, `photoUrl`, `languages` et `skills`.
    *   [ ] Afficher les informations non modifiables comme l'email, la note moyenne et le nombre d'avis.

---

### **Étape 2 : Gestion des Adresses et Catégories de Service**

**Objectif :** Permettre aux utilisateurs de gérer leurs adresses et d'avoir une liste de services structurée.

1.  **Gestion des Adresses (`addresses`) :**
    *   [ ] Sur la page de profil, créer une section pour ajouter, voir, et supprimer des adresses.
    *   [ ] Utiliser une API de géocodage (ex: Google Places) pour auto-compléter les adresses et récupérer latitude/longitude.
    *   [ ] Permettre de définir une adresse par défaut.

2.  **Gestion des Catégories (`serviceCategories`) :**
    *   [ ] (Admin) Créer une interface simple (non visible pour les utilisateurs normaux) pour gérer les catégories de service.
    *   [ ] Migrer les catégories de tâches existantes (codées en dur) vers la collection `serviceCategories` dans Firestore.
    *   [ ] Mettre à jour le formulaire de création de mission pour qu'il charge dynamiquement les catégories depuis Firestore.

---

### **Étape 3 : Gestion des Missions (Mise à Niveau)**

**Objectif :** Aligner la création et l'affichage des missions sur le nouveau modèle de données `Task`.

1.  **Mise à jour du Formulaire de Création :**
    *   [ ] Remplacer le champ de localisation texte par un sélecteur d'adresses enregistrées par l'utilisateur.
    *   [ ] Remplacer le champ de date unique par deux champs : `timeWindowStart` et `timeWindowEnd`.
    *   [ ] Ajouter des champs pour `estimatedDurationMin`, `priceOffered`, et la possibilité de joindre des fichiers (`attachments`).
    *   [ ] Au lieu de stocker la catégorie en texte, stocker l'`id` de la `ServiceCategory`.

2.  **Mise à jour de l'Affichage des Missions :**
    *   [ ] Mettre à jour `TaskCard` et la page de détail de mission pour afficher les nouvelles informations (fenêtre de temps, etc.).
    *   [ ] Implémenter la logique pour récupérer et afficher les informations de l'adresse et de la catégorie via leurs IDs.

---

### **Étape 4 : Système d'Offres (`offers`)**

**Objectif :** Permettre aux prestataires de faire des offres sur les missions.

1.  **Logique des Offres :**
    *   [ ] Créer une sous-collection `offers` pour chaque document `task`.
    *   [ ] Sur la page de détail d'une mission, si l'utilisateur est un prestataire (`provider`), afficher un formulaire pour soumettre une offre.
    *   [ ] Le formulaire permettra de proposer un prix (`proposedPrice`) et un message.
    *   [ ] Le client verra la liste des offres sur la page de la mission.
    *   [ ] Implémenter le bouton "Accepter l'offre".

2.  **Action d'Accepter une Offre :**
    *   [ ] L'acceptation mettra à jour le statut de l'offre à `accepted`.
    *   [ ] Elle mettra à jour le statut de la `Task` à `matched`.
    *   [ ] Elle créera un nouveau document dans la collection `bookings`.

---

### **Étape 5 : Réservation et Messagerie (`bookings` & `threads`)**

**Objectif :** Formaliser l'accord et permettre la communication.

1.  **Création du Booking :**
    *   [ ] Le document `Booking` contiendra les IDs de la tâche, du client, du prestataire, le montant convenu et le statut `scheduled`.
    *   [ ] Créer une page "Mes Missions" (`/dashboard/bookings`) où clients et prestataires voient leurs missions à venir et passées.

2.  **Messagerie en Temps Réel (`threads` & `messages`) :**
    *   [ ] Lorsqu'un booking est créé, créer également un `Thread` lié à la `Task`.
    *   [ ] Le `Thread` listera les `participants` (client et prestataire).
    *   [ ] Développer une interface de messagerie (`/dashboard/messages/[threadId]`) où les participants peuvent échanger des `Messages` en temps réel.

---

### **Étape 6 : Paiements et Transactions (`transactions`, `transfers`, `payouts`)**

**Objectif :** Intégrer un système de paiement sécurisé (ex: Stripe Connect).

1.  **Paiement et Séquestre :**
    *   [ ] Lors de l'acceptation de l'offre, intégrer un tunnel de paiement pour que le client autorise le paiement.
    *   [ ] Créer un document `Transaction` avec le statut `authorized`.
2.  **Finalisation et Transfert :**
    *   [ ] Lorsque la mission est marquée comme "terminée" par le client, capturer le paiement. Mettre à jour la `Transaction`.
    *   [ ] Créer un `Transfer` pour virer les fonds (moins la commission) vers le compte du prestataire.
3.  **Paiements aux Prestataires (`payouts`) :**
    *   [ ] Mettre en place une logique pour regrouper les transferts et initier des `Payouts` vers le compte bancaire du prestataire.

---

### **Étape 7 : Avis et Litiges (`reviews` & `disputes`)**

**Objectif :** Mettre en place un système de réputation et de résolution de problèmes.

1.  **Système d'Avis (`reviews`) :**
    *   [ ] Une fois un `Booking` complété, permettre au client et au prestataire de se laisser un avis (note + commentaire).
    *   [ ] Créer un document dans la collection `reviews`.
    *   [ ] Mettre à jour les `averageRating` and `reviewsCount` dans le `Profile` de l'utilisateur noté.

2.  **Gestion des Litiges (`disputes`) :**
    *   [ ] Permettre à un utilisateur d'ouvrir un litige sur un `Booking`.
    *   [ ] Créer une interface pour que les modérateurs/administrateurs puissent examiner et résoudre les litiges.

---

### **Étape 8 : Notifications et Disponibilités**

**Objectif :** Améliorer l'engagement et la planification.

1.  **Notifications (`notifications`) :**
    *   [ ] Créer un service qui génère des notifications (ex: nouvelle offre, message reçu, etc.).
    *   [ ] Afficher les notifications dans l'application.

2.  **Gestion des Disponibilités (`availabilities`) :**
    *   [ ] Permettre aux prestataires de définir leurs horaires de travail récurrents sur leur profil.
    *   [ ] Permettre de définir des exceptions (jours de congé).
    *   [ ] Utiliser ces informations pour filtrer les prestataires ou suggérer des créneaux.
