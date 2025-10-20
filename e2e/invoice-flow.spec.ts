/**
 * E2E Tests - Invoice System
 * Tests pour le système de factures
 */

import { test, expect } from '@playwright/test';
import path from 'path';

const BASE_URL = 'http://localhost:9002';

const testPro = {
    email: `invoice.pro.${Date.now()}@example.com`,
    password: 'InvoicePro123!',
    displayName: 'Invoice Pro Test',
};

test.describe('Invoice Management', () => {

    test('should upload invoice and get admin approval', async ({ page, context }) => {

        // ========== PROFESSIONAL SIGNUP ==========

        await page.goto(`${BASE_URL}/fr/sign-up`);
        await page.getByLabel(/nom/i).fill(testPro.displayName);
        await page.getByLabel(/email/i).fill(testPro.email);
        await page.getByLabel(/mot de passe/i).first().fill(testPro.password);
        await page.getByLabel(/confirmer/i).fill(testPro.password);
        await page.getByRole('button', { name: /s'inscrire/i }).click();

        await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });

        // ========== UPLOAD INVOICE ==========

        await page.goto(`${BASE_URL}/fr/dashboard/pro/invoices/upload`);

        await expect(page.getByRole('heading', { name: /nouvelle facture/i })).toBeVisible();

        // Informations de la facture
        await page.getByLabel(/numéro/i).fill('FAC-2024-001');
        await page.getByLabel(/montant/i).fill('1250.50');
        await page.getByLabel(/date d'émission/i).fill('2024-01-15');
        await page.getByLabel(/date d'échéance/i).fill('2024-02-15');
        await page.getByLabel(/description/i).fill('Travaux de plomberie - Appartement Dupont');

        // Upload du fichier PDF
        const invoicePdf = path.join(__dirname, 'fixtures', 'test-professional.pdf');
        await page.getByLabel(/fichier pdf/i).setInputFiles(invoicePdf);

        // Soumettre
        await page.getByRole('button', { name: /soumettre/i }).click();

        await expect(page.getByText(/facture soumise/i)).toBeVisible({ timeout: 10000 });

        // Vérifier le statut "en attente"
        await page.goto(`${BASE_URL}/fr/dashboard/pro/invoices`);
        await expect(page.getByText('FAC-2024-001')).toBeVisible();
        await expect(page.getByText(/en attente/i)).toBeVisible();

        // ========== ADMIN APPROVAL ==========

        const adminPage = await context.newPage();

        // Admin login (suppose qu'un admin existe)
        await adminPage.goto(`${BASE_URL}/fr/admin/invoices`);

        // Rechercher par numéro
        await adminPage.getByPlaceholder(/rechercher/i).fill('FAC-2024-001');

        await expect(adminPage.getByText('FAC-2024-001')).toBeVisible();
        await expect(adminPage.getByText(testPro.displayName)).toBeVisible();

        // Ouvrir la facture
        await adminPage.getByText('FAC-2024-001').click();

        // Vérifier les détails
        await expect(adminPage.getByText(/1250\.50.*€/)).toBeVisible();
        await expect(adminPage.getByText(/Travaux de plomberie/i)).toBeVisible();

        // Approuver
        await adminPage.getByRole('button', { name: /approuver/i }).click();
        await adminPage.getByRole('button', { name: /confirmer/i }).click();

        await expect(adminPage.getByText(/facture approuvée/i)).toBeVisible({ timeout: 10000 });

        // ========== VERIFY PROFESSIONAL SIDE ==========

        await page.reload();
        await expect(page.getByText(/approuvée/i)).toBeVisible();

        await adminPage.close();
    });

    test('should reject invoice with reason', async ({ page, context }) => {

        await page.goto(`${BASE_URL}/fr/sign-up`);
        await page.getByLabel(/nom/i).fill(testPro.displayName);
        await page.getByLabel(/email/i).fill(testPro.email);
        await page.getByLabel(/mot de passe/i).first().fill(testPro.password);
        await page.getByLabel(/confirmer/i).fill(testPro.password);
        await page.getByRole('button', { name: /s'inscrire/i }).click();

        await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });

        // Upload invoice
        await page.goto(`${BASE_URL}/fr/dashboard/pro/invoices/upload`);
        await page.getByLabel(/numéro/i).fill('FAC-2024-002');
        await page.getByLabel(/montant/i).fill('500');
        await page.getByLabel(/date d'émission/i).fill('2024-01-15');
        await page.getByLabel(/date d'échéance/i).fill('2024-02-15');

        const invoicePdf = path.join(__dirname, 'fixtures', 'test-professional.pdf');
        await page.getByLabel(/fichier pdf/i).setInputFiles(invoicePdf);

        await page.getByRole('button', { name: /soumettre/i }).click();
        await expect(page.getByText(/facture soumise/i)).toBeVisible({ timeout: 10000 });

        // ========== ADMIN REJECTS ==========

        const adminPage = await context.newPage();
        await adminPage.goto(`${BASE_URL}/fr/admin/invoices`);

        await adminPage.getByPlaceholder(/rechercher/i).fill('FAC-2024-002');
        await adminPage.getByText('FAC-2024-002').click();

        // Rejeter
        await adminPage.getByRole('button', { name: /refuser/i }).click();

        // Raison du refus
        await adminPage.getByLabel(/raison/i).fill('Le PDF fourni n\'est pas lisible. Merci de soumettre un nouveau document.');

        await adminPage.getByRole('button', { name: /confirmer/i }).click();

        await expect(adminPage.getByText(/facture refusée/i)).toBeVisible({ timeout: 10000 });

        // ========== VERIFY PROFESSIONAL SEES REJECTION ==========

        await page.reload();
        await expect(page.getByText(/refusée/i)).toBeVisible();

        // Voir la raison
        await page.getByText('FAC-2024-002').click();
        await expect(page.getByText(/PDF.*pas lisible/i)).toBeVisible();

        await adminPage.close();
    });

    test('should validate invoice upload fields', async ({ page }) => {

        await page.goto(`${BASE_URL}/fr/sign-up`);
        await page.getByLabel(/nom/i).fill(testPro.displayName);
        await page.getByLabel(/email/i).fill(testPro.email);
        await page.getByLabel(/mot de passe/i).first().fill(testPro.password);
        await page.getByLabel(/confirmer/i).fill(testPro.password);
        await page.getByRole('button', { name: /s'inscrire/i }).click();

        await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });

        await page.goto(`${BASE_URL}/fr/dashboard/pro/invoices/upload`);

        // Essayer de soumettre sans remplir les champs
        await page.getByRole('button', { name: /soumettre/i }).click();

        // Vérifier les erreurs
        await expect(page.getByText(/numéro.*requis/i)).toBeVisible();
        await expect(page.getByText(/montant.*requis/i)).toBeVisible();
        await expect(page.getByText(/date.*émission.*requise/i)).toBeVisible();
        await expect(page.getByText(/fichier pdf.*requis/i)).toBeVisible();

        // Montant négatif
        await page.getByLabel(/montant/i).fill('-100');
        await page.getByRole('button', { name: /soumettre/i }).click();
        await expect(page.getByText(/montant.*positif/i)).toBeVisible();

        // Date d'échéance avant date d'émission
        await page.getByLabel(/date d'émission/i).fill('2024-02-15');
        await page.getByLabel(/date d'échéance/i).fill('2024-01-15');
        await page.getByRole('button', { name: /soumettre/i }).click();
        await expect(page.getByText(/échéance.*après.*émission/i)).toBeVisible();
    });

    test('should reject invalid file types', async ({ page }) => {

        await page.goto(`${BASE_URL}/fr/sign-up`);
        await page.getByLabel(/nom/i).fill(testPro.displayName);
        await page.getByLabel(/email/i).fill(testPro.email);
        await page.getByLabel(/mot de passe/i).first().fill(testPro.password);
        await page.getByLabel(/confirmer/i).fill(testPro.password);
        await page.getByRole('button', { name: /s'inscrire/i }).click();

        await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });

        await page.goto(`${BASE_URL}/fr/dashboard/pro/invoices/upload`);

        // Remplir les champs requis
        await page.getByLabel(/numéro/i).fill('FAC-2024-003');
        await page.getByLabel(/montant/i).fill('500');
        await page.getByLabel(/date d'émission/i).fill('2024-01-15');
        await page.getByLabel(/date d'échéance/i).fill('2024-02-15');

        // Essayer d'uploader un fichier non-PDF
        const invalidFile = path.join(__dirname, 'fixtures', 'invalid-file.txt');
        await page.getByLabel(/fichier pdf/i).setInputFiles(invalidFile);

        await page.getByRole('button', { name: /soumettre/i }).click();

        // Vérifier l'erreur
        await expect(page.getByText(/format.*pdf/i)).toBeVisible();
    });

    test('should reject files exceeding size limit', async ({ page }) => {

        await page.goto(`${BASE_URL}/fr/sign-up`);
        await page.getByLabel(/nom/i).fill(testPro.displayName);
        await page.getByLabel(/email/i).fill(testPro.email);
        await page.getByLabel(/mot de passe/i).first().fill(testPro.password);
        await page.getByLabel(/confirmer/i).fill(testPro.password);
        await page.getByRole('button', { name: /s'inscrire/i }).click();

        await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });

        await page.goto(`${BASE_URL}/fr/dashboard/pro/invoices/upload`);

        await page.getByLabel(/numéro/i).fill('FAC-2024-004');
        await page.getByLabel(/montant/i).fill('500');
        await page.getByLabel(/date d'émission/i).fill('2024-01-15');
        await page.getByLabel(/date d'échéance/i).fill('2024-02-15');

        // Fichier trop volumineux
        const largeFile = path.join(__dirname, 'fixtures', 'too-large.pdf');
        await page.getByLabel(/fichier pdf/i).setInputFiles(largeFile);

        await page.getByRole('button', { name: /soumettre/i }).click();

        await expect(page.getByText(/taille.*maximale/i)).toBeVisible();
    });

    test('should filter invoices by status', async ({ page }) => {

        await page.goto(`${BASE_URL}/fr/sign-up`);
        await page.getByLabel(/nom/i).fill(testPro.displayName);
        await page.getByLabel(/email/i).fill(testPro.email);
        await page.getByLabel(/mot de passe/i).first().fill(testPro.password);
        await page.getByLabel(/confirmer/i).fill(testPro.password);
        await page.getByRole('button', { name: /s'inscrire/i }).click();

        await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });

        // Créer plusieurs factures
        const invoices = [
            { number: 'FAC-001', amount: '100' },
            { number: 'FAC-002', amount: '200' },
            { number: 'FAC-003', amount: '300' },
        ];

        const invoicePdf = path.join(__dirname, 'fixtures', 'test-professional.pdf');

        for (const invoice of invoices) {
            await page.goto(`${BASE_URL}/fr/dashboard/pro/invoices/upload`);
            await page.getByLabel(/numéro/i).fill(invoice.number);
            await page.getByLabel(/montant/i).fill(invoice.amount);
            await page.getByLabel(/date d'émission/i).fill('2024-01-15');
            await page.getByLabel(/date d'échéance/i).fill('2024-02-15');
            await page.getByLabel(/fichier pdf/i).setInputFiles(invoicePdf);
            await page.getByRole('button', { name: /soumettre/i }).click();
            await expect(page.getByText(/facture soumise/i)).toBeVisible({ timeout: 10000 });
        }

        // Aller à la liste
        await page.goto(`${BASE_URL}/fr/dashboard/pro/invoices`);

        // Vérifier que toutes sont visibles
        await expect(page.getByText('FAC-001')).toBeVisible();
        await expect(page.getByText('FAC-002')).toBeVisible();
        await expect(page.getByText('FAC-003')).toBeVisible();

        // Filtrer par statut "en attente"
        await page.getByLabel(/statut/i).selectOption('pending');
        await expect(page.getByText('FAC-001')).toBeVisible();

        // Rechercher par numéro
        await page.getByPlaceholder(/rechercher/i).fill('FAC-002');
        await expect(page.getByText('FAC-002')).toBeVisible();
        await expect(page.getByText('FAC-001')).not.toBeVisible();
    });

    test('should download invoice PDF', async ({ page }) => {

        await page.goto(`${BASE_URL}/fr/sign-up`);
        await page.getByLabel(/nom/i).fill(testPro.displayName);
        await page.getByLabel(/email/i).fill(testPro.email);
        await page.getByLabel(/mot de passe/i).first().fill(testPro.password);
        await page.getByLabel(/confirmer/i).fill(testPro.password);
        await page.getByRole('button', { name: /s'inscrire/i }).click();

        await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });

        // Upload invoice
        await page.goto(`${BASE_URL}/fr/dashboard/pro/invoices/upload`);
        await page.getByLabel(/numéro/i).fill('FAC-2024-DL');
        await page.getByLabel(/montant/i).fill('750');
        await page.getByLabel(/date d'émission/i).fill('2024-01-15');
        await page.getByLabel(/date d'échéance/i).fill('2024-02-15');

        const invoicePdf = path.join(__dirname, 'fixtures', 'test-professional.pdf');
        await page.getByLabel(/fichier pdf/i).setInputFiles(invoicePdf);

        await page.getByRole('button', { name: /soumettre/i }).click();
        await expect(page.getByText(/facture soumise/i)).toBeVisible({ timeout: 10000 });

        // Ouvrir la facture
        await page.goto(`${BASE_URL}/fr/dashboard/pro/invoices`);
        await page.getByText('FAC-2024-DL').click();

        // Télécharger le PDF
        const downloadPromise = page.waitForEvent('download');
        await page.getByRole('button', { name: /télécharger/i }).click();
        const download = await downloadPromise;

        // Vérifier le nom du fichier
        expect(download.suggestedFilename()).toContain('FAC-2024-DL');
        expect(download.suggestedFilename()).toContain('.pdf');
    });
});
