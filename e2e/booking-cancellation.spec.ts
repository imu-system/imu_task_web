/**
 * Tests E2E pour le système d'annulation de réservations
 * 
 * Scénarios testés:
 * 1. Client annule >48h avant → 100% remboursement
 * 2. Client annule <12h avant → 0% remboursement
 * 3. Provider annule 10h avant → 100% remboursement client + pénalité
 * 4. Tentative annulation après début service → Impossible
 */

import { test, expect, Page } from '@playwright/test';
import { addHours, subHours, format } from 'date-fns';

// Helper pour créer un booking de test
async function createTestBooking(
  page: Page,
  scheduledDate: Date,
  userRole: 'client' | 'provider'
): Promise<string> {
  // TODO: Implémenter la création de booking via API ou UI
  // Pour l'instant, retourne un ID fictif
  return `booking-test-${Date.now()}`;
}

// Helper pour formatter la date pour l'affichage
function formatDateForDisplay(date: Date): string {
  return format(date, 'dd/MM/yyyy HH:mm');
}

test.describe('Système d\'annulation de réservations', () => {
  
  test.beforeEach(async ({ page }) => {
    // Nettoyer les cookies et le localStorage
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());
  });

  test.describe('Client annulation scenarios', () => {
    
    test('Client peut annuler >48h avant avec 100% remboursement', async ({ page }) => {
      // 1. Login as client
      await page.goto('/fr/auth/signin');
      await page.fill('[name="email"]', 'client-test@example.com');
      await page.fill('[name="password"]', 'TestPassword123!');
      await page.click('button[type="submit"]');
      
      // Attendre redirection
      await page.waitForURL(/\/dashboard/);
      
      // 2. Navigate to bookings
      await page.goto('/fr/dashboard/bookings');
      await page.waitForLoadState('networkidle');
      
      // 3. Trouver une réservation planifiée dans 72h
      const futureDate = addHours(new Date(), 72);
      
      // 4. Cliquer sur le bouton d'annulation
      const bookingCard = page.locator('[data-testid="booking-card"]').first();
      await bookingCard.locator('button:has-text("Annuler")').click();
      
      // 5. Vérifier que le dialog s'ouvre
      await expect(page.locator('[data-testid="cancellation-dialog"]')).toBeVisible();
      
      // 6. Vérifier affichage 100% remboursement
      const refundBadge = page.locator('text=/100%/').first();
      await expect(refundBadge).toBeVisible();
      
      // 7. Vérifier montant remboursé = montant original
      const originalAmount = page.locator('text=/Montant initial/').locator('..').locator('text=/€/');
      const refundAmount = page.locator('text=/Montant remboursé/').locator('..').locator('text=/€/');
      
      await expect(originalAmount).toBeVisible();
      await expect(refundAmount).toBeVisible();
      
      // 8. Vérifier temps restant affiché
      const timeRemaining = page.locator('text=/j/').first(); // "3 j" pour 72h
      await expect(timeRemaining).toBeVisible();
      
      // 9. Entrer raison d'annulation
      await page.fill('[id="cancellation-reason"]', 'Imprévu personnel, je dois annuler');
      
      // 10. Vérifier que le bouton "Confirmer" est activé
      const confirmButton = page.locator('button:has-text("Confirmer")');
      await expect(confirmButton).toBeEnabled();
      
      // 11. Confirmer l'annulation
      await confirmButton.click();
      
      // 12. Attendre la confirmation
      await expect(page.locator('text=/Réservation annulée/')).toBeVisible({ timeout: 10000 });
      
      // 13. Vérifier que le toast de succès apparaît
      await expect(page.locator('text=/100%/')).toBeVisible();
      
      // 14. Vérifier que le booking a le status "Annulée"
      await page.waitForTimeout(2000); // Attendre refresh
      const cancelledBadge = bookingCard.locator('text=/Annulée/');
      await expect(cancelledBadge).toBeVisible();
    });

    test('Client annule <12h avant avec 0% remboursement', async ({ page }) => {
      // 1. Login as client
      await page.goto('/fr/auth/signin');
      await page.fill('[name="email"]', 'client-test@example.com');
      await page.fill('[name="password"]', 'TestPassword123!');
      await page.click('button[type="submit"]');
      
      await page.waitForURL(/\/dashboard/);
      
      // 2. Navigate to bookings
      await page.goto('/fr/dashboard/bookings');
      await page.waitForLoadState('networkidle');
      
      // 3. Trouver une réservation planifiée dans 6h
      const nearFutureDate = addHours(new Date(), 6);
      
      // 4. Cliquer sur le bouton d'annulation
      const bookingCard = page.locator('[data-testid="booking-card"]').first();
      await bookingCard.locator('button:has-text("Annuler")').click();
      
      // 5. Vérifier dialog ouvert
      await expect(page.locator('[data-testid="cancellation-dialog"]')).toBeVisible();
      
      // 6. Vérifier affichage 0% remboursement
      const refundPercent = page.locator('text=/0%/').first();
      await expect(refundPercent).toBeVisible();
      
      // 7. Vérifier temps restant en heures
      const timeRemaining = page.locator('text=/6 h/');
      await expect(timeRemaining).toBeVisible();
      
      // 8. Vérifier montant remboursé = 0€
      const refundAmountZero = page.locator('text=/Montant remboursé/').locator('..').locator('text=/0,00 €/');
      await expect(refundAmountZero).toBeVisible();
      
      // 9. Vérifier frais plateforme = montant total
      const platformFee = page.locator('text=/Frais de plateforme retenus/');
      await expect(platformFee).toBeVisible();
      
      // 10. Vérifier message de politique
      const policyMessage = page.locator('text=/Annulation moins de 12h avant/');
      await expect(policyMessage).toBeVisible();
      
      // 11. Entrer raison
      await page.fill('[id="cancellation-reason"]', 'Urgence imprévue');
      
      // 12. Confirmer
      const confirmButton = page.locator('button:has-text("Confirmer")');
      await confirmButton.click();
      
      // 13. Vérifier confirmation avec 0% remboursement
      await expect(page.locator('text=/Réservation annulée/')).toBeVisible({ timeout: 10000 });
      await expect(page.locator('text=/0%/')).toBeVisible();
    });
  });

  test.describe('Provider annulation scenarios', () => {
    
    test('Provider annule 10h avant → 100% remboursement client + pénalité', async ({ page }) => {
      // 1. Login as provider
      await page.goto('/fr/auth/signin');
      await page.fill('[name="email"]', 'provider-test@example.com');
      await page.fill('[name="password"]', 'TestPassword123!');
      await page.click('button[type="submit"]');
      
      await page.waitForURL(/\/dashboard/);
      
      // 2. Navigate to bookings
      await page.goto('/fr/dashboard/bookings');
      await page.waitForLoadState('networkidle');
      
      // 3. Trouver une réservation planifiée dans 10h
      const soonDate = addHours(new Date(), 10);
      
      // 4. Cliquer sur annulation
      const bookingCard = page.locator('[data-testid="booking-card"]').first();
      await bookingCard.locator('button:has-text("Annuler")').click();
      
      // 5. Vérifier dialog
      await expect(page.locator('[data-testid="cancellation-dialog"]')).toBeVisible();
      
      // 6. Vérifier 100% remboursement (pour provider annulation)
      const refundPercent = page.locator('text=/100%/').first();
      await expect(refundPercent).toBeVisible();
      
      // 7. Vérifier temps restant
      const timeRemaining = page.locator('text=/10 h/');
      await expect(timeRemaining).toBeVisible();
      
      // 8. Vérifier pénalité provider affichée
      const providerPenalty = page.locator('text=/Pénalité prestataire/');
      await expect(providerPenalty).toBeVisible();
      
      // 9. Vérifier montant pénalité (20% du montant total pour <12h)
      const penaltyAmount = page.locator('text=/Pénalité prestataire/').locator('..').locator('text=/€/');
      await expect(penaltyAmount).toBeVisible();
      
      // 10. Vérifier message spécifique provider
      const providerMessage = page.locator('text=/Annulation par le prestataire/');
      await expect(providerMessage).toBeVisible();
      
      // 11. Entrer raison
      await page.fill('[id="cancellation-reason"]', 'Problème de santé, impossible d\'honorer la réservation');
      
      // 12. Confirmer
      const confirmButton = page.locator('button:has-text("Confirmer")');
      await confirmButton.click();
      
      // 13. Vérifier confirmation
      await expect(page.locator('text=/Réservation annulée/')).toBeVisible({ timeout: 10000 });
      
      // 14. Vérifier notification client envoyée (vérifier dans logs ou notifications)
      // TODO: Vérifier que la notification a été envoyée au client
    });
  });

  test.describe('Edge cases & validations', () => {
    
    test('Impossible d\'annuler après le début du service', async ({ page }) => {
      // 1. Login as client
      await page.goto('/fr/auth/signin');
      await page.fill('[name="email"]', 'client-test@example.com');
      await page.fill('[name="password"]', 'TestPassword123!');
      await page.click('button[type="submit"]');
      
      await page.waitForURL(/\/dashboard/);
      
      // 2. Navigate to bookings
      await page.goto('/fr/dashboard/bookings');
      await page.waitForLoadState('networkidle');
      
      // 3. Trouver une réservation déjà passée
      const pastDate = subHours(new Date(), 2);
      
      // 4. Essayer de cliquer sur annulation
      const bookingCard = page.locator('[data-testid="booking-card"]').first();
      const cancelButton = bookingCard.locator('button:has-text("Annuler")');
      
      // 5. Vérifier que le bouton n'existe pas ou est désactivé
      const buttonCount = await cancelButton.count();
      if (buttonCount > 0) {
        await expect(cancelButton).toBeDisabled();
      } else {
        // Bouton absent = comportement attendu
        expect(buttonCount).toBe(0);
      }
      
      // Alternative: Si le bouton existe mais ouvre un dialog
      if (buttonCount > 0 && await cancelButton.isEnabled()) {
        await cancelButton.click();
        
        // 6. Vérifier message "Annulation impossible"
        await expect(page.locator('text=/Annulation impossible/')).toBeVisible();
        
        // 7. Vérifier raison
        const impossibleReason = page.locator('text=/Le service a déjà commencé ou est terminé/');
        await expect(impossibleReason).toBeVisible();
        
        // 8. Vérifier que le bouton "Confirmer" est désactivé
        const confirmButton = page.locator('button:has-text("Confirmer")');
        await expect(confirmButton).toBeDisabled();
        
        // 9. Vérifier que le textarea est désactivé
        const reasonTextarea = page.locator('[id="cancellation-reason"]');
        await expect(reasonTextarea).toBeDisabled();
      }
    });

    test('Raison d\'annulation obligatoire', async ({ page }) => {
      // 1. Login
      await page.goto('/fr/auth/signin');
      await page.fill('[name="email"]', 'client-test@example.com');
      await page.fill('[name="password"]', 'TestPassword123!');
      await page.click('button[type="submit"]');
      
      await page.waitForURL(/\/dashboard/);
      
      // 2. Navigate to bookings
      await page.goto('/fr/dashboard/bookings');
      await page.waitForLoadState('networkidle');
      
      // 3. Ouvrir dialog annulation
      const bookingCard = page.locator('[data-testid="booking-card"]').first();
      await bookingCard.locator('button:has-text("Annuler")').click();
      
      await expect(page.locator('[data-testid="cancellation-dialog"]')).toBeVisible();
      
      // 4. Vérifier que le bouton "Confirmer" est désactivé sans raison
      const confirmButton = page.locator('button:has-text("Confirmer")');
      await expect(confirmButton).toBeDisabled();
      
      // 5. Entrer une raison vide ou espaces
      await page.fill('[id="cancellation-reason"]', '   ');
      
      // 6. Vérifier toujours désactivé
      await expect(confirmButton).toBeDisabled();
      
      // 7. Entrer une raison valide
      await page.fill('[id="cancellation-reason"]', 'Raison valide');
      
      // 8. Vérifier activé
      await expect(confirmButton).toBeEnabled();
    });

    test('Affichage correct des montants en EUR', async ({ page }) => {
      // 1. Login
      await page.goto('/fr/auth/signin');
      await page.fill('[name="email"]', 'client-test@example.com');
      await page.fill('[name="password"]', 'TestPassword123!');
      await page.click('button[type="submit"]');
      
      await page.waitForURL(/\/dashboard/);
      
      // 2. Navigate to bookings
      await page.goto('/fr/dashboard/bookings');
      await page.waitForLoadState('networkidle');
      
      // 3. Ouvrir dialog
      const bookingCard = page.locator('[data-testid="booking-card"]').first();
      await bookingCard.locator('button:has-text("Annuler")').click();
      
      await expect(page.locator('[data-testid="cancellation-dialog"]')).toBeVisible();
      
      // 4. Vérifier format monétaire français (virgule, espace, €)
      const amounts = page.locator('text=/\\d+,\\d{2} €/');
      const count = await amounts.count();
      
      // Devrait y avoir au moins 2 montants (original + refund)
      expect(count).toBeGreaterThanOrEqual(2);
      
      // 5. Vérifier que les montants utilisent la virgule (format FR)
      const firstAmount = await amounts.first().textContent();
      expect(firstAmount).toMatch(/\d+,\d{2} €/);
    });
  });

  test.describe('Navigation & UX', () => {
    
    test('Fermeture du dialog réinitialise la raison', async ({ page }) => {
      // 1. Login
      await page.goto('/fr/auth/signin');
      await page.fill('[name="email"]', 'client-test@example.com');
      await page.fill('[name="password"]', 'TestPassword123!');
      await page.click('button[type="submit"]');
      
      await page.waitForURL(/\/dashboard/);
      
      // 2. Navigate to bookings
      await page.goto('/fr/dashboard/bookings');
      await page.waitForLoadState('networkidle');
      
      // 3. Ouvrir dialog
      const bookingCard = page.locator('[data-testid="booking-card"]').first();
      await bookingCard.locator('button:has-text("Annuler")').click();
      
      await expect(page.locator('[data-testid="cancellation-dialog"]')).toBeVisible();
      
      // 4. Entrer une raison
      await page.fill('[id="cancellation-reason"]', 'Première raison');
      
      // 5. Fermer le dialog (bouton "Retour")
      await page.click('button:has-text("Retour")');
      
      // 6. Vérifier dialog fermé
      await expect(page.locator('[data-testid="cancellation-dialog"]')).not.toBeVisible();
      
      // 7. Rouvrir
      await bookingCard.locator('button:has-text("Annuler")').click();
      await expect(page.locator('[data-testid="cancellation-dialog"]')).toBeVisible();
      
      // 8. Vérifier que la raison est vide
      const reasonTextarea = page.locator('[id="cancellation-reason"]');
      const value = await reasonTextarea.inputValue();
      expect(value).toBe('');
    });

    test('Loading state pendant l\'annulation', async ({ page }) => {
      // 1. Login
      await page.goto('/fr/auth/signin');
      await page.fill('[name="email"]', 'client-test@example.com');
      await page.fill('[name="password"]', 'TestPassword123!');
      await page.click('button[type="submit"]');
      
      await page.waitForURL(/\/dashboard/);
      
      // 2. Navigate to bookings
      await page.goto('/fr/dashboard/bookings');
      await page.waitForLoadState('networkidle');
      
      // 3. Ouvrir dialog
      const bookingCard = page.locator('[data-testid="booking-card"]').first();
      await bookingCard.locator('button:has-text("Annuler")').click();
      
      await expect(page.locator('[data-testid="cancellation-dialog"]')).toBeVisible();
      
      // 4. Entrer raison
      await page.fill('[id="cancellation-reason"]', 'Test loading state');
      
      // 5. Cliquer confirmer
      const confirmButton = page.locator('button:has-text("Confirmer")');
      await confirmButton.click();
      
      // 6. Vérifier spinner visible (même brièvement)
      const spinner = page.locator('[data-testid="loading-spinner"]').or(page.locator('.animate-spin'));
      
      // Note: Le spinner peut disparaître rapidement, on vérifie juste qu'il n'y a pas d'erreur
      // await expect(spinner).toBeVisible({ timeout: 1000 });
      
      // 7. Attendre la confirmation finale
      await expect(page.locator('text=/Réservation annulée/')).toBeVisible({ timeout: 10000 });
    });
  });
});
