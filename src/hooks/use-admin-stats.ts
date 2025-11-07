/**
 * Custom React hooks for admin dashboard statistics
 * 
 * Phase 9: Option D - Dashboard Admin
 * 
 * Hooks disponibles:
 * - useGMVByMonth: Gross Merchandise Value par mois (volume total transactions)
 * - usePlatformRevenue: Revenus de la plateforme (commissions)
 * - useUserGrowth: Croissance des utilisateurs (clients + providers)
 * - useTasksByCategory: Répartition des missions par catégorie
 * - useActiveUsersStats: Statistiques utilisateurs actifs
 */

import { useState, useEffect } from 'react';
import {
    collection,
    query,
    where,
    getDocs,
    orderBy,
    Timestamp,
    getCountFromServer
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// ========================================
// TYPES
// ========================================

export interface MonthlyGMV {
    month: string; // "Nov 2024"
    monthKey: string; // "2024-11"
    gmv: number; // Gross Merchandise Value
    transactions: number; // Nombre de transactions
    averageTransaction: number; // GMV / transactions
}

export interface PlatformRevenue {
    month: string;
    monthKey: string;
    revenue: number; // Commission (15-20% du GMV)
    gmv: number;
    commissionRate: number; // Taux moyen de commission
}

export interface UserGrowth {
    month: string;
    monthKey: string;
    newClients: number;
    newProviders: number;
    totalUsers: number; // Cumulatif
}

export interface CategoryStats {
    category: string;
    tasks: number; // Nombre de missions
    completed: number; // Missions complétées
    gmv: number; // Volume total
    averagePrice: number;
}

export interface ActiveUsersStats {
    totalUsers: number;
    activeClients: number; // Avec au moins 1 booking
    activeProviders: number; // Avec au moins 1 booking
    totalTasks: number;
    completedTasks: number;
    activeTasks: number; // open ou in_progress
}

interface HookState<T> {
    data: T | null;
    loading: boolean;
    error: Error | null;
}

// ========================================
// HELPER FUNCTIONS
// ========================================

function formatMonth(date: Date): string {
    return date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
}

function getMonthKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
}

function getMonthsAgo(months: number): Date {
    const date = new Date();
    date.setMonth(date.getMonth() - months);
    date.setDate(1);
    date.setHours(0, 0, 0, 0);
    return date;
}

// ========================================
// GMV BY MONTH HOOK
// ========================================

export function useGMVByMonth(
    monthsBack: number = 6
): HookState<MonthlyGMV[]> {
    const [state, setState] = useState<HookState<MonthlyGMV[]>>({
        data: null,
        loading: true,
        error: null
    });

    useEffect(() => {
        const fetchGMVByMonth = async () => {
            setState(prev => ({ ...prev, loading: true, error: null }));

            try {
                const startDate = getMonthsAgo(monthsBack);

                // Fetch completed bookings (GMV = total des transactions)
                const bookingsQuery = query(
                    collection(db, 'bookings'),
                    where('status', '==', 'completed'),
                    where('completedAt', '>=', Timestamp.fromDate(startDate)),
                    orderBy('completedAt', 'asc')
                );

                const bookingsSnap = await getDocs(bookingsQuery);

                // Group by month
                const monthlyData: Record<string, { gmv: number; count: number }> = {};

                bookingsSnap.docs.forEach(doc => {
                    const data = doc.data();
                    const completedAt = data.completedAt?.toDate?.() || new Date();
                    const monthKey = getMonthKey(completedAt);
                    const amount = data.amount || 0;

                    if (!monthlyData[monthKey]) {
                        monthlyData[monthKey] = { gmv: 0, count: 0 };
                    }

                    monthlyData[monthKey].gmv += amount;
                    monthlyData[monthKey].count += 1;
                });

                // Convert to array and fill missing months
                const monthlyGMV: MonthlyGMV[] = [];
                for (let i = monthsBack - 1; i >= 0; i--) {
                    const date = getMonthsAgo(i);
                    const monthKey = getMonthKey(date);
                    const data = monthlyData[monthKey] || { gmv: 0, count: 0 };

                    monthlyGMV.push({
                        month: formatMonth(date),
                        monthKey,
                        gmv: data.gmv,
                        transactions: data.count,
                        averageTransaction: data.count > 0 ? data.gmv / data.count : 0
                    });
                }

                setState({
                    data: monthlyGMV,
                    loading: false,
                    error: null
                });
            } catch (error) {
                console.error('Error fetching GMV by month:', error);
                setState({
                    data: null,
                    loading: false,
                    error: error as Error
                });
            }
        };

        fetchGMVByMonth();
    }, [monthsBack]);

    return state;
}

// ========================================
// PLATFORM REVENUE HOOK
// ========================================

export function usePlatformRevenue(
    monthsBack: number = 6,
    commissionRate: number = 0.15 // 15% default
): HookState<PlatformRevenue[]> {
    const [state, setState] = useState<HookState<PlatformRevenue[]>>({
        data: null,
        loading: true,
        error: null
    });

    useEffect(() => {
        const fetchPlatformRevenue = async () => {
            setState(prev => ({ ...prev, loading: true, error: null }));

            try {
                const startDate = getMonthsAgo(monthsBack);

                // Fetch completed bookings
                const bookingsQuery = query(
                    collection(db, 'bookings'),
                    where('status', '==', 'completed'),
                    where('completedAt', '>=', Timestamp.fromDate(startDate)),
                    orderBy('completedAt', 'asc')
                );

                const bookingsSnap = await getDocs(bookingsQuery);

                // Group by month
                const monthlyData: Record<string, { gmv: number; count: number }> = {};

                bookingsSnap.docs.forEach(doc => {
                    const data = doc.data();
                    const completedAt = data.completedAt?.toDate?.() || new Date();
                    const monthKey = getMonthKey(completedAt);
                    const amount = data.amount || 0;

                    if (!monthlyData[monthKey]) {
                        monthlyData[monthKey] = { gmv: 0, count: 0 };
                    }

                    monthlyData[monthKey].gmv += amount;
                    monthlyData[monthKey].count += 1;
                });

                // Convert to array with platform revenue
                const platformRevenue: PlatformRevenue[] = [];
                for (let i = monthsBack - 1; i >= 0; i--) {
                    const date = getMonthsAgo(i);
                    const monthKey = getMonthKey(date);
                    const data = monthlyData[monthKey] || { gmv: 0, count: 0 };

                    platformRevenue.push({
                        month: formatMonth(date),
                        monthKey,
                        revenue: data.gmv * commissionRate,
                        gmv: data.gmv,
                        commissionRate: commissionRate
                    });
                }

                setState({
                    data: platformRevenue,
                    loading: false,
                    error: null
                });
            } catch (error) {
                console.error('Error fetching platform revenue:', error);
                setState({
                    data: null,
                    loading: false,
                    error: error as Error
                });
            }
        };

        fetchPlatformRevenue();
    }, [monthsBack, commissionRate]);

    return state;
}

// ========================================
// USER GROWTH HOOK
// ========================================

export function useUserGrowth(
    monthsBack: number = 6
): HookState<UserGrowth[]> {
    const [state, setState] = useState<HookState<UserGrowth[]>>({
        data: null,
        loading: true,
        error: null
    });

    useEffect(() => {
        const fetchUserGrowth = async () => {
            setState(prev => ({ ...prev, loading: true, error: null }));

            try {
                const startDate = getMonthsAgo(monthsBack);

                // Fetch users created since startDate
                const usersQuery = query(
                    collection(db, 'users'),
                    where('createdAt', '>=', Timestamp.fromDate(startDate)),
                    orderBy('createdAt', 'asc')
                );

                const usersSnap = await getDocs(usersQuery);

                // Group by month and account type
                const monthlyData: Record<string, { clients: number; providers: number }> = {};

                usersSnap.docs.forEach(doc => {
                    const data = doc.data();
                    const createdAt = data.createdAt?.toDate?.() || new Date();
                    const monthKey = getMonthKey(createdAt);
                    const accountType = data.accountType;

                    if (!monthlyData[monthKey]) {
                        monthlyData[monthKey] = { clients: 0, providers: 0 };
                    }

                    if (accountType === 'client' || accountType === 'both') {
                        monthlyData[monthKey].clients += 1;
                    }
                    if (accountType === 'provider' || accountType === 'both') {
                        monthlyData[monthKey].providers += 1;
                    }
                });

                // Convert to array with cumulative total
                const userGrowth: UserGrowth[] = [];
                let cumulativeTotal = 0;

                for (let i = monthsBack - 1; i >= 0; i--) {
                    const date = getMonthsAgo(i);
                    const monthKey = getMonthKey(date);
                    const data = monthlyData[monthKey] || { clients: 0, providers: 0 };

                    cumulativeTotal += data.clients + data.providers;

                    userGrowth.push({
                        month: formatMonth(date),
                        monthKey,
                        newClients: data.clients,
                        newProviders: data.providers,
                        totalUsers: cumulativeTotal
                    });
                }

                setState({
                    data: userGrowth,
                    loading: false,
                    error: null
                });
            } catch (error) {
                console.error('Error fetching user growth:', error);
                setState({
                    data: null,
                    loading: false,
                    error: error as Error
                });
            }
        };

        fetchUserGrowth();
    }, [monthsBack]);

    return state;
}

// ========================================
// TASKS BY CATEGORY HOOK
// ========================================

export function useTasksByCategory(): HookState<CategoryStats[]> {
    const [state, setState] = useState<HookState<CategoryStats[]>>({
        data: null,
        loading: true,
        error: null
    });

    useEffect(() => {
        const fetchTasksByCategory = async () => {
            setState(prev => ({ ...prev, loading: true, error: null }));

            try {
                // Fetch all tasks
                const tasksQuery = query(collection(db, 'tasks'));
                const tasksSnap = await getDocs(tasksQuery);

                // Group by category
                const categoryData: Record<string, {
                    tasks: number;
                    completed: number;
                    totalBudget: number;
                }> = {};

                await Promise.all(
                    tasksSnap.docs.map(async (taskDoc) => {
                        const taskData = taskDoc.data();
                        const category = taskData.category || 'Autre';
                        const budget = taskData.budget || 0;

                        if (!categoryData[category]) {
                            categoryData[category] = { tasks: 0, completed: 0, totalBudget: 0 };
                        }

                        categoryData[category].tasks += 1;
                        categoryData[category].totalBudget += budget;

                        // Check if task has completed booking
                        const bookingsQuery = query(
                            collection(db, 'bookings'),
                            where('taskId', '==', taskDoc.id),
                            where('status', '==', 'completed')
                        );

                        const bookingsSnap = await getDocs(bookingsQuery);
                        if (!bookingsSnap.empty) {
                            categoryData[category].completed += 1;
                        }
                    })
                );

                // Convert to array
                const categoryStats: CategoryStats[] = Object.entries(categoryData)
                    .map(([category, data]) => ({
                        category,
                        tasks: data.tasks,
                        completed: data.completed,
                        gmv: data.totalBudget,
                        averagePrice: data.tasks > 0 ? data.totalBudget / data.tasks : 0
                    }))
                    .sort((a, b) => b.tasks - a.tasks); // Sort by task count desc

                setState({
                    data: categoryStats,
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
    }, []);

    return state;
}

// ========================================
// ACTIVE USERS STATS HOOK
// ========================================

export function useActiveUsersStats(): HookState<ActiveUsersStats> {
    const [state, setState] = useState<HookState<ActiveUsersStats>>({
        data: null,
        loading: true,
        error: null
    });

    useEffect(() => {
        const fetchActiveUsersStats = async () => {
            setState(prev => ({ ...prev, loading: true, error: null }));

            try {
                // Count total users
                const usersQuery = query(collection(db, 'users'));
                const usersCount = await getCountFromServer(usersQuery);

                // Count active clients (with at least 1 booking)
                const clientBookingsQuery = query(
                    collection(db, 'bookings'),
                    where('status', '!=', 'cancelled')
                );
                const clientBookingsSnap = await getDocs(clientBookingsQuery);
                const uniqueClients = new Set(
                    clientBookingsSnap.docs.map(doc => doc.data().clientId)
                );

                // Count active providers (with at least 1 booking)
                const uniqueProviders = new Set(
                    clientBookingsSnap.docs.map(doc => doc.data().providerId)
                );

                // Count tasks
                const tasksQuery = query(collection(db, 'tasks'));
                const tasksSnap = await getDocs(tasksQuery);

                const completedTasks = tasksSnap.docs.filter(
                    doc => doc.data().status === 'completed'
                ).length;

                const activeTasks = tasksSnap.docs.filter(
                    doc => ['open', 'in_progress'].includes(doc.data().status || '')
                ).length;

                setState({
                    data: {
                        totalUsers: usersCount.data().count,
                        activeClients: uniqueClients.size,
                        activeProviders: uniqueProviders.size,
                        totalTasks: tasksSnap.size,
                        completedTasks,
                        activeTasks
                    },
                    loading: false,
                    error: null
                });
            } catch (error) {
                console.error('Error fetching active users stats:', error);
                setState({
                    data: null,
                    loading: false,
                    error: error as Error
                });
            }
        };

        fetchActiveUsersStats();
    }, []);

    return state;
}
