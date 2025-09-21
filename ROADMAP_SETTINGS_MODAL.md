# Feuille de Route : Refonte des Paramètres en Modale

**Objectif :** Transformer la section "Paramètres" en une modale unifiée avec une disposition à deux volets (navigation à gauche, contenu à droite) pour une expérience utilisateur plus rapide et plus intégrée, sans rechargement de page.

---

### **Étape 1 : Création du Composant de Base `SettingsModal`**

**Objectif :** Construire le conteneur principal qui servira de base à la nouvelle interface des paramètres.

1.  **Créer un nouveau composant `SettingsModal.tsx` :**
    *   [ ] Ce composant utilisera le `Dialog` de ShadCN comme conteneur principal.
    *   [ ] L'intérieur du `DialogContent` sera divisé en deux volets :
        *   **Volet de gauche (30% de la largeur) :** Une barre de navigation latérale simple.
        *   **Volet de droite (70% de la largeur) :** Une zone de contenu où les différentes pages de paramètres s'afficheront.
    *   [ ] Le style sera ajusté pour une largeur de modale plus grande (ex: `max-w-4xl`) afin d'accommoder les deux volets.

2.  **Créer la Navigation Latérale `SettingsNav.tsx` :**
    *   [ ] Créer un composant qui affichera les liens de navigation des paramètres (`Compte`, `Sécurité`, `Facturation`, `Confidentialité`).
    *   [ ] Ce composant prendra en paramètre l'onglet actuellement actif et une fonction pour changer d'onglet (`onTabChange`).
    *   [ ] Le style mettra en évidence l'onglet actif.

---

### **Étape 2 : Adapter les Pages de Paramètres en Composants**

**Objectif :** Transformer chaque page de paramètre existante en un composant réutilisable pouvant être affiché dans le volet de droite de la modale.

1.  **Adapter `account/page.tsx` :**
    *   [ ] Renommer/déplacer le contenu de la page `src/app/[locale]/dashboard/settings/account/page.tsx` dans un nouveau composant, par exemple `AccountSettings.tsx`.
    *   [ ] Ce composant ne contiendra que le JSX de la carte de paramètres, sans la logique de layout.

2.  **Adapter `security/page.tsx` :**
    *   [ ] Faire de même pour la page de sécurité, en créant un composant `SecuritySettings.tsx`.

3.  **Adapter `billing/page.tsx` :**
    *   [ ] Créer un composant `BillingSettings.tsx`.

4.  **Adapter `privacy/page.tsx` :**
    *   [ ] Créer un composant `PrivacySettings.tsx`.

---

### **Étape 3 : Intégration et Gestion de l'État**

**Objectif :** Intégrer les nouveaux composants dans la modale et gérer l'affichage dynamique du contenu.

1.  **Mettre à jour `SettingsModal.tsx` :**
    *   [ ] Ajouter un état local (ex: `useState('account')`) pour suivre l'onglet actif.
    *   [ ] Le `SettingsNav` (volet de gauche) mettra à jour cet état via la fonction `onTabChange`.
    *   [ ] Le volet de droite affichera le composant de paramètre correspondant (`AccountSettings`, `SecuritySettings`, etc.) en fonction de l'état de l'onglet actif.

2.  **Intégrer `SettingsModal` dans le `DashboardHeader.tsx` :**
    *   [ ] Le lien/bouton "Paramètres" dans le menu utilisateur du header n'utilisera plus `Link` pour naviguer.
    *   [ ] Il deviendra un `DialogTrigger` qui ouvrira la `SettingsModal`.
    *   [ ] La modale sera ajoutée à la fin du JSX du `DashboardHeader` pour être disponible globalement.

---

### **Étape 4 : Nettoyage et Finalisation**

**Objectif :** Supprimer l'ancien système de routage des paramètres pour finaliser la transition.

1.  **Supprimer l'ancien layout des paramètres :**
    *   [ ] Le fichier `src/app/[locale]/dashboard/settings/layout.tsx` peut être supprimé, car la navigation par onglets est désormais gérée par `SettingsNav` à l'intérieur de la modale.

2.  **Supprimer les anciennes pages :**
    *   [ ] Les fichiers de page (`page.tsx`) dans les sous-dossiers de `/dashboard/settings/` peuvent être supprimés, car leur contenu a été déplacé dans des composants.

3.  **Mettre à jour la navigation principale (`DashboardNav.tsx`) :**
    *   [ ] Le lien principal "Paramètres" dans la barre latérale du tableau de bord devra également être modifié pour déclencher l'ouverture de la modale, probablement en utilisant un état global (via Zustand ou Context API) ou en déplaçant la logique de la modale au niveau du `layout.tsx` du dashboard si nécessaire. Pour une première approche, se concentrer sur le header est suffisant.