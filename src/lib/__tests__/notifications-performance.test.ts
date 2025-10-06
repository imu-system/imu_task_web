import { performance } from 'perf_hooks';
import { getNotificationsPaginated, getUnreadCountOptimized } from '../firestore-notifications-optimized';

describe('Notification Performance Benchmarks', () => {
    const TEST_USER_ID = 'test-user-benchmark';

    test('getNotificationsPaginated should complete in <500ms', async () => {
        const start = performance.now();

        await getNotificationsPaginated({
            userId: TEST_USER_ID,
            limit: 20,
        });

        const duration = performance.now() - start;
        expect(duration).toBeLessThan(500);
    });

    test('getNotificationsPaginated with filters should complete in <600ms', async () => {
        const start = performance.now();

        await getNotificationsPaginated({
            userId: TEST_USER_ID,
            category: 'task',
            unreadOnly: true,
            limit: 20,
        });

        const duration = performance.now() - start;
        expect(duration).toBeLessThan(600);
    });

    test('getUnreadCountOptimized should complete in <200ms', async () => {
        const start = performance.now();

        await getUnreadCountOptimized(TEST_USER_ID);

        const duration = performance.now() - start;
        expect(duration).toBeLessThan(200);
    });

    test('pagination should fetch 100 items in <2s', async () => {
        const start = performance.now();
        let lastDoc = undefined;
        let totalFetched = 0;

        for (let i = 0; i < 5; i++) {
            const result = await getNotificationsPaginated({
                userId: TEST_USER_ID,
                limit: 20,
                startAfterDoc: lastDoc,
            });

            totalFetched += result.notifications.length;
            lastDoc = result.lastDoc ?? undefined;

            if (!result.hasMore) break;
        }

        const duration = performance.now() - start;
        expect(duration).toBeLessThan(2000);
        expect(totalFetched).toBeGreaterThan(0);
    });
});
