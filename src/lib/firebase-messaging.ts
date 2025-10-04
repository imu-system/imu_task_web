import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';
import { doc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from './firebase';

let messaging: Messaging | null = null;

// Initialize Firebase Messaging
export const initializeMessaging = () => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        try {
            const { messaging: firebaseMessaging } = require('./firebase');
            messaging = firebaseMessaging;
            return messaging;
        } catch (error) {
            console.error('Error initializing messaging:', error);
            return null;
        }
    }
    return null;
};

// Request notification permission
export const requestNotificationPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
        console.log('This browser does not support notifications');
        return false;
    }

    if (Notification.permission === 'granted') {
        return true;
    }

    if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }

    return false;
};

// Get FCM token
export const getFCMToken = async (userId: string): Promise<string | null> => {
    try {
        if (!messaging) {
            messaging = initializeMessaging();
        }

        if (!messaging) {
            console.error('Messaging not initialized');
            return null;
        }

        const hasPermission = await requestNotificationPermission();
        if (!hasPermission) {
            console.log('Notification permission denied');
            return null;
        }

        // Register service worker
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        console.log('Service Worker registered:', registration);

        // Get FCM token
        const token = await getToken(messaging, {
            vapidKey: 'BKlwTqJz7YQZ8xH3vN5pL9dK2jM6wR4sT1fG8hV3nB7cX9mP2qY5tL4kJ6wZ8hR3',
            serviceWorkerRegistration: registration,
        });

        if (token) {
            console.log('FCM Token:', token);
            // Save token to Firestore
            await saveFCMToken(userId, token);
            return token;
        } else {
            console.log('No registration token available');
            return null;
        }
    } catch (error) {
        console.error('Error getting FCM token:', error);
        return null;
    }
};

// Save FCM token to Firestore
export const saveFCMToken = async (userId: string, token: string): Promise<void> => {
    try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            fcmTokens: arrayUnion(token),
            updatedAt: new Date(),
        });
        console.log('FCM token saved to Firestore');
    } catch (error) {
        console.error('Error saving FCM token:', error);
        throw error;
    }
};

// Remove FCM token from Firestore
export const removeFCMToken = async (userId: string, token: string): Promise<void> => {
    try {
        const userRef = doc(db, 'users', userId);
        const userDoc = await import('firebase/firestore').then(({ getDoc }) => getDoc(userRef));

        if (userDoc.exists()) {
            const tokens = userDoc.data().fcmTokens || [];
            const updatedTokens = tokens.filter((t: string) => t !== token);

            await updateDoc(userRef, {
                fcmTokens: updatedTokens,
                updatedAt: new Date(),
            });
            console.log('FCM token removed from Firestore');
        }
    } catch (error) {
        console.error('Error removing FCM token:', error);
        throw error;
    }
};

// Setup foreground message listener
export const onMessageListener = (callback: (payload: any) => void) => {
    if (!messaging) {
        messaging = initializeMessaging();
    }

    if (!messaging) {
        console.error('Messaging not initialized');
        return () => { };
    }

    return onMessage(messaging, (payload) => {
        console.log('Message received in foreground:', payload);
        callback(payload);
    });
};

// Display notification
export const displayNotification = (title: string, options?: NotificationOptions) => {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
            icon: '/icons/icon-192x192.png',
            badge: '/icons/icon-72x72.png',
            ...options,
        });
    }
};

// Check notification permission status
export const getNotificationPermission = (): NotificationPermission => {
    if ('Notification' in window) {
        return Notification.permission;
    }
    return 'denied';
};
