# Audit i18n - Onboarding & Modal "Proposer mes services" & Dropdown

**Date** : 25 octobre 2025  
**Contexte** : Suite à l'audit des pages publiques, vérification de l'onboarding et des composants interactifs (modal, dropdown)

---

## 🎯 Objectif de l'audit

Vérifier que :
1. ✅ La page **onboarding** utilise les composants i18n corrects
2. ✅ Le modal **"Proposer mes services"** respecte l'internationalisation
3. ✅ Le **dropdown du menu utilisateur** (image jointe) utilise les liens locale-aware

---

## 📋 Fichiers audités

### 1. Page Onboarding
**Fichier** : `/src/app/[locale]/onboarding/page.tsx` (151 lignes)

#### Problème détecté ❌

```tsx
// Ligne 4 - MAUVAIS IMPORT
import { useRouter } from 'next/navigation';
```

**Impact** :
- `router.push('/dashboard')` (ligne 47) → Ne préserve PAS la locale
- User FR sur `/fr/onboarding` → Redirigé vers `/dashboard` (locale perdue)

**Navigation affectée** :
- Ligne 47 : `router.push('/dashboard')` après sélection accountType
- Ligne 60 : `router.push('/dashboard')` lors du skip

#### Correction requise ✅

```tsx
// AVANT
import { useRouter } from 'next/navigation';

// APRÈS
import { useRouter } from '@/navigation';
```

---

### 2. Modal "Proposer mes services"
**Fichier** : `/src/components/modals/become-provider-modal.tsx` (197 lignes)

#### Problème détecté ❌

```tsx
// Ligne 5 - MAUVAIS IMPORT
import { useRouter } from 'next/navigation';
```

**Impact** :
- `router.push(href)` (ligne 75) → Ne préserve PAS la locale
- User EN clique sur "Individual" → Redirigé vers `/auth/signup?type=individual&role=provider` (locale perdue)
- User FR clique sur "Professional" → Redirigé vers `/professionnels` (locale perdue)

**Navigation affectée** :
- Ligne 75 : `router.push(href)` après sélection du type de prestataire
- Ligne 192 : `router.push('/auth/signin')` dans le footer du modal

**Liens affectés** :
```tsx
// Ligne 55 - Individual
href: '/auth/signup?type=individual&role=provider',

// Ligne 69 - Professional  
href: '/professionnels',
```

#### Correction requise ✅

```tsx
// AVANT
import { useRouter } from 'next/navigation';

// APRÈS
import { useRouter } from '@/navigation';
```

---

### 3. Dropdown Menu Utilisateur (Header)
**Fichier** : `/src/components/header.tsx` (406 lignes)

#### Status : ✅ CORRECT

**Import utilisé** :
```tsx
// Ligne 32 - BON IMPORT
import { usePathname, Link } from '@/navigation';
```

**Tous les liens du dropdown sont locale-aware** :

| Ligne | Lien | Destination | Status |
|-------|------|-------------|--------|
| 131 | Dashboard | `/dashboard` | ✅ |
| 137 | Profil | `/dashboard/profile` | ✅ |
| 143 | Réservations | `/dashboard/bookings` | ✅ |
| 149 | Notifications | `/dashboard/notifications` | ✅ |
| 156 | Paramètres | `/dashboard/settings` | ✅ |
| 162 | Aide | `/help` | ✅ |

**Autres liens du header vérifiés** :

| Section | Ligne | Lien | Status |
|---------|-------|------|--------|
| Menu Services (Desktop) | 255 | `/particuliers`, `/professionnels`, `/carelink` | ✅ |
| Menu Services (Mobile) | 317 | Même liens | ✅ |
| Auth Buttons | 184 | `/become-provider` | ✅ |
| Auth Buttons | 194 | `/sign-in` | ✅ |
| Mobile Auth | 338, 344, 366, 371, 376 | Dashboard, Profile, Sign-in, Inscription, Become-provider | ✅ |

**Actions analysées** :
- `logout()` : Action Firebase, pas de navigation → N/A
- Liens internes : Tous utilisent `<Link>` de `@/navigation` ✅
- Liens externes (#features, #how-it-works) : Ancres locales → OK

---

## 🔍 Analyse détaillée des flux

### Flux 1 : Onboarding après signup

```
Signup (/fr/auth/signup)
  ↓
Onboarding (/fr/onboarding)
  ↓
Sélection accountType (individual/professional/senior)
  ↓
❌ router.push('/dashboard') → Perd locale
  ↓
❌ Redirigé vers /dashboard (au lieu de /fr/dashboard)
```

**Correction** : Après fix, le flux sera :
```
Signup (/fr/auth/signup)
  ↓
Onboarding (/fr/onboarding)
  ↓
Sélection accountType
  ↓
✅ router.push('/dashboard') → Préserve locale
  ↓
✅ Redirigé vers /fr/dashboard
```

---

### Flux 2 : Modal "Proposer mes services"

**Déclencheurs** :
1. Bouton "Proposer mes services" dans header (ligne 102)
2. Bouton dans AuthButtons (ligne 184)
3. Bouton dans mobile menu (ligne 376)

**Navigation interne du modal** :

```
User clique "Proposer mes services" (/en/home)
  ↓
Modal s'ouvre
  ↓
User sélectionne "Individual"
  ↓
❌ router.push('/auth/signup?type=individual&role=provider')
  ↓
❌ Redirigé vers /auth/signup... (perd locale /en/)
```

**Correction** : Après fix, le flux sera :
```
User clique "Proposer mes services" (/en/home)
  ↓
Modal s'ouvre
  ↓
User sélectionne "Individual"
  ↓
✅ router.push('/auth/signup?type=individual&role=provider')
  ↓
✅ Redirigé vers /en/auth/signup... (locale préservée)
```

---

### Flux 3 : Dropdown menu utilisateur

**Tous les flux OK** ✅

```
User clique avatar (/fr/home)
  ↓
Dropdown s'ouvre
  ↓
User clique "Dashboard"
  ↓
✅ <Link href="/dashboard"> (de @/navigation)
  ↓
✅ Navigation vers /fr/dashboard (locale préservée)
```

---

## 🐛 Résumé des problèmes

| Fichier | Ligne | Problème | Impact | Priorité |
|---------|-------|----------|--------|----------|
| `onboarding/page.tsx` | 4 | `useRouter` from `next/navigation` | Perte de locale après onboarding | 🔴 CRITIQUE |
| `become-provider-modal.tsx` | 5 | `useRouter` from `next/navigation` | Perte de locale sur signup prestataire | 🔴 CRITIQUE |
| `header.tsx` | 32 | ✅ Correct (`@/navigation`) | Aucun | ✅ OK |

---

## ✅ Corrections à appliquer

### Correction 1 : onboarding/page.tsx

```tsx
// AVANT (ligne 4)
import { useRouter } from 'next/navigation';

// APRÈS
import { useRouter } from '@/navigation';
```

**Lignes affectées** :
- Ligne 47 : `router.push('/dashboard')` → Maintenant locale-aware
- Ligne 60 : `router.push('/dashboard')` → Maintenant locale-aware

---

### Correction 2 : become-provider-modal.tsx

```tsx
// AVANT (ligne 5)
import { useRouter } from 'next/navigation';

// APRÈS
import { useRouter } from '@/navigation';
```

**Lignes affectées** :
- Ligne 75 : `router.push(href)` → Maintenant locale-aware
- Ligne 192 : `router.push('/auth/signin')` → Maintenant locale-aware

---

## 📊 Impact de la correction

### Avant correction ❌

**Scénario utilisateur EN** :
1. User visite `/en/home`
2. Clique "Offer services" → Modal s'ouvre
3. Sélectionne "Individual"
4. **Redirected to** : `/auth/signup?type=individual&role=provider` (❌ locale perdue)
5. User voit page FR alors qu'il était en anglais

**Scénario utilisateur FR** :
1. User complète signup `/fr/auth/signup`
2. Redirigé vers onboarding `/fr/onboarding`
3. Sélectionne "Professionnel"
4. **Redirected to** : `/dashboard` (❌ locale perdue)
5. Middleware détecte pas de locale → Redirect vers `/fr/dashboard` (double redirect inutile)

---

### Après correction ✅

**Scénario utilisateur EN** :
1. User visite `/en/home`
2. Clique "Offer services" → Modal s'ouvre
3. Sélectionne "Individual"
4. **Redirected to** : `/en/auth/signup?type=individual&role=provider` ✅
5. User reste en anglais

**Scénario utilisateur FR** :
1. User complète signup `/fr/auth/signup`
2. Redirigé vers onboarding `/fr/onboarding`
3. Sélectionne "Professionnel"
4. **Redirected to** : `/fr/dashboard` ✅
5. User reste en français, navigation directe

---

## 🧪 Tests recommandés

### Test 1 : Onboarding EN → Dashboard EN
1. Créer compte en anglais `/en/auth/signup`
2. Arriver sur onboarding `/en/onboarding`
3. Sélectionner "Professional"
4. Cliquer "Continue"
5. **Attendu** : Redirection vers `/en/dashboard`
6. **Vérifier** : URL contient bien `/en/`

### Test 2 : Modal FR → Signup FR
1. Visiter page d'accueil `/fr`
2. Cliquer "Proposer mes services"
3. Sélectionner "Particulier"
4. **Attendu** : Redirection vers `/fr/auth/signup?type=individual&role=provider`
5. **Vérifier** : URL contient bien `/fr/`

### Test 3 : Modal EN → Professionnels EN
1. Visiter page d'accueil `/en`
2. Cliquer "Offer services"
3. Sélectionner "Professional"
4. **Attendu** : Redirection vers `/en/professionnels`
5. **Vérifier** : Page affichée en anglais

### Test 4 : Dropdown FR (déjà OK)
1. Se connecter en français `/fr/auth/signin`
2. Cliquer sur avatar
3. Cliquer "Dashboard"
4. **Attendu** : Navigation vers `/fr/dashboard`
5. **Vérifier** : URL contient bien `/fr/`

---

## 📝 Conclusion

### Problèmes trouvés : 2/3 fichiers ❌

- ❌ **onboarding/page.tsx** : Mauvais import `useRouter`
- ❌ **become-provider-modal.tsx** : Mauvais import `useRouter`
- ✅ **header.tsx** : Import correct `Link` et `useRouter` (si utilisé)

### Impact utilisateur

**Sans correction** :
- Users perdent leur langue lors de l'onboarding
- Users perdent leur langue lors du signup prestataire
- Expérience UX incohérente
- Double redirects inutiles (performance)

**Avec correction** :
- ✅ Langue préservée dans tout le parcours
- ✅ Expérience UX fluide et cohérente
- ✅ Performance optimale (1 seul redirect)
- ✅ 100% compliance i18n

### Prochaines étapes

1. ✅ Corriger `onboarding/page.tsx` (import ligne 4)
2. ✅ Corriger `become-provider-modal.tsx` (import ligne 5)
3. ✅ Vérifier 0 erreurs TypeScript
4. ✅ Tester les 4 scénarios
5. ✅ Merger les corrections

---

## 🎯 État final attendu

**100% des navigations i18n-compliant** :
- ✅ Pages publiques (particuliers, professionnels, seniors) → Déjà corrigé
- ✅ ProfileCards component → Déjà corrigé
- ✅ Header dropdown → Déjà OK
- 🔧 Onboarding page → À corriger (ce document)
- 🔧 Modal "Proposer mes services" → À corriger (ce document)

**Prêt pour production internationale** 🌍
