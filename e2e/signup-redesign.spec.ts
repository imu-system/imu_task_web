import { test, expect } from '@playwright/test';

/**
 * Test Suite: Signup Page Redesign (Task 2.1)
 * 
 * Tests pour la page /auth/signup modernisée:
 * - Layout 2 colonnes (form + illustration)
 * - Validation temps réel avec Zod
 * - OAuth Google/Apple
 * - Responsive design
 * - i18n FR/EN
 */

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:9002';

test.describe('Signup Page - Layout & Design', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/fr/auth/signup`);
  });

  test('should display signup page with all elements', async ({ page }) => {
    // Vérifier le titre
    await expect(page.getByRole('heading', { name: /créez votre compte/i })).toBeVisible();
    
    // Vérifier les champs du formulaire
    await expect(page.getByLabel(/prénom/i)).toBeVisible();
    await expect(page.getByLabel(/nom/i)).toBeVisible();
    await expect(page.getByLabel(/adresse e-mail/i)).toBeVisible();
    await expect(page.getByLabel(/mot de passe/i)).toBeVisible();
    
    // Vérifier les boutons OAuth
    await expect(page.getByRole('button', { name: /continuer avec google/i })).toBeVisible();
    
    // Vérifier le bouton submit
    await expect(page.getByRole('button', { name: /créer mon compte/i })).toBeVisible();
  });

  test('should display 2-column layout on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    
    // Vérifier le conteneur principal
    const mainCard = page.locator('.rounded-3xl').first();
    await expect(mainCard).toBeVisible();
  });
});

test.describe('Signup Page - Form Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/fr/auth/signup`);
  });

  test('should show validation error for invalid email', async ({ page }) => {
    const emailInput = page.getByLabel(/adresse e-mail/i);
    
    await emailInput.fill('invalid-email');
    await page.getByLabel(/mot de passe/i).click(); // Blur
    
    await expect(page.locator('text=/adresse e-mail invalide/i')).toBeVisible({ timeout: 3000 });
  });

  test('should show validation error for short password', async ({ page }) => {
    const passwordInput = page.getByLabel(/mot de passe/i);
    
    await passwordInput.fill('12345');
    await page.getByLabel(/prénom/i).click(); // Blur
    
    await expect(page.locator('text=/au moins 6 caractères/i')).toBeVisible({ timeout: 3000 });
  });
});

test.describe('Signup Page - Responsive', () => {
  test('should work on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`${BASE_URL}/fr/auth/signup`);
    
    await expect(page.getByRole('heading', { name: /créez votre compte/i })).toBeVisible();
    await expect(page.getByLabel(/prénom/i)).toBeVisible();
  });
});

test.describe('Signup Page - i18n', () => {
  test('should display French translations', async ({ page }) => {
    await page.goto(`${BASE_URL}/fr/auth/signup`);
    await expect(page.getByRole('heading', { name: /créez votre compte/i })).toBeVisible();
  });

  test('should display English translations', async ({ page }) => {
    await page.goto(`${BASE_URL}/en/auth/signup`);
    await expect(page.getByRole('heading', { name: /create your account/i })).toBeVisible();
  });
});
