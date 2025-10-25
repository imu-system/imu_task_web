# Guide de Configuration Algolia pour IMU Task

## 🎯 Objectif

Remplacer la recherche Firestore (lente, limitée) par Algolia Search (< 20ms, typo-tolerance, geo-search).

## 📊 Comparaison des Performances

| Critère | Firestore (Avant) | Algolia (Après) |
|---------|-------------------|-----------------|
| **Temps de réponse** | 500ms - 2s | < 20ms |
| **Typo tolerance** | ❌ | ✅ ("plomber" → "plombier") |
| **Highlighting** | ❌ | ✅ (mots surlignés) |
| **Geo-search** | Complexe | ✅ (rayon en km) |
| **Facettes** | ❌ | ✅ (multi-filtres) |
| **Scalabilité** | Coûteux à grande échelle | Optimisé |

## 🚀 Configuration Initiale

### Étape 1: Créer un Compte Algolia

1. Aller sur [algolia.com/users/sign_up](https://www.algolia.com/users/sign_up)
2. Créer un compte gratuit
   - **Plan Gratuit**: 10,000 recherches/mois, 1M de records
   - Suffisant pour la phase MVP

### Étape 2: Créer une Application

1. Dashboard Algolia > **Applications** > **Create Application**
2. Nom suggéré: `imu-task-web-dev` (développement)
3. Région: Choisir la plus proche (ex: Europe - Paris)

### Étape 3: Récupérer les Clés API

1. Dashboard > **API Keys**
2. Copier les 3 clés suivantes:

```bash
# Application ID (Public)
Application ID: XXXXXXXXXX

# Search-Only API Key (Public - lecture seule)
Search-Only API Key: xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Admin API Key (Privée - JAMAIS exposer)
Admin API Key: yyyyyyyyyyyyyyyyyyyyyyyyyyyy
```

### Étape 4: Configurer les Variables d'Environnement

1. Copier le fichier d'exemple:
```bash
cp .env.algolia.example .env.local
```

2. Éditer `.env.local` et remplir les clés:

```bash
# Public (côté client)
NEXT_PUBLIC_ALGOLIA_APP_ID=XXXXXXXXXX
NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Privée (server-side uniquement)
ALGOLIA_ADMIN_API_KEY=yyyyyyyyyyyyyyyyyyyyyyyyyyyy
```

⚠️ **IMPORTANT**: Ne jamais commit `.env.local` dans Git !

### Étape 5: Installer tsx si Nécessaire

```bash
pnpm add -D tsx
```

### Étape 6: Indexer les Données Firestore

```bash
npm run algolia:index
```

Sortie attendue:
```
🚀 Début de l'indexation Algolia

📍 App ID: XXXXXXXXXX
📍 Admin Key: yyyyyyyyyy...

📋 Configuration de l'index "tasks"...
✅ Index "tasks" configuré

📋 Configuration de l'index "users"...
✅ Index "users" configuré

📋 Configuration de l'index "services"...
✅ Index "services" configuré

📦 Indexation des tâches...
✅ 42 tâches indexées

👥 Indexation des utilisateurs...
✅ 18 utilisateurs indexés

🛠️  Indexation des services...
✅ 12 services indexés

✅ Indexation terminée avec succès !

📊 Vérifiez vos indices sur:
   https://www.algolia.com/apps/XXXXXXXXXX/explorer/browse
```

### Étape 7: Vérifier les Indices

1. Dashboard Algolia > **Search** > **Index**
2. Voir 3 indices créés:
   - `tasks` (tâches/missions)
   - `users` (prestataires/professionnels)
   - `services` (services/catégories)
3. Tester la recherche dans l'explorateur Algolia

### Étape 8: Tester dans l'Application

```bash
npm run dev
```

1. Se connecter au dashboard
2. Taper dans la barre de recherche
3. Vérifier:
   - Résultats instantanés (< 20ms)
   - Highlighting des mots-clés
   - Typo tolerance ("plomber" → "plombier")
   - Icônes selon type (tâche, user, service)

## 📋 Indices Algolia

### 1. Index `tasks`

**Attributs indexés**:
- `title` (titre de la tâche)
- `description` (description détaillée)
- `category` (catégorie de service)
- `tags` (mots-clés)
- `location.address`, `location.city` (adresse)

**Facettes**:
- `status` (open, in_progress, completed)
- `category` (plumbing, electrical, etc.)
- `urgent` (true/false)
- `budget` (fourchette de prix)

**Geo-search**: Coordonnées GPS (`_geoloc`) pour recherche par proximité

**Tri personnalisé**:
1. Date de création (desc)
2. Budget (desc)

### 2. Index `users`

**Attributs indexés**:
- `profile.displayName` (nom d'affichage)
- `profile.companyName` (nom de l'entreprise)
- `profile.bio` (biographie)
- `profile.skills` (compétences)
- `profile.serviceCategories` (catégories de services)

**Facettes**:
- `accountType` (individual, professional, senior)
- `profile.serviceCategories`
- `profile.verified` (compte vérifié)
- `profile.rating` (note moyenne)

**Tri personnalisé**:
1. Rating (desc)
2. Nombre de jobs complétés (desc)

### 3. Index `services`

**Attributs indexés**:
- `name` (nom du service)
- `description` (description)
- `category` (catégorie)
- `tags` (mots-clés)
- `keywords` (mots-clés de recherche)

**Facettes**:
- `category`
- `popular` (service populaire)

**Tri personnalisé**:
1. Nombre de réservations (desc)
2. Rating (desc)

## 🔄 Synchronisation Continue

### Option A: Script Manuel (Dev)

```bash
npm run algolia:index
```

Exécuter après chaque modification majeure des données Firestore.

### Option B: Cloud Function (Production)

Créer une Cloud Function qui se déclenche sur les écritures Firestore:

```typescript
// functions/src/algolia-sync.ts
import * as functions from 'firebase-functions';
import { adminClient } from './algolia-config';

export const syncTaskToAlgolia = functions.firestore
  .document('tasks/{taskId}')
  .onWrite(async (change, context) => {
    const taskId = context.params.taskId;
    const index = adminClient.initIndex('tasks');

    if (!change.after.exists) {
      // Suppression
      await index.deleteObject(taskId);
      return;
    }

    const data = change.after.data();
    const record = {
      objectID: taskId,
      title: data.title,
      description: data.description,
      // ... autres champs
    };

    await index.saveObject(record);
  });
```

Déployer:
```bash
firebase deploy --only functions:syncTaskToAlgolia
```

## 🧪 Tests de Recherche

### Test 1: Recherche Simple

**Query**: `plombier`

**Résultats attendus**:
- Tâches avec "plombier" dans titre/description
- Prestataires avec "plomberie" dans compétences
- Service "Plomberie" dans catégorie

### Test 2: Typo Tolerance

**Query**: `plomber` (faute de frappe)

**Résultats attendus**:
- Même résultat que "plombier" (correction automatique)

### Test 3: Geo-Search (si GPS activé)

**Query**: `plombier`
**GPS**: Paris (48.8566, 2.3522)
**Rayon**: 50km

**Résultats attendus**:
- Tâches et prestataires dans un rayon de 50km
- Triés par pertinence puis distance

### Test 4: Highlighting

**Query**: `réparer fuite`

**Résultats attendus**:
- Mots "réparer" et "fuite" surlignés en `<mark>`
- Visuel avec fond jaune dans l'UI

## 📈 Monitoring & Analytics

### Dashboard Algolia

1. **Analytics** > **Overview**
   - Nombre de recherches/jour
   - Temps de réponse moyen
   - Taux de succès (recherches avec résultats)

2. **Analytics** > **Searches**
   - Top 100 requêtes
   - Recherches sans résultats (→ améliorer indexation)
   - Recherches avec faible CTR (→ améliorer pertinence)

3. **Analytics** > **Click Analytics**
   - Quels résultats sont cliqués
   - Position des clics (1er, 2ème, etc.)
   - Taux de conversion

### Intégration Analytics Custom

Événements déjà loggés dans `useAlgoliaSearch`:
- `logDashboardSearch(accountType, query, totalHits)`
- `logSearchSuggestionClick(accountType, type, title)`

Disponibles dans Firebase Analytics pour analyser:
- Recherches les plus populaires par AccountType
- Taux de succès des recherches
- Types de résultats les plus cliqués

## 🐛 Dépannage

### Problème: "Algolia non configuré"

**Cause**: Variables d'environnement manquantes

**Solution**:
1. Vérifier `.env.local` existe
2. Vérifier les 3 clés sont présentes
3. Redémarrer le serveur dev: `npm run dev`

### Problème: "Admin API Key invalid"

**Cause**: Clé Admin incorrecte ou expirée

**Solution**:
1. Dashboard Algolia > API Keys > Regenerate Admin Key
2. Copier la nouvelle clé dans `.env.local`
3. Re-indexer: `npm run algolia:index`

### Problème: "No results found"

**Cause 1**: Indices vides (pas indexés)
**Solution**: `npm run algolia:index`

**Cause 2**: Filtres trop restrictifs
**Solution**: Vérifier `getContextualFilters()` dans `algolia-config.ts`

### Problème: "Request timed out"

**Cause**: Réseau lent ou problème Algolia

**Solution**:
1. Vérifier connexion internet
2. Status Algolia: [status.algolia.com](https://status.algolia.com)
3. Augmenter timeout dans `useAlgoliaSearch` (actuellement 300ms)

## 🔐 Sécurité

### ✅ Bonnes Pratiques

1. **Search-Only API Key** → Client-side (lecture seule)
   - Utilisée dans `AlgoliaSearchBox`
   - Exposée dans le bundle JavaScript (OK)
   - Permissions: Search uniquement

2. **Admin API Key** → Server-side uniquement
   - Utilisée dans scripts Node.js
   - Utilisée dans Cloud Functions
   - **JAMAIS** exposée côté client

3. **Restrictions IP** (optionnel)
   - Dashboard > API Keys > Add IP restriction
   - Limiter Admin Key à IPs connues (serveurs)

### ❌ À Éviter

- ❌ Exposer Admin Key dans code frontend
- ❌ Commit `.env.local` dans Git
- ❌ Utiliser Admin Key dans requêtes client-side
- ❌ Partager Admin Key publiquement

## 📚 Ressources

- [Documentation Algolia](https://www.algolia.com/doc/)
- [React InstantSearch](https://www.algolia.com/doc/guides/building-search-ui/what-is-instantsearch/react/)
- [Algolia Pricing](https://www.algolia.com/pricing/)
- [Status Page](https://status.algolia.com/)
- [Community Forum](https://discourse.algolia.com/)

## 🎉 Prochaines Étapes

Après configuration réussie:

1. ✅ **Tests utilisateurs** - Collecter feedback sur vitesse de recherche
2. ✅ **Analytics** - Analyser les requêtes populaires
3. 🔄 **Synonymes** - Ajouter synonymes métier ("plombier" = "plomberie")
4. 🔄 **Query Suggestions** - Autocomplete avec suggestions populaires
5. 🔄 **Personnalisation** - Résultats adaptés par AccountType
6. 🔄 **A/B Testing** - Tester différents algorithmes de ranking

## ✅ Checklist de Validation

- [ ] Compte Algolia créé
- [ ] Application créée
- [ ] 3 clés API copiées
- [ ] `.env.local` configuré
- [ ] `npm run algolia:index` exécuté avec succès
- [ ] 3 indices visibles dans dashboard Algolia
- [ ] Recherche fonctionne dans l'app (< 20ms)
- [ ] Typo tolerance testée
- [ ] Highlighting visible
- [ ] Analytics événements loggés

---

**Auteur**: GitHub Copilot
**Date**: Octobre 2025
**Version**: 1.0.0
