# 🎯 Guide de Démarrage Rapide - Nouvelles Fonctionnalités

## Ce qui a été implémenté aujourd'hui (17 octobre 2025)

### ✅ 1. Règles de Sécurité Firestore & Storage

**Fichiers modifiés** :
- `firestore.rules` - Règles pour collection `kyc_submissions`
- `storage.rules` - Règles pour dossier `kyc/{userId}/`

**Tester les règles** :
```bash
# Démarrer l'émulateur Firebase
firebase emulators:start

# Déployer les règles (nécessite plan Blaze)
firebase deploy --only firestore:rules,storage:rules
```

---

### ✅ 2. Tests E2E pour KYC

**Fichier créé** : `e2e/kyc-flow.spec.ts` (10 scénarios)

**Prérequis** :
- ✅ Fixtures générées (script déjà exécuté)
- ✅ Serveur de dev lancé sur port 9002
- ✅ Compte admin créé avec email: `admin@imutask.com`

**Exécuter les tests** :
```bash
# Tous les tests E2E
npx playwright test

# Tests KYC uniquement
npx playwright test e2e/kyc-flow.spec.ts

# Mode interactif (debug)
npx playwright test --ui

# Avec rapport visuel
npx playwright test --headed
```

---

### ✅ 3. Catalogue de Services UI

**Nouveaux fichiers** :
- `src/types/services.ts` - Types et enums (8 catégories, 16 templates)
- `src/components/services/category-selector.tsx` - Composant de sélection
- `src/components/services/task-templates.tsx` - Composant templates
- `src/app/[locale]/dashboard/tasks/create/page.tsx` - Page création tâche

**Tester la fonctionnalité** :
1. Lancer le serveur : `pnpm dev`
2. Aller sur : `http://localhost:9002/fr/dashboard/tasks/create`
3. Suivre le wizard en 3 étapes :
   - Étape 1 : Choisir une catégorie (8 options)
   - Étape 2 : Sélectionner un template (ou sauter)
   - Étape 3 : Compléter les détails et publier

---

## 🚀 Comment tester maintenant

### Test 1 : Sécurité Firestore (avec émulateur)

```bash
# Terminal 1 : Émulateur
firebase emulators:start

# Terminal 2 : Tests de règles
npm test -- firestore-rules.test.ts
```

**Note** : Le test nécessite le package `@firebase/rules-unit-testing` (déjà installé).

---

### Test 2 : Création de tâche avec catalogue

```bash
# Lancer le serveur
pnpm dev

# Ouvrir dans le navigateur
open http://localhost:9002/fr/dashboard/tasks/create
```

**Scénario de test manuel** :
1. Se connecter avec un compte utilisateur
2. Cliquer sur "Créer une tâche" (ou aller directement sur `/tasks/create`)
3. Sélectionner "Aide à domicile" → Continuer
4. Choisir template "Ménage complet appartement" → Auto-remplissage
5. Modifier titre/description si besoin
6. Ajouter localisation : "Paris 75001"
7. Définir date/heure (optionnel)
8. Vérifier budget suggéré : 60€, durée : 180 min
9. Cliquer "Publier la tâche"
10. Vérifier redirection vers page de la tâche créée

---

### Test 3 : Tests E2E KYC (nécessite serveur lancé)

```bash
# Terminal 1 : Serveur de dev
pnpm dev

# Terminal 2 : Tests Playwright
npx playwright test e2e/kyc-flow.spec.ts

# Ou avec UI interactive
npx playwright test e2e/kyc-flow.spec.ts --ui
```

**Important** : Assurez-vous d'avoir un compte admin créé avec :
- Email : `admin@imutask.com`
- Password : `AdminPassword123!`

Si pas encore créé, créer manuellement via Firebase Console ou via l'app.

---

## 📊 Composants du Catalogue disponibles

### `ServiceCategorySelector`

Utilisation dans une page :
```tsx
import { ServiceCategorySelector } from '@/components/services/category-selector';
import { ServiceCategory } from '@/types/services';

function MyPage() {
  const [category, setCategory] = useState<ServiceCategory>();

  return (
    <ServiceCategorySelector
      value={category}
      onChange={setCategory}
      showExamples={true}
      showPriceRange={true}
    />
  );
}
```

### `ServiceCategoryFilter`

Pour filtres de recherche (multi-sélection) :
```tsx
import { ServiceCategoryFilter } from '@/components/services/category-selector';

function SearchPage() {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);

  return (
    <ServiceCategoryFilter
      value={categories}
      onChange={setCategories}
    />
  );
}
```

### `TaskTemplates`

Affichage des templates par catégorie :
```tsx
import { TaskTemplates } from '@/components/services/task-templates';

function CreateTask() {
  const handleSelectTemplate = (template: TaskTemplate) => {
    // Pré-remplir le formulaire
    setTitle(template.title);
    setDescription(template.description);
    // ...
  };

  return (
    <TaskTemplates
      category={selectedCategory}
      onSelectTemplate={handleSelectTemplate}
    />
  );
}
```

### `ServiceCategoryBadge`

Badge compact pour affichage :
```tsx
import { ServiceCategoryBadge } from '@/components/services/category-selector';

function TaskCard({ task }) {
  return (
    <Card>
      <ServiceCategoryBadge
        category={task.category}
        showIcon={true}
      />
      {/* ... */}
    </Card>
  );
}
```

---

## 🎨 Catégories disponibles

1. **Aide à domicile** (`home_help`)
   - Icône : 🏠 Home
   - Prix : 15-25€/h
   - Exemples : Ménage, rangement, petits travaux

2. **Courses & Livraisons** (`delivery`)
   - Icône : 🛒 ShoppingCart
   - Prix : 12-20€/h
   - Exemples : Courses supermarché, livraison colis

3. **Aide Numérique** (`digital_help`)
   - Icône : 📱 Smartphone
   - Prix : 18-30€/h
   - Exemples : Config smartphone, formation apps

4. **Déménagement** (`moving`)
   - Icône : 📦 Package
   - Prix : 15-25€/h
   - Exemples : Cartons, meubles, manutention

5. **Accompagnement** (`accompaniment`)
   - Icône : 👥 Users
   - Prix : 15-22€/h
   - Exemples : Rendez-vous médicaux, compagnie

6. **Jardinage** (`gardening`)
   - Icône : 🌲 TreePine
   - Prix : 15-22€/h
   - Exemples : Tonte pelouse, nettoyage jardin

7. **Garde d'animaux** (`pet_care`)
   - Icône : 🐕 Dog
   - Prix : 12-20€/visite
   - Exemples : Promenade chien, pet sitting

8. **Aide Événementielle** (`event_help`)
   - Icône : 🎉 PartyPopper
   - Prix : 15-25€/h
   - Exemples : Installation, service, accueil

---

## 📝 Templates pré-remplis (16 au total)

Chaque catégorie a 2 templates par défaut. Exemples :

**Aide à domicile** :
- "Ménage complet appartement" (3h, 60€)
- "Rangement garage/cave" (4h, 80€)

**Courses & Livraisons** :
- "Courses hebdomadaires" (1h30, 25€)
- "Course urgente pharmacie" (30min, 10€)

**Aide Numérique** :
- "Configuration smartphone senior" (2h, 50€)
- "Formation visioconférence" (1h30, 40€)

Voir `src/types/services.ts` pour la liste complète.

---

## 🔧 Prochaines Étapes Recommandées

### Immédiat (aujourd'hui)
1. ✅ Tester manuellement la création de tâche
2. ✅ Vérifier l'affichage mobile
3. ✅ Créer un compte admin si pas encore fait

### Court terme (cette semaine)
1. ⏳ Exécuter les tests E2E (après config admin)
2. ⏳ Ajouter page de recherche avec filtres par catégorie
3. ⏳ Afficher les badges de catégorie sur les tâches existantes

### Moyen terme (avant production)
1. ⏳ Upgrade vers plan Blaze Firebase
2. ⏳ Déployer les règles Firestore/Storage
3. ⏳ Déployer les 11 Cloud Functions
4. ⏳ Configurer monitoring et analytics

---

## 🐛 Dépannage

### Erreur : "Cannot find module '@/types/services'"
→ Redémarrer le serveur de dev : `pnpm dev`

### Erreur Playwright : "test-identity.pdf not found"
→ Régénérer les fixtures : `node scripts/generate-fixtures.js`

### Erreur : "Firebase App '[DEFAULT]' already exists"
→ Vérifier qu'il n'y a qu'une seule initialisation Firebase dans le code

### Tests E2E échouent : "Timeout waiting for element"
→ Vérifier que le serveur tourne sur port 9002
→ Augmenter le timeout dans `playwright.config.ts` si connexion lente

---

## 📚 Documentation Complète

- **Catalogue de services** : `/docs/SERVICES_CATALOG.md`
- **Vision ImuPro** : `/docs/IMUPRO_VISION.md`
- **Session recap** : `/docs/SESSION_2025-10-17_PART2_SECURITY_TESTS_CATALOG.md`
- **KYC Integration** : `/docs/KYC_INTEGRATION_COMPLETED.md`
- **Quick Start** : `/docs/QUICK_START_GUIDE.md`

---

## 💡 Astuces

1. **Debug composants UI** : Utiliser React DevTools pour inspecter les props
2. **Debug tests E2E** : Utiliser `npx playwright test --debug` pour mode pas-à-pas
3. **Voir les requêtes Firestore** : Ouvrir l'onglet Network dans DevTools
4. **Tester les règles localement** : Toujours utiliser l'émulateur avant déploiement

---

## ✅ Checklist de Validation

Avant de passer en production, vérifier :

- [ ] Les 8 catégories s'affichent correctement
- [ ] Les templates se chargent et pré-remplissent le formulaire
- [ ] La création de tâche sauvegarde dans Firestore
- [ ] Les règles de sécurité sont déployées
- [ ] Les tests E2E passent tous (10/10)
- [ ] L'interface est responsive mobile
- [ ] Les icônes Lucide s'affichent correctement
- [ ] Pas d'erreur dans la console navigateur
- [ ] Pas d'erreur TypeScript à la compilation

---

**Statut actuel** : 🟢 Prêt pour tests manuels et déploiement staging

**Next action** : Tester manuellement la création de tâche avec toutes les catégories
