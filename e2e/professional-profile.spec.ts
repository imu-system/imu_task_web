/**
 * E2E Tests - Professional Profile
 * Tests pour le profil professionnel complet
 */

import { test, expect } from '@playwright/test';
import path from 'path';

const BASE_URL = 'http://localhost:9002';

const testPro = {
    email: `profile.pro.${Date.now()}@example.com`,
    password: 'ProfilePro123!',
    displayName: 'Profile Pro Test',
    siret: '11122233344455',
    companyName: 'Pro Services SARL',
    bio: 'Expert en plomberie avec 15 ans d\'expérience',
    phone: '+33612345678',
    website: 'https://www.proservices.fr',
    services: ['Plomberie', 'Chauffage', 'Dépannage urgent'],
    zones: ['75001', '75002', '75003'],
};

test.describe('Professional Profile Management', () => {
    test.beforeEach(async ({ page }) => {
        // Inscription et validation KYB (pré-requis)
        await page.goto(`${BASE_URL}/fr/sign-up`);
        await page.getByLabel(/nom/i).fill(testPro.displayName);
        await page.getByLabel(/email/i).fill(testPro.email);
        await page.getByLabel(/mot de passe/i).first().fill(testPro.password);
        await page.getByLabel(/confirmer/i).fill(testPro.password);
        await page.getByRole('button', { name: /s'inscrire/i }).click();

        await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
    });

    test('should create and edit complete professional profile', async ({ page }) => {
        // Navigation vers le profil pro
        await page.goto(`${BASE_URL}/fr/dashboard/pro/profile/edit`);

        // ========== INFORMATIONS DE BASE ==========

        await expect(page.getByRole('heading', { name: /modifier le profil/i })).toBeVisible();

        // Bio
        await page.getByLabel(/bio/i).fill(testPro.bio);

        // Téléphone
        await page.getByLabel(/téléphone/i).fill(testPro.phone);

        // Site web
        await page.getByLabel(/site web/i).fill(testPro.website);

        // ========== SERVICES ==========

        // Ajouter des services
        for (const service of testPro.services) {
            await page.getByPlaceholder(/ajouter un service/i).fill(service);
            await page.getByRole('button', { name: /ajouter service/i }).click();
            await expect(page.getByText(service)).toBeVisible();
        }

        // ========== ZONES D'INTERVENTION ==========

        // Ajouter des zones
        for (const zone of testPro.zones) {
            await page.getByPlaceholder(/code postal/i).fill(zone);
            await page.getByRole('button', { name: /ajouter zone/i }).click();
            await expect(page.getByText(zone)).toBeVisible();
        }

        // ========== DISPONIBILITÉS ==========

        // Activer les réservations immédiates
        await page.getByLabel(/réservations immédiates/i).check();

        // Délai de préavis
        await page.getByLabel(/délai de préavis/i).selectOption('48h');

        // ========== SAUVEGARDER ==========

        await page.getByRole('button', { name: /enregistrer/i }).click();

        // Attendre la confirmation
        await expect(page.getByText(/profil mis à jour/i)).toBeVisible({ timeout: 10000 });

        // ========== VÉRIFICATION ==========

        // Retour à la page de visualisation
        await page.goto(`${BASE_URL}/fr/dashboard/pro/profile`);

        // Vérifier les informations
        await expect(page.getByText(testPro.bio)).toBeVisible();
        await expect(page.getByText(testPro.phone)).toBeVisible();
        await expect(page.getByText(testPro.website)).toBeVisible();

        // Vérifier les services
        for (const service of testPro.services) {
            await expect(page.getByText(service)).toBeVisible();
        }

        // Vérifier les zones
        for (const zone of testPro.zones) {
            await expect(page.getByText(zone)).toBeVisible();
        }
    });

    test('should upload and manage portfolio photos', async ({ page }) => {
        await page.goto(`${BASE_URL}/fr/dashboard/pro/portfolio`);

        await expect(page.getByRole('heading', { name: /portfolio/i })).toBeVisible();

        // Préparer les fichiers de test
        const photo1 = path.join(__dirname, 'fixtures', 'test-avatar.png');
        const photo2 = path.join(__dirname, 'fixtures', 'test-identity.png');
        const photo3 = path.join(__dirname, 'fixtures', 'test-address.png');

        // Upload de la première photo
        await page.getByLabel(/ajouter une photo/i).setInputFiles(photo1);

        // Attendre l'upload
        await expect(page.getByRole('img', { name: /portfolio/i }).first()).toBeVisible({ timeout: 10000 });

        // Ajouter une description
        await page.getByPlaceholder(/description/i).first().fill('Projet de plomberie - Salle de bain');

        // Upload de photos supplémentaires
        await page.getByLabel(/ajouter une photo/i).setInputFiles([photo2, photo3]);

        // Attendre que toutes les photos soient visibles
        await expect(page.getByRole('img', { name: /portfolio/i })).toHaveCount(3, { timeout: 15000 });

        // Sauvegarder
        await page.getByRole('button', { name: /enregistrer/i }).click();
        await expect(page.getByText(/portfolio mis à jour/i)).toBeVisible({ timeout: 10000 });

        // Vérifier sur le profil public
        await page.goto(`${BASE_URL}/fr/professionals/${testPro.email.split('@')[0]}`);
        await expect(page.getByRole('img', { name: /portfolio/i })).toHaveCount(3);

        // Test de suppression de photo
        await page.goto(`${BASE_URL}/fr/dashboard/pro/portfolio`);

        // Supprimer la première photo
        await page.getByRole('button', { name: /supprimer/i }).first().click();
        await page.getByRole('button', { name: /confirmer/i }).click();

        await expect(page.getByRole('img', { name: /portfolio/i })).toHaveCount(2, { timeout: 5000 });
    });

    test('should manage reviews and ratings', async ({ page, context }) => {
        // Le professionnel doit d'abord avoir un profil
        await page.goto(`${BASE_URL}/fr/dashboard/pro/profile/edit`);
        await page.getByLabel(/bio/i).fill(testPro.bio);
        await page.getByRole('button', { name: /enregistrer/i }).click();
        await expect(page.getByText(/profil mis à jour/i)).toBeVisible({ timeout: 10000 });

        // ========== CLIENT LAISSE UN AVIS ==========

        const clientPage = await context.newPage();

        // Créer un client
        const client = {
            email: `client.${Date.now()}@example.com`,
            password: 'ClientPass123!',
            displayName: 'Client Test',
        };

        await clientPage.goto(`${BASE_URL}/fr/sign-up`);
        await clientPage.getByLabel(/nom/i).fill(client.displayName);
        await clientPage.getByLabel(/email/i).fill(client.email);
        await clientPage.getByLabel(/mot de passe/i).first().fill(client.password);
        await clientPage.getByLabel(/confirmer/i).fill(client.password);
        await clientPage.getByRole('button', { name: /s'inscrire/i }).click();

        await expect(clientPage).toHaveURL(/\/dashboard/, { timeout: 15000 });

        // Visiter le profil du pro
        await clientPage.goto(`${BASE_URL}/fr/professionals/${testPro.email.split('@')[0]}`);

        // Laisser un avis (nécessite une réservation complétée - simuler ou utiliser une API de test)
        // Pour ce test, on suppose qu'il y a un bouton pour laisser un avis

        await clientPage.getByRole('button', { name: /laisser un avis/i }).click();

        // Remplir le formulaire d'avis
        await clientPage.getByLabel(/note/i).click();
        await clientPage.getByRole('button', { name: '5' }).click(); // 5 étoiles

        await clientPage.getByLabel(/commentaire/i).fill('Excellent travail ! Très professionnel et rapide.');

        await clientPage.getByRole('button', { name: /publier/i }).click();

        await expect(clientPage.getByText(/avis publié/i)).toBeVisible({ timeout: 10000 });

        // ========== VÉRIFICATION PRO ==========

        // Le pro voit son nouvel avis
        await page.goto(`${BASE_URL}/fr/dashboard/pro/reviews`);

        await expect(page.getByText(/excellent travail/i)).toBeVisible();
        await expect(page.getByText(client.displayName)).toBeVisible();

        // Vérifier la note moyenne
        await page.goto(`${BASE_URL}/fr/dashboard/pro/profile`);
        await expect(page.getByText(/5\.0/)).toBeVisible(); // Note moyenne

        await clientPage.close();
    });

    test('should validate required fields', async ({ page }) => {
        await page.goto(`${BASE_URL}/fr/dashboard/pro/profile/edit`);

        // Essayer de sauvegarder sans remplir les champs obligatoires
        await page.getByRole('button', { name: /enregistrer/i }).click();

        // Vérifier les messages d'erreur
        await expect(page.getByText(/bio.*requis/i)).toBeVisible();
        await expect(page.getByText(/téléphone.*requis/i)).toBeVisible();

        // Vérifier le format du téléphone
        await page.getByLabel(/téléphone/i).fill('123'); // Format invalide
        await page.getByRole('button', { name: /enregistrer/i }).click();
        await expect(page.getByText(/format.*téléphone/i)).toBeVisible();

        // Vérifier le format de l'URL
        await page.getByLabel(/site web/i).fill('not-a-url');
        await page.getByRole('button', { name: /enregistrer/i }).click();
        await expect(page.getByText(/url.*valide/i)).toBeVisible();
    });

    test('should handle portfolio photo size limits', async ({ page }) => {
        await page.goto(`${BASE_URL}/fr/dashboard/pro/portfolio`);

        // Essayer d'uploader un fichier trop volumineux
        const largeFile = path.join(__dirname, 'fixtures', 'too-large.pdf');

        await page.getByLabel(/ajouter une photo/i).setInputFiles(largeFile);

        // Vérifier le message d'erreur
        await expect(page.getByText(/taille.*maximale/i)).toBeVisible({ timeout: 5000 });
    });

    test('should toggle profile visibility', async ({ page }) => {
        await page.goto(`${BASE_URL}/fr/dashboard/pro/profile/edit`);

        // Remplir le profil
        await page.getByLabel(/bio/i).fill(testPro.bio);
        await page.getByLabel(/téléphone/i).fill(testPro.phone);

        // Désactiver la visibilité du profil
        await page.getByLabel(/profil visible/i).uncheck();

        await page.getByRole('button', { name: /enregistrer/i }).click();
        await expect(page.getByText(/profil mis à jour/i)).toBeVisible({ timeout: 10000 });

        // Vérifier que le profil n'est pas accessible publiquement
        await page.goto(`${BASE_URL}/fr/professionals/${testPro.email.split('@')[0]}`);
        await expect(page.getByText(/profil non disponible/i)).toBeVisible();

        // Réactiver
        await page.goto(`${BASE_URL}/fr/dashboard/pro/profile/edit`);
        await page.getByLabel(/profil visible/i).check();
        await page.getByRole('button', { name: /enregistrer/i }).click();

        // Vérifier l'accès public
        await page.goto(`${BASE_URL}/fr/professionals/${testPro.email.split('@')[0]}`);
        await expect(page.getByText(testPro.bio)).toBeVisible();
    });
});
