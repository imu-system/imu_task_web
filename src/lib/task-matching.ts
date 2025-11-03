/**
 * Task Matching Engine
 * 
 * Algorithme intelligent pour matcher les tâches avec les providers pertinents.
 * Prend en compte : compétences, distance, budget, préférences de notification.
 */

import { User } from './types';
import { Task } from './firestore-tasks';
import { calculateDistance } from './geolocation';

export interface ProviderPreferences {
    // Categories the provider wants to be notified about
    preferredCategories?: string[];

    // Maximum distance the provider is willing to travel (km)
    serviceRadiusKm?: number;

    // Budget range the provider prefers
    minBudget?: number;
    maxBudget?: number;

    // Notification settings
    notificationChannels?: ('in-app' | 'email' | 'push')[];

    // Time preferences (future feature)
    quietHoursStart?: string; // e.g., "22:00"
    quietHoursEnd?: string;   // e.g., "08:00"

    // Whether to receive notifications at all
    enableTaskNotifications?: boolean;
}

export interface MatchScore {
    providerId: string;
    score: number; // 0-100
    reasons: string[];
    distance?: number;
    matchDetails: {
        skillMatch: boolean;
        budgetMatch: boolean;
        distanceMatch: boolean;
        categoryMatch: boolean;
    };
}

/**
 * Calculate match score between a task and a provider
 * Returns a score from 0-100 indicating relevance
 */
export function calculateMatchScore(
    task: Task,
    provider: User,
    preferences?: ProviderPreferences
): MatchScore {
    let score = 0;
    const reasons: string[] = [];
    const matchDetails = {
        skillMatch: false,
        budgetMatch: false,
        distanceMatch: false,
        categoryMatch: false,
    };

    // 1. Skill/Category Match (40 points max)
    if (task.category && provider.profile?.skills?.includes(task.category)) {
        score += 40;
        matchDetails.skillMatch = true;
        reasons.push('Skill match');
    } else if (task.category && provider.profile?.professionalInfo?.categories?.includes(task.category)) {
        score += 35;
        matchDetails.skillMatch = true;
        reasons.push('Professional category match');
    }

    // 2. Category Preference Match (15 points max)
    if (preferences?.preferredCategories?.includes(task.category || '')) {
        score += 15;
        matchDetails.categoryMatch = true;
        reasons.push('Preferred category');
    }

    // 3. Budget Match (20 points max)
    if (task.budget) {
        const providerMinBudget = preferences?.minBudget ?? 0;
        const providerMaxBudget = preferences?.maxBudget ?? Infinity;

        if (task.budget >= providerMinBudget && task.budget <= providerMaxBudget) {
            score += 20;
            matchDetails.budgetMatch = true;
            reasons.push('Budget within range');
        } else if (task.budget >= providerMinBudget) {
            score += 10;
            reasons.push('Budget meets minimum');
        }
    }

    // 4. Distance Match (25 points max)
    let distance: number | undefined;
    if (task.adresse?.latitude && task.adresse?.longitude) {
        const providerLat = provider.profile?.city ? undefined : undefined; // TODO: Add provider location to profile
        const providerLng = providerLat;

        if (providerLat && providerLng) {
            distance = calculateDistance(
                providerLat,
                providerLng,
                task.adresse.latitude,
                task.adresse.longitude
            );

            const maxDistance = preferences?.serviceRadiusKm ?? provider.profile?.serviceRadiusKm ?? 50;

            if (distance <= maxDistance) {
                // Closer is better (linear scale)
                const distanceScore = Math.max(0, 25 - (distance / maxDistance) * 10);
                score += distanceScore;
                matchDetails.distanceMatch = true;
                reasons.push(`Within service radius (${distance.toFixed(1)}km)`);
            }
        }
    }

    return {
        providerId: provider.id,
        score: Math.round(score),
        reasons,
        distance,
        matchDetails,
    };
}

/**
 * Filter providers based on minimum match score
 */
export function filterProvidersByScore(
    matches: MatchScore[],
    minScore: number = 30
): MatchScore[] {
    return matches
        .filter(match => match.score >= minScore)
        .sort((a, b) => b.score - a.score);
}

/**
 * Get top N matching providers for a task
 */
export function getTopMatches(
    task: Task,
    providers: User[],
    preferences: Record<string, ProviderPreferences>,
    options: {
        minScore?: number;
        maxResults?: number;
    } = {}
): MatchScore[] {
    const matches = providers.map(provider =>
        calculateMatchScore(task, provider, preferences[provider.id])
    );

    const filtered = filterProvidersByScore(matches, options.minScore ?? 30);

    if (options.maxResults) {
        return filtered.slice(0, options.maxResults);
    }

    return filtered;
}

/**
 * Check if provider should receive notification based on preferences
 */
export function shouldNotifyProvider(
    match: MatchScore,
    preferences?: ProviderPreferences
): boolean {
    // Check if notifications are enabled
    if (preferences?.enableTaskNotifications === false) {
        return false;
    }

    // Check quiet hours (if implemented)
    // TODO: Implement quiet hours check

    // Only notify if score is above threshold
    return match.score >= 30;
}

/**
 * Format match reasons for notification message
 */
export function formatMatchReasons(match: MatchScore): string {
    if (match.reasons.length === 0) {
        return '';
    }

    if (match.reasons.length === 1) {
        return match.reasons[0];
    }

    if (match.reasons.length === 2) {
        return `${match.reasons[0]} and ${match.reasons[1]}`;
    }

    return `${match.reasons.slice(0, -1).join(', ')}, and ${match.reasons[match.reasons.length - 1]}`;
}
