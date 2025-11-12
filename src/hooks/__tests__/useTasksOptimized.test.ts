/**
 * Tests for useTasksOptimized hook
 * 
 * Pour exécuter ces tests:
 * pnpm test src/hooks/__tests__/useTasksOptimized.test.ts
 */

import { renderHook, waitFor } from '@testing-library/react';
import { useTasksOptimized } from '../useTasksOptimized';
import { getDocs } from 'firebase/firestore';

// Mock Firestore
jest.mock('firebase/firestore', () => ({
    collection: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
    orderBy: jest.fn(),
    limit: jest.fn(),
    getDocs: jest.fn(),
    startAfter: jest.fn(),
    Timestamp: {
        fromDate: jest.fn((date) => ({ toDate: () => date })),
    },
}));

jest.mock('@/lib/firebase', () => ({
    db: {},
}));

describe('useTasksOptimized', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should fetch initial tasks', async () => {
        const mockTasks = [
            {
                id: '1',
                title: 'Task 1',
                description: 'Description 1',
                category: 'home_services',
                location: 'Paris',
                budget: 100,
                status: 'open',
                clientId: 'user1',
                createdAt: { toDate: () => new Date() },
                updatedAt: { toDate: () => new Date() },
            },
        ];

        (getDocs as jest.Mock).mockResolvedValue({
            docs: mockTasks.map((task) => ({
                id: task.id,
                data: () => task,
            })),
        });

        const { result } = renderHook(() =>
            useTasksOptimized({
                pageSize: 12,
                filters: { status: 'open' },
            })
        );

        expect(result.current.loading).toBe(true);

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.tasks).toHaveLength(1);
        expect(result.current.tasks[0].title).toBe('Task 1');
    });

    it('should handle errors gracefully', async () => {
        (getDocs as jest.Mock).mockRejectedValue(new Error('Firestore error'));

        const { result } = renderHook(() => useTasksOptimized());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.error).toBeTruthy();
        expect(result.current.tasks).toHaveLength(0);
    });

    it('should support pagination with loadMore', async () => {
        const mockTasks1 = Array.from({ length: 12 }, (_, i) => ({
            id: `task-${i}`,
            title: `Task ${i}`,
            description: 'Description',
            category: 'home_services',
            location: 'Paris',
            budget: 100,
            status: 'open',
            clientId: 'user1',
            createdAt: { toDate: () => new Date() },
            updatedAt: { toDate: () => new Date() },
        }));

        (getDocs as jest.Mock).mockResolvedValue({
            docs: mockTasks1.map((task) => ({
                id: task.id,
                data: () => task,
            })),
        });

        const { result } = renderHook(() =>
            useTasksOptimized({
                pageSize: 12,
            })
        );

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.tasks).toHaveLength(12);
        expect(result.current.hasMore).toBe(true);
    });
});
