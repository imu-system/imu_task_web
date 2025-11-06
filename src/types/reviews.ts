/**
 * Review Types & Interfaces
 * 
 * Système d'évaluation 5 étoiles pour ImuTask
 * - Reviews post-mission (client → provider, provider → client)
 * - Rating 1-5 étoiles avec commentaire
 * - Réponse provider optionnelle
 * - Signalement avis inappropriés
 * - Badges qualité automatiques
 */

import { Timestamp } from 'firebase/firestore';

export type ReviewRating = 1 | 2 | 3 | 4 | 5;

export type ReviewType = 'client_to_provider' | 'provider_to_client';

export interface Review {
  id?: string;
  bookingId: string;
  taskId: string;
  reviewerId: string; // User who wrote the review
  reviewerName: string;
  reviewerAvatar?: string;
  reviewedUserId: string; // User being reviewed
  reviewedUserName: string;
  type: ReviewType;
  
  // Rating
  rating: ReviewRating;
  comment: string;
  
  // Detailed ratings (optional)
  detailedRatings?: {
    communication?: ReviewRating;
    quality?: ReviewRating;
    professionalism?: ReviewRating;
    timeliness?: ReviewRating;
    valueForMoney?: ReviewRating;
  };
  
  // Response
  response?: {
    text: string;
    respondedAt: Date;
  };
  
  // Moderation
  reported?: boolean;
  reportReason?: string;
  reportedAt?: Date;
  reportedBy?: string;
  moderationStatus?: 'pending' | 'approved' | 'rejected' | 'removed';
  moderatedAt?: Date;
  moderatedBy?: string;
  moderationNotes?: string;
  
  // Helpful votes
  helpfulCount?: number;
  helpfulVoters?: string[]; // User IDs who found it helpful
  
  // Photos (optional)
  photos?: string[]; // URLs to uploaded photos
  
  // Metadata
  verified?: boolean; // Was the booking actually completed?
  createdAt: Date;
  updatedAt: Date;
}

export interface ReviewStats {
  userId: string;
  userType: 'provider' | 'client';
  
  // Overall stats
  totalReviews: number;
  averageRating: number;
  
  // Rating breakdown
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  
  // Detailed ratings averages
  detailedAverages?: {
    communication: number;
    quality: number;
    professionalism: number;
    timeliness: number;
    valueForMoney: number;
  };
  
  // Response rate (providers only)
  responseRate?: number; // Percentage of reviews responded to
  
  // Badges
  badges: QualityBadge[];
  
  // Last updated
  lastReviewAt?: Date;
  updatedAt: Date;
}

export type QualityBadgeType =
  | 'top_rated' // 4.8+ average, 10+ reviews
  | 'excellent_service' // 4.5+ average, 20+ reviews
  | 'responsive' // 90%+ response rate
  | 'verified_pro' // KYC + 50+ completed bookings
  | 'rising_star' // New provider, 5+ reviews, 4.5+ avg
  | 'reliable' // <5% cancellation rate, 20+ bookings
  | 'great_communicator' // 4.8+ communication rating
  | 'punctual' // 4.8+ timeliness rating
  | 'value_champion'; // 4.8+ value rating, competitive pricing

export interface QualityBadge {
  type: QualityBadgeType;
  earnedAt: Date;
  active: boolean;
}

export interface CreateReviewInput {
  bookingId: string;
  taskId: string;
  reviewerId: string;
  reviewedUserId: string;
  type: ReviewType;
  rating: ReviewRating;
  comment: string;
  detailedRatings?: {
    communication?: ReviewRating;
    quality?: ReviewRating;
    professionalism?: ReviewRating;
    timeliness?: ReviewRating;
    valueForMoney?: ReviewRating;
  };
  photos?: string[];
}

export interface UpdateReviewInput {
  rating?: ReviewRating;
  comment?: string;
  detailedRatings?: {
    communication?: ReviewRating;
    quality?: ReviewRating;
    professionalism?: ReviewRating;
    timeliness?: ReviewRating;
    valueForMoney?: ReviewRating;
  };
  photos?: string[];
}

export interface RespondToReviewInput {
  reviewId: string;
  providerId: string;
  responseText: string;
}

export interface ReportReviewInput {
  reviewId: string;
  reporterId: string;
  reason: string;
}

export interface ReviewFilters {
  userId?: string; // Filter reviews for a specific user
  userType?: 'provider' | 'client';
  rating?: ReviewRating; // Filter by specific rating
  minRating?: ReviewRating; // Filter by minimum rating
  hasPhotos?: boolean;
  hasResponse?: boolean;
  verified?: boolean;
  sortBy?: 'recent' | 'highest' | 'lowest' | 'helpful';
  limit?: number;
  offset?: number;
}

export interface ReviewSummary {
  totalCount: number;
  averageRating: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  responseRate: number;
  verifiedPercentage: number;
  recentReviews: Review[];
}

// Helper function types
export type CalculateAverageRating = (reviews: Review[]) => number;
export type CanUserReview = (bookingId: string, userId: string) => Promise<boolean>;
export type HasUserReviewed = (bookingId: string, userId: string) => Promise<boolean>;
export type CalculateBadges = (stats: ReviewStats, userType: 'provider' | 'client') => QualityBadge[];
