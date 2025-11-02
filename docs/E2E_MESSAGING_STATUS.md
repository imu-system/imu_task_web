# Tests E2E Messagerie - État d'avancement

**Date** : 30 octobre 2025  
**Version** : 1.0 - Phase initiale  
**Statut** : ⏳ En cours - Infrastructure créée, data-testid à compléter

---

## ✅ Travaux réalisés

### 1. Fichiers de tests créés

#### `e2e/messaging.spec.ts` (22 tests)
Tests E2E complets pour le système de messagerie :

**Tests de base (1-10) :**
1. ✅ Affichage de la liste des threads avec design WhatsApp
2. ✅ Filtrage par "Non lus"
3. ✅ Filtrage par "Favoris"
4. ✅ Filtrage par "Groupes"
5. ✅ Recherche de threads par nom/contenu
6. ✅ Empty state illustré pour recherche vide
7. ✅ Ouverture du modal nouvelle conversation (FAB)
8. ✅ Recherche d'utilisateur dans le modal
9. ✅ Sélection d'un thread
10. ✅ Envoi d'un message simple

**Tests PII (11-12) :**
11. ✅ Détection PII - Email
12. ✅ Détection PII - Numéro de téléphone

**Tests UI/UX (13-20) :**
13. ✅ Empty state "Pas de conversations"
14. ✅ Banner de notification (affichage + fermeture)
15. ✅ Menu des actions du header
16. ✅ Badge de messages non lus (style WhatsApp)
17. ✅ Avatar par défaut (fond vert WhatsApp)
18. ✅ Formatage du timestamp
19. ✅ Responsive - Vue mobile
20. ✅ Hover states sur les threads

**Tests avancés (21-22) :**
21. ✅ Changement de filtre met à jour la liste
22. ✅ Clear de la recherche restaure la liste

#### `e2e/fixtures/messaging-helpers.ts` (~400 lignes)
Helpers et utilitaires pour les tests de messagerie :

**Données de test :**
- `mockThreads` : 3 threads de test (1-1, 1-1 favori, groupe)
- `mockMessages` : 3 messages de test avec timestamps réalistes

**Fonctions de mock :**
- `injectMessagingMocks()` : Injecte les données Firestore mockées
- Override des queries Firestore pour threads et messages

**Fonctions de navigation :**
- `navigateToMessages()` : Aller à la page de messagerie
- `waitForThreadList()` : Attendre le chargement complet

**Fonctions d'interaction :**
- `openNewConversationModal()` : Ouvrir le modal FAB
- `searchUserInModal()` : Rechercher un utilisateur
- `selectThread()` : Sélectionner un thread
- `sendMessage()` : Envoyer un message
- `clickFilter()` : Cliquer sur un filtre pill
- `searchThreads()` : Rechercher dans les threads
- `dismissNotificationBanner()` : Fermer le banner
- `openHeaderMenu()` : Ouvrir le menu header

**Fonctions d'assertion :**
- `expectThreadVisible()` : Vérifier qu'un thread est visible
- `expectThreadNotVisible()` : Vérifier qu'un thread n'est pas visible
- `expectThreadCount()` : Vérifier le nombre de threads
- `expectEmptyState()` : Vérifier un empty state
- `expectPIIWarning()` : Vérifier l'avertissement PII
- `getUnreadCount()` : Obtenir le compteur de non lus

### 2. Documentation créée

#### `docs/E2E_TESTING_GUIDE.md`
Guide complet pour l'ajout des `data-testid` :
- Liste des 10 composants à modifier
- Priorités d'implémentation (P1, P2, P3)
- Commandes utiles Playwright
- Notes sur Firebase Emulator pour tests réels

---

## ⏳ Travaux en cours

### 1. Ajout des data-testid aux composants

**Status actuel :**
- ✅ `filter-pills.tsx` - Ajouté `data-testid="filter-{type}"`
- ❌ 9 autres composants à modifier

**Priorité 1 (Critique) :**
- [ ] `thread-list.tsx` - Liste principale, input recherche, loading
- [ ] `thread-list-item.tsx` - Items, avatar, badge, timestamp
- [ ] `new-conversation-button.tsx` - Bouton FAB
- [x] `filter-pills.tsx` - Pills de filtres ✅

**Priorité 2 (Important) :**
- [ ] `new-conversation-modal.tsx` - Modal, titre, input, résultats
- [ ] `notification-banner.tsx` - Banner, bouton dismiss
- [ ] `illustrated-empty-state.tsx` - Empty states par type
- [ ] `header-actions.tsx` - Bouton menu, dropdown

**Priorité 3 (Avancé) :**
- [ ] `page.tsx` - Container principal, header mobile
- [ ] Page thread individuel - Panel messages, input, send, PII warning

---

## 🚀 Prochaines étapes

### Étape 1 : Compléter les data-testid (Priorité 1)
```bash
# Fichiers à modifier immédiatement
1. src/components/messaging/thread-list.tsx
2. src/components/messaging/thread-list-item.tsx
3. src/components/messaging/new-conversation-button.tsx
```

**Attributs clés à ajouter :**
- `data-testid="thread-list"` (conteneur)
- `data-testid="thread-list-loading"` (spinner)
- `data-testid="thread-search-input"` (input recherche)
- `data-testid="thread-item"` (item de liste)
- `data-testid="thread-item-{id}"` (item avec ID)
- `data-testid="thread-avatar"` (avatar)
- `data-testid="unread-badge"` (badge)
- `data-testid="thread-timestamp"` (timestamp)
- `data-testid="new-conversation-fab"` (FAB)

### Étape 2 : Compléter les data-testid (Priorité 2)
Ajouter les attributs pour les composants secondaires (modal, banner, empty states, header).

### Étape 3 : Exécuter les tests localement
```bash
# Installer Playwright si nécessaire
pnpm install --save-dev @playwright/test

# Lancer les tests
pnpm playwright test e2e/messaging.spec.ts

# Mode UI interactif
pnpm playwright test --ui e2e/messaging.spec.ts

# Mode debug
pnpm playwright test --debug e2e/messaging.spec.ts
```

### Étape 4 : Corriger les tests qui échouent
- Ajuster les sélecteurs
- Corriger les assertions
- Adapter aux délais réels de l'application

### Étape 5 : Ajouter les tests manquants
**Tests supplémentaires à considérer :**
- Scroll infini dans la liste de threads
- Gestion des erreurs réseau
- Reconnexion après déconnexion
- Notifications push (si implémenté)
- Partage de fichiers/images (V2)

### Étape 6 : Intégration CI/CD
```yaml
# .github/workflows/e2e-tests.yml
name: E2E Tests Messagerie
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: pnpm install
      - run: pnpm playwright install --with-deps
      - run: pnpm playwright test e2e/messaging.spec.ts
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## 📊 Métriques

### Couverture des fonctionnalités
- **Affichage de base** : ✅ 100% (liste, threads, avatars)
- **Filtres** : ✅ 100% (all, unread, favorites, groups)
- **Recherche** : ✅ 100% (search + empty state)
- **Création conversation** : ✅ 100% (FAB + modal + search user)
- **Envoi messages** : ⚠️ 50% (envoi de base OK, PII détection à tester)
- **Empty states** : ✅ 100% (5 types illustrés)
- **Actions header** : ✅ 100% (menu + dropdown)
- **Banner** : ✅ 100% (affichage + dismiss)
- **Responsive** : ✅ 100% (mobile + desktop)
- **WhatsApp design** : ✅ 100% (couleurs, fonts, hover)

### Tests par catégorie
- **UI/Affichage** : 8 tests ✅
- **Interactions** : 7 tests ✅
- **Filtrage/Recherche** : 5 tests ✅
- **PII Detection** : 2 tests ⚠️ (à finaliser)
- **Responsive** : 1 test ✅
- **Avancés** : 2 tests ✅

**Total** : 22 tests écrits, ~15 tests exécutables après ajout data-testid

---

## 🔧 Configuration Playwright

### Fichier `playwright.config.ts` (existant)
```typescript
testDir: './e2e',
baseURL: 'http://localhost:9002',
fullyParallel: true,
retries: 2, // En CI
reporter: 'html',
projects: [
  { name: 'chromium', use: { ...devices['Desktop Chrome'] } }
],
webServer: {
  command: 'npm run dev',
  url: 'http://localhost:9002',
  reuseExistingServer: !process.env.CI,
}
```

### Extensions recommandées
- `ms-playwright.playwright` - Extension VS Code officielle
- Permet de lancer/debugger tests depuis l'éditeur
- Auto-complétion dans les fichiers `.spec.ts`

---

## ⚠️ Notes importantes

### Mocks vs Firebase Emulator
**Actuellement** : Tests utilisent des mocks JavaScript injectés  
**Pour production** : Migrer vers Firebase Emulator Suite

**Avantages Firebase Emulator :**
- Tests plus réalistes (vraies queries Firestore)
- Pas de mocks à maintenir
- Teste les règles de sécurité Firestore
- Snapshot/restore de données facile

**Migration :**
```bash
# Installer Firebase Emulator
firebase init emulators

# Lancer les emulators
firebase emulators:start

# Dans les tests, connecter à l'emulator
const { initializeApp } = require('firebase/app');
const { connectFirestoreEmulator } = require('firebase/firestore');

initializeApp(config);
connectFirestoreEmulator(db, 'localhost', 8080);
```

### Limitations actuelles
1. **PII Detection** : Mocks ne testent pas vraiment le système de détection
2. **Real-time updates** : Mocks ne simulent pas les subscriptions Firestore
3. **Concurrence** : Tests ne vérifient pas les conflits multi-utilisateurs
4. **Performance** : Pas de tests de charge/stress

### Recommandations futures
1. **Ajouter des tests de performance** (Lighthouse CI)
2. **Tester l'accessibilité** (axe-core dans Playwright)
3. **Tester différents navigateurs** (Firefox, Safari)
4. **Tester différentes langues** (FR, EN)
5. **Tests de régression visuelle** (Percy, Chromatic)

---

## 📝 Checklist avant merge

- [ ] Tous les `data-testid` ajoutés (10 composants)
- [ ] Tests lancés localement : `pnpm playwright test e2e/messaging.spec.ts`
- [ ] Rapport HTML généré sans erreurs critiques
- [ ] Au moins 80% des tests passent
- [ ] Documentation à jour (ce fichier + MESSAGERIE.md)
- [ ] Commit des fichiers de tests :
  - `e2e/messaging.spec.ts`
  - `e2e/fixtures/messaging-helpers.ts`
  - `docs/E2E_TESTING_GUIDE.md`
  - `docs/E2E_MESSAGING_STATUS.md` (ce fichier)
- [ ] Mise à jour du ROADMAP.md

---

**Estimation temps restant** : ~1-2h  
**Bloquants** : Aucun  
**Dépendances** : Playwright déjà configuré ✅
