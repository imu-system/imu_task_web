import { getAnalytics, logEvent as firebaseLogEvent, isSupported } from 'firebase/analytics';
import { getApps } from 'firebase/app';

let analytics: ReturnType<typeof getAnalytics> | null = null;

if (typeof window !== 'undefined' && getApps().length > 0) {
    isSupported().then((supported) => {
        if (supported) {
            analytics = getAnalytics(getApps()[0]);
        }
    });
}

export function logEvent(eventName: string, params?: Record<string, any>) {
    if (!analytics) return;
    firebaseLogEvent(analytics, eventName, params);
}

// Notification events
export function logNotificationCreated(category: string, priority: string) {
    logEvent('notification_created', { category, priority });
}

export function logNotificationRead(notificationId: string, timeToRead: number) {
    logEvent('notification_read', { notification_id: notificationId, time_to_read: timeToRead });
}

export function logNotificationClicked(notificationId: string, actionUrl?: string) {
    logEvent('notification_clicked', { notification_id: notificationId, action_url: actionUrl });
}

export function logNotificationDismissed(notificationId: string) {
    logEvent('notification_dismissed', { notification_id: notificationId });
}

export function logNotificationDeleted(notificationId: string) {
    logEvent('notification_deleted', { notification_id: notificationId });
}

export function logNotificationBatchAction(action: string, count: number) {
    logEvent('notification_batch_action', { action, count });
}

export function logNotificationFilter(category?: string, unreadOnly?: boolean) {
    logEvent('notification_filter', { category, unread_only: unreadOnly });
}

export function logNotificationInfiniteScroll(page: number) {
    logEvent('notification_infinite_scroll', { page });
}

// Landing Page events - 3-Platform Strategy Tracking
export function logProfileCardClick(profileType: 'individual' | 'professional' | 'senior', source: 'card_cta') {
    logEvent('landing_profile_card_click', {
        profile_type: profileType,
        source,
        timestamp: new Date().toISOString()
    });
}

export function logCarelinkServiceClick(service: string, source: 'service_card' | 'main_cta') {
    logEvent('landing_carelink_click', {
        service,
        source,
        timestamp: new Date().toISOString()
    });
}

export function logHeaderServicesMenuClick(platform: 'imutask' | 'imupro' | 'carelink', device: 'desktop' | 'mobile') {
    logEvent('landing_header_services_click', {
        platform,
        device,
        timestamp: new Date().toISOString()
    });
}

export function logCategoryClick(categorySlug: string, categoryName: string, isAccessible: boolean) {
    logEvent('landing_category_click', {
        category_slug: categorySlug,
        category_name: categoryName,
        is_pmr_accessible: isAccessible,
        timestamp: new Date().toISOString()
    });
}

export function logLandingPageView(source?: string) {
    logEvent('landing_page_view', {
        source: source || 'direct',
        timestamp: new Date().toISOString()
    });
}

export function logSearchBarInteraction(action: 'focus' | 'search', query?: string) {
    logEvent('landing_search_interaction', {
        action,
        query_length: query?.length || 0,
        timestamp: new Date().toISOString()
    });
}
