# Phase 9 - Options E, F, G : Dashboard Advanced Features

**Date de création** : 7 novembre 2025  
**Phase** : Phase 9 - Dashboard Improvements (Suite)  
**Statut** : 🟡 En planification

---

## 📋 Vue d'ensemble

Après avoir complété les **Options A, B, C, D** (connexion données réelles, charts provider/client/admin), nous ajoutons maintenant les fonctionnalités avancées pour rendre les dashboards production-ready et enterprise-grade.

### Contexte
- **Options A-D complétées** : 11 composants, 10 hooks, 4 types de charts, 50+ translations
- **Recharts v2.15.1** : Déjà intégré et fonctionnel
- **Firestore** : Indexes déployés, queries optimisées
- **Cible** : Dashboards utilisables en production avec exports, filtres, temps réel

---

## 🎯 Phase 9 - Option E : Export de Rapports

### Objectifs
Permettre aux utilisateurs d'exporter leurs données dashboard pour analyse externe, archivage, ou partage avec comptables/collaborateurs.

### Fonctionnalités

#### E.1 : Export CSV
**Cible** : Provider, Client, Admin  
**Données exportables** :
- **Provider** : 
  - Revenue mensuel (CSV avec colonnes : Month, Revenue, Transactions, Average)
  - Liste bookings (CSV : Date, Task, Client, Amount, Status)
  - Liste proposals (CSV : Date, Task, Offer, Status, Response Time)
- **Client** :
  - Dépenses mensuelles (CSV : Month, Spent, Tasks Count, Average)
  - Liste tasks créées (CSV : Date, Title, Category, Budget, Status)
  - Historique bookings (CSV : Date, Provider, Amount, Status)
- **Admin** :
  - GMV mensuel (CSV : Month, GMV, Platform Revenue, Transactions, Avg Transaction)
  - User growth (CSV : Month, New Clients, New Providers, Total Users, Active Rate)
  - Tasks par catégorie (CSV : Category, Total, Completed, Completion Rate, GMV)

**Librairie** : `papaparse` (déjà dans package.json ou à ajouter)  
**Format** : UTF-8 BOM (pour Excel), séparateur `,`, headers automatiques

#### E.2 : Export PDF
**Cible** : Provider, Client, Admin  
**Contenu PDF** :
- **Header** : Logo ImuTask, nom utilisateur, période, date génération
- **KPI Cards** : Snapshot des métriques principales (cards actuels)
- **Charts** : Screenshots des graphiques (html2canvas)
- **Footer** : "Généré par ImuTask - [date]"

**Librairies** :
- `jsPDF` : Génération PDF
- `html2canvas` : Capture charts en images
- Alternative : `react-to-pdf` ou `@react-pdf/renderer`

**Options** :
- Portrait vs Landscape
- Période personnalisée (default : 6 derniers mois)
- Langue (FR/EN)

#### E.3 : UI/UX Export

**Composant** : `<ExportButton />` (réutilisable)
```tsx
<ExportButton 
  data={chartData}
  filename="revenue-report"
  formats={['csv', 'pdf']}
  onExport={(format) => handleExport(format)}
/>
```

**Placement** :
- Header de chaque chart (top-right, icon Download)
- Dashboard header (export complet multi-charts)

**Features** :
- Dropdown menu : "Export CSV", "Export PDF"
- Loading state pendant génération (spinner)
- Toast success : "Rapport exporté ✓" avec lien download
- Error handling : "Erreur lors de l'export"

**Accessibilité** :
- Keyboard shortcut : `Ctrl/Cmd + E`
- Screen reader label : "Exporter les données"
- Focus trap dans modal si options avancées

---

### Architecture

#### Fichiers à créer

1. **`src/components/dashboard/export-button.tsx`** (~200 lignes)
   - Dropdown menu (CSV, PDF)
   - Loading states
   - Toast notifications

2. **`src/lib/export-utils.ts`** (~300 lignes)
   - `exportToCSV(data, filename)` : papaparse wrapper
   - `exportChartToPDF(chartRef, filename)` : jsPDF + html2canvas
   - `generatePDFReport(sections[], metadata)` : Multi-chart PDF

3. **`src/hooks/use-export.ts`** (~150 lignes)
   - `useExportCSV(data, filename)`
   - `useExportPDF(chartRef, options)`
   - Error handling, loading states

#### Fichiers à modifier

1. **`src/components/dashboard/revenue-chart.tsx`**
   - Ajouter `<ExportButton />` dans header
   - Ajouter `ref` pour capture PDF

2. **`src/components/dashboard/gmv-chart.tsx`**
   - Ajouter `<ExportButton />`
   - Ajouter metadata pour PDF (title, subtitle)

3. **`src/components/dashboard/client-spending-chart.tsx`**
   - Ajouter `<ExportButton />`

4. **`src/components/dashboard/task-category-chart.tsx`**
   - Ajouter `<ExportButton />`

5. **`src/components/dashboard/user-growth-chart.tsx`**
   - Ajouter `<ExportButton />`

6. **`src/components/dashboard/admin-stats-cards.tsx`**
   - Ajouter "Export All" button dans header

#### Traductions

**`src/messages/fr.json`** :
```json
"Dashboard": {
  "export": {
    "title": "Exporter les données",
    "csv": "Exporter en CSV",
    "pdf": "Exporter en PDF",
    "all": "Exporter tout",
    "loading": "Génération en cours...",
    "success": "Rapport exporté avec succès",
    "error": "Erreur lors de l'export",
    "filename": "rapport-{type}-{date}"
  }
}
```

**`src/messages/en.json`** : Traductions équivalentes

---

### Dépendances

```bash
pnpm add papaparse jspdf html2canvas
pnpm add -D @types/papaparse
```

**Alternatives considérées** :
- `react-to-print` : Trop simple, pas de contrôle layout PDF
- `@react-pdf/renderer` : Overkill, syntaxe custom JSX
- **Choix** : jsPDF + html2canvas = Flexibilité + Simplicité

---

### Timeline estimée

- **E.1 (CSV)** : 2h
  - Setup papaparse + hook (30min)
  - Transformers data (30min)
  - Integration 5 charts (1h)

- **E.2 (PDF)** : 3h
  - Setup jsPDF + html2canvas (45min)
  - Layout PDF template (1h)
  - Multi-chart aggregation (1h15)

- **E.3 (UI/UX)** : 1h30
  - ExportButton component (45min)
  - Toasts + loading states (30min)
  - Translations (15min)

**Total Option E** : ~6h30

---

## 🎯 Phase 9 - Option F : Filtres Avancés

### Objectifs
Permettre aux utilisateurs de filtrer les données affichées dans les charts pour analyses ciblées (période spécifique, catégories, statuts).

### Fonctionnalités

#### F.1 : Date Range Picker
**Cible** : Tous les charts avec dimension temporelle  
**Features** :
- Sélection date start/end (calendar UI)
- Presets : "7 derniers jours", "30 jours", "3 mois", "6 mois", "1 an", "Tout"
- Default : 6 derniers mois (comportement actuel)
- Validation : startDate <= endDate
- Sync avec URL params : `?from=2025-01-01&to=2025-06-30`

**Composant** : `react-day-picker` ou `shadcn/ui DateRangePicker`

#### F.2 : Category Filters (Admin/Client)
**Cible** : TaskCategoryChart, Admin dashboard  
**Features** :
- Multi-select dropdown (checkboxes)
- 8 catégories ImuTask
- "Select All" / "Clear All"
- Affichage : "3 catégories sélectionnées" ou noms si <= 2
- Apply filters → Re-query Firestore avec `where('category', 'in', selectedCategories)`

#### F.3 : Status Filters
**Cible** : Admin dashboard, Provider/Client bookings  
**Features** :
- Checkboxes : "Completed", "Active", "Cancelled"
- Default : All checked
- Apply → Filter chartData client-side ou Firestore query

#### F.4 : Search Bar (Admin)
**Cible** : Admin dashboard (user search, task search)  
**Features** :
- Input text avec icon Search
- Debounce 300ms
- Search by : User name, email, task title
- Results : Highlight matching rows dans tables

#### F.5 : Filters UI/UX

**Composant** : `<DashboardFilters />` (réutilisable)
```tsx
<DashboardFilters
  onDateRangeChange={(start, end) => setDateRange([start, end])}
  onCategoriesChange={(cats) => setSelectedCategories(cats)}
  onStatusChange={(statuses) => setSelectedStatuses(statuses)}
  onSearchChange={(query) => setSearchQuery(query)}
  onApply={() => refetchWithFilters()}
  onReset={() => resetFilters()}
/>
```

**Placement** :
- Top de chaque chart (collapsible section "Filtres")
- Sticky header dashboard (global filters)

**Features** :
- Collapsible panel (icon ChevronDown)
- Badge count : "3 filtres actifs"
- Buttons : "Appliquer" (primary), "Réinitialiser" (secondary)
- Persist filters dans localStorage : `dashboard-filters-{userId}`

---

### Architecture

#### Fichiers à créer

1. **`src/components/dashboard/dashboard-filters.tsx`** (~350 lignes)
   - DateRangePicker integration
   - Category multi-select
   - Status checkboxes
   - Search input
   - Apply/Reset logic

2. **`src/hooks/use-dashboard-filters.ts`** (~200 lignes)
   - `useDateRangeFilter(defaultMonths)`
   - `useCategoryFilter()`
   - `useStatusFilter()`
   - `useSearchFilter(debounce)`
   - localStorage persistence

3. **`src/lib/filter-utils.ts`** (~150 lignes)
   - `buildFirestoreQuery(filters)` : Construct query from filters
   - `filterDataClientSide(data, filters)` : Fallback client-side
   - `serializeFilters(filters)` : URL params
   - `deserializeFilters(params)` : Parse URL

#### Fichiers à modifier

1. **`src/hooks/use-revenue-stats.ts`**
   - Ajouter param `filters: DashboardFilters`
   - Apply dateRange dans query : `where('completedAt', '>=', startDate).where('completedAt', '<=', endDate)`

2. **`src/hooks/use-admin-stats.ts`**
   - Ajouter `filters` param à tous les hooks
   - Apply category/status filters dans queries

3. **`src/hooks/use-client-stats.ts`**
   - Ajouter `filters` param
   - Filter categories client-side si nécessaire

4. **Tous les charts** (5 composants)
   - Ajouter `<DashboardFilters />` dans header
   - Connect filters à hooks
   - Update URL params on filter change

#### Traductions

**`src/messages/fr.json`** :
```json
"Dashboard": {
  "filters": {
    "title": "Filtres",
    "dateRange": "Période",
    "categories": "Catégories",
    "status": "Statut",
    "search": "Rechercher...",
    "apply": "Appliquer",
    "reset": "Réinitialiser",
    "active": "{count} filtre(s) actif(s)",
    "presets": {
      "7days": "7 derniers jours",
      "30days": "30 derniers jours",
      "3months": "3 mois",
      "6months": "6 mois",
      "1year": "1 an",
      "all": "Tout"
    }
  }
}
```

**`src/messages/en.json`** : Traductions équivalentes

---

### Dépendances

```bash
# Déjà dans shadcn/ui
# Si besoin date picker custom :
pnpm add react-day-picker date-fns
```

**shadcn/ui components à installer** :
```bash
npx shadcn-ui@latest add calendar
npx shadcn-ui@latest add popover
npx shadcn-ui@latest add checkbox
npx shadcn-ui@latest add command
```

---

### Timeline estimée

- **F.1 (Date Range)** : 2h
  - DateRangePicker component (1h)
  - Integration hooks (1h)

- **F.2 (Categories)** : 1h30
  - Multi-select dropdown (45min)
  - Query integration (45min)

- **F.3 (Status)** : 1h
  - Checkboxes UI (30min)
  - Filter logic (30min)

- **F.4 (Search)** : 1h30
  - Search input + debounce (45min)
  - Firestore query / client filter (45min)

- **F.5 (UI/UX)** : 2h
  - DashboardFilters component (1h)
  - localStorage persistence (30min)
  - URL params sync (30min)

**Total Option F** : ~8h

---

## 🎯 Phase 9 - Option G : Analytics Temps Réel

### Objectifs
Transformer les dashboards en outils de monitoring temps réel avec live updates, activity feeds, et notifications instantanées.

### Fonctionnalités

#### G.1 : Live Data Updates (Firestore onSnapshot)
**Cible** : Tous les charts et KPIs  
**Comportement** :
- Replace `getDocs()` par `onSnapshot()` dans hooks
- Auto-refresh quand nouveau booking/task créé
- Visual indicator : "Mis à jour il y a Xs" + green dot
- Throttle updates : Max 1 refresh/5s pour éviter flicker

**Impact** :
- Provider voit son revenue update instantanément après booking completed
- Admin voit GMV augmenter en temps réel
- Client voit ses tasks status changer live

#### G.2 : Activity Feed
**Cible** : Admin dashboard (prioritaire), Provider/Client (secondaire)  
**Contenu** :
- **Admin** :
  - "Nouveau booking : Client X → Provider Y - 50€" (il y a 2min)
  - "Task complétée : [Task Title] - Provider Z" (il y a 5min)
  - "Nouvel utilisateur : John Doe (Client)" (il y a 10min)
  - "KYC soumis : Provider ABC" (il y a 15min)
- **Provider** :
  - "Nouvelle proposition reçue : Client X sur [Task]" (il y a 1min)
  - "Booking confirmé : [Task] - 80€" (il y a 3h)
- **Client** :
  - "Proposition reçue : Provider Y offre 45€" (il y a 5min)
  - "Task complétée : [Task]" (il y a 2h)

**Composant** : `<ActivityFeed />` (~250 lignes)
- Liste des 10 dernières activités
- Real-time avec `onSnapshot()`
- Icons différents par type (UserPlus, CheckCircle, DollarSign, FileText)
- Relative time : "il y a 2min", "il y a 1h"
- Auto-scroll vers le haut sur new item (avec animation)

#### G.3 : Real-Time KPI Badges
**Cible** : AdminStatsCards, Provider/Client metrics  
**Comportement** :
- Pulse animation quand valeur change
- +X badge (vert) quand augmentation détectée
- Transition smooth des nombres (countup animation)

**Exemple** :
```tsx
<Card>
  <CardHeader>
    <CardTitle>Total Users</CardTitle>
    {recentChange > 0 && (
      <Badge variant="success" className="animate-pulse">
        +{recentChange} aujourd'hui
      </Badge>
    )}
  </CardHeader>
  <CardContent>
    <div className="text-3xl font-bold">
      <CountUp end={totalUsers} duration={1.5} />
    </div>
  </CardContent>
</Card>
```

#### G.4 : Live Chart Updates
**Cible** : Tous les charts Recharts  
**Comportement** :
- onSnapshot updates → chartData state change
- Recharts auto-animates bars/lines (built-in)
- Highlight new data point (glow effect, different color)
- Optional : "Live" badge (green dot) sur chart header

**Optimisation** :
- Debounce chart re-renders (300ms)
- Memoize chart data transformations
- Conditional rendering : Only update if data actually changed (deep compare)

#### G.5 : WebSocket (Optionnel - Phase 2)
**Objectif** : Notifications push instantanées sans polling Firestore  
**Architecture** :
- Cloud Function HTTP endpoint → WebSocket server
- Client subscribes : `ws://api.imutask.com/ws?userId={id}&type=dashboard`
- Server broadcasts : "NEW_BOOKING", "TASK_COMPLETED", "GMV_UPDATE"
- Client receives → Update state → Toast notification

**Alternative simple (Phase 1)** :
- Firestore triggers → Cloud Pub/Sub → FCM (Firebase Cloud Messaging)
- Web push notifications (service worker)
- User clicks → Dashboard auto-refreshes

**Décision** : Skip WebSocket pour Phase 9, utiliser onSnapshot (suffisant pour MVP)

---

### Architecture

#### Fichiers à créer

1. **`src/components/dashboard/activity-feed.tsx`** (~300 lignes)
   - Real-time activity list
   - onSnapshot query (limit 10, orderBy 'createdAt' desc)
   - Icons + relative time
   - Auto-scroll animation

2. **`src/components/dashboard/live-indicator.tsx`** (~80 lignes)
   - "Live" badge avec green dot
   - "Mis à jour il y a Xs"
   - Pulse animation

3. **`src/hooks/use-live-updates.ts`** (~200 lignes)
   - `useLiveData(query, transform)` : Generic onSnapshot wrapper
   - `useActivityFeed(userId, limit)` : Activity stream
   - `useRealtimeKPI(metric)` : Live KPI with change detection

4. **`src/lib/activity-logger.ts`** (~150 lignes)
   - `logActivity(type, metadata)` : Write to Firestore `activities` collection
   - Called from: createBooking, completeTask, createUser, submitKYC
   - Schema : `{ type, userId, metadata: {}, createdAt, read: false }`

#### Fichiers à modifier

1. **Tous les hooks de données** (8 hooks)
   - Replace `getDocs()` par `onSnapshot()`
   - Add cleanup : `return () => unsubscribe()`
   - Add throttle logic (useDebounce 300ms)

2. **Tous les charts** (5 composants)
   - Add `<LiveIndicator />` dans header
   - Add memoization : `useMemo(() => transformData(rawData), [rawData])`

3. **`src/app/[locale]/dashboard/admin/page.tsx`**
   - Add `<ActivityFeed />` dans sidebar ou top section

4. **`src/lib/bookings.ts`, `src/lib/tasks.ts`**
   - Add `logActivity()` calls après mutations

#### Firestore

**Nouvelle collection** : `activities`
```typescript
interface Activity {
  id: string;
  type: 'NEW_BOOKING' | 'TASK_COMPLETED' | 'NEW_USER' | 'KYC_SUBMITTED' | 'PROPOSAL_CREATED';
  userId: string; // Admin or relevant user
  metadata: {
    bookingId?: string;
    taskId?: string;
    taskTitle?: string;
    amount?: number;
    userName?: string;
    // ...
  };
  createdAt: Timestamp;
  read: boolean;
}
```

**Index nécessaire** :
```json
{
  "collectionGroup": "activities",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "userId", "order": "ASCENDING" },
    { "fieldPath": "createdAt", "order": "DESCENDING" }
  ]
}
```

**Rules** :
```javascript
match /activities/{activityId} {
  allow read: if request.auth != null && resource.data.userId == request.auth.uid;
  allow write: if false; // Only Cloud Functions
}
```

#### Traductions

**`src/messages/fr.json`** :
```json
"Dashboard": {
  "live": {
    "indicator": "En direct",
    "updated": "Mis à jour il y a {time}",
    "activity": "Activité récente",
    "noActivity": "Aucune activité récente",
    "types": {
      "NEW_BOOKING": "Nouveau booking",
      "TASK_COMPLETED": "Tâche complétée",
      "NEW_USER": "Nouvel utilisateur",
      "KYC_SUBMITTED": "KYC soumis",
      "PROPOSAL_CREATED": "Nouvelle proposition"
    }
  }
}
```

**`src/messages/en.json`** : Traductions équivalentes

---

### Dépendances

```bash
# Pour countup animation
pnpm add react-countup

# Pour relative time
# date-fns déjà installé (Phase précédente)
```

---

### Timeline estimée

- **G.1 (Live Updates)** : 2h
  - Refactor hooks getDocs → onSnapshot (1h)
  - Throttle + cleanup logic (1h)

- **G.2 (Activity Feed)** : 3h
  - ActivityFeed component (1h)
  - Firestore activities collection setup (30min)
  - logActivity() integration (1h)
  - Firestore rules + index deploy (30min)

- **G.3 (KPI Badges)** : 1h30
  - Change detection logic (45min)
  - Countup + pulse animations (45min)

- **G.4 (Chart Updates)** : 1h
  - LiveIndicator component (30min)
  - Chart memoization (30min)

- **G.5 (WebSocket)** : 0h (skipped pour Phase 9)

**Total Option G** : ~7h30

---

## 📊 Résumé des 3 Options

| Option | Objectif | Composants | Hooks | Libs | Durée estimée |
|--------|----------|------------|-------|------|---------------|
| **E - Exports** | CSV + PDF reports | 1 (ExportButton) | 1 (useExport) | papaparse, jsPDF, html2canvas | ~6h30 |
| **F - Filtres** | Date ranges, categories, search | 1 (DashboardFilters) | 1 (useDashboardFilters) | react-day-picker, shadcn/ui | ~8h |
| **G - Temps Réel** | Live updates, activity feed | 2 (ActivityFeed, LiveIndicator) | 1 (useLiveUpdates) | react-countup | ~7h30 |
| **TOTAL** | Phase 9 complète | **4 nouveaux** | **3 nouveaux** | 6 libs | **~22h** |

---

## 🎯 Ordre d'implémentation recommandé

### Approche Séquentielle (1 option à la fois)
**Avantage** : Focus, testing complet après chaque option  
**Ordre** :
1. **Option G** (Temps Réel) → Impact UX immédiat, fondation pour autres
2. **Option F** (Filtres) → Utilise les données live de G
3. **Option E** (Exports) → Export des données filtrées de F

**Timeline** : 3 jours (1 jour/option)

---

### Approche Parallèle (sous-tâches indépendantes)
**Avantage** : Livraison incrémentale, flexibilité  
**Phases** :
1. **Jour 1 - Foundations** (7h)
   - G.1 : onSnapshot refactor (2h)
   - F.1 : DateRangePicker (2h)
   - E.1 : CSV export utils (2h)
   - Documentation setup (1h)

2. **Jour 2 - Core Features** (8h)
   - G.2 : ActivityFeed component (3h)
   - F.2-F.4 : Filtres categories/status/search (3h30)
   - E.2 : PDF generation (30min setup)
   - Translations FR/EN (1h)

3. **Jour 3 - Polish & Integration** (7h)
   - G.3-G.4 : KPI badges + chart updates (2h30)
   - F.5 : DashboardFilters UI/UX (2h)
   - E.2-E.3 : PDF finalization + ExportButton (3h)
   - Testing + docs (30min)

**Timeline** : 3 jours (22h total)

---

## ✅ Critères de complétion Phase 9 (100%)

### Option E - Exports
- [ ] User peut exporter charts en CSV (5 formats : revenue, spending, GMV, users, categories)
- [ ] User peut exporter dashboard en PDF (header, KPIs, charts, footer)
- [ ] ExportButton intégré dans 5 charts
- [ ] Toast notifications (success/error)
- [ ] Traductions FR/EN complètes
- [ ] Documentation PHASE9_OPTION_E_EXPORTS.md

### Option F - Filtres
- [ ] DateRangePicker fonctionnel (6 presets + custom)
- [ ] Category multi-select (8 catégories)
- [ ] Status filters (3 checkboxes)
- [ ] Search bar avec debounce 300ms
- [ ] Filters persist dans localStorage
- [ ] URL params sync (`?from=...&to=...&categories=...`)
- [ ] "Apply" / "Reset" buttons
- [ ] Badge count "X filtres actifs"
- [ ] Traductions FR/EN complètes
- [ ] Documentation PHASE9_OPTION_F_FILTERS.md

### Option G - Temps Réel
- [ ] Tous les hooks utilisent onSnapshot (8 hooks refactored)
- [ ] ActivityFeed component fonctionnel (10 dernières activités)
- [ ] LiveIndicator avec "Mis à jour il y a Xs"
- [ ] KPI badges avec countup animation
- [ ] Pulse animation sur changements détectés
- [ ] Firestore `activities` collection créée
- [ ] Firestore rules + index déployés
- [ ] logActivity() appelé dans 4 endpoints
- [ ] Traductions FR/EN complètes
- [ ] Documentation PHASE9_OPTION_G_REALTIME.md

---

## 📚 Documentation à créer

1. **PHASE9_OPTION_E_EXPORTS.md** (~400 lignes)
   - Architecture export system
   - CSV format specs
   - PDF layout design
   - Usage examples

2. **PHASE9_OPTION_F_FILTERS.md** (~450 lignes)
   - Filter types documentation
   - Query building logic
   - localStorage schema
   - URL params format

3. **PHASE9_OPTION_G_REALTIME.md** (~500 lignes)
   - onSnapshot pattern
   - ActivityFeed architecture
   - Firestore activities collection
   - Performance considerations

4. **PHASE9_COMPLETE_FINAL.md** (~600 lignes)
   - Recap Options A-G (7 options total)
   - Metrics : 15+ components, 13+ hooks, 100+ translations
   - Testing guide
   - Deployment checklist

**Total documentation** : ~2,000 lignes

---

## 🚀 Prochaines étapes

Après validation de ce plan :

1. **Choix approche** : Séquentielle ou Parallèle ?
2. **Choix option prioritaire** : E, F ou G en premier ?
3. **Validation technique** : Libs à installer OK ?
4. **Start implementation** : Créer premier fichier

**Question pour user** : Voulez-vous :
- A) Séquentiel : Option G (Temps Réel) → F (Filtres) → E (Exports)
- B) Parallèle : Jour 1 foundations → Jour 2 core → Jour 3 polish
- C) Custom : Choisir une option spécifique à implémenter en priorité

---

**Date de création** : 7 novembre 2025  
**Phase** : Phase 9 - Dashboard Improvements (Suite)  
**Statut** : 🟡 En planification  
**Prêt pour implémentation** : ✅ Oui
