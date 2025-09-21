
### Feuille de Route : Optimisation de l'Expérience Modale

**Objectif :** Réduire les changements de page et fluidifier la navigation en déplaçant les actions et les vues de détail dans des modales (`Dialog`) et des tiroirs latéraux (`Sheet`).

---

#### **Étape 1 : Actions Utilisateur Fréquentes**

**Objectif :** Transformer les formulaires de création les plus courants en modales pour un accès rapide depuis n'importe où dans le tableau de bord.

1.  **Création de Mission :**
    *   **Problème :** `/dashboard/tasks/new` est une page complète, forçant un changement de contexte.
    *   **Solution :**
        *   [ ] Déplacer le composant `CreateTaskForm` dans un `Dialog`.
        *   [ ] Modifier le bouton `+ Créer une mission` dans le `DashboardHeader` pour qu'il ouvre ce `Dialog` au lieu de naviguer vers une nouvelle page.
        *   [ ] S'assurer que le rechargement des données sur la page des missions se fait après la création réussie.

2.  **Faire une Offre :**
    *   **Constat :** Déjà implémenté avec un `Dialog`. Aucune action requise. C'est un bon modèle à suivre.

---

#### **Étape 2 : Consultation Rapide des Détails**

**Objectif :** Utiliser des tiroirs latéraux (`Sheet`) pour permettre aux utilisateurs de consulter des détails sans perdre de vue la liste principale.

1.  **Détail d'une Mission :**
    *   **Problème :** Cliquer sur une mission redirige vers une page complète (`/dashboard/tasks/[id]`), faisant perdre le contexte de la liste.
    *   **Solution :**
        *   [ ] Créer un composant `TaskDetailSheet` qui reprend le contenu de la page `TaskDetailPage`.
        *   [ ] Sur la page `/dashboard/tasks`, au clic sur une mission (`TaskCard` ou `TaskListCard`), ouvrir ce `Sheet` avec les détails de la mission sélectionnée.
        *   [ ] L'URL peut être mise à jour (shallow routing) pour conserver la possibilité de partager un lien direct vers la mission.

2.  **Détail d'une Réservation (Booking) :**
    *   **Problème :** Similaire à la page de détail de mission, `/dashboard/bookings/[id]` est une page complète.
    *   **Solution :**
        *   [ ] Créer un composant `BookingDetailSheet`.
        *   [ ] Modifier la page `/dashboard/bookings` pour ouvrir le tiroir latéral au clic sur une réservation.

---

#### **Étape 3 : Administration en Ligne**

**Objectif :** Fluidifier les tâches administratives en déplaçant les formulaires d'édition et de création dans des modales.

1.  **Gestion des Catégories de Service :**
    *   **Problème :** La création et l'édition d'une catégorie nécessitent de naviguer vers des pages dédiées (`/admin/services/categories/new`, `/admin/services/categories/edit/[id]`).
    *   **Solution :**
        *   [ ] Transformer les formulaires de création et d'édition en un seul composant réutilisable, `CategoryForm`.
        *   [ ] Sur la page de liste des catégories, un clic sur "Créer" ou "Modifier" ouvrira un `Dialog` contenant `CategoryForm`.

2.  **Gestion des Utilisateurs (Modération) :**
    *   **Problème :** Suspendre un utilisateur, changer ses rôles ou envoyer un avertissement se fait sur la page de détail `admin/users/[id]`.
    *   **Solution :**
        *   [ ] Sur la page de liste des utilisateurs, ajouter des actions rapides dans un `DropdownMenu` pour chaque ligne.
        *   [ ] "Suspendre", "Changer le statut KYC", "Envoyer un avertissement" ouvriront de petites modales de confirmation/formulaire dédiées, évitant de charger la page de détail complète pour des actions rapides.

---

#### **Étape 4 (Optionnel) : Amélioration de l'Edition de Profil**

**Objectif :** Permettre des modifications rapides du profil sans recharger toute une page d'édition.

1.  **Modification des Adresses :**
    *   **Constat :** Déjà implémenté avec un `Dialog`. C'est un excellent exemple.
    *   **Amélioration possible :**
        *   [ ] Au lieu d'une modale, utiliser un `Sheet` pour permettre à l'utilisateur de voir son profil principal tout en modifiant ses adresses.

2.  **Modification des Compétences / Langues :**
    *   **Problème :** Pour changer une compétence, l'utilisateur doit passer en mode "édition" sur toute la page.
    *   **Solution :**
        *   [ ] Sur la page de profil (en mode vue), ajouter une icône "Modifier" à côté des sections "Compétences" et "Langues".
        *   [ ] Un clic ouvrirait une petite modale (`Dialog`) dédiée uniquement à la gestion de cette liste spécifique, rendant la modification plus ciblée et rapide.
