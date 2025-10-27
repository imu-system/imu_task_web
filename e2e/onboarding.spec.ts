/**
 * Tests E2E pour la page Onboarding - Choix AccountType (Phase 5 - Task 3.1)
 * Couvre: 3 cards AccountType, animations, sélection, responsive, i18n, a11y
 * 
 * NOTE: Utilise /onboarding/preview pour tester l'UI sans authentification
 */

import { test, expect } from '@playwright/test';

test.describe('Onboarding - Choix AccountType', () => {
    test.beforeEach(async ({ page }) => {
        // Naviguer vers la page onboarding PREVIEW (pas d'auth requise)
        await page.goto('/fr/onboarding/preview');
        await page.waitForLoadState('networkidle');
    });

    test('Test 1: Page onboarding - Éléments UI présents', async ({ page }) => {
        // Vérifier le logo ImuTask
        const logo = page.locator('img[alt="ImuTask"]');
        await expect(logo).toBeVisible();

        // Vérifier le titre de bienvenue
        const title = page.getByRole('heading', { level: 1 });
        await expect(title).toBeVisible();
        const titleText = await title.textContent();
        expect(titleText).toContain('Bienvenue');

        // Vérifier le subtitle
        const subtitle = page.getByText(/personnaliser votre expérience/i);
        await expect(subtitle).toBeVisible();

        // Vérifier le bouton Continuer
        const continueButton = page.getByRole('button', { name: /continuer/i });
        await expect(continueButton).toBeVisible();

        // Vérifier l'indicateur "Étape 1 sur 2"
        const stepIndicator = page.getByText(/étape 1 sur 2/i);
        await expect(stepIndicator).toBeVisible();

        console.log('✅ Tous les éléments UI sont présents');
    });

    test('Test 2: Les 3 cards AccountType sont affichées', async ({ page }) => {
        await page.waitForTimeout(500);

        // Vérifier Card Individual (Particulier)
        const individualCard = page.getByText('Particulier').first();
        await expect(individualCard).toBeVisible();

        const individualDesc = page.getByText(/cherche de l'aide pour mes tâches/i);
        await expect(individualDesc).toBeVisible();

        // Vérifier les 4 features de Individual
        await expect(page.getByText(/trouver des prestataires locaux/i)).toBeVisible();
        await expect(page.getByText(/paiement sécurisé/i)).toBeVisible();
        await expect(page.getByText(/avis et notes vérifiés/i)).toBeVisible();
        await expect(page.getByText(/support client disponible/i)).toBeVisible();

        // Vérifier Card Professional (Professionnel)
        const professionalCard = page.getByText('Professionnel').first();
        await expect(professionalCard).toBeVisible();

        // Vérifier Card Senior (Senior / Aidant)
        const seniorCard = page.getByText('Senior / Aidant').first();
        await expect(seniorCard).toBeVisible();

        console.log('✅ Les 3 cards sont affichées avec leurs features');
    });

    test('Test 3: Sélection card Individual - Animations et état', async ({ page }) => {
        await page.waitForTimeout(500);

        // Bouton doit être disabled initialement
        const continueButton = page.getByRole('button', { name: /continuer/i });
        await expect(continueButton).toBeDisabled();

        // Cliquer sur la card Individual
        const individualCard = page.locator('text=Particulier').first().locator('..');
        await individualCard.click();
        await page.waitForTimeout(300);

        // Vérifier que le checkmark "Sélectionné" apparaît
        const selectedBadge = page.getByText('Sélectionné');
        await expect(selectedBadge).toBeVisible();

        // Vérifier que le bouton Continuer est maintenant enabled
        await expect(continueButton).toBeEnabled();

        console.log('✅ Sélection Individual fonctionne avec animations');
    });

    test('Test 4: Sélection card Professional - Hover et animations', async ({ page }) => {
        await page.waitForTimeout(500);

        // Trouver la card Professional
        const professionalCard = page.locator('text=Professionnel').first().locator('..');

        // Hover sur la card pour tester l'animation
        await professionalCard.hover();
        await page.waitForTimeout(300);

        // Cliquer pour sélectionner
        await professionalCard.click();
        await page.waitForTimeout(300);

        // Vérifier sélection
        const selectedBadge = page.getByText('Sélectionné');
        await expect(selectedBadge).toBeVisible();

        console.log('✅ Sélection Professional avec hover fonctionne');
    });

    test('Test 5: Sélection card Senior - Vérification features PMR', async ({ page }) => {
        await page.waitForTimeout(500);

        // Cliquer sur la card Senior
        const seniorCard = page.locator('text=Senior / Aidant').first().locator('..');
        await seniorCard.click();
        await page.waitForTimeout(500);

        // Vérifier que toutes les features PMR sont présentes
        await expect(page.getByText(/services certifiés PMR.*accessibles/i)).toBeVisible();
        await expect(page.getByText(/contacts aidants d'urgence/i)).toBeVisible();
        await expect(page.getByText(/bouton SOS rapide/i)).toBeVisible();
        await expect(page.getByText(/interface vocale simplifiée/i)).toBeVisible();

        // Vérifier sélection
        const selectedBadge = page.getByText('Sélectionné');
        await expect(selectedBadge).toBeVisible();

        console.log('✅ Sélection Senior avec features PMR validée');
    });

    test('Test 6: Changement de sélection entre cards', async ({ page }) => {
        await page.waitForTimeout(500);

        // Sélectionner Individual
        const individualCard = page.locator('text=Particulier').first().locator('..');
        await individualCard.click();
        await page.waitForTimeout(300);

        // Vérifier sélection
        let selectedBadges = page.getByText('Sélectionné');
        expect(await selectedBadges.count()).toBe(1);

        // Sélectionner Professional
        const professionalCard = page.locator('text=Professionnel').first().locator('..');
        await professionalCard.click();
        await page.waitForTimeout(300);

        // Vérifier qu'une seule card est sélectionnée à la fois
        selectedBadges = page.getByText('Sélectionné');
        expect(await selectedBadges.count()).toBe(1);

        console.log('✅ Changement de sélection fonctionne (une seule card à la fois)');
    });

    test('Test 7: Responsive - Mobile 375px', async ({ page }) => {
        // Set mobile viewport
        await page.setViewportSize({ width: 375, height: 667 });

        // Naviguer vers onboarding preview
        await page.goto('/fr/onboarding/preview');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);

        // Logo visible
        const logo = page.locator('img[alt="ImuTask"]');
        await expect(logo).toBeVisible();

        // Les 3 cards doivent être visibles en vertical stack
        const individualCard = page.getByText('Particulier').first();
        await expect(individualCard).toBeVisible();

        const professionalCard = page.getByText('Professionnel').first();
        await expect(professionalCard).toBeVisible();

        const seniorCard = page.getByText('Senior / Aidant').first();
        await expect(seniorCard).toBeVisible();

        // Bouton Continuer visible
        const continueButton = page.getByRole('button', { name: /continuer/i });
        await expect(continueButton).toBeVisible();

        console.log('✅ Responsive mobile validé');
    });

    test('Test 8: Responsive - Desktop 1920px', async ({ page }) => {
        // Set large desktop viewport
        await page.setViewportSize({ width: 1920, height: 1080 });

        // Naviguer vers onboarding preview
        await page.goto('/fr/onboarding/preview');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);

        // Vérifier layout grid 3 colonnes
        const cards = page.locator('div.grid').first();
        await expect(cards).toBeVisible();

        // Toutes les cards visibles côte à côte
        const individualCard = page.getByText('Particulier').first();
        await expect(individualCard).toBeVisible();

        const professionalCard = page.getByText('Professionnel').first();
        await expect(professionalCard).toBeVisible();

        const seniorCard = page.getByText('Senior / Aidant').first();
        await expect(seniorCard).toBeVisible();

        console.log('✅ Responsive desktop 1920px validé');
    });

    test('Test 9: i18n - Français vs Anglais', async ({ page }) => {
        // Tester en français d'abord
        await page.goto('/fr/onboarding/preview');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);

        let title = page.getByRole('heading', { level: 1 });
        let titleText = await title.textContent();
        expect(titleText).toContain('Bienvenue');

        let continueButton = page.getByRole('button', { name: /continuer/i });
        let continueTextFr = await continueButton.textContent();
        expect(continueTextFr).toContain('Continuer');

        // Changer vers anglais
        await page.goto('/en/onboarding/preview');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);

        title = page.getByRole('heading', { level: 1 });
        titleText = await title.textContent();
        expect(titleText).toContain('Welcome');

        continueButton = page.getByRole('button', { name: /continue/i });
        const continueTextEn = await continueButton.textContent();
        expect(continueTextEn).toContain('Continue');

        console.log('✅ i18n FR/EN validé');
    });

    test('Test 10: Accessibilité - Structure et labels', async ({ page }) => {
        await page.waitForTimeout(500);

        // Vérifier un seul h1
        const h1Count = await page.locator('h1').count();
        expect(h1Count).toBe(1);

        // Vérifier que le bouton a un texte accessible
        const continueButton = page.getByRole('button', { name: /continuer/i });
        const buttonText = await continueButton.textContent();
        expect(buttonText).toBeTruthy();

        // Vérifier que les cards sont interactives (cursor pointer)
        const individualCard = page.locator('text=Particulier').first().locator('..');
        const cursor = await individualCard.evaluate((el) =>
            window.getComputedStyle(el).cursor
        );
        expect(cursor).toBe('pointer');

        console.log('✅ Accessibilité validée');
    });

    test('Test 11: Footer benefits affichés', async ({ page }) => {
        await page.waitForTimeout(500);

        // Vérifier le tip
        const tip = page.getByText(/modifier votre type de compte plus tard/i);
        await expect(tip).toBeVisible();

        // Vérifier la sécurité
        const security = page.getByText(/données sont sécurisées/i);
        await expect(security).toBeVisible();

        console.log('✅ Footer benefits affichés');
    });

    test('Test 12: Animations Framer Motion présentes', async ({ page }) => {
        await page.waitForTimeout(1500);

        // Vérifier que les éléments sont visibles (animations ne bloquent pas)
        const logo = page.locator('img[alt="ImuTask"]');
        await expect(logo).toBeVisible();

        const title = page.getByRole('heading', { level: 1 });
        const titleOpacity = await title.evaluate((el) =>
            window.getComputedStyle(el).opacity
        );
        expect(parseFloat(titleOpacity)).toBeGreaterThan(0);

        // Vérifier que les cards ont des transitions
        const individualCard = page.locator('text=Particulier').first().locator('..');
        const cardTransition = await individualCard.evaluate((el) =>
            window.getComputedStyle(el).transition
        );
        expect(cardTransition).toBeTruthy();

        console.log('✅ Animations Framer Motion actives');
    });

    // Tests avec Firebase (skipped car nécessitent auth)
    test.skip('Test 13: Sauvegarde Firestore - Individual → /dashboard/client', async ({ page }) => {
        // Note: Ce test nécessite un utilisateur authentifié avec Firebase
        // Il est marqué skip pour éviter les échecs sur CI

        await page.goto('/fr/onboarding');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);

        // Sélectionner Individual
        const individualCard = page.locator('text=Particulier').first().locator('..');
        await individualCard.click();

        // Cliquer Continuer
        const continueButton = page.getByRole('button', { name: /continuer/i });
        await continueButton.click();

        // Attendre redirection
        await page.waitForURL('**/dashboard/client', { timeout: 10000 });

        expect(page.url()).toContain('/dashboard/client');

        console.log('✅ Sauvegarde + Redirection Individual → /dashboard/client');
    });

    test.skip('Test 14: Sauvegarde Firestore - Professional → /dashboard/pro', async ({ page }) => {
        // Note: Ce test nécessite un utilisateur authentifié avec Firebase

        await page.goto('/fr/onboarding');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);

        // Sélectionner Professional
        const professionalCard = page.locator('text=Professionnel').first().locator('..');
        await professionalCard.click();

        // Cliquer Continuer
        const continueButton = page.getByRole('button', { name: /continuer/i });
        await continueButton.click();

        // Attendre redirection
        await page.waitForURL('**/dashboard/pro', { timeout: 10000 });

        expect(page.url()).toContain('/dashboard/pro');

        console.log('✅ Sauvegarde + Redirection Professional → /dashboard/pro');
    });

    test.skip('Test 15: Sauvegarde Firestore - Senior → /dashboard/senior', async ({ page }) => {
        // Note: Ce test nécessite un utilisateur authentifié avec Firebase

        await page.goto('/fr/onboarding');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);

        // Sélectionner Senior
        const seniorCard = page.locator('text=Senior / Aidant').first().locator('..');
        await seniorCard.click();

        // Cliquer Continuer
        const continueButton = page.getByRole('button', { name: /continuer/i });
        await continueButton.click();

        // Attendre redirection
        await page.waitForURL('**/dashboard/senior', { timeout: 10000 });

        expect(page.url()).toContain('/dashboard/senior');

        console.log('✅ Sauvegarde + Redirection Senior → /dashboard/senior');
    });

    // ===== TASK 3.2 TESTS: Modal "En savoir plus" =====

    test('Test 16: Modal Individual - Ouverture et contenu', async ({ page }) => {
        await page.waitForTimeout(500);

        // Cliquer sur le premier bouton "En savoir plus" (Individual card)
        const infoButton = page.getByTitle('En savoir plus').first();
        await infoButton.click();
        await page.waitForTimeout(300);

        // Vérifier que le modal est visible
        const modal = page.locator('[role="dialog"]');
        await expect(modal).toBeVisible();

        // Vérifier le titre du modal
        await expect(modal.getByText(/Compte Particulier/i)).toBeVisible();

        // Vérifier présence des sections (dans le modal)
        await expect(modal.getByRole('heading', { name: /Idéal pour/i })).toBeVisible();
        await expect(modal.getByRole('heading', { name: /Avantages/i })).toBeVisible();
        await expect(modal.getByRole('heading', { name: /Tarification/i })).toBeVisible();
        await expect(modal.getByRole('heading', { name: /Comparaison/i })).toBeVisible();

        // Vérifier présence de quelques benefits (premier visible dans le modal)
        await expect(modal.getByText(/milliers de prestataires locaux/i).first()).toBeVisible();
        await expect(modal.getByText(/Paiement.*100%.*sécurisé/i).first()).toBeVisible();

        // Vérifier le tableau de comparaison
        const table = modal.locator('table');
        await expect(table).toBeVisible();

        console.log('✅ Modal Individual s\'ouvre avec contenu complet');
    });

    test('Test 17: Modal Professional - Tarification et comparaison', async ({ page }) => {
        await page.waitForTimeout(500);

        // Cliquer sur le 2ème bouton "En savoir plus" (Professional card)
        const infoButton = page.getByTitle('En savoir plus').nth(1);
        await infoButton.click();
        await page.waitForTimeout(300);

        // Accéder au modal
        const modal = page.locator('[role="dialog"]');
        await expect(modal).toBeVisible();

        // Vérifier titre spécifique Professional
        await expect(modal.getByText(/Compte Professionnel/i)).toBeVisible();

        // Vérifier tarification Freemium
        await expect(modal.getByText(/Commission/i).first()).toBeVisible();

        // Vérifier que le tableau a les bonnes colonnes
        await expect(modal.getByRole('cell', { name: /Rechercher.*services/i }).first()).toBeVisible();
        await expect(modal.getByRole('cell', { name: /Proposer.*services/i }).first()).toBeVisible();
        await expect(modal.getByRole('cell', { name: /Calendrier/i }).first()).toBeVisible();

        console.log('✅ Modal Professional affiche tarification et comparaison');
    });

    test('Test 18: Modal Senior - Features PMR et SOS', async ({ page }) => {
        await page.waitForTimeout(500);

        // Cliquer sur le 3ème bouton "En savoir plus" (Senior card)
        const infoButton = page.getByTitle('En savoir plus').nth(2);
        await infoButton.click();
        await page.waitForTimeout(300);

        // Accéder au modal
        const modal = page.locator('[role="dialog"]');
        await expect(modal).toBeVisible();

        // Vérifier titre Senior/CareLink
        await expect(modal.getByRole('heading', { name: /Senior.*CareLink.*Détails/i })).toBeVisible();

        // Vérifier mentions PMR et SOS (cellules du tableau)
        await expect(modal.getByRole('cell', { name: /Services PMR/i }).first()).toBeVisible();
        await expect(modal.getByRole('cell', { name: /Bouton SOS/i }).first()).toBeVisible();

        // Vérifier tarification gratuite
        await expect(modal.getByText(/Gratuit/i).first()).toBeVisible();

        console.log('✅ Modal Senior affiche features PMR et SOS');
    });

    test('Test 19: Modal - Bouton "Choisir ce profil" sélectionne et ferme', async ({ page }) => {
        await page.waitForTimeout(500);

        // Ouvrir modal Individual
        const infoButton = page.getByTitle('En savoir plus').first();
        await infoButton.click();
        await page.waitForTimeout(300);

        // Vérifier modal visible
        const modal = page.locator('[role="dialog"]');
        await expect(modal).toBeVisible();

        // Cliquer sur "Choisir ce profil"
        const selectButton = page.getByRole('button', { name: /Choisir ce profil/i });
        await selectButton.click();
        await page.waitForTimeout(500);

        // Vérifier que le modal s'est fermé
        await expect(modal).not.toBeVisible();

        // Vérifier que la card Individual est maintenant sélectionnée
        const selectedBadge = page.getByText('Sélectionné');
        await expect(selectedBadge).toBeVisible();

        // Vérifier que le bouton Continuer est enabled
        const continueButton = page.getByRole('button', { name: /continuer/i });
        await expect(continueButton).toBeEnabled();

        console.log('✅ Modal - Sélection et fermeture fonctionnent');
    });

    test('Test 20: Modal - Bouton Annuler ferme sans sélection', async ({ page }) => {
        await page.waitForTimeout(500);

        // Ouvrir modal Professional
        const infoButton = page.getByTitle('En savoir plus').nth(1);
        await infoButton.click();
        await page.waitForTimeout(300);

        // Vérifier modal visible
        const modal = page.locator('[role="dialog"]');
        await expect(modal).toBeVisible();

        // Cliquer sur "Annuler"
        const cancelButton = page.getByRole('button', { name: /Annuler/i });
        await cancelButton.click();
        await page.waitForTimeout(300);

        // Vérifier que le modal s'est fermé
        await expect(modal).not.toBeVisible();

        // Vérifier qu'aucune card n'est sélectionnée
        const selectedBadge = page.getByText('Sélectionné');
        expect(await selectedBadge.count()).toBe(0);

        // Vérifier que le bouton Continuer est disabled
        const continueButton = page.getByRole('button', { name: /continuer/i });
        await expect(continueButton).toBeDisabled();

        console.log('✅ Modal - Annulation fonctionne sans sélection');
    });
});
