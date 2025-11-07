/**
 * Reviews E2E Test Helpers
 * 
 * Helper functions pour tester le système de reviews
 */

import { Page, expect } from '@playwright/test';

export interface TestReview {
    rating: 1 | 2 | 3 | 4 | 5;
    comment: string;
    detailedRatings?: {
        communication: number;
        quality: number;
        professionalism: number;
        timeliness: number;
        valueForMoney: number;
    };
    photos?: string[];
}

export interface TestBooking {
    id: string;
    taskTitle: string;
    providerId: string;
    providerName: string;
    clientId: string;
    clientName: string;
    status: 'completed';
}

/**
 * Navigate to user's reviews page
 */
export async function navigateToReviewsPage(page: Page, locale: string = 'fr') {
    await page.goto(`/${locale}/dashboard/reviews`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="reviews-page"]')).toBeVisible();
}

/**
 * Navigate to user's profile page
 */
export async function navigateToProfilePage(page: Page, userId: string, locale: string = 'fr') {
    await page.goto(`/${locale}/profile/${userId}`);
    await page.waitForLoadState('networkidle');
}

/**
 * Navigate to admin moderation page
 */
export async function navigateToModerationPage(page: Page, locale: string = 'fr') {
    await page.goto(`/${locale}/dashboard/admin/moderation/reports`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="moderation-page"]')).toBeVisible();
}

/**
 * Fill and submit a review form
 */
export async function createReview(
    page: Page,
    review: TestReview,
    options?: {
        withPhotos?: boolean;
        withDetailedRatings?: boolean;
    }
) {
    // Wait for review form to be visible
    await expect(page.locator('[data-testid="review-form"]')).toBeVisible();

    // Click on star rating
    await page.locator(`[data-testid="star-rating-${review.rating}"]`).click();

    // Fill comment
    await page.locator('[data-testid="review-comment"]').fill(review.comment);

    // Fill detailed ratings if provided
    if (options?.withDetailedRatings && review.detailedRatings) {
        for (const [key, value] of Object.entries(review.detailedRatings)) {
            await page.locator(`[data-testid="detailed-rating-${key}-${value}"]`).click();
        }
    }

    // Upload photos if requested
    if (options?.withPhotos && review.photos) {
        const fileInput = page.locator('[data-testid="photo-upload-input"]');
        await fileInput.setInputFiles(review.photos);

        // Wait for uploads to complete
        for (let i = 0; i < review.photos.length; i++) {
            await expect(page.locator(`[data-testid="photo-preview-${i}"]`)).toBeVisible();
        }
    }

    // Submit form
    await page.locator('[data-testid="submit-review-button"]').click();

    // Wait for success message or navigation
    await page.waitForTimeout(1000);
}

/**
 * Mark a review as helpful
 */
export async function markReviewHelpful(page: Page, reviewId: string) {
    const helpfulButton = page.locator(`[data-testid="helpful-button-${reviewId}"]`);
    await expect(helpfulButton).toBeVisible();
    await helpfulButton.click();

    // Wait for the vote to be registered
    await page.waitForTimeout(500);
}

/**
 * Report a review
 */
export async function reportReview(
    page: Page,
    reviewId: string,
    reason: 'inappropriate' | 'spam' | 'fake' | 'offensive' | 'other'
) {
    // Open report dialog
    await page.locator(`[data-testid="report-button-${reviewId}"]`).click();

    // Wait for report dialog
    await expect(page.locator('[data-testid="report-dialog"]')).toBeVisible();

    // Select reason
    await page.locator(`[data-testid="report-reason-${reason}"]`).click();

    // Submit report
    await page.locator('[data-testid="submit-report-button"]').click();

    // Wait for confirmation
    await page.waitForTimeout(500);
}

/**
 * Respond to a review (provider only)
 */
export async function respondToReview(page: Page, reviewId: string, responseText: string) {
    // Open response dialog
    await page.locator(`[data-testid="respond-button-${reviewId}"]`).click();

    // Wait for response dialog
    await expect(page.locator('[data-testid="response-dialog"]')).toBeVisible();

    // Fill response
    await page.locator('[data-testid="response-text"]').fill(responseText);

    // Submit response
    await page.locator('[data-testid="submit-response-button"]').click();

    // Wait for confirmation
    await page.waitForTimeout(500);
}

/**
 * Filter reviews on reviews page
 */
export async function filterReviews(
    page: Page,
    filters: {
        rating?: 1 | 2 | 3 | 4 | 5;
        sortBy?: 'recent' | 'highest' | 'lowest' | 'helpful';
        hasPhotos?: boolean;
        hasResponse?: boolean;
    }
) {
    // Open filter panel if needed
    const filterPanel = page.locator('[data-testid="review-filters"]');
    if (!(await filterPanel.isVisible())) {
        await page.locator('[data-testid="open-filters-button"]').click();
    }

    // Apply rating filter
    if (filters.rating) {
        await page.locator(`[data-testid="filter-rating-${filters.rating}"]`).click();
    }

    // Apply sort
    if (filters.sortBy) {
        await page.locator('[data-testid="sort-by"]').click();
        await page.locator(`[data-testid="sort-option-${filters.sortBy}"]`).click();
    }

    // Apply boolean filters
    if (filters.hasPhotos) {
        await page.locator('[data-testid="filter-has-photos"]').click();
    }

    if (filters.hasResponse) {
        await page.locator('[data-testid="filter-has-response"]').click();
    }

    // Apply filters
    await page.locator('[data-testid="apply-filters-button"]').click();

    // Wait for results
    await page.waitForTimeout(500);
}

/**
 * Moderate a review (admin only)
 */
export async function moderateReview(
    page: Page,
    reviewId: string,
    action: 'approve' | 'remove' | 'dismiss',
    note?: string
) {
    // Find the review in moderation queue
    const reviewCard = page.locator(`[data-testid="moderation-review-${reviewId}"]`);
    await expect(reviewCard).toBeVisible();

    // Click action button
    await page.locator(`[data-testid="moderate-${action}-${reviewId}"]`).click();

    // If remove action, fill reason
    if (action === 'remove' && note) {
        await page.locator('[data-testid="moderation-reason"]').fill(note);
    }

    // If approve or dismiss, fill optional note
    if ((action === 'approve' || action === 'dismiss') && note) {
        await page.locator('[data-testid="moderation-note"]').fill(note);
    }

    // Confirm action
    await page.locator('[data-testid="confirm-moderation-button"]').click();

    // Wait for action to complete
    await page.waitForTimeout(500);
}

/**
 * Get review count from stats card
 */
export async function getReviewCount(page: Page): Promise<number> {
    const statsCard = page.locator('[data-testid="review-stats-total"]');
    await expect(statsCard).toBeVisible();
    const text = await statsCard.textContent();
    return parseInt(text?.match(/\d+/)?.[0] || '0', 10);
}

/**
 * Get average rating from stats card
 */
export async function getAverageRating(page: Page): Promise<number> {
    const statsCard = page.locator('[data-testid="review-stats-average"]');
    await expect(statsCard).toBeVisible();
    const text = await statsCard.textContent();
    return parseFloat(text?.match(/[\d.]+/)?.[0] || '0');
}

/**
 * Wait for review to appear in list
 */
export async function waitForReviewInList(page: Page, comment: string) {
    const reviewCard = page.locator(`[data-testid="review-card"]`).filter({
        hasText: comment,
    });
    await expect(reviewCard).toBeVisible({ timeout: 5000 });
}

/**
 * Check if review has badge
 */
export async function hasReviewBadge(page: Page, reviewId: string, badgeType: string): Promise<boolean> {
    const badge = page.locator(`[data-testid="review-badge-${badgeType}-${reviewId}"]`);
    return badge.isVisible();
}

/**
 * Switch between received and given reviews tabs
 */
export async function switchReviewsTab(page: Page, tab: 'received' | 'given') {
    await page.locator(`[data-testid="reviews-tab-${tab}"]`).click();
    await page.waitForTimeout(500);
}

/**
 * Get helpful count for a review
 */
export async function getHelpfulCount(page: Page, reviewId: string): Promise<number> {
    const helpfulCount = page.locator(`[data-testid="helpful-count-${reviewId}"]`);
    const text = await helpfulCount.textContent();
    return parseInt(text?.match(/\d+/)?.[0] || '0', 10);
}

/**
 * Check if user has voted helpful on a review
 */
export async function hasVotedHelpful(page: Page, reviewId: string): Promise<boolean> {
    const button = page.locator(`[data-testid="helpful-button-${reviewId}"]`);
    const classes = await button.getAttribute('class');
    return classes?.includes('bg-primary') || false;
}
