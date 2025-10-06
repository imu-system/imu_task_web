'use client';

import { useEffect, useState } from 'react';
import { getUserTasks, Task } from '@/lib/firestore-tasks';

/**
 * Hook to fetch and manage user tasks
 * @param userId - The ID of the user
 * @returns Object with tasks, loading state, and error
 */
export function useUserTasks(userId: string | null) {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!userId) {
            setTasks([]);
            setLoading(false);
            return;
        }

        const fetchTasks = async () => {
            try {
                setLoading(true);
                setError(null);
                const userTasks = await getUserTasks(userId);
                setTasks(userTasks);
            } catch (err) {
                console.error('Error fetching user tasks:', err);
                setError(err instanceof Error ? err.message : 'Failed to load tasks');
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    }, [userId]);

    return { tasks, loading, error, refetch: () => getUserTasks(userId!) };
}
