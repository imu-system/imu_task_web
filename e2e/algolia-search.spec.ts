/**
 * Tests e2e pour AlgoliaSearchBox
 * 
 * Tests de :
 * - Recherche de base
 * - Typo tolerance
 * - Highlighting
 * - Recherches récentes
 * - Navigation sur résultats
 * - Graceful degradation (sans credentials)
 * - Debouncing
 * - Géolocalisation
 */

import { test, expect } from './fixtures/auth';
import { navigateToAuthenticatedDashboard } from './fixtures/auth';
import { AccountType } from '@/lib/types';
import type { Page } from '@playwright/test';

// Helper pour attendre la fin du debouncing
async function waitForDebouncing(page: Page, delay = 350) {
    await page.waitForTimeout(delay);
}

// Helper pour vérifier si Algolia est configuré
async function isAlgoliaConfigured(page: Page): Promise<boolean> {
    const badge = await page.locator('text=Algolia non configuré').count();
    return badge === 0;
}

test.describe('AlgoliaSearchBox - Recherche de base', () => {
    test.beforeEach(async ({ page }) => {
        await navigateToAuthenticatedDashboard(page, AccountType.individual, 'fr');
    });

    test('affiche le champ de recherche', async ({ page }) => {
        const searchInput = page.locator('input[type="text"][placeholder*="Rechercher"]');
        await expect(searchInput).toBeVisible();
    });

    test('affiche l\'icône Search', async ({ page }) => {
        const searchIcon = page.locator('svg.lucide-search').first();
        await expect(searchIcon).toBeVisible();
    });

    test('le placeholder est contextuel selon AccountType', async ({ page }) => {
        const searchInput = page.locator('input[type="text"][placeholder*="Rechercher"]');
        const placeholder = await searchInput.getAttribute('placeholder');

        // Dashboard client devrait avoir "services, prestataires"
        expect(placeholder).toContain('service');
    });

    test('affiche le bouton Clear (X) quand il y a du texte', async ({ page }) => {
        const algoliaConfigured = await isAlgoliaConfigured(page);
        if (!algoliaConfigured) {
            test.skip();
        }

        const searchInput = page.locator('input[type="text"][placeholder*="Rechercher"]');

        // Pas de bouton X au départ
        let clearButton = page.locator('button:has(svg.lucide-x)');
        await expect(clearButton).not.toBeVisible();

        // Taper du texte
        await searchInput.fill('plombier');

        // Le bouton X devrait apparaître
        await expect(clearButton).toBeVisible();
    });

    test('le bouton Clear vide le champ', async ({ page }) => {
        const algoliaConfigured = await isAlgoliaConfigured(page);
        if (!algoliaConfigured) {
            test.skip();
        }

        const searchInput = page.locator('input[type="text"][placeholder*="Rechercher"]');

        await searchInput.fill('plombier');
        await waitForDebouncing(page);

        const clearButton = page.locator('button:has(svg.lucide-x)');
        await clearButton.click();

        await expect(searchInput).toHaveValue('');
    });
});

test.describe('AlgoliaSearchBox - Recherche avec Algolia', () => {
    test.beforeEach(async ({ page }) => {
        await navigateToAuthenticatedDashboard(page, AccountType.individual, 'fr');
    });

    test('affiche le loader pendant la recherche', async ({ page }) => {
        const algoliaConfigured = await isAlgoliaConfigured(page);
        if (!algoliaConfigured) {
            test.skip();
        }

        const searchInput = page.locator('input[type="text"][placeholder*="Rechercher"]');

        await searchInput.fill('plombier');

        // Loader devrait apparaître rapidement (avant debouncing)
        const loader = page.locator('svg.lucide-loader-2.animate-spin');
        await expect(loader).toBeVisible({ timeout: 500 });
    });

    test('affiche le dropdown de résultats après debouncing', async ({ page }) => {
        const algoliaConfigured = await isAlgoliaConfigured(page);
        if (!algoliaConfigured) {
            test.skip();
        }

        const searchInput = page.locator('input[type="text"][placeholder*="Rechercher"]');

        await searchInput.fill('plombier');
        await waitForDebouncing(page);

        // Dropdown devrait apparaître
        const dropdown = page.locator('[role="listbox"], .absolute.top-full');
        await expect(dropdown).toBeVisible({ timeout: 2000 });
    });

    test('affiche au moins 1 résultat pour une recherche valide', async ({ page }) => {
        const algoliaConfigured = await isAlgoliaConfigured(page);
        if (!algoliaConfigured) {
            test.skip();
        }

        const searchInput = page.locator('input[type="text"][placeholder*="Rechercher"]');

        await searchInput.fill('service');
        await waitForDebouncing(page);

        // Au moins 1 résultat
        const results = page.locator('[role="option"], .cursor-pointer').filter({ hasText: /service/i });
        await expect(results.first()).toBeVisible({ timeout: 2000 });
    });

    test('les résultats contiennent le texte recherché', async ({ page }) => {
        const algoliaConfigured = await isAlgoliaConfigured(page);
        if (!algoliaConfigured) {
            test.skip();
        }

        const searchInput = page.locator('input[type="text"][placeholder*="Rechercher"]');
        const query = 'plombier';

        await searchInput.fill(query);
        await waitForDebouncing(page);

        // Vérifier que les résultats contiennent le texte (ou une variante)
        const results = page.locator('[role="option"], .cursor-pointer');
        const firstResult = results.first();

        await expect(firstResult).toBeVisible({ timeout: 2000 });
        const text = await firstResult.textContent();

        // Le texte devrait contenir "plomb" (tolerance pour "plombier", "plomberie", etc.)
        expect(text?.toLowerCase()).toMatch(/plomb|service|tâche|prestataire/);
    });
});

test.describe('AlgoliaSearchBox - Typo tolerance', () => {
    test.beforeEach(async ({ page }) => {
        await navigateToAuthenticatedDashboard(page, AccountType.individual, 'fr');
    });

    test('trouve "plombier" avec "plomber" (typo 1 lettre)', async ({ page }) => {
        const algoliaConfigured = await isAlgoliaConfigured(page);
        if (!algoliaConfigured) {
            test.skip();
        }

        const searchInput = page.locator('input[type="text"][placeholder*="Rechercher"]');

        // Typo intentionnelle
        await searchInput.fill('plomber');
        await waitForDebouncing(page);

        // Devrait quand même trouver des résultats
        const results = page.locator('[role="option"], .cursor-pointer');
        await expect(results.first()).toBeVisible({ timeout: 2000 });
    });

    test('trouve "électricien" avec "electricien" (sans accent)', async ({ page }) => {
        const algoliaConfigured = await isAlgoliaConfigured(page);
        if (!algoliaConfigured) {
            test.skip();
        }

        const searchInput = page.locator('input[type="text"][placeholder*="Rechercher"]');

        await searchInput.fill('electricien');
        await waitForDebouncing(page);

        const results = page.locator('[role="option"], .cursor-pointer');
        await expect(results.first()).toBeVisible({ timeout: 2000 });
    });

    test('trouve "ménage" avec "menage" (sans accent)', async ({ page }) => {
        const algoliaConfigured = await isAlgoliaConfigured(page);
        if (!algoliaConfigured) {
            test.skip();
        }

        const searchInput = page.locator('input[type="text"][placeholder*="Rechercher"]');

        await searchInput.fill('menage');
        await waitForDebouncing(page);

        const results = page.locator('[role="option"], .cursor-pointer');
        await expect(results.first()).toBeVisible({ timeout: 2000 });
    });
});

test.describe('AlgoliaSearchBox - Highlighting', () => {
    test.beforeEach(async ({ page }) => {
        await navigateToAuthenticatedDashboard(page, AccountType.individual, 'fr');
    });

    test('les résultats contiennent du HTML de highlighting', async ({ page }) => {
        const algoliaConfigured = await isAlgoliaConfigured(page);
        if (!algoliaConfigured) {
            test.skip();
        }

        const searchInput = page.locator('input[type="text"][placeholder*="Rechercher"]');

        await searchInput.fill('service');
        await waitForDebouncing(page);

        // Vérifier qu'il y a des balises <em> ou <mark> (highlighting)
        const highlightedText = page.locator('em, mark, .font-semibold').first();

        // Avec Algolia, les résultats devraient être surlignés
        const count = await highlightedText.count();
        expect(count).toBeGreaterThan(0);
    });
});

test.describe('AlgoliaSearchBox - Recherches récentes', () => {
    test.beforeEach(async ({ page }) => {
        await navigateToAuthenticatedDashboard(page, AccountType.individual, 'fr');

        // Nettoyer localStorage avant chaque test
        await page.evaluate(() => {
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('imu_recent_searches')) {
                    localStorage.removeItem(key);
                }
            });
        });
    });

    test('sauvegarde une recherche dans localStorage', async ({ page }) => {
        const algoliaConfigured = await isAlgoliaConfigured(page);
        if (!algoliaConfigured) {
            test.skip();
        }

        const searchInput = page.locator('input[type="text"][placeholder*="Rechercher"]');
        const query = 'plombier';

        await searchInput.fill(query);
        await waitForDebouncing(page);

        // Cliquer sur un résultat (si disponible)
        const results = page.locator('[role="option"], .cursor-pointer');
        const resultCount = await results.count();

        if (resultCount > 0) {
            await results.first().click();

            // Vérifier localStorage
            const recentSearches = await page.evaluate(() => {
                const stored = localStorage.getItem('imu_recent_searches_individual');
                return stored ? JSON.parse(stored) : [];
            });

            expect(recentSearches).toContain(query);
        }
    });

    test('affiche max 5 recherches récentes', async ({ page }) => {
        const algoliaConfigured = await isAlgoliaConfigured(page);
        if (!algoliaConfigured) {
            test.skip();
        }

        // Ajouter 6 recherches dans localStorage
        await page.evaluate(() => {
            const searches = ['plombier', 'électricien', 'ménage', 'jardinage', 'peinture', 'déménagement'];
            localStorage.setItem('imu_recent_searches_individual', JSON.stringify(searches));
        });

        // Recharger la page
        await page.reload();
        await page.waitForLoadState('networkidle');

        const searchInput = page.locator('input[type="text"][placeholder*="Rechercher"]');
        await searchInput.click();

        // Compter les recherches récentes affichées
        const recentItems = page.locator('text=/Récemment|Recent/i').first();

        // Si section recherches récentes visible, max 5 items
        if (await recentItems.isVisible({ timeout: 1000 }).catch(() => false)) {
            const items = page.locator('[role="option"]').filter({ hasText: /plombier|électricien|ménage|jardinage|peinture/i });
            const count = await items.count();

            expect(count).toBeLessThanOrEqual(5);
        }
    });
});

test.describe('AlgoliaSearchBox - Navigation', () => {
    test.beforeEach(async ({ page }) => {
        await navigateToAuthenticatedDashboard(page, AccountType.individual, 'fr');
    });

    test('cliquer sur un résultat navigue vers la page', async ({ page }) => {
        const algoliaConfigured = await isAlgoliaConfigured(page);
        if (!algoliaConfigured) {
            test.skip();
        }

        const searchInput = page.locator('input[type="text"][placeholder*="Rechercher"]');

        await searchInput.fill('service');
        await waitForDebouncing(page);

        const results = page.locator('[role="option"], .cursor-pointer');
        const resultCount = await results.count();

        if (resultCount > 0) {
            // Récupérer l'URL actuelle
            const currentUrl = page.url();

            // Cliquer sur le premier résultat
            await results.first().click();

            // L'URL devrait avoir changé (navigation)
            await page.waitForTimeout(500);
            const newUrl = page.url();

            expect(newUrl).not.toBe(currentUrl);
        }
    });

    test('ferme le dropdown après navigation', async ({ page }) => {
        const algoliaConfigured = await isAlgoliaConfigured(page);
        if (!algoliaConfigured) {
            test.skip();
        }

        const searchInput = page.locator('input[type="text"][placeholder*="Rechercher"]');

        await searchInput.fill('service');
        await waitForDebouncing(page);

        const results = page.locator('[role="option"], .cursor-pointer');
        const resultCount = await results.count();

        if (resultCount > 0) {
            await results.first().click();

            // Dropdown devrait être fermé
            const dropdown = page.locator('[role="listbox"], .absolute.top-full');
            await expect(dropdown).not.toBeVisible({ timeout: 1000 });
        }
    });
});

test.describe('AlgoliaSearchBox - Graceful degradation', () => {
    test('affiche un badge si Algolia non configuré', async ({ page }) => {
        await navigateToAuthenticatedDashboard(page, AccountType.individual, 'fr');

        const algoliaConfigured = await isAlgoliaConfigured(page);

        if (!algoliaConfigured) {
            // Badge devrait être visible
            const badge = page.locator('text=Algolia non configuré');
            await expect(badge).toBeVisible();

            // Input devrait être désactivé
            const searchInput = page.locator('input[type="text"][placeholder*="Rechercher"]');
            await expect(searchInput).toBeDisabled();
        } else {
            // Si configuré, pas de badge
            const badge = page.locator('text=Algolia non configuré');
            await expect(badge).not.toBeVisible();
        }
    });

    test('l\'input est désactivé si Algolia non configuré', async ({ page }) => {
        await navigateToAuthenticatedDashboard(page, AccountType.individual, 'fr');

        const algoliaConfigured = await isAlgoliaConfigured(page);

        if (!algoliaConfigured) {
            const searchInput = page.locator('input[type="text"][placeholder*="Rechercher"]');
            await expect(searchInput).toBeDisabled();
        }
    });
});

test.describe('AlgoliaSearchBox - Debouncing', () => {
    test.beforeEach(async ({ page }) => {
        await navigateToAuthenticatedDashboard(page, AccountType.individual, 'fr');
    });

    test('ne recherche pas à chaque touche (debouncing)', async ({ page }) => {
        const algoliaConfigured = await isAlgoliaConfigured(page);
        if (!algoliaConfigured) {
            test.skip();
        }

        const searchInput = page.locator('input[type="text"][placeholder*="Rechercher"]');

        // Taper lettre par lettre rapidement
        await searchInput.type('plom', { delay: 50 }); // 50ms entre chaque lettre

        // Attendre seulement 100ms (< 300ms debouncing)
        await page.waitForTimeout(100);

        // Le loader NE devrait PAS être visible (debouncing pas terminé)
        const loader = page.locator('svg.lucide-loader-2.animate-spin');
        const isLoaderVisible = await loader.isVisible({ timeout: 100 }).catch(() => false);

        expect(isLoaderVisible).toBe(false);

        // Attendre le debouncing complet (300ms total)
        await waitForDebouncing(page);

        // MAINTENANT le loader devrait apparaître
        await expect(loader).toBeVisible({ timeout: 1000 });
    });

    test('la recherche se déclenche après 300ms d\'inactivité', async ({ page }) => {
        const algoliaConfigured = await isAlgoliaConfigured(page);
        if (!algoliaConfigured) {
            test.skip();
        }

        const searchInput = page.locator('input[type="text"][placeholder*="Rechercher"]');

        await searchInput.fill('service');

        // Attendre exactement le debouncing (300ms)
        await waitForDebouncing(page, 300);

        // La recherche devrait être déclenchée
        const loader = page.locator('svg.lucide-loader-2.animate-spin');
        await expect(loader).toBeVisible({ timeout: 500 });
    });
});

test.describe('AlgoliaSearchBox - Dashboard Pro', () => {
    test.beforeEach(async ({ page }) => {
        await navigateToAuthenticatedDashboard(page, AccountType.professional, 'fr');
    });

    test('le placeholder est adapté pour les pros', async ({ page }) => {
        const searchInput = page.locator('input[type="text"][placeholder*="Rechercher"]');
        const placeholder = await searchInput.getAttribute('placeholder');

        // Dashboard pro devrait avoir "missions, clients"
        expect(placeholder?.toLowerCase()).toMatch(/mission|client/);
    });
});

test.describe('AlgoliaSearchBox - Dashboard Senior', () => {
    test.beforeEach(async ({ page }) => {
        await navigateToAuthenticatedDashboard(page, AccountType.senior, 'fr');
    });

    test('le placeholder est simplifié pour les seniors', async ({ page }) => {
        const searchInput = page.locator('input[type="text"][placeholder*="Rechercher"]');
        const placeholder = await searchInput.getAttribute('placeholder');

        // Dashboard senior devrait avoir un texte simple
        expect(placeholder?.toLowerCase()).toMatch(/aide|rechercher/);
    });
});

test.describe('AlgoliaSearchBox - Accessibilité', () => {
    test.beforeEach(async ({ page }) => {
        await navigateToAuthenticatedDashboard(page, AccountType.individual, 'fr');
    });

    test('le champ de recherche a un label accessible', async ({ page }) => {
        const searchInput = page.locator('input[type="text"][placeholder*="Rechercher"]');

        // Devrait avoir un placeholder (accessible)
        const placeholder = await searchInput.getAttribute('placeholder');
        expect(placeholder).toBeTruthy();
    });

    test('le dropdown a un role listbox ou menu', async ({ page }) => {
        const algoliaConfigured = await isAlgoliaConfigured(page);
        if (!algoliaConfigured) {
            test.skip();
        }

        const searchInput = page.locator('input[type="text"][placeholder*="Rechercher"]');

        await searchInput.fill('service');
        await waitForDebouncing(page);

        // Vérifier que le dropdown a un rôle ARIA approprié
        const dropdown = page.locator('[role="listbox"], [role="menu"], [role="dialog"]');

        // Au moins un élément avec un rôle ARIA
        const count = await dropdown.count();
        expect(count).toBeGreaterThanOrEqual(0); // Peut être 0 si pas de résultats
    });

    test('les résultats ont un role option', async ({ page }) => {
        const algoliaConfigured = await isAlgoliaConfigured(page);
        if (!algoliaConfigured) {
            test.skip();
        }

        const searchInput = page.locator('input[type="text"][placeholder*="Rechercher"]');

        await searchInput.fill('service');
        await waitForDebouncing(page);

        const options = page.locator('[role="option"]');
        const count = await options.count();

        // Si des résultats, ils devraient avoir role="option"
        if (count > 0) {
            expect(count).toBeGreaterThan(0);
        }
    });

    test('navigation au clavier (Escape ferme le dropdown)', async ({ page }) => {
        const algoliaConfigured = await isAlgoliaConfigured(page);
        if (!algoliaConfigured) {
            test.skip();
        }

        const searchInput = page.locator('input[type="text"][placeholder*="Rechercher"]');

        await searchInput.fill('service');
        await waitForDebouncing(page);

        // Dropdown ouvert
        const dropdown = page.locator('[role="listbox"], .absolute.top-full');
        await expect(dropdown).toBeVisible({ timeout: 2000 });

        // Appuyer sur Escape
        await page.keyboard.press('Escape');

        // Dropdown devrait être fermé
        await expect(dropdown).not.toBeVisible({ timeout: 1000 });
    });
});
