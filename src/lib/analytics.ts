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

// Dashboard Search & Interaction Events
export function logDashboardSearch(accountType: string, query: string, resultsCount: number) {
    logEvent('dashboard_search', {
        account_type: accountType,
        query_length: query.length,
        results_count: resultsCount,
        timestamp: new Date().toISOString()
    });
}

export function logQuickActionClick(accountType: string, actionId: string, actionLabel: string) {
    logEvent('dashboard_quick_action', {
        account_type: accountType,
        action_id: actionId,
        action_label: actionLabel,
        timestamp: new Date().toISOString()
    });
}

export function logKpiCardClick(accountType: string, kpiType: string, value: number) {
    logEvent('dashboard_kpi_click', {
        account_type: accountType,
        kpi_type: kpiType,
        kpi_value: value,
        timestamp: new Date().toISOString()
    });
}

export function logTaskCardAction(action: 'view' | 'edit' | 'delete', taskId: string, taskStatus: string) {
    logEvent('dashboard_task_action', {
        action,
        task_id: taskId,
        task_status: taskStatus,
        timestamp: new Date().toISOString()
    });
}

export function logTabChange(accountType: string, fromTab: string, toTab: string) {
    logEvent('dashboard_tab_change', {
        account_type: accountType,
        from_tab: fromTab,
        to_tab: toTab,
        timestamp: new Date().toISOString()
    });
}

export function logSearchSuggestionClick(suggestionType: string, suggestionLabel: string) {
    logEvent('search_suggestion_click', {
        suggestion_type: suggestionType,
        suggestion_label: suggestionLabel,
        timestamp: new Date().toISOString()
    });
}

export function logDashboardPageView(accountType: string, userRole: string) {
    logEvent('dashboard_page_view', {
        account_type: accountType,
        user_role: userRole,
        timestamp: new Date().toISOString()
    });
}

export function logServiceCardClick(serviceId: string, serviceName: string, fromSection: string) {
    logEvent('service_card_click', {
        service_id: serviceId,
        service_name: serviceName,
        from_section: fromSection,
        timestamp: new Date().toISOString()
    });
}

export function logFavoriteToggle(action: 'add' | 'remove', providerId: string, providerName: string) {
    logEvent('favorite_toggle', {
        action,
        provider_id: providerId,
        provider_name: providerName,
        timestamp: new Date().toISOString()
    });
}

// Animation interaction events
export function logAnimatedElementInteraction(elementType: string, animationType: string, section: string) {
    logEvent('animated_element_interaction', {
        element_type: elementType,
        animation_type: animationType,
        section: section,
        timestamp: new Date().toISOString()
    });
}

export function logGlowCardClick(cardType: string, cardValue?: string | number) {
    logEvent('glow_card_click', {
        card_type: cardType,
        card_value: cardValue,
        timestamp: new Date().toISOString()
    });
}

export function logShimmerButtonClick(buttonLabel: string, buttonAction: string) {
    logEvent('shimmer_button_click', {
        button_label: buttonLabel,
        button_action: buttonAction,
        timestamp: new Date().toISOString()
    });
}

export function logGradientSectionView(sectionName: string, accountType: string) {
    logEvent('gradient_section_view', {
        section_name: sectionName,
        account_type: accountType,
        timestamp: new Date().toISOString()
    });
}

export function logVisualEffectPerformance(effectType: string, renderTime: number, deviceType: string) {
    logEvent('visual_effect_performance', {
        effect_type: effectType,
        render_time: renderTime,
        device_type: deviceType,
        timestamp: new Date().toISOString()
    });
}
