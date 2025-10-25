/**
 * Firestore Analytics - Agrégation de données pour les dashboards
 */

import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { db } from './firebase';

export interface MonthlyRevenue {
    mois: string;
    revenus: number;
}

export interface MonthlyMissions {
    mois: string;
    missions: number;
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
