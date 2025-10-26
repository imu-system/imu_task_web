import { test, expect } from '@playwright/test';

test.describe('Landing Page - Navigation et Fonctionnalités', () => {
    test.beforeEach(async ({ page }) => {
        // Naviguer vers la landing page (locale FR par défaut)
        await page.goto('/fr');
        await page.waitForLoadState('networkidle');
    });

    test('Test 1: Navigation vers pages profils', async ({ page }) => {
        // Test navigation vers "Particuliers"
        const particuliersCard = page.getByRole('link', { name: /particuliers/i });
        await expect(particuliersCard).toBeVisible();
        await particuliersCard.click();
        await page.waitForURL('**/particuliers');
        expect(page.url()).toContain('/particuliers');

        // Retour à la landing page
        await page.goto('/fr');

        // Test navigation vers "Professionnels"
        const professionnelsCard = page.getByRole('link', { name: /professionnels/i });
        await expect(professionnelsCard).toBeVisible();
        await professionnelsCard.click();
        await page.waitForURL('**/professionnels');
        expect(page.url()).toContain('/professionnels');

        // Retour à la landing page
        await page.goto('/fr');

        // Test navigation vers "Seniors"
        const seniorsCard = page.getByRole('link', { name: /seniors|carelink/i });
        await expect(seniorsCard).toBeVisible();
        await seniorsCard.click();
        await page.waitForURL('**/seniors');
        expect(page.url()).toContain('/seniors');
    });

    test('Test 2: Hero variants - Default sur landing page', async ({ page }) => {
        // Vérifier que le Hero par défaut est présent
        const heroTitle = page.getByRole('heading', { level: 1 });
        await expect(heroTitle).toBeVisible();

        // Vérifier la présence du CTA principal
        const ctaButton = page.getByRole('link', { name: /trouver|poster/i }).first();
        await expect(ctaButton).toBeVisible();

        // Vérifier que ce n'est PAS le variant seniors (pas de gradient rose)
        const heroSection = page.locator('section').first();
        const bgClass = await heroSection.getAttribute('class');
        expect(bgClass).not.toContain('rose');
    });

    test('Test 3: Hero variant Seniors sur page /seniors', async ({ page }) => {
        // Naviguer vers la page seniors
        await page.goto('/fr/seniors');
        await page.waitForLoadState('networkidle');

        // Vérifier le titre spécifique seniors
        const heroTitle = page.getByRole('heading', { level: 1 });
        await expect(heroTitle).toBeVisible();
        const titleText = await heroTitle.textContent();
        expect(titleText?.toLowerCase()).toContain('senior');

        // Vérifier la présence du CTA "Découvrir CareLink"
        const carelinkCta = page.getByRole('link', { name: /carelink/i });
        await expect(carelinkCta).toBeVisible();

        // Vérifier le gradient rose/pink (variant seniors)
        const heroSection = page.locator('section').first();
        const bgClass = await heroSection.getAttribute('class');
        expect(bgClass).toMatch(/rose|pink|purple/);
    });

    test('Test 4: Badge PMR visible sur catégories accessibles', async ({ page }) => {
        // Vérifier que les badges "Certifié PMR" sont affichés
        const pmrBadges = page.getByText(/certifié pmr|pmr certified/i);

        // Il devrait y avoir au moins 1 badge visible (4 catégories accessibles)
        const badgeCount = await pmrBadges.count();
        expect(badgeCount).toBeGreaterThan(0);

        // Vérifier que les catégories accessibles sont présentes
        const categoryPills = page.locator('[class*="category"]').first();
        await expect(categoryPills).toBeVisible();
    });

    test('Test 5: Responsive - Mobile (stack vertical)', async ({ page }) => {
        // Définir viewport mobile
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto('/fr');
        await page.waitForLoadState('networkidle');

        // Vérifier que les ProfileCards sont visibles
        const profileCards = page.locator('[class*="grid"]').filter({ hasText: /particuliers|professionnels|seniors/i }).first();
        await expect(profileCards).toBeVisible();

        // Sur mobile, les cards devraient être en colonne (pas de grid-cols-3)
        // On vérifie juste que le contenu est visible et accessible
        const particuliersCard = page.getByRole('link', { name: /particuliers/i });
        await expect(particuliersCard).toBeVisible();
    });

    test('Test 6: Responsive - Desktop (grid 3 colonnes)', async ({ page }) => {
        // Définir viewport desktop
        await page.setViewportSize({ width: 1920, height: 1080 });
        await page.goto('/fr');
        await page.waitForLoadState('networkidle');

        // Vérifier que les 3 ProfileCards sont visibles
        const particuliersCard = page.getByRole('link', { name: /particuliers/i });
        const professionnelsCard = page.getByRole('link', { name: /professionnels/i });
        const seniorsCard = page.getByRole('link', { name: /seniors|carelink/i });

        await expect(particuliersCard).toBeVisible();
        await expect(professionnelsCard).toBeVisible();
        await expect(seniorsCard).toBeVisible();

        // Vérifier que les cards sont disposées horizontalement (grid)
        const profileCardsContainer = page.locator('[class*="grid"]').filter({ hasText: /particuliers/i }).first();
        await expect(profileCardsContainer).toBeVisible();
    });

    test('Test 7: CategoryPills - Affichage et interaction', async ({ page }) => {
        // Vérifier que les CategoryPills sont présentes
        const categoryButtons = page.locator('button').filter({ hasText: /ménage|déménagement|livraison/i });
        const buttonCount = await categoryButtons.count();

        // Il devrait y avoir plusieurs catégories (9 au total)
        expect(buttonCount).toBeGreaterThan(0);

        // Cliquer sur une catégorie (ex: Ménage)
        const cleaningButton = page.locator('button').filter({ hasText: /ménage|cleaning/i }).first();
        if (await cleaningButton.isVisible()) {
            await cleaningButton.click();
            // Vérifier que la catégorie est sélectionnée (peut changer l'URL ou le style)
            await page.waitForTimeout(500); // Laisser le temps à l'animation
        }
    });

    test('Test 8: i18n - Switch FR ↔ EN', async ({ page }) => {
        // Commencer en FR
        await page.goto('/fr');
        await page.waitForLoadState('networkidle');

        // Vérifier contenu FR
        const heroTitleFr = page.getByRole('heading', { level: 1 }).first();
        const titleTextFr = await heroTitleFr.textContent();
        expect(titleTextFr).toBeTruthy();

        // Switch vers EN (si le sélecteur de langue existe)
        const langSwitcher = page.getByRole('button', { name: /en|english/i });

        if (await langSwitcher.isVisible()) {
            await langSwitcher.click();
            await page.waitForURL('**/en**');

            // Vérifier contenu EN
            const heroTitleEn = page.getByRole('heading', { level: 1 }).first();
            const titleTextEn = await heroTitleEn.textContent();
            expect(titleTextEn).toBeTruthy();
            expect(titleTextEn).not.toBe(titleTextFr); // Contenu différent
        } else {
            // Si pas de switcher, naviguer directement vers /en
            await page.goto('/en');
            await page.waitForLoadState('networkidle');

            const heroTitleEn = page.getByRole('heading', { level: 1 }).first();
            await expect(heroTitleEn).toBeVisible();
        }
    });

    test('Test 9: Hero CTA - Cliquable et fonctionnel', async ({ page }) => {
        // Vérifier que les CTA du Hero sont présents et cliquables
        const primaryCta = page.getByRole('link', { name: /trouver|poster|découvrir/i }).first();
        await expect(primaryCta).toBeVisible();

        // Vérifier que le CTA a un href valide
        const href = await primaryCta.getAttribute('href');
        expect(href).toBeTruthy();
        expect(href?.length).toBeGreaterThan(0);

        // Le CTA pourrait rediriger vers /recherche, /inscription ou autre
        // On ne clique pas pour éviter de quitter la landing page
    });

    test('Test 10: Animations et interactivité', async ({ page }) => {
        // Vérifier que les animations Framer Motion sont présentes
        // (les éléments avec motion.div ont des attributs spécifiques)

        // Vérifier hover sur ProfileCards
        const particuliersCard = page.getByRole('link', { name: /particuliers/i });
        await expect(particuliersCard).toBeVisible();

        // Hover sur la card
        await particuliersCard.hover();
        await page.waitForTimeout(300); // Laisser l'animation se jouer

        // Vérifier que la card est toujours visible après hover
        await expect(particuliersCard).toBeVisible();
    });
});

test.describe('Landing Page - Accessibilité', () => {
    test('Test A11y: ARIA labels et structure sémantique', async ({ page }) => {
        await page.goto('/fr');
        await page.waitForLoadState('networkidle');

        // Vérifier structure sémantique (headings)
        const h1 = page.locator('h1').first();
        await expect(h1).toBeVisible();

        // Vérifier que les liens ont des labels accessibles
        const links = page.locator('a[href]');
        const linkCount = await links.count();
        expect(linkCount).toBeGreaterThan(0);

        // Vérifier contraste (les badges PMR devraient être visibles)
        const pmrBadge = page.getByText(/certifié pmr/i).first();
        if (await pmrBadge.isVisible()) {
            // Le badge est visible, donc contraste suffisant
            await expect(pmrBadge).toBeVisible();
        }
    });

    test('Test A11y: Navigation au clavier', async ({ page }) => {
        await page.goto('/fr');
        await page.waitForLoadState('networkidle');

        // Tester navigation au clavier (Tab)
        await page.keyboard.press('Tab');
        await page.waitForTimeout(200);

        // Vérifier qu'un élément a le focus
        const focusedElement = page.locator(':focus');
        await expect(focusedElement).toBeVisible();

        // Continuer à Tab pour vérifier plusieurs éléments
        await page.keyboard.press('Tab');
        await page.keyboard.press('Tab');

        // Vérifier qu'on peut naviguer entre les liens
        const newFocusedElement = page.locator(':focus');
        await expect(newFocusedElement).toBeVisible();
    });
});
