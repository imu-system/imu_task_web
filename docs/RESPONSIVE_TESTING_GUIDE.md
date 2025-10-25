# Guide de Test de Responsivité - Dashboards IMU Task

## 📱 Appareils à Tester

### Mobile
- **iPhone SE (375px)** - Petit écran mobile
- **iPhone 12/13/14 (390px)** - Standard iOS
- **iPhone 14 Pro Max (430px)** - Large iOS
- **Samsung Galaxy S21 (360px)** - Standard Android

### Tablet
- **iPad Mini (768px)** - Petit tablet
- **iPad Pro 11" (834px)** - Standard tablet
- **iPad Pro 12.9" (1024px)** - Large tablet

### Desktop
- **Laptop 13" (1280px)** - Petit laptop
- **Desktop HD (1920px)** - Standard desktop
- **Desktop 4K (2560px+)** - Large desktop

## 🧪 Tests à Effectuer

### 1. Header (DashboardHeader)

#### Mobile (< 768px)
- [ ] Logo/titre visible et centré
- [ ] Barre de recherche en pleine largeur sous le header
- [ ] Boutons notifications/messages accessibles (min 44px touch target)
- [ ] Menu utilisateur fonctionne en dropdown
- [ ] Badge de notifications visible (pas de chevauchement)
- [ ] Pas de scroll horizontal

#### Tablet (768px - 1024px)
- [ ] Barre de recherche inline à côté du titre
- [ ] Tous les éléments visibles sans wrap
- [ ] Espacement approprié entre les éléments
- [ ] Icons et badges bien proportionnés

#### Desktop (> 1024px)
- [ ] Header sticky fonctionne au scroll
- [ ] Largeur max-width respectée
- [ ] Hover states sur tous les boutons
- [ ] Transitions fluides

### 2. Search Bar (ContextualSearch)

#### Mobile
- [ ] Input en pleine largeur (padding approprié)
- [ ] Icon de recherche visible (gauche)
- [ ] Bouton clear visible (droite)
- [ ] Dropdown résultats en pleine largeur
- [ ] Touch targets minimum 44px
- [ ] Keyboard mobile approprié (type="text")
- [ ] Auto-focus ne cause pas de zoom (font-size >= 16px)

#### Tablet/Desktop
- [ ] Largeur max-width: 2xl (42rem)
- [ ] Dropdown centré sous l'input
- [ ] Animations smooth (framer-motion)
- [ ] Loader visible pendant recherche
- [ ] Résultats avec scroll si > 400px

#### Tous devices
- [ ] Debounce fonctionne (300ms)
- [ ] Recherches récentes affichées
- [ ] Click outside ferme le dropdown
- [ ] ESC ferme le dropdown
- [ ] Enter soumet la recherche

### 3. Quick Actions

#### Mobile (< 640px)
- [ ] Mode compact: 4 actions max
- [ ] Disposition horizontal avec wrap
- [ ] Boutons tactiles (min 44px height)
- [ ] Icons visibles et clairs
- [ ] Texte lisible (pas trop petit)

#### Mobile - Senior Mode
- [ ] Boutons extra larges (h-24)
- [ ] Texte extra large (text-xl)
- [ ] Espacement généreux (p-6)
- [ ] Couleurs contrastées

#### Tablet
- [ ] Mode full card
- [ ] Grid 2 colonnes
- [ ] Descriptions visibles
- [ ] Hover effects sur desktop

#### Desktop
- [ ] Grid 3 colonnes (sauf senior: 2 cols)
- [ ] Toutes les actions visibles
- [ ] Hover effects smooth
- [ ] Icons cohérents

### 4. KPI Cards

#### Mobile
- [ ] Stack vertical (1 colonne)
- [ ] Cards pleine largeur
- [ ] Padding approprié
- [ ] Icons visibles
- [ ] Nombres lisibles (text-3xl)
- [ ] Links touchables

#### Tablet
- [ ] Grid 2 colonnes
- [ ] Espacement égal
- [ ] Hover sur desktop

#### Desktop
- [ ] Grid 3 colonnes
- [ ] Border-2 visible
- [ ] Hover shadow-lg
- [ ] Transition smooth

### 5. Tabs (Tasks Section)

#### Mobile
- [ ] TabsList scrollable horizontalement si débordement
- [ ] Touch targets appropriés
- [ ] Indicateur d'onglet actif visible
- [ ] Content s'affiche correctement

#### Tablet/Desktop
- [ ] Tabs inline
- [ ] Content avec animations
- [ ] Empty states bien centrés

### 6. Task Cards

#### Mobile
- [ ] Stack vertical (1 colonne)
- [ ] Tous les détails visibles
- [ ] Boutons actions accessibles
- [ ] Badge status visible
- [ ] Descriptions avec line-clamp-2

#### Tablet
- [ ] Grid 2 colonnes
- [ ] Spacing cohérent

#### Desktop
- [ ] Grid 2-3 colonnes selon largeur
- [ ] Hover border-primary
- [ ] Transitions smooth

### 7. Services Section

#### Mobile
- [ ] Stack vertical complet
- [ ] Cards pleine largeur
- [ ] Sidebar en bas (après content)
- [ ] ServicePackCard adaptées

#### Tablet
- [ ] Services: 2 colonnes
- [ ] Sidebar: 1 colonne à droite

#### Desktop
- [ ] Layout lg:grid-cols-3
- [ ] Services: 2 cols (lg:col-span-2)
- [ ] Sidebar: 1 col
- [ ] Spacing cohérent

## 🔍 Tests Navigateurs

### Chrome/Edge
- [ ] Desktop: Toutes fonctionnalités
- [ ] Mobile emulator: DevTools
- [ ] Touch events fonctionnent

### Safari
- [ ] iOS: Touch events
- [ ] macOS: Hover states
- [ ] Animations framer-motion
- [ ] -webkit prefixes OK

### Firefox
- [ ] Desktop: Toutes fonctionnalités
- [ ] Responsive mode
- [ ] Animations smooth

## ⚡ Performance Tests

### Lighthouse Mobile
- [ ] Performance > 80
- [ ] Accessibility > 90
- [ ] Best Practices > 90
- [ ] SEO > 80

### Core Web Vitals
- [ ] LCP < 2.5s
- [ ] FID < 100ms
- [ ] CLS < 0.1

### Real Device Testing
- [ ] iOS Safari: Smooth scroll
- [ ] Android Chrome: Touch responsive
- [ ] No layout shifts
- [ ] Animations 60fps

## 🎨 Visual Tests

### Typography
- [ ] Pas de texte < 14px sur mobile (sauf metadata)
- [ ] Senior mode: text-xl minimum
- [ ] Line-height approprié
- [ ] Contrast ratios WCAG AA

### Spacing
- [ ] Touch targets min 44px
- [ ] Padding cohérent (p-4, p-6)
- [ ] Gaps entre éléments (space-y-4, gap-4)
- [ ] Margins extérieurs appropriés

### Colors
- [ ] Dark mode fonctionne
- [ ] Contraste suffisant
- [ ] Status colors distinctes
- [ ] Hover states visibles

## 📊 Analytics Tests

### Événements à Vérifier
- [ ] `dashboard_page_view` au chargement
- [ ] `dashboard_search` lors de recherche
- [ ] `dashboard_quick_action` au clic
- [ ] `dashboard_kpi_click` au clic KPI
- [ ] `dashboard_task_action` (view/edit)
- [ ] `dashboard_tab_change` au changement d'onglet
- [ ] `search_suggestion_click` au clic suggestion
- [ ] `service_card_click` au clic service
- [ ] `favorite_toggle` (add/remove)

### Vérification Console
```javascript
// Ouvrir DevTools > Console
// Filtrer par "dashboard_"
// Vérifier que les events sont loggés avec bon payload
```

## 🛠️ Outils de Test

### Chrome DevTools
1. F12 > Device Toolbar (Cmd+Shift+M)
2. Sélectionner device preset ou custom
3. Toggle device orientation
4. Network throttling: Fast 3G
5. CPU throttling: 4x slowdown

### Responsive Design Mode (Firefox)
1. Cmd+Option+M
2. Custom responsive sizes
3. Touch simulation

### Real Device Testing
- **iOS**: Safari Remote Debugging
- **Android**: Chrome Remote Debugging
- **BrowserStack**: Multi-device testing

### Commandes Test Locales
```bash
# Mode mobile avec hot reload
pnpm dev

# Ouvrir sur réseau local
http://[YOUR_LOCAL_IP]:3000

# Lighthouse CLI
npx lighthouse http://localhost:3000/dashboard/client --view

# Accessibility audit
npx pa11y http://localhost:3000/dashboard/client
```

## ✅ Checklist Finale

### Critical
- [ ] Pas de scroll horizontal sur mobile
- [ ] Tous les boutons touchables (min 44px)
- [ ] Search fonctionne sur tous devices
- [ ] Animations smooth (60fps)
- [ ] Analytics events déclenchés

### Important
- [ ] Header sticky fonctionne
- [ ] Tabs scrollables sur mobile
- [ ] Empty states bien affichés
- [ ] Loading states visibles
- [ ] Error states gérés

### Nice to Have
- [ ] Transitions framer-motion fluides
- [ ] Skeleton loaders animés
- [ ] Hover effects sur desktop uniquement
- [ ] Dark mode complet
- [ ] Haptic feedback sur mobile (vibrations)

## 📝 Rapport de Test

### Template
```markdown
## Test: [Device/Browser]
Date: [Date]
Testeur: [Nom]

### ✅ Fonctionne
- Point 1
- Point 2

### ⚠️ Problèmes Mineurs
- Problème 1 (non bloquant)

### ❌ Problèmes Critiques
- Problème 1 (bloquant)

### Screenshots
[Ajouter screenshots si nécessaire]

### Recommandations
- Action 1
- Action 2
```

---

**Note**: Ce guide est évolutif. Ajouter de nouveaux tests au fur et à mesure du développement.
