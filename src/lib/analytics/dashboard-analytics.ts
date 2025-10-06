/**
 * Dashboard Analytics & Statistics
 * Provides revenue tracking, activity analytics, and performance metrics
 */

import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Task } from '@/lib/firestore-tasks';

// Types
export interface RevenueData {
    date: string;
    amount: number;
    count: number;
}

export interface TaskStatistics {
    total: number;
    byCategory: Record<string, number>;
    byStatus: Record<string, number>;
    averageBudget: number;
    totalBudget: number;
}

export interface ProviderEarnings {
    total: number;
    completed: number;
    pending: number;
    byMonth: RevenueData[];
}

export interface ClientSpending {
    total: number;
    completed: number;
    pending: number;
    byMonth: RevenueData[];
}

export interface ActivityMetrics {
    tasksCreated: number;
    proposalsReceived: number;
    bookingsCompleted: number;
    averageResponseTime: number; // in hours
    completionRate: number; // percentage
}

/**
 * Get revenue data over time
 */
export async function getRevenueOverTime(
    userId: string,
    role: 'client' | 'provider',
    startDate: Date,
    endDate: Date
): Promise<RevenueData[]> {
    try {
        const bookingsRef = collection(db, 'bookings');
        const field = role === 'provider' ? 'providerId' : 'clientId';

        const q = query(
            bookingsRef,
            where(field, '==', userId),
            where('status', '==', 'completed'),
            where('completedAt', '>=', Timestamp.fromDate(startDate)),
            where('completedAt', '<=', Timestamp.fromDate(endDate)),
            orderBy('completedAt', 'asc')
        );

        const snapshot = await getDocs(q);

        // Group by date
        const revenueByDate = new Map<string, { amount: number; count: number }>();

        snapshot.docs.forEach(doc => {
            const data = doc.data();
            const date = data.completedAt?.toDate().toISOString().split('T')[0] || '';

            if (!revenueByDate.has(date)) {
                revenueByDate.set(date, { amount: 0, count: 0 });
            }

            const current = revenueByDate.get(date)!;
            current.amount += data.amount || 0;
            current.count += 1;
        });

        // Convert to array and sort
        return Array.from(revenueByDate.entries())
            .map(([date, data]) => ({
                date,
                amount: data.amount,
                count: data.count,
            }))
            .sort((a, b) => a.date.localeCompare(b.date));
    } catch (error) {
        console.error('Error getting revenue over time:', error);
        return [];
    }
}

/**
 * Get task statistics for a client
 */
export async function getClientTaskStatistics(clientId: string): Promise<TaskStatistics> {
    try {
        const tasksRef = collection(db, 'tasks');
        const q = query(
            tasksRef,
            where('clientId', '==', clientId),
            orderBy('createdAt', 'desc')
        );

        const snapshot = await getDocs(q);
        const tasks = snapshot.docs.map(doc => doc.data() as Task);

        const byCategory: Record<string, number> = {};
        const byStatus: Record<string, number> = {};
        let totalBudget = 0;

        tasks.forEach(task => {
            // Count by category
            byCategory[task.category] = (byCategory[task.category] || 0) + 1;

            // Count by status
            byStatus[task.status] = (byStatus[task.status] || 0) + 1;

            // Sum budget
            totalBudget += task.budget || 0;
        });

        return {
            total: tasks.length,
            byCategory,
            byStatus,
            averageBudget: tasks.length > 0 ? totalBudget / tasks.length : 0,
            totalBudget,
        };
    } catch (error) {
        console.error('Error getting task statistics:', error);
        return {
            total: 0,
            byCategory: {},
            byStatus: {},
            averageBudget: 0,
            totalBudget: 0,
        };
    }
}

/**
 * Get provider earnings summary
 */
export async function getProviderEarnings(providerId: string): Promise<ProviderEarnings> {
    try {
        const bookingsRef = collection(db, 'bookings');
        const q = query(
            bookingsRef,
            where('providerId', '==', providerId),
            orderBy('createdAt', 'desc')
        );

        const snapshot = await getDocs(q);
        const bookings = snapshot.docs.map(doc => doc.data());

        let completed = 0;
        let pending = 0;
        const monthlyData = new Map<string, { amount: number; count: number }>();

        bookings.forEach(booking => {
            const amount = booking.amount || 0;

            if (booking.status === 'completed') {
                completed += amount;

                // Add to monthly data
                const date = booking.completedAt?.toDate();
                if (date) {
                    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                    if (!monthlyData.has(month)) {
                        monthlyData.set(month, { amount: 0, count: 0 });
                    }
                    const current = monthlyData.get(month)!;
                    current.amount += amount;
                    current.count += 1;
                }
            } else if (booking.status === 'confirmed' || booking.status === 'in_progress') {
                pending += amount;
            }
        });

        const byMonth = Array.from(monthlyData.entries())
            .map(([date, data]) => ({
                date,
                amount: data.amount,
                count: data.count,
            }))
            .sort((a, b) => a.date.localeCompare(b.date));

        return {
            total: completed + pending,
            completed,
            pending,
            byMonth,
        };
    } catch (error) {
        console.error('Error getting provider earnings:', error);
        return {
            total: 0,
            completed: 0,
            pending: 0,
            byMonth: [],
        };
    }
}

/**
 * Get client spending summary
 */
export async function getClientSpending(clientId: string): Promise<ClientSpending> {
    try {
        const bookingsRef = collection(db, 'bookings');
        const q = query(
            bookingsRef,
            where('clientId', '==', clientId),
            orderBy('createdAt', 'desc')
        );

        const snapshot = await getDocs(q);
        const bookings = snapshot.docs.map(doc => doc.data());

        let completed = 0;
        let pending = 0;
        const monthlyData = new Map<string, { amount: number; count: number }>();

        bookings.forEach(booking => {
            const amount = booking.amount || 0;

            if (booking.status === 'completed') {
                completed += amount;

                // Add to monthly data
                const date = booking.completedAt?.toDate();
                if (date) {
                    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                    if (!monthlyData.has(month)) {
                        monthlyData.set(month, { amount: 0, count: 0 });
                    }
                    const current = monthlyData.get(month)!;
                    current.amount += amount;
                    current.count += 1;
                }
            } else if (booking.status === 'confirmed' || booking.status === 'in_progress') {
                pending += amount;
            }
        });

        const byMonth = Array.from(monthlyData.entries())
            .map(([date, data]) => ({
                date,
                amount: data.amount,
                count: data.count,
            }))
            .sort((a, b) => a.date.localeCompare(b.date));

        return {
            total: completed + pending,
            completed,
            pending,
            byMonth,
        };
    } catch (error) {
        console.error('Error getting client spending:', error);
        return {
            total: 0,
            completed: 0,
            pending: 0,
            byMonth: [],
        };
    }
}

/**
 * Get activity metrics for a user
 */
export async function getActivityMetrics(
    userId: string,
    role: 'client' | 'provider'
): Promise<ActivityMetrics> {
    try {
        const metrics: ActivityMetrics = {
            tasksCreated: 0,
            proposalsReceived: 0,
            bookingsCompleted: 0,
            averageResponseTime: 0,
            completionRate: 0,
        };

        if (role === 'client') {
            // Get tasks created
            const tasksRef = collection(db, 'tasks');
            const tasksQuery = query(tasksRef, where('clientId', '==', userId));
            const tasksSnapshot = await getDocs(tasksQuery);
            metrics.tasksCreated = tasksSnapshot.size;

            // Get proposals received
            const proposalsRef = collection(db, 'proposals');
            const proposalsQuery = query(proposalsRef, where('clientId', '==', userId));
            const proposalsSnapshot = await getDocs(proposalsQuery);
            metrics.proposalsReceived = proposalsSnapshot.size;

            // Calculate average response time
            let totalResponseTime = 0;
            let responseCount = 0;

            proposalsSnapshot.docs.forEach(doc => {
                const proposal = doc.data();
                const task = tasksSnapshot.docs.find(t => t.id === proposal.taskId);
                if (task) {
                    const taskData = task.data();
                    const taskCreated = taskData.createdAt?.toDate();
                    const proposalCreated = proposal.createdAt?.toDate();

                    if (taskCreated && proposalCreated) {
                        const diffHours = (proposalCreated.getTime() - taskCreated.getTime()) / (1000 * 60 * 60);
                        totalResponseTime += diffHours;
                        responseCount++;
                    }
                }
            });

            metrics.averageResponseTime = responseCount > 0 ? totalResponseTime / responseCount : 0;
        }

        // Get completed bookings
        const bookingsRef = collection(db, 'bookings');
        const field = role === 'provider' ? 'providerId' : 'clientId';
        const bookingsQuery = query(
            bookingsRef,
            where(field, '==', userId),
            where('status', '==', 'completed')
        );
        const bookingsSnapshot = await getDocs(bookingsQuery);
        metrics.bookingsCompleted = bookingsSnapshot.size;

        // Calculate completion rate
        if (role === 'provider') {
            const allBookingsQuery = query(bookingsRef, where(field, '==', userId));
            const allBookingsSnapshot = await getDocs(allBookingsQuery);
            metrics.completionRate = allBookingsSnapshot.size > 0
                ? (bookingsSnapshot.size / allBookingsSnapshot.size) * 100
                : 0;
        } else {
            const tasksRef = collection(db, 'tasks');
            const allTasksQuery = query(tasksRef, where('clientId', '==', userId));
            const allTasksSnapshot = await getDocs(allTasksQuery);
            const completedTasks = allTasksSnapshot.docs.filter(doc => doc.data().status === 'completed').length;
            metrics.completionRate = allTasksSnapshot.size > 0
                ? (completedTasks / allTasksSnapshot.size) * 100
                : 0;
        }

        return metrics;
    } catch (error) {
        console.error('Error getting activity metrics:', error);
        return {
            tasksCreated: 0,
            proposalsReceived: 0,
            bookingsCompleted: 0,
            averageResponseTime: 0,
            completionRate: 0,
        };
    }
}

/**
 * Export data to CSV format
 */
export function exportToCSV(data: any[], filename: string): void {
    if (data.length === 0) return;

    // Get headers from first object
    const headers = Object.keys(data[0]);

    // Create CSV content
    const csvContent = [
        headers.join(','),
        ...data.map(row =>
            headers.map(header => {
                const value = row[header];
                // Escape quotes and wrap in quotes if contains comma
                if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                return value;
            }).join(',')
        )
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
