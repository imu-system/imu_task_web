// src/lib/firebase.ts
import { getApps, initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { connectStorageEmulator, getStorage } from "firebase/storage";
import { getMessaging, isSupported } from "firebase/messaging";
import { connectFunctionsEmulator, getFunctions } from "firebase/functions";

// Configuration Firebase - ImuTask
// Les variables NEXT_PUBLIC_* doivent être référencées directement (pas dynamiquement)
// pour que Next.js 15 les injecte correctement côté client
const resolvedEnv = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDrkIAzZktPxCEZIbsHzRu-l00YPt3nSHY",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "imutask.firebaseapp.com",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "imutask",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "imutask.firebasestorage.app",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "354457149125",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:354457149125:web:4fe8dbfa3192de5aa75aac",
};

const firebaseConfig = {
    apiKey: resolvedEnv.apiKey,
    authDomain: resolvedEnv.authDomain,
    projectId: resolvedEnv.projectId,
    storageBucket: resolvedEnv.storageBucket,
    messagingSenderId: resolvedEnv.messagingSenderId,
    appId: resolvedEnv.appId,
};

// Validation de la configuration avec références directes
const missingVars: string[] = [];
if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
    missingVars.push("NEXT_PUBLIC_FIREBASE_API_KEY");
}
if (!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN) {
    missingVars.push("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN");
}
if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
    missingVars.push("NEXT_PUBLIC_FIREBASE_PROJECT_ID");
}
if (!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET) {
    missingVars.push("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET");
}
if (!process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID) {
    missingVars.push("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID");
}
if (!process.env.NEXT_PUBLIC_FIREBASE_APP_ID) {
    missingVars.push("NEXT_PUBLIC_FIREBASE_APP_ID");
}

if (missingVars.length > 0) {
    console.warn(
        "⚠️ Firebase env vars missing, using placeholder values:",
        missingVars.join(", "),
    );
}

// Initialize Firebase (singleton pattern)
const app = getApps().length === 0
    ? initializeApp(firebaseConfig)
    : getApps()[0];

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

// Initialize messaging (only on client-side)
let messaging: ReturnType<typeof getMessaging> | null = null;
if (typeof window !== "undefined") {
    isSupported().then((supported) => {
        if (supported) {
            messaging = getMessaging(app);
        }
    });
}
export { messaging };

// Connect to emulators in development
if (
    typeof window !== "undefined" &&
    process.env.NODE_ENV === "development" &&
    process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true"
) {
    try {
        // Auth emulator
        if (process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST) {
            connectAuthEmulator(
                auth,
                `http://${process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST}`,
                { disableWarnings: true },
            );
            console.log("✅ Connected to Auth Emulator");
        }

        // Firestore emulator
        if (process.env.NEXT_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_HOST) {
            const [host, port] = process.env
                .NEXT_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_HOST.split(":");
            connectFirestoreEmulator(db, host, parseInt(port));
            console.log("✅ Connected to Firestore Emulator");
        }

        // Storage emulator
        if (process.env.NEXT_PUBLIC_FIREBASE_STORAGE_EMULATOR_HOST) {
            const [host, port] = process.env
                .NEXT_PUBLIC_FIREBASE_STORAGE_EMULATOR_HOST.split(":");
            connectStorageEmulator(storage, host, parseInt(port));
            console.log("✅ Connected to Storage Emulator");
        }

        // Functions emulator
        if (process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_EMULATOR_HOST) {
            const [host, port] = process.env
                .NEXT_PUBLIC_FIREBASE_FUNCTIONS_EMULATOR_HOST.split(":");
            connectFunctionsEmulator(functions, host, parseInt(port));
            console.log("✅ Connected to Functions Emulator");
        }
    } catch (error) {
        console.warn(
            "⚠️  Firebase emulators already connected or connection failed:",
            error,
        );
    }
}

// Log configuration status (only in development)
if (process.env.NODE_ENV === "development") {
    console.log("🔥 Firebase initialized:", {
        projectId: firebaseConfig.projectId,
        authDomain: firebaseConfig.authDomain,
        emulators: process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true",
    });
}

export default app;
