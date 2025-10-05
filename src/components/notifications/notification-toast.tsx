// src/components/notifications/notification-toast.tsx
/**
 * Notification Toast Provider
 * Manages toast queue with auto-dismiss based on priority
 */

'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useNotificationManager } from '@/hooks/use-notification-manager';
import { useToast } from '@/hooks/use-toast';
import { Notification, NotificationPriority } from '@/lib/types/notifications';
import { 
    MessageSquare, 
    FileText, 
    Calendar, 
    Star, 
    DollarSign, 
    User, 
    Info,
    CheckCircle,
    XCircle,
    AlertCircle,
    Bell
} from 'lucide-react';

// Toast duration based on priority (ms)
const TOAST_DURATION: Record<NotificationPriority, number> = {
    [NotificationPriority.LOW]: 3000,
    [NotificationPriority.NORMAL]: 5000,
    [NotificationPriority.HIGH]: 0, // persistent (requires manual dismiss)
};

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

// Variant mapping by priority
const getToastVariant = (priority: NotificationPriority): 'default' | 'destructive' => {
    return priority === NotificationPriority.HIGH ? 'destructive' : 'default';
};

interface NotificationToastProviderProps {
    children: React.ReactNode;
    maxToasts?: number;
}

export function NotificationToastProvider({ 
    children,
    maxToasts = 3
}: NotificationToastProviderProps) {
    const { newNotifications, markAsShown } = useNotificationManager();
    const { toast } = useToast();
    const shownNotificationsRef = useRef<Set<string>>(new Set());

    const showToast = useCallback((notification: Notification) => {
        // Prevent duplicate toasts
        if (shownNotificationsRef.current.has(notification.id)) {
            return;
        }

        const Icon = getNotificationIcon(notification.type);
        const duration = TOAST_DURATION[notification.priority];

        toast({
            variant: getToastVariant(notification.priority),
            duration,
            title: notification.title,
            description: (
                <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span>{notification.body}</span>
                </div>
            ),
            action: notification.actionUrl ? (
                <a 
                    href={notification.actionUrl}
                    className="text-sm font-medium underline underline-offset-4"
                >
                    View
                </a>
            ) : undefined,
        });

        // Mark as shown
        shownNotificationsRef.current.add(notification.id);
        markAsShown(notification.id);
    }, [toast, markAsShown]);

    useEffect(() => {
        // Show toasts for new notifications (limit to maxToasts)
        const toShow = newNotifications
            .filter(n => !n.shown && !shownNotificationsRef.current.has(n.id))
            .slice(0, maxToasts);

        toShow.forEach(notification => {
            showToast(notification);
        });
    }, [newNotifications, maxToasts, showToast]);

    return <>{children}</>;
}
