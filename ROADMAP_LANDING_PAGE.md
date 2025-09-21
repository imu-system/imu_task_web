
# Feuille de Route : Amélioration de la Page d'Accueil

**Objectif :** Transformer la page d'accueil statique en une vitrine dynamique, engageante et personnalisée qui augmente la confiance et encourage l'inscription des clients et des prestataires.

---

### **Étape 1 : Contenu Dynamique et Personnalisé**

**Objectif :** Rendre la page plus vivante et pertinente en utilisant les données réelles de la plateforme.

1.  **Catégories de Services Dynamiques :**
    *   **Problème :** Les catégories sur la page d'accueil sont codées en dur.
    *   **Solution :**
        *   [ ] Modifier `src/app/[locale]/(main)/page.tsx` pour charger les 4 ou 5 catégories de services les plus populaires directement depuis la collection `serviceCategories` de Firestore.
        *   [ ] Assurer un affichage élégant même si les icônes ne sont pas définies en base de données (prévoir des icônes par défaut).

2.  **Double Appel à l'Action (Client / Prestataire) :**
    *   **Problème :** Le discours est général et ne s'adresse pas spécifiquement aux deux cibles principales.
    *   **Solution :**
        *   [ ] Remplacer la section "Comment ça marche ?" par une section à deux volets ou deux cartes distinctes :
            *   **"Pour les Clients"** : Mettre en avant la simplicité, la sécurité et la rapidité pour trouver de l'aide.
            *   **"Pour les Prestataires"** : Souligner la flexibilité, les revenus complémentaires et l'opportunité d'aider sa communauté.
        *   [ ] Chaque volet aura son propre bouton d'appel à l'action (`"Publier une mission"` et `"Devenir prestataire"`).

---

### **Étape 2 : Renforcement de la Confiance et de la Preuve Sociale**

**Objectif :** Rassurer les nouveaux visiteurs en montrant que la plateforme est active, fiable et appréciée.

1.  **Section "Témoignages" :**
    *   **Problème :** Il n'y a pas de preuve sociale directe de la part des utilisateurs.
    *   **Solution :**
        *   [ ] Ajouter une nouvelle section "Ce que nos membres en pensent".
        *   [ ] Créer un composant `TestimonialCard` réutilisable.
        *   [ ] Pour commencer, y afficher 2-3 témoignages percutants (avec photo de profil, nom et statut "Client" ou "Prestataire"). Ces témoignages peuvent être statiques dans un premier temps.

2.  **Indicateurs Clés (Optionnel) :**
    *   **Problème :** L'activité de la plateforme n'est pas visible.
    *   **Solution :**
        *   [ ] Ajouter une petite section avec des chiffres clés animés qui inspirent confiance :
            *   `+1500` missions réalisées
            *   `+800` membres actifs
            *   `4.8/5` note moyenne des prestataires
        *   [ ] Ces données seront statiques au début, avant une éventuelle connexion à des statistiques réelles.

---

### **Étape 3 : Améliorations Visuelles et Expérience Utilisateur**

**Objectif :** Rendre la page plus attrayante et facile à naviguer.

1.  **Actualisation des Images :**
    *   **Problème :** Les images sont des placeholders génériques.
    *   **Solution :
        *   [ ] Mettre à jour le fichier `src/app/lib/placeholder-images.json` avec des images plus spécifiques et évocatrices pour chaque section.
        *   [ ] Utiliser les `data-ai-hint` pour décrire les scènes souhaitées (ex: "personne âgée souriante", "étudiant aidant jardinage").

2.  **Section FAQ (Foire Aux Questions) :**
    *   **Problème :** Les questions de base des nouveaux utilisateurs ne trouvent pas de réponse immédiate.
    *   **Solution :**
        *   [ ] Ajouter une section FAQ concise en bas de page (juste avant le dernier appel à l'action).
        *   [ ] Utiliser le composant `Accordion` de ShadCN pour afficher 3-4 questions/réponses essentielles (ex: "Comment sont fixés les prix ?", "Est-ce sécurisé ?").

---
