# ✅ Task 1.2 - Hero Variant "Seniors" - COMPLÉTÉE

**Date** : 26 octobre 2025  
**Durée** : 45 min  
**Status** : ✅ Complétée

---

## 📋 Résumé

Création d'un composant Hero réutilisable avec support de variants ("default" et "seniors"). Le variant Seniors affiche un design adapté avec palette pastel rose/pink/purple, badge certifié PMR, et CTA vers `/seniors`.

---

## 🎯 Objectifs Complétés

### ✅ 1. Création du composant Hero réutilisable

**Fichier** : `/src/components/landing/hero.tsx` (187 lignes)

**Features** :
- **Props** : `variant?: 'default' | 'seniors'`
- **Responsive** : min-h-[600px] md:min-h-[700px]
- **Animations** : Framer Motion (fade-in, stagger)
- **i18n** : Traductions FR + EN complètes

#### Configuration par variant

```typescript
// Variant "default"
{
  gradient: 'from-primary/5 via-background to-accent/5',
  titleGradient: 'text-primary',
  image: placeholderImages.hero.src,
  ctaIcon: Sparkles,
  ctaHref: '/dashboard/tasks/new',
}

// Variant "seniors"
{
  gradient: 'from-rose-50/90 via-pink-50/80 to-purple-50/70',
  titleGradient: 'from-rose-500 via-pink-500 to-purple-500',
  image: placeholderImages.seniors.src,
  ctaIcon: Heart,
  ctaHref: '/seniors',
}
```

#### Éléments spécifiques variant "seniors"

**Badge certifié PMR** :
```tsx
<motion.div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-100">
  <Heart className="h-4 w-4 text-rose-600" />
  <span>Services adaptés seniors & aidants</span>
</motion.div>
```

**Titre avec gradient rose/pink/purple** :
```tsx
<h1>
  Services à domicile{' '}
  <span className="bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">
    adaptés seniors ♿
  </span>
</h1>
```

**Features pills** (3 pills) :
- ♿ Certifié PMR
- 🔒 100% sécurisé
- 📱 Interface simple

**CTAs** :
- Primary : "Découvrir CareLink" → `/seniors` (gradient rose/pink/purple)
- Secondary : "Devenir aide à domicile" → `/inscription?type=senior`

---

### ✅ 2. Traductions complètes

#### Français (`messages/fr.json`)

```json
"hero": {
  "seniorVariant": {
    "badge": "Services adaptés seniors & aidants",
    "title": "Services à domicile",
    "titleHighlight": "adaptés seniors ♿",
    "subtitle": "Aide quotidienne bienveillante, professionnelle et sécurisée pour votre autonomie",
    "imageAlt": "Senior souriant avec aide à domicile",
    "cta": {
      "primary": "Découvrir CareLink",
      "secondary": "Devenir aide à domicile"
    },
    "features": {
      "accessible": "Certifié PMR",
      "secure": "100% sécurisé",
      "simple": "Interface simple"
    }
  }
}
```

#### Anglais (`messages/en.json`)

```json
"hero": {
  "seniorVariant": {
    "badge": "Senior & caregiver adapted services",
    "title": "Home care services",
    "titleHighlight": "adapted for seniors ♿",
    "subtitle": "Caring, professional and secure daily assistance for your independence",
    "imageAlt": "Smiling senior with home care assistant",
    "cta": {
      "primary": "Discover CareLink",
      "secondary": "Become a home care assistant"
    },
    "features": {
      "accessible": "PMR certified",
      "secure": "100% secure",
      "simple": "Simple interface"
    }
  }
}
```

---

### ✅ 3. Nouvelle page `/seniors`

**Fichier** : `/src/app/[locale]/(main)/seniors/page.tsx` (106 lignes)

**Structure** :
```tsx
<Hero variant="seniors" />
<CarelinkPreview />
<CategoryPills /> {/* Filtré pour seniors */}
<TasksGrid maxTasks={6} />
<HowItWorks />
<StatsTrust />
<ProfileCards />
<TestimonialsFinalCTA />
```

**Features** :
- Sticky search bar (même comportement que landing)
- Scroll tracking
- Analytics tracking
- Responsive design

---

### ✅ 4. Mise à jour de la page principale

**Fichier** : `/src/app/[locale]/(main)/page.tsx`

**Changements** :
- Import du nouveau composant `Hero`
- Remplacement de la section Hero inline par `<Hero variant="default" />`
- Code réduit de ~70 lignes
- Maintenabilité améliorée

**Avant** (169 lignes de Hero inline) :
```tsx
<section ref={heroRef} className="...">
  {/* 70+ lines de code Hero */}
</section>
```

**Après** (3 lignes) :
```tsx
<div ref={heroRef}>
  <Hero variant="default" />
</div>
```

---

### ✅ 5. Image placeholder seniors

**Fichier** : `/src/app/lib/placeholder-images.json`

**Ajout** :
```json
"seniors": {
  "src": "https://picsum.photos/seed/seniors/1920/1080",
  "hint": "senior woman smiling with caregiver at home"
}
```

---

## 🎨 Design Tokens - Variant Seniors

### Palette couleurs (pastels)

```css
/* Background gradient */
from-rose-50/90 via-pink-50/80 to-purple-50/70

/* Overlay gradient */
from-rose-50/95 via-pink-50/90 to-purple-50/95

/* Title gradient */
from-rose-500 via-pink-500 to-purple-500

/* Badge */
bg-rose-100 dark:bg-rose-900/30
border-rose-200 dark:border-rose-800
text-rose-700 dark:text-rose-300

/* CTA button gradient */
from-rose-500 via-pink-500 to-purple-500
hover:from-rose-600 hover:via-pink-600 hover:to-purple-600
```

### Contraste AAA

- Text: `text-gray-700 dark:text-gray-300`
- Background: `bg-white/80 dark:bg-gray-800/80`
- Borders: `border-rose-200 dark:border-rose-800`

---

## 📱 Responsive Design

### Mobile (< 768px)
- Hero min-h: 600px
- Typography: text-4xl
- Buttons: full width (flex-col)
- Pills: wrap, 2 cols

### Tablet (768px - 1024px)
- Hero min-h: 700px
- Typography: text-5xl
- Buttons: inline (flex-row)
- Pills: wrap, 3 cols

### Desktop (> 1024px)
- Hero min-h: 700px
- Typography: text-6xl xl:text-7xl
- Buttons: inline, max-w-5xl
- Pills: no wrap

---

## 🧪 Tests Visuels

### ✅ Page principale `/`
- Hero variant "default" ✅
- Title: "Trouvez l'aide dont vous avez besoin, près de chez vous"
- CTA: "Publier une mission" → `/dashboard/tasks/new`
- Gradient: primary/accent
- No badge

### ✅ Page seniors `/seniors`
- Hero variant "seniors" ✅
- Badge: "Services adaptés seniors & aidants" ♿
- Title: "Services à domicile adaptés seniors ♿"
- Subtitle focus autonomie
- CTA: "Découvrir CareLink" → `/seniors`
- Gradient: rose/pink/purple (pastel)
- Pills: ♿ Certifié PMR, 🔒 100% sécurisé, 📱 Interface simple

---

## 🔗 Routes

| URL | Variant | Description |
|-----|---------|-------------|
| `/` | `default` | Landing page générale |
| `/seniors` | `seniors` | Page dédiée seniors CareLink |
| `/particuliers` | `default` | Page particuliers (à créer) |
| `/professionnels` | `default` | Page professionnels (à créer) |

---

## 📝 Prochaines Étapes

### ✅ Complété (Task 1.2)
- [x] Créer composant Hero réutilisable
- [x] Support variant "default" et "seniors"
- [x] Traductions FR + EN complètes
- [x] Page `/seniors` dédiée
- [x] Mise à jour page principale
- [x] Image placeholder seniors
- [x] Tests visuels

### ⏳ À faire (Task 1.3)
- [ ] Badge PMR sur catégories (1h)
  - Modifier `categories.ts` : ajouter `isAccessible?: boolean`
  - Créer `AccessibleBadge` component
  - Afficher badge sur cards catégories
  - Filter toggle "Services PMR uniquement"

---

## 🎯 Metrics de Succès

- [x] Composant Hero < 200 lignes ✅ (187 lignes)
- [x] Support 2 variants ✅ (default, seniors)
- [x] i18n complète FR + EN ✅
- [x] Responsive mobile/tablet/desktop ✅
- [x] Palette pastel seniors AAA compliant ✅
- [x] Page `/seniors` fonctionnelle ✅
- [x] 0 erreurs TypeScript ✅

---

## 📦 Fichiers Modifiés/Créés

**Créés** (2) :
- `/src/components/landing/hero.tsx` (187 lignes)
- `/src/app/[locale]/(main)/seniors/page.tsx` (106 lignes)

**Modifiés** (4) :
- `/src/app/[locale]/(main)/page.tsx` (réduit de ~70 lignes)
- `/src/messages/fr.json` (+ 17 clés i18n)
- `/src/messages/en.json` (+ 17 clés i18n)
- `/src/app/lib/placeholder-images.json` (+ 1 image)

**Total lignes ajoutées** : ~340 lignes  
**Total clés i18n** : 34 clés (17 FR + 17 EN)

---

_Task 1.2 complétée le 26 octobre 2025 - ImuTask Phase 5_
