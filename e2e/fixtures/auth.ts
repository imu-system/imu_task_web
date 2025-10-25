import { test as base, expect, Page } from '@playwright/test';
import { AccountType } from '@/lib/types';

/**
 * Fixtures d'authentification pour tests Playwright
 * Mock l'authentification Firebase pour éviter les erreurs d'auth dans les tests e2e
 */

interface MockUser {
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string;
    accountType: AccountType;
    profile?: {
        displayName?: string;
        photoUrl?: string;
        photoPath?: string;
    };
    metadata: {
        creationTime: string;
    };
}

export interface AuthFixtures {
    authenticatedPage: Page;
    mockUser: MockUser;
}

// Mock users pour chaque type de compte
export const mockUsers: Record<AccountType, MockUser> = {
    [AccountType.individual]: {
        uid: 'test-client-uid-001',
        email: 'client.test@imutask.com',
        displayName: 'Marie Dupont',
        photoURL: 'https://i.pravatar.cc/150?u=client',
        accountType: AccountType.individual,
        profile: {
            displayName: 'Marie Dupont',
            photoUrl: 'https://i.pravatar.cc/150?u=client',
        },
        metadata: {
            creationTime: '2024-01-01T00:00:00.000Z',
        },
    },
    [AccountType.professional]: {
        uid: 'test-pro-uid-002',
        email: 'pro.test@imutask.com',
        displayName: 'Jean Martin',
        photoURL: 'https://i.pravatar.cc/150?u=pro',
        accountType: AccountType.professional,
        profile: {
            displayName: 'Jean Martin',
            photoUrl: 'https://i.pravatar.cc/150?u=pro',
        },
        metadata: {
            creationTime: '2024-01-01T00:00:00.000Z',
        },
    },
    [AccountType.senior]: {
        uid: 'test-senior-uid-003',
        email: 'senior.test@imutask.com',
        displayName: 'Robert Durand',
        photoURL: 'https://i.pravatar.cc/150?u=senior',
        accountType: AccountType.senior,
        profile: {
            displayName: 'Robert Durand',
            photoUrl: 'https://i.pravatar.cc/150?u=senior',
        },
        metadata: {
            creationTime: '2024-01-01T00:00:00.000Z',
        },
    },
};

/**
 * Injecter un mock user dans le navigateur
 */
async function injectMockAuth(page: Page, user: MockUser) {
    await page.addInitScript((mockUser) => {
        // Mock localStorage pour AuthContext
        const authData = {
            user: mockUser,
            token: 'mock-firebase-token-' + mockUser.uid,
            expiresAt: Date.now() + 3600000, // 1 heure
        };

        window.localStorage.setItem('auth', JSON.stringify(authData));
        window.localStorage.setItem('accountType', mockUser.accountType);

        // Mock Firebase Auth
        (window as any).__FIREBASE_AUTH_MOCK__ = {
            currentUser: mockUser,
            onAuthStateChanged: (callback: any) => {
                setTimeout(() => callback(mockUser), 0);
                return () => { };
            },
        };

        // Mock Firestore data
        (window as any).__FIRESTORE_MOCK_DATA__ = {
            users: {
                [mockUser.uid]: {
                    uid: mockUser.uid,
                    email: mockUser.email,
                    displayName: mockUser.displayName,
                    accountType: mockUser.accountType,
                    profile: mockUser.profile,
                    createdAt: new Date(mockUser.metadata.creationTime),
                },
            },
            tasks: [],
            proposals: [],
            bookings: [],
        };

        console.log('[Test] Mock auth injected for:', mockUser.email);
    }, user);
}

/**
 * Naviguer vers un dashboard avec authentification mock
 */
export async function navigateToAuthenticatedDashboard(
    page: Page,
    accountType: AccountType,
    locale: string = 'fr'
) {
    const user = mockUsers[accountType];

    // Injecter le mock auth AVANT de naviguer
    await injectMockAuth(page, user);

    // Naviguer vers le dashboard
    const dashboardUrl = `/${locale}/dashboard/${accountType}`;
    await page.goto(dashboardUrl);

    // Attendre que le dashboard soit chargé
    await page.waitForLoadState('networkidle');

    // Attendre un élément caractéristique du dashboard
    await page.waitForSelector('h1, [role="heading"]', { timeout: 10000 });

    console.log(`[Test] Navigated to ${accountType} dashboard`);

    return user;
}

/**
 * Extension du test de base avec fixture d'auth
 */
export const test = base.extend<AuthFixtures>({
    // Fixture: page authentifiée
    authenticatedPage: async ({ page }, use, testInfo) => {
        // Déterminer le type de compte depuis le titre du test
        let accountType: AccountType = AccountType.individual;

        if (testInfo.title.toLowerCase().includes('pro')) {
            accountType = AccountType.professional;
        } else if (testInfo.title.toLowerCase().includes('senior')) {
            accountType = AccountType.senior;
        }

        // Injecter l'authentification
        const user = mockUsers[accountType];
        await injectMockAuth(page, user);

        // Utiliser la page
        await use(page);
    },

    // Fixture: utilisateur mock
    mockUser: async ({ }, use, testInfo) => {
        let accountType: AccountType = AccountType.individual;

        if (testInfo.title.toLowerCase().includes('pro')) {
            accountType = AccountType.professional;
        } else if (testInfo.title.toLowerCase().includes('senior')) {
            accountType = AccountType.senior;
        }

        await use(mockUsers[accountType]);
    },
});

export { expect };
