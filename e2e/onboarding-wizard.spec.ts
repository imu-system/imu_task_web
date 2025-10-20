/**
 * E2E Tests - Onboarding Wizard
 * Tests pour le wizard d'onboarding en 7 étapes
 */

import { test, expect } from '@playwright/test';
import path from 'path';

const BASE_URL = 'http://localhost:9002';

const testPro = {
    email: `onboarding.${Date.now()}@example.com`,
    password: 'Onboarding123!',
    displayName: 'Onboarding Test Pro',
    siret: '12345678901234',
    companyName: 'Test Onboarding SARL',
    address: '123 Rue de Test, 75001 Paris',
    phone: '+33612345678',
    bio: 'Expert en tests d\'onboarding',
    services: ['Service A', 'Service B', 'Service C'],
    zones: ['75001', '75002', '92100'],
};

test.describe('Professional Onboarding Wizard', () => {

    test('should complete full 7-step onboarding wizard', async ({ page }) => {

        // ========== SIGNUP ==========

        await page.goto(`${BASE_URL}/fr/sign-up`);
        await page.getByLabel(/nom/i).fill(testPro.displayName);
        await page.getByLabel(/email/i).fill(testPro.email);
        await page.getByLabel(/mot de passe/i).first().fill(testPro.password);
        await page.getByLabel(/confirmer/i).fill(testPro.password);
        await page.getByRole('button', { name: /s'inscrire/i }).click();

        await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });

        // Déclencher l'onboarding (premier accès pro)
        await page.goto(`${BASE_URL}/fr/dashboard/pro/onboarding`);

        // ========== STEP 1: WELCOME ==========

        await expect(page.getByRole('heading', { name: /bienvenue/i })).toBeVisible();
        await expect(page.getByText(/7 étapes/i)).toBeVisible();

        // Vérifier la progression
        await expect(page.getByText(/étape 1.*7/i)).toBeVisible();

        await page.getByRole('button', { name: /commencer/i }).click();

        // ========== STEP 2: COMPANY INFO ==========

        await expect(page.getByRole('heading', { name: /informations.*entreprise/i })).toBeVisible();
        await expect(page.getByText(/étape 2.*7/i)).toBeVisible();

        // SIRET
        await page.getByLabel(/siret/i).fill(testPro.siret);

        // Nom de l'entreprise
        await page.getByLabel(/nom.*entreprise/i).fill(testPro.companyName);

        // Adresse
        await page.getByLabel(/adresse/i).fill(testPro.address);

        // Téléphone
        await page.getByLabel(/téléphone/i).fill(testPro.phone);

        await page.getByRole('button', { name: /suivant/i }).click();

        // ========== STEP 3: SERVICES ==========

        await expect(page.getByRole('heading', { name: /services proposés/i })).toBeVisible();
        await expect(page.getByText(/étape 3.*7/i)).toBeVisible();

        // Bio/Description
        await page.getByLabel(/description/i).fill(testPro.bio);

        // Ajouter des services
        for (const service of testPro.services) {
            await page.getByPlaceholder(/ajouter un service/i).fill(service);
            await page.getByRole('button', { name: /ajouter/i }).click();
            await expect(page.getByText(service)).toBeVisible();
        }

        await page.getByRole('button', { name: /suivant/i }).click();

        // ========== STEP 4: SERVICE ZONES ==========

        await expect(page.getByRole('heading', { name: /zones.*intervention/i })).toBeVisible();
        await expect(page.getByText(/étape 4.*7/i)).toBeVisible();

        // Ajouter des zones
        for (const zone of testPro.zones) {
            await page.getByPlaceholder(/code postal/i).fill(zone);
            await page.getByRole('button', { name: /ajouter zone/i }).click();
            await expect(page.getByText(zone)).toBeVisible();
        }

        await page.getByRole('button', { name: /suivant/i }).click();

        // ========== STEP 5: PORTFOLIO ==========

        await expect(page.getByRole('heading', { name: /portfolio/i })).toBeVisible();
        await expect(page.getByText(/étape 5.*7/i)).toBeVisible();

        // Upload au moins 3 photos
        const photo1 = path.join(__dirname, 'fixtures', 'test-avatar.png');
        const photo2 = path.join(__dirname, 'fixtures', 'test-identity.png');
        const photo3 = path.join(__dirname, 'fixtures', 'test-address.png');

        await page.getByLabel(/ajouter.*photo/i).setInputFiles([photo1, photo2, photo3]);

        // Attendre que les photos soient uploadées
        await expect(page.getByRole('img').first()).toBeVisible({ timeout: 10000 });
        await expect(page.getByRole('img')).toHaveCount(3, { timeout: 5000 });

        // Ajouter des descriptions
        await page.getByPlaceholder(/description/i).first().fill('Projet 1 - Avant');
        await page.getByPlaceholder(/description/i).nth(1).fill('Projet 1 - Après');
        await page.getByPlaceholder(/description/i).nth(2).fill('Projet 2 - Réalisation');

        await page.getByRole('button', { name: /suivant/i }).click();

        // ========== STEP 6: AVAILABILITY ==========

        await expect(page.getByRole('heading', { name: /disponibilités/i })).toBeVisible();
        await expect(page.getByText(/étape 6.*7/i)).toBeVisible();

        // Activer les réservations immédiates
        await page.getByLabel(/réservations immédiates/i).check();

        // Délai de préavis
        await page.getByLabel(/délai.*préavis/i).selectOption('24h');

        // Configurer les horaires (exemple: Lundi à Vendredi 9h-18h)
        const weekdays = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi'];

        for (const day of weekdays) {
            await page.getByLabel(new RegExp(day, 'i')).check();
            await page.getByLabel(new RegExp(`${day}.*début`, 'i')).fill('09:00');
            await page.getByLabel(new RegExp(`${day}.*fin`, 'i')).fill('18:00');
        }

        await page.getByRole('button', { name: /suivant/i }).click();

        // ========== STEP 7: TERMS & CONDITIONS ==========

        await expect(page.getByRole('heading', { name: /conditions.*utilisation/i })).toBeVisible();
        await expect(page.getByText(/étape 7.*7/i)).toBeVisible();

        // Lire et accepter les CGU
        await page.getByLabel(/j'ai lu.*accepte.*cgu/i).check();

        // Accepter la politique de confidentialité
        await page.getByLabel(/politique.*confidentialité/i).check();

        // Accepter les notifications (optionnel)
        await page.getByLabel(/notifications/i).check();

        await page.getByRole('button', { name: /terminer/i }).click();

        // ========== COMPLETION ==========

        // Vérifier la redirection vers le dashboard pro
        await expect(page).toHaveURL(/\/dashboard\/pro/, { timeout: 15000 });

        // Message de confirmation
        await expect(page.getByText(/onboarding.*terminé/i)).toBeVisible({ timeout: 5000 });

        // Vérifier que le profil est complet
        await page.goto(`${BASE_URL}/fr/dashboard/pro/profile`);

        await expect(page.getByText(testPro.companyName)).toBeVisible();
        await expect(page.getByText(testPro.bio)).toBeVisible();
        await expect(page.getByText(testPro.phone)).toBeVisible();

        for (const service of testPro.services) {
            await expect(page.getByText(service)).toBeVisible();
        }
    });

    test('should navigate back and forth between steps', async ({ page }) => {

        await page.goto(`${BASE_URL}/fr/sign-up`);
        await page.getByLabel(/nom/i).fill(testPro.displayName);
        await page.getByLabel(/email/i).fill(testPro.email);
        await page.getByLabel(/mot de passe/i).first().fill(testPro.password);
        await page.getByLabel(/confirmer/i).fill(testPro.password);
        await page.getByRole('button', { name: /s'inscrire/i }).click();

        await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });

        await page.goto(`${BASE_URL}/fr/dashboard/pro/onboarding`);

        // Step 1 → 2
        await page.getByRole('button', { name: /commencer/i }).click();
        await expect(page.getByText(/étape 2.*7/i)).toBeVisible();

        // Remplir Step 2
        await page.getByLabel(/siret/i).fill(testPro.siret);
        await page.getByLabel(/nom.*entreprise/i).fill(testPro.companyName);
        await page.getByLabel(/adresse/i).fill(testPro.address);
        await page.getByLabel(/téléphone/i).fill(testPro.phone);

        // Step 2 → 3
        await page.getByRole('button', { name: /suivant/i }).click();
        await expect(page.getByText(/étape 3.*7/i)).toBeVisible();

        // Retour à Step 2
        await page.getByRole('button', { name: /précédent/i }).click();
        await expect(page.getByText(/étape 2.*7/i)).toBeVisible();

        // Vérifier que les données sont persistées
        await expect(page.getByLabel(/siret/i)).toHaveValue(testPro.siret);
        await expect(page.getByLabel(/nom.*entreprise/i)).toHaveValue(testPro.companyName);

        // Retour à Step 1
        await page.getByRole('button', { name: /précédent/i }).click();
        await expect(page.getByText(/étape 1.*7/i)).toBeVisible();
    });

    test('should validate required fields at each step', async ({ page }) => {

        await page.goto(`${BASE_URL}/fr/sign-up`);
        await page.getByLabel(/nom/i).fill(testPro.displayName);
        await page.getByLabel(/email/i).fill(testPro.email);
        await page.getByLabel(/mot de passe/i).first().fill(testPro.password);
        await page.getByLabel(/confirmer/i).fill(testPro.password);
        await page.getByRole('button', { name: /s'inscrire/i }).click();

        await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });

        await page.goto(`${BASE_URL}/fr/dashboard/pro/onboarding`);

        // Step 1 → 2
        await page.getByRole('button', { name: /commencer/i }).click();

        // ========== STEP 2 VALIDATION ==========

        // Essayer de passer sans remplir
        await page.getByRole('button', { name: /suivant/i }).click();

        await expect(page.getByText(/siret.*requis/i)).toBeVisible();
        await expect(page.getByText(/nom.*entreprise.*requis/i)).toBeVisible();
        await expect(page.getByText(/adresse.*requise/i)).toBeVisible();

        // SIRET invalide (trop court)
        await page.getByLabel(/siret/i).fill('123');
        await page.getByRole('button', { name: /suivant/i }).click();
        await expect(page.getByText(/siret.*14 chiffres/i)).toBeVisible();

        // Remplir correctement
        await page.getByLabel(/siret/i).fill(testPro.siret);
        await page.getByLabel(/nom.*entreprise/i).fill(testPro.companyName);
        await page.getByLabel(/adresse/i).fill(testPro.address);
        await page.getByLabel(/téléphone/i).fill(testPro.phone);

        await page.getByRole('button', { name: /suivant/i }).click();

        // ========== STEP 3 VALIDATION ==========

        await expect(page.getByText(/étape 3.*7/i)).toBeVisible();

        // Essayer de passer sans services
        await page.getByRole('button', { name: /suivant/i }).click();

        await expect(page.getByText(/au moins un service/i)).toBeVisible();

        // Ajouter un service
        await page.getByPlaceholder(/ajouter un service/i).fill(testPro.services[0]);
        await page.getByRole('button', { name: /ajouter/i }).click();

        await page.getByRole('button', { name: /suivant/i }).click();

        // ========== STEP 4 VALIDATION ==========

        await expect(page.getByText(/étape 4.*7/i)).toBeVisible();

        // Essayer de passer sans zones
        await page.getByRole('button', { name: /suivant/i }).click();

        await expect(page.getByText(/au moins une zone/i)).toBeVisible();

        // Ajouter une zone
        await page.getByPlaceholder(/code postal/i).fill(testPro.zones[0]);
        await page.getByRole('button', { name: /ajouter zone/i }).click();

        await page.getByRole('button', { name: /suivant/i }).click();

        // ========== STEP 5 VALIDATION ==========

        await expect(page.getByText(/étape 5.*7/i)).toBeVisible();

        // Essayer de passer sans photos
        await page.getByRole('button', { name: /suivant/i }).click();

        await expect(page.getByText(/au moins 3 photos/i)).toBeVisible();
    });

    test('should save progress and resume later', async ({ page }) => {

        await page.goto(`${BASE_URL}/fr/sign-up`);
        await page.getByLabel(/nom/i).fill(testPro.displayName);
        await page.getByLabel(/email/i).fill(testPro.email);
        await page.getByLabel(/mot de passe/i).first().fill(testPro.password);
        await page.getByLabel(/confirmer/i).fill(testPro.password);
        await page.getByRole('button', { name: /s'inscrire/i }).click();

        await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });

        await page.goto(`${BASE_URL}/fr/dashboard/pro/onboarding`);

        // Commencer l'onboarding
        await page.getByRole('button', { name: /commencer/i }).click();

        // Remplir Step 2
        await page.getByLabel(/siret/i).fill(testPro.siret);
        await page.getByLabel(/nom.*entreprise/i).fill(testPro.companyName);
        await page.getByLabel(/adresse/i).fill(testPro.address);
        await page.getByLabel(/téléphone/i).fill(testPro.phone);

        await page.getByRole('button', { name: /suivant/i }).click();

        // Remplir Step 3
        await page.getByLabel(/description/i).fill(testPro.bio);
        await page.getByPlaceholder(/ajouter un service/i).fill(testPro.services[0]);
        await page.getByRole('button', { name: /ajouter/i }).click();

        // Quitter sans terminer
        await page.getByRole('button', { name: /sauvegarder.*quitter/i }).click();

        // Vérifier la redirection vers le dashboard
        await expect(page).toHaveURL(/\/dashboard/, { timeout: 5000 });

        // Message de sauvegarde
        await expect(page.getByText(/progression sauvegardée/i)).toBeVisible({ timeout: 5000 });

        // ========== REPRENDRE PLUS TARD ==========

        // Retourner à l'onboarding
        await page.goto(`${BASE_URL}/fr/dashboard/pro/onboarding`);

        // Vérifier qu'on reprend à Step 3 (là où on s'était arrêté)
        await expect(page.getByText(/étape 3.*7/i)).toBeVisible();

        // Vérifier que les données sont toujours là
        await expect(page.getByLabel(/description/i)).toHaveValue(testPro.bio);
        await expect(page.getByText(testPro.services[0])).toBeVisible();
    });

    test('should show progress indicator', async ({ page }) => {

        await page.goto(`${BASE_URL}/fr/sign-up`);
        await page.getByLabel(/nom/i).fill(testPro.displayName);
        await page.getByLabel(/email/i).fill(testPro.email);
        await page.getByLabel(/mot de passe/i).first().fill(testPro.password);
        await page.getByLabel(/confirmer/i).fill(testPro.password);
        await page.getByRole('button', { name: /s'inscrire/i }).click();

        await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });

        await page.goto(`${BASE_URL}/fr/dashboard/pro/onboarding`);

        // Vérifier la barre de progression à chaque étape

        // Step 1: 0/7 = 0%
        await expect(page.locator('[role="progressbar"]')).toHaveAttribute('aria-valuenow', '0');

        await page.getByRole('button', { name: /commencer/i }).click();

        // Step 2: 1/7 ≈ 14%
        await expect(page.locator('[role="progressbar"]')).toHaveAttribute('aria-valuenow', /14|15/);

        // Remplir et continuer
        await page.getByLabel(/siret/i).fill(testPro.siret);
        await page.getByLabel(/nom.*entreprise/i).fill(testPro.companyName);
        await page.getByLabel(/adresse/i).fill(testPro.address);
        await page.getByLabel(/téléphone/i).fill(testPro.phone);
        await page.getByRole('button', { name: /suivant/i }).click();

        // Step 3: 2/7 ≈ 29%
        await expect(page.locator('[role="progressbar"]')).toHaveAttribute('aria-valuenow', /28|29|30/);
    });

    test('should allow skipping optional steps', async ({ page }) => {

        await page.goto(`${BASE_URL}/fr/sign-up`);
        await page.getByLabel(/nom/i).fill(testPro.displayName);
        await page.getByLabel(/email/i).fill(testPro.email);
        await page.getByLabel(/mot de passe/i).first().fill(testPro.password);
        await page.getByLabel(/confirmer/i).fill(testPro.password);
        await page.getByRole('button', { name: /s'inscrire/i }).click();

        await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });

        await page.goto(`${BASE_URL}/fr/dashboard/pro/onboarding`);

        await page.getByRole('button', { name: /commencer/i }).click();

        // Remplir les étapes obligatoires

        // Step 2: Company info (obligatoire)
        await page.getByLabel(/siret/i).fill(testPro.siret);
        await page.getByLabel(/nom.*entreprise/i).fill(testPro.companyName);
        await page.getByLabel(/adresse/i).fill(testPro.address);
        await page.getByLabel(/téléphone/i).fill(testPro.phone);
        await page.getByRole('button', { name: /suivant/i }).click();

        // Step 3: Services (obligatoire)
        await page.getByPlaceholder(/ajouter un service/i).fill(testPro.services[0]);
        await page.getByRole('button', { name: /ajouter/i }).click();
        await page.getByRole('button', { name: /suivant/i }).click();

        // Step 4: Zones (obligatoire)
        await page.getByPlaceholder(/code postal/i).fill(testPro.zones[0]);
        await page.getByRole('button', { name: /ajouter zone/i }).click();
        await page.getByRole('button', { name: /suivant/i }).click();

        // Step 5: Portfolio (optionnel - peut être ignoré)
        await page.getByRole('button', { name: /passer/i }).click();

        // Step 6: Availability (optionnel)
        await page.getByRole('button', { name: /passer/i }).click();

        // Step 7: Terms (obligatoire)
        await page.getByLabel(/j'ai lu.*accepte.*cgu/i).check();
        await page.getByLabel(/politique.*confidentialité/i).check();
        await page.getByRole('button', { name: /terminer/i }).click();

        // Vérifier la complétion
        await expect(page).toHaveURL(/\/dashboard\/pro/, { timeout: 15000 });
    });
});
