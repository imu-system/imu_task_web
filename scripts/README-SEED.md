# 🌱 Seed Data pour Tests E2E

Ce script peuple votre Firestore avec des données de test réalistes pour les tests E2E du système de favoris.

## 📦 Données créées

Le script crée :

- **1 utilisateur de test** (`seed-test@example.com`)
- **16 tâches** (2 par catégorie sur 8 catégories)
- **5 prestataires** avec profils complets, compétences variées et ratings

### 🗂️ Catégories de tâches

1. Aide à domicile & Petits travaux
2. Courses & Livraisons
3. Aide Numérique & Administrative
4. Déménagement & Manutention
5. Accompagnement & Présence
6. Jardinage & Extérieur
7. Animaux de compagnie
8. Événements & Occasions spéciales

### 👥 Prestataires

- **Marie Dubois** - Étudiante en médecine (aide domicile, accompagnement)
- **Lucas Martin** - Étudiant ingénieur (aide numérique, bricolage)
- **Sophie Bernard** - Passionnée jardinage et animaux
- **Thomas Petit** - Entrepreneur (événements, déménagements)
- **Emma Lefebvre** - Étudiante polyvalente

## 🚀 Installation

### 1. Obtenir le Service Account Key

1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Sélectionnez votre projet **imu_task_web**
3. **⚙️ Settings → Project Settings → Service Accounts**
4. Cliquez sur **"Generate new private key"**
5. Téléchargez le fichier JSON
6. Renommez-le en `serviceAccountKey.json`
7. Placez-le à la **racine du projet** :
   ```
   /Users/nathanimogo/Documents/GitHub/imu_task_web/serviceAccountKey.json
   ```

⚠️ **IMPORTANT** : Ce fichier est automatiquement ignoré par Git (`.gitignore`)

### 2. Exécuter le script

```bash
# Méthode 1 : Via script npm
pnpm seed:test

# Méthode 2 : Directement avec tsx
pnpm tsx scripts/seed-test-data.ts
```

### 3. Vérifier les données

Le script affiche un résumé :

```
✅ SEED COMPLÉTÉ AVEC SUCCÈS

📊 Résumé:
   • Utilisateur de test: 1
   • Tâches créées: 16
   • Prestataires créés: 5
   • Catégories couvertes: 8

💡 Vous pouvez maintenant lancer les tests E2E:
   pnpm test:e2e e2e/favorites.spec.ts
```

## 🧪 Lancer les tests E2E

Une fois les données créées :

```bash
# Tous les tests Favorites (17 scénarios)
pnpm test:e2e e2e/favorites.spec.ts

# Tests simplifiés (sans dépendance aux données)
pnpm test:e2e e2e/favorites-simple.spec.ts

# Mode UI interactif
pnpm test:e2e:ui e2e/favorites.spec.ts
```

## 🧹 Nettoyage

Le script **nettoie automatiquement** les anciennes données de test avant d'en créer de nouvelles. Vous pouvez l'exécuter plusieurs fois sans problème.

Pour supprimer manuellement les données :

```typescript
// Les tâches sont identifiables par clientId: 'test-seed-user-id'
// Les prestataires ont des IDs: 'seed-provider-1', 'seed-provider-2', etc.
```

## 🔧 Personnalisation

Pour modifier les données de seed, éditez `scripts/seed-test-data.ts` :

```typescript
// Changer le nombre de tâches par catégorie
const TASK_TEMPLATES = {
  aide_domicile: [
    { title: 'Nouvelle tâche', description: '...', budget: 50 }
  ]
};

// Ajouter des prestataires
const PROVIDER_PROFILES = [
  {
    displayName: 'Nouveau Prestataire',
    bio: 'Description...',
    skills: ['categorie1', 'categorie2'],
    rating: 4.5,
    reviewCount: 10
  }
];
```

## 🐛 Dépannage

### Erreur : `serviceAccountKey.json introuvable`

➡️ Téléchargez le fichier depuis Firebase Console (voir étape 1)

### Erreur : `Permission denied`

➡️ Vérifiez que le Service Account a les permissions **Firestore Admin**

### Erreur : `Firebase app already exists`

➡️ Normal si vous relancez le script. Il réutilise l'app existante.

### Les données n'apparaissent pas dans Firestore

➡️ Vérifiez que vous êtes connecté au bon projet Firebase :
```bash
firebase projects:list
firebase use <project-id>
```

## 📊 Tests couverts

Les données créées permettent de tester :

✅ Affichage des boutons FavoriteButton sur TaskCard/ProviderCard  
✅ Ajout de tâches/prestataires aux favoris  
✅ Navigation vers /dashboard/favorites  
✅ Filtrage par type (Tous/Tâches/Prestataires)  
✅ Suppression de favoris  
✅ États vides (aucun favori)  
✅ Toggle favoris on/off  
✅ Affichage du KPI "Favoris" sur le dashboard  
✅ Responsive mobile  
✅ Internationalisation (FR/EN/JA)  

## 📚 Documentation associée

- [FAVORITES_E2E_TESTS_COMPLETE.md](../docs/FAVORITES_E2E_TESTS_COMPLETE.md) - Documentation complète des tests E2E
- [PHASE10_SESSION2_COMPLETE.md](../docs/PHASE10_SESSION2_COMPLETE.md) - Résumé de la session
- [E2E_TESTING_GUIDE.md](../docs/E2E_TESTING_GUIDE.md) - Guide général des tests E2E

## 🎯 Workflow recommandé

```bash
# 1. Créer les données de test
pnpm seed:test

# 2. Démarrer le serveur dev (si pas déjà lancé)
pnpm dev

# 3. Lancer les tests E2E
pnpm test:e2e e2e/favorites.spec.ts

# 4. Voir le rapport HTML des résultats
pnpm exec playwright show-report
```

---

**Créé le** : 11 novembre 2025  
**Auteur** : ImuTask Team  
**Version** : 1.0.0
