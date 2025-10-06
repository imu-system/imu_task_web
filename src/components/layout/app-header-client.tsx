// src/components/layout/app-header-client.tsx
/**
 * Client Component for App Header with Notifications
 * Used in locale layout to show notification icon and center
 */

'use client';

import { useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NotificationIconButton, NotificationCenter } from '@/components/notifications';
import { useNotificationManager } from '@/hooks/use-notification-manager';
import { useAuth } from '@/contexts/AuthContext';

interface AppHeaderClientProps {
    locale?: 'fr' | 'en' | 'es' | 'de' | 'ja';
}

export function AppHeaderClient({ locale = 'en' }: AppHeaderClientProps) {
    const [centerOpen, setCenterOpen] = useState(false);
    const { user } = useAuth();
    const { totalUnreadCount, hasNewNotifications, loading } = useNotificationManager();

    // If user not logged in, show simple bell icon
    if (!user) {
        return (
            <Button variant="ghost" size="icon" className="rounded-full">
                <Bell className="h-5 w-5" />
                <span className="sr-only">Notifications</span>
            </Button>
        );
    }

    return (
        <>
            <NotificationIconButton
                unreadCount={totalUnreadCount}
                onClick={() => setCenterOpen(true)}
                hasNew={hasNewNotifications}
                disabled={loading}
            />

            <NotificationCenter
                open={centerOpen}
                onOpenChange={setCenterOpen}
                locale={locale}
            />
        </>
    );
}
