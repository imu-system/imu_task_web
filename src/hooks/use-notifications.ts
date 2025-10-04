'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
    requestNotificationPermission,
    getFCMToken,
    onMessageListener,
    displayNotification,
    getNotificationPermission,
} from '@/lib/firebase-messaging';

export interface UseNotificationsReturn {
    permission: NotificationPermission;
    isSupported: boolean;
    requestPermission: () => Promise<boolean>;
    token: string | null;
}

export const useNotifications = (): UseNotificationsReturn => {
    const { user } = useAuth();
    const [permission, setPermission] = useState<NotificationPermission>('default');
    const [isSupported, setIsSupported] = useState(false);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        // Check if notifications are supported
        const supported = typeof window !== 'undefined' && 'Notification' in window;
        setIsSupported(supported);

        if (supported) {
            setPermission(getNotificationPermission());
        }
    }, []);

    useEffect(() => {
        if (!user?.uid || !isSupported || permission !== 'granted') {
            return;
        }

        // Get FCM token
        const initToken = async () => {
            const fcmToken = await getFCMToken(user.uid);
            setToken(fcmToken);
        };

        initToken();

        // Setup foreground message listener
        const unsubscribe = onMessageListener((payload) => {
            console.log('Foreground message received:', payload);

            // Display notification
            const title = payload.notification?.title || 'New Message';
            const body = payload.notification?.body || '';

            displayNotification(title, {
                body,
                tag: payload.data?.conversationId || 'message-notification',
                data: {
                    url: payload.data?.url || '/messages',
                    conversationId: payload.data?.conversationId,
                },
            });
        });

        return () => {
            if (typeof unsubscribe === 'function') {
                unsubscribe();
            }
        };
    }, [user?.uid, isSupported, permission]);

    const requestPermission = async (): Promise<boolean> => {
        const granted = await requestNotificationPermission();
        if (granted) {
            setPermission('granted');

            // Get FCM token after permission granted
            if (user?.uid) {
                const fcmToken = await getFCMToken(user.uid);
                setToken(fcmToken);
            }
        } else {
            setPermission(getNotificationPermission());
        }
        return granted;
    };

    return {
        permission,
        isSupported,
        requestPermission,
        token,
    };
};
