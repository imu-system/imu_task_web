# Feuille de Route consolidée pour ImuTask

Ce document centralise les prochaines étapes de développement pour l'application ImuTask, en priorisant les fonctionnalités clés pour construire une plateforme robuste et conviviale.

---

## **Priorité #1 : Fondations du Profil Utilisateur & Données**

**Objectif :** Rendre l'application dynamique en connectant les données utilisateur à la base de données Firebase (Firestore) et au stockage de fichiers (Firebase Storage). C'est l'étape la plus critique qui débloque toutes les autres personnalisations.

### **1. Sauvegarde du Profil Utilisateur**

- **Tâche :** Activer la sauvegarde des informations du formulaire d'édition de profil.
- **Logique :**
  - Dans `src/app/[locale]/dashboard/profile/edit/page.tsx`, la fonction `onSubmit` doit appeler une fonction `updateUserProfile`.
  - Cette fonction `updateUserProfile` utilisera `updateDoc` de Firestore pour mettre à jour le document de l'utilisateur dans la collection `profiles` (ex: `doc(db, 'profiles', user.uid)`).
  - Elle doit gérer les états de chargement (`isSaving`) et les erreurs.

### **2. Téléversement de la Photo de Profil**

- **Tâche :** Permettre aux utilisateurs de changer leur photo de profil.
- **Logique :**
  - Sur la page `edit/page.tsx`, lors de la sélection d'un fichier, déclencher une fonction d'upload vers Firebase Storage.
  - Utiliser `uploadBytes` pour téléverser le fichier (ex: `users/{user.uid}/profile.jpg`).
  - Après l'upload, récupérer l'URL avec `getDownloadURL` et mettre à jour le champ `photoUrl` dans le document `profiles` de l'utilisateur.

### **3. Implémentation de la Page de Vérification (KYC)**

- **Tâche :** Construire la logique de la page de vérification d'identité.
- **Logique :**
  - Dans `src/app/[locale]/dashboard/profile/kyc/page.tsx`, créer la logique d'upload pour chaque document (pièce d'identité, selfie, etc.) vers un dossier dédié dans Firebase Storage (ex: `users/{user.uid}/kyc_documents/`).
  - Stocker les tentatives de vérification dans une sous-collection Firestore (`kyc_attempts`) avec les URLs des fichiers et le statut `pending`.
  - Mettre à jour le statut `KYCStatus` de l'utilisateur principal.

---

## **Priorité #2 : Amélioration de l'Expérience de Navigation (UX)**

**Objectif :** Rendre l'interface, en particulier le tableau de bord, plus intuitive, rapide et moderne.

### **1. Refonte de la Navigation d'Administration**

- **Tâche :** Réorganiser la barre latérale pour les administrateurs.
- **Problème :** La liste de liens d'administration est longue et non structurée.
- **Solution :**
  - Dans `src/components/dashboard-nav.tsx`, utiliser des `Collapsible` de ShadCN pour créer des groupes de navigation pliables (ex: Communauté, Modération, Finance, Plateforme, Configuration).
  - Le groupe pertinent doit s'ouvrir automatiquement en fonction de la page active.

### **2. Transformer les Pages en Modales et Tiroirs**

- **Tâche :** Convertir les formulaires de formulaire en modales pour fluidifier la navigation.
- **Première Étape : Création de Mission**
  - Déplacer le formulaire de `src/components/create-task-form.tsx` dans une modale (`Dialog`).
  - Modifier le bouton `+ Créer une mission` dans le `DashboardHeader` pour qu'il ouvre cette modale au lieu de naviguer vers une page.
  - Assurer le rechargement des données après la création réussie.

---

## **Priorité #3 : Fonctionnalités de Base de la Plateforme**

**Objectif :** Mettre en œuvre la logique métier principale de l'application.

- **Système d'Offres (`offers`) :**
  - Permettre aux prestataires de soumettre des offres sur les missions.
  - Permettre aux clients d'accepter une offre, ce qui déclenche la création d'une `Booking`.
- **Messagerie en Temps Réel (`threads` & `messages`) :**
  - Lorsqu'une réservation (`Booking`) est créée, créer un fil de discussion (`Thread`) entre le client et le prestataire.
  - Développer l'interface de messagerie pour permettre l'échange de messages en temps réel.
- **Paiements et Transactions :**
  - Intégrer Stripe Connect pour le traitement des paiements.
  - Mettre en place la logique de séquestre (autorisation de paiement) et de capture (paiement final).
- **Système d'Avis et de Litiges (`reviews` & `disputes`) :**
  - Permettre aux deux parties de laisser un avis après une mission.
  - Mettre en place un processus pour la gestion des litiges.
