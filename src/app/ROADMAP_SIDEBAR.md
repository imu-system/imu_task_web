# Feuille de Route : Modernisation de la Barre Latérale

**Objectif :** Transformer la barre latérale en un outil de navigation plus puissant, personnalisable et moins surchargé, en s'inspirant des meilleurs tableaux de bord modernes.

---

### **Étape 1 : Réorganisation et Hiérarchisation (Admin)**

**Objectif :** Réduire la charge cognitive pour les administrateurs en regroupant la navigation de manière logique.

1.  **Groupes d'Administration Pliables :**
    *   **Problème :** La liste de liens d'administration est longue et non structurée.
    *   **Solution :**
        *   [ ] Dans `src/components/dashboard-nav.tsx`, utiliser le composant `Collapsible` (ou `Accordion`) de ShadCN pour créer des groupes de navigation pliables pour l'administration.
        *   [ ] Créer les groupes suivants :
            *   **Communauté :** (Utilisateurs, Missions, Offres, Avis)
            *   **Modération :** (Vérifications KYC, Litiges, Support)
            *   **Plateforme :** (Catégories, CMS, Notifications, Partenariats)
            *   **Finance :** (Paiements, Tarification, Rapports)
            *   **Configuration :** (Intégrations, Paramètres, Audit, Outils Dev)
        *   [ ] Le groupe pertinent devra s'ouvrir automatiquement en fonction de la page active.

---

### **Étape 2 : Amélioration du Contexte Utilisateur**

**Objectif :** Rendre l'identification de l'utilisateur et l'accès aux actions rapides plus évidents.

1.  **Déplacer le Menu Utilisateur en Haut :**
    *   **Problème :** Les informations utilisateur et la déconnexion sont cachées en bas de la barre latérale.
    *   **Solution :**
        *   [ ] Déplacer l'avatar de l'utilisateur, son nom, et son rôle du pied de page vers l'en-tête de la barre latérale, juste en dessous du logo ImuTask.
        *   [ ] Transformer cela en un `DropdownMenu` qui contiendrait les liens vers "Profil", "Paramètres", et "Déconnexion".

2.  **Indicateur de Disponibilité (pour Prestataires) :**
    *   **Problème :** Le statut de disponibilité du prestataire n'est visible nulle part.
    *   **Solution :**
        *   [ ] Ajouter un petit `Switch` ou un badge cliquable (ex: "🟢 Disponible") directement sous le nom du prestataire dans le nouvel en-tête de la barre latérale.
        *   [ ] Ce commutateur permettra au prestataire de changer rapidement sa disponibilité pour de nouvelles missions.

---

### **Étape 3 : Accès Rapide et Recherche Globale**

**Objectif :** Permettre un accès plus rapide aux actions courantes et aux pages.

1.  **Bouton "Créer" Global :**
    *   **Problème :** Le bouton "Créer une mission" est un élément de navigation parmi d'autres.
    *   **Solution :**
        *   [ ] Le transformer en un bouton d'action principal (`Primary Button`) et le déplacer dans le `DashboardHeader` (la barre supérieure) pour qu'il soit toujours accessible.
        *   [ ] Pour un prestataire, ce bouton pourrait devenir "Définir mes disponibilités".

2.  **Implémenter une Palette de Commande (Cmd+K) :**
    *   **Problème :** Naviguer dans les nombreuses pages (surtout pour l'admin) peut être fastidieux.
    *   **Solution :**
        *   [ ] Intégrer une palette de commande (avec `cmdk`) accessible via un raccourci clavier (`Cmd+K` ou `Ctrl+K`).
        *   [ ] Cette palette permettrait de rechercher et de naviguer instantanément vers n'importe quelle page (ex: "utilisateurs", "litiges"), ou de lancer des actions (ex: "créer une mission").
        *   [ ] Ajouter un bouton de recherche dans le `DashboardHeader` pour déclencher cette palette.

---
