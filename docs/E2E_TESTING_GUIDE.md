# Guide d'ajout des data-testid pour les tests E2E

## Modifications nécessaires pour supporter les tests E2E

Les fichiers suivants doivent être modifiés pour ajouter les attributs `data-testid` :

### 1. `src/app/[locale]/dashboard/messages/page.tsx`

**Modifications :**
- Ajouter `data-testid="messages-page"` sur le div principal
- Ajouter `data-testid="notification-banner"` sur NotificationBanner (déjà géré dans le composant)
- Ajouter `data-testid="mobile-header"` sur le header mobile
- Ajouter `data-testid="mobile-view"` sur un élément pour détecter la vue mobile

### 2. `src/components/messaging/thread-list.tsx`

**Modifications :**
- Ajouter `data-testid="thread-list"` sur le conteneur principal
- Ajouter `data-testid="thread-list-loading"` sur le spinner de chargement
- Ajouter `data-testid="thread-search-input"` sur l'input de recherche
- Ajouter `data-testid="filter-all"`, `data-testid="filter-unread"`, etc. sur FilterPills
- Ajouter `data-testid="empty-state-{type}"` sur IllustratedEmptyState

### 3. `src/components/messaging/thread-list-item.tsx`

**Modifications :**
- Ajouter `data-testid="thread-item"` sur le bouton principal
- Ajouter `data-testid="thread-item-{id}"` avec l'ID du thread
- Ajouter `data-testid="thread-avatar"` sur l'Avatar
- Ajouter `data-testid="unread-badge"` sur le Badge
- Ajouter `data-testid="thread-timestamp"` sur le timestamp
- Ajouter `data-testid="favorite-icon"` sur l'icône favori (si présente)

### 4. `src/components/messaging/new-conversation-button.tsx`

**Modifications :**
- Ajouter `data-testid="new-conversation-fab"` sur le bouton FAB

### 5. `src/components/messaging/new-conversation-modal.tsx`

**Modifications :**
- Ajouter `data-testid="new-conversation-modal"` sur le Dialog
- Ajouter `data-testid="modal-title"` sur le DialogTitle
- Ajouter `data-testid="user-search-input"` sur l'input de recherche
- Ajouter `data-testid="user-result"` sur chaque UserListItem

### 6. `src/components/messaging/filter-pills.tsx`

**Modifications :**
- Ajouter `data-testid="filter-{type}"` sur chaque pill (all, unread, favorites, groups)

### 7. `src/components/messaging/notification-banner.tsx`

**Modifications :**
- Ajouter `data-testid="notification-banner"` sur le div principal
- Ajouter `data-testid="banner-dismiss"` sur le bouton de fermeture

### 8. `src/components/messaging/illustrated-empty-state.tsx`

**Modifications :**
- Ajouter `data-testid="empty-state-{type}"` sur le div principal

### 9. `src/components/messaging/header-actions.tsx`

**Modifications :**
- Ajouter `data-testid="header-menu-button"` sur le bouton du menu
- Ajouter `data-testid="header-menu-dropdown"` sur le DropdownMenuContent

### 10. Page de thread individuel (si existe)

**Modifications :**
- Ajouter `data-testid="message-panel"` sur le panneau de messages
- Ajouter `data-testid="message-input"` sur l'input de saisie
- Ajouter `data-testid="send-button"` sur le bouton d'envoi
- Ajouter `data-testid="message-item"` sur chaque message
- Ajouter `data-testid="pii-warning"` sur l'avertissement PII

## Priorités

### Priorité 1 (Critique pour tests de base) :
1. thread-list.tsx
2. thread-list-item.tsx
3. new-conversation-button.tsx
4. filter-pills.tsx

### Priorité 2 (Important pour tests complets) :
5. new-conversation-modal.tsx
6. notification-banner.tsx
7. illustrated-empty-state.tsx
8. header-actions.tsx

### Priorité 3 (Pour tests avancés) :
9. page.tsx (messages)
10. Page de thread individuel

## Note importante

Les tests E2E actuels utilisent des mocks Firestore. Pour une vraie implémentation en production :
- Utiliser Firebase Emulator Suite pour les tests
- Créer des données de test dans Firestore
- Nettoyer les données après chaque test
- Considérer l'utilisation de `test.beforeAll` et `test.afterAll` pour setup/teardown

## Commandes utiles

```bash
# Lancer les tests E2E en mode headless
pnpm playwright test e2e/messaging.spec.ts

# Lancer en mode UI (interactif)
pnpm playwright test --ui e2e/messaging.spec.ts

# Lancer en mode debug
pnpm playwright test --debug e2e/messaging.spec.ts

# Générer un rapport
pnpm playwright test e2e/messaging.spec.ts --reporter=html
```
