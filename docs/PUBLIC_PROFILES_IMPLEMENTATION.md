# 🎨 Profils Publics Personnalisables - Guide d'Implémentation

**Date:** 12 novembre 2025  
**Version:** 1.0.0  
**Statut:** ✅ Implémenté

---

## 📋 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture](#architecture)
3. [Types & Interfaces](#types--interfaces)
4. [Services Firestore](#services-firestore)
5. [Composants UI](#composants-ui)
6. [Pages & Routing](#pages--routing)
7. [Sécurité & Règles Firestore](#sécurité--règles-firestore)
8. [SEO & Optimisations](#seo--optimisations)
9. [Analytics & Tracking](#analytics--tracking)
10. [Guide d'Utilisation](#guide-dutilisation)
11. [Best Practices](#best-practices)

---

## 🎯 Vue d'ensemble

Les **Profils Publics Personnalisables** permettent aux prestataires et professionnels ImuTask de créer leur propre vitrine en ligne accessible via une URL personnalisée.

### Fonctionnalités Principales

✅ **URL personnalisée** : `imutask.com/profil/john-doe`  
✅ **Portfolio photos/vidéos** : Galerie de réalisations  
✅ **Badges & certifications** : Preuves sociales  
✅ **Avis clients** : Notes et commentaires  
✅ **Packs de services** : Pour ImuPro  
✅ **Thèmes personnalisés** : Couleurs, polices (premium)  
✅ **Analytics** : Vues, clics, conversions  
✅ **Partage social** : Facebook, Twitter, LinkedIn, WhatsApp  
✅ **QR Code** : Génération automatique  
✅ **SEO optimisé** : Meta tags, Open Graph, Twitter Cards

---

## 🏗️ Architecture

### Structure des Fichiers

```
src/
├── types/
│   └── public-profile.ts                    # Types TypeScript
├── lib/
│   └── firestore-public-profiles.ts         # Service Firestore
├── features/
│   └── profiles/
│       └── components/
│           ├── profile-header.tsx           # En-tête profil
│           ├── profile-portfolio.tsx        # Galerie portfolio
│           ├── profile-badges.tsx           # Badges qualité
│           ├── profile-reviews.tsx          # Liste avis
│           └── profile-editor/
│               ├── profile-editor-form.tsx  # Formulaire édition
│               └── portfolio-editor.tsx     # Gestion portfolio
└── app/
    └── [locale]/
        ├── profil/
        │   └── [slug]/
        │       └── page.tsx                 # Page publique
        └── dashboard/
            └── profil-public/
                └── page.tsx                 # Dashboard gestion
```

### Collections Firestore

```
firestore/
├── public_profiles/                  # Profils publics
│   └── {userId}/                     # Document par utilisateur
│       ├── id: string
│       ├── userId: string
│       ├── slug: string (unique)
│       ├── visibility: enum
│       ├── portfolio: PortfolioItem[]
│       ├── badges: QualityBadge[]
│       ├── stats: ProfileStats
│       └── ...
└── profile_analytics_events/         # Événements analytics
    └── {eventId}/
        ├── profileId: string
        ├── eventType: string
        ├── timestamp: Timestamp
        └── metadata: object
```

---

## 📐 Types & Interfaces

### PublicProfile

```typescript
interface PublicProfile {
  // Identifiants
  id: string;
  userId: string;
  slug: string;                    // URL slug unique
  
  // Visibilité
  visibility: 'public' | 'unlisted' | 'private';
  isActive: boolean;
  
  // Infos de base
  displayName: string;
  headline?: string;
  bio?: string;
  photoUrl?: string;
  location?: string;
  
  // Pour ImuPro
  isPro: boolean;
  businessName?: string;
  logoUrl?: string;
  
  // Type compte
  accountType: AccountType;
  
  // Services
  categories: string[];
  skills?: string[];
  languages?: string[];
  serviceArea?: { city: string; radiusKm?: number };
  
  // Portfolio
  portfolio: PortfolioItem[];
  maxPortfolioItems?: number;
  
  // Packs services (ImuPro)
  servicePacks?: ServicePack[];
  
  // Preuves sociales
  reviewsCount: number;
  averageRating: number;
  completedMissions: number;
  badges: QualityBadge[];
  
  // Réseaux sociaux
  socialLinks?: SocialLinks;
  
  // Personnalisation
  customTheme?: CustomTheme;
  
  // SEO
  metaTitle?: string;
  metaDescription?: string;
  
  // Stats
  stats: ProfileStats;
  
  // Premium
  isPremium: boolean;
  premiumFeatures?: {
    customDomain?: string;
    hideImuTaskBranding?: boolean;
    advancedAnalytics?: boolean;
  };
  
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastPublishedAt?: Timestamp;
}
```

### PortfolioItem

```typescript
interface PortfolioItem {
  id: string;
  title: string;
  description?: string;
  type: 'image' | 'video' | 'link';
  
  // Pour images/vidéos
  mediaUrl?: string;
  thumbnailUrl?: string;
  
  // Pour liens
  externalUrl?: string;
  
  // Métadonnées
  category?: string;
  tags?: string[];
  completionDate?: Timestamp;
  featured?: boolean;
  order?: number;
  
  createdAt: Timestamp;
}
```

### QualityBadge

```typescript
interface QualityBadge {
  id: string;
  name: string;
  type: 'academy' | 'professional' | 'platform' | 'achievement';
  icon?: string;
  color?: string;
  issuedAt: Timestamp;
  description?: string;
}
```

---

## 🔥 Services Firestore

### Fonctions Principales

#### Création de Profil

```typescript
import { createPublicProfile } from '@/lib/firestore-public-profiles';

const profile = await createPublicProfile({
  userId: 'user123',
  displayName: 'John Doe',
  accountType: AccountType.professional,
  categories: ['aide-domicile', 'jardinage'],
  bio: 'Professionnel expérimenté...',
  headline: 'Jardinier expert',
});
```

#### Récupération par Slug

```typescript
const profile = await getPublicProfileBySlug('john-doe-abc123');
```

#### Mise à Jour

```typescript
await updatePublicProfile('user123', {
  bio: 'Nouvelle bio...',
  skills: ['Tonte', 'Taille', 'Débroussaillage'],
  socialLinks: {
    linkedin: 'https://linkedin.com/in/johndoe',
    instagram: '@johndoe',
  },
});
```

#### Publication/Dépublication

```typescript
// Rendre public
await publishProfile('user123');

// Dépublier
await unpublishProfile('user123');
```

#### Gestion du Portfolio

```typescript
// Ajouter un item
const itemId = await addPortfolioItem('user123', {
  title: 'Jardin moderne',
  description: 'Aménagement complet d\'un jardin de 200m²',
  type: 'image',
  thumbnailUrl: 'https://...',
  mediaUrl: 'https://...',
  category: 'Jardinage',
  tags: ['jardin', 'aménagement', 'moderne'],
  featured: true,
});

// Modifier
await updatePortfolioItem('user123', itemId, {
  description: 'Description mise à jour',
});

// Supprimer
await deletePortfolioItem('user123', itemId);

// Réorganiser
await reorderPortfolio('user123', [
  'item3', 'item1', 'item2', // Nouvel ordre
]);
```

#### Analytics

```typescript
// Tracker une vue
await trackProfileView('user123', {
  source: 'search',
  device: 'mobile',
});

// Tracker un clic CTA
await trackCTAClick('user123');

// Tracker un partage
await trackProfileShare('user123', 'facebook');
```

---

## 🎨 Composants UI

### ProfileHeader

Affiche l'en-tête du profil avec photo, nom, badges, stats.

```tsx
import { ProfileHeader } from '@/features/profiles/components/profile-header';

<ProfileHeader 
  profile={profile}
  onContactClick={() => {
    // Action "Contacter"
  }}
  isOwnProfile={false}
/>
```

**Props:**
- `profile`: `PublicProfile` - Données du profil
- `onContactClick?`: `() => void` - Callback bouton contact
- `isOwnProfile?`: `boolean` - Est-ce le profil de l'utilisateur actuel

### ProfilePortfolio

Galerie de portfolio avec lightbox et filtres.

```tsx
import { ProfilePortfolio } from '@/features/profiles/components/profile-portfolio';

<ProfilePortfolio items={profile.portfolio} />
```

**Props:**
- `items`: `PortfolioItem[]` - Items du portfolio
- `className?`: `string` - Classes CSS additionnelles

### ProfileBadges

Affiche les badges de qualité groupés par type.

```tsx
import { ProfileBadges } from '@/features/profiles/components/profile-badges';

<ProfileBadges 
  badges={profile.badges}
  locale="fr"
/>
```

**Props:**
- `badges`: `QualityBadge[]` - Liste des badges
- `locale?`: `string` - Locale pour formatage dates
- `className?`: `string`

### ProfileReviews

Liste des avis avec statistiques.

```tsx
import { ProfileReviews } from '@/features/profiles/components/profile-reviews';

<ProfileReviews
  reviews={reviews}
  averageRating={profile.averageRating}
  totalReviews={profile.reviewsCount}
  locale="fr"
/>
```

### ProfileEditorForm

Formulaire d'édition des informations du profil.

```tsx
import { ProfileEditorForm } from '@/features/profiles/components/profile-editor/profile-editor-form';

<ProfileEditorForm
  initialData={profile}
  onSave={async (data) => {
    await updatePublicProfile(userId, data);
  }}
  isSaving={isSaving}
/>
```

### PortfolioEditor

Gestion complète du portfolio (ajout, édition, suppression, réorganisation).

```tsx
import { PortfolioEditor } from '@/features/profiles/components/profile-editor/portfolio-editor';

<PortfolioEditor
  items={profile.portfolio}
  maxItems={profile.maxPortfolioItems || 10}
  onAdd={async (item) => {
    await addPortfolioItem(userId, item);
  }}
  onUpdate={async (itemId, updates) => {
    await updatePortfolioItem(userId, itemId, updates);
  }}
  onDelete={async (itemId) => {
    await deletePortfolioItem(userId, itemId);
  }}
  onReorder={async (itemIds) => {
    await reorderPortfolio(userId, itemIds);
  }}
  onUpload={async (file) => {
    const url = await uploadToStorage(file);
    return url;
  }}
/>
```

---

## 🌐 Pages & Routing

### Page Profil Public

**Route:** `/profil/[slug]`  
**Fichier:** `src/app/[locale]/profil/[slug]/page.tsx`

#### SEO Metadata

Génère automatiquement:
- **Title** : `{displayName} - {headline}`
- **Description** : Bio (160 chars max)
- **Open Graph** : Images, locale, type profile
- **Twitter Cards** : Summary large image
- **JSON-LD** : Schema.org Person

#### Analytics

Tracke automatiquement la vue lors du chargement.

### Dashboard Gestion Profil

**Route:** `/dashboard/profil-public`

Page pour gérer son profil public :
- Éditer informations
- Gérer portfolio
- Voir analytics
- Options premium
- Publier/dépublier

---

## 🔒 Sécurité & Règles Firestore

### Collection `public_profiles`

```javascript
match /public_profiles/{profileId} {
  // LECTURE: Profils publics/unlisted ou propriétaire
  allow read: if resource.data.visibility == 'public' || 
                 resource.data.visibility == 'unlisted' ||
                 (isAuthenticated() && isOwner(profileId));
  
  // CRÉATION: Propriétaire uniquement, visibility = private
  allow create: if isAuthenticated() && 
                   isOwner(profileId) &&
                   request.resource.data.userId == request.auth.uid &&
                   request.resource.data.visibility == 'private';
  
  // MISE À JOUR: Propriétaire, pas de changement userId/slug
  allow update: if isAuthenticated() && 
                   isOwner(profileId) &&
                   !request.resource.data.diff(resource.data).affectedKeys()
                     .hasAny(['userId', 'slug']);
  
  // SUPPRESSION: Propriétaire uniquement
  allow delete: if isAuthenticated() && isOwner(profileId);
}
```

### Collection `profile_analytics_events`

```javascript
match /profile_analytics_events/{eventId} {
  // LECTURE: Propriétaire du profil uniquement
  allow read: if isAuthenticated() && 
                 exists(/databases/$(database)/documents/public_profiles/$(request.auth.uid));
  
  // CRÉATION: Événements publics (tracking)
  allow create: if request.resource.data.keys().hasAll(['profileId', 'eventType', 'timestamp']);
  
  // PAS de UPDATE/DELETE (write-only)
  allow update, delete: if false;
}
```

---

## 🚀 SEO & Optimisations

### Meta Tags Générés

```typescript
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const profile = await getPublicProfileBySlug(params.slug);
  
  return {
    title: profile.metaTitle || `${profile.displayName} - ImuTask`,
    description: profile.metaDescription || profile.bio?.slice(0, 160),
    keywords: [profile.displayName, ...profile.categories, ...profile.skills],
    openGraph: {
      type: 'profile',
      url: `https://imutask.com/profil/${profile.slug}`,
      title: profile.displayName,
      images: [{ url: profile.photoUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
    },
    alternates: {
      canonical: `https://imutask.com/profil/${profile.slug}`,
      languages: {
        'fr': `/fr/profil/${profile.slug}`,
        'en': `/en/profil/${profile.slug}`,
      },
    },
    robots: {
      index: profile.visibility === 'public',
      follow: profile.visibility === 'public',
    },
  };
}
```

### JSON-LD (Schema.org)

```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "John Doe",
  "jobTitle": "Jardinier expert",
  "description": "Bio...",
  "image": "https://...",
  "url": "https://imutask.com/profil/john-doe",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Paris"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": 4.8,
    "reviewCount": 42
  },
  "knowsAbout": ["Jardinage", "Tonte", "Taille"],
  "knowsLanguage": ["fr", "en"]
}
```

---

## 📊 Analytics & Tracking

### Événements Trackés

| Événement | Type | Métadonnées |
|-----------|------|-------------|
| **Vue profil** | `view` | `source`, `referrer`, `device` |
| **Clic CTA** | `cta_click` | - |
| **Partage** | `share` | `platform` |
| **Clic portfolio** | `portfolio_click` | `itemId` |
| **Contact** | `contact` | - |

### Statistiques Profil

```typescript
interface ProfileStats {
  totalViews: number;
  viewsThisMonth: number;
  uniqueVisitors: number;
  ctaClicks: number;
  shareCount: number;
  lastViewedAt?: Timestamp;
}
```

---

## 👨‍💻 Guide d'Utilisation

### Pour un Prestataire

#### 1. Créer son Profil Public

```typescript
// 1. Créer le profil (automatique à l'inscription ou manuel)
const profile = await createPublicProfile({
  userId: currentUser.uid,
  displayName: 'John Doe',
  accountType: AccountType.professional,
  categories: ['jardinage'],
});

// 2. Personnaliser
await updatePublicProfile(currentUser.uid, {
  headline: 'Jardinier expert depuis 10 ans',
  bio: 'Passionné par la nature...',
  location: 'Paris',
  skills: ['Tonte', 'Taille', 'Aménagement paysager'],
  languages: ['fr', 'en'],
  socialLinks: {
    linkedin: 'https://linkedin.com/in/johndoe',
  },
});

// 3. Ajouter du portfolio
await addPortfolioItem(currentUser.uid, {
  title: 'Jardin moderne',
  type: 'image',
  mediaUrl: 'https://storage.../garden.jpg',
  category: 'Jardinage',
});

// 4. Publier
await publishProfile(currentUser.uid);
```

#### 2. Partager son Profil

```typescript
// URL du profil
const profileUrl = `https://imutask.com/profil/${profile.slug}`;

// Partager sur réseaux sociaux
shareOnFacebook(profileUrl);
shareOnTwitter(profileUrl);
shareOnLinkedIn(profileUrl);

// QR Code
generateQRCode(profileUrl);
```

### Pour un Client

```typescript
// Rechercher des profils
const profiles = await searchPublicProfiles({
  categories: ['jardinage'],
  city: 'Paris',
  minRating: 4.0,
  sortBy: 'rating',
});

// Voir un profil
const profile = await getPublicProfileBySlug('john-doe-abc123');

// Contacter le prestataire
contactProvider(profile.userId);
```

---

## ✅ Best Practices

### Slugs

- **Format:** `prenom-nom-{6-chars-userId}`
- **Unique:** Vérifier disponibilité avant création
- **Pas de caractères spéciaux:** Seulement `a-z`, `0-9`, `-`

### Portfolio

- **Limite gratuite:** 10 items
- **Premium:** Illimité
- **Optimiser images:** Max 2MB, format WebP recommandé
- **Ordre:** Featured en premier

### SEO

- **Meta title:** Max 60 caractères
- **Meta description:** Max 160 caractères
- **Alt text:** Pour toutes les images
- **Slug descriptif:** Inclure nom + métier si possible

### Performance

- **Images lazy loading:** Next.js Image component
- **Cache:** Server-side avec revalidation
- **Analytics batch:** Grouper les événements

### Sécurité

- **Validation côté serveur:** Toujours valider les données
- **Sanitization:** Bio, description (XSS prevention)
- **Rate limiting:** Pour création/mise à jour

---

## 🔄 Synchronisation

Le profil public se synchronise automatiquement avec les données utilisateur :

```typescript
// Déclencher la sync après mise à jour du profil utilisateur
await syncUserDataToPublicProfile(userId);
```

**Champs synchronisés:**
- `displayName`
- `photoUrl`
- `location`
- `skills`
- `languages`
- `averageRating`
- `reviewsCount`

---

## 📱 Responsive Design

Tous les composants sont **mobile-first** et testés sur:
- 📱 Mobile (320px+)
- 📱 Tablet (768px+)
- 💻 Desktop (1024px+)
- 🖥️ Large (1440px+)

---

## 🎯 Prochaines Étapes

### Phase 2 (Post-MVP)

- [ ] **Domaine personnalisé** : `johndoe.com` → profil ImuTask
- [ ] **Analytics avancés** : Graphiques, démographie, sources
- [ ] **A/B Testing** : Tester différentes versions du profil
- [ ] **Recommendations AI** : Suggestions automatiques de mots-clés
- [ ] **Intégration calendrier** : Prise de RDV directe
- [ ] **Vidéo intro** : Vidéo de présentation sur profil
- [ ] **Chatbot** : Réponses automatiques FAQ

---

## 📞 Support

Pour toute question sur l'implémentation des profils publics :

- **Documentation:** `/docs/PUBLIC_PROFILES_IMPLEMENTATION.md`
- **Types:** `/src/types/public-profile.ts`
- **Services:** `/src/lib/firestore-public-profiles.ts`
- **Composants:** `/src/features/profiles/components/`

---

**✨ Les profils publics ImuTask transforment chaque prestataire en marque personnelle !**
