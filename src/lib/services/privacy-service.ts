/**
 * Privacy Service - GDPR Data Export, Visibility, Cookie & Email Preferences
 */

import { doc, updateDoc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface UserDataExport {
  profile: any;
  tasks?: any[];
  bookings?: any[];
  messages?: any[];
  reviews?: any[];
  transactions?: any[];
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'friends';
  searchEngineIndexing: boolean;
}

export interface CookiePreferences {
  essential: boolean; // Always true
  analytics: boolean;
  marketing: boolean;
}

export interface EmailPreferences {
  newsletter: boolean;
  marketing: boolean;
  updates: boolean;
  security: boolean; // Recommended to keep true
}

/**
 * Generate and export all user data (GDPR Article 20 - Right to data portability)
 */
export async function generateUserDataExport(
  userId: string,
  categories: string[]
): Promise<UserDataExport> {
  const exportData: UserDataExport = {
    profile: {},
  };

  // Always include profile
  if (categories.includes('profile')) {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    exportData.profile = userDoc.exists() ? userDoc.data() : {};
  }

  // Tasks
  if (categories.includes('tasks')) {
    const tasksQuery = query(collection(db, 'tasks'), where('userId', '==', userId));
    const tasksSnapshot = await getDocs(tasksQuery);
    exportData.tasks = tasksSnapshot.docs.map((taskDoc) => ({
      id: taskDoc.id,
      ...taskDoc.data(),
    }));
  }

  // Bookings
  if (categories.includes('bookings')) {
    const clientBookingsQuery = query(collection(db, 'bookings'), where('clientId', '==', userId));
    const providerBookingsQuery = query(collection(db, 'bookings'), where('providerId', '==', userId));
    
    const [clientBookings, providerBookings] = await Promise.all([
      getDocs(clientBookingsQuery),
      getDocs(providerBookingsQuery),
    ]);

    exportData.bookings = [
      ...clientBookings.docs.map((doc) => ({ id: doc.id, role: 'client', ...doc.data() })),
      ...providerBookings.docs.map((doc) => ({ id: doc.id, role: 'provider', ...doc.data() })),
    ];
  }

  // Messages
  if (categories.includes('messages')) {
    const sentMessagesQuery = query(collection(db, 'messages'), where('senderId', '==', userId));
    const receivedMessagesQuery = query(collection(db, 'messages'), where('receiverId', '==', userId));
    
    const [sentMessages, receivedMessages] = await Promise.all([
      getDocs(sentMessagesQuery),
      getDocs(receivedMessagesQuery),
    ]);

    exportData.messages = [
      ...sentMessages.docs.map((doc) => ({ id: doc.id, direction: 'sent', ...doc.data() })),
      ...receivedMessages.docs.map((doc) => ({ id: doc.id, direction: 'received', ...doc.data() })),
    ];
  }

  // Reviews
  if (categories.includes('reviews')) {
    const reviewsQuery = query(collection(db, 'reviews'), where('userId', '==', userId));
    const reviewsSnapshot = await getDocs(reviewsQuery);
    exportData.reviews = reviewsSnapshot.docs.map((reviewDoc) => ({
      id: reviewDoc.id,
      ...reviewDoc.data(),
    }));
  }

  // Transactions
  if (categories.includes('transactions')) {
    const transactionsQuery = query(collection(db, 'transactions'), where('userId', '==', userId));
    const transactionsSnapshot = await getDocs(transactionsQuery);
    exportData.transactions = transactionsSnapshot.docs.map((transactionDoc) => ({
      id: transactionDoc.id,
      ...transactionDoc.data(),
    }));
  }

  return exportData;
}

/**
 * Convert data export to CSV format
 */
export function convertToCSV(data: UserDataExport): string {
  let csv = '';

  // Helper to convert object array to CSV
  const arrayToCSV = (arr: any[], title: string): string => {
    if (!arr || arr.length === 0) return '';

    const headers = Object.keys(arr[0]).join(',');
    const rows = arr
      .map((obj) =>
        Object.values(obj)
          .map((val) => (typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val))
          .join(',')
      )
      .join('\n');

    return `\n\n=== ${title.toUpperCase()} ===\n${headers}\n${rows}`;
  };

  // Profile
  csv += '=== PROFILE ===\n';
  csv += Object.entries(data.profile)
    .map(([key, value]) => `${key},"${value}"`)
    .join('\n');

  // Other categories
  if (data.tasks) csv += arrayToCSV(data.tasks, 'Tasks');
  if (data.bookings) csv += arrayToCSV(data.bookings, 'Bookings');
  if (data.messages) csv += arrayToCSV(data.messages, 'Messages');
  if (data.reviews) csv += arrayToCSV(data.reviews, 'Reviews');
  if (data.transactions) csv += arrayToCSV(data.transactions, 'Transactions');

  return csv;
}

/**
 * Download file helper
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Update privacy settings (profile visibility, search engine indexing)
 */
export async function updatePrivacySettings(userId: string, settings: PrivacySettings): Promise<void> {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    privacySettings: settings,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Update cookie preferences
 */
export async function updateCookiePreferences(userId: string, preferences: CookiePreferences): Promise<void> {
  // Save to localStorage (for immediate effect)
  localStorage.setItem('cookiePreferences', JSON.stringify(preferences));

  // Save to Firestore (for persistence across devices)
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    cookiePreferences: preferences,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Update email notification preferences
 */
export async function updateEmailPreferences(userId: string, preferences: EmailPreferences): Promise<void> {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    emailPreferences: preferences,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Get privacy settings for user
 */
export async function getPrivacySettings(userId: string): Promise<PrivacySettings | null> {
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);
  
  if (!userDoc.exists()) return null;
  
  const data = userDoc.data();
  return data.privacySettings || {
    profileVisibility: 'public',
    searchEngineIndexing: true,
  };
}

/**
 * Get cookie preferences for user
 */
export async function getCookiePreferences(userId: string): Promise<CookiePreferences> {
  // Check localStorage first
  const localPrefs = localStorage.getItem('cookiePreferences');
  if (localPrefs) {
    return JSON.parse(localPrefs);
  }

  // Fall back to Firestore
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);
  
  if (userDoc.exists()) {
    const data = userDoc.data();
    return data.cookiePreferences || {
      essential: true,
      analytics: true,
      marketing: false,
    };
  }

  return {
    essential: true,
    analytics: true,
    marketing: false,
  };
}

/**
 * Get email preferences for user
 */
export async function getEmailPreferences(userId: string): Promise<EmailPreferences> {
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);
  
  if (userDoc.exists()) {
    const data = userDoc.data();
    return data.emailPreferences || {
      newsletter: true,
      marketing: false,
      updates: true,
      security: true,
    };
  }

  return {
    newsletter: true,
    marketing: false,
    updates: true,
    security: true,
  };
}
