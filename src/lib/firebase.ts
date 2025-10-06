// src/lib/firebase.ts
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getMessaging, isSupported } from 'firebase/messaging';

// Configuration Firebase - ImuTask
// Les variables NEXT_PUBLIC_* doivent être référencées directement (pas dynamiquement)
// pour que Next.js 15 les injecte correctement côté client
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Validation de la configuration avec références directes
const missingVars: string[] = [];
if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) missingVars.push('NEXT_PUBLIC_FIREBASE_API_KEY');
if (!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN) missingVars.push('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN');
if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) missingVars.push('NEXT_PUBLIC_FIREBASE_PROJECT_ID');
if (!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET) missingVars.push('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET');
if (!process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID) missingVars.push('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID');
if (!process.env.NEXT_PUBLIC_FIREBASE_APP_ID) missingVars.push('NEXT_PUBLIC_FIREBASE_APP_ID');

if (missingVars.length > 0) {
    throw new Error(
        `Missing required Firebase environment variables: ${missingVars.join(', ')}\n` +
        'Please check your .env.local file.'
    );
}

// Initialize Firebase (singleton pattern)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize messaging (only on client-side)
let messaging: ReturnType<typeof getMessaging> | null = null;
if (typeof window !== 'undefined') {
    isSupported().then((supported) => {
        if (supported) {
            messaging = getMessaging(app);
        }
    });
}
export { messaging };

// Connect to emulators in development
if (
    typeof window !== 'undefined' &&
    process.env.NODE_ENV === 'development' &&
    process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === 'true'
) {
    try {
        // Auth emulator
        if (process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST) {
            connectAuthEmulator(
                auth,
                `http://${process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST}`,
                { disableWarnings: true }
            );
            console.log('✅ Connected to Auth Emulator');
        }

        // Firestore emulator
        if (process.env.NEXT_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_HOST) {
            const [host, port] = process.env.NEXT_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_HOST.split(':');
            connectFirestoreEmulator(db, host, parseInt(port));
            console.log('✅ Connected to Firestore Emulator');
        }

        // Storage emulator
        if (process.env.NEXT_PUBLIC_FIREBASE_STORAGE_EMULATOR_HOST) {
            const [host, port] = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_EMULATOR_HOST.split(':');
            connectStorageEmulator(storage, host, parseInt(port));
            console.log('✅ Connected to Storage Emulator');
        }
    } catch (error) {
        console.warn('⚠️  Firebase emulators already connected or connection failed:', error);
    }
}

// Log configuration status (only in development)
if (process.env.NODE_ENV === 'development') {
    console.log('🔥 Firebase initialized:', {
        projectId: firebaseConfig.projectId,
        authDomain: firebaseConfig.authDomain,
        emulators: process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === 'true',
    });
}

export default app;
