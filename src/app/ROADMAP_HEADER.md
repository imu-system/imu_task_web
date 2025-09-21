# Feuille de Route : Optimisation du Header Dashboard

## Objectif : Rendre le header plus intelligent, personnalisable et efficace pour l'utilisateur.

---

### **Étape 1 : Refonte de la Recherche (Recherche Globale Unifiée)**

**Objectif :** Transformer la barre de recherche en un outil de commande puissant et centralisé.

1.  **Mise en place de `cmdk` :**
    *   [ ] Intégrer la bibliothèque `cmdk` pour créer une palette de commande (type Spotlight sur macOS ou `Ctrl+K` sur de nombreux outils SaaS).
    *   [ ] Le raccourci clavier `Ctrl+K` (ou `Cmd+K`) devra ouvrir cette interface de recherche de manière globale dans le dashboard.

2.  **Logique de Recherche Multi-entités :**
    *   [ ] Indexer et rechercher dans plusieurs types de documents :
        *   **Utilisateurs** (Clients, Prestataires) par nom ou email.
        *   **Missions** (par titre, mots-clés).
        *   **Pages d'aide / FAQ**.
        *   **Actions rapides** (ex: "Créer une mission", "Voir mon profil").
    *   [ ] Organiser les résultats par catégories claires (ex: "Utilisateurs", "Missions", "Actions").

3.  **Intégration Visuelle :**
    *   [ ] Remplacer l'input de recherche actuel par un bouton qui ouvre la palette de commande.
    *   [ ] Assurer un design léché et une navigation au clavier fluide.

---

### **Étape 2 : Menu "Créer" Contextuel et Intelligent**

**Objectif :** Rendre le bouton `+ Créer` plus pertinent en fonction du contexte et du rôle de l'utilisateur.

1.  **Logique contextuelle :**
    *   [ ] **Pour un client :** Le bouton principal devient "Créer une mission".
    *   [ ] **Pour un prestataire :** Le bouton principal devient "Définir mes disponibilités".
    *   [ ] Le dropdown contiendra les autres actions moins prioritaires.

2.  **Suggestions par IA (Optionnel) :**
    *   [ ] Basé sur l'historique, suggérer une action. Par exemple, si un client crée souvent des missions "Courses", le dropdown pourrait proposer "Créer une mission 'Courses' (modèle)".

---

### **Étape 3 : Centre de Notifications Actionnable**

**Objectif :** Transformer le dropdown des notifications en un mini-centre d'actions rapides.

1.  **Notifications Groupées et Actionnables :**
    *   [ ] Au lieu d'une simple liste, grouper les notifications (ex: "3 nouvelles offres pour votre mission 'Jardinage'").
    *   [ ] Intégrer des boutons d'action directement dans la notification :
        *   Nouvelle offre : `[Voir l'offre]` `[Ignorer]`
        *   Nouveau message : `[Répondre]`
        *   Mission terminée : `[Laisser un avis]`

2.  **Gestion des Notifications :**
    *   [ ] Ajouter des onglets `Toutes` et `Non lues`.
    *   [ ] Ajouter un bouton "Marquer tout comme lu".

---

### **Étape 4 : Intégration du Statut de Connexion (Offline-First)**

**Objectif :** Intégrer le badge de statut de connexion de manière subtile mais claire.

1.  **Badge de Statut :**
    *   [ ] Placer une petite icône de statut (ex: `📶`) à côté du menu utilisateur.
    *   [ ] Le `tooltip` au survol indiquera la dernière synchronisation.
    *   [ ] Un clic sur l'icône redirigera vers la page `/dashboard/offline` pour plus de détails.

2.  **Changement de Couleur Dynamique :**
    *   [ ] Vert : Connecté et synchronisé.
    *   [ ] Orange : Connecté, mais des éléments sont en attente de synchronisation.
    *   [ ] Rouge : Hors ligne.

---

### **Étape 5 : Personnalisation du Profil Rapide**

**Objectif :** Permettre à l'utilisateur de modifier des éléments clés sans quitter le header.

1.  **Statut de Disponibilité Rapide (pour prestataires) :**
    *   [ ] Dans le dropdown du profil, ajouter un switch "Disponible pour de nouvelles missions".
    *   [ ] Ce switch mettra à jour le statut global du prestataire.

2.  **Raccourcis Favoris :**
    *   [ ] Permettre à l'utilisateur d'épingler un ou deux liens favoris directement dans le dropdown du profil (ex: lien direct vers "Mes statistiques").
