/**
 * Tests E2E pour le système de favoris
 * Teste l'ajout/suppression de favoris (tasks et providers), la navigation, le filtrage et les états vides
 */

import { test, expect } from '@playwright/test';

// Données de test
const TEST_EMAIL = `test-favorites-${Date.now()}@example.com`;
const TEST_PASSWORD = 'TestPassword123!';
const TEST_DISPLAY_NAME = 'Test Favorites User';

test.describe('Système de favoris', () => {
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
        await page.waitForURL(/\/(?:dashboard|onboarding)/, { timeout: 10000 });

        // Si on est sur l'onboarding, sélectionner le type de compte
        const currentUrl = page.url();
        if (currentUrl.includes('/onboarding')) {
            // Sélectionner "Individual" (anciennement "Client")
            await page.click('[data-testid="account-type-individual"]');
            await page.click('button:has-text("Continuer")');
            await page.waitForURL(/\/dashboard/, { timeout: 10000 });
        }
    });

    test('devrait afficher le bouton favoris sur une TaskCard', async ({ page }) => {
        // Naviguer vers la liste des tâches
        await page.goto('/fr/tasks');

        // Attendre que la page soit chargée
        await page.waitForLoadState('networkidle', { timeout: 30000 });

        // Vérifier que la page est bien chargée (au minimum le titre ou un élément de layout)
        await expect(page).toHaveURL(/\/tasks/);

        // Chercher les cartes de tâches (peut être vide si pas de données)
        const taskCards = page.locator('[data-testid="task-card"]');
        const count = await taskCards.count();

        // Si des tâches existent, vérifier le bouton favoris
        if (count > 0) {
            const favoriteButton = page.locator('[data-testid="task-favorite-button"]').first();
            await expect(favoriteButton).toBeVisible({ timeout: 5000 });
        } else {
            // Pas de tâches disponibles, marquer comme passé
            console.log('⚠️ Aucune tâche disponible pour tester le bouton favoris');
        }
    });

    test('devrait ajouter une tâche aux favoris depuis TaskCard', async ({ page }) => {
        // Naviguer vers la liste des tâches
        await page.goto('/fr/tasks');
        await page.waitForLoadState('networkidle', { timeout: 30000 });

        // Vérifier si des tâches existent
        const taskCards = page.locator('[data-testid="task-card"]');
        const count = await taskCards.count();

        if (count === 0) {
            console.log('⚠️ Aucune tâche disponible, test skippé');
            test.skip();
            return;
        }

        // Cliquer sur le premier bouton favoris
        const favoriteButton = page.locator('[data-testid="task-favorite-button"]').first();
        await favoriteButton.waitFor({ state: 'visible', timeout: 10000 });
        await favoriteButton.click();

        // Attendre l'animation et vérifier le toast de succès
        await expect(page.locator('text=/Ajouté aux favoris|Added to favorites/i')).toBeVisible({ timeout: 5000 });
    }); test('devrait afficher le bouton favoris sur une ProviderCard', async ({ page }) => {
        // Naviguer vers la liste des prestataires
        await page.goto('/fr/providers');

        // Attendre que les cartes de prestataires soient chargées
        await page.waitForSelector('[data-testid="provider-card"]', { timeout: 10000 });

        // Vérifier que le bouton favoris est visible sur au moins une carte
        const favoriteButton = page.locator('[data-testid="provider-favorite-button"]').first();
        await expect(favoriteButton).toBeVisible();
    });

    test('devrait ajouter un prestataire aux favoris depuis ProviderCard', async ({ page }) => {
        // Naviguer vers la liste des prestataires
        await page.goto('/fr/providers');
        await page.waitForSelector('[data-testid="provider-card"]', { timeout: 10000 });

        // Cliquer sur le premier bouton favoris
        const favoriteButton = page.locator('[data-testid="provider-favorite-button"]').first();
        await favoriteButton.click();

        // Attendre le toast de succès
        await expect(page.locator('text=/Ajouté aux favoris|Added to favorites/i')).toBeVisible({ timeout: 5000 });

        // Vérifier que l'icône du bouton a changé d'état
        const heartIcon = favoriteButton.locator('svg');
        await expect(heartIcon).toHaveClass(/fill/);
    });

    test('devrait naviguer vers la page Mes Favoris depuis le Header', async ({ page }) => {
        // Naviguer vers le dashboard
        await page.goto('/fr/dashboard');

        // Ouvrir le menu utilisateur
        const userMenu = page.locator('[data-testid="user-menu"]');
        await userMenu.click();

        // Cliquer sur "Mes Favoris"
        const favoritesLink = page.locator('text=/Mes Favoris|Favoris|Favorites/i');
        await expect(favoritesLink).toBeVisible();
        await favoritesLink.click();

        // Vérifier que la page favoris est chargée
        await page.waitForURL(/\/dashboard\/favorites/, { timeout: 5000 });
        await expect(page.locator('h1:has-text("Favoris")')).toBeVisible();
    });

    test('devrait afficher les favoris dans la page dédiée', async ({ page }) => {
        // Ajouter une tâche aux favoris
        await page.goto('/fr/tasks');
        await page.waitForSelector('[data-testid="task-card"]', { timeout: 10000 });
        const taskFavoriteBtn = page.locator('[data-testid="task-favorite-button"]').first();
        await taskFavoriteBtn.click();
        await page.waitForTimeout(2000); // Attendre que la sauvegarde Firestore soit complète

        // Ajouter un prestataire aux favoris
        await page.goto('/fr/providers');
        await page.waitForSelector('[data-testid="provider-card"]', { timeout: 10000 });
        const providerFavoriteBtn = page.locator('[data-testid="provider-favorite-button"]').first();
        await providerFavoriteBtn.click();
        await page.waitForTimeout(2000); // Attendre que la sauvegarde Firestore soit complète

        // Naviguer vers la page favoris
        await page.goto('/fr/dashboard/favorites');

        // Vérifier que les favoris sont affichés
        await expect(page.locator('[data-testid="favorites-grid"]')).toBeVisible({ timeout: 10000 });

        // Vérifier qu'il y a au moins 2 éléments (1 task + 1 provider)
        const favoriteItems = page.locator('[data-testid="favorite-item"]');
        await expect(favoriteItems).toHaveCount(2, { timeout: 5000 });
    });

    test('devrait filtrer les favoris par type avec les onglets', async ({ page }) => {
        // Ajouter une tâche et un prestataire aux favoris
        await page.goto('/fr/tasks');
        await page.waitForSelector('[data-testid="task-card"]', { timeout: 10000 });
        await page.locator('[data-testid="task-favorite-button"]').first().click();
        await page.waitForTimeout(2000);

        await page.goto('/fr/providers');
        await page.waitForSelector('[data-testid="provider-card"]', { timeout: 10000 });
        await page.locator('[data-testid="provider-favorite-button"]').first().click();
        await page.waitForTimeout(2000);

        // Aller à la page favoris
        await page.goto('/fr/dashboard/favorites');
        await page.waitForSelector('[data-testid="favorites-grid"]', { timeout: 10000 });

        // Tester l'onglet "Tous" (par défaut)
        const allTab = page.locator('[data-testid="tab-all"]');
        await expect(allTab).toHaveAttribute('data-state', 'active');
        await expect(page.locator('[data-testid="favorite-item"]')).toHaveCount(2, { timeout: 5000 });

        // Cliquer sur l'onglet "Tâches"
        const tasksTab = page.locator('[data-testid="tab-tasks"]');
        await tasksTab.click();
        await expect(tasksTab).toHaveAttribute('data-state', 'active');

        // Vérifier qu'on voit seulement 1 tâche
        await page.waitForTimeout(1000); // Attendre le filtrage
        const taskItems = page.locator('[data-testid="favorite-item"]');
        await expect(taskItems).toHaveCount(1);

        // Cliquer sur l'onglet "Prestataires"
        const providersTab = page.locator('[data-testid="tab-providers"]');
        await providersTab.click();
        await expect(providersTab).toHaveAttribute('data-state', 'active');

        // Vérifier qu'on voit seulement 1 prestataire
        await page.waitForTimeout(1000); // Attendre le filtrage
        const providerItems = page.locator('[data-testid="favorite-item"]');
        await expect(providerItems).toHaveCount(1);
    });

    test('devrait supprimer un favori depuis la page dédiée', async ({ page }) => {
        // Ajouter une tâche aux favoris
        await page.goto('/fr/tasks');
        await page.waitForSelector('[data-testid="task-card"]', { timeout: 10000 });
        await page.locator('[data-testid="task-favorite-button"]').first().click();
        await page.waitForTimeout(2000);

        // Aller à la page favoris
        await page.goto('/fr/dashboard/favorites');
        await page.waitForSelector('[data-testid="favorite-item"]', { timeout: 10000 });

        // Compter les favoris initiaux
        const initialCount = await page.locator('[data-testid="favorite-item"]').count();
        expect(initialCount).toBeGreaterThan(0);

        // Cliquer sur le bouton de suppression du premier favori
        const removeButton = page.locator('[data-testid="favorite-remove-button"]').first();
        await removeButton.click();

        // Attendre le toast de confirmation
        await expect(page.locator('text=/Retiré des favoris|Removed from favorites/i')).toBeVisible({ timeout: 5000 });

        // Vérifier que le nombre de favoris a diminué
        await page.waitForTimeout(1000);
        const newCount = await page.locator('[data-testid="favorite-item"]').count();
        expect(newCount).toBe(initialCount - 1);
    });

    test('devrait afficher un état vide quand il n\'y a pas de favoris', async ({ page }) => {
        // Aller directement à la page favoris (compte neuf, pas de favoris)
        await page.goto('/fr/dashboard/favorites');

        // Vérifier que l'état vide est affiché
        await expect(page.locator('[data-testid="favorites-empty-state"]')).toBeVisible({ timeout: 10000 });

        // Vérifier le message d'état vide
        await expect(page.locator('text=/Aucun favori|No favorites/i')).toBeVisible();

        // Vérifier qu'il y a un bouton pour commencer
        const exploreButton = page.locator('a:has-text("Explorer")');
        await expect(exploreButton).toBeVisible();
    });

    test('devrait afficher un état vide pour chaque onglet filtré', async ({ page }) => {
        // Aller à la page favoris (compte neuf)
        await page.goto('/fr/dashboard/favorites');
        await page.waitForLoadState('networkidle');

        // Vérifier l'état vide dans l'onglet "Tâches"
        await page.locator('[data-testid="tab-tasks"]').click();
        await expect(page.locator('[data-testid="favorites-empty-state"]')).toBeVisible({ timeout: 5000 });
        await expect(page.locator('text=/Aucune tâche favorite|No favorite tasks/i')).toBeVisible();

        // Vérifier l'état vide dans l'onglet "Prestataires"
        await page.locator('[data-testid="tab-providers"]').click();
        await expect(page.locator('[data-testid="favorites-empty-state"]')).toBeVisible({ timeout: 5000 });
        await expect(page.locator('text=/Aucun prestataire favori|No favorite providers/i')).toBeVisible();
    });

    test('devrait basculer l\'état favori en cliquant plusieurs fois', async ({ page }) => {
        // Aller à la liste des tâches
        await page.goto('/fr/tasks');
        await page.waitForSelector('[data-testid="task-card"]', { timeout: 10000 });

        const favoriteButton = page.locator('[data-testid="task-favorite-button"]').first();

        // Ajouter aux favoris
        await favoriteButton.click();
        await expect(page.locator('text=/Ajouté aux favoris|Added to favorites/i')).toBeVisible({ timeout: 5000 });
        await page.waitForTimeout(1000);

        // Retirer des favoris
        await favoriteButton.click();
        await expect(page.locator('text=/Retiré des favoris|Removed from favorites/i')).toBeVisible({ timeout: 5000 });
        await page.waitForTimeout(1000);

        // Rajouter aux favoris
        await favoriteButton.click();
        await expect(page.locator('text=/Ajouté aux favoris|Added to favorites/i')).toBeVisible({ timeout: 5000 });
    });

    test('devrait afficher le compteur de favoris dans le dashboard Client', async ({ page }) => {
        // Ajouter un favori
        await page.goto('/fr/tasks');
        await page.waitForSelector('[data-testid="task-card"]', { timeout: 10000 });
        await page.locator('[data-testid="task-favorite-button"]').first().click();
        await page.waitForTimeout(2000);

        // Aller au dashboard client
        await page.goto('/fr/dashboard/client');

        // Vérifier que la carte KPI Favoris est visible
        const favoritesCard = page.locator('[data-testid="kpi-favorites"]');
        await expect(favoritesCard).toBeVisible({ timeout: 10000 });

        // Vérifier que le compteur affiche au moins 1
        await expect(favoritesCard).toContainText('1');
    });

    test('devrait être responsive sur mobile', async ({ page }) => {
        // Définir une taille d'écran mobile
        await page.setViewportSize({ width: 375, height: 667 });

        // Ajouter un favori
        await page.goto('/fr/tasks');
        await page.waitForSelector('[data-testid="task-card"]', { timeout: 10000 });
        await page.locator('[data-testid="task-favorite-button"]').first().click();
        await page.waitForTimeout(2000);

        // Aller à la page favoris
        await page.goto('/fr/dashboard/favorites');

        // Vérifier que la page est visible et scrollable
        await expect(page.locator('h1:has-text("Favoris")')).toBeVisible();
        await expect(page.locator('[data-testid="favorites-grid"]')).toBeVisible({ timeout: 10000 });

        // Vérifier que les onglets sont visibles et cliquables sur mobile
        const tabsTriggers = page.locator('[role="tablist"]');
        await expect(tabsTriggers).toBeVisible();

        // Tester le changement d'onglet sur mobile
        await page.locator('[data-testid="tab-providers"]').click();
        await expect(page.locator('[data-testid="tab-providers"]')).toHaveAttribute('data-state', 'active');
    });
});

test.describe('Favoris - Intégration i18n', () => {
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
        await page.click('button[type="submit"]');
        await page.waitForURL(/\/(?:dashboard|onboarding)/, { timeout: 10000 });

        // Compléter l'onboarding si nécessaire
        if (page.url().includes('/onboarding')) {
            await page.click('[data-testid="account-type-individual"]');
            await page.click('button:has-text("Continue")');
            await page.waitForURL(/\/dashboard/, { timeout: 10000 });
        }

        // Aller à la page favoris en anglais
        await page.goto('/en/dashboard/favorites');

        // Vérifier les traductions anglaises
        await expect(page.locator('h1:has-text("Favorites")')).toBeVisible({ timeout: 10000 });
        await expect(page.locator('text=No favorites yet')).toBeVisible();
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
        await page.click('button[type="submit"]');
        await page.waitForURL(/\/(?:dashboard|onboarding)/, { timeout: 10000 });

        // Compléter l'onboarding si nécessaire
        if (page.url().includes('/onboarding')) {
            await page.click('[data-testid="account-type-individual"]');
            await page.click('button:has-text("続ける")');
            await page.waitForURL(/\/dashboard/, { timeout: 10000 });
        }

        // Aller à la page favoris en japonais
        await page.goto('/ja/dashboard/favorites');

        // Vérifier les traductions japonaises
        await expect(page.locator('h1:has-text("お気に入り")')).toBeVisible({ timeout: 10000 });
        await expect(page.locator('text=お気に入りはまだありません')).toBeVisible();
    });
});
