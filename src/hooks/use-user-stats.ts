'use client';

import { useEffect, useState } from 'react';
import { Task } from '@/lib/firestore-tasks';

export interface UserStats {
    totalTasks: number;
    openTasks: number;
    assignedTasks: number;
    inProgressTasks: number;
    completedTasks: number;
    cancelledTasks: number;
    totalBudget: number;
    averageBudget: number;
}

/**
 * Hook to calculate user statistics from tasks
 * @param tasks - Array of tasks
 * @returns User statistics object
 */
export function useUserStats(tasks: Task[]): UserStats {
    const [stats, setStats] = useState<UserStats>({
        totalTasks: 0,
        openTasks: 0,
        assignedTasks: 0,
        inProgressTasks: 0,
        completedTasks: 0,
        cancelledTasks: 0,
        totalBudget: 0,
        averageBudget: 0,
    });

    useEffect(() => {
        if (!tasks || tasks.length === 0) {
            setStats({
                totalTasks: 0,
                openTasks: 0,
                assignedTasks: 0,
                inProgressTasks: 0,
                completedTasks: 0,
                cancelledTasks: 0,
                totalBudget: 0,
                averageBudget: 0,
            });
            return;
        }

        const totalTasks = tasks.length;
        const openTasks = tasks.filter((t) => t.status === 'open').length;
        const assignedTasks = tasks.filter((t) => t.status === 'assigned').length;
        const inProgressTasks = tasks.filter((t) => t.status === 'in-progress').length;
        const completedTasks = tasks.filter((t) => t.status === 'completed').length;
        const cancelledTasks = tasks.filter((t) => t.status === 'cancelled').length;

        const totalBudget = tasks.reduce((sum, task) => sum + task.budget, 0);
        const averageBudget = totalTasks > 0 ? totalBudget / totalTasks : 0;

        setStats({
            totalTasks,
            openTasks,
            assignedTasks,
            inProgressTasks,
            completedTasks,
            cancelledTasks,
            totalBudget,
            averageBudget,
        });
    }, [tasks]);

    return stats;
}
