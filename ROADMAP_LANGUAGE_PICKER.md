
# Feuille de Route : Sélecteur Avancé de Langue & Région

**Objectif :** Remplacer le sélecteur de langue actuel par un `Popover` riche, inspiré d'Airbnb, permettant aux utilisateurs de choisir non seulement la langue, mais aussi leur région et leur devise, afin de personnaliser entièrement l'expérience de la plateforme.

---

### **Étape 1 : Création du Composant de Base et Intégration**

**Objectif :** Mettre en place la structure du nouveau sélecteur et le connecter au header.

1.  **Créer le composant `LanguageRegionSwitcher.tsx` :**
    *   [ ] Ce nouveau composant sera basé sur le `Popover` de ShadCN.
    *   [ ] Le bouton déclencheur (`PopoverTrigger`) sera une icône de globe, similaire à l'actuel.

2.  **Remplacer l'ancien sélecteur :**
    *   [ ] Dans `src/components/header.tsx`, supprimer le `DropdownMenu` existant pour les langues.
    *   [ ] Importer et utiliser le nouveau composant `LanguageRegionSwitcher`.

---

### **Étape 2 : Conception de l'Interface du Popover**

**Objectif :** Construire une interface claire et intuitive à l'intérieur du popover.

1.  **Mise en page à onglets :**
    *   [ ] Utiliser le composant `Tabs` de ShadCN pour créer deux sections : "Langue & Région" et "Devise".

2.  **Grille de sélection "Langue & Région" :**
    *   [ ] Concevoir une grille réactive (`grid`) affichant des cartes cliquables pour chaque combinaison langue/région disponible (ex: "Français (France)", "English (United States)", "日本語 (日本)").
    *   [ ] Chaque carte affichera le nom de la langue et le nom du pays.
    *   [ ] L'option actuellement sélectionnée sera mise en évidence visuellement (bordure, fond de couleur).
    *   [ ] Ajouter une barre de recherche pour filtrer rapidement les options.

3.  **Grille de sélection "Devise" :**
    *   [ ] Créer une grille similaire pour les devises, affichant le nom de la devise et son symbole (ex: "Euro (€)", "US Dollar ($)").
    *   [ ] L'option active sera également mise en évidence.

---

### **Étape 3 : Logique et Internationalisation**

**Objectif :** Rendre le composant fonctionnel et traduisible.

1.  **Gestion de l'état :**
    *   [ ] Utiliser `useState` pour gérer la langue, la région et la devise sélectionnées.
    *   [ ] Le clic sur une carte mettra à jour l'état et fermera le popover.
    *   [ ] Pour la navigation, utiliser le hook `useRouter` de `next-intl/navigation` pour changer de locale sans recharger la page complètement.

2.  **Ajouter les traductions :**
    *   [ ] Dans les fichiers `messages/*.json`, ajouter les nouvelles clés nécessaires pour l'interface du popover (ex: titres des onglets, labels de recherche, noms des pays et des devises).

---

### **Étape 4 : Style et Finalisation**

**Objectif :** Peaufiner l'apparence et l'expérience utilisateur.

1.  **Affichage de la sélection :**
    *   [ ] Le `PopoverTrigger` (l'icône globe) pourrait afficher un indice textuel de la sélection actuelle (ex: "FR | EUR") à côté de l'icône sur les écrans plus grands.

2.  **Accessibilité :**
    *   [ ] S'assurer que tous les éléments sont accessibles au clavier et correctement étiquetés pour les lecteurs d'écran.
