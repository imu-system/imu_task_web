# 🚀 Roadmap - Profil Public & ImuShop

**Version:** 1.0.0  
**Date:** 5 novembre 2025  
**Phase:** Post-MVP (V2)  
**Priorité:** 🟡 Moyenne (après Phase 4 - Offres & Réservations)

---

## 📋 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Feature 1: Profil Public Personnalisable](#feature-1-profil-public-personnalisable)
3. [Feature 2: ImuShop - Marketplace](#feature-2-imushop---marketplace)
4. [Architecture Technique](#architecture-technique)
5. [Roadmap d'Implémentation](#roadmap-dimplémentation)
6. [Métriques de Succès](#métriques-de-succès)

---

## 🎯 Vue d'ensemble

### Objectifs Stratégiques

**Transformation d'ImuTask:**
- De plateforme de services → **Écosystème local complet**
- Ajout de 2 nouvelles sources de revenus
- Valorisation du savoir-faire local & artisanat
- Renforcement de la proposition de valeur pour les prestataires

### Impact Business

**Nouveaux Revenus:**
- Commission ImuShop (5-15% selon type)
- Options premium pour professionnels (mise en avant produits)
- Frais d'insertion optionnels (ImuMarket)

**Engagement Utilisateurs:**
- +40% temps passé sur la plateforme (estimation)
- +60% opportunités de revenus pour prestataires
- Nouveau public: artisans, créateurs, vendeurs

### Publics Cibles

**Profil Public:**
- Prestataires ImuTask (tous niveaux)
- Professionnels ImuPro
- Auto-entrepreneurs & freelances

**ImuShop:**
- Vendeurs: Artisans, créateurs, professionnels, particuliers
- Acheteurs: Communauté locale, clients ImuTask

---

## 🎨 Feature 1: Profil Public Personnalisable

### 1.1. Description

**Concept:** URL unique et personnalisable transformant le profil ImuTask en vitrine professionnelle partageable.

**Format URL:**
- Prestataires: `imutask.com/profil/prenom-nom`
- ImuPro: `imutask.com/pro/nom-entreprise`

**Valeur Ajoutée:**
- ✅ Visibilité hors plateforme (SEO, réseaux sociaux)
- ✅ Crédibilité professionnelle (portfolio, avis, badges)
- ✅ Marketing personnel facilité (QR code, partage)
- ✅ Autonomie prestataire (gestion contenu)

### 1.2. Structure de Données

**Collection Firestore: `publicProfiles`**

```typescript
interface PublicProfile {
  // Identification
  userId: string;
  slug: string; // URL personnalisable (unique)
  type: 'provider' | 'imupro';
  
  // Informations publiques
  displayName: string;
  companyName?: string; // ImuPro uniquement
  title: string; // "Électricien", "Graphiste freelance"
  bio: string; // 500 caractères max
  tagline?: string; // Slogan court (80 caractères)
  
  // Médias
  avatar: string; // URL Firebase Storage
  coverImage?: string;
  portfolio: PortfolioItem[]; // Photos/vidéos travaux
  
  // Services
  categories: string[]; // IDs catégories services
  servicePackages?: ServicePackage[]; // ImuPro: packs personnalisés
  
  // Localisation
  city: string;
  region: string;
  serviceArea: string[]; // Zones d'intervention
  
  // Preuve sociale
  rating: number;
  reviewCount: number;
  featuredReviews: string[]; // IDs avis mis en avant (max 3)
  badges: Badge[]; // ImuAcademy + certifications pro
  completedTasksCount: number;
  
  // Contact & CTA
  contactEmail?: string; // Optionnel
  contactPhone?: string; // ImuPro uniquement
  websiteUrl?: string; // ImuPro
  socialLinks?: SocialLinks;
  ctaText: string; // "Demander un devis", "Réserver un service"
  
  // Configuration
  isPublic: boolean;
  isPremium: boolean; // Options premium activées
  customTheme?: CustomTheme; // Couleurs personnalisées
  
  // ImuShop
  shopUrl?: string; // Si boutique ImuShop active
  
  // Analytics
  viewCount: number;
  ctaClicks: number;
  lastViewedAt?: Timestamp;
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface PortfolioItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  caption?: string;
  order: number;
}

interface ServicePackage {
  id: string;
  name: string;
  description: string;
  price: number;
  duration?: string;
  features: string[];
}

interface Badge {
  id: string;
  name: string;
  iconUrl: string;
  issuedAt: Timestamp;
  type: 'academy' | 'professional' | 'platform';
}

interface CustomTheme {
  primaryColor: string; // Hex
  accentColor: string;
  fontFamily?: 'default' | 'modern' | 'classic';
}

interface SocialLinks {
  linkedin?: string;
  instagram?: string;
  facebook?: string;
  twitter?: string;
}
```

### 1.3. Composants UI

**Page: `/profil/[slug]/page.tsx`**

```typescript
// Structure de la page
<PublicProfilePage>
  <ProfileHeader />        // Avatar, nom, titre, localisation
  <ProfileHero />          // Cover image + tagline
  <ProfileStats />         // Stats clés (note, missions, badges)
  <ProfileAbout />         // Bio + services proposés
  <ProfilePortfolio />     // Galerie photos/vidéos
  <ProfileReviews />       // Avis clients mis en avant
  <ProfileBadges />        // Badges & certifications
  <ProfilePackages />      // Packs services (ImuPro)
  <ProfileCTA />           // Boutons d'action
  <ProfileFooter />        // Liens sociaux, powered by ImuTask
</PublicProfilePage>
```

**Composants clés:**

1. **`ProfileEditor` (Dashboard)**
   - Interface de gestion du profil public
   - Upload médias (portfolio)
   - Personnalisation slug
   - Gestion avis mis en avant
   - Prévisualisation en temps réel

2. **`ProfileShareTools`**
   - Génération QR code
   - Boutons partage (WhatsApp, email, Facebook, LinkedIn)
   - Copy link
   - Embed code (iframe)

3. **`ProfileAnalytics` (Dashboard)**
   - Vues du profil (graphique 30 jours)
   - Clics CTA
   - Sources de trafic
   - Taux de conversion

### 1.4. Fonctionnalités Premium (ImuPro)

**Options payantes (abonnement ImuPro Plus/Elite):**

- ✨ **Portfolio illimité** (vs 5 photos gratuit)
- ✨ **Packs services personnalisés** (devis en ligne)
- ✨ **Thème personnalisé** (couleurs, police)
- ✨ **Analytics avancés** (sources, comportement visiteurs)
- ✨ **Badge "Professionnel Vérifié"**
- ✨ **Domaine personnalisé** (Elite: `www.mon-entreprise.com` → redirect)
- ✨ **Mise en avant dans recherche Google** (SEO premium)

### 1.5. SEO & Partage

**Meta-données dynamiques:**

```typescript
// /profil/[slug]/page.tsx - generateMetadata()
export async function generateMetadata({ params }): Promise<Metadata> {
  const profile = await getPublicProfile(params.slug);
  
  return {
    title: `${profile.displayName} - ${profile.title} | ImuTask`,
    description: profile.bio,
    openGraph: {
      title: profile.displayName,
      description: profile.tagline || profile.bio,
      images: [profile.avatar],
      url: `https://imutask.com/profil/${profile.slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: profile.displayName,
      description: profile.tagline,
      images: [profile.avatar],
    },
  };
}
```

**Structured Data (JSON-LD):**

```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "{{displayName}}",
  "description": "{{bio}}",
  "image": "{{avatar}}",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "{{rating}}",
    "reviewCount": "{{reviewCount}}"
  },
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "{{city}}",
    "addressRegion": "{{region}}"
  }
}
```

---

## 🛒 Feature 2: ImuShop - Marketplace

### 2.1. Description

**Concept:** Marketplace intégrée avec 2 segments:
1. **ImuPro Shop:** Produits professionnels/artisanaux
2. **ImuMarket:** Seconde main & créations personnelles

**Valeur Ajoutée:**
- ✅ Revenus complémentaires pour prestataires
- ✅ Valorisation savoir-faire local
- ✅ Diversification plateforme
- ✅ Nouvelles commissions ImuTask

### 2.2. Structure de Données

**Collection Firestore: `shopProducts`**

```typescript
interface ShopProduct {
  // Identification
  id: string;
  sellerId: string;
  sellerType: 'imupro' | 'regular'; // ImuPro Shop vs ImuMarket
  
  // Informations produit
  name: string;
  description: string;
  category: ProductCategory;
  subcategory?: string;
  tags: string[];
  
  // Médias
  images: ProductImage[];
  videos?: ProductVideo[];
  
  // Prix & Stock
  price: number;
  currency: 'EUR';
  compareAtPrice?: number; // Prix barré (promo)
  stock: number;
  isUnlimitedStock: boolean; // Services/téléchargements
  
  // Variantes (tailles, couleurs)
  variants?: ProductVariant[];
  
  // Logistique
  shippingOptions: ShippingOption[];
  pickupAvailable: boolean;
  pickupAddress?: Address;
  
  // État (ImuMarket)
  condition?: 'new' | 'like_new' | 'good' | 'fair' | 'poor';
  
  // Preuve sociale
  rating?: number;
  reviewCount: number;
  
  // Statut
  status: 'draft' | 'active' | 'sold_out' | 'archived';
  isFeatured: boolean; // Mise en avant (payant)
  
  // Analytics
  viewCount: number;
  favoriteCount: number;
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  publishedAt?: Timestamp;
}

interface ProductImage {
  id: string;
  url: string;
  alt?: string;
  order: number;
}

interface ProductVariant {
  id: string;
  name: string; // "Taille L", "Couleur Bleu"
  options: string[]; // ["S", "M", "L"], ["Rouge", "Bleu"]
  priceAdjustment?: number; // +5€ pour XL
  stock?: number;
}

interface ShippingOption {
  id: string;
  name: string; // "Livraison Standard", "Express"
  price: number;
  estimatedDays: string; // "3-5 jours"
  carrier?: string; // "Colissimo", "Mondial Relay"
}

type ProductCategory = 
  | 'handmade' // Fait main
  | 'art' // Art & déco
  | 'fashion' // Mode & accessoires
  | 'home' // Maison
  | 'services' // Services (formations, consultations)
  | 'electronics' // High-tech (ImuMarket)
  | 'books' // Livres
  | 'sports' // Sports & loisirs
  | 'other';
```

**Collection: `shopOrders`**

```typescript
interface ShopOrder {
  id: string;
  orderNumber: string; // "IMU-2025-001234"
  
  // Parties
  buyerId: string;
  sellerId: string;
  
  // Produits
  items: OrderItem[];
  
  // Prix
  subtotal: number;
  shippingCost: number;
  taxes: number;
  total: number;
  
  // Commission ImuTask
  commissionRate: number; // 5-15%
  commissionAmount: number;
  
  // Paiement
  paymentIntentId: string; // Stripe
  paymentStatus: 'pending' | 'paid' | 'refunded';
  
  // Livraison
  shippingAddress?: Address;
  shippingMethod: string;
  trackingNumber?: string;
  
  // Statut
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  
  // Communication
  messageThreadId?: string; // Lien vers conversation
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  deliveredAt?: Timestamp;
}

interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  variantId?: string;
  variantName?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}
```

### 2.3. Pages & Routes

**Structure de routes:**

```
/shop                          → Page d'accueil ImuShop
/shop/pro                      → Section ImuPro Shop
/shop/market                   → Section ImuMarket (seconde main)
/shop/[sellerId]               → Boutique d'un vendeur
/shop/product/[productId]      → Fiche produit détaillée
/shop/cart                     → Panier d'achat
/shop/checkout                 → Processus de paiement
/shop/orders                   → Mes commandes (acheteur)
/shop/sales                    → Mes ventes (vendeur)

/dashboard/shop                → Gestion boutique (vendeur)
/dashboard/shop/products       → Gestion produits
/dashboard/shop/products/new   → Créer produit
/dashboard/shop/orders         → Gestion commandes
/dashboard/shop/analytics      → Analytics boutique
```

### 2.4. Composants UI Principaux

**1. ProductCard**
```typescript
<ProductCard>
  <ProductImage />
  <ProductBadge /> // "Nouveau", "Promo", "Fait main"
  <ProductInfo>
    <ProductTitle />
    <SellerName />
    <ProductPrice />
    <ProductRating />
  </ProductInfo>
  <FavoriteButton />
</ProductCard>
```

**2. ProductPage**
```typescript
<ProductPage>
  <ProductGallery /> // Images + vidéos
  <ProductDetails>
    <ProductHeader />
    <ProductPrice />
    <VariantSelector /> // Tailles, couleurs
    <QuantitySelector />
    <AddToCartButton />
    <ShippingInfo />
  </ProductDetails>
  <SellerCard /> // Info vendeur + lien profil
  <ProductDescription />
  <ProductReviews />
  <RelatedProducts />
</ProductPage>
```

**3. ShopDashboard (Vendeur)**
```typescript
<ShopDashboard>
  <ShopStats /> // Ventes, revenus, vues
  <ProductList /> // Gestion produits
  <OrdersManager /> // Commandes à traiter
  <AnalyticsCharts /> // Graphiques ventes
  <ShopSettings /> // Config boutique
</ShopDashboard>
```

### 2.5. Workflow Achat

**Parcours acheteur:**

1. **Découverte** → Parcourir ImuShop (recherche, catégories)
2. **Détails** → Fiche produit détaillée
3. **Panier** → Ajout au panier (multi-vendeurs possible)
4. **Checkout** → Informations livraison + paiement (Stripe)
5. **Confirmation** → Email + suivi commande
6. **Livraison** → Vendeur expédie + tracking
7. **Réception** → Acheteur confirme réception
8. **Avis** → Laisser un avis produit

**Parcours vendeur:**

1. **Création** → Ajouter produit (photos, description, prix)
2. **Publication** → Mettre en ligne
3. **Notification** → Alerte nouvelle commande
4. **Préparation** → Préparer colis
5. **Expédition** → Marquer expédié + tracking
6. **Paiement** → Transfert fonds (commission déduite)

### 2.6. Monétisation

**Commissions ImuTask:**

| Segment | Commission | Justification |
|---------|-----------|---------------|
| **ImuPro Shop** | 8-12% | Produits premium, services pro |
| **ImuMarket** | 5-8% | Seconde main, faible valeur |
| **Services digitaux** | 15% | Formations, consultations |

**Options Premium Vendeur:**

- **Mise en avant produits:** 2-5€/mois par produit
- **Boutique Premium:** 19€/mois (analytics avancés, thème perso)
- **Boost visibilité:** 10€ pour 7 jours (top résultats recherche)

---

## 🏗️ Architecture Technique

### 3.1. Stack Technique

**Frontend:**
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui
- Framer Motion (animations)

**Backend:**
- Firebase Firestore (base de données)
- Firebase Storage (images/vidéos)
- Firebase Cloud Functions (automation)

**Paiements:**
- Stripe Connect (marketplace payments)
- Stripe Checkout (paiements produits)

**Médias:**
- Next.js Image (optimisation)
- Cloudinary (alternative: compression avancée)

**Search:**
- Algolia (recherche produits)
- Filtres facettes (catégorie, prix, vendeur)

### 3.2. Security Rules Firestore

**publicProfiles:**
```javascript
match /publicProfiles/{profileId} {
  // Lecture publique
  allow read: if true;
  
  // Écriture: propriétaire uniquement
  allow create, update: if request.auth != null 
    && request.auth.uid == request.resource.data.userId;
  
  // Empêcher modification slug si déjà défini
  allow update: if !('slug' in resource.data) 
    || request.resource.data.slug == resource.data.slug;
}
```

**shopProducts:**
```javascript
match /shopProducts/{productId} {
  // Lecture publique (si status = active)
  allow read: if resource.data.status == 'active' || request.auth.uid == resource.data.sellerId;
  
  // Écriture: vendeur uniquement
  allow create, update: if request.auth != null 
    && request.auth.uid == request.resource.data.sellerId;
  
  // Validation prix positif
  allow write: if request.resource.data.price > 0;
}
```

**shopOrders:**
```javascript
match /shopOrders/{orderId} {
  // Lecture: acheteur ou vendeur
  allow read: if request.auth != null 
    && (request.auth.uid == resource.data.buyerId 
        || request.auth.uid == resource.data.sellerId);
  
  // Création: acheteur uniquement
  allow create: if request.auth != null 
    && request.auth.uid == request.resource.data.buyerId;
  
  // Modification: vendeur (statut expédition)
  allow update: if request.auth != null 
    && request.auth.uid == resource.data.sellerId
    && onlyUpdatingStatus();
}
```

### 3.3. Cloud Functions

**Automation nécessaire:**

```typescript
// 1. Génération slug unique lors création profil public
exports.generateUniqueSlug = functions.firestore
  .document('publicProfiles/{profileId}')
  .onCreate(async (snap, context) => {
    const data = snap.data();
    const baseSlug = slugify(data.displayName);
    const uniqueSlug = await findUniqueSlug(baseSlug);
    
    await snap.ref.update({ slug: uniqueSlug });
  });

// 2. Synchronisation stats profil public
exports.syncPublicProfileStats = functions.firestore
  .document('reviews/{reviewId}')
  .onWrite(async (change, context) => {
    const review = change.after.data();
    const providerId = review.providerId;
    
    // Recalculer note moyenne, count
    await updatePublicProfileStats(providerId);
  });

// 3. Gestion commande ImuShop
exports.processShopOrder = functions.firestore
  .document('shopOrders/{orderId}')
  .onCreate(async (snap, context) => {
    const order = snap.data();
    
    // 1. Créer Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: order.total * 100,
      currency: 'eur',
      application_fee_amount: order.commissionAmount * 100,
      transfer_data: {
        destination: order.sellerStripeAccountId,
      },
    });
    
    // 2. Envoyer notifications
    await sendOrderNotifications(order);
    
    // 3. Décrémenter stock
    await decrementProductStock(order.items);
  });

// 4. Analytics profil public
exports.trackProfileView = functions.https.onCall(async (data, context) => {
  const { profileId } = data;
  
  await db.collection('publicProfiles').doc(profileId).update({
    viewCount: admin.firestore.FieldValue.increment(1),
    lastViewedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
});
```

---

## 📅 Roadmap d'Implémentation

### Phase 1: Profil Public (MVP) - 4 semaines

**Semaine 1: Infrastructure (40h)**
- [ ] Modèle de données Firestore `publicProfiles`
- [ ] Security rules Firestore
- [ ] Cloud Functions (slug generation, stats sync)
- [ ] Routes Next.js `/profil/[slug]`
- [ ] Types TypeScript
- [ ] Hooks personnalisés (`usePublicProfile`)

**Semaine 2: UI Profil Public (40h)**
- [ ] Composants page profil (Header, Stats, About, Portfolio, Reviews)
- [ ] Responsive design (mobile-first)
- [ ] Animations (Framer Motion)
- [ ] SEO (generateMetadata, JSON-LD)
- [ ] Partage social (OG tags)
- [ ] Traductions i18n (FR/EN)

**Semaine 3: Dashboard Éditeur (40h)**
- [ ] Page `/dashboard/public-profile`
- [ ] Formulaire édition profil
- [ ] Upload portfolio (Firebase Storage)
- [ ] Customisation slug
- [ ] Gestion avis mis en avant
- [ ] Prévisualisation temps réel

**Semaine 4: Analytics & Outils (40h)**
- [ ] Tracking vues profil
- [ ] Dashboard analytics
- [ ] Générateur QR code
- [ ] Boutons partage
- [ ] Tests E2E (Playwright)
- [ ] Documentation

**Livrables Phase 1:**
- ✅ Profil public fonctionnel et partageable
- ✅ Éditeur complet dans dashboard
- ✅ SEO optimisé
- ✅ Analytics basiques

---

### Phase 2: ImuShop (MVP) - 6 semaines

**Semaine 1-2: Infrastructure Shop (80h)**
- [ ] Modèles données (`shopProducts`, `shopOrders`)
- [ ] Security rules
- [ ] Cloud Functions (orders, stock, paiements)
- [ ] Intégration Stripe Connect Marketplace
- [ ] Routes Next.js `/shop/*`
- [ ] Hooks (`useShopProducts`, `useCart`, `useOrders`)

**Semaine 3: UI Shop Frontend (40h)**
- [ ] Page accueil ImuShop
- [ ] Grille produits (ProductCard)
- [ ] Fiche produit détaillée
- [ ] Filtres & recherche
- [ ] Panier d'achat
- [ ] Responsive design

**Semaine 4: Checkout & Paiements (40h)**
- [ ] Page checkout
- [ ] Formulaire adresse livraison
- [ ] Intégration Stripe Checkout
- [ ] Webhooks Stripe
- [ ] Confirmation commande
- [ ] Emails transactionnels

**Semaine 5: Dashboard Vendeur (40h)**
- [ ] Page `/dashboard/shop`
- [ ] Gestion produits (CRUD)
- [ ] Upload images produits
- [ ] Gestion commandes
- [ ] Gestion stock
- [ ] Analytics ventes

**Semaine 6: Tests & Polish (40h)**
- [ ] Tests E2E flow achat complet
- [ ] Tests vendeur
- [ ] Optimisation images
- [ ] Traductions complètes
- [ ] Documentation
- [ ] Bug fixes

**Livrables Phase 2:**
- ✅ ImuShop fonctionnel (ImuPro Shop + ImuMarket)
- ✅ Paiements Stripe sécurisés
- ✅ Dashboard vendeur complet
- ✅ Flow achat testé end-to-end

---

### Phase 3: Features Avancées - 4 semaines

**Options Premium (2 semaines)**
- [ ] Système abonnement ImuPro (Shop Premium)
- [ ] Thèmes personnalisés profil
- [ ] Analytics avancés
- [ ] Mise en avant produits (payant)
- [ ] Portfolio illimité
- [ ] Domaine personnalisé

**Optimisations (2 semaines)**
- [ ] Recherche Algolia (produits)
- [ ] Recommandations produits (ML basique)
- [ ] Système favoris/wishlist
- [ ] Notifications push (nouvelles commandes)
- [ ] Exports vendeur (rapports ventes)
- [ ] Modération automatique (IA images)

---

## 📊 Métriques de Succès

### KPIs Profil Public

**Adoption:**
- % prestataires avec profil public activé (objectif: 60% à M+3)
- Nombre profils publics créés/semaine
- % profils complets (portfolio + 3+ avis)

**Engagement:**
- Vues profil moyen/prestataire/mois (objectif: 50+)
- Taux de clic CTA (objectif: 8-12%)
- Partages sociaux/mois

**Business:**
- Conversion visite profil → demande service (objectif: 5%)
- Revenus attribués aux profils publics
- Upgrades vers premium (objectif: 15% des ImuPro)

### KPIs ImuShop

**Vendeurs:**
- Nombre vendeurs actifs/mois (objectif: 200 à M+6)
- Produits listés (objectif: 2,000)
- Vendeurs récurrents (2+ ventes/mois)

**Acheteurs:**
- GMV ImuShop/mois (objectif: 10k€ à M+3)
- Panier moyen (objectif: 35€)
- Taux conversion visite → achat (objectif: 2-3%)

**Plateforme:**
- Commission revenue/mois (objectif: 800€ à M+3)
- Revenus options premium (objectif: 300€/mois)
- Taux retour produits (<5%)
- Note satisfaction acheteurs (>4.5/5)

---

## 🎯 Prochaines Actions

### Validation Concept (Sprint actuel)

**Avant développement:**
1. [ ] **User research:** Interviews 10 prestataires ImuTask
   - Intérêt profil public? Willingness to pay?
   - Produits à vendre? Fourchette prix?
2. [ ] **Analyse concurrence:** Étude Malt, Fiverr, Etsy, Vinted
3. [ ] **Prototypage:** Maquettes Figma (profil public + shop)
4. [ ] **Validation business model:** Taux commission acceptables?

### Décision Go/No-Go

**Critères:**
- ✅ 70%+ prestataires intéressés par profil public
- ✅ 40%+ prestataires intéressés par vente produits
- ✅ Panier moyen estimé >30€
- ✅ Break-even possible à <500 transactions/mois

**Priorisation:**
- Si validation ✅ → Intégrer Phase 13 roadmap (Post-V1)
- Si validation partielle → Profil Public seul (Phase 13a)
- Si validation ❌ → Repousser post-V2

---

## 📚 Références & Inspirations

**Profils Publics:**
- Malt: `malt.fr/profile/nom`
- LinkedIn: Structure profil
- About.me: Simplicité & personnalisation

**Marketplaces:**
- Etsy: Artisanat & fait main
- Vinted: Seconde main
- Shopify: Dashboard vendeur
- Gumroad: Services digitaux

**Intégrations:**
- Stripe Connect: Marketplace payments
- Algolia: Search & filters
- Cloudinary: Image optimization

---

**Note finale:** Ce document doit être revu et validé avec des utilisateurs réels avant d'engager le développement. Les estimations de temps et métriques sont basées sur des hypothèses à confirmer.

**Prochaine étape:** Créer brief user research + maquettes Figma.
