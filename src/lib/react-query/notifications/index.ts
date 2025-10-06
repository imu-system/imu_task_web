/**
 * React Query Hooks for Notifications
 * 
 * Export all hooks for easy import
 */

// Query hooks
export {
    useNotifications,
    useInfiniteNotifications,
    useUnreadCount,
    notificationKeys,
} from './use-notifications';

// Mutation hooks
export {
    useMarkAsRead,
    useMarkAsUnread,
    useDismissNotification,
    useDeleteNotification,
    useMarkAllAsRead,
    useDeleteAllNotifications,
} from './use-notification-mutations';

// Monitoring hooks
export {
    useNotificationMetrics,
    useNotificationAnalytics,
} from './use-notification-metrics';

// Types
export type { UseNotificationsOptions } from './use-notifications';
