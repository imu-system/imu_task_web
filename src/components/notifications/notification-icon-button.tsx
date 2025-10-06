// src/components/notifications/notification-icon-button.tsx
/**
 * Notification Icon Button Component
 * Bell icon button with integrated badge counter
 */

'use client';

import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NotificationBadge } from './notification-badge';
import { cn } from '@/lib/utils';

export interface NotificationIconButtonProps {
    unreadCount: number;
    onClick: () => void;
    hasNew?: boolean;
    className?: string;
    disabled?: boolean;
}

export function NotificationIconButton({
    unreadCount,
    onClick,
    hasNew = false,
    className,
    disabled = false,
}: NotificationIconButtonProps) {
    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={onClick}
            disabled={disabled}
            className={cn(
                'relative',
                hasNew && 'animate-shake',
                className
            )}
            aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        >
            <Bell className="h-5 w-5" />
            <NotificationBadge 
                count={unreadCount} 
                variant="count"
                position="top-right"
                animate={hasNew}
            />
        </Button>
    );
}
