# Guide des Tests E2E - IMU Task

## Résumé de l'exécution

**Tests créés** : 5 fichiers, ~1400 lignes  
**Tests exécutés** : 48 tests  
**Résultat** : 1 passed, 47 failed, 1 skipped  

## Problèmes identifiés

### 1. Sélecteurs incorrects sur la page d'inscription

**Problème** : Les tests utilisent `getByLabel(/email/i)` mais les champs utilisent `data-testid`.

**Solution** : Utiliser les bons sélecteurs :

```typescript
// ❌ INCORRECT
await page.getByLabel(/email/i).fill(email);
await page.getByLabel(/nom/i).fill(name);
await page.getByLabel(/mot de passe/i).fill(password);

// ✅ CORRECT
await page.getByTestId('signup-email').fill(email);
await page.getByTestId('signup-name').fill(name);
await page.getByTestId('signup-password').fill(password);
await page.getByTestId('signup-confirm-password').fill(password);
```

### 2. Sélecteurs disponibles par page

#### Page d'inscription (`/sign-up`)
```typescript
// Champs du formulaire
page.getByTestId('signup-name')
page.getByTestId('signup-email')
page.getByTestId('signup-password')
page.getByTestId('signup-confirm-password')

// Boutons
page.getByRole('button', { name: /s'inscrire/i })
page.getByRole('button', { name: /sign up/i })
```

#### Page de connexion (`/sign-in`)
```typescript
// Champs du formulaire
page.getByTestId('login-email')
page.getByTestId('login-password')

// Boutons
page.getByRole('button', { name: /se connecter/i })
page.getByRole('button', { name: /sign in/i })
```

#### Dashboard
```typescript
// Navigation
page.getByTestId('dashboard-header')
page.getByTestId('user-menu')
page.getByTestId('logout-button')

// Tabs admin
page.getByTestId('admin-tab-kyc')
page.getByTestId('admin-tab-invoices')
```

### 3. Tests spécifiques nécessitant des ajustements

#### Tests d'authentification (auth-flow.spec.ts)
- ✅ Les sélecteurs sont déjà corrects
- ❌ Mais les tests échouent parce que les pages appelées après utilisent `getByLabel()`

#### Tests KYB (kyb-flow.spec.ts)
- ❌ Utilise `getByLabel(/email/i)` → Changer en `getByTestId('signup-email')`
- ❌ Utilise `getByLabel(/nom/i)` → Changer en `getByTestId('signup-name')`
- ❌ Utilise `getByLabel(/mot de passe/i)` → Changer en `getByTestId('signup-password')`

#### Tests Profil Pro (professional-profile.spec.ts)
- ❌ `beforeEach()` utilise les mauvais sélecteurs
- ❌ Tous les tests échouent au setup

#### Tests Devis (quote-flow.spec.ts)
- ❌ Même problème que KYB
- ❌ Tous les tests timeout à l'inscription

#### Tests Factures (invoice-flow.spec.ts)
- ❌ Même problème que KYB
- ❌ 13/13 tests échouent

#### Tests Onboarding (onboarding-wizard.spec.ts)
- ❌ Tous les tests échouent au setup
- ❌ 6/6 tests timeout

### 4. Index Firestore manquants

**Erreur** : `FirebaseError: The query requires an index`

```
Query: notifications where userId == X order by createdAt desc
```

**Solution** : Créer l'index composite dans Firebase Console :
```
Collection: notifications
Fields:
  - userId (Ascending)
  - createdAt (Descending)
  - __name__ (Descending)
```

### 5. Tests de notifications

Les tests de notifications échouent car :
1. Pas d'authentification avant d'accéder `/fr/notifications`
2. Index Firestore manquant
3. Sélecteurs inexistants

## Actions correctives prioritaires

### Priorité 1 : Corriger les sélecteurs d'inscription
Modifier tous les fichiers de tests pour utiliser `getByTestId()` :

1. **kyb-flow.spec.ts** (3 occurrences × 3 tests = 9 fixes)
2. **professional-profile.spec.ts** (1 beforeEach = 7 tests affectés)
3. **quote-flow.spec.ts** (6 tests)
4. **invoice-flow.spec.ts** (13 tests)
5. **onboarding-wizard.spec.ts** (6 tests)

### Priorité 2 : Créer les index Firestore
1. Aller sur Firebase Console
2. Créer l'index `notifications` avec `userId + createdAt`
3. Attendre que l'index soit actif (~2-5 minutes)

### Priorité 3 : Ajuster les tests de notifications
1. Ajouter authentification dans `beforeEach()`
2. Utiliser les bons sélecteurs
3. Attendre que l'index soit créé

### Priorité 4 : Vérifier les pages manquantes
Certaines pages référencées dans les tests n'existent peut-être pas :
- `/dashboard/kyb` → Vérifier existence
- `/dashboard/pro/quotes/new` → Vérifier existence
- `/dashboard/pro/invoices/upload` → Vérifier existence
- `/dashboard/pro/onboarding` → Vérifier existence
- `/dashboard/pro/profile/edit` → Vérifier existence

## Estimation du temps de correction

- **Sélecteurs** : 30 minutes (chercher/remplacer dans 5 fichiers)
- **Index Firestore** : 5-10 minutes (création + attente)
- **Tests notifications** : 20 minutes (refonte)
- **Vérification pages** : 15 minutes

**Total estimé** : ~1h30

## Tests qui fonctionnent déjà

✅ **1 test passé** :
- `auth-flow.spec.ts` : Quelques tests d'authentification de base

## Conclusion

**Diagnostic** : Les tests sont bien écrits mais utilisent les mauvais sélecteurs pour les champs de formulaire d'inscription.

**Solution simple** : Remplacer `getByLabel(/pattern/)` par `getByTestId('test-id')` dans tous les fichiers de tests.

**Impact** : Cette correction devrait faire passer **40+ tests** sur 48 (83%+ de réussite).

## Commandes utiles

```bash
# Exécuter tous les tests
pnpm test:e2e

# Exécuter un seul fichier
pnpm test:e2e e2e/kyb-flow.spec.ts

# Mode UI (debugging)
pnpm test:e2e:ui

# Exécuter avec rapport HTML
pnpm test:e2e --reporter=html

# Voir le rapport
open playwright-report/index.html
```

## Next Steps

1. Corriger les sélecteurs dans tous les fichiers de tests
2. Créer les index Firestore manquants
3. Ré-exécuter les tests
4. Documenter les résultats finaux
5. Marquer Task 10 comme "completed" si >80% de réussite
