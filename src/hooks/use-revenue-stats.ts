/**
 * Custom React hook for fetching provider revenue statistics
 * 
 * Phase 9: Option B - Graphiques de revenus providers
 * 
 * Hooks disponibles:
 * - useRevenueByMonth: Revenus mensuels sur les 6 derniers mois
 * - useRevenueByCategory: Revenus par catégorie de service
 * - useRevenueTimeline: Timeline complète des transactions
 */

import { useState, useEffect, useMemo } from 'react';
import {
    collection,
    query,
    where,
    getDocs,
    orderBy,
    Timestamp,
    Query,
    DocumentData
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useLiveData } from './use-live-updates';

// ========================================
// TYPES
// ========================================

export interface MonthlyRevenue {
    month: string; // Format: "Nov 2024"
    monthKey: string; // Format: "2024-11" pour tri
    earnings: number;
    bookings: number;
    averagePerBooking: number;
}

export interface CategoryRevenue {
    category: string;
    earnings: number;
    bookings: number;
    percentage: number;
}

export interface RevenueTransaction {
    id: string;
    date: Date;
    amount: number;
    type: 'earning' | 'payout' | 'pending';
    taskTitle?: string;
    status: string;
}

interface HookState<T> {
    data: T | null;
    loading: boolean;
    error: Error | null;
    lastUpdate?: Date | null;
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
// REVENUE BY MONTH HOOK
// ========================================

export function useRevenueByMonth(
    userId: string | undefined,
    monthsBack: number = 6
): HookState<MonthlyRevenue[]> {
    // Build Firestore query
    const bookingsQuery = useMemo(() => {
        if (!userId) return null;

        const startDate = getMonthsAgo(monthsBack);

        return query(
            collection(db, 'bookings'),
            where('providerId', '==', userId),
            where('status', '==', 'completed'),
            where('completedAt', '>=', Timestamp.fromDate(startDate)),
            orderBy('completedAt', 'asc')
        );
    }, [userId, monthsBack]);

    // Transform function to process snapshot data
    const transform = useMemo(() => {
        return (snapshot: any) => {
            // Group by month
            const monthlyData: Record<string, { earnings: number; count: number }> = {};

            snapshot.docs.forEach((doc: any) => {
                const data = doc.data();
                const completedAt = data.completedAt?.toDate?.() || new Date();
                const monthKey = getMonthKey(completedAt);
                const amount = data.amount || 0;

                if (!monthlyData[monthKey]) {
                    monthlyData[monthKey] = { earnings: 0, count: 0 };
                }

                monthlyData[monthKey].earnings += amount;
                monthlyData[monthKey].count += 1;
            });

            // Convert to array and fill missing months
            const monthlyRevenue: MonthlyRevenue[] = [];
            for (let i = monthsBack - 1; i >= 0; i--) {
                const date = getMonthsAgo(i);
                const monthKey = getMonthKey(date);
                const data = monthlyData[monthKey] || { earnings: 0, count: 0 };

                monthlyRevenue.push({
                    month: formatMonth(date),
                    monthKey,
                    earnings: data.earnings,
                    bookings: data.count,
                    averagePerBooking: data.count > 0 ? data.earnings / data.count : 0
                });
            }

            return monthlyRevenue;
        };
    }, [monthsBack]);

    // Use live data hook with real-time updates
    const liveState = useLiveData(bookingsQuery, transform, {
        throttleMs: 300,
        enabled: !!userId
    });

    return {
        data: liveState.data,
        loading: liveState.loading,
        error: liveState.error,
        lastUpdate: liveState.lastUpdate
    };
}

// ========================================
// REVENUE BY CATEGORY HOOK
// ========================================

export function useRevenueByCategory(
    userId: string | undefined
): HookState<CategoryRevenue[]> {
    const [state, setState] = useState<HookState<CategoryRevenue[]>>({
        data: null,
        loading: true,
        error: null
    });

    useEffect(() => {
        if (!userId) {
            setState({ data: null, loading: false, error: null });
            return;
        }

        const fetchRevenueByCategory = async () => {
            setState(prev => ({ ...prev, loading: true, error: null }));

            try {
                // Fetch completed bookings
                const bookingsQuery = query(
                    collection(db, 'bookings'),
                    where('providerId', '==', userId),
                    where('status', '==', 'completed')
                );

                const bookingsSnap = await getDocs(bookingsQuery);

                // Group by category (fetch from tasks)
                const categoryData: Record<string, { earnings: number; count: number }> = {};
                let totalEarnings = 0;

                await Promise.all(
                    bookingsSnap.docs.map(async (bookingDoc) => {
                        const bookingData = bookingDoc.data();
                        const amount = bookingData.amount || 0;
                        totalEarnings += amount;

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
                                        categoryData[category] = { earnings: 0, count: 0 };
                                    }

                                    categoryData[category].earnings += amount;
                                    categoryData[category].count += 1;
                                }
                            } catch (error) {
                                console.warn('Could not fetch task category:', error);
                            }
                        }
                    })
                );

                // Convert to array and calculate percentages
                const categoryRevenue: CategoryRevenue[] = Object.entries(categoryData)
                    .map(([category, data]) => ({
                        category,
                        earnings: data.earnings,
                        bookings: data.count,
                        percentage: totalEarnings > 0 ? (data.earnings / totalEarnings) * 100 : 0
                    }))
                    .sort((a, b) => b.earnings - a.earnings); // Sort by earnings desc

                setState({
                    data: categoryRevenue,
                    loading: false,
                    error: null
                });
            } catch (error) {
                console.error('Error fetching revenue by category:', error);
                setState({
                    data: null,
                    loading: false,
                    error: error as Error
                });
            }
        };

        fetchRevenueByCategory();
    }, [userId]);

    return state;
}

// ========================================
// REVENUE TIMELINE HOOK
// ========================================

export function useRevenueTimeline(
    userId: string | undefined,
    limit: number = 50
): HookState<RevenueTransaction[]> {
    const [state, setState] = useState<HookState<RevenueTransaction[]>>({
        data: null,
        loading: true,
        error: null
    });

    useEffect(() => {
        if (!userId) {
            setState({ data: null, loading: false, error: null });
            return;
        }

        const fetchRevenueTimeline = async () => {
            setState(prev => ({ ...prev, loading: true, error: null }));

            try {
                // Fetch all transactions (bookings + payouts)
                const transactions: RevenueTransaction[] = [];

                // 1. Fetch completed bookings (earnings)
                const bookingsQuery = query(
                    collection(db, 'bookings'),
                    where('providerId', '==', userId),
                    where('status', 'in', ['completed', 'in_progress']),
                    orderBy('createdAt', 'desc')
                );

                const bookingsSnap = await getDocs(bookingsQuery);

                await Promise.all(
                    bookingsSnap.docs.slice(0, limit).map(async (doc) => {
                        const data = doc.data();
                        let taskTitle = 'Mission';

                        // Fetch task title
                        if (data.taskId) {
                            try {
                                const taskQuery = query(
                                    collection(db, 'tasks'),
                                    where('__name__', '==', data.taskId)
                                );
                                const taskSnap = await getDocs(taskQuery);
                                if (!taskSnap.empty) {
                                    taskTitle = taskSnap.docs[0].data().title || 'Mission';
                                }
                            } catch (error) {
                                console.warn('Could not fetch task:', error);
                            }
                        }

                        transactions.push({
                            id: doc.id,
                            date: data.completedAt?.toDate?.() || data.createdAt?.toDate?.() || new Date(),
                            amount: data.amount || 0,
                            type: data.status === 'completed' ? 'earning' : 'pending',
                            taskTitle,
                            status: data.status
                        });
                    })
                );

                // 2. Fetch payouts
                const payoutsQuery = query(
                    collection(db, 'payouts'),
                    where('providerId', '==', userId),
                    orderBy('createdAt', 'desc')
                );

                const payoutsSnap = await getDocs(payoutsQuery);

                payoutsSnap.docs.forEach(doc => {
                    const data = doc.data();
                    transactions.push({
                        id: doc.id,
                        date: data.createdAt?.toDate?.() || new Date(),
                        amount: data.amount || 0,
                        type: 'payout',
                        status: data.status
                    });
                });

                // Sort by date desc
                transactions.sort((a, b) => b.date.getTime() - a.date.getTime());

                setState({
                    data: transactions.slice(0, limit),
                    loading: false,
                    error: null
                });
            } catch (error) {
                console.error('Error fetching revenue timeline:', error);
                setState({
                    data: null,
                    loading: false,
                    error: error as Error
                });
            }
        };

        fetchRevenueTimeline();
    }, [userId, limit]);

    return state;
}
