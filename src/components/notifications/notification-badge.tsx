// src/components/notifications/notification-badge.tsx
/**
 * Notification Badge Component
 * Displays notification count with customizable variants and positions
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface NotificationBadgeProps {
    count: number;
    variant?: 'dot' | 'count';
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
    animate?: boolean;
    className?: string;
    maxCount?: number;
}

export function NotificationBadge({
    count,
    variant = 'count',
    position = 'top-right',
    animate = true,
    className,
    maxCount = 99,
}: NotificationBadgeProps) {
    if (count === 0) return null;

    const positionClasses = {
        'top-right': '-top-1 -right-1',
        'top-left': '-top-1 -left-1',
        'bottom-right': '-bottom-1 -right-1',
        'bottom-left': '-bottom-1 -left-1',
    };

    const displayCount = count > maxCount ? `${maxCount}+` : count.toString();

    return (
        <Badge
            variant="destructive"
            className={cn(
                'absolute min-w-5 h-5 flex items-center justify-center p-0 text-[10px] rounded-full',
                'pointer-events-none select-none',
                positionClasses[position],
                animate && count > 0 && 'animate-pulse',
                variant === 'dot' && 'w-2 h-2 min-w-0 p-0',
                className
            )}
        >
            {variant === 'count' && displayCount}
        </Badge>
    );
}
