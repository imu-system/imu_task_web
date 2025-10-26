# Guide d'Indexation Algolia en Production

## Vue d'ensemble

Ce guide décrit le processus d'indexation initiale et continue des données Firestore vers Algolia en production.

## Table des matières

1. [Pré-requis](#pré-requis)
2. [Configuration initiale](#configuration-initiale)
3. [Indexation initiale](#indexation-initiale)
4. [Indexation continue](#indexation-continue)
5. [Monitoring](#monitoring)
6. [Troubleshooting](#troubleshooting)

---

## Pré-requis

### 1. Compte Algolia configuré

✅ Compte Algolia créé (gratuit ou payant)  
✅ Application créée dans le dashboard  
✅ API Keys récupérées (App ID, Search Key, Admin Key)  
✅ Variables d'environnement configurées (voir `.env.production`)

### 2. Firestore Production prêt

✅ Collections existantes avec données:
- `tasks` (tâches utilisateurs)
- `users` (profils utilisateurs)
- `services` (services disponibles)

✅ Firestore Rules configurées pour admin access

### 3. Node.js et pnpm

```bash
node --version  # >= 18.x
pnpm --version  # >= 8.x
```

---

## Configuration initiale

### 1. Copier `.env.production` vers `.env.local`

```bash
cp .env.production .env.local
```

### 2. Remplir les variables Algolia

```bash
# .env.local
NEXT_PUBLIC_ALGOLIA_APP_ID=YOUR_APP_ID
NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY=YOUR_SEARCH_KEY
ALGOLIA_ADMIN_API_KEY=YOUR_ADMIN_KEY  # ⚠️ Privée!
```

### 3. Installer les dépendances

```bash
pnpm install
```

### 4. Vérifier la configuration

```bash
# Lancer le script de test (dry-run)
pnpm tsx scripts/algolia-index.ts --dry-run
```

---

## Indexation initiale

### 1. Lancer l'indexation complète

```bash
pnpm algolia:index
```

**Ce script va :**
1. ✅ Se connecter à Firestore avec les credentials Firebase
2. ✅ Récupérer TOUTES les données des 3 collections
3. ✅ Transformer les données au format Algolia
4. ✅ Créer/Remplacer les indices:
   - `imu_tasks_production`
   - `imu_users_production`
   - `imu_services_production`
5. ✅ Configurer les attributs searchable, facets, ranking
6. ✅ Uploader les données par batches de 1000

### 2. Durée estimée

| Collection | Documents | Durée     |
|------------|-----------|-----------|
| Tasks      | 1,000     | ~30s      |
| Users      | 500       | ~15s      |
| Services   | 50        | ~5s       |
| **Total**  | **1,550** | **~50s**  |

Pour 10,000+ documents: prévoir 5-10 minutes.

### 3. Sortie console attendue

```bash
🚀 Indexation Algolia - Démarrage
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Configuration:
  App ID: YOUR_APP_ID
  Indices: 3 (tasks, users, services)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📦 Indexation Tasks...
  Récupération Firestore: 1,234 documents
  Transformation: ✅
  Upload Algolia (batch 1/2): ✅ 1000 records
  Upload Algolia (batch 2/2): ✅ 234 records
  ✅ Tasks indexés: 1,234 documents

📦 Indexation Users...
  Récupération Firestore: 567 documents
  Transformation: ✅
  Upload Algolia: ✅ 567 records
  ✅ Users indexés: 567 documents

📦 Indexation Services...
  Récupération Firestore: 42 documents
  Transformation: ✅
  Upload Algolia: ✅ 42 records
  ✅ Services indexés: 42 documents

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Indexation terminée!
  Total: 1,843 documents
  Durée: 1m 23s

🔍 Vérifier dans le dashboard:
  https://www.algolia.com/dashboard
```

### 4. Vérification dans le dashboard Algolia

1. **Ouvrir le dashboard:**  
   https://www.algolia.com/dashboard

2. **Naviguer vers les indices:**  
   Indices > `imu_tasks_production`

3. **Vérifier les données:**
   - Cliquer sur "Browse"
   - Voir les records indexés
   - Tester une recherche

4. **Vérifier la configuration:**
   - Configuration > Searchable Attributes: `title`, `description`, etc.
   - Configuration > Facets: `category`, `status`, etc.
   - Configuration > Ranking: Typo tolerance, Geo-search

---

## Indexation continue

### Option 1: Firestore Triggers (Recommandé)

**Créer des Cloud Functions pour sync automatique:**

```typescript
// functions/src/algolia-sync.ts
import * as functions from 'firebase-functions';
import algoliasearch from 'algoliasearch';

const client = algoliasearch(
  process.env.ALGOLIA_APP_ID!,
  process.env.ALGOLIA_ADMIN_API_KEY!
);

const tasksIndex = client.initIndex('imu_tasks_production');

export const syncTaskOnCreate = functions.firestore
  .document('tasks/{taskId}')
  .onCreate(async (snap, context) => {
    const task = snap.data();
    await tasksIndex.saveObject({
      objectID: context.params.taskId,
      ...transformTask(task)
    });
  });

export const syncTaskOnUpdate = functions.firestore
  .document('tasks/{taskId}')
  .onUpdate(async (change, context) => {
    const task = change.after.data();
    await tasksIndex.partialUpdateObject({
      objectID: context.params.taskId,
      ...transformTask(task)
    });
  });

export const syncTaskOnDelete = functions.firestore
  .document('tasks/{taskId}')
  .onDelete(async (snap, context) => {
    await tasksIndex.deleteObject(context.params.taskId);
  });
```

**Déployer:**

```bash
cd functions
pnpm install
firebase deploy --only functions
```

### Option 2: Cron Job hebdomadaire

**Utiliser GitHub Actions ou Vercel Cron:**

```yaml
# .github/workflows/algolia-reindex.yml
name: Algolia Reindex
on:
  schedule:
    - cron: '0 2 * * 0'  # Tous les dimanches à 2h du matin
  workflow_dispatch:  # Manuel

jobs:
  reindex:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Run indexation
        run: pnpm algolia:index
        env:
          NEXT_PUBLIC_ALGOLIA_APP_ID: ${{ secrets.ALGOLIA_APP_ID }}
          ALGOLIA_ADMIN_API_KEY: ${{ secrets.ALGOLIA_ADMIN_API_KEY }}
          NEXT_PUBLIC_FIREBASE_API_KEY: ${{ secrets.FIREBASE_API_KEY }}
          # ... autres variables Firebase
```

### Option 3: Script manuel

**Lancer manuellement quand nécessaire:**

```bash
# Tous les mois
pnpm algolia:index

# Ou automatiser avec cron local
0 0 1 * * cd /path/to/imu_task_web && pnpm algolia:index
```

---

## Monitoring

### 1. Dashboard Algolia

**Metrics à surveiller:**

- **Usage:** Analytics > Usage
  - Nombre de recherches/mois
  - Records indexés
  - Latence moyenne

- **Quotas:**
  - Plan gratuit: 10k recherches/mois, 10k records
  - Alertes si proche de 80%

- **Performance:**
  - Latence p50: < 20ms ✅
  - Latence p95: < 50ms ✅

### 2. Logs applicatifs

**Vérifier les logs Next.js:**

```bash
# Vercel
vercel logs --follow

# Local
pnpm dev
# Tester une recherche
# Voir les logs dans la console
```

**Logs attendus:**

```
[Algolia] Search query: "plombier"
[Algolia] Results: 12 hits in 15ms
[Analytics] Search logged: plombier (12 results)
```

### 3. Alertes recommandées

**Configurer des alertes pour:**

- ✅ Quota Algolia > 80%
- ✅ Latence > 100ms (performance dégradée)
- ✅ Taux d'erreur > 1% (problème de connexion)
- ✅ Indexation échouée (script cron)

---

## Troubleshooting

### Problème 1: Script échoue avec "Admin API Key missing"

**Cause:** Variable `ALGOLIA_ADMIN_API_KEY` non définie

**Solution:**

```bash
# Vérifier que la variable existe
echo $ALGOLIA_ADMIN_API_KEY

# Si vide, la définir dans .env.local
ALGOLIA_ADMIN_API_KEY=YOUR_ADMIN_KEY

# Relancer
pnpm algolia:index
```

### Problème 2: "Firestore permission denied"

**Cause:** Firebase credentials incorrects ou permissions Firestore

**Solution:**

1. Vérifier que les Firebase credentials sont corrects
2. Vérifier Firestore Rules:

```javascript
// firestore.rules
service cloud.firestore {
  match /databases/{database}/documents {
    // Admin access pour scripts
    match /{document=**} {
      allow read: if request.auth != null || request.time < timestamp.date(2099, 1, 1);
    }
  }
}
```

3. Relancer l'indexation

### Problème 3: "Index not found"

**Cause:** Indices pas encore créés dans Algolia

**Solution:**

Les indices sont créés automatiquement lors de la première indexation. Rien à faire.

### Problème 4: Données manquantes

**Cause:** Transformation échoue ou champs null

**Solution:**

1. Vérifier les logs de transformation
2. Ajouter des null checks dans `scripts/algolia-index.ts`:

```typescript
function transformTask(task: any) {
  return {
    objectID: task.id || 'unknown',
    title: task.title || 'Sans titre',
    description: task.description || '',
    // ... avec fallbacks
  };
}
```

### Problème 5: Latence élevée (> 100ms)

**Cause:** Configuration sous-optimale ou trop de résultats

**Solution:**

1. Réduire `hitsPerPage` de 20 à 8
2. Activer le cache Algolia
3. Optimiser les filtres contextuels

```typescript
const searchParams = {
  hitsPerPage: 8,  // Au lieu de 20
  attributesToRetrieve: ['title', 'description'],  // Seulement les champs nécessaires
  cacheable: true
};
```

---

## Checklist finale

Avant de mettre en production:

- [ ] ✅ Compte Algolia configuré
- [ ] ✅ Variables d'environnement dans `.env.production`
- [ ] ✅ Variables d'environnement sur Vercel/hosting
- [ ] ✅ Indexation initiale réussie (`pnpm algolia:index`)
- [ ] ✅ Vérification dashboard Algolia (3 indices avec données)
- [ ] ✅ Test de recherche dans l'app (dev puis production)
- [ ] ✅ Monitoring configuré (alertes quotas)
- [ ] ✅ Indexation continue configurée (Firestore Triggers ou Cron)
- [ ] ✅ Documentation partagée avec l'équipe
- [ ] ✅ Plan de rollback prêt (fallback à ContextualSearch)

---

## Commandes utiles

```bash
# Indexation complète
pnpm algolia:index

# Indexation avec logs verbeux
DEBUG=* pnpm algolia:index

# Dry-run (simulation sans upload)
pnpm tsx scripts/algolia-index.ts --dry-run

# Indexation d'une seule collection
pnpm tsx scripts/algolia-index.ts --index tasks

# Vérifier la configuration
pnpm tsx scripts/algolia-index.ts --check-config

# Supprimer tous les indices (⚠️ DANGER)
pnpm tsx scripts/algolia-index.ts --clear-all
```

---

## Support

**En cas de problème:**

1. Consulter ce guide (Troubleshooting)
2. Vérifier les logs Algolia dashboard
3. Consulter la documentation Algolia: https://www.algolia.com/doc/
4. Contacter le support Algolia (plans payants)

**Ressources:**

- 📖 [Documentation Algolia](https://www.algolia.com/doc/)
- 🎥 [Vidéos tutoriels](https://www.algolia.com/developers/video-courses/)
- 💬 [Community Forum](https://discourse.algolia.com/)
- 📧 [Support Email](mailto:support@algolia.com) (plans payants)

---

## Conclusion

L'indexation Algolia est maintenant configurée et prête pour la production ! 🚀

**Prochaines étapes:**

1. Déployer l'application en production
2. Lancer l'indexation initiale
3. Vérifier les premières recherches
4. Configurer le monitoring
5. Profiter de la recherche ultra-rapide (<20ms) ! ⚡
