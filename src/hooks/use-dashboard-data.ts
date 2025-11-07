/**
 * Custom React hooks for fetching dashboard data from Firestore
 * 
 * Phase 9: Tableaux de Bord & Analytics - Connexion données réelles
 * 
 * Hooks disponibles:
 * - useProviderStats: Statistiques provider (revenus, missions, reviews)
 * - useClientStats: Statistiques client (tâches, dépenses, providers favoris)
 * - useUpcomingBookings: Prochains bookings (client ou provider)
 * - useRecentNotifications: Notifications récentes
 */

import { useState, useEffect } from 'react';
import {
    collection,
    query,
    where,
    getDocs,
    orderBy,
    limit as firestoreLimit,
    Timestamp,
    doc,
    getDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Booking } from '@/lib/types';
import { Notification } from '@/lib/types/notifications';

// ========================================
// HELPERS
// ========================================

/**
 * Helper: Convert Firestore Date/String/Timestamp to Date object
 */
function formatFirestoreDate(date: Date | string | Timestamp | undefined): Date {
    if (!date) return new Date();
    if (date instanceof Date) return date;
    if (typeof date === 'string') return new Date(date);
    if ('toDate' in date && typeof date.toDate === 'function') return date.toDate();
    return new Date();
}

// ========================================
// TYPES
// ========================================

export interface ProviderStats {
    totalEarnings: number;
    pendingEarnings: number;
    availableBalance: number;
    activeBookings: number;
    completedBookings: number;
    averageRating: number;
    reviewCount: number;
    responseRate: number;
    completionRate: number;
}

export interface ClientStats {
    activeTasks: number;
    completedTasks: number;
    totalSpent: number;
    pendingProposals: number;
    favoriteProviders: number;
}

export interface DashboardBooking extends Booking {
    taskTitle?: string;
    clientName?: string;
    providerName?: string;
    taskLocation?: string | { address: string; lat: number; lng: number };
}

interface HookState<T> {
    data: T | null;
    loading: boolean;
    error: Error | null;
}

// ========================================
// PROVIDER STATS HOOK
// ========================================

export function useProviderStats(userId: string | undefined): HookState<ProviderStats> {
    const [state, setState] = useState<HookState<ProviderStats>>({
        data: null,
        loading: true,
        error: null
    });

    useEffect(() => {
        if (!userId) {
            setState({ data: null, loading: false, error: null });
            return;
        }

        const fetchProviderStats = async () => {
            setState(prev => ({ ...prev, loading: true, error: null }));

            try {
                // 1. Fetch wallet balance
                const walletRef = doc(db, 'wallets', userId);
                const walletSnap = await getDoc(walletRef);
                const walletData = walletSnap.exists() ? walletSnap.data() : null;

                const availableBalance = walletData?.balance || 0;
                const pendingEarnings = walletData?.pendingBalance || 0;

                // 2. Fetch bookings stats
                const bookingsQuery = query(
                    collection(db, 'bookings'),
                    where('providerId', '==', userId)
                );
                const bookingsSnap = await getDocs(bookingsQuery);

                const activeBookings = bookingsSnap.docs.filter(
                    doc => ['pending', 'accepted', 'in_progress'].includes(doc.data().status)
                ).length;

                const completedBookings = bookingsSnap.docs.filter(
                    doc => doc.data().status === 'completed'
                ).length;

                // 3. Fetch reviews stats
                const reviewsQuery = query(
                    collection(db, 'reviews'),
                    where('reviewedUserId', '==', userId)
                );
                const reviewsSnap = await getDocs(reviewsQuery);

                const reviews = reviewsSnap.docs.map(doc => doc.data());
                const reviewCount = reviews.length;
                const averageRating = reviewCount > 0
                    ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviewCount
                    : 0;

                // 4. Calculate total earnings (from completed transactions)
                const transactionsQuery = query(
                    collection(db, 'transactions'),
                    where('providerId', '==', userId),
                    where('status', '==', 'completed')
                );
                const transactionsSnap = await getDocs(transactionsQuery);

                const totalEarnings = transactionsSnap.docs.reduce(
                    (sum, doc) => sum + (doc.data().providerAmount || 0),
                    0
                );

                // 5. Calculate response rate (proposals accepted / total proposals)
                const proposalsQuery = query(
                    collection(db, 'proposals'),
                    where('providerId', '==', userId)
                );
                const proposalsSnap = await getDocs(proposalsQuery);
                const totalProposals = proposalsSnap.size;
                const acceptedProposals = proposalsSnap.docs.filter(
                    doc => doc.data().status === 'accepted'
                ).length;
                const responseRate = totalProposals > 0
                    ? (acceptedProposals / totalProposals) * 100
                    : 0;

                // 6. Calculate completion rate
                const totalAssignedBookings = activeBookings + completedBookings;
                const completionRate = totalAssignedBookings > 0
                    ? (completedBookings / totalAssignedBookings) * 100
                    : 0;

                setState({
                    data: {
                        totalEarnings,
                        pendingEarnings,
                        availableBalance,
                        activeBookings,
                        completedBookings,
                        averageRating: Math.round(averageRating * 10) / 10,
                        reviewCount,
                        responseRate: Math.round(responseRate),
                        completionRate: Math.round(completionRate)
                    },
                    loading: false,
                    error: null
                });
            } catch (error) {
                console.error('Error fetching provider stats:', error);
                setState({
                    data: null,
                    loading: false,
                    error: error as Error
                });
            }
        };

        fetchProviderStats();
    }, [userId]);

    return state;
}

// ========================================
// CLIENT STATS HOOK
// ========================================

export function useClientStats(userId: string | undefined): HookState<ClientStats> {
    const [state, setState] = useState<HookState<ClientStats>>({
        data: null,
        loading: true,
        error: null
    });

    useEffect(() => {
        if (!userId) {
            setState({ data: null, loading: false, error: null });
            return;
        }

        const fetchClientStats = async () => {
            setState(prev => ({ ...prev, loading: true, error: null }));

            try {
                // 1. Fetch tasks
                const tasksQuery = query(
                    collection(db, 'tasks'),
                    where('userId', '==', userId)
                );
                const tasksSnap = await getDocs(tasksQuery);

                const activeTasks = tasksSnap.docs.filter(
                    doc => ['open', 'in_progress'].includes(doc.data().status)
                ).length;

                const completedTasks = tasksSnap.docs.filter(
                    doc => doc.data().status === 'completed'
                ).length;

                // 2. Calculate total spent (from completed bookings)
                const bookingsQuery = query(
                    collection(db, 'bookings'),
                    where('clientId', '==', userId),
                    where('status', '==', 'completed')
                );
                const bookingsSnap = await getDocs(bookingsQuery);

                const totalSpent = bookingsSnap.docs.reduce(
                    (sum, doc) => sum + (doc.data().amount || 0),
                    0
                );

                // 3. Fetch pending proposals count
                const proposalsQuery = query(
                    collection(db, 'proposals'),
                    where('clientId', '==', userId),
                    where('status', '==', 'pending')
                );
                const proposalsSnap = await getDocs(proposalsQuery);
                const pendingProposals = proposalsSnap.size;

                // 4. Count favorite providers (from user profile or favorites collection)
                let favoriteProviders = 0;
                try {
                    const userRef = doc(db, 'users', userId);
                    const userSnap = await getDoc(userRef);
                    if (userSnap.exists()) {
                        const userData = userSnap.data();
                        favoriteProviders = userData?.favoriteProviders?.length || 0;
                    }
                } catch (error) {
                    console.warn('Could not fetch favorite providers:', error);
                }

                setState({
                    data: {
                        activeTasks,
                        completedTasks,
                        totalSpent,
                        pendingProposals,
                        favoriteProviders
                    },
                    loading: false,
                    error: null
                });
            } catch (error) {
                console.error('Error fetching client stats:', error);
                setState({
                    data: null,
                    loading: false,
                    error: error as Error
                });
            }
        };

        fetchClientStats();
    }, [userId]);

    return state;
}

// ========================================
// UPCOMING BOOKINGS HOOK
// ========================================

export function useUpcomingBookings(
    userId: string | undefined,
    role: 'client' | 'provider' = 'client',
    limit: number = 5
): HookState<DashboardBooking[]> {
    const [state, setState] = useState<HookState<DashboardBooking[]>>({
        data: null,
        loading: true,
        error: null
    });

    useEffect(() => {
        if (!userId) {
            setState({ data: null, loading: false, error: null });
            return;
        }

        const fetchUpcomingBookings = async () => {
            setState(prev => ({ ...prev, loading: true, error: null }));

            try {
                const userIdField = role === 'client' ? 'clientId' : 'providerId';

                // Fetch upcoming bookings (accepted or in_progress, future scheduled date)
                const bookingsQuery = query(
                    collection(db, 'bookings'),
                    where(userIdField, '==', userId),
                    where('status', 'in', ['accepted', 'in_progress']),
                    orderBy('scheduledDate', 'asc'),
                    firestoreLimit(limit)
                );

                const bookingsSnap = await getDocs(bookingsQuery);

                // Enrich bookings with task and user names
                const enrichedBookings = await Promise.all(
                    bookingsSnap.docs.map(async (bookingDoc) => {
                        const bookingData = bookingDoc.data() as Booking;
                        let taskTitle = 'Task';
                        let clientName = '';
                        let providerName = '';
                        let taskLocation: string | { address: string; lat: number; lng: number } | undefined;

                        // Fetch task title and location
                        if (bookingData.taskId) {
                            try {
                                const taskRef = doc(db, 'tasks', bookingData.taskId);
                                const taskSnap = await getDoc(taskRef);
                                if (taskSnap.exists()) {
                                    const taskData = taskSnap.data();
                                    taskTitle = taskData?.title || 'Task';
                                    taskLocation = taskData?.location;
                                }
                            } catch (error) {
                                console.warn('Could not fetch task:', error);
                            }
                        }

                        // Fetch client name
                        if (bookingData.clientId) {
                            try {
                                const clientRef = doc(db, 'users', bookingData.clientId);
                                const clientSnap = await getDoc(clientRef);
                                if (clientSnap.exists()) {
                                    const clientData = clientSnap.data();
                                    clientName = clientData?.profile?.displayName || clientData?.email || 'Client';
                                }
                            } catch (error) {
                                console.warn('Could not fetch client:', error);
                            }
                        }

                        // Fetch provider name
                        if (bookingData.providerId) {
                            try {
                                const providerRef = doc(db, 'users', bookingData.providerId);
                                const providerSnap = await getDoc(providerRef);
                                if (providerSnap.exists()) {
                                    const providerData = providerSnap.data();
                                    providerName = providerData?.profile?.displayName || providerData?.email || 'Provider';
                                }
                            } catch (error) {
                                console.warn('Could not fetch provider:', error);
                            }
                        }

                        return {
                            ...bookingData,
                            id: bookingDoc.id,
                            taskTitle,
                            clientName,
                            providerName,
                            taskLocation
                        } as DashboardBooking;
                    })
                );

                setState({
                    data: enrichedBookings,
                    loading: false,
                    error: null
                });
            } catch (error) {
                console.error('Error fetching upcoming bookings:', error);
                setState({
                    data: null,
                    loading: false,
                    error: error as Error
                });
            }
        };

        fetchUpcomingBookings();
    }, [userId, role, limit]);

    return state;
}

// ========================================
// RECENT NOTIFICATIONS HOOK
// ========================================

export function useRecentNotifications(
    userId: string | undefined,
    limit: number = 5
): HookState<Notification[]> & { markAsRead: (notificationId: string) => Promise<void> } {
    const [state, setState] = useState<HookState<Notification[]>>({
        data: null,
        loading: true,
        error: null
    });

    useEffect(() => {
        if (!userId) {
            setState({ data: null, loading: false, error: null });
            return;
        }

        const fetchRecentNotifications = async () => {
            setState(prev => ({ ...prev, loading: true, error: null }));

            try {
                const notificationsQuery = query(
                    collection(db, 'notifications'),
                    where('userId', '==', userId),
                    orderBy('createdAt', 'desc'),
                    firestoreLimit(limit)
                );

                const notificationsSnap = await getDocs(notificationsQuery);

                const notifications = notificationsSnap.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Notification[];

                setState({
                    data: notifications,
                    loading: false,
                    error: null
                });
            } catch (error) {
                console.error('Error fetching recent notifications:', error);
                setState({
                    data: null,
                    loading: false,
                    error: error as Error
                });
            }
        };

        fetchRecentNotifications();
    }, [userId, limit]);

    // Mark notification as read function
    const markAsRead = async (notificationId: string) => {
        if (!userId) return;

        try {
            const notificationRef = doc(db, 'notifications', notificationId);
            await getDoc(notificationRef); // Just a placeholder - implement actual update logic

            // Update local state
            setState(prev => ({
                ...prev,
                data: prev.data?.map(notif =>
                    notif.id === notificationId
                        ? { ...notif, read: true }
                        : notif
                ) || null
            }));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    return { ...state, markAsRead };
}
