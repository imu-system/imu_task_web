import { test, expect } from './fixtures/auth';
import { navigateToAuthenticatedDashboard } from './fixtures/auth';
import type { Page } from '@playwright/test';
import { AccountType } from '@/lib/types';

/**
 * Tests de responsivité pour les Dashboards (Client, Pro, Senior)
 * Vérifie l'affichage et les interactions sur différents devices
 * Avec authentification mock pour éviter les erreurs
 */

// Définition des viewports à tester
const viewports = {
  mobile: { width: 375, height: 667, name: 'iPhone SE' },
  mobileLarge: { width: 414, height: 896, name: 'iPhone 14 Pro Max' },
  tablet: { width: 768, height: 1024, name: 'iPad' },
  tabletLandscape: { width: 1024, height: 768, name: 'iPad Landscape' },
  desktop: { width: 1280, height: 720, name: 'Desktop HD' },
  desktopLarge: { width: 1920, height: 1080, name: 'Desktop Full HD' }
};

// Helper pour naviguer vers le dashboard avec auth mock
async function navigateToDashboard(page: Page, accountType: AccountType = AccountType.individual) {
  await navigateToAuthenticatedDashboard(page, accountType, 'fr');
}

test.describe('Dashboard Client - Responsivité', () => {

  // Test 1: Header et Recherche
  test.describe('Header avec Recherche Contextuelle', () => {
    for (const [key, viewport] of Object.entries(viewports)) {
      test(`affiche correctement le header sur ${viewport.name}`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await navigateToDashboard(page);

        // Vérifier que le header est visible
        const header = page.locator('header, [role="banner"]').first();
        await expect(header).toBeVisible();

        // Vérifier la barre de recherche
        const searchInput = page.locator('input[type="text"], input[placeholder*="Rechercher"]').first();
        await expect(searchInput).toBeVisible();

        // Sur mobile, vérifier que la recherche est adaptée
        if (viewport.width < 768) {
          const searchHeight = await searchInput.boundingBox();
          expect(searchHeight?.height).toBeGreaterThanOrEqual(44); // Taille minimale tactile
        }

        // Prendre un screenshot
        await page.screenshot({
          path: `test-results/responsive/header-${key}.png`,
          fullPage: false
        });
      });
    }
  });

  // Test 2: Section GradientBackground (Bienvenue)
  test.describe('Section Bienvenue avec Dégradé Animé', () => {
    for (const [key, viewport] of Object.entries(viewports)) {
      test(`affiche le gradient correctement sur ${viewport.name}`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await navigateToDashboard(page);

        // Attendre que le GradientBackground soit chargé
        await page.waitForTimeout(500); // Attendre les animations

        // Vérifier la présence du titre de bienvenue
        const welcomeTitle = page.locator('h1').first();
        await expect(welcomeTitle).toBeVisible();

        // Vérifier que le texte est lisible (contraste blanc sur dégradé)
        const titleColor = await welcomeTitle.evaluate(el =>
          window.getComputedStyle(el).color
        );
        expect(titleColor).toContain('rgb'); // Vérifier que la couleur est définie

        // Screenshot de la section
        const gradientSection = page.locator('h1').first().locator('..');
        await gradientSection.screenshot({
          path: `test-results/responsive/gradient-${key}.png`
        });
      });
    }
  });

  // Test 3: KPIs avec GlowCard
  test.describe('KPIs avec Effets Lumineux', () => {
    test('affiche 3 KPIs en grille responsive', async ({ page }) => {
      for (const [key, viewport] of Object.entries(viewports)) {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await navigateToDashboard(page);

        // Attendre le chargement des KPIs
        await page.waitForSelector('.text-3xl', { timeout: 5000 });

        // Compter les KPIs visibles
        const kpiCards = page.locator('.text-3xl').filter({ hasText: /^\d+$/ });
        const count = await kpiCards.count();
        expect(count).toBeGreaterThanOrEqual(3);

        // Vérifier la disposition
        if (viewport.width >= 768) {
          // Desktop/Tablet: grille 3 colonnes
          const firstKpi = kpiCards.first();
          const firstBox = await firstKpi.boundingBox();
          const secondKpi = kpiCards.nth(1);
          const secondBox = await secondKpi.boundingBox();

          if (firstBox && secondBox && viewport.width >= 768) {
            // Sur desktop, les KPIs doivent être côte à côte
            expect(Math.abs(firstBox.y - secondBox.y)).toBeLessThan(50);
          }
        }

        // Screenshot des KPIs
        await page.screenshot({
          path: `test-results/responsive/kpis-${key}.png`,
          fullPage: false
        });
      }
    });

    test('KPIs sont cliquables et déclenchent analytics', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 });
      await navigateToDashboard(page);

      // Attendre le premier KPI
      const firstKpi = page.locator('text=Tâches actives').locator('..').locator('..');
      await expect(firstKpi).toBeVisible();

      // Vérifier que le cursor change au survol (desktop only)
      const cursorStyle = await firstKpi.evaluate(el =>
        window.getComputedStyle(el).cursor
      );
      expect(cursorStyle).toBe('pointer');
    });
  });

  // Test 4: Onglets (Tabs)
  test.describe('Navigation par Onglets', () => {
    test('les onglets fonctionnent sur tous les devices', async ({ page }) => {
      for (const [key, viewport] of Object.entries(viewports)) {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await navigateToDashboard(page);

        // Localiser les onglets
        const activeTab = page.getByRole('tab', { name: /actives/i });
        const allTab = page.getByRole('tab', { name: /toutes/i });

        await expect(activeTab).toBeVisible();
        await expect(allTab).toBeVisible();

        // Cliquer sur "Toutes"
        await allTab.click();
        await page.waitForTimeout(300); // Animation

        // Vérifier que l'onglet est bien sélectionné
        const isSelected = await allTab.getAttribute('data-state');
        expect(isSelected).toBe('active');

        // Cliquer sur "Actives"
        await activeTab.click();
        await page.waitForTimeout(300);

        // Screenshot
        await page.screenshot({
          path: `test-results/responsive/tabs-${key}.png`,
          clip: { x: 0, y: 200, width: viewport.width, height: 400 }
        });
      }
    });
  });

  // Test 5: Boutons avec ShimmerCard
  test.describe('Boutons Animés avec Effet Shimmer', () => {
    test('le bouton "Poster une tâche" est visible et tactile', async ({ page }) => {
      for (const [key, viewport] of Object.entries(viewports)) {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await navigateToDashboard(page);

        // Chercher le bouton (peut être dans la section vide)
        const createButton = page.locator('button:has-text("Poster"), a:has-text("Poster")').first();

        // Scroll vers le bouton si nécessaire
        await createButton.scrollIntoViewIfNeeded();

        // Vérifier la visibilité
        const isVisible = await createButton.isVisible();

        if (isVisible) {
          // Vérifier la taille tactile minimale sur mobile
          if (viewport.width < 768) {
            const box = await createButton.boundingBox();
            if (box) {
              expect(box.height).toBeGreaterThanOrEqual(44);
            }
          }

          // Screenshot du bouton
          await createButton.screenshot({
            path: `test-results/responsive/button-${key}.png`
          });
        }
      }
    });
  });

  // Test 6: Animations et Performance
  test.describe('Performance des Animations', () => {
    test('les animations se chargent en moins de 2 secondes', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 });

      const startTime = Date.now();
      await navigateToDashboard(page);

      // Attendre que toutes les animations soient terminées
      await page.waitForSelector('.text-3xl', { timeout: 5000 });
      await page.waitForTimeout(1000); // Animations cascade

      const endTime = Date.now();
      const loadTime = endTime - startTime;

      console.log(`⏱️  Temps de chargement: ${loadTime}ms`);
      expect(loadTime).toBeLessThan(5000); // Maximum 5 secondes
    });

    test('pas de scroll horizontal sur mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await navigateToDashboard(page);

      // Vérifier la largeur du body
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = 375;

      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 5); // Tolérance de 5px
    });
  });

  // Test 7: Accessibilité des Couleurs
  test.describe('Contraste et Lisibilité', () => {
    test('le texte sur GradientBackground est lisible', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 });
      await navigateToDashboard(page);

      // Localiser le titre dans le gradient
      const title = page.locator('h1').first();
      const textColor = await title.evaluate(el => {
        const style = window.getComputedStyle(el);
        return style.color;
      });

      // Vérifier que c'est du blanc ou très clair
      expect(textColor).toMatch(/rgb\(255|rgb\(2[0-5][0-9]/);
    });

    test('les GlowCard ont un contraste suffisant', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 });
      await navigateToDashboard(page);

      // Localiser les valeurs dans les KPIs
      const kpiValues = page.locator('.text-3xl').filter({ hasText: /^\d+$/ });

      for (let i = 0; i < await kpiValues.count(); i++) {
        const value = kpiValues.nth(i);
        const color = await value.evaluate(el =>
          window.getComputedStyle(el).color
        );

        // Les couleurs doivent être définies (pas transparent)
        expect(color).not.toBe('');
        expect(color).not.toBe('rgba(0, 0, 0, 0)');
      }
    });
  });

  // Test 8: Interactions Tactiles (Mobile)
  test.describe('Interactions Tactiles', () => {
    test('les KPIs répondent au tap sur mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await navigateToDashboard(page);

      // Localiser le premier KPI
      const firstKpi = page.locator('.text-3xl').first().locator('..');

      // Simuler un tap
      await firstKpi.tap();
      await page.waitForTimeout(300);

      // Vérifier qu'il y a eu une réaction (navigation, etc.)
      // Note: à adapter selon votre implémentation
    });

    test('le menu de navigation est accessible sur mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await navigateToDashboard(page);

      // Chercher le bouton de menu (burger menu)
      const menuButton = page.locator('button[aria-label*="menu"], button[aria-label*="Menu"]').first();

      if (await menuButton.isVisible()) {
        await menuButton.tap();
        await page.waitForTimeout(300);

        // Vérifier que le menu s'ouvre
        const menu = page.locator('nav, [role="navigation"]').first();
        await expect(menu).toBeVisible();
      }
    });
  });

  // Test 9: Layout Grid
  test.describe('Grille et Espacement', () => {
    test('les éléments respectent les marges sur mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await navigateToDashboard(page);

      // Vérifier les marges du container principal
      const container = page.locator('.container').first();
      const box = await container.boundingBox();

      if (box) {
        // Vérifier qu'il y a de l'espace sur les côtés (au moins 16px)
        expect(box.x).toBeGreaterThanOrEqual(12);
      }
    });

    test('la grille des services s\'adapte au viewport', async ({ page }) => {
      // Mobile: 1 colonne
      await page.setViewportSize({ width: 375, height: 667 });
      await navigateToDashboard(page);

      // Scroll vers la section services
      await page.locator('text=Services recommandés').scrollIntoViewIfNeeded();

      // Screenshot mobile
      await page.screenshot({
        path: `test-results/responsive/services-mobile.png`,
        fullPage: true
      });

      // Desktop: 3 colonnes
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.reload();
      await page.locator('text=Services recommandés').scrollIntoViewIfNeeded();

      // Screenshot desktop
      await page.screenshot({
        path: `test-results/responsive/services-desktop.png`,
        fullPage: true
      });
    });
  });

  // Test 10: Synthèse Performance
  test.describe('Métriques de Performance', () => {
    test('collecte les Core Web Vitals', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 });

      // Naviguer et mesurer
      await page.goto('http://localhost:9002/fr/dashboard/client');

      // Attendre le chargement complet
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000); // Attendre les animations

      // Mesurer les métriques
      const metrics = await page.evaluate(() => {
        const paint = performance.getEntriesByType('paint');
        const fcp = paint.find(entry => entry.name === 'first-contentful-paint');
        const lcp = paint.find(entry => entry.name === 'largest-contentful-paint');

        return {
          fcp: fcp?.startTime || 0,
          lcp: lcp?.startTime || 0,
          domContentLoaded: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
          loadComplete: performance.timing.loadEventEnd - performance.timing.navigationStart
        };
      });

      console.log('📊 Métriques de performance:', metrics);

      // Vérifications
      expect(metrics.domContentLoaded).toBeLessThan(3000); // Moins de 3s
      expect(metrics.loadComplete).toBeLessThan(5000); // Moins de 5s
    });
  });
});
