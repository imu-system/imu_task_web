/**
 * E2E Tests - KYC Flow
 * Tests pour le flux complet KYC (soumission utilisateur + validation admin)
 */

import { test, expect } from '@playwright/test';
import path from 'path';

// URLs de base
const BASE_URL = 'http://localhost:9002';

// Données de test
const testUser = {
    email: `test.user.kyc.${Date.now()}@example.com`,
    password: 'TestPassword123!',
    displayName: 'Test User KYC',
};

const testAdmin = {
    email: 'admin@imutask.com', // Utiliser un admin existant ou créer
    password: 'AdminPassword123!',
};

test.describe('KYC Submission Flow', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(`${BASE_URL}/fr`);
    });

    test('should complete full KYC submission and approval flow', async ({ page, context }) => {
        // Écouter les messages console du navigateur
        page.on('console', msg => {
            const text = msg.text();
            // Afficher tous les logs pour debug
            console.log('BROWSER CONSOLE:', text);
        });

        // ========== PARTIE 1: Inscription et connexion utilisateur ==========

        // Navigation vers inscription
        await page.goto(`${BASE_URL}/fr/sign-up`);
        await expect(page).toHaveURL(/\/sign-up/);

        // Remplir le formulaire d'inscription
        console.log('📝 Remplissage du formulaire...');
        await page.getByTestId('signup-displayName').fill(testUser.displayName);
        await page.getByTestId('signup-email').fill(testUser.email);
        await page.getByTestId('signup-password').fill(testUser.password);

        // Soumettre le formulaire en appuyant sur Enter plutôt que cliquer sur le bouton
        console.log('📤 Tentative de soumission du formulaire...');
        await page.getByTestId('signup-password').press('Enter');

        // Attendre la redirection vers dashboard
        await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });

        // ========== PARTIE 2: Soumission KYC ==========

        // Navigation vers la page KYC
        await page.goto(`${BASE_URL}/fr/dashboard/kyc-submit`);
        await expect(page).toHaveURL(/\/kyc-submit/);

        // Vérifier le titre de la page
        await expect(page.getByTestId('kyc-page-title')).toBeVisible();

        // Préparer des fichiers de test
        const testFilesDir = path.join(__dirname, 'fixtures');
        const identityDoc = path.join(testFilesDir, 'test-identity.pdf');
        const addressDoc = path.join(testFilesDir, 'test-address.pdf');
        const professionalDoc = path.join(testFilesDir, 'test-professional.pdf');

        // Note: Pour ce test, nous devons créer des fichiers de test
        // ou utiliser des fichiers existants dans fixtures/

        // Upload du document d'identité (obligatoire)
        const identityInput = page.getByTestId('kyc-upload-identity');
        await identityInput.setInputFiles(identityDoc);

        // Vérifier que le fichier est bien uploadé
        await expect(page.getByTestId('kyc-file-identity')).toBeVisible();

        // Upload du justificatif de domicile (optionnel mais recommandé)
        const addressInput = page.getByTestId('kyc-upload-address');
        await addressInput.setInputFiles(addressDoc);
        await expect(page.getByTestId('kyc-file-address')).toBeVisible();

        // Soumettre le formulaire KYC
        console.log('🔄 Soumission du formulaire KYC...');
        await page.getByTestId('kyc-submit-button').click();

        // Attendre un peu pour voir ce qui se passe
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'test-results/after-kyc-submit.png' });

        // Attendre la confirmation de soumission
        await expect(page.getByText(/demande soumise avec succès/i)).toBeVisible({ timeout: 15000 });

        // Vérifier la redirection vers le dashboard
        await expect(page).toHaveURL(/\/dashboard$/);

        // Vérifier qu'un message indique la soumission en attente
        await expect(page.getByText(/en attente de validation/i)).toBeVisible();

        // ========== PARTIE 3: Validation Admin (nouvelle session) ==========

        // Ouvrir une nouvelle page pour l'admin
        const adminPage = await context.newPage();
        await adminPage.goto(`${BASE_URL}/fr/sign-in`);

        // Connexion admin
        await adminPage.getByTestId('login-email').fill(testAdmin.email);
        await adminPage.getByTestId('login-password').fill(testAdmin.password);

        // Attendre la redirection vers dashboard admin
        await expect(adminPage).toHaveURL(/\/dashboard/, { timeout: 10000 });

        // Navigation vers la page admin
        await adminPage.goto(`${BASE_URL}/fr/dashboard/admin`);
        await expect(adminPage).toHaveURL(/\/admin/);

        // Ouvrir l'onglet KYC
        await adminPage.getByTestId('admin-tab-kyc').click();
        await expect(adminPage.getByTestId('admin-kyc-panel')).toBeVisible();

        // Filtrer les demandes en attente
        await adminPage.getByTestId('kyc-filter-status').selectOption('pending');

        // Rechercher la soumission de notre utilisateur test
        await adminPage.getByTestId('kyc-search-input').fill(testUser.email);

        // Attendre que la ligne apparaisse
        const submissionRow = adminPage.getByTestId(`kyc-row-${testUser.email}`);
        await expect(submissionRow).toBeVisible({ timeout: 5000 });

        // Cliquer sur le bouton "Approuver"
        await submissionRow.getByTestId('kyc-approve-button').click();

        // Confirmer dans le dialogue
        await expect(adminPage.getByTestId('kyc-approve-dialog')).toBeVisible();
        await adminPage.getByTestId('kyc-approve-confirm').click();

        // Attendre la confirmation
        await expect(adminPage.getByText(/approuvée avec succès/i)).toBeVisible({ timeout: 10000 });

        // ========== PARTIE 4: Vérification côté utilisateur ==========

        // Retour sur la page utilisateur
        await page.reload();

        // Vérifier que le statut est maintenant "provider"
        await page.goto(`${BASE_URL}/fr/dashboard/profile`);
        await expect(page.getByTestId('user-role-badge-provider')).toBeVisible();

        // Vérifier qu'il n'y a plus de message "en attente"
        await page.goto(`${BASE_URL}/fr/dashboard`);
        await expect(page.getByText(/en attente de validation/i)).not.toBeVisible();

        // Vérifier l'accès aux fonctionnalités provider
        await expect(page.getByTestId('nav-provider-dashboard')).toBeVisible();

        // Fermer la page admin
        await adminPage.close();
    });

    test('should reject KYC submission with reason', async ({ page, context }) => {
        // ========== PARTIE 1: Créer un utilisateur et soumettre KYC ==========
        // (Similaire à la première partie du test précédent)
        // Pour simplifier, on suppose qu'il y a déjà une soumission en attente

        // ========== PARTIE 2: Connexion Admin ==========

        await page.goto(`${BASE_URL}/fr/sign-in`);
        await page.getByTestId('login-email').fill(testAdmin.email);
        await page.getByTestId('login-password').fill(testAdmin.password);

        await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

        // Navigation vers admin
        await page.goto(`${BASE_URL}/fr/dashboard/admin`);
        await page.getByTestId('admin-tab-kyc').click();

        // Filtrer pending
        await page.getByTestId('kyc-filter-status').selectOption('pending');

        // Sélectionner la première soumission
        const firstRow = page.getByTestId('kyc-row').first();
        await expect(firstRow).toBeVisible();

        // Cliquer sur "Rejeter"
        await firstRow.getByTestId('kyc-reject-button').click();

        // Remplir la raison du rejet
        await expect(page.getByTestId('kyc-reject-dialog')).toBeVisible();
        await page.getByTestId('kyc-reject-reason-input').fill('Documents illisibles ou incomplets');
        await page.getByTestId('kyc-reject-confirm').click();

        // Attendre la confirmation
        await expect(page.getByText(/rejetée avec succès/i)).toBeVisible({ timeout: 10000 });

        // Vérifier que la soumission a disparu de la liste "pending"
        await expect(firstRow).not.toBeVisible();

        // Changer le filtre pour voir les rejetées
        await page.getByTestId('kyc-filter-status').selectOption('rejected');
        await expect(page.getByTestId('kyc-row').first()).toBeVisible();
    });

    test('should allow user to view their KYC status', async ({ page }) => {
        // Créer et connecter un utilisateur
        await page.goto(`${BASE_URL}/fr/sign-up`);

        const userEmail = `test.status.${Date.now()}@example.com`;
        await page.getByTestId('signup-displayName').fill('Test Status User');
        await page.getByTestId('signup-email').fill(userEmail);
        await page.getByTestId('signup-password').fill('TestPass123!');

        await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

        // Aller sur la page de profil
        await page.goto(`${BASE_URL}/fr/dashboard/profile`);

        // Vérifier qu'il n'y a pas de badge provider (pas encore soumis)
        await expect(page.getByTestId('user-role-badge-provider')).not.toBeVisible();

        // Vérifier qu'il y a un lien ou bouton pour soumettre KYC
        const kycButton = page.getByTestId('kyc-submit-link');
        await expect(kycButton).toBeVisible();
        await expect(kycButton).toHaveText(/devenir prestataire/i);

        // Cliquer pour aller sur la page KYC
        await kycButton.click();
        await expect(page).toHaveURL(/\/kyc-submit/);
    });

    test('should show KYC pending status after submission', async ({ page }) => {
        // Ce test vérifie l'affichage du statut "en attente" après soumission

        // Créer un utilisateur
        await page.goto(`${BASE_URL}/fr/sign-up`);
        const userEmail = `test.pending.${Date.now()}@example.com`;

        await page.getByTestId('signup-displayName').fill('Test Pending User');
        await page.getByTestId('signup-email').fill(userEmail);
        await page.getByTestId('signup-password').fill('TestPass123!');

        await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

        // Soumettre KYC (version simplifiée)
        await page.goto(`${BASE_URL}/fr/dashboard/kyc-submit`);

        const testFile = path.join(__dirname, '../fixtures/test-identity.pdf');
        await page.getByTestId('kyc-upload-identity').setInputFiles(testFile);
        await page.getByTestId('kyc-submit-button').click();

        // Attendre la confirmation
        await expect(page.getByText(/soumise avec succès/i)).toBeVisible({ timeout: 15000 });

        // Aller sur le dashboard
        await page.goto(`${BASE_URL}/fr/dashboard`);

        // Vérifier le badge ou message "en attente"
        await expect(page.getByTestId('kyc-status-pending')).toBeVisible();
        await expect(page.getByText(/en cours de vérification/i)).toBeVisible();
    });

    test('should prevent duplicate KYC submissions', async ({ page }) => {
        // Tester qu'un utilisateur ne peut pas soumettre plusieurs fois

        // Créer et connecter un utilisateur
        await page.goto(`${BASE_URL}/fr/sign-up`);
        const userEmail = `test.duplicate.${Date.now()}@example.com`;

        await page.getByTestId('signup-displayName').fill('Test Duplicate User');
        await page.getByTestId('signup-email').fill(userEmail);
        await page.getByTestId('signup-password').fill('TestPass123!');

        await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

        // Première soumission
        await page.goto(`${BASE_URL}/fr/dashboard/kyc-submit`);
        const testFile = path.join(__dirname, '../fixtures/test-identity.pdf');
        await page.getByTestId('kyc-upload-identity').setInputFiles(testFile);
        await page.getByTestId('kyc-submit-button').click();

        await expect(page.getByText(/soumise avec succès/i)).toBeVisible({ timeout: 15000 });

        // Essayer de soumettre à nouveau
        await page.goto(`${BASE_URL}/fr/dashboard/kyc-submit`);

        // Vérifier qu'il y a un message indiquant qu'une soumission existe déjà
        await expect(page.getByText(/soumission en cours/i)).toBeVisible();

        // Vérifier que le bouton de soumission est désactivé
        await expect(page.getByTestId('kyc-submit-button')).toBeDisabled();
    });

    test('should validate file types and sizes', async ({ page }) => {
        // Tester la validation des uploads

        await page.goto(`${BASE_URL}/fr/sign-up`);
        const userEmail = `test.validation.${Date.now()}@example.com`;

        await page.getByTestId('signup-displayName').fill('Test Validation User');
        await page.getByTestId('signup-email').fill(userEmail);
        await page.getByTestId('signup-password').fill('TestPass123!');

        await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

        // Aller sur la page KYC
        await page.goto(`${BASE_URL}/fr/dashboard/kyc-submit`);

        // Essayer d'uploader un fichier invalide (trop gros ou mauvais type)
        const invalidFile = path.join(__dirname, '../fixtures/invalid-file.txt');

        await page.getByTestId('kyc-upload-identity').setInputFiles(invalidFile);

        // Vérifier le message d'erreur
        await expect(page.getByText(/type de fichier non valide/i)).toBeVisible();

        // Vérifier que le bouton reste désactivé
        await expect(page.getByTestId('kyc-submit-button')).toBeDisabled();
    });

    test('should allow admin to view KYC documents', async ({ page }) => {
        // Tester que l'admin peut voir les documents uploadés

        await page.goto(`${BASE_URL}/fr/sign-in`);
        await page.getByTestId('login-email').fill(testAdmin.email);
        await page.getByTestId('login-password').fill(testAdmin.password);

        await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

        await page.goto(`${BASE_URL}/fr/dashboard/admin`);
        await page.getByTestId('admin-tab-kyc').click();

        // Cliquer sur une soumission pour voir les détails
        const firstRow = page.getByTestId('kyc-row').first();
        await expect(firstRow).toBeVisible();

        await firstRow.click();

        // Vérifier que les documents sont affichés
        await expect(page.getByTestId('kyc-document-identity')).toBeVisible();

        // Vérifier qu'on peut cliquer pour télécharger/voir
        const viewButton = page.getByTestId('kyc-document-view-identity');
        await expect(viewButton).toBeVisible();
        await expect(viewButton).toBeEnabled();
    });
});

test.describe('KYC Error Handling', () => {
    test('should handle Firebase Storage errors gracefully', async ({ page }) => {
        // Simuler une erreur de storage (réseau coupé, quota dépassé, etc.)

        await page.goto(`${BASE_URL}/fr/sign-up`);
        const userEmail = `test.error.${Date.now()}@example.com`;

        await page.getByTestId('signup-displayName').fill('Test Error User');
        await page.getByTestId('signup-email').fill(userEmail);
        await page.getByTestId('signup-password').fill('TestPass123!');

        await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

        // Aller sur la page KYC
        await page.goto(`${BASE_URL}/fr/dashboard/kyc-submit`);

        // Bloquer les requêtes storage pour simuler une erreur
        await page.route('**/firebase/**', route => route.abort());

        const testFile = path.join(__dirname, '../fixtures/test-identity.pdf');
        await page.getByTestId('kyc-upload-identity').setInputFiles(testFile);
        await page.getByTestId('kyc-submit-button').click();

        // Vérifier qu'un message d'erreur approprié s'affiche
        await expect(page.getByText(/erreur lors de l'upload/i)).toBeVisible();

        // Vérifier que l'utilisateur peut réessayer
        await expect(page.getByTestId('kyc-submit-button')).toBeEnabled();
    });

    test('should handle Cloud Function timeout', async ({ page }) => {
        // Tester le comportement en cas de timeout de la Cloud Function

        await page.goto(`${BASE_URL}/fr/sign-in`);
        await page.getByTestId('login-email').fill(testAdmin.email);
        await page.getByTestId('login-password').fill(testAdmin.password);

        await page.goto(`${BASE_URL}/fr/dashboard/admin`);
        await page.getByTestId('admin-tab-kyc').click();

        // Simuler un timeout en bloquant la requête
        await page.route('**/approveKYC', route => {
            return new Promise(() => { }); // Ne jamais résoudre
        });

        const firstRow = page.getByTestId('kyc-row').first();
        await firstRow.getByTestId('kyc-approve-button').click();
        await page.getByTestId('kyc-approve-confirm').click();

        // Vérifier qu'un message de timeout s'affiche
        await expect(page.getByText(/délai d'attente dépassé/i)).toBeVisible({ timeout: 35000 });
    });
});
