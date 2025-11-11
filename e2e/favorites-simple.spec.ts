/**
 * Tests E2E simplifiés pour le système de favoris
 * Se concentre sur les fonctionnalités testables sans données préexistantes
 */

import { test, expect } from '@playwright/test';

// Données de test
const TEST_EMAIL = `test-favorites-${Date.now()}@example.com`;
const TEST_PASSWORD = 'TestPassword123!';
const TEST_DISPLAY_NAME = 'Test Favorites User';

test.describe('Système de favoris - Tests simplifiés', () => {
    test.beforeEach(async ({ page }) => {
        // Nettoyer les cookies
        await page.context().clearCookies();

        // Créer un compte et se connecter
        await page.goto('/fr/sign-up');

        // Nettoyer le localStorage après navigation
        await page.evaluate(() => localStorage.clear());

        await page.fill('[data-testid="signup-displayName"]', TEST_DISPLAY_NAME);
        await page.fill('[data-testid="signup-email"]', TEST_EMAIL);
        await page.fill('[data-testid="signup-password"]', TEST_PASSWORD);
        await page.click('[data-testid="signup-submit"]');

        // Attendre la redirection et compléter l'onboarding si nécessaire
        await page.waitForURL(/\/(?:dashboard|onboarding)/, { timeout: 30000 });

        // Si on est sur l'onboarding, sélectionner le type de compte
        const currentUrl = page.url();
        if (currentUrl.includes('/onboarding')) {
            // Sélectionner "Individual" (anciennement "Client")
            await page.click('[data-testid="account-type-individual"]');
            await page.click('button:has-text("Continuer")');
            await page.waitForURL(/\/dashboard/, { timeout: 30000 });
        }
    });

    test('devrait naviguer vers la page Mes Favoris depuis le Header', async ({ page }) => {
        // Naviguer vers le dashboard
        await page.goto('/fr/dashboard');

        // Ouvrir le menu utilisateur
        const userMenu = page.locator('[data-testid="user-menu"]');
        await userMenu.click();

        // Cliquer sur "Mes Favoris"
        const favoritesLink = page.locator('text=/Mes Favoris|Favoris|Favorites/i');
        await expect(favoritesLink).toBeVisible({ timeout: 10000 });
        await favoritesLink.click();

        // Vérifier que la page favoris est chargée
        await page.waitForURL(/\/dashboard\/favorites/, { timeout: 10000 });
        await expect(page.locator('h1:has-text("Favoris")')).toBeVisible({ timeout: 10000 });
    });

    test('devrait afficher un état vide quand il n\'y a pas de favoris', async ({ page }) => {
        // Aller directement à la page favoris (compte neuf, pas de favoris)
        await page.goto('/fr/dashboard/favorites');

        // Vérifier que l'état vide est affiché
        await expect(page.locator('[data-testid="favorites-empty-state"]')).toBeVisible({ timeout: 15000 });

        // Vérifier le message d'état vide
        await expect(page.locator('text=/Aucun favori|No favorites/i')).toBeVisible();
    });

    test('devrait afficher un état vide pour chaque onglet filtré', async ({ page }) => {
        // Aller à la page favoris (compte neuf)
        await page.goto('/fr/dashboard/favorites');
        await page.waitForLoadState('networkidle');

        // Vérifier l'état vide dans l'onglet "Tâches"
        await page.locator('[data-testid="tab-tasks"]').click();
        await expect(page.locator('[data-testid="favorites-empty-state"]')).toBeVisible({ timeout: 5000 });

        // Vérifier l'état vide dans l'onglet "Prestataires"
        await page.locator('[data-testid="tab-providers"]').click();
        await expect(page.locator('[data-testid="favorites-empty-state"]')).toBeVisible({ timeout: 5000 });
    });

    test('devrait être responsive sur mobile', async ({ page }) => {
        // Définir une taille d'écran mobile
        await page.setViewportSize({ width: 375, height: 667 });

        // Aller à la page favoris
        await page.goto('/fr/dashboard/favorites');

        // Vérifier que la page est visible et scrollable
        await expect(page.locator('h1:has-text("Favoris")')).toBeVisible({ timeout: 10000 });

        // Vérifier que les onglets sont visibles et cliquables sur mobile
        const tabsTriggers = page.locator('[role="tablist"]');
        await expect(tabsTriggers).toBeVisible();

        // Tester le changement d'onglet sur mobile
        await page.locator('[data-testid="tab-providers"]').click();
        await expect(page.locator('[data-testid="tab-providers"]')).toHaveAttribute('data-state', 'active');
    });
});

test.describe('Favoris - Intégration i18n simplifiée', () => {
    test.beforeEach(async ({ page }) => {
        // Nettoyer les cookies
        await page.context().clearCookies();
    });

    test('devrait afficher les favoris en anglais', async ({ page }) => {
        // Créer un compte et se connecter
        await page.goto('/en/sign-up');

        // Nettoyer le localStorage après navigation
        await page.evaluate(() => localStorage.clear());

        const testEmail = `test-i18n-en-${Date.now()}@example.com`;
        await page.fill('[data-testid="signup-displayName"]', 'Test EN User');
        await page.fill('[data-testid="signup-email"]', testEmail);
        await page.fill('[data-testid="signup-password"]', TEST_PASSWORD);
        await page.click('[data-testid="signup-submit"]');
        await page.waitForURL(/\/(?:dashboard|onboarding)/, { timeout: 30000 });

        // Compléter l'onboarding si nécessaire
        if (page.url().includes('/onboarding')) {
            await page.click('[data-testid="account-type-individual"]');
            await page.click('button:has-text("Continue")');
            await page.waitForURL(/\/dashboard/, { timeout: 30000 });
        }

        // Aller à la page favoris en anglais
        await page.goto('/en/dashboard/favorites');

        // Vérifier les traductions anglaises
        await expect(page.locator('h1:has-text("Favorites")')).toBeVisible({ timeout: 15000 });
    });

    test('devrait afficher les favoris en japonais', async ({ page }) => {
        // Créer un compte et se connecter
        await page.goto('/ja/sign-up');

        // Nettoyer le localStorage après navigation
        await page.evaluate(() => localStorage.clear());

        const testEmail = `test-i18n-ja-${Date.now()}@example.com`;
        await page.fill('[data-testid="signup-displayName"]', 'Test JA User');
        await page.fill('[data-testid="signup-email"]', testEmail);
        await page.fill('[data-testid="signup-password"]', TEST_PASSWORD);
        await page.click('[data-testid="signup-submit"]');
        await page.waitForURL(/\/(?:dashboard|onboarding)/, { timeout: 30000 });

        // Compléter l'onboarding si nécessaire
        if (page.url().includes('/onboarding')) {
            await page.click('[data-testid="account-type-individual"]');
            await page.click('button:has-text("続ける")');
            await page.waitForURL(/\/dashboard/, { timeout: 30000 });
        }

        // Aller à la page favoris en japonais
        await page.goto('/ja/dashboard/favorites');

        // Vérifier les traductions japonaises
        await expect(page.locator('h1:has-text("お気に入り")')).toBeVisible({ timeout: 15000 });
    });
});
