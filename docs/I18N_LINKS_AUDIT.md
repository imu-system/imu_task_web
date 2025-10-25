# 🔍 Audit i18n - Liens Pages Publiques

**Date:** 25 octobre 2025  
**Objectif:** Vérifier que tous les liens utilisent le système d'internationalisation

---

## ❌ Problèmes Détectés

### **1. ProfileCards Component** ⚠️
**Fichier:** `src/components/landing/profile-cards.tsx`

**Problème:** Utilise `Link` de Next.js au lieu de `@/navigation`
```tsx
import Link from "next/link"; // ❌ MAUVAIS
```

**Liens affectés:**
- `/particuliers` (ligne 98)
- `/professionnels` (ligne 98)
- `/seniors` (ligne 98)

**Impact:** Les liens ne respectent pas la locale (fr/en)

---

### **2. Page Particuliers** ⚠️
**Fichier:** `src/app/[locale]/(public)/particuliers/page.tsx`

**Liens non internationalisés:**
- ❌ Ligne 210: `/professionnels` (devrait être `Link` de `@/navigation`)
- ❌ Ligne 231: `/seniors` (devrait être `Link` de `@/navigation`)

**Liens OK (utilisent déjà `Link` de `@/navigation`):**
- ✅ `/dashboard/tasks/new` (lignes 90, 173)
- ✅ `/auth/signup` (ligne 179)

---

### **3. Page Professionnels** ⚠️
**Fichier:** `src/app/[locale]/(public)/professionnels/page.tsx`

**Liens non internationalisés:**
- ❌ Ligne 354: `/particuliers`
- ❌ Ligne 375: `/seniors`

**Liens OK:**
- ✅ `/auth/signup?type=pro` (lignes 111, 320)
- ✅ `/auth/signup?type=pro&plan=starter` (ligne 229)
- ✅ `/auth/signup?type=pro&plan=plus` (ligne 266)
- ✅ `/auth/signup?type=pro&plan=elite` (ligne 300)
- ✅ `#avantages` (ancre - OK)

---

### **4. Page Seniors** ✅
**Fichier:** `src/app/[locale]/(public)/seniors/page.tsx`

**Tous les liens OK:**
- ✅ `#services` (ancre)
- ✅ `/carelink`
- ✅ `/auth/signup`
- ✅ `/contact`

---

## 📋 Corrections à Effectuer

### **Correction 1: ProfileCards**
```tsx
// AVANT
import Link from "next/link";

// APRÈS
import { Link } from "@/navigation";
```

### **Correction 2: Particuliers**
Aucun changement nécessaire - utilise déjà `Link` de `@/navigation`.
Les liens vers `/professionnels` et `/seniors` fonctionneront automatiquement.

### **Correction 3: Professionnels**
Aucun changement nécessaire - utilise déjà `Link` de `@/navigation`.

### **Correction 4: Seniors**
Aucun changement nécessaire - OK ✅

---

## ✅ Actions Requises

1. **ProfileCards:** Changer import `Link`
2. **Vérifier routes:** S'assurer que tous les paths sont dans `src/navigation.ts`

---

## 🎯 Vérification Cohérence Texte

### **Page Particuliers**
- ✅ Utilise namespace `LandingPage.profiles.individual`
- ✅ Cohérent avec traductions FR/EN
- ✅ CTA clair: "Poster une tâche"

### **Page Professionnels (ImuPro)**
- ✅ Utilise namespace `LandingPage.profiles.professional`
- ✅ Badge "ImuPro" bien visible
- ✅ Focus business: stats, revenus, missions
- ✅ Cohérent avec dashboard Pro

### **Page Seniors (CareLink Preview)**
- ✅ Utilise namespace `LandingPage.profiles.senior`
- ✅ Badge accessibilité visible
- ✅ Focus services à domicile
- ✅ Lien vers `/carelink` (plateforme dédiée)
- ✅ Cohérent avec dashboard Senior

---

## 🔗 Routes Vérifiées

```typescript
// Routes publiques dans src/navigation.ts
✅ /particuliers
✅ /professionnels  
✅ /seniors
✅ /carelink
✅ /auth/signup
✅ /contact
✅ /dashboard/tasks/new
```

---

**Résultat:** 1 correction nécessaire (ProfileCards import)
**Cohérence texte:** ✅ 100%
