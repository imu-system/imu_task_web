import { Timestamp } from 'firebase/firestore';

export type OfferStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn';

export interface Offer {
    id: string;
    taskId: string;
    providerId: string;
    clientId: string; // Dénormalisé depuis task

    // Proposition
    proposedPrice: number;
    message: string; // Pourquoi je suis le bon provider
    estimatedDuration?: number; // En heures
    availableFrom?: Timestamp;
    availableTo?: Timestamp;

    // Statut
    status: OfferStatus;

    // Metadata
    createdAt: Timestamp;
    updatedAt: Timestamp;
    acceptedAt?: Timestamp;
    rejectedAt?: Timestamp;
    rejectionReason?: string;
}

export interface CreateOfferInput {
    taskId: string;
    proposedPrice: number;
    message: string;
    estimatedDuration?: number;
    availableFrom?: Date;
    availableTo?: Date;
}

export interface OfferWithDetails extends Offer {
    // Données enrichies pour affichage
    providerName: string;
    providerAvatar?: string;
    providerRating?: number;
    providerReviewCount?: number;
    providerBadges?: string[];
    taskTitle: string;
    taskBudget: number;
    taskCategory: string;
}
