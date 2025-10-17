/**
 * Tests E2E pour le flux d'authentification complet
 * Teste l'inscription, la connexion, et la création du document Firestore
 */

import { test, expect } from '@playwright/test';

const TEST_EMAIL = `test-${Date.now()}@example.com`;
const TEST_PASSWORD = 'TestPassword123!';
const TEST_DISPLAY_NAME = 'Test User E2E';

test.describe('Flux d\'authentification complet', () => {
    test.beforeEach(async ({ page }) => {
        // Nettoyer les cookies et le localStorage
        await page.context().clearCookies();
        await page.evaluate(() => localStorage.clear());
    });

    test('devrait créer un compte, créer le document Firestore, et rediriger vers le dashboard', async ({ page }) => {
        // 1. Naviguer vers la page d'inscription
        await page.goto('/fr/sign-up');
        await expect(page).toHaveTitle(/ImuTask/);

        // 2. Remplir le formulaire d'inscription
        await page.fill('input[name="displayName"]', TEST_DISPLAY_NAME);
        await page.fill('input[name="email"]', TEST_EMAIL);
        await page.fill('input[name="password"]', TEST_PASSWORD);
        await page.fill('input[name="confirmPassword"]', TEST_PASSWORD);

        // 3. Soumettre le formulaire
        await page.click('button[type="submit"]');

        // 4. Attendre la redirection vers le dashboard
        await page.waitForURL(/\/dashboard/, { timeout: 10000 });

        // 5. Vérifier que l'utilisateur est connecté
        const dashboardHeader = page.locator('[data-testid="dashboard-header"]');
        await expect(dashboardHeader).toBeVisible();

        // 6. Vérifier que le nom d'affichage est correct
        const userMenu = page.locator('[data-testid="user-menu"]');
        await expect(userMenu).toContainText(TEST_DISPLAY_NAME);

        // 7. Vérifier que le cookie d'authentification est défini
        const cookies = await page.context().cookies();
        const authCookie = cookies.find(c => c.name === 'firebaseAuth');
        expect(authCookie).toBeDefined();
        expect(authCookie?.value).toBe('true');

        // 8. Vérifier dans la console que le document Firestore a été créé
        const logs: string[] = [];
        page.on('console', msg => {
            if (msg.type() === 'log') {
                logs.push(msg.text());
            }
        });

        // Attendre les logs de création
        await page.waitForTimeout(2000);

        const hasCreationLog = logs.some(log => log.includes('User document created'));
        const hasLoadedLog = logs.some(log => log.includes('User loaded from Firestore'));

        expect(hasCreationLog || hasLoadedLog).toBeTruthy();
    });

    test('devrait se connecter avec un compte existant et charger les données Firestore', async ({ page }) => {
        // Note: Ce test nécessite que le test précédent ait créé le compte
        // Dans un environnement de test réel, utiliser un compte de test pré-créé

        // 1. Naviguer vers la page de connexion
        await page.goto('/fr/sign-in');

        // 2. Remplir le formulaire de connexion
        await page.fill('input[name="email"]', TEST_EMAIL);
        await page.fill('input[name="password"]', TEST_PASSWORD);

        // 3. Soumettre le formulaire
        await page.click('button[type="submit"]');

        // 4. Attendre la redirection vers le dashboard
        await page.waitForURL(/\/dashboard/, { timeout: 10000 });

        // 5. Vérifier que l'utilisateur est connecté
        const dashboardHeader = page.locator('[data-testid="dashboard-header"]');
        await expect(dashboardHeader).toBeVisible();

        // 6. Vérifier que les données sont chargées depuis Firestore
        const logs: string[] = [];
        page.on('console', msg => {
            if (msg.type() === 'log') {
                logs.push(msg.text());
            }
        });

        await page.waitForTimeout(2000);

        const hasLoadedLog = logs.some(log =>
            log.includes('User loaded from Firestore with roles')
        );
        expect(hasLoadedLog).toBeTruthy();
    });

    test('devrait protéger le dashboard et rediriger les utilisateurs non authentifiés', async ({ page }) => {
        // 1. Tenter d'accéder au dashboard sans être connecté
        await page.goto('/fr/dashboard');

        // 2. Vérifier la redirection vers /sign-in
        await page.waitForURL(/\/sign-in/, { timeout: 5000 });

        // 3. Vérifier que la page de connexion est affichée
        const signInForm = page.locator('form');
        await expect(signInForm).toBeVisible();
    });

    test('devrait se déconnecter et nettoyer la session', async ({ page }) => {
        // 1. Se connecter d'abord
        await page.goto('/fr/sign-in');
        await page.fill('input[name="email"]', TEST_EMAIL);
        await page.fill('input[name="password"]', TEST_PASSWORD);
        await page.click('button[type="submit"]');
        await page.waitForURL(/\/dashboard/, { timeout: 10000 });

        // 2. Cliquer sur le bouton de déconnexion
        const userMenu = page.locator('[data-testid="user-menu"]');
        await userMenu.click();

        const logoutButton = page.locator('[data-testid="logout-button"]');
        await logoutButton.click();

        // 3. Vérifier la redirection vers la page d'accueil
        await page.waitForURL(/\/fr$/, { timeout: 5000 });

        // 4. Vérifier que le cookie est supprimé
        const cookies = await page.context().cookies();
        const authCookie = cookies.find(c => c.name === 'firebaseAuth');
        expect(authCookie?.value).not.toBe('true');

        // 5. Vérifier que l'accès au dashboard est bloqué
        await page.goto('/fr/dashboard');
        await page.waitForURL(/\/sign-in/, { timeout: 5000 });
    });

    test('devrait gérer les erreurs d\'inscription (email déjà utilisé)', async ({ page }) => {
        // 1. Naviguer vers la page d'inscription
        await page.goto('/fr/sign-up');

        // 2. Essayer de créer un compte avec un email déjà utilisé
        await page.fill('input[name="displayName"]', 'Another User');
        await page.fill('input[name="email"]', TEST_EMAIL); // Email déjà utilisé
        await page.fill('input[name="password"]', TEST_PASSWORD);
        await page.fill('input[name="confirmPassword"]', TEST_PASSWORD);

        // 3. Soumettre le formulaire
        await page.click('button[type="submit"]');

        // 4. Vérifier qu'un message d'erreur est affiché
        const errorMessage = page.locator('[data-testid="error-message"]');
        await expect(errorMessage).toBeVisible({ timeout: 5000 });
        await expect(errorMessage).toContainText(/already in use|déjà utilisé/i);
    });

    test('devrait afficher les bonnes permissions basées sur les rôles', async ({ page }) => {
        // 1. Se connecter
        await page.goto('/fr/sign-in');
        await page.fill('input[name="email"]', TEST_EMAIL);
        await page.fill('input[name="password"]', TEST_PASSWORD);
        await page.click('button[type="submit"]');
        await page.waitForURL(/\/dashboard/, { timeout: 10000 });

        // 2. Vérifier que le menu client est visible
        const clientMenu = page.locator('[data-testid="client-menu"]');
        await expect(clientMenu).toBeVisible();

        // 3. Vérifier que les fonctionnalités client sont accessibles
        const newTaskButton = page.locator('[data-testid="new-task-button"]');
        await expect(newTaskButton).toBeVisible();

        // 4. Vérifier que les fonctionnalités provider ne sont PAS visibles (rôle par défaut = client)
        const providerDashboard = page.locator('[data-testid="provider-dashboard"]');
        await expect(providerDashboard).not.toBeVisible();
    });
});

test.describe('Authentification Google OAuth', () => {
    test.skip('devrait se connecter avec Google et créer le document Firestore', async ({ page }) => {
        // Note: Ce test nécessite une configuration spéciale pour tester OAuth
        // Il est marqué comme skip par défaut

        // 1. Naviguer vers la page de connexion
        await page.goto('/fr/sign-in');

        // 2. Cliquer sur le bouton Google
        const googleButton = page.locator('[data-testid="google-signin-button"]');
        await googleButton.click();

        // 3. La popup Google OAuth devrait s'ouvrir
        // (Configuration complexe requise pour les tests E2E)

        // 4. Après authentification, vérifier la redirection
        await page.waitForURL(/\/dashboard/, { timeout: 15000 });

        // 5. Vérifier que le document Firestore est créé ou récupéré
        const logs: string[] = [];
        page.on('console', msg => {
            if (msg.type() === 'log') {
                logs.push(msg.text());
            }
        });

        await page.waitForTimeout(2000);

        const hasGoogleLog = logs.some(log =>
            log.includes('signed in with Google') ||
            log.includes('Google user document created')
        );
        expect(hasGoogleLog).toBeTruthy();
    });
});
