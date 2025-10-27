/**
 * Account Type Cookie Utilities
 * 
 * Gère le cookie 'accountType' pour le middleware
 * Le middleware Edge ne peut pas faire de requêtes Firestore,
 * donc on utilise un cookie set par le client après auth
 */

import { AccountType } from './types';

const COOKIE_NAME = 'accountType';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 jours

/**
 * Set accountType cookie
 * À appeler après login ou après sélection dans /onboarding
 */
export function setAccountTypeCookie(accountType: AccountType): void {
    if (typeof window === 'undefined') return;

    document.cookie = `${COOKIE_NAME}=${accountType}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
    console.log('✅ AccountType cookie set:', accountType);
}

/**
 * Get accountType from cookie
 */
export function getAccountTypeCookie(): AccountType | null {
    if (typeof window === 'undefined') return null;

    const cookies = document.cookie.split('; ');
    const accountTypeCookie = cookies.find(c => c.startsWith(`${COOKIE_NAME}=`));

    if (!accountTypeCookie) return null;

    const value = accountTypeCookie.split('=')[1];
    return value as AccountType;
}

/**
 * Clear accountType cookie
 * À appeler lors du logout
 */
export function clearAccountTypeCookie(): void {
    if (typeof window === 'undefined') return;

    document.cookie = `${COOKIE_NAME}=; path=/; max-age=0`;
    console.log('✅ AccountType cookie cleared');
}
