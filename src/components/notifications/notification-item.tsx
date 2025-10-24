// src/components/notifications/notification-item.tsx
/**
 * Notification Item Component
 * Individual notification display with actions
 */

'use client';

import { Notification } from '@/lib/types/notifications';
import { formatDistanceToNow } from 'date-fns';
import { fr, enUS, es, de, ja } from 'date-fns/locale';
import { 
    MessageSquare, 
    FileText, 
    Calendar, 
    Star, 
    DollarSign, 
    User, 
    Info,
    Bell,
    Trash2,
    Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const locales = { fr, en: enUS, es, de, ja };

// Icon mapping by notification type
const getNotificationIcon = (type: string) => {
    if (type.includes('MESSAGE')) return MessageSquare;
    if (type.includes('TASK')) return FileText;
    if (type.includes('PROPOSAL')) return FileText;
    if (type.includes('BOOKING')) return Calendar;
    if (type.includes('REVIEW')) return Star;
    if (type.includes('PAYMENT')) return DollarSign;
    if (type.includes('PROFILE')) return User;
    if (type.includes('SYSTEM')) return Info;
    return Bell;
};

export interface NotificationItemProps {
    notification: Notification;
    onMarkAsRead: (notificationId: string) => void;
    onDelete: (notificationId: string) => void;
    onClick?: (notification: Notification) => void;
    locale?: 'fr' | 'en' | 'es' | 'de' | 'ja';
}

export function NotificationItem({
    notification,
    onMarkAsRead,
    onDelete,
    onClick,
    locale = 'en',
}: NotificationItemProps) {
    const Icon = getNotificationIcon(notification.type);
    const timeAgo = formatDistanceToNow(notification.createdAt, {
        addSuffix: true,
        locale: locales[locale],
    });

    const handleClick = () => {
        if (!notification.read) {
            onMarkAsRead(notification.id);
        }
        if (onClick) {
            onClick(notification);
        } else if (notification.actionUrl) {
            window.location.href = notification.actionUrl;
        }
    };

    return (
        <div
            className={cn(
                'group relative flex items-start gap-3 p-4 rounded-2xl border transition-colors cursor-pointer',
                notification.read
                    ? 'bg-card hover:bg-accent'
                    : 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900 hover:bg-blue-100 dark:hover:bg-blue-950/30'
            )}
            onClick={handleClick}
        >
            {/* Icon */}
            <div
                className={cn(
                    'flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center',
                    notification.read
                        ? 'bg-muted'
                        : 'bg-blue-100 dark:bg-blue-900/50'
                )}
            >
                <Icon className={cn(
                    'h-5 w-5',
                    notification.read ? 'text-muted-foreground' : 'text-blue-600 dark:text-blue-400'
                )} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 space-y-1">
                <p className={cn(
                    'text-sm font-medium leading-tight',
                    !notification.read && 'text-foreground'
                )}>
                    {notification.title}
                </p>
                <p className="text-sm text-muted-foreground line-clamp-2">
                    {notification.body}
                </p>
                <p className="text-xs text-muted-foreground">
                    {timeAgo}
                </p>
            </div>

            {/* Actions */}
            <div className="flex-shrink-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {!notification.read && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                            e.stopPropagation();
                            onMarkAsRead(notification.id);
                        }}
                        aria-label="Mark as read"
                    >
                        <Eye className="h-4 w-4" />
                    </Button>
                )}
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(notification.id);
                    }}
                    aria-label="Delete"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>

            {/* Unread indicator */}
            {!notification.read && (
                <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400" />
            )}
        </div>
    );
}
