/**
 * E2E Tests - Quote System
 * Tests pour le système de devis complet
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:9002';

const testPro = {
    email: `quote.pro.${Date.now()}@example.com`,
    password: 'QuotePro123!',
    displayName: 'Quote Pro Test',
};

const testClient = {
    email: `quote.client.${Date.now()}@example.com`,
    password: 'QuoteClient123!',
    displayName: 'Quote Client Test',
};

const testQuote = {
    title: 'Installation de plomberie - Salle de bain',
    description: 'Installation complète d\'une nouvelle salle de bain avec baignoire, lavabo et WC',
    amount: 2500,
    validityDays: 30,
    items: [
        { description: 'Baignoire encastrable', quantity: 1, unitPrice: 800 },
        { description: 'Lavabo + robinetterie', quantity: 1, unitPrice: 300 },
        { description: 'WC suspendu', quantity: 1, unitPrice: 400 },
        { description: 'Main d\'œuvre installation', quantity: 8, unitPrice: 125 },
    ],
};

test.describe('Quote Creation and Management', () => {

    test('should create a complete quote from professional to client', async ({ page, context }) => {

        // ========== CRÉATION PRO ==========

        await page.goto(`${BASE_URL}/fr/sign-up`);
        await page.getByLabel(/nom/i).fill(testPro.displayName);
        await page.getByLabel(/email/i).fill(testPro.email);
        await page.getByLabel(/mot de passe/i).first().fill(testPro.password);
        await page.getByLabel(/confirmer/i).fill(testPro.password);
        await page.getByRole('button', { name: /s'inscrire/i }).click();

        await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });

        // ========== CRÉATION DEVIS ==========

        await page.goto(`${BASE_URL}/fr/dashboard/pro/quotes/new`);

        await expect(page.getByRole('heading', { name: /nouveau devis/i })).toBeVisible();

        // Informations générales
        await page.getByLabel(/titre/i).fill(testQuote.title);
        await page.getByLabel(/description/i).fill(testQuote.description);

        // Email du client
        await page.getByLabel(/email.*client/i).fill(testClient.email);

        // Validité
        await page.getByLabel(/validité/i).fill(testQuote.validityDays.toString());

        // Ajouter les lignes du devis
        for (const item of testQuote.items) {
            await page.getByRole('button', { name: /ajouter une ligne/i }).click();

            // Remplir la ligne
            await page.getByPlaceholder(/description/i).last().fill(item.description);
            await page.getByPlaceholder(/quantité/i).last().fill(item.quantity.toString());
            await page.getByPlaceholder(/prix unitaire/i).last().fill(item.unitPrice.toString());
        }

        // Vérifier le calcul du total
        const expectedTotal = testQuote.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
        await expect(page.getByText(new RegExp(`${expectedTotal}.*€`))).toBeVisible();

        // Sauvegarder en brouillon
        await page.getByRole('button', { name: /sauvegarder/i }).click();

        await expect(page.getByText(/devis créé/i)).toBeVisible({ timeout: 10000 });

        // Vérifier que le devis apparaît dans la liste
        await page.goto(`${BASE_URL}/fr/dashboard/pro/quotes`);
        await expect(page.getByText(testQuote.title)).toBeVisible();
        await expect(page.getByText(/brouillon/i)).toBeVisible();

        // ========== ENVOI DU DEVIS ==========

        // Ouvrir le devis
        await page.getByText(testQuote.title).click();

        // Envoyer au client
        await page.getByRole('button', { name: /envoyer/i }).click();
        await page.getByRole('button', { name: /confirmer/i }).click();

        await expect(page.getByText(/devis envoyé/i)).toBeVisible({ timeout: 10000 });
        await expect(page.getByText(/en attente/i)).toBeVisible();

        // ========== VÉRIFICATION CLIENT ==========

        const clientPage = await context.newPage();

        // Le client s'inscrit
        await clientPage.goto(`${BASE_URL}/fr/sign-up`);
        await clientPage.getByLabel(/nom/i).fill(testClient.displayName);
        await clientPage.getByLabel(/email/i).fill(testClient.email);
        await clientPage.getByLabel(/mot de passe/i).first().fill(testClient.password);
        await clientPage.getByLabel(/confirmer/i).fill(testClient.password);
        await clientPage.getByRole('button', { name: /s'inscrire/i }).click();

        await expect(clientPage).toHaveURL(/\/dashboard/, { timeout: 15000 });

        // Le client voit le devis
        await clientPage.goto(`${BASE_URL}/fr/dashboard/quotes`);
        await expect(clientPage.getByText(testQuote.title)).toBeVisible();

        await clientPage.close();
    });

    test('should accept quote and create booking', async ({ page, context }) => {

        // ========== SETUP PRO + DEVIS ==========

        await page.goto(`${BASE_URL}/fr/sign-up`);
        await page.getByLabel(/nom/i).fill(testPro.displayName);
        await page.getByLabel(/email/i).fill(testPro.email);
        await page.getByLabel(/mot de passe/i).first().fill(testPro.password);
        await page.getByLabel(/confirmer/i).fill(testPro.password);
        await page.getByRole('button', { name: /s'inscrire/i }).click();

        await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });

        // Créer et envoyer un devis (version courte)
        await page.goto(`${BASE_URL}/fr/dashboard/pro/quotes/new`);
        await page.getByLabel(/titre/i).fill(testQuote.title);
        await page.getByLabel(/email.*client/i).fill(testClient.email);
        await page.getByRole('button', { name: /ajouter une ligne/i }).click();
        await page.getByPlaceholder(/description/i).fill('Service test');
        await page.getByPlaceholder(/quantité/i).fill('1');
        await page.getByPlaceholder(/prix unitaire/i).fill('100');
        await page.getByRole('button', { name: /sauvegarder/i }).click();

        await expect(page.getByText(/devis créé/i)).toBeVisible({ timeout: 10000 });

        await page.getByText(testQuote.title).click();
        await page.getByRole('button', { name: /envoyer/i }).click();
        await page.getByRole('button', { name: /confirmer/i }).click();

        await expect(page.getByText(/devis envoyé/i)).toBeVisible({ timeout: 10000 });

        // ========== CLIENT ACCEPTE ==========

        const clientPage = await context.newPage();

        await clientPage.goto(`${BASE_URL}/fr/sign-up`);
        await clientPage.getByLabel(/nom/i).fill(testClient.displayName);
        await clientPage.getByLabel(/email/i).fill(testClient.email);
        await clientPage.getByLabel(/mot de passe/i).first().fill(testClient.password);
        await clientPage.getByLabel(/confirmer/i).fill(testClient.password);
        await clientPage.getByRole('button', { name: /s'inscrire/i }).click();

        await expect(clientPage).toHaveURL(/\/dashboard/, { timeout: 15000 });

        // Ouvrir le devis
        await clientPage.goto(`${BASE_URL}/fr/dashboard/quotes`);
        await clientPage.getByText(testQuote.title).click();

        // Accepter le devis
        await clientPage.getByRole('button', { name: /accepter/i }).click();

        // Choisir une date pour la réservation
        await clientPage.getByLabel(/date/i).fill('2024-12-15');
        await clientPage.getByLabel(/heure/i).selectOption('14:00');

        await clientPage.getByRole('button', { name: /confirmer/i }).click();

        await expect(clientPage.getByText(/devis accepté/i)).toBeVisible({ timeout: 10000 });

        // Vérifier que la réservation est créée
        await clientPage.goto(`${BASE_URL}/fr/dashboard/bookings`);
        await expect(clientPage.getByText(testQuote.title)).toBeVisible();

        // ========== VÉRIFICATION PRO ==========

        // Le pro voit le devis accepté
        await page.goto(`${BASE_URL}/fr/dashboard/pro/quotes`);
        await expect(page.getByText(/accepté/i)).toBeVisible();

        // Le pro voit la nouvelle réservation
        await page.goto(`${BASE_URL}/fr/dashboard/pro/bookings`);
        await expect(page.getByText(testQuote.title)).toBeVisible();

        await clientPage.close();
    });

    test('should reject quote with reason', async ({ page, context }) => {

        // ========== SETUP ==========

        await page.goto(`${BASE_URL}/fr/sign-up`);
        await page.getByLabel(/nom/i).fill(testPro.displayName);
        await page.getByLabel(/email/i).fill(testPro.email);
        await page.getByLabel(/mot de passe/i).first().fill(testPro.password);
        await page.getByLabel(/confirmer/i).fill(testPro.password);
        await page.getByRole('button', { name: /s'inscrire/i }).click();

        await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });

        // Créer et envoyer un devis
        await page.goto(`${BASE_URL}/fr/dashboard/pro/quotes/new`);
        await page.getByLabel(/titre/i).fill(testQuote.title);
        await page.getByLabel(/email.*client/i).fill(testClient.email);
        await page.getByRole('button', { name: /ajouter une ligne/i }).click();
        await page.getByPlaceholder(/description/i).fill('Service test');
        await page.getByPlaceholder(/quantité/i).fill('1');
        await page.getByPlaceholder(/prix unitaire/i).fill('500');
        await page.getByRole('button', { name: /sauvegarder/i }).click();
        await expect(page.getByText(/devis créé/i)).toBeVisible({ timeout: 10000 });

        await page.getByText(testQuote.title).click();
        await page.getByRole('button', { name: /envoyer/i }).click();
        await page.getByRole('button', { name: /confirmer/i }).click();
        await expect(page.getByText(/devis envoyé/i)).toBeVisible({ timeout: 10000 });

        // ========== CLIENT REFUSE ==========

        const clientPage = await context.newPage();

        await clientPage.goto(`${BASE_URL}/fr/sign-up`);
        await clientPage.getByLabel(/nom/i).fill(testClient.displayName);
        await clientPage.getByLabel(/email/i).fill(testClient.email);
        await clientPage.getByLabel(/mot de passe/i).first().fill(testClient.password);
        await clientPage.getByLabel(/confirmer/i).fill(testClient.password);
        await clientPage.getByRole('button', { name: /s'inscrire/i }).click();

        await expect(clientPage).toHaveURL(/\/dashboard/, { timeout: 15000 });

        // Ouvrir le devis
        await clientPage.goto(`${BASE_URL}/fr/dashboard/quotes`);
        await clientPage.getByText(testQuote.title).click();

        // Refuser le devis
        await clientPage.getByRole('button', { name: /refuser/i }).click();

        // Donner une raison
        await clientPage.getByLabel(/raison/i).fill('Budget dépassé, je cherche une solution moins coûteuse');

        await clientPage.getByRole('button', { name: /confirmer/i }).click();

        await expect(clientPage.getByText(/devis refusé/i)).toBeVisible({ timeout: 10000 });

        // ========== VÉRIFICATION PRO ==========

        // Le pro voit le devis refusé
        await page.goto(`${BASE_URL}/fr/dashboard/pro/quotes`);
        await expect(page.getByText(/refusé/i)).toBeVisible();

        // Le pro peut voir la raison
        await page.getByText(testQuote.title).click();
        await expect(page.getByText(/budget dépassé/i)).toBeVisible();

        await clientPage.close();
    });

    test('should validate quote fields', async ({ page }) => {

        await page.goto(`${BASE_URL}/fr/sign-up`);
        await page.getByLabel(/nom/i).fill(testPro.displayName);
        await page.getByLabel(/email/i).fill(testPro.email);
        await page.getByLabel(/mot de passe/i).first().fill(testPro.password);
        await page.getByLabel(/confirmer/i).fill(testPro.password);
        await page.getByRole('button', { name: /s'inscrire/i }).click();

        await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });

        await page.goto(`${BASE_URL}/fr/dashboard/pro/quotes/new`);

        // Essayer de sauvegarder sans remplir les champs
        await page.getByRole('button', { name: /sauvegarder/i }).click();

        // Vérifier les erreurs
        await expect(page.getByText(/titre.*requis/i)).toBeVisible();
        await expect(page.getByText(/email.*client.*requis/i)).toBeVisible();
        await expect(page.getByText(/au moins une ligne/i)).toBeVisible();

        // Email invalide
        await page.getByLabel(/titre/i).fill(testQuote.title);
        await page.getByLabel(/email.*client/i).fill('not-an-email');
        await page.getByRole('button', { name: /sauvegarder/i }).click();
        await expect(page.getByText(/email.*valide/i)).toBeVisible();

        // Montant négatif
        await page.getByRole('button', { name: /ajouter une ligne/i }).click();
        await page.getByPlaceholder(/description/i).fill('Service');
        await page.getByPlaceholder(/quantité/i).fill('-1');
        await page.getByRole('button', { name: /sauvegarder/i }).click();
        await expect(page.getByText(/quantité.*positive/i)).toBeVisible();
    });

    test('should calculate totals correctly with VAT', async ({ page }) => {

        await page.goto(`${BASE_URL}/fr/sign-up`);
        await page.getByLabel(/nom/i).fill(testPro.displayName);
        await page.getByLabel(/email/i).fill(testPro.email);
        await page.getByLabel(/mot de passe/i).first().fill(testPro.password);
        await page.getByLabel(/confirmer/i).fill(testPro.password);
        await page.getByRole('button', { name: /s'inscrire/i }).click();

        await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });

        await page.goto(`${BASE_URL}/fr/dashboard/pro/quotes/new`);

        await page.getByLabel(/titre/i).fill(testQuote.title);
        await page.getByLabel(/email.*client/i).fill(testClient.email);

        // Ajouter des lignes
        await page.getByRole('button', { name: /ajouter une ligne/i }).click();
        await page.getByPlaceholder(/description/i).fill('Service 1');
        await page.getByPlaceholder(/quantité/i).fill('2');
        await page.getByPlaceholder(/prix unitaire/i).fill('100');

        await page.getByRole('button', { name: /ajouter une ligne/i }).click();
        await page.getByPlaceholder(/description/i).last().fill('Service 2');
        await page.getByPlaceholder(/quantité/i).last().fill('3');
        await page.getByPlaceholder(/prix unitaire/i).last().fill('50');

        // Sous-total: (2 × 100) + (3 × 50) = 200 + 150 = 350€
        await expect(page.getByText(/sous-total.*350.*€/i)).toBeVisible();

        // TVA 20%: 350 × 0.20 = 70€
        await expect(page.getByText(/tva.*70.*€/i)).toBeVisible();

        // Total TTC: 350 + 70 = 420€
        await expect(page.getByText(/total.*420.*€/i)).toBeVisible();
    });

    test('should filter and search quotes', async ({ page }) => {

        await page.goto(`${BASE_URL}/fr/sign-up`);
        await page.getByLabel(/nom/i).fill(testPro.displayName);
        await page.getByLabel(/email/i).fill(testPro.email);
        await page.getByLabel(/mot de passe/i).first().fill(testPro.password);
        await page.getByLabel(/confirmer/i).fill(testPro.password);
        await page.getByRole('button', { name: /s'inscrire/i }).click();

        await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });

        // Créer plusieurs devis avec statuts différents
        const quotes = [
            { title: 'Devis Plomberie', status: 'draft' },
            { title: 'Devis Électricité', status: 'sent' },
            { title: 'Devis Chauffage', status: 'accepted' },
        ];

        for (const quote of quotes) {
            await page.goto(`${BASE_URL}/fr/dashboard/pro/quotes/new`);
            await page.getByLabel(/titre/i).fill(quote.title);
            await page.getByLabel(/email.*client/i).fill(testClient.email);
            await page.getByRole('button', { name: /ajouter une ligne/i }).click();
            await page.getByPlaceholder(/description/i).fill('Service');
            await page.getByPlaceholder(/quantité/i).fill('1');
            await page.getByPlaceholder(/prix unitaire/i).fill('100');
            await page.getByRole('button', { name: /sauvegarder/i }).click();
            await expect(page.getByText(/devis créé/i)).toBeVisible({ timeout: 10000 });
        }

        // Retour à la liste
        await page.goto(`${BASE_URL}/fr/dashboard/pro/quotes`);

        // Vérifier que tous les devis sont visibles
        await expect(page.getByText('Devis Plomberie')).toBeVisible();
        await expect(page.getByText('Devis Électricité')).toBeVisible();
        await expect(page.getByText('Devis Chauffage')).toBeVisible();

        // Filtrer par statut "brouillon"
        await page.getByLabel(/statut/i).selectOption('draft');
        await expect(page.getByText('Devis Plomberie')).toBeVisible();
        await expect(page.getByText('Devis Électricité')).not.toBeVisible();

        // Recherche par titre
        await page.getByLabel(/statut/i).selectOption('all'); // Reset
        await page.getByPlaceholder(/rechercher/i).fill('Chauffage');
        await expect(page.getByText('Devis Chauffage')).toBeVisible();
        await expect(page.getByText('Devis Plomberie')).not.toBeVisible();
    });
});
