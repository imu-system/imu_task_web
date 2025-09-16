# Feuille de Route de Développement pour ImuTask

## **Étape Prioritaire : Connexion du Profil Utilisateur à Firebase**

**Objectif :** Rendre le profil utilisateur dynamique en le connectant à Firestore pour la persistance des données et à Firebase Storage pour le téléversement de fichiers (photo de profil, documents KYC).

---

### **1. Sauvegarde des Informations du Profil**

**Fichiers concernés :** `src/app/[locale]/dashboard/profile/edit/page.tsx`, `src/hooks/use-auth.tsx`

1.  **Logique d'envoi du formulaire :**
    *   [ ] Dans la fonction `onSubmit` de la page `edit/page.tsx`, remplacer la simulation (`console.log`) par un appel à une fonction `updateUserProfile`.
    *   [ ] Cette fonction `updateUserProfile` prendra les données du formulaire et utilisera la fonction `updateDoc` de Firestore pour mettre à jour le document de l'utilisateur dans la collection `profiles` (ex: `doc(db, 'profiles', user.uid)`).
    *   [ ] Assurer la gestion des états de chargement (`isSaving`) et des erreurs (via `try/catch` et `toast`).

2.  **Gestion de la photo de profil :**
    *   [ ] Au changement du fichier de photo (`<Input type="file" />`), déclencher une fonction d'upload.
    *   [ ] **Logique d'upload :**
        *   Créer une référence dans Firebase Storage (ex: `storageRef = ref(storage, `users/${user.uid}/profile.jpg`)`).
        *   Utiliser `uploadBytes` pour téléverser le fichier.
        *   Après l'upload, récupérer l'URL de téléchargement avec `getDownloadURL`.
        *   Mettre à jour le champ `photoUrl` dans le document `profiles` de l'utilisateur avec cette nouvelle URL.
        *   Afficher un aperçu de l'image sélectionnée avant l'upload pour une meilleure expérience utilisateur.

3.  **Mise à jour du hook `useAuth` :**
    *   [ ] Modifier le hook `useAuth` pour qu'il écoute en temps réel les changements sur le document `profiles` de l'utilisateur (avec `onSnapshot`).
    *   [ ] Ainsi, toute modification effectuée (via le formulaire ou un autre processus) sera immédiatement répercutée dans l'interface sans nécessiter de rechargement.

---

### **2. Implémentation de la Page de Vérification (KYC)**

**Fichiers concernés :** `src/app/[locale]/dashboard/profile/kyc/page.tsx`

1.  **Logique d'Upload des Documents :**
    *   [ ] Pour chaque champ de fichier (`Carte d'identité`, `Selfie`, `Justificatif`), créer une fonction d'upload distincte.
    *   [ ] La logique sera similaire à celle de la photo de profil, mais les fichiers seront stockés dans un sous-dossier dédié (ex: `users/${user.uid}/kyc_documents/identity_front.pdf`).
    *   [ ] Afficher une barre de progression pendant le téléversement de chaque fichier pour informer l'utilisateur.

2.  **Gestion des Statuts et de l'Historique :**
    *   [ ] Créer une sous-collection `kyc_attempts` dans le document `users/{userId}` pour stocker l'historique de chaque tentative de vérification.
    *   [ ] Lorsqu'un utilisateur soumet ses documents, créer un nouveau document dans `kyc_attempts` avec les URLs des fichiers et le statut `pending`.
    *   [ ] Le statut `KYCStatus` sur le document `users` principal sera mis à jour en `pending`.
    *   [ ] La page KYC lira l'historique depuis cette sous-collection pour afficher les tentatives passées.

---

## Feuille de Route pour la Messagerie

Ce document décrit les étapes planifiées pour construire une fonctionnalité de messagerie complète et robuste pour ImuTask.

---

### **Étape 1 : Connexion Temps Réel et Envoi de Messages**

**Objectif :** Permettre l'envoi et la réception de messages texte en temps réel.

1.  **Connexion à Firestore :**
    *   [ ] Dans `ThreadList`, remplacer les données fictives (`mockThreads`) par un `onSnapshot` listener de Firestore qui écoute les changements sur la collection `threads` où l'utilisateur courant est participant.
    *   [ ] Dans `ThreadPage`, faire de même pour la sous-collection `messages` du thread courant, en triant par date d'envoi.

2.  **Envoi de Messages Texte :**
    *   [ ] Dans `ThreadPage`, implémenter la logique d'envoi dans le pied de page :
        *   À la soumission, créer un nouveau document dans la sous-collection `messages` de Firestore.
        *   Mettre à jour le champ `lastMessage` et `lastMessageAt` du document `thread` parent pour rafraîchir la `ThreadList`.
        *   Gérer l'état de chargement et les erreurs.

3.  **Gestion des "Sujets Rapides" :**
    *   [ ] Implémenter la logique pour que les boutons "Ok ✔", "Merci 🙏" envoient directement des messages pré-définis.

---

### **Étape 2 : Gestion des Pièces Jointes (Upload & Affichage)**

**Objectif :** Permettre l'envoi et la visualisation de fichiers, images et audio.

1.  **Intégration d'un service de stockage (ex: Firebase Storage) :**
    *   [ ] Configurer un bucket de stockage.
    *   [ ] Définir les règles de sécurité pour autoriser les uploads authentifiés.

2.  **Logique d'Upload :**
    *   [ ] Dans `ThreadPage`, en cliquant sur l'icône `Paperclip`, ouvrir un sélecteur de fichier.
    *   [ ] Implémenter la fonction d'upload vers Firebase Storage, en affichant un indicateur de progression.
    *   [ ] Une fois l'upload terminé, récupérer l'URL et les métadonnées (nom, taille, type).
    *   [ ] Créer le document `Message` dans Firestore avec le `body` (si présent) et les `attachments`.

3.  **Actions sur les Pièces Jointes (dans `AttachmentPreview`) :**
    *   [ ] **"Ajouter comme preuve"** : Implémenter une fonction qui copie les informations de la pièce jointe vers un champ `evidence` sur le document `Booking` ou `Dispute` associé.
    *   [ ] **"Supprimer"** : Permettre la suppression d'une pièce jointe *avant* l'envoi du message.
    *   [ ] **"Télécharger/Ouvrir"** : Assurer que les liens fonctionnent pour tous les types de fichiers.

---

### **Étape 3 : Intégration de la Fonctionnalité d'Appel Audio**

**Objectif :** Permettre aux utilisateurs de démarrer un appel audio sécurisé depuis la messagerie.

1.  **Mise en place d'un service WebRTC (ex: auto-hébergé ou via un tiers comme Twilio) :**
    *   [ ] Mettre en place la logique de signalisation (échange de métadonnées SDP et ICE) via Firestore ou une autre base de données temps réel.

2.  **Logique d'Appel :**
    *   [ ] Sur la `CallPage`, utiliser `useEffect` pour initier la connexion WebRTC, accéder au micro et à la caméra.
    *   [ ] Afficher l'état de l'appel ("Ringing...", "Connected").
    *   [ ] Gérer la fin de l'appel (nettoyage de la connexion).

3.  **Enregistrement de l'Appel (Fonctionnalité Avancée) :**
    *   [ ] Si l'enregistrement est activé, capturer les flux audio via la `MediaRecorder API`.
    *   [ ] À la fin de l'appel, uploader le fichier audio enregistré sur Firebase Storage.
    *   [ ] Ajouter un message système dans le thread avec un lien vers l'enregistrement.

---

_Les étapes suivantes du document original de la feuille de route pour ImuTask (Authentification, Adresses, etc.) restent valides et peuvent être consultées ci-dessous._

---

### **Étape 1 : Fondations - Authentification et Profil Utilisateur (Enrichi)**

**Objectif :** Mettre en place une base solide pour la gestion des utilisateurs, allant au-delà de la simple connexion.

1.  **Authentification (Terminé) :**
    *   [x] Configuration de Firebase Auth.
    *   [x] Logique d'inscription, connexion, déconnexion.

2.  **Création des collections `users` et `profiles` :**
    *   [ ] À l'inscription, créer un document dans `users` avec les informations de base (`email`, `roles`, `status`, `createdAt`, etc.).
    *   [ ] Simultanément, créer un document lié dans une nouvelle collection `profiles` avec `userId`, `displayName`, et des valeurs par défaut pour `averageRating: 0`, `reviewsCount: 0`, `languages: ['fr']`, `serviceRadiusKm: 10`, etc.
    *   [ ] Mettre à jour le hook `useAuth` pour qu'il retourne non seulement l'objet `User` de Firebase Auth, mais aussi le profil Firestore.

3.  **Page de Profil Utilisateur :**
    *   [ ] Créer une page `/dashboard/profile/edit` permettant à l'utilisateur de modifier son `displayName`, `bio`, `photoUrl`, `languages`, `skills`, et `serviceRadiusKm`.
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
    
    