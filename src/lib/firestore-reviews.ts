/**
 * Firestore Reviews Library
 * 
 * CRUD operations pour le système d'évaluation
 * - Création reviews post-booking
 * - Calcul stats et moyennes
 * - Réponses providers
 * - Signalement avis
 * - Attribution badges qualité
 * - Notifications post-review
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  Timestamp,
  serverTimestamp,
  increment,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import { notifyNewReview } from './firestore-notifications';
import type {
  Review,
  ReviewStats,
  CreateReviewInput,
  UpdateReviewInput,
  RespondToReviewInput,
  ReportReviewInput,
  ReviewFilters,
  ReviewSummary,
  QualityBadge,
  QualityBadgeType,
  ReviewRating,
} from '@/types/reviews';

const REVIEWS_COLLECTION = 'reviews';
const REVIEW_STATS_COLLECTION = 'review_stats';

// ============================================================================
// CREATE & UPDATE REVIEWS
// ============================================================================

/**
 * Create a new review
 */
export async function createReview(input: CreateReviewInput): Promise<string> {
  try {
    // 1. Verify booking exists and is completed
    const bookingRef = doc(db, 'bookings', input.bookingId);
    const bookingSnap = await getDoc(bookingRef);

    if (!bookingSnap.exists()) {
      throw new Error('Booking not found');
    }

    const booking = bookingSnap.data();
    if (booking.status !== 'completed') {
      throw new Error('Can only review completed bookings');
    }

    // 2. Check if user already reviewed
    const existingReview = await hasUserReviewed(input.bookingId, input.reviewerId);
    if (existingReview) {
      throw new Error('You have already reviewed this booking');
    }

    // 3. Get reviewer and reviewed user details
    const reviewerRef = doc(db, 'users', input.reviewerId);
    const reviewedUserRef = doc(db, 'users', input.reviewedUserId);
    const [reviewerSnap, reviewedUserSnap] = await Promise.all([
      getDoc(reviewerRef),
      getDoc(reviewedUserRef),
    ]);

    const reviewer = reviewerSnap.data();
    const reviewedUser = reviewedUserSnap.data();

    // 4. Create review
    const reviewData = {
      ...input,
      reviewerName: reviewer?.displayName || 'Anonymous',
      reviewerAvatar: reviewer?.photoURL,
      reviewedUserName: reviewedUser?.displayName || 'User',
      verified: true,
      reported: false,
      helpfulCount: 0,
      helpfulVoters: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const reviewRef = await addDoc(collection(db, REVIEWS_COLLECTION), reviewData);

    // 5. Update review stats
    await updateReviewStats(input.reviewedUserId);

    // 6. Send notification to reviewed user
    try {
      const taskRef = doc(db, 'tasks', input.taskId);
      const taskSnap = await getDoc(taskRef);
      const taskTitle = taskSnap.exists() ? taskSnap.data().title : 'Unknown Task';

      await notifyNewReview(
        input.reviewedUserId,
        input.reviewerId,
        reviewer?.displayName || 'Anonymous',
        input.rating,
        taskTitle,
        reviewRef.id
      );
    } catch (notifError) {
      // Don't fail the review creation if notification fails
      console.error('Error sending review notification:', notifError);
    }

    return reviewRef.id;
  } catch (error) {
    console.error('Error creating review:', error);
    throw error;
  }
}

/**
 * Update an existing review
 */
export async function updateReview(
  reviewId: string,
  userId: string,
  updates: UpdateReviewInput
): Promise<void> {
  try {
    const reviewRef = doc(db, REVIEWS_COLLECTION, reviewId);
    const reviewSnap = await getDoc(reviewRef);

    if (!reviewSnap.exists()) {
      throw new Error('Review not found');
    }

    const review = reviewSnap.data();
    if (review.reviewerId !== userId) {
      throw new Error('Unauthorized: You can only update your own reviews');
    }

    await updateDoc(reviewRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });

    // Recalculate stats
    await updateReviewStats(review.reviewedUserId);
  } catch (error) {
    console.error('Error updating review:', error);
    throw error;
  }
}

/**
 * Respond to a review (providers only)
 */
export async function respondToReview(input: RespondToReviewInput): Promise<void> {
  try {
    const reviewRef = doc(db, REVIEWS_COLLECTION, input.reviewId);
    const reviewSnap = await getDoc(reviewRef);

    if (!reviewSnap.exists()) {
      throw new Error('Review not found');
    }

    const review = reviewSnap.data();
    if (review.reviewedUserId !== input.providerId) {
      throw new Error('Unauthorized: You can only respond to reviews about you');
    }

    if (review.type !== 'client_to_provider') {
      throw new Error('Only providers can respond to reviews');
    }

    await updateDoc(reviewRef, {
      response: {
        text: input.responseText,
        respondedAt: serverTimestamp(),
      },
      updatedAt: serverTimestamp(),
    });

    // Update response rate in stats
    await updateReviewStats(input.providerId);
  } catch (error) {
    console.error('Error responding to review:', error);
    throw error;
  }
}

// ============================================================================
// READ REVIEWS
// ============================================================================

/**
 * Get reviews for a user
 */
export async function getUserReviews(
  userId: string,
  filters?: ReviewFilters
): Promise<Review[]> {
  try {
    let q = query(
      collection(db, REVIEWS_COLLECTION),
      where('reviewedUserId', '==', userId)
    );

    // Apply filters
    if (filters?.rating) {
      q = query(q, where('rating', '==', filters.rating));
    }

    if (filters?.verified !== undefined) {
      q = query(q, where('verified', '==', filters.verified));
    }

    if (filters?.hasPhotos) {
      q = query(q, where('photos', '!=', null));
    }

    if (filters?.hasResponse) {
      q = query(q, where('response', '!=', null));
    }

    // Sorting
    if (filters?.sortBy === 'recent') {
      q = query(q, orderBy('createdAt', 'desc'));
    } else if (filters?.sortBy === 'highest') {
      q = query(q, orderBy('rating', 'desc'));
    } else if (filters?.sortBy === 'lowest') {
      q = query(q, orderBy('rating', 'asc'));
    } else if (filters?.sortBy === 'helpful') {
      q = query(q, orderBy('helpfulCount', 'desc'));
    }

    // Limit
    if (filters?.limit) {
      q = query(q, firestoreLimit(filters.limit));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data(),
      createdAt: docSnap.data().createdAt?.toDate() || new Date(),
      updatedAt: docSnap.data().updatedAt?.toDate() || new Date(),
      response: docSnap.data().response
        ? {
          ...docSnap.data().response,
          respondedAt: docSnap.data().response.respondedAt?.toDate(),
        }
        : undefined,
    })) as Review[];
  } catch (error) {
    console.error('Error getting user reviews:', error);
    throw error;
  }
}

/**
 * Get review stats for a user
 */
export async function getReviewStats(userId: string): Promise<ReviewStats | null> {
  try {
    const statsRef = doc(db, REVIEW_STATS_COLLECTION, userId);
    const statsSnap = await getDoc(statsRef);

    if (!statsSnap.exists()) {
      return null;
    }

    const data = statsSnap.data();
    return {
      ...data,
      lastReviewAt: data.lastReviewAt?.toDate(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as ReviewStats;
  } catch (error) {
    console.error('Error getting review stats:', error);
    throw error;
  }
}

/**
 * Get review summary for a user
 */
export async function getReviewSummary(userId: string): Promise<ReviewSummary> {
  try {
    const [stats, recentReviews] = await Promise.all([
      getReviewStats(userId),
      getUserReviews(userId, { sortBy: 'recent', limit: 5 }),
    ]);

    if (!stats) {
      return {
        totalCount: 0,
        averageRating: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        responseRate: 0,
        verifiedPercentage: 0,
        recentReviews: [],
      };
    }

    const verifiedCount = recentReviews.filter(r => r.verified).length;
    const verifiedPercentage = recentReviews.length > 0
      ? (verifiedCount / recentReviews.length) * 100
      : 0;

    return {
      totalCount: stats.totalReviews,
      averageRating: stats.averageRating,
      ratingDistribution: stats.ratingDistribution,
      responseRate: stats.responseRate || 0,
      verifiedPercentage,
      recentReviews,
    };
  } catch (error) {
    console.error('Error getting review summary:', error);
    throw error;
  }
}

// ============================================================================
// STATS & BADGES
// ============================================================================

/**
 * Update review stats for a user
 */
export async function updateReviewStats(userId: string): Promise<void> {
  try {
    const reviews = await getUserReviews(userId);

    if (reviews.length === 0) {
      return;
    }

    // Calculate average rating
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalRating / reviews.length;

    // Calculate rating distribution
    const ratingDistribution = {
      1: reviews.filter(r => r.rating === 1).length,
      2: reviews.filter(r => r.rating === 2).length,
      3: reviews.filter(r => r.rating === 3).length,
      4: reviews.filter(r => r.rating === 4).length,
      5: reviews.filter(r => r.rating === 5).length,
    };

    // Calculate detailed averages
    const detailedAverages = {
      communication: calculateDetailedAverage(reviews, 'communication'),
      quality: calculateDetailedAverage(reviews, 'quality'),
      professionalism: calculateDetailedAverage(reviews, 'professionalism'),
      timeliness: calculateDetailedAverage(reviews, 'timeliness'),
      valueForMoney: calculateDetailedAverage(reviews, 'valueForMoney'),
    };

    // Calculate response rate (for providers)
    const reviewsWithResponse = reviews.filter(r => r.response).length;
    const responseRate = (reviewsWithResponse / reviews.length) * 100;

    // Get user type
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    const userType = userSnap.data()?.accountType === 'provider' ? 'provider' : 'client';

    // Calculate badges
    const statsData: ReviewStats = {
      userId,
      userType,
      totalReviews: reviews.length,
      averageRating,
      ratingDistribution,
      detailedAverages,
      responseRate: userType === 'provider' ? responseRate : undefined,
      badges: [],
      lastReviewAt: reviews[0].createdAt,
      updatedAt: new Date(),
    };

    const badges = calculateBadges(statsData, userType);
    statsData.badges = badges;

    // Update Firestore
    const statsRef = doc(db, REVIEW_STATS_COLLECTION, userId);
    await updateDoc(statsRef, {
      ...statsData,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating review stats:', error);
    throw error;
  }
}

function calculateDetailedAverage(reviews: Review[], key: keyof NonNullable<Review['detailedRatings']>): number {
  const ratingsWithKey = reviews.filter(r => r.detailedRatings?.[key]);
  if (ratingsWithKey.length === 0) return 0;

  const sum = ratingsWithKey.reduce((acc, r) => acc + (r.detailedRatings![key] || 0), 0);
  return sum / ratingsWithKey.length;
}

/**
 * Calculate quality badges for a user
 */
export function calculateBadges(stats: ReviewStats, userType: 'provider' | 'client'): QualityBadge[] {
  const badges: QualityBadge[] = [];
  const now = new Date();

  if (userType === 'provider') {
    // Top Rated: 4.8+ average, 10+ reviews
    if (stats.averageRating >= 4.8 && stats.totalReviews >= 10) {
      badges.push({ type: 'top_rated', earnedAt: now, active: true });
    }

    // Excellent Service: 4.5+ average, 20+ reviews
    if (stats.averageRating >= 4.5 && stats.totalReviews >= 20) {
      badges.push({ type: 'excellent_service', earnedAt: now, active: true });
    }

    // Responsive: 90%+ response rate
    if (stats.responseRate && stats.responseRate >= 90) {
      badges.push({ type: 'responsive', earnedAt: now, active: true });
    }

    // Rising Star: New provider, 5+ reviews, 4.5+ avg
    if (stats.totalReviews >= 5 && stats.totalReviews < 20 && stats.averageRating >= 4.5) {
      badges.push({ type: 'rising_star', earnedAt: now, active: true });
    }

    // Great Communicator: 4.8+ communication rating
    if (stats.detailedAverages?.communication && stats.detailedAverages.communication >= 4.8) {
      badges.push({ type: 'great_communicator', earnedAt: now, active: true });
    }

    // Punctual: 4.8+ timeliness rating
    if (stats.detailedAverages?.timeliness && stats.detailedAverages.timeliness >= 4.8) {
      badges.push({ type: 'punctual', earnedAt: now, active: true });
    }

    // Value Champion: 4.8+ value rating
    if (stats.detailedAverages?.valueForMoney && stats.detailedAverages.valueForMoney >= 4.8) {
      badges.push({ type: 'value_champion', earnedAt: now, active: true });
    }
  }

  return badges;
}

// ============================================================================
// MODERATION
// ============================================================================

/**
 * Report a review
 */
export async function reportReview(input: ReportReviewInput): Promise<void> {
  try {
    const reviewRef = doc(db, REVIEWS_COLLECTION, input.reviewId);
    const reviewSnap = await getDoc(reviewRef);

    if (!reviewSnap.exists()) {
      throw new Error('Review not found');
    }

    // Update review with report
    await updateDoc(reviewRef, {
      reported: true,
      'moderation.reportCount': increment(1),
      'moderation.lastReportedAt': serverTimestamp(),
      'moderation.status': 'pending',
      updatedAt: serverTimestamp(),
    });

    // Add report document to subcollection
    const reportsCollection = collection(db, REVIEWS_COLLECTION, input.reviewId, 'reports');
    await addDoc(reportsCollection, {
      reporterId: input.reporterId,
      reason: input.reason,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error reporting review:', error);
    throw error;
  }
}

/**
 * Mark a review as helpful
 * Increments helpfulCount and adds userId to helpfulVoters array
 */
export async function markReviewHelpful(reviewId: string, userId: string): Promise<void> {
  try {
    const reviewRef = doc(db, REVIEWS_COLLECTION, reviewId);
    const reviewSnap = await getDoc(reviewRef);

    if (!reviewSnap.exists()) {
      throw new Error('Review not found');
    }

    const review = reviewSnap.data() as Review;
    const helpfulVoters = review.helpfulVoters || [];

    // Check if user already voted
    if (helpfulVoters.includes(userId)) {
      throw new Error('You have already marked this review as helpful');
    }

    // Add user to voters and increment count
    await updateDoc(reviewRef, {
      helpfulCount: increment(1),
      helpfulVoters: [...helpfulVoters, userId],
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error marking review as helpful:', error);
    throw error;
  }
}

/**
 * Unmark a review as helpful (remove vote)
 * Decrements helpfulCount and removes userId from helpfulVoters array
 */
export async function unmarkReviewHelpful(reviewId: string, userId: string): Promise<void> {
  try {
    const reviewRef = doc(db, REVIEWS_COLLECTION, reviewId);
    const reviewSnap = await getDoc(reviewRef);

    if (!reviewSnap.exists()) {
      throw new Error('Review not found');
    }

    const review = reviewSnap.data() as Review;
    const helpfulVoters = review.helpfulVoters || [];

    // Check if user has voted
    if (!helpfulVoters.includes(userId)) {
      throw new Error('You have not marked this review as helpful');
    }

    // Remove user from voters and decrement count
    const updatedVoters = helpfulVoters.filter((id) => id !== userId);
    await updateDoc(reviewRef, {
      helpfulCount: increment(-1),
      helpfulVoters: updatedVoters,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error unmarking review as helpful:', error);
    throw error;
  }
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Check if user has already reviewed a booking
 */
export async function hasUserReviewed(bookingId: string, userId: string): Promise<boolean> {
  try {
    const q = query(
      collection(db, REVIEWS_COLLECTION),
      where('bookingId', '==', bookingId),
      where('reviewerId', '==', userId)
    );

    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error('Error checking if user reviewed:', error);
    return false;
  }
}

/**
 * Check if user can review a booking
 */
export async function canUserReview(bookingId: string, userId: string): Promise<boolean> {
  try {
    // Check if booking is completed
    const bookingRef = doc(db, 'bookings', bookingId);
    const bookingSnap = await getDoc(bookingRef);

    if (!bookingSnap.exists()) {
      return false;
    }

    const booking = bookingSnap.data();
    if (booking.status !== 'completed') {
      return false;
    }

    // Check if user is part of the booking
    if (booking.clientId !== userId && booking.providerId !== userId) {
      return false;
    }

    // Check if already reviewed
    const alreadyReviewed = await hasUserReviewed(bookingId, userId);
    return !alreadyReviewed;
  } catch (error) {
    console.error('Error checking if user can review:', error);
    return false;
  }
}

// ============================================================================
// MODERATION
// ============================================================================

/**
 * Approve a reported review (admin only)
 */
export async function approveReview(reviewId: string, adminId: string, note?: string): Promise<void> {
  try {
    const reviewRef = doc(db, REVIEWS_COLLECTION, reviewId);

    await updateDoc(reviewRef, {
      'moderation.status': 'approved',
      'moderation.reviewedBy': adminId,
      'moderation.reviewedAt': serverTimestamp(),
      'moderation.note': note || '',
      reported: false, // Clear reported flag
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error approving review:', error);
    throw error;
  }
}

/**
 * Remove a review (admin only)
 */
export async function removeReview(reviewId: string, adminId: string, reason: string): Promise<void> {
  try {
    const reviewRef = doc(db, REVIEWS_COLLECTION, reviewId);

    await updateDoc(reviewRef, {
      'moderation.status': 'removed',
      'moderation.reviewedBy': adminId,
      'moderation.reviewedAt': serverTimestamp(),
      'moderation.reason': reason,
      status: 'removed', // Mark review as removed
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error removing review:', error);
    throw error;
  }
}

/**
 * Dismiss a report (admin only)
 */
export async function dismissReport(reviewId: string, adminId: string, note?: string): Promise<void> {
  try {
    const reviewRef = doc(db, REVIEWS_COLLECTION, reviewId);

    await updateDoc(reviewRef, {
      'moderation.status': 'dismissed',
      'moderation.reviewedBy': adminId,
      'moderation.reviewedAt': serverTimestamp(),
      'moderation.note': note || '',
      reported: false, // Clear reported flag but keep report count
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error dismissing report:', error);
    throw error;
  }
}

/**
 * Get reported reviews (admin only)
 */
export async function getReportedReviews(status?: 'pending' | 'approved' | 'removed' | 'dismissed'): Promise<Review[]> {
  try {
    let q = query(
      collection(db, REVIEWS_COLLECTION),
      where('reported', '==', true),
      orderBy('moderation.lastReportedAt', 'desc')
    );

    if (status) {
      q = query(
        collection(db, REVIEWS_COLLECTION),
        where('moderation.status', '==', status),
        orderBy('moderation.reviewedAt', 'desc')
      );
    }

    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Review[];
  } catch (error) {
    console.error('Error getting reported reviews:', error);
    throw error;
  }
}

/**
 * Get moderation statistics (admin only)
 */
export async function getModerationStats(): Promise<{
  totalReports: number;
  pendingReports: number;
  approvedReviews: number;
  removedReviews: number;
  dismissedReports: number;
}> {
  try {
    const [pending, approved, removed, dismissed] = await Promise.all([
      getDocs(query(
        collection(db, REVIEWS_COLLECTION),
        where('reported', '==', true),
        where('moderation.status', '==', 'pending')
      )),
      getDocs(query(
        collection(db, REVIEWS_COLLECTION),
        where('moderation.status', '==', 'approved')
      )),
      getDocs(query(
        collection(db, REVIEWS_COLLECTION),
        where('moderation.status', '==', 'removed')
      )),
      getDocs(query(
        collection(db, REVIEWS_COLLECTION),
        where('moderation.status', '==', 'dismissed')
      )),
    ]);

    return {
      totalReports: pending.size + approved.size + removed.size + dismissed.size,
      pendingReports: pending.size,
      approvedReviews: approved.size,
      removedReviews: removed.size,
      dismissedReports: dismissed.size,
    };
  } catch (error) {
    console.error('Error getting moderation stats:', error);
    return {
      totalReports: 0,
      pendingReports: 0,
      approvedReviews: 0,
      removedReviews: 0,
      dismissedReports: 0,
    };
  }
}
