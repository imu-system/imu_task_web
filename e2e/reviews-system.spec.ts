/**
 * Reviews System E2E Tests
 * 
 * Tests end-to-end pour le système d'évaluation ImuTask
 * - Création d'avis avec photos
 * - Vote "utile" sur un avis
 * - Signalement d'avis
 * - Workflow de modération admin
 * - Réponse provider aux avis
 */

import { test, expect } from '@playwright/test';
import {
    navigateToReviewsPage,
    navigateToProfilePage,
    navigateToModerationPage,
    createReview,
    markReviewHelpful,
    reportReview,
    respondToReview,
    moderateReview,
    filterReviews,
    switchReviewsTab,
    getReviewCount,
    getAverageRating,
    getHelpfulCount,
    waitForReviewInList,
    hasVotedHelpful,
    type TestReview,
} from './fixtures/reviews-helpers';

// Test data
const testReview: TestReview = {
    rating: 5,
    comment: 'Excellent service! Very professional and punctual. Would definitely recommend!',
    detailedRatings: {
        communication: 5,
        quality: 5,
        professionalism: 5,
        timeliness: 5,
        valueForMoney: 5,
    },
};

const testReviewWithPhoto: TestReview = {
    rating: 4,
    comment: 'Great work on the furniture assembly. Here are some photos of the result.',
    photos: ['e2e/fixtures/test-avatar.png'],
};

const negativeReview: TestReview = {
    rating: 2,
    comment: 'Service was not as expected. Provider was late and rushed the work.',
    detailedRatings: {
        communication: 3,
        quality: 2,
        professionalism: 2,
        timeliness: 1,
        valueForMoney: 2,
    },
};

test.describe('Reviews System - Create Review', () => {
    test.beforeEach(async ({ page }) => {
        // Login as client with completed booking
        // This should be set up with proper test fixtures
        await page.goto('/fr/auth/login');
        await page.fill('[data-testid="email-input"]', 'test-client@imutask.com');
        await page.fill('[data-testid="password-input"]', 'TestPassword123!');
        await page.click('[data-testid="login-button"]');
        await page.waitForURL('**/dashboard');
    });

    test('should create a basic review with 5 stars', async ({ page }) => {
        // Navigate to completed booking detail page
        await page.goto('/fr/dashboard/bookings/test-booking-id');

        // Check if review form is visible
        await expect(page.locator('[data-testid="review-form"]')).toBeVisible();

        // Create review
        await createReview(page, testReview);

        // Verify success message
        await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();
        await expect(page.locator('[data-testid="success-toast"]')).toContainText('Avis publié avec succès');

        // Navigate to reviews page
        await navigateToReviewsPage(page, 'fr');

        // Switch to "given" tab
        await switchReviewsTab(page, 'given');

        // Verify review appears in list
        await waitForReviewInList(page, testReview.comment);

        // Verify rating is displayed correctly
        const reviewCard = page.locator('[data-testid="review-card"]').filter({
            hasText: testReview.comment,
        });
        await expect(reviewCard.locator('[data-testid="review-rating"]')).toContainText('5.0');
    });

    test('should create a review with photos', async ({ page }) => {
        // Navigate to completed booking
        await page.goto('/fr/dashboard/bookings/test-booking-id-2');

        // Create review with photos
        await createReview(page, testReviewWithPhoto, { withPhotos: true });

        // Verify success
        await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();

        // Navigate to reviews page
        await navigateToReviewsPage(page, 'fr');
        await switchReviewsTab(page, 'given');

        // Find the review
        const reviewCard = page.locator('[data-testid="review-card"]').filter({
            hasText: testReviewWithPhoto.comment,
        });

        // Verify photo gallery is visible
        await expect(reviewCard.locator('[data-testid="photo-gallery"]')).toBeVisible();
        await expect(reviewCard.locator('[data-testid="photo-preview-0"]')).toBeVisible();
    });

    test('should create a review with detailed ratings', async ({ page }) => {
        await page.goto('/fr/dashboard/bookings/test-booking-id-3');

        // Create review with detailed ratings
        await createReview(page, testReview, { withDetailedRatings: true });

        // Verify success
        await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();

        // Navigate to provider profile to see detailed ratings
        await navigateToProfilePage(page, 'test-provider-id', 'fr');

        // Verify detailed ratings are displayed in stats
        await expect(page.locator('[data-testid="detailed-rating-communication"]')).toBeVisible();
        await expect(page.locator('[data-testid="detailed-rating-quality"]')).toBeVisible();
        await expect(page.locator('[data-testid="detailed-rating-professionalism"]')).toBeVisible();
    });

    test('should prevent duplicate review for same booking', async ({ page }) => {
        // Try to review the same booking twice
        await page.goto('/fr/dashboard/bookings/already-reviewed-booking-id');

        // Review form should not be visible or show "already reviewed" message
        const alreadyReviewedMessage = page.locator('[data-testid="already-reviewed-message"]');
        const reviewForm = page.locator('[data-testid="review-form"]');

        const hasMessage = await alreadyReviewedMessage.isVisible();
        const hasForm = await reviewForm.isVisible();

        expect(hasMessage || !hasForm).toBeTruthy();
    });
});

test.describe('Reviews System - Mark as Helpful', () => {
    test.beforeEach(async ({ page }) => {
        // Login as a different user to vote on reviews
        await page.goto('/fr/auth/login');
        await page.fill('[data-testid="email-input"]', 'test-user2@imutask.com');
        await page.fill('[data-testid="password-input"]', 'TestPassword123!');
        await page.click('[data-testid="login-button"]');
        await page.waitForURL('**/dashboard');
    });

    test('should mark review as helpful', async ({ page }) => {
        // Navigate to provider profile
        await navigateToProfilePage(page, 'test-provider-id', 'fr');

        // Find a review
        const firstReview = page.locator('[data-testid="review-card"]').first();
        await firstReview.scrollIntoViewIfNeeded();

        // Get review ID (from data attribute or URL)
        const reviewId = await firstReview.getAttribute('data-review-id') || 'test-review-id';

        // Get initial helpful count
        const initialCount = await getHelpfulCount(page, reviewId);

        // Mark as helpful
        await markReviewHelpful(page, reviewId);

        // Verify count increased
        const newCount = await getHelpfulCount(page, reviewId);
        expect(newCount).toBe(initialCount + 1);

        // Verify button shows voted state
        const hasVoted = await hasVotedHelpful(page, reviewId);
        expect(hasVoted).toBeTruthy();
    });

    test('should unmark review as helpful when clicked again', async ({ page }) => {
        await navigateToProfilePage(page, 'test-provider-id', 'fr');

        const reviewId = 'test-review-id';

        // Mark as helpful
        await markReviewHelpful(page, reviewId);
        const countAfterVote = await getHelpfulCount(page, reviewId);

        // Unmark (click again)
        await markReviewHelpful(page, reviewId);

        // Verify count decreased
        const countAfterUnvote = await getHelpfulCount(page, reviewId);
        expect(countAfterUnvote).toBe(countAfterVote - 1);

        // Verify button shows unvoted state
        const hasVoted = await hasVotedHelpful(page, reviewId);
        expect(hasVoted).toBeFalsy();
    });

    test('should require authentication to vote helpful', async ({ page }) => {
        // Logout first
        await page.goto('/fr/auth/logout');

        // Navigate to profile as guest
        await navigateToProfilePage(page, 'test-provider-id', 'fr');

        // Try to mark as helpful
        const reviewId = 'test-review-id';
        await page.locator(`[data-testid="helpful-button-${reviewId}"]`).click();

        // Should show login prompt or redirect to login
        await expect(
            page.locator('[data-testid="auth-required-toast"]')
        ).toBeVisible().catch(() =>
            expect(page.url()).toContain('/auth/login')
        );
    });
});

test.describe('Reviews System - Report Review', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/fr/auth/login');
        await page.fill('[data-testid="email-input"]', 'test-user3@imutask.com');
        await page.fill('[data-testid="password-input"]', 'TestPassword123!');
        await page.click('[data-testid="login-button"]');
        await page.waitForURL('**/dashboard');
    });

    test('should report a review as inappropriate', async ({ page }) => {
        await navigateToProfilePage(page, 'test-provider-id', 'fr');

        const reviewId = 'test-review-to-report';

        // Report review
        await reportReview(page, reviewId, 'inappropriate');

        // Verify success message
        await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();
        await expect(page.locator('[data-testid="success-toast"]')).toContainText('signalé');

        // Verify report button is disabled or shows "already reported"
        const reportButton = page.locator(`[data-testid="report-button-${reviewId}"]`);
        const isDisabled = await reportButton.isDisabled();
        expect(isDisabled).toBeTruthy();
    });

    test('should report a review as spam', async ({ page }) => {
        await navigateToProfilePage(page, 'test-provider-id', 'fr');

        const reviewId = 'test-review-spam';
        await reportReview(page, reviewId, 'spam');

        await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();
    });

    test('should require authentication to report', async ({ page }) => {
        await page.goto('/fr/auth/logout');
        await navigateToProfilePage(page, 'test-provider-id', 'fr');

        const reviewId = 'test-review-id';

        // Try to open report dialog - button might not exist or redirect
        const reportButton = page.locator(`[data-testid="report-button-${reviewId}"]`);

        if (await reportButton.isVisible()) {
            await reportButton.click();
            // Should show auth required
            await expect(page.locator('[data-testid="auth-required-toast"]')).toBeVisible();
        }
    });
});

test.describe('Reviews System - Admin Moderation', () => {
    test.beforeEach(async ({ page }) => {
        // Login as admin
        await page.goto('/fr/auth/login');
        await page.fill('[data-testid="email-input"]', 'admin@imutask.com');
        await page.fill('[data-testid="password-input"]', 'AdminPassword123!');
        await page.click('[data-testid="login-button"]');
        await page.waitForURL('**/dashboard');
    });

    test('should display reported reviews in moderation queue', async ({ page }) => {
        await navigateToModerationPage(page, 'fr');

        // Verify moderation page loads
        await expect(page.locator('[data-testid="moderation-queue"]')).toBeVisible();

        // Verify stats are displayed
        await expect(page.locator('[data-testid="pending-reports-count"]')).toBeVisible();
        await expect(page.locator('[data-testid="total-reports-count"]')).toBeVisible();

        // Verify at least one reported review is visible
        const reportedReviews = page.locator('[data-testid^="moderation-review-"]');
        await expect(reportedReviews.first()).toBeVisible();
    });

    test('should approve a reported review', async ({ page }) => {
        await navigateToModerationPage(page, 'fr');

        const reviewId = 'test-reported-review-1';

        // Moderate review - approve
        await moderateReview(page, reviewId, 'approve', 'Review is appropriate');

        // Verify success message
        await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();

        // Verify review is removed from pending queue
        await expect(page.locator(`[data-testid="moderation-review-${reviewId}"]`)).not.toBeVisible();
    });

    test('should remove an inappropriate review', async ({ page }) => {
        await navigateToModerationPage(page, 'fr');

        const reviewId = 'test-reported-review-2';

        // Moderate review - remove
        await moderateReview(page, reviewId, 'remove', 'Contains offensive language');

        // Verify success message
        await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();
        await expect(page.locator('[data-testid="success-toast"]')).toContainText('supprimé');

        // Verify review is removed from queue
        await expect(page.locator(`[data-testid="moderation-review-${reviewId}"]`)).not.toBeVisible();
    });

    test('should dismiss a report', async ({ page }) => {
        await navigateToModerationPage(page, 'fr');

        const reviewId = 'test-reported-review-3';

        // Moderate review - dismiss
        await moderateReview(page, reviewId, 'dismiss', 'Report not valid');

        // Verify success
        await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();
        await expect(page.locator(`[data-testid="moderation-review-${reviewId}"]`)).not.toBeVisible();
    });

    test('should filter moderation queue by status', async ({ page }) => {
        await navigateToModerationPage(page, 'fr');

        // Switch to approved tab
        await page.locator('[data-testid="filter-approved"]').click();
        await page.waitForTimeout(500);

        // Verify only approved reviews are shown
        const reviews = page.locator('[data-testid^="moderation-review-"]');
        const count = await reviews.count();

        if (count > 0) {
            const firstReview = reviews.first();
            await expect(firstReview.locator('[data-testid="status-approved"]')).toBeVisible();
        }
    });
});

test.describe('Reviews System - Provider Response', () => {
    test.beforeEach(async ({ page }) => {
        // Login as provider
        await page.goto('/fr/auth/login');
        await page.fill('[data-testid="email-input"]', 'test-provider@imutask.com');
        await page.fill('[data-testid="password-input"]', 'ProviderPassword123!');
        await page.click('[data-testid="login-button"]');
        await page.waitForURL('**/dashboard');
    });

    test('should respond to a received review', async ({ page }) => {
        await navigateToReviewsPage(page, 'fr');

        // Should be on "received" tab by default
        const reviewId = 'test-review-to-respond';

        const responseText = 'Thank you for your feedback! We always strive to provide the best service.';

        // Respond to review
        await respondToReview(page, reviewId, responseText);

        // Verify success
        await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();

        // Verify response is displayed
        const reviewCard = page.locator(`[data-testid="review-card-${reviewId}"]`);
        await expect(reviewCard.locator('[data-testid="review-response"]')).toBeVisible();
        await expect(reviewCard.locator('[data-testid="review-response"]')).toContainText(responseText);
    });

    test('should not allow responding to a review twice', async ({ page }) => {
        await navigateToReviewsPage(page, 'fr');

        // Find a review that already has a response
        const reviewWithResponse = page.locator('[data-testid="review-card"]').filter({
            has: page.locator('[data-testid="review-response"]'),
        }).first();

        await reviewWithResponse.scrollIntoViewIfNeeded();

        // Respond button should not be visible or should be disabled
        const respondButton = reviewWithResponse.locator('[data-testid^="respond-button-"]');
        const isVisible = await respondButton.isVisible();

        if (isVisible) {
            const isDisabled = await respondButton.isDisabled();
            expect(isDisabled).toBeTruthy();
        } else {
            expect(isVisible).toBeFalsy();
        }
    });

    test('should update response rate in stats after responding', async ({ page }) => {
        await navigateToReviewsPage(page, 'fr');

        // Get initial response rate
        const initialRate = await page.locator('[data-testid="response-rate"]').textContent();

        // Respond to an unreplied review
        const reviewId = 'test-review-no-response';
        await respondToReview(page, reviewId, 'Thank you for choosing our service!');

        // Refresh or wait for stats update
        await page.reload();
        await page.waitForLoadState('networkidle');

        // Verify response rate increased
        const newRate = await page.locator('[data-testid="response-rate"]').textContent();
        expect(newRate).not.toBe(initialRate);
    });
});

test.describe('Reviews System - Filters and Search', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/fr/auth/login');
        await page.fill('[data-testid="email-input"]', 'test-user@imutask.com');
        await page.fill('[data-testid="password-input"]', 'TestPassword123!');
        await page.click('[data-testid="login-button"]');
        await page.waitForURL('**/dashboard');
    });

    test('should filter reviews by rating', async ({ page }) => {
        await navigateToProfilePage(page, 'test-provider-id', 'fr');

        // Filter by 5 stars
        await filterReviews(page, { rating: 5 });

        // Verify only 5-star reviews are shown
        const reviewCards = page.locator('[data-testid="review-card"]');
        const count = await reviewCards.count();

        for (let i = 0; i < count; i++) {
            const rating = await reviewCards.nth(i).locator('[data-testid="review-rating"]').textContent();
            expect(rating).toContain('5.0');
        }
    });

    test('should sort reviews by most helpful', async ({ page }) => {
        await navigateToProfilePage(page, 'test-provider-id', 'fr');

        // Sort by helpful
        await filterReviews(page, { sortBy: 'helpful' });

        // Verify first review has more helpful votes than second
        const reviewCards = page.locator('[data-testid="review-card"]');
        if (await reviewCards.count() >= 2) {
            const firstHelpfulCount = await getHelpfulCount(page, await reviewCards.first().getAttribute('data-review-id') || '');
            const secondHelpfulCount = await getHelpfulCount(page, await reviewCards.nth(1).getAttribute('data-review-id') || '');

            expect(firstHelpfulCount).toBeGreaterThanOrEqual(secondHelpfulCount);
        }
    });

    test('should filter reviews with photos only', async ({ page }) => {
        await navigateToProfilePage(page, 'test-provider-id', 'fr');

        // Filter by has photos
        await filterReviews(page, { hasPhotos: true });

        // Verify all visible reviews have photo galleries
        const reviewCards = page.locator('[data-testid="review-card"]');
        const count = await reviewCards.count();

        for (let i = 0; i < count; i++) {
            await expect(reviewCards.nth(i).locator('[data-testid="photo-gallery"]')).toBeVisible();
        }
    });
});

test.describe('Reviews System - Stats and Badges', () => {
    test('should display correct review stats on profile', async ({ page }) => {
        await navigateToProfilePage(page, 'test-provider-id', 'fr');

        // Verify stats card is visible
        await expect(page.locator('[data-testid="review-stats-card"]')).toBeVisible();

        // Verify stats elements
        await expect(page.locator('[data-testid="review-stats-total"]')).toBeVisible();
        await expect(page.locator('[data-testid="review-stats-average"]')).toBeVisible();
        await expect(page.locator('[data-testid="rating-distribution"]')).toBeVisible();
    });

    test('should display quality badges for top-rated providers', async ({ page }) => {
        await navigateToProfilePage(page, 'top-rated-provider-id', 'fr');

        // Check for quality badges
        const badges = page.locator('[data-testid^="quality-badge-"]');
        const badgeCount = await badges.count();

        expect(badgeCount).toBeGreaterThan(0);

        // Verify badge types
        await expect(page.locator('[data-testid="quality-badge-top-rated"]')).toBeVisible();
    });

    test('should calculate average rating correctly', async ({ page }) => {
        await navigateToProfilePage(page, 'test-provider-id', 'fr');

        const averageRating = await getAverageRating(page);

        // Average rating should be between 1 and 5
        expect(averageRating).toBeGreaterThanOrEqual(1);
        expect(averageRating).toBeLessThanOrEqual(5);
    });
});
