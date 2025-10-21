import { initializeApp, cert, getApps, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

let app: App | undefined;

export function initAdmin() {
    if (!app) {
        // Check if already initialized
        const apps = getApps();
        if (apps.length > 0) {
            app = apps[0];
        } else {
            // Initialize with service account credentials
            const serviceAccount = {
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            };

            app = initializeApp({
                credential: cert(serviceAccount),
                projectId: process.env.FIREBASE_PROJECT_ID,
            });
        }
    }

    return {
        app,
        auth: getAuth(app),
        db: getFirestore(app),
    };
}
