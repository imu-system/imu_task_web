/**
 * LiveIndicator Component
 * 
 * Phase 9: Option G - Analytics Temps Réel
 * 
 * Displays real-time update status with:
 * - Green pulsing dot
 * - "En direct" / "Live" badge
 * - Relative time since last update ("il y a 2min")
 * 
 * Usage:
 * ```tsx
 * <LiveIndicator lastUpdate={new Date()} />
 * ```
 */

'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { formatRelativeTime } from '@/hooks/use-live-updates';

// ========================================
// TYPES
// ========================================

interface LiveIndicatorProps {
    lastUpdate: Date | null;
    className?: string;
    showDot?: boolean; // Show pulsing green dot
    showBadge?: boolean; // Show "Live" badge
    showTime?: boolean; // Show relative time
}

// ========================================
// COMPONENT
// ========================================

export function LiveIndicator({
    lastUpdate,
    className = '',
    showDot = true,
    showBadge = true,
    showTime = true
}: LiveIndicatorProps) {
    const t = useTranslations('Dashboard.live');
    const [relativeTime, setRelativeTime] = useState<string>('');

    // Update relative time every 10 seconds
    useEffect(() => {
        if (!lastUpdate) {
            setRelativeTime('');
            return;
        }

        const updateTime = () => {
            const time = formatRelativeTime(lastUpdate, 'fr'); // TODO: Get locale from context
            setRelativeTime(time);
        };

        // Initial update
        updateTime();

        // Update every 10 seconds
        const interval = setInterval(updateTime, 10000);

        return () => clearInterval(interval);
    }, [lastUpdate]);

    if (!lastUpdate) {
        return null;
    }

    return (
        <div className={`flex items-center gap-2 text-sm ${className}`}>
            {/* Pulsing green dot */}
            {showDot && (
                <div className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </div>
            )}

            {/* "Live" badge */}
            {showBadge && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    {t('indicator')}
                </span>
            )}

            {/* Relative time */}
            {showTime && relativeTime && (
                <span className="text-muted-foreground">
                    {t('updated', { time: relativeTime })}
                </span>
            )}
        </div>
    );
}

// ========================================
// COMPACT VARIANT
// ========================================

/**
 * Compact version - just dot + time
 */
export function LiveIndicatorCompact({
    lastUpdate,
    className = ''
}: Pick<LiveIndicatorProps, 'lastUpdate' | 'className'>) {
    return (
        <LiveIndicator
            lastUpdate={lastUpdate}
            className={className}
            showDot={true}
            showBadge={false}
            showTime={true}
        />
    );
}

// ========================================
// DOT ONLY VARIANT
// ========================================

/**
 * Dot only - minimal indicator
 */
export function LiveDot({
    lastUpdate,
    className = ''
}: Pick<LiveIndicatorProps, 'lastUpdate' | 'className'>) {
    if (!lastUpdate) return null;

    return (
        <div className={`relative flex h-2 w-2 ${className}`}>
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </div>
    );
}
