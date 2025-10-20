/**
 * E2E Tests - KYB Flow (SIRET Validation)
 * Tests pour le flux complet KYB avec validation SIRET
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:9002';

// Données de test
const testProfessional = {
    email: `pro.kyb.${Date.now()}@example.com`,
    password: 'ProPassword123!',
    displayName: 'Pro KYB Test',
    siret: '12345678901234', // SIRET test (14 chiffres)
    companyName: 'Test Company SARL',
    businessAddress: '123 Rue de Test, 75001 Paris',
    industry: 'Plomberie',
};

const testAdmin = {
    email: 'admin@imutask.com',
    password: 'AdminPassword123!',
};

test.describe('KYB SIRET Validation Flow', () => {
    test('should complete full KYB SIRET validation flow', async ({ page, context }) => {
        // ========== PARTIE 1: Inscription utilisateur ==========
        await page.goto(`${BASE_URL}/fr/sign-up`);

        await page.getByLabel(/nom/i).fill(testProfessional.displayName);
        await page.getByLabel(/email/i).fill(testProfessional.email);
        await page.getByLabel(/mot de passe/i).first().fill(testProfessional.password);
        await page.getByLabel(/confirmer/i).fill(testProfessional.password);

        await page.getByRole('button', { name: /s'inscrire/i }).click();

        // Attendre la redirection vers dashboard
        await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });

        // ========== PARTIE 2: Navigation vers KYB ==========
        await page.goto(`${BASE_URL}/fr/dashboard/kyb`);

        // Vérifier que la page KYB est affichée
        await expect(page.getByRole('heading', { name: /vérification professionnelle/i })).toBeVisible();

        // ========== PARTIE 3: Soumission SIRET ==========

        // Remplir le numéro SIRET
        await page.getByLabel(/siret/i).fill(testProfessional.siret);

        // Remplir le nom de l'entreprise
        await page.getByLabel(/raison sociale/i).fill(testProfessional.companyName);

        // Remplir l'adresse
        await page.getByLabel(/adresse/i).fill(testProfessional.businessAddress);

        // Sélectionner le secteur d'activité
        await page.getByLabel(/secteur/i).click();
        await page.getByRole('option', { name: testProfessional.industry }).click();

        // Soumettre le formulaire
        await page.getByRole('button', { name: /soumettre/i }).click();

        // Attendre la confirmation
        await expect(page.getByText(/demande soumise/i)).toBeVisible({ timeout: 10000 });

        // ========== PARTIE 4: Vérification statut pending ==========
        await page.reload();

        // Vérifier que le statut est "En attente"
        await expect(page.getByText(/en attente de validation/i)).toBeVisible();

        // ========== PARTIE 5: Validation Admin ==========

        // Ouvrir une nouvelle page pour l'admin
        const adminPage = await context.newPage();
        await adminPage.goto(`${BASE_URL}/fr/sign-in`);

        // Connexion admin
        await adminPage.getByLabel(/email/i).fill(testAdmin.email);
        await adminPage.getByLabel(/mot de passe/i).fill(testAdmin.password);
        await adminPage.getByRole('button', { name: /connexion/i }).click();

        await expect(adminPage).toHaveURL(/\/dashboard/, { timeout: 10000 });

        // Navigation vers admin KYB
        await adminPage.goto(`${BASE_URL}/fr/admin/kyb`);

        // Vérifier la page admin KYB
        await expect(adminPage.getByRole('heading', { name: /validation kyb/i })).toBeVisible();

        // Onglet "En attente"
        await adminPage.getByRole('tab', { name: /en attente/i }).click();

        // Rechercher le professionnel par SIRET
        await adminPage.getByPlaceholder(/rechercher/i).fill(testProfessional.siret);

        // Attendre que la ligne apparaisse
        const professionalRow = adminPage.locator(`tr:has-text("${testProfessional.siret}")`);
        await expect(professionalRow).toBeVisible({ timeout: 5000 });

        // Cliquer sur "Approuver"
        await professionalRow.getByRole('button', { name: /approuver/i }).click();

        // Confirmer dans le dialog
        await adminPage.getByRole('button', { name: /confirmer/i }).click();

        // Attendre la confirmation
        await expect(adminPage.getByText(/approuvé avec succès/i)).toBeVisible({ timeout: 10000 });

        // ========== PARTIE 6: Vérification côté utilisateur ==========

        // Retour sur la page utilisateur
        await page.reload();

        // Vérifier que le statut est maintenant "Approuvé"
        await expect(page.getByText(/approuvé/i)).toBeVisible();

        // Vérifier que l'utilisateur peut maintenant accéder aux fonctionnalités pro
        await page.goto(`${BASE_URL}/fr/dashboard/pro`);
        await expect(page).toHaveURL(/\/pro/);

        await adminPage.close();
    });

    test('should reject KYB with reason', async ({ page, context }) => {
        // Créer un nouvel utilisateur
        const rejectedPro = {
            email: `rejected.${Date.now()}@example.com`,
            password: 'RejectedPro123!',
            displayName: 'Rejected Pro',
            siret: '98765432109876',
            companyName: 'Invalid Company',
        };

        // Inscription
        await page.goto(`${BASE_URL}/fr/sign-up`);
        await page.getByLabel(/nom/i).fill(rejectedPro.displayName);
        await page.getByLabel(/email/i).fill(rejectedPro.email);
        await page.getByLabel(/mot de passe/i).first().fill(rejectedPro.password);
        await page.getByLabel(/confirmer/i).fill(rejectedPro.password);
        await page.getByRole('button', { name: /s'inscrire/i }).click();

        await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });

        // Soumission KYB
        await page.goto(`${BASE_URL}/fr/dashboard/kyb`);
        await page.getByLabel(/siret/i).fill(rejectedPro.siret);
        await page.getByLabel(/raison sociale/i).fill(rejectedPro.companyName);
        await page.getByRole('button', { name: /soumettre/i }).click();

        await expect(page.getByText(/demande soumise/i)).toBeVisible({ timeout: 10000 });

        // Admin rejette
        const adminPage = await context.newPage();
        await adminPage.goto(`${BASE_URL}/fr/sign-in`);
        await adminPage.getByLabel(/email/i).fill(testAdmin.email);
        await adminPage.getByLabel(/mot de passe/i).fill(testAdmin.password);
        await adminPage.getByRole('button', { name: /connexion/i }).click();

        await adminPage.goto(`${BASE_URL}/fr/admin/kyb`);
        await adminPage.getByRole('tab', { name: /en attente/i }).click();

        const row = adminPage.locator(`tr:has-text("${rejectedPro.siret}")`);
        await row.getByRole('button', { name: /rejeter/i }).click();

        // Remplir la raison du rejet
        await adminPage.getByLabel(/raison/i).fill('SIRET invalide - entreprise non trouvée');
        await adminPage.getByRole('button', { name: /confirmer le rejet/i }).click();

        await expect(adminPage.getByText(/rejeté avec succès/i)).toBeVisible({ timeout: 10000 });

        // Vérification côté utilisateur
        await page.reload();
        await expect(page.getByText(/rejeté/i)).toBeVisible();
        await expect(page.getByText(/SIRET invalide/i)).toBeVisible();

        await adminPage.close();
    });

    test('should display SIRET validation errors', async ({ page }) => {
        await page.goto(`${BASE_URL}/fr/sign-up`);

        const testUser = {
            email: `validation.${Date.now()}@example.com`,
            password: 'ValidTest123!',
            displayName: 'Validation Test',
        };

        await page.getByLabel(/nom/i).fill(testUser.displayName);
        await page.getByLabel(/email/i).fill(testUser.email);
        await page.getByLabel(/mot de passe/i).first().fill(testUser.password);
        await page.getByLabel(/confirmer/i).fill(testUser.password);
        await page.getByRole('button', { name: /s'inscrire/i }).click();

        await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });

        await page.goto(`${BASE_URL}/fr/dashboard/kyb`);

        // Test SIRET trop court
        await page.getByLabel(/siret/i).fill('123');
        await page.getByRole('button', { name: /soumettre/i }).click();
        await expect(page.getByText(/14 chiffres/i)).toBeVisible();

        // Test SIRET avec lettres
        await page.getByLabel(/siret/i).fill('1234567890ABCD');
        await page.getByRole('button', { name: /soumettre/i }).click();
        await expect(page.getByText(/chiffres uniquement/i)).toBeVisible();

        // Test champs obligatoires
        await page.getByLabel(/siret/i).fill('12345678901234');
        await page.getByRole('button', { name: /soumettre/i }).click();
        await expect(page.getByText(/raison sociale.*requis/i)).toBeVisible();
    });
});
