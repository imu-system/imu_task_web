/**
 * Custom React hooks for client statistics and spending analytics
 * 
 * Phase 9: Option C - Graphiques de statistiques clients
 * 
 * Hooks disponibles:
 * - useClientSpendingByMonth: Dépenses mensuelles sur les derniers mois
 * - useTasksByCategory: Répartition des missions par catégorie
 * - useTaskCompletion: Taux de complétion et statistiques missions
 */

import { useState, useEffect, useMemo } from 'react';
import {
    collection,
    query,
    where,
    getDocs,
    orderBy,
    Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useLiveData } from './use-live-updates';

// ========================================
// TYPES
// ========================================

export interface MonthlySpending {
    month: string; // Format: "Nov 2024"
    monthKey: string; // Format: "2024-11" pour tri
    spending: number;
    bookings: number;
    averagePerBooking: number;
}

export interface CategorySpending {
    category: string;
    spending: number;
    taskCount: number;
    percentage: number;
}

export interface TaskCompletionStats {
    totalTasks: number;
    activeTasks: number;
    completedTasks: number;
    cancelledTasks: number;
    completionRate: number; // Percentage
    averageTaskDuration: number; // Days
}

interface HookState<T> {
    data: T | null;
    loading: boolean;
    error: Error | null;
}

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Format month name from date
 */
function formatMonth(date: Date): string {
    return date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
}

/**
 * Get month key for sorting (YYYY-MM)
 */
function getMonthKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
}

/**
 * Get first day of month N months ago
 */
function getMonthsAgo(months: number): Date {
    const date = new Date();
    date.setMonth(date.getMonth() - months);
    date.setDate(1);
    date.setHours(0, 0, 0, 0);
    return date;
}

// ========================================
// CLIENT SPENDING BY MONTH HOOK
// ========================================

export function useClientSpendingByMonth(
    userId: string | undefined,
    monthsBack: number = 6
): HookState<MonthlySpending[]> {
    // Build Firestore query
    const bookingsQuery = useMemo(() => {
        if (!userId) return null;

        const startDate = getMonthsAgo(monthsBack);

        return query(
            collection(db, 'bookings'),
            where('clientId', '==', userId),
            where('status', '==', 'completed'),
            where('completedAt', '>=', Timestamp.fromDate(startDate)),
            orderBy('completedAt', 'asc')
        );
    }, [userId, monthsBack]);

    // Transform function
    const transform = useMemo(() => {
        return (snapshot: any) => {
            // Group by month
            const monthlyData: Record<string, { spending: number; count: number }> = {};

            snapshot.docs.forEach((doc: any) => {
                const data = doc.data();
                const completedAt = data.completedAt?.toDate?.() || new Date();
                const monthKey = getMonthKey(completedAt);
                const amount = data.amount || 0;

                if (!monthlyData[monthKey]) {
                    monthlyData[monthKey] = { spending: 0, count: 0 };
                }

                monthlyData[monthKey].spending += amount;
                monthlyData[monthKey].count += 1;
            });

            // Convert to array and fill missing months
            const monthlySpending: MonthlySpending[] = [];
            for (let i = monthsBack - 1; i >= 0; i--) {
                const date = getMonthsAgo(i);
                const monthKey = getMonthKey(date);
                const data = monthlyData[monthKey] || { spending: 0, count: 0 };

                monthlySpending.push({
                    month: formatMonth(date),
                    monthKey,
                    spending: data.spending,
                    bookings: data.count,
                    averagePerBooking: data.count > 0 ? data.spending / data.count : 0
                });
            }

            return monthlySpending;
        };
    }, [monthsBack]);

    // Use live data hook
    const liveState = useLiveData(bookingsQuery, transform, {
        throttleMs: 300,
        enabled: !!userId
    });

    return {
        data: liveState.data,
        loading: liveState.loading,
        error: liveState.error
    };
}

// ========================================
// TASKS BY CATEGORY HOOK
// ========================================

export function useTasksByCategory(
    userId: string | undefined
): HookState<CategorySpending[]> {
    const [state, setState] = useState<HookState<CategorySpending[]>>({
        data: null,
        loading: true,
        error: null
    });

    useEffect(() => {
        if (!userId) {
            setState({ data: null, loading: false, error: null });
            return;
        }

        const fetchTasksByCategory = async () => {
            setState(prev => ({ ...prev, loading: true, error: null }));

            try {
                // Fetch completed bookings as client
                const bookingsQuery = query(
                    collection(db, 'bookings'),
                    where('clientId', '==', userId),
                    where('status', '==', 'completed')
                );

                const bookingsSnap = await getDocs(bookingsQuery);

                // Group by category (fetch from tasks)
                const categoryData: Record<string, { spending: number; count: number }> = {};
                let totalSpending = 0;

                await Promise.all(
                    bookingsSnap.docs.map(async (bookingDoc) => {
                        const bookingData = bookingDoc.data();
                        const amount = bookingData.amount || 0;
                        totalSpending += amount;

                        // Fetch task to get category
                        if (bookingData.taskId) {
                            try {
                                const taskQuery = query(
                                    collection(db, 'tasks'),
                                    where('__name__', '==', bookingData.taskId)
                                );
                                const taskSnap = await getDocs(taskQuery);

                                if (!taskSnap.empty) {
                                    const taskData = taskSnap.docs[0].data();
                                    const category = taskData.category || 'Autre';

                                    if (!categoryData[category]) {
                                        categoryData[category] = { spending: 0, count: 0 };
                                    }

                                    categoryData[category].spending += amount;
                                    categoryData[category].count += 1;
                                }
                            } catch (error) {
                                console.warn('Could not fetch task category:', error);
                            }
                        }
                    })
                );

                // Convert to array and calculate percentages
                const categorySpending: CategorySpending[] = Object.entries(categoryData)
                    .map(([category, data]) => ({
                        category,
                        spending: data.spending,
                        taskCount: data.count,
                        percentage: totalSpending > 0 ? (data.spending / totalSpending) * 100 : 0
                    }))
                    .sort((a, b) => b.spending - a.spending); // Sort by spending desc

                setState({
                    data: categorySpending,
                    loading: false,
                    error: null
                });
            } catch (error) {
                console.error('Error fetching tasks by category:', error);
                setState({
                    data: null,
                    loading: false,
                    error: error as Error
                });
            }
        };

        fetchTasksByCategory();
    }, [userId]);

    return state;
}

// ========================================
// TASK COMPLETION STATS HOOK
// ========================================

export function useTaskCompletion(
    userId: string | undefined
): HookState<TaskCompletionStats> {
    const [state, setState] = useState<HookState<TaskCompletionStats>>({
        data: null,
        loading: true,
        error: null
    });

    useEffect(() => {
        if (!userId) {
            setState({ data: null, loading: false, error: null });
            return;
        }

        const fetchTaskCompletion = async () => {
            setState(prev => ({ ...prev, loading: true, error: null }));

            try {
                // Fetch all tasks created by user
                const tasksQuery = query(
                    collection(db, 'tasks'),
                    where('userId', '==', userId)
                );

                const tasksSnap = await getDocs(tasksQuery);

                let totalTasks = 0;
                let activeTasks = 0;
                let completedTasks = 0;
                let cancelledTasks = 0;
                let totalDuration = 0;
                let durationCount = 0;

                tasksSnap.docs.forEach(doc => {
                    const data = doc.data();
                    totalTasks++;

                    const status = data.status || 'open';

                    if (status === 'open' || status === 'in_progress') {
                        activeTasks++;
                    } else if (status === 'completed') {
                        completedTasks++;

                        // Calculate duration if both dates exist
                        if (data.createdAt && data.completedAt) {
                            const created = data.createdAt.toDate?.() || new Date(data.createdAt);
                            const completed = data.completedAt.toDate?.() || new Date(data.completedAt);
                            const duration = (completed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
                            totalDuration += duration;
                            durationCount++;
                        }
                    } else if (status === 'cancelled') {
                        cancelledTasks++;
                    }
                });

                const completionRate = totalTasks > 0
                    ? (completedTasks / totalTasks) * 100
                    : 0;

                const averageTaskDuration = durationCount > 0
                    ? totalDuration / durationCount
                    : 0;

                setState({
                    data: {
                        totalTasks,
                        activeTasks,
                        completedTasks,
                        cancelledTasks,
                        completionRate,
                        averageTaskDuration
                    },
                    loading: false,
                    error: null
                });
            } catch (error) {
                console.error('Error fetching task completion:', error);
                setState({
                    data: null,
                    loading: false,
                    error: error as Error
                });
            }
        };

        fetchTaskCompletion();
    }, [userId]);

    return state;
}
