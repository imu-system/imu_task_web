# 📊 Analytics Landing Page - Documentation

## Vue d'ensemble

Ce document détaille l'implémentation du tracking analytics sur la landing page d'ImuTask pour mesurer l'engagement utilisateur sur la stratégie 3-plateformes (ImuTask, ImuPro, CareLink).

**Date d'implémentation** : 24 octobre 2025  
**Outil utilisé** : Firebase Analytics (GA4)  
**Objectif** : Mesurer l'intérêt des utilisateurs pour chaque plateforme et valider la stratégie produit

---

## 🎯 Événements Trackés

### 1. **landing_page_view**
Déclenché au chargement de la landing page.

**Paramètres :**
```typescript
{
  source: string,        // 'direct' par défaut
  timestamp: string      // ISO 8601
}
```

**Utilisation :**
- Mesurer le trafic global sur la landing page
- Identifier les sources de trafic (direct, référent, campagne)

**Implémentation :**
```typescript
// src/app/[locale]/(main)/page.tsx
useEffect(() => {
  logLandingPageView();
}, []);
```

---

### 2. **landing_profile_card_click**
Déclenché lors d'un clic sur un CTA de ProfileCards.

**Paramètres :**
```typescript
{
  profile_type: 'individual' | 'professional' | 'senior',
  source: 'card_cta',
  timestamp: string
}
```

**Utilisation :**
- Mesurer l'intérêt pour chaque type de profil
- Comparer les taux de clics entre Particuliers, Pro et Seniors
- Identifier le profil le plus attractif

**Destinations des CTAs :**
- `individual` → `/signup`
- `professional` → `/signup?type=pro`
- `senior` → `#carelink` (scroll)

**Implémentation :**
```typescript
// src/components/landing/profile-cards.tsx
<Button onClick={() => logProfileCardClick(profile.key, 'card_cta')}>
  {t(`${profile.key}.cta`)}
</Button>
```

---

### 3. **landing_carelink_click**
Déclenché lors d'interactions avec la section CareLink.

**Paramètres :**
```typescript
{
  service: 'meals' | 'housekeeping' | 'companionship' | 'teleassistance' | 'all_services',
  source: 'service_card' | 'main_cta',
  timestamp: string
}
```

**Utilisation :**
- Mesurer l'intérêt global pour CareLink
- Identifier les services CareLink les plus attractifs
- Valider le besoin avant le lancement de la V2.5

**Services trackés :**
- `meals` : Portage de repas
- `housekeeping` : Entretien du domicile
- `companionship` : Compagnie & activités
- `teleassistance` : Téléassistance 24/7
- `all_services` : CTA principal "Découvrir CareLink"

**Implémentation :**
```typescript
// src/components/landing/carelink-preview.tsx
<div onClick={() => logCarelinkServiceClick('meals', 'service_card')}>
  {/* Service card */}
</div>

<Button onClick={() => logCarelinkServiceClick('all_services', 'main_cta')}>
  Découvrir CareLink
</Button>
```

---

### 4. **landing_header_services_click**
Déclenché lors d'un clic sur le menu "Nos services" du header.

**Paramètres :**
```typescript
{
  platform: 'imutask' | 'imupro' | 'carelink',
  device: 'desktop' | 'mobile',
  timestamp: string
}
```

**Utilisation :**
- Mesurer l'utilisation du menu services
- Comparer l'engagement desktop vs mobile
- Identifier la plateforme la plus découverte via navigation

**Navigation :**
- `imutask` → `/#particuliers`
- `imupro` → `/#imupro`
- `carelink` → `/#carelink`

**Implémentation :**
```typescript
// src/components/header.tsx

// Desktop dropdown
<DropdownMenuItem onClick={() => logHeaderServicesMenuClick(item.platform, 'desktop')}>
  {item.label}
</DropdownMenuItem>

// Mobile menu
<Link onClick={() => logHeaderServicesMenuClick(item.platform, 'mobile')}>
  {item.label}
</Link>
```

---

### 5. **landing_category_click**
Déclenché lors d'un clic sur une catégorie dans CategoryPills.

**Paramètres :**
```typescript
{
  category_slug: string,          // Ex: 'menage', 'livraison'
  category_name: string,          // Ex: 'Ménage', 'Livraison'
  is_pmr_accessible: boolean,     // true si catégorie avec badge ♿
  timestamp: string
}
```

**Utilisation :**
- Mesurer les catégories les plus populaires
- Comparer l'engagement sur les catégories PMR vs standard
- Valider l'intérêt pour les services accessibles

**Catégories PMR (4 catégories) :**
- ✅ Ménage (`cleaning`)
- ✅ Livraison (`delivery`)
- ✅ Cours particuliers (`tutoring`)
- ✅ Services à domicile (`home_services`)

**Implémentation :**
```typescript
// src/components/landing/category-pills.tsx
<Button onClick={() => 
  logCategoryClick(category.slug, t(category.nameKey), category.isAccessible || false)
}>
  {t(category.nameKey)}
  {category.isAccessible && <span>♿</span>}
</Button>
```

---

### 6. **landing_search_interaction** (Bonus)
Déclenché lors d'interactions avec la barre de recherche du hero.

**Paramètres :**
```typescript
{
  action: 'focus' | 'search',
  query_length: number,
  timestamp: string
}
```

**Utilisation :**
- Mesurer l'engagement avec la recherche
- Identifier les requêtes fréquentes (si query envoyée)
- Optimiser les suggestions de recherche

**Note :** Événement défini mais non implémenté actuellement (à ajouter dans HeroSearchBar si besoin).

---

## 📁 Fichiers Modifiés

### 1. **`src/lib/analytics.ts`**
Fichier central contenant toutes les fonctions de tracking.

**Ajouts :**
```typescript
export function logProfileCardClick(profileType, source)
export function logCarelinkServiceClick(service, source)
export function logHeaderServicesMenuClick(platform, device)
export function logCategoryClick(categorySlug, categoryName, isAccessible)
export function logLandingPageView(source?)
export function logSearchBarInteraction(action, query?)
```

### 2. **`src/components/landing/profile-cards.tsx`**
Tracking des CTAs Particuliers, Pro, Seniors.

**Import ajouté :**
```typescript
import { logProfileCardClick } from '@/lib/analytics';
```

**Tracking :**
- 3 CTAs trackés (individual, professional, senior)

### 3. **`src/components/landing/carelink-preview.tsx`**
Tracking de l'engagement CareLink.

**Import ajouté :**
```typescript
import { logCarelinkServiceClick } from '@/lib/analytics';
```

**Tracking :**
- 4 cartes de services + 1 CTA principal = 5 points de tracking

### 4. **`src/components/header.tsx`**
Tracking du menu "Nos services".

**Import ajouté :**
```typescript
import { logHeaderServicesMenuClick } from '@/lib/analytics';
```

**Modifications :**
- Ajout de propriété `platform` dans `servicesMenuItems`
- Tracking sur desktop dropdown (3 items)
- Tracking sur mobile menu (3 items)

### 5. **`src/components/landing/category-pills.tsx`**
Tracking des clics sur catégories (PMR vs standard).

**Import ajouté :**
```typescript
import { logCategoryClick } from '@/lib/analytics';
```

**Modifications :**
- Signature de `handleCategoryClick` étendue pour inclure `categoryName` et `isAccessible`
- Tracking sur chaque catégorie (12 catégories au total)

### 6. **`src/app/[locale]/(main)/page.tsx`**
Tracking du page view landing page.

**Import ajouté :**
```typescript
import { useEffect } from 'react';
import { logLandingPageView } from '@/lib/analytics';
```

**Tracking :**
- `useEffect` au mount pour tracker la page view

---

## 📊 KPIs à Surveiller dans Firebase Analytics

### Dashboards Recommandés

#### 1. **Vue d'ensemble - Stratégie 3-Plateformes**
```
- Total landing_page_view (7 jours)
- Répartition clics par plateforme :
  * landing_profile_card_click (profile_type)
  * landing_header_services_click (platform)
- Taux d'engagement global : (clics / page views) %
```

#### 2. **ImuTask (Particuliers)**
```
- Clics ProfileCard : profile_type=individual
- Clics Header menu : platform=imutask
- Taux de conversion vers /signup
```

#### 3. **ImuPro (Professionnels)**
```
- Clics ProfileCard : profile_type=professional
- Clics Header menu : platform=imupro
- Taux de conversion vers /signup?type=pro
```

#### 4. **CareLink (Seniors/PMR)**
```
- Clics ProfileCard : profile_type=senior
- Clics Header menu : platform=carelink
- Clics services CareLink par type (meals, housekeeping, etc.)
- Engagement total CareLink : source=service_card + source=main_cta
```

#### 5. **Accessibilité PMR**
```
- Clics catégories PMR : is_pmr_accessible=true
- Catégories PMR vs Standard : ratio de clics
- Top 3 catégories PMR
```

#### 6. **Comportement Device**
```
- Header services clics : device=desktop vs device=mobile
- Taux d'engagement par device
```

---

## 🎨 Requêtes Firebase Analytics (Exemples)

### Requête 1 : Plateforme la plus attractive
```javascript
// Dans Firebase Console > Analytics > Events
// Filtrer : landing_profile_card_click
// Grouper par : profile_type
// Résultat attendu :
{
  individual: 450 clics,
  professional: 120 clics,
  senior: 85 clics
}
// → ImuTask (Particuliers) est 3.75x plus attractif que ImuPro
```

### Requête 2 : Intérêt CareLink par service
```javascript
// Filtrer : landing_carelink_click
// Grouper par : service
// Exclure : all_services
// Résultat attendu :
{
  meals: 35 clics,
  companionship: 28 clics,
  housekeeping: 22 clics,
  teleassistance: 15 clics
}
// → Le portage de repas est le service le plus recherché
```

### Requête 3 : Navigation Header vs ProfileCards
```javascript
// Comparer :
// - landing_profile_card_click (profile_type=senior)
// - landing_header_services_click (platform=carelink)
// 
// Si Header > ProfileCards → Menu bien visible et utilisé
// Si ProfileCards >> Header → Améliorer visibilité du menu
```

### Requête 4 : Taux d'engagement PMR
```javascript
// Filtrer : landing_category_click
// Grouper par : is_pmr_accessible
// Calculer ratio :
{
  true: 180 clics,   // Catégories PMR
  false: 520 clics   // Catégories standard
}
// Ratio PMR : 180 / (180+520) = 25.7%
// → 1 clic sur 4 concerne une catégorie PMR
```

---

## 🚀 Prochaines Étapes

### Phase 1 - Validation (1-2 semaines)
- [ ] Tester tous les événements en environnement de dev
- [ ] Vérifier l'envoi vers Firebase Analytics
- [ ] Valider les paramètres dans l'interface Firebase

### Phase 2 - Monitoring (2-4 semaines)
- [ ] Créer dashboards Firebase Analytics personnalisés
- [ ] Définir des alertes sur baisse d'engagement
- [ ] Analyser les premières tendances (7 jours minimum de données)

### Phase 3 - Optimisation (Ongoing)
- [ ] A/B testing sur ProfileCards (ordre, couleurs, textes)
- [ ] Ajuster priorités roadmap selon intérêt CareLink
- [ ] Optimiser catégories PMR si fort engagement

### Phase 4 - Extensions (Optionnel)
- [ ] Tracking des conversions signup après clic ProfileCard
- [ ] Heatmaps (Hotjar, Clarity) pour compléter données analytics
- [ ] User journey analysis (ProfileCard → Signup → First task)

---

## ⚠️ Notes Importantes

### Conformité RGPD
- ✅ Firebase Analytics est conforme RGPD si configuré correctement
- ✅ Aucune donnée personnelle (email, nom) n'est trackée dans les événements
- ✅ Les timestamps sont anonymisés dans Firebase
- ⚠️ Vérifier que le cookie consent est bien implémenté avant production

### Limitations
- Les événements ne contiennent pas d'identifiants utilisateur pour respecter l'anonymat
- Impossible de tracker un user journey complet sans authentification
- Les sources de trafic (`source` param) sont à enrichir avec UTM tags pour campagnes marketing

### Performance
- Impact minimal sur les performances (events envoyés en async)
- Firebase Analytics batche les événements (pas d'appel réseau à chaque clic)
- Testez avec Network throttling pour vérifier l'impact sur mobile 3G

---

## 📞 Contact & Support

**Responsable Analytics** : À définir  
**Accès Firebase Console** : [https://console.firebase.google.com/project/YOUR_PROJECT_ID/analytics](https://console.firebase.google.com/project/YOUR_PROJECT_ID/analytics)  
**Documentation Firebase Analytics** : [https://firebase.google.com/docs/analytics](https://firebase.google.com/docs/analytics)

---

**Dernière mise à jour** : 24 octobre 2025  
**Version** : 1.0  
**Auteur** : GitHub Copilot + Nathan Imogo
