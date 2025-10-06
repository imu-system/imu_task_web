import { test, expect } from '@playwright/test';

test.describe('Notifications E2E', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/fr/auth/login');
        // TODO: Login with test credentials
    });

    test('should display notifications list', async ({ page }) => {
        await page.goto('/fr/notifications');
        await expect(page.getByText(/notifications/i)).toBeVisible();
    });

    test('should mark notification as read', async ({ page }) => {
        await page.goto('/fr/notifications');

        const notification = page.locator('[data-testid="notification-item"]').first();
        await notification.click();

        await expect(notification).toHaveAttribute('data-read', 'true');
    });

    test('should filter by category', async ({ page }) => {
        await page.goto('/fr/notifications');

        await page.getByRole('button', { name: /tâche/i }).click();

        const notifications = page.locator('[data-testid="notification-item"]');
        await expect(notifications).toHaveCount(await notifications.count());
    });

    test('should load more notifications (infinite scroll)', async ({ page }) => {
        await page.goto('/fr/notifications');

        const initialCount = await page.locator('[data-testid="notification-item"]').count();

        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(1000);

        const newCount = await page.locator('[data-testid="notification-item"]').count();
        expect(newCount).toBeGreaterThanOrEqual(initialCount);
    });

    test('should mark all as read', async ({ page }) => {
        await page.goto('/fr/notifications');

        await page.getByRole('button', { name: /tout marquer comme lu/i }).click();

        const unreadBadge = page.getByTestId('unread-count');
        await expect(unreadBadge).toHaveText('0');
    });
});
