/**
 * Types pour les Profils Publics Personnalisables
 * 
 * Permet aux prestataires et ImuPro de créer une vitrine publique
 * accessible via URL personnalisée (ex: imutask.com/profil/john-doe)
 */

import { Timestamp } from 'firebase/firestore';
import { AccountType } from '@/lib/types';

/**
 * Type de profil public
 */
export enum ProfileVisibility {
    PUBLIC = 'public',           // Visible par tous (indexé SEO)
    UNLISTED = 'unlisted',       // Accessible uniquement via URL directe
    PRIVATE = 'private'          // Non accessible (mode édition)
}

/**
 * Badge de qualité ImuTask
 */
export interface QualityBadge {
    id: string;
    name: string;                // Ex: "Verified", "Top Rated", "Responsive"
    type: 'academy' | 'professional' | 'platform' | 'achievement';
    icon?: string;               // Nom de l'icône Lucide
    color?: string;              // Couleur hex
    issuedAt: Timestamp;
    description?: string;
}

/**
 * Item de portfolio (photos/vidéos/liens)
 */
export interface PortfolioItem {
    id: string;
    title: string;
    description?: string;
    type: 'image' | 'video' | 'link';

    // Pour images/vidéos
    mediaUrl?: string;           // URL Firebase Storage ou externe
    thumbnailUrl?: string;       // Miniature

    // Pour liens
    externalUrl?: string;        // URL externe (site, GitHub, etc.)

    // Métadonnées
    category?: string;           // Catégorie de service
    tags?: string[];
    completionDate?: Timestamp;
    featured?: boolean;          // Mis en avant
    order?: number;              // Ordre d'affichage

    createdAt: Timestamp;
}

/**
 * Thème personnalisé (fonctionnalité premium)
 */
export interface CustomTheme {
    primaryColor?: string;       // Couleur principale (hex)
    accentColor?: string;        // Couleur d'accentuation (hex)
    fontFamily?: 'default' | 'modern' | 'classic' | 'playful';

    // Options avancées (premium)
    coverImage?: string;         // Image de couverture
    backgroundColor?: string;    // Couleur de fond
    textColor?: string;          // Couleur du texte
}

/**
 * Liens réseaux sociaux
 */
export interface SocialLinks {
    linkedin?: string;
    instagram?: string;
    facebook?: string;
    twitter?: string;
    tiktok?: string;
    youtube?: string;
    website?: string;            // Site web personnel/entreprise
}

/**
 * Pack de service (pour ImuPro)
 */
export interface ServicePack {
    id: string;
    name: string;
    description: string;
    price: number;               // Prix en euros
    currency: string;            // 'EUR'
    duration?: string;           // Ex: "2-3 heures", "1 journée"
    includes?: string[];         // Liste des inclusions
    category: string;
    isActive: boolean;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

/**
 * Statistiques du profil public
 */
export interface ProfileStats {
    totalViews: number;          // Nombre total de vues
    viewsThisMonth: number;
    uniqueVisitors: number;
    ctaClicks: number;           // Clics sur "Demander un service"
    shareCount: number;          // Nombre de partages
    lastViewedAt?: Timestamp;
}

/**
 * Données analytiques détaillées (premium)
 */
export interface ProfileAnalytics {
    userId: string;
    profileSlug: string;

    // Vues
    views: {
        total: number;
        byMonth: Record<string, number>;  // 'YYYY-MM' -> count
        bySource: Record<string, number>; // 'search', 'direct', 'social'
    };

    // Conversions
    conversions: {
        total: number;
        contactClicks: number;
        serviceRequests: number;
        portfolioClicks: number;
    };

    // Démographie (si disponible)
    demographics?: {
        topCities: Record<string, number>;
        topCountries: Record<string, number>;
    };

    updatedAt: Timestamp;
}

/**
 * Profil Public Complet
 */
export interface PublicProfile {
    // Identifiants
    id: string;                  // Document ID (= userId)
    userId: string;              // Référence user
    slug: string;                // URL slug (unique, indexé)

    // Visibilité
    visibility: ProfileVisibility;
    isActive: boolean;           // Actif ou désactivé

    // Informations de base
    displayName: string;
    headline?: string;           // Titre/profession (ex: "Développeur Web Senior")
    bio?: string;                // Description longue (rich text)
    photoUrl?: string;           // Photo de profil
    location?: string;           // Ville/région

    // Pour ImuPro
    isPro: boolean;
    businessName?: string;       // Nom de l'entreprise
    logoUrl?: string;            // Logo entreprise

    // Type de compte
    accountType: AccountType;

    // Services
    categories: string[];        // Catégories de services
    skills?: string[];           // Compétences spécifiques
    languages?: string[];        // Langues parlées
    serviceArea?: {
        city: string;
        radiusKm?: number;
    };

    // Portfolio
    portfolio: PortfolioItem[];
    maxPortfolioItems?: number;  // Limite selon abonnement

    // Packs de services (ImuPro uniquement)
    servicePacks?: ServicePack[];

    // Avis et preuves sociales
    reviewsCount: number;
    averageRating: number;
    completedMissions: number;

    // Badges
    badges: QualityBadge[];

    // Réseaux sociaux
    socialLinks?: SocialLinks;

    // Personnalisation
    customTheme?: CustomTheme;

    // SEO
    metaTitle?: string;
    metaDescription?: string;

    // Statistiques
    stats: ProfileStats;

    // Premium features
    isPremium: boolean;          // Abonnement premium actif
    premiumFeatures?: {
        customDomain?: string;     // Domaine personnalisé
        hideImuTaskBranding?: boolean;
        advancedAnalytics?: boolean;
        priorityListing?: boolean;
    };

    // Timestamps
    createdAt: Timestamp;
    updatedAt: Timestamp;
    lastPublishedAt?: Timestamp;
}

/**
 * Données pour créer un profil public
 */
export interface CreatePublicProfileData {
    userId: string;
    displayName: string;
    slug?: string;               // Auto-généré si non fourni
    accountType: AccountType;
    categories?: string[];
    bio?: string;
    headline?: string;
}

/**
 * Données pour mettre à jour un profil public
 */
export interface UpdatePublicProfileData {
    displayName?: string;
    headline?: string;
    bio?: string;
    photoUrl?: string;
    location?: string;
    categories?: string[];
    skills?: string[];
    languages?: string[];
    socialLinks?: SocialLinks;
    customTheme?: CustomTheme;
    visibility?: ProfileVisibility;
    metaTitle?: string;
    metaDescription?: string;
    premiumFeatures?: {
        customDomain?: string;
        hideImuTaskBranding?: boolean;
        advancedAnalytics?: boolean;
        priorityListing?: boolean;
    };
}

/**
 * Options de recherche de profils
 */
export interface SearchProfilesOptions {
    categories?: string[];
    city?: string;
    radiusKm?: number;
    minRating?: number;
    isPro?: boolean;
    searchQuery?: string;
    limit?: number;
    sortBy?: 'relevance' | 'rating' | 'recent' | 'popular';
}

/**
 * Résultat de recherche de profil
 */
export interface ProfileSearchResult {
    id: string;
    userId: string;
    slug: string;
    displayName: string;
    headline?: string;
    photoUrl?: string;
    location?: string;
    averageRating: number;
    reviewsCount: number;
    categories: string[];
    badges: QualityBadge[];
    isPro: boolean;
    stats: {
        totalViews: number;
        completedMissions: number;
    };
}

/**
 * Paramètres pour générer un QR code
 */
export interface ProfileQRCodeOptions {
    slug: string;
    size?: number;              // Taille en pixels (défaut: 256)
    format?: 'png' | 'svg';
    includelogo?: boolean;      // Logo ImuTask au centre
}

/**
 * Configuration de partage social
 */
export interface SocialShareConfig {
    slug: string;
    platform: 'facebook' | 'twitter' | 'linkedin' | 'whatsapp' | 'email';
    customMessage?: string;
}

/**
 * Événement analytique
 */
export interface ProfileAnalyticsEvent {
    profileId: string;
    eventType: 'view' | 'cta_click' | 'share' | 'portfolio_click' | 'contact';
    metadata?: {
        source?: string;         // 'search', 'direct', 'social'
        referrer?: string;
        device?: string;         // 'mobile', 'desktop', 'tablet'
    };
    timestamp: Timestamp;
}
