# ImuTask - Copilot Instructions

## Project Overview

**ImuTask** is a Next.js 15 marketplace platform connecting young service providers (students, entrepreneurs) with clients needing help with everyday tasks (groceries, furniture assembly, digital help, etc.). Built with TypeScript, Firebase, and next-intl for multi-language support.

**Business Model:** 15-20% commission on transactions  
**Tech Stack:** Next.js 15.3.3, React 18, TypeScript, Tailwind CSS, Firebase (Auth/Firestore/Storage), shadcn/ui, Genkit AI

---

## Critical Architecture Patterns

### 1. Internationalization (i18n) - NON-NEGOTIABLE

**All navigation MUST use locale-aware routing:**

```typescript
// ❌ NEVER import from 'next/navigation'
import { useRouter } from 'next/navigation';

// ✅ ALWAYS import from '@/navigation'
import { useRouter, Link } from '@/navigation';
```

**Translation usage:**
- Client components: `const t = useTranslations('Namespace');`
- Server components: `const t = await getTranslations('Namespace');`
- Translations live in `src/messages/{locale}.json` (not public folder)
- Supported locales: `['en', 'fr', 'ja']` (defined in `src/i18n.ts`)

**Why:** Routes include locale prefix (`/fr/dashboard`, `/en/tasks`). Using Next.js native navigation breaks i18n and causes 404s.

**See:** `docs/I18N_FINAL_COMPLIANCE_REPORT.md` for complete audit results

---

### 2. Firebase Integration

**Import pattern:**
```typescript
import { auth, db, storage, functions } from '@/lib/firebase';
```

**Key collections:**
- `users` - User profiles (accountType: 'client' | 'provider' | 'both')
- `tasks` - Task postings (8 service categories)
- `proposals` - Provider offers on tasks
- `bookings` - Confirmed engagements
- `threads` & `messages` - Chat system
- `transactions`, `wallets`, `payouts` - Payment system
- `kyc_submissions` - Provider verification docs

**Security model:** Firestore rules enforce owner-based access. Always set `userId` fields correctly on writes.

**Environment:** Dev server runs on port **9002** (not 3000). Firebase emulators on port 4000.

---

### 3. Feature-Based Organization

Code is organized by domain in `src/features/`:
- `auth/` - Authentication flows
- `tasks/` - Task CRUD (catalog system with 8 categories + templates)
- `bookings/` - Booking management
- `chat/` - Messaging/conversations
- `payments/` - Wallet, transactions, payouts
- `profiles/` - User profiles, KYC

**When adding features:** Group related components, hooks, and utils in the appropriate feature folder.

---

## Development Workflows

### Running the Application

```bash
# Dev server (Turbopack) - port 9002
pnpm dev

# Genkit AI dev UI
pnpm genkit:dev

# Firebase emulators (optional)
firebase emulators:start
# Firestore UI: http://localhost:4000
```

### Testing

```bash
# Unit tests (Jest)
pnpm test              # Single run
pnpm test:watch        # Watch mode
pnpm test:coverage     # With coverage

# E2E tests (Playwright)
pnpm test:e2e          # Headless
pnpm test:e2e:ui       # UI mode
```

**E2E conventions:** Use `data-testid` attributes for test selectors (see `docs/E2E_TESTING_GUIDE.md`).

### Build & Type Safety

```bash
pnpm typecheck         # TypeScript validation
pnpm build             # Production build
pnpm lint              # ESLint
```

**Note:** Build currently has `ignoreBuildErrors: true` - avoid adding new TS errors.

---

## Project-Specific Conventions

### 1. UI Components (shadcn/ui)

All UI primitives in `src/components/ui/` are from shadcn (Radix UI). **Never modify these directly.**

**Styling utility:**
```typescript
import { cn } from '@/lib/utils';

<div className={cn("base-classes", conditional && "extra-class")} />
```

### 2. Forms & Validation

**Standard pattern:**
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({ /* ... */ });
const form = useForm({ resolver: zodResolver(schema) });
```

### 3. Geolocation & Distance Calculations

Use `src/lib/geolocation.ts` for:
- `calculateDistance(lat1, lon1, lat2, lon2)` - Haversine formula
- `filterTasksByDistance(tasks, userLocation, maxKm)`
- `formatDistance(km)` - Locale-aware formatting

**Location data:** Stored as `{ lat: number; lng: number; address: string }` in Firestore.

### 4. Service Categories

**8 MVP categories** (see `docs/SERVICES_CATALOG.md`):
1. Aide à domicile & Petits travaux
2. Courses & Livraisons
3. Aide Numérique & Administrative
4. Déménagement & Manutention
5. Accompagnement & Présence
6. Jardinage & Extérieur
7. Animaux de compagnie
8. Événements & Occasions spéciales

Each category has **2 predefined templates** for quick task creation (16 total templates).

### 5. Authentication & Account Types

**Flow:** Signup → Onboarding → Select accountType (`client`/`provider`/`both`) → Dashboard

**Middleware logic:**
- Public routes: `/`, `/particuliers`, `/professionnels`, `/auth/*`
- Protected routes: `/dashboard`, `/tasks`, `/messages` (requires auth + accountType)
- Onboarding bypass: Users without accountType redirected to `/onboarding`

**See:** `src/middleware.ts` for complete routing logic

---

## Common Integration Points

### Algolia Search

```bash
# Index tasks to Algolia
pnpm algolia:index
```

Config: `src/lib/algolia-config.ts`, usage in `src/lib/search-service.ts`

### Google Maps

Configured in `src/lib/google-maps-config.ts`. API key required in `.env.local`:
```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key
```

### Genkit AI (Google Gemini)

Used for task categorization and smart matching. Entry point: `src/ai/dev.ts`

---

## Deployment & Firestore

**Rules deployment:**
```bash
# Main rules
firebase deploy --only firestore:rules

# Payment-specific collections
./scripts/deploy-firestore-payments.sh
```

**Indexes:** Composite indexes defined in `firestore.indexes.json` and `firestore-payments.indexes.json`

**See:** `docs/FIRESTORE_SETUP_SUMMARY.md` for collection schema

---

## Documentation Strategy

Extensive docs in `/docs`:
- **QUICK_START_GUIDE.md** - New developer onboarding
- **TECHNICAL_ARCHITECTURE.md** - System design (1600+ lines)
- **SERVICES_CATALOG.md** - Product/service definitions
- **FIREBASE_SETUP.md** - Firebase configuration guide
- **E2E_TESTING_GUIDE.md** - Test conventions
- **I18N_* files** - i18n compliance audits

**When making significant changes:** Update relevant docs, especially if touching i18n, Firebase rules, or service categories.

---

## Critical Path Files

| File | Purpose | Don't Break |
|------|---------|-------------|
| `src/middleware.ts` | Auth + i18n routing | Locale detection, protected routes |
| `src/i18n.ts` | i18n config | Locale list, message imports |
| `src/navigation.ts` | Locale-aware routing | Re-exports for Link/useRouter |
| `src/lib/firebase.ts` | Firebase initialization | Singleton pattern, emulator support |
| `firestore.rules` | Security rules | Owner-based access control |

---

## Questions to Ask Before Coding

1. **Does this navigation use `@/navigation` imports?** (Not `next/navigation`)
2. **Are translations namespaced correctly in `messages/{locale}.json`?**
3. **Does this Firestore write respect the security rules?** (Check `firestore.rules`)
4. **Is the component properly placed** (feature folder vs shared components)?
5. **Does this need E2E tests?** (Add `data-testid` attributes)

---

**Last Updated:** November 2, 2025  
**Version:** 0.2.0  
**For Questions:** See `/docs/INDEX.md` or `/docs/QUICK_START_GUIDE.md`
