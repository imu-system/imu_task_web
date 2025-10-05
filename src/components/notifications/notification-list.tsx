// src/components/notifications/notification-list.tsx
/**
 * Notification List Component
 * Displays a list of notifications with mark as read functionality
 */

'use client';

import { useTranslations } from 'next-intl';
import { Notification, NotificationCategory } from '@/lib/types/notifications';
import { NotificationItem } from './notification-item';
import { cn } from '@/lib/utils';

export interface NotificationListProps {
    notifications: Notification[];
    onMarkAsRead: (notificationId: string) => void;
    onDelete: (notificationId: string) => void;
    onNotificationClick?: (notification: Notification) => void;
    emptyMessage?: string;
    className?: string;
    loading?: boolean;
    locale?: 'fr' | 'en' | 'es' | 'de' | 'ja';
}

export function NotificationList({
    notifications,
    onMarkAsRead,
    onDelete,
    onNotificationClick,
    emptyMessage = 'No notifications',
    className,
    loading = false,
    locale = 'en',
}: NotificationListProps) {
    const t = useTranslations('notifications');
    
    if (loading) {
        return (
            <div className={cn('space-y-2', className)}>
                {Array.from({ length: 5 }).map((_, i) => (
                    <div
                        key={i}
                        className="flex items-start gap-3 p-4 rounded-lg border bg-card animate-pulse"
                    >
                        <div className="h-10 w-10 rounded-full bg-muted" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-muted rounded w-3/4" />
                            <div className="h-3 bg-muted rounded w-full" />
                            <div className="h-3 bg-muted rounded w-1/4" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (notifications.length === 0) {
        return (
            <div className={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
                <div className="rounded-full bg-muted p-6 mb-4">
                    <svg
                        className="h-10 w-10 text-muted-foreground"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                        />
                    </svg>
                </div>
                <p className="text-sm text-muted-foreground">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className={cn('space-y-2', className)}>
            {notifications.map((notification) => (
                <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={onMarkAsRead}
                    onDelete={onDelete}
                    onClick={onNotificationClick}
                    locale={locale}
                />
            ))}
        </div>
    );
}
