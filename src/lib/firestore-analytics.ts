/**
 * Firestore Analytics - Agrégation de données pour les dashboards
 */

import { collection, query, where, getDocs, orderBy, Timestamp, limit } from 'firebase/firestore';
import { db } from './firebase';

export interface MonthlyRevenue {
    mois: string;
    revenus: number;
}

export interface MonthlyMissions {
    mois: string;
    missions: number;
}

export interface ClientStats {
    totalSpent: number;
    totalBookings: number;
    completedBookings: number;
    cancelledBookings: number;
    tasksPosted: number;
    successRate: number; // percentage
    avgTaskBudget: number;
    thisMonthSpent: number;
    lastMonthSpent: number;
}

export interface AdminStats {
    gmv: number; // Gross Merchandise Value
    totalCommissions: number;
    totalBookings: number;
    completedBookings: number;
    totalUsers: number;
    totalProviders: number;
    totalClients: number;
    monthlyGrowth: {
        users: number;
        bookings: number;
        revenue: number;
    };
    retentionRate: number; // percentage
    avgBookingValue: number;
}

export interface CategoryDistribution {
    category: string;
    count: number;
    totalAmount: number;
    spending: number; // Alias de totalAmount pour compatibilité UI
    percentage: number; // Pourcentage du total
}

export interface MonthlyGrowth {
    month: string;
    users: number;
    bookings: number;
    revenue: number;
}

/**
 * Calcule les revenus mensuels d'un professionnel
 * @param providerId - ID du professionnel
 * @param monthsBack - Nombre de mois à récupérer (par défaut 6)
 * @returns Tableau des revenus mensuels
 */
export async function getMonthlyRevenue(
    providerId: string,
    monthsBack: number = 6
): Promise<MonthlyRevenue[]> {
    try {
        // Calculer la date de début (il y a X mois)
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - monthsBack);
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);

        // Requête pour récupérer les bookings complétés
        const bookingsRef = collection(db, 'bookings');
        const q = query(
            bookingsRef,
            where('providerId', '==', providerId),
            where('status', '==', 'completed'),
            where('completedAt', '>=', Timestamp.fromDate(startDate)),
            orderBy('completedAt', 'desc')
        );

        const snapshot = await getDocs(q);

        // Agréger par mois
        const monthlyData: { [key: string]: number } = {};
        const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

        snapshot.docs.forEach(doc => {
            const data = doc.data();
            const completedAt = data.completedAt?.toDate();
            if (!completedAt) return;

            const monthKey = `${completedAt.getFullYear()}-${completedAt.getMonth()}`;
            const monthLabel = monthNames[completedAt.getMonth()];

            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = 0;
            }

            // Ajouter le montant (price ou amount selon structure)
            const amount = data.price || data.amount || 0;
            monthlyData[monthKey] += amount;
        });

        // Créer le tableau des 6 derniers mois (même si vides)
        const result: MonthlyRevenue[] = [];
        const currentDate = new Date();

        for (let i = monthsBack - 1; i >= 0; i--) {
            const targetDate = new Date();
            targetDate.setMonth(currentDate.getMonth() - i);
            const monthIndex = targetDate.getMonth();
            const year = targetDate.getFullYear();
            const monthKey = `${year}-${monthIndex}`;
            const monthLabel = monthNames[monthIndex];

            result.push({
                mois: monthLabel,
                revenus: Math.round(monthlyData[monthKey] || 0)
            });
        }

        return result;
    } catch (error) {
        console.error('Error fetching monthly revenue:', error);
        return [];
    }
}

/**
 * Calcule le nombre de missions mensuelles d'un professionnel
 * @param providerId - ID du professionnel
 * @param monthsBack - Nombre de mois à récupérer (par défaut 6)
 * @returns Tableau des missions mensuelles
 */
export async function getMonthlyMissions(
    providerId: string,
    monthsBack: number = 6
): Promise<MonthlyMissions[]> {
    try {
        // Calculer la date de début
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - monthsBack);
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);

        // Requête pour récupérer toutes les missions (bookings)
        const bookingsRef = collection(db, 'bookings');
        const q = query(
            bookingsRef,
            where('providerId', '==', providerId),
            where('createdAt', '>=', Timestamp.fromDate(startDate)),
            orderBy('createdAt', 'desc')
        );

        const snapshot = await getDocs(q);

        // Agréger par mois
        const monthlyData: { [key: string]: number } = {};
        const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

        snapshot.docs.forEach(doc => {
            const data = doc.data();
            const createdAt = data.createdAt?.toDate();
            if (!createdAt) return;

            const monthKey = `${createdAt.getFullYear()}-${createdAt.getMonth()}`;

            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = 0;
            }

            monthlyData[monthKey] += 1;
        });

        // Créer le tableau des 6 derniers mois
        const result: MonthlyMissions[] = [];
        const currentDate = new Date();

        for (let i = monthsBack - 1; i >= 0; i--) {
            const targetDate = new Date();
            targetDate.setMonth(currentDate.getMonth() - i);
            const monthIndex = targetDate.getMonth();
            const year = targetDate.getFullYear();
            const monthKey = `${year}-${monthIndex}`;
            const monthLabel = monthNames[monthIndex];

            result.push({
                mois: monthLabel,
                missions: monthlyData[monthKey] || 0
            });
        }

        return result;
    } catch (error) {
        console.error('Error fetching monthly missions:', error);
        return [];
    }
}

/**
 * Calcule les stats réelles d'un professionnel depuis Firestore
 * @param providerId - ID du professionnel
 * @returns Stats agrégées
 */
export async function getProviderStats(providerId: string) {
    try {
        const bookingsRef = collection(db, 'bookings');

        // Toutes les missions
        const allQuery = query(bookingsRef, where('providerId', '==', providerId));
        const allSnapshot = await getDocs(allQuery);

        // Missions complétées
        const completedQuery = query(
            bookingsRef,
            where('providerId', '==', providerId),
            where('status', '==', 'completed')
        );
        const completedSnapshot = await getDocs(completedQuery);

        // Missions annulées
        const cancelledQuery = query(
            bookingsRef,
            where('providerId', '==', providerId),
            where('status', '==', 'cancelled')
        );
        const cancelledSnapshot = await getDocs(cancelledQuery);

        // Revenus total et mensuel
        let totalRevenue = 0;
        let thisMonthRevenue = 0;
        let lastMonthRevenue = 0;

        const now = new Date();
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

        completedSnapshot.docs.forEach(doc => {
            const data = doc.data();
            const amount = data.price || data.amount || 0;
            const completedAt = data.completedAt?.toDate();

            totalRevenue += amount;

            if (completedAt && completedAt >= thisMonthStart) {
                thisMonthRevenue += amount;
            } else if (completedAt && completedAt >= lastMonthStart && completedAt <= lastMonthEnd) {
                lastMonthRevenue += amount;
            }
        });

        return {
            totalJobs: allSnapshot.size,
            completedJobs: completedSnapshot.size,
            cancelledJobs: cancelledSnapshot.size,
            revenue: {
                total: Math.round(totalRevenue),
                thisMonth: Math.round(thisMonthRevenue),
                lastMonth: Math.round(lastMonthRevenue)
            }
        };
    } catch (error) {
        console.error('Error fetching provider stats:', error);
        return null;
    }
}

/**
 * Calcule les stats réelles d'un client depuis Firestore
 * @param clientId - ID du client
 * @returns Stats agrégées
 */
export async function getClientStats(clientId: string): Promise<ClientStats | null> {
    try {
        const bookingsRef = collection(db, 'bookings');
        const tasksRef = collection(db, 'tasks');

        // Toutes les réservations du client
        const allBookingsQuery = query(bookingsRef, where('clientId', '==', clientId));
        const allBookingsSnapshot = await getDocs(allBookingsQuery);

        // Réservations complétées
        const completedQuery = query(
            bookingsRef,
            where('clientId', '==', clientId),
            where('status', '==', 'completed')
        );
        const completedSnapshot = await getDocs(completedQuery);

        // Réservations annulées
        const cancelledQuery = query(
            bookingsRef,
            where('clientId', '==', clientId),
            where('status', '==', 'cancelled')
        );
        const cancelledSnapshot = await getDocs(cancelledQuery);

        // Tâches postées
        const tasksQuery = query(tasksRef, where('clientId', '==', clientId));
        const tasksSnapshot = await getDocs(tasksQuery);

        // Calcul des montants
        let totalSpent = 0;
        let thisMonthSpent = 0;
        let lastMonthSpent = 0;
        let totalBudget = 0;

        const now = new Date();
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

        completedSnapshot.docs.forEach(doc => {
            const data = doc.data();
            const amount = data.price || data.amount || 0;
            const completedAt = data.completedAt?.toDate();

            totalSpent += amount;

            if (completedAt && completedAt >= thisMonthStart) {
                thisMonthSpent += amount;
            } else if (completedAt && completedAt >= lastMonthStart && completedAt <= lastMonthEnd) {
                lastMonthSpent += amount;
            }
        });

        // Calcul budget moyen des tâches
        tasksSnapshot.docs.forEach(doc => {
            const data = doc.data();
            totalBudget += data.budget || 0;
        });

        const avgTaskBudget = tasksSnapshot.size > 0 ? totalBudget / tasksSnapshot.size : 0;
        const successRate = allBookingsSnapshot.size > 0
            ? (completedSnapshot.size / allBookingsSnapshot.size) * 100
            : 0;

        return {
            totalSpent: Math.round(totalSpent),
            totalBookings: allBookingsSnapshot.size,
            completedBookings: completedSnapshot.size,
            cancelledBookings: cancelledSnapshot.size,
            tasksPosted: tasksSnapshot.size,
            successRate: Math.round(successRate * 10) / 10,
            avgTaskBudget: Math.round(avgTaskBudget),
            thisMonthSpent: Math.round(thisMonthSpent),
            lastMonthSpent: Math.round(lastMonthSpent)
        };
    } catch (error) {
        console.error('Error fetching client stats:', error);
        return null;
    }
}

/**
 * Calcule les dépenses mensuelles d'un client
 * @param clientId - ID du client
 * @param monthsBack - Nombre de mois à récupérer
 * @returns Tableau des dépenses mensuelles
 */
export async function getClientMonthlySpending(
    clientId: string,
    monthsBack: number = 6
): Promise<MonthlyRevenue[]> {
    try {
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - monthsBack);
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);

        const bookingsRef = collection(db, 'bookings');
        const q = query(
            bookingsRef,
            where('clientId', '==', clientId),
            where('status', '==', 'completed'),
            where('completedAt', '>=', Timestamp.fromDate(startDate)),
            orderBy('completedAt', 'desc')
        );

        const snapshot = await getDocs(q);

        // Agréger par mois
        const monthlyData: { [key: string]: number } = {};
        const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

        snapshot.docs.forEach(doc => {
            const data = doc.data();
            const completedAt = data.completedAt?.toDate();
            if (!completedAt) return;

            const monthKey = `${completedAt.getFullYear()}-${completedAt.getMonth()}`;

            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = 0;
            }

            const amount = data.price || data.amount || 0;
            monthlyData[monthKey] += amount;
        });

        // Créer le tableau des 6 derniers mois
        const result: MonthlyRevenue[] = [];
        const currentDate = new Date();

        for (let i = monthsBack - 1; i >= 0; i--) {
            const targetDate = new Date();
            targetDate.setMonth(currentDate.getMonth() - i);
            const monthIndex = targetDate.getMonth();
            const year = targetDate.getFullYear();
            const monthKey = `${year}-${monthIndex}`;
            const monthLabel = monthNames[monthIndex];

            result.push({
                mois: monthLabel,
                revenus: Math.round(monthlyData[monthKey] || 0)
            });
        }

        return result;
    } catch (error) {
        console.error('Error fetching client monthly spending:', error);
        return [];
    }
}

/**
 * Distribution des tâches par catégorie pour un client
 * @param clientId - ID du client
 * @returns Distribution des catégories
 */
export async function getClientCategoryDistribution(
    clientId: string
): Promise<CategoryDistribution[]> {
    try {
        const tasksRef = collection(db, 'tasks');
        const q = query(tasksRef, where('clientId', '==', clientId));
        const snapshot = await getDocs(q);

        const distribution: { [key: string]: { count: number; totalAmount: number } } = {};

        snapshot.docs.forEach(doc => {
            const data = doc.data();
            const category = data.category || 'Non catégorisé';
            const budget = data.budget || 0;

            if (!distribution[category]) {
                distribution[category] = { count: 0, totalAmount: 0 };
            }

            distribution[category].count += 1;
            distribution[category].totalAmount += budget;
        });

        // Calculer le total pour les pourcentages
        const total = Object.values(distribution).reduce((sum, cat) => sum + cat.totalAmount, 0);

        return Object.entries(distribution).map(([category, data]) => ({
            category,
            count: data.count,
            totalAmount: Math.round(data.totalAmount),
            spending: Math.round(data.totalAmount), // Alias pour compatibilité UI
            percentage: total > 0 ? (data.totalAmount / total) * 100 : 0
        }));
    } catch (error) {
        console.error('Error fetching category distribution:', error);
        return [];
    }
}

/**
 * Calcule les stats admin globales de la plateforme
 * @returns Stats agrégées admin
 */
export async function getAdminStats(): Promise<AdminStats | null> {
    try {
        const bookingsRef = collection(db, 'bookings');
        const usersRef = collection(db, 'users');
        const transactionsRef = collection(db, 'transactions');

        // Toutes les réservations
        const allBookingsSnapshot = await getDocs(bookingsRef);

        // Réservations complétées
        const completedQuery = query(bookingsRef, where('status', '==', 'completed'));
        const completedSnapshot = await getDocs(completedQuery);

        // Tous les utilisateurs
        const allUsersSnapshot = await getDocs(usersRef);

        // Calcul GMV et commissions
        let gmv = 0;
        let totalCommissions = 0;

        completedSnapshot.docs.forEach(doc => {
            const data = doc.data();
            const amount = data.price || data.amount || 0;
            const commission = data.commission || (amount * 0.15); // 15% par défaut

            gmv += amount;
            totalCommissions += commission;
        });

        // Calcul du nombre de providers et clients
        let totalProviders = 0;
        let totalClients = 0;

        allUsersSnapshot.docs.forEach(doc => {
            const data = doc.data();
            const accountType = data.profile?.accountType;

            if (accountType === 'professional' || accountType === 'provider') {
                totalProviders += 1;
            }
            if (accountType === 'individual' || accountType === 'client') {
                totalClients += 1;
            }
        });

        // Calcul de la croissance mensuelle (dernier mois vs mois précédent)
        const now = new Date();
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

        // Users this month
        const thisMonthUsersQuery = query(
            usersRef,
            where('createdAt', '>=', Timestamp.fromDate(thisMonthStart))
        );
        const thisMonthUsersSnapshot = await getDocs(thisMonthUsersQuery);

        // Users last month
        const lastMonthUsersQuery = query(
            usersRef,
            where('createdAt', '>=', Timestamp.fromDate(lastMonthStart)),
            where('createdAt', '<=', Timestamp.fromDate(lastMonthEnd))
        );
        const lastMonthUsersSnapshot = await getDocs(lastMonthUsersQuery);

        const userGrowth = lastMonthUsersSnapshot.size > 0
            ? ((thisMonthUsersSnapshot.size - lastMonthUsersSnapshot.size) / lastMonthUsersSnapshot.size) * 100
            : 0;

        // Bookings this month
        const thisMonthBookingsQuery = query(
            bookingsRef,
            where('createdAt', '>=', Timestamp.fromDate(thisMonthStart))
        );
        const thisMonthBookingsSnapshot = await getDocs(thisMonthBookingsQuery);

        // Bookings last month
        const lastMonthBookingsQuery = query(
            bookingsRef,
            where('createdAt', '>=', Timestamp.fromDate(lastMonthStart)),
            where('createdAt', '<=', Timestamp.fromDate(lastMonthEnd))
        );
        const lastMonthBookingsSnapshot = await getDocs(lastMonthBookingsQuery);

        const bookingGrowth = lastMonthBookingsSnapshot.size > 0
            ? ((thisMonthBookingsSnapshot.size - lastMonthBookingsSnapshot.size) / lastMonthBookingsSnapshot.size) * 100
            : 0;

        // Revenue growth
        let thisMonthRevenue = 0;
        let lastMonthRevenue = 0;

        completedSnapshot.docs.forEach(doc => {
            const data = doc.data();
            const amount = data.price || data.amount || 0;
            const completedAt = data.completedAt?.toDate();

            if (completedAt && completedAt >= thisMonthStart) {
                thisMonthRevenue += amount;
            } else if (completedAt && completedAt >= lastMonthStart && completedAt <= lastMonthEnd) {
                lastMonthRevenue += amount;
            }
        });

        const revenueGrowth = lastMonthRevenue > 0
            ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
            : 0;

        // Taux de rétention (clients avec 2+ bookings complétés)
        const clientBookingsCount = new Map<string, number>();
        completedSnapshot.docs.forEach(doc => {
            const data = doc.data();
            const clientId = data.clientId;
            clientBookingsCount.set(clientId, (clientBookingsCount.get(clientId) || 0) + 1);
        });

        const repeatClients = Array.from(clientBookingsCount.values()).filter(count => count >= 2).length;
        const retentionRate = clientBookingsCount.size > 0
            ? (repeatClients / clientBookingsCount.size) * 100
            : 0;

        // Valeur moyenne des bookings
        const avgBookingValue = completedSnapshot.size > 0 ? gmv / completedSnapshot.size : 0;

        return {
            gmv: Math.round(gmv),
            totalCommissions: Math.round(totalCommissions),
            totalBookings: allBookingsSnapshot.size,
            completedBookings: completedSnapshot.size,
            totalUsers: allUsersSnapshot.size,
            totalProviders,
            totalClients,
            monthlyGrowth: {
                users: Math.round(userGrowth * 10) / 10,
                bookings: Math.round(bookingGrowth * 10) / 10,
                revenue: Math.round(revenueGrowth * 10) / 10
            },
            retentionRate: Math.round(retentionRate * 10) / 10,
            avgBookingValue: Math.round(avgBookingValue)
        };
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        return null;
    }
}

/**
 * Calcule la croissance mensuelle sur les derniers mois
 * @param monthsBack - Nombre de mois à récupérer
 * @returns Tableau de croissance mensuelle
 */
export async function getMonthlyGrowth(monthsBack: number = 12): Promise<MonthlyGrowth[]> {
    try {
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - monthsBack);
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);

        const bookingsRef = collection(db, 'bookings');
        const usersRef = collection(db, 'users');

        // Récupérer tous les bookings de la période
        const bookingsQuery = query(
            bookingsRef,
            where('createdAt', '>=', Timestamp.fromDate(startDate)),
            orderBy('createdAt', 'asc')
        );
        const bookingsSnapshot = await getDocs(bookingsQuery);

        // Récupérer tous les users de la période
        const usersQuery = query(
            usersRef,
            where('createdAt', '>=', Timestamp.fromDate(startDate)),
            orderBy('createdAt', 'asc')
        );
        const usersSnapshot = await getDocs(usersQuery);

        // Agréger par mois
        const monthlyData: { [key: string]: { users: number; bookings: number; revenue: number } } = {};
        const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

        // Agréger les bookings
        bookingsSnapshot.docs.forEach(doc => {
            const data = doc.data();
            const createdAt = data.createdAt?.toDate();
            if (!createdAt) return;

            const monthKey = `${createdAt.getFullYear()}-${createdAt.getMonth()}`;

            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = { users: 0, bookings: 0, revenue: 0 };
            }

            monthlyData[monthKey].bookings += 1;

            if (data.status === 'completed') {
                const amount = data.price || data.amount || 0;
                monthlyData[monthKey].revenue += amount;
            }
        });

        // Agréger les users
        usersSnapshot.docs.forEach(doc => {
            const data = doc.data();
            const createdAt = data.createdAt?.toDate();
            if (!createdAt) return;

            const monthKey = `${createdAt.getFullYear()}-${createdAt.getMonth()}`;

            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = { users: 0, bookings: 0, revenue: 0 };
            }

            monthlyData[monthKey].users += 1;
        });

        // Créer le tableau des derniers mois
        const result: MonthlyGrowth[] = [];
        const currentDate = new Date();

        for (let i = monthsBack - 1; i >= 0; i--) {
            const targetDate = new Date();
            targetDate.setMonth(currentDate.getMonth() - i);
            const monthIndex = targetDate.getMonth();
            const year = targetDate.getFullYear();
            const monthKey = `${year}-${monthIndex}`;
            const monthLabel = `${monthNames[monthIndex]} ${year}`;

            const data = monthlyData[monthKey] || { users: 0, bookings: 0, revenue: 0 };

            result.push({
                month: monthLabel,
                users: data.users,
                bookings: data.bookings,
                revenue: Math.round(data.revenue)
            });
        }

        return result;
    } catch (error) {
        console.error('Error fetching monthly growth:', error);
        return [];
    }
}
