// src/components/notifications/notification-demo.tsx
/**
 * Notification Demo Component
 * Example integration showing all notification components together
 * USE THIS AS REFERENCE FOR PHASE 3 INTEGRATION
 */

'use client';

import { useState } from 'react';
import { useNotificationManager } from '@/hooks/use-notification-manager';
import { NotificationIconButton } from './notification-icon-button';
import { NotificationCenter } from './notification-center';
import { Button } from '@/components/ui/button';
import { createTestNotification } from '@/lib/test-notifications';
import { NotificationType } from '@/lib/types/notifications';

export function NotificationDemo() {
    const [centerOpen, setCenterOpen] = useState(false);
    const { totalUnreadCount, hasNewNotifications, loading } = useNotificationManager();

    const handleCreateTestNotification = async () => {
        const userId = 'demo-user-id'; // Replace with actual user ID from auth
        await createTestNotification(userId, NotificationType.NEW_MESSAGE);
        console.log('✅ Test notification created!');
    };

    return (
        <div className="flex items-center gap-4">
            {/* Test Button - Remove in production */}
            <Button
                variant="outline"
                onClick={handleCreateTestNotification}
                disabled={loading}
            >
                Create Test Notification
            </Button>

            {/* Notification Icon Button - Add to header */}
            <NotificationIconButton
                unreadCount={totalUnreadCount}
                onClick={() => setCenterOpen(true)}
                hasNew={hasNewNotifications}
                disabled={loading}
            />

            {/* Notification Center - Sheet/Drawer */}
            <NotificationCenter
                open={centerOpen}
                onOpenChange={setCenterOpen}
                locale="en" // or "fr", "es", "de", "ja"
            />
        </div>
    );
}
