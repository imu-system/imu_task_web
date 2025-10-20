/**
 * Types pour les profils professionnels ImuPro
 * Profils enrichis avec portfolio, badges, tarification, disponibilités
 */

import {ProServiceCategory, BusinessInfo, Certification, ProfessionalInsurance} from "./kyb";

/**
 * Élément du portfolio professionnel
 */
export interface PortfolioItem {
    id: string;
    title: string;
    description: string;
    images: string[]; // URLs des photos (max 5 par projet)
    category: ProServiceCategory;
    completionDate: Date;
    clientTestimonial?: string;
    tags?: string[]; // Ex: ["renovation", "peinture", "carrelage"]
    featured: boolean; // Mis en avant dans le profil
}

/**
 * Badges de confiance professionnels
 */
export interface ProBadges {
    proVerified: boolean; // KYB validé
    insuranceVerified: boolean; // RC Pro à jour
    topRated: boolean; // Note moyenne > 4.8 sur 20+ missions
    fastResponder: boolean; // Répond en moins de 2h
    reliablePro: boolean; // 0 annulation sur 50+ missions
    certifiedExpert: boolean; // Certifications validées
    backgroundChecked: boolean; // Pour services à la personne
}

/**
 * Type de tarification
 */
export enum PricingType {
    FIXED = "fixed", // Prix fixe par service
    HOURLY = "hourly", // Taux horaire
    QUOTE = "quote", // Sur devis uniquement
}

/**
 * Prix fixe pour un type de service
 */
export interface FixedPrice {
    serviceType: string; // Ex: "Installation robinet", "Réparation fuite"
    description: string;
    price: number; // En centimes
    estimatedDuration?: number; // En minutes
}

/**
 * Modèle de tarification
 */
export interface PricingModel {
    type: PricingType;
    baseRate?: number; // Pour hourly (en centimes/heure)
    fixedPrices?: FixedPrice[]; // Pour fixed
    minimumCharge?: number; // Montant minimum de facturation
    includesTax: boolean; // Si TVA incluse
}

/**
 * Créneau de disponibilité
 */
export interface TimeSlot {
    start: string; // Format "HH:mm" ex: "09:00"
    end: string; // Format "HH:mm" ex: "18:00"
}

/**
 * Disponibilités d'un jour de la semaine
 */
export interface DayAvailability {
    isWorking: boolean;
    slots: TimeSlot[];
}

/**
 * Planning hebdomadaire
 */
export interface WorkingHours {
    monday: DayAvailability;
    tuesday: DayAvailability;
    wednesday: DayAvailability;
    thursday: DayAvailability;
    friday: DayAvailability;
    saturday: DayAvailability;
    sunday: DayAvailability;
}

/**
 * Frais de déplacement
 */
export interface TravelFee {
    freeRadius: number; // km gratuits autour de l'adresse
    pricePerKm: number; // Prix par km au-delà (en centimes)
    maximumDistance: number; // Distance max acceptée
}

/**
 * Zone d'intervention géographique
 */
export interface ServiceArea {
    latitude: number;
    longitude: number;
    radius: number; // Rayon en km
    cities?: string[]; // Liste de villes couvertes
    postalCodes?: string[]; // Liste de codes postaux
}

/**
 * Statistiques du professionnel
 */
export interface ProStats {
    totalJobs: number;
    completedJobs: number;
    canceledJobs: number;
    averageResponseTime: number; // En minutes
    acceptanceRate: number; // Pourcentage
    onTimeRate: number; // Pourcentage de ponctualité
    totalRevenue: number; // En centimes
    averageJobValue: number; // En centimes
}

/**
 * Profil Professionnel ImuPro
 * Extension du profil utilisateur classique
 */
export interface ProProfile {
    // Identité Pro
    userId: string;
    isPro: true;
    proVerified: boolean;
    verificationStatus: string; // De ProVerificationStatus (kyb.ts)

    // Informations commerciales
    businessInfo: BusinessInfo;

    // Assurance et certifications
    insurance: ProfessionalInsurance;
    certifications: Certification[];

    // Portfolio
    portfolio: PortfolioItem[];
    maxPortfolioItems: number; // Limite selon abonnement (10 pour gratuit, illimité pour premium)

    // Badges de confiance
    badges: ProBadges;

    // Services proposés
    categories: ProServiceCategory[];
    specialties: string[]; // Spécialités détaillées
    yearsOfExperience?: number;

    // Tarification
    pricingModel: PricingModel;

    // Disponibilités
    workingHours: WorkingHours;
    acceptsEmergency: boolean; // Accepte les dépannages urgents
    emergencySurcharge?: number; // Supplément urgence (pourcentage)

    // Zone d'intervention
    serviceArea: ServiceArea;
    travelFee?: TravelFee;

    // Statistiques
    stats: ProStats;

    // Abonnement
    subscriptionTier: "free" | "plus" | "elite";
    subscriptionExpiresAt?: Date;

    // Métadonnées
    createdAt: Date;
    updatedAt: Date;
    lastActiveAt: Date;

    // Paramètres
    autoAcceptQuotes: boolean; // Acceptation auto si conditions remplies
    notificationPreferences: {
        email: boolean;
        sms: boolean;
        push: boolean;
    };
}

/**
 * Vue publique du profil pro (pour les clients)
 */
export interface PublicProProfile {
    userId: string;
    displayName: string;
    photoUrl?: string;
    bio?: string;

    // Infos business publiques
    companyName: string;
    siret: string; // Visible pour conformité
    yearsOfExperience?: number;

    // Portfolio
    portfolio: PortfolioItem[];

    // Badges
    badges: ProBadges;

    // Services
    categories: ProServiceCategory[];
    specialties: string[];

    // Tarification (sans détails sensibles)
    pricingType: PricingType;
    startingPrice?: number; // "À partir de..."

    // Disponibilités générales
    availableNow: boolean;
    responseTime: string; // Ex: "Moins de 2h"

    // Zone d'intervention
    servesArea: string; // Ex: "Paris et proche banlieue"

    // Statistiques publiques
    averageRating: number;
    reviewsCount: number;
    completedJobs: number;
    memberSince: Date;

    // Certifications visibles
    certifications: {
        type: string;
        issuingBody: string;
        verified: boolean;
    }[];
}

/**
 * Critères de recherche de professionnels
 */
export interface ProSearchCriteria {
    category?: ProServiceCategory;
    location?: {
        latitude: number;
        longitude: number;
        radius: number; // km
    };
    postalCode?: string;
    city?: string;

    // Filtres
    minRating?: number;
    maxPrice?: number;
    availableNow?: boolean;
    verifiedOnly?: boolean;
    withInsurance?: boolean;

    // Tri
    sortBy?: "rating" | "price" | "distance" | "response_time";
    sortOrder?: "asc" | "desc";
}
