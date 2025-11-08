/**
 * Security Service - 2FA, Sessions, and Security Operations
 */

import {
    multiFactor,
    PhoneAuthProvider,
    PhoneMultiFactorGenerator,
    RecaptchaVerifier,
    ApplicationVerifier,
} from 'firebase/auth';
import { doc, updateDoc, collection, getDocs, query, where, deleteDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export interface Session {
  id: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  os: string;
  city: string;
  country: string;
  ipAddress: string;
  isCurrent: boolean;
  lastActive: string;
}/**
 * Enable 2FA for user account (SMS-based)
 */
export async function enable2FA(phoneNumber: string, recaptchaVerifier: ApplicationVerifier): Promise<string> {
    const user = auth.currentUser;
    if (!user) {
        throw new Error('User not authenticated');
    }

    // Get multi-factor session
    const multiFactorSession = await multiFactor(user).getSession();

    // Create phone auth provider
    const phoneAuthProvider = new PhoneAuthProvider(auth);

    // Send verification code
    const verificationId = await phoneAuthProvider.verifyPhoneNumber(
        {
            phoneNumber,
            session: multiFactorSession,
        },
        recaptchaVerifier
    );

    // Update Firestore
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
        twoFactorEnabled: true,
        twoFactorMethod: 'sms',
        twoFactorPhone: phoneNumber,
        updatedAt: new Date().toISOString(),
    });

    return verificationId;
}

/**
 * Verify 2FA code and complete enrollment
 */
export async function verify2FA(verificationId: string, verificationCode: string): Promise<void> {
    const user = auth.currentUser;
    if (!user) {
        throw new Error('User not authenticated');
    }

    // Create phone auth credential
    const phoneAuthCredential = PhoneAuthProvider.credential(verificationId, verificationCode);

    // Create multi-factor assertion
    const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(phoneAuthCredential);

    // Enroll with multi-factor assertion
    await multiFactor(user).enroll(multiFactorAssertion, 'Primary Phone');
}

/**
 * Disable 2FA for user account
 */
export async function disable2FA(): Promise<void> {
    const user = auth.currentUser;
    if (!user) {
        throw new Error('User not authenticated');
    }

    // Unenroll all multi-factor options
    const enrolledFactors = multiFactor(user).enrolledFactors;
    for (const factor of enrolledFactors) {
        await multiFactor(user).unenroll(factor);
    }

    // Update Firestore
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
        twoFactorEnabled: false,
        twoFactorMethod: null,
        twoFactorPhone: null,
        updatedAt: new Date().toISOString(),
    });
}

/**
 * Get all active sessions for user
 */
export async function getSessions(userId: string): Promise<Session[]> {
    const sessionsRef = collection(db, 'users', userId, 'sessions');
    const sessionsSnapshot = await getDocs(sessionsRef);

    const sessions: Session[] = sessionsSnapshot.docs.map((sessionDoc) => ({
        id: sessionDoc.id,
        ...sessionDoc.data(),
    })) as Session[];

    return sessions.sort((a, b) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime());
}

/**
 * Create/update session metadata
 */
export async function createSession(
  userId: string,
  sessionId: string,
  metadata: {
    deviceType: 'desktop' | 'mobile' | 'tablet';
    browser: string;
    os: string;
    city: string;
    country: string;
    ipAddress: string;
  }
): Promise<void> {
  const sessionRef = doc(db, 'users', userId, 'sessions', sessionId);
  await setDoc(sessionRef, {
    ...metadata,
    lastActive: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    isCurrent: true,
  });
}/**
 * Logout from specific session
 */
export async function logoutSession(userId: string, sessionId: string): Promise<void> {
    const sessionRef = doc(db, 'users', userId, 'sessions', sessionId);
    await deleteDoc(sessionRef);

    // If it's the current session, sign out
    const user = auth.currentUser;
    if (user && user.uid === userId) {
        // Check if this is the current session (would need to store session ID in localStorage)
        const currentSessionId = localStorage.getItem('sessionId');
        if (currentSessionId === sessionId) {
            await auth.signOut();
        }
    }
}

/**
 * Logout from all sessions except current
 */
export async function logoutAllSessions(userId: string): Promise<void> {
    const currentSessionId = localStorage.getItem('sessionId');

    const sessionsRef = collection(db, 'users', userId, 'sessions');
    const sessionsSnapshot = await getDocs(sessionsRef);

    const deletePromises = sessionsSnapshot.docs
        .filter((sessionDoc) => sessionDoc.id !== currentSessionId)
        .map((sessionDoc) => deleteDoc(sessionDoc.ref));

    await Promise.all(deletePromises);
}

/**
 * Update session last active timestamp
 */
export async function updateSessionActivity(userId: string, sessionId: string): Promise<void> {
    const sessionRef = doc(db, 'users', userId, 'sessions', sessionId);
    await updateDoc(sessionRef, {
        lastActive: new Date().toISOString(),
    });
}
