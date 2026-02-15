import {
    collection,
    addDoc,
    getDocs,
    getDoc,
    doc,
    query,
    where,
    updateDoc,
    deleteDoc,
    orderBy,
    Timestamp,
    DocumentData,
} from 'firebase/firestore';
import { db } from './firebase';
import { notifyNewTask, notifyTaskCompleted } from './firestore-notifications';
import { getUserById, getProvidersBySkill, getProvidersByMultipleSkills } from './firestore-users';
import { getRelatedSkills } from './skill-mapping';
import { getTopMatches, shouldNotifyProvider, formatMatchReasons } from './task-matching';
import { getBulkProviderPreferences } from './firestore-provider-preferences';
import { TaskSpecificFields } from './types/task-specific-fields';

// Types
export interface TaskLocation {
    address: string;
    city?: string;
    country?: string;
    coordinates?: {
        latitude: number;
        longitude: number;
    };
}

export interface Task {
    adresse?: any;
    id?: string;
    title: string;
    description: string;
    category: string;
    location: string | TaskLocation;
    budget: number;
    status: 'open' | 'assigned' | 'in-progress' | 'completed' | 'cancelled';
    clientId: string;
    providerId?: string | null;
    images?: string[];
    deadline?: Date | null;
    createdAt: Date;
    updatedAt: Date;
    specificFields?: TaskSpecificFields; // Champs spécifiques selon la catégorie
}

export interface CreateTaskData {
    title: string;
    description: string;
    category: string;
    location: string;
    budget: number;
    deadline?: Date | null;
    specificFields?: TaskSpecificFields; // Champs spécifiques selon la catégorie
}

/**
 * Create a new task in Firestore
 * @param userId - The ID of the user creating the task (client)
 * @param taskData - The task data
 * @returns The ID of the created task
 */
export async function createTask(
    userId: string,
    taskData: CreateTaskData
): Promise<string> {
    try {
        const tasksRef = collection(db, 'tasks');

        const newTask = {
            title: taskData.title,
            description: taskData.description,
            category: taskData.category,
            location: taskData.location,
            budget: taskData.budget,
            status: 'open' as const,
            clientId: userId,
            providerId: null,
            images: [],
            deadline: taskData.deadline ? Timestamp.fromDate(taskData.deadline) : null,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            ...(taskData.specificFields && { specificFields: taskData.specificFields }),
        };

        const docRef = await addDoc(tasksRef, newTask);

        console.log('✅ Task created successfully with ID:', docRef.id);

        // 🎯 SMART MATCHING: Notify relevant providers with intelligent matching
        try {
            // Get related skills to expand search (e.g., "Plumbing" -> ["Plumbing", "Plumber", "Pipe Repair"])
            const relatedSkills = getRelatedSkills(taskData.category);

            console.log(`🔍 Searching providers with skills: ${relatedSkills.join(', ')}`);

            // Get providers matching any of the related skills
            const candidateProviders = await getProvidersByMultipleSkills(relatedSkills, {
                onlyAvailable: true,   // Only notify available providers
                maxResults: 100        // Get more candidates for scoring
            });

            if (candidateProviders.length > 0) {
                console.log(`📊 Found ${candidateProviders.length} candidate providers`);

                // Get provider preferences for smart matching
                const providerIds = candidateProviders.map(p => p.id);
                const preferences = await getBulkProviderPreferences(providerIds);

                // Convert task data to Task type for matching
                const taskForMatching: Task = {
                    id: docRef.id,
                    title: taskData.title,
                    description: taskData.description,
                    category: taskData.category,
                    location: typeof taskData.location === 'string' ? taskData.location : '',
                    adresse: typeof taskData.location === 'object' ? taskData.location as any : undefined,
                    budget: taskData.budget,
                    status: 'open',
                    clientId: userId,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };

                // Calculate match scores for all candidates
                const matches = getTopMatches(
                    taskForMatching,
                    candidateProviders,
                    preferences,
                    {
                        minScore: 30,  // Only notify providers with score >= 30
                        maxResults: 20 // Limit to top 20 matches
                    }
                );

                console.log(`🎯 Found ${matches.length} relevant matches (score >= 30)`);

                if (matches.length > 0) {
                    // Format task location for notification
                    let taskLocation = 'Location not specified';
                    if (typeof taskData.location === 'string') {
                        taskLocation = taskData.location;
                    } else if (typeof taskData.location === 'object' && taskData.location !== null) {
                        taskLocation = (taskData.location as TaskLocation).address ||
                            (taskData.location as TaskLocation).city ||
                            'Location not specified';
                    }

                    // Send notifications only to providers who should be notified
                    const notificationPromises = matches
                        .filter(match => shouldNotifyProvider(match, preferences[match.providerId]))
                        .map(match => {
                            const matchReason = formatMatchReasons(match);
                            console.log(`  → Notifying ${match.providerId} (score: ${match.score}, ${matchReason})`);

                            return notifyNewTask(
                                match.providerId,
                                docRef.id,
                                taskData.title,
                                taskData.category,
                                taskLocation
                            );
                        });

                    await Promise.all(notificationPromises);

                    console.log(`✅ Notified ${notificationPromises.length} highly-matched providers about new task`);

                    // Log top 3 matches for debugging
                    matches.slice(0, 3).forEach((match, idx) => {
                        console.log(`  #${idx + 1}: Provider ${match.providerId} - Score: ${match.score} - ${formatMatchReasons(match)}`);
                    });
                } else {
                    console.log('ℹ️ No providers met the minimum match score threshold (30)');
                }
            } else {
                console.log('ℹ️ No available providers found with matching skills');
                console.log(`💡 Consider broadening search or adding more providers with "${taskData.category}" skill`);
            }
        } catch (notifError) {
            console.error('⚠️ Failed to send new task notifications:', notifError);
            // Don't throw - notification failure shouldn't block task creation
        }

        return docRef.id;
    } catch (error) {
        console.error('❌ Error creating task:', error);
        throw new Error('Failed to create task. Please try again.');
    }
}

/**
 * Get all tasks created by a specific user (client)
 * @param userId - The ID of the user
 * @returns Array of tasks
 */
export async function getUserTasks(userId: string): Promise<Task[]> {
    try {
        const tasksRef = collection(db, 'tasks');
        const q = query(
            tasksRef,
            where('clientId', '==', userId),
            orderBy('createdAt', 'desc')
        );

        const snapshot = await getDocs(q);

        const tasks: Task[] = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                title: data.title,
                description: data.description,
                category: data.category,
                location: data.location,
                budget: data.budget,
                status: data.status,
                clientId: data.clientId,
                providerId: data.providerId,
                images: data.images || [],
                deadline: data.deadline?.toDate() || null,
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date(),
            };
        });

        console.log(`✅ Retrieved ${tasks.length} tasks for user ${userId}`);
        return tasks;
    } catch (error) {
        console.error('❌ Error fetching user tasks:', error);
        throw new Error('Failed to fetch tasks. Please try again.');
    }
}

/**
 * Get all open tasks (available for providers to bid on)
 * @returns Array of open tasks
 */
export async function getOpenTasks(): Promise<Task[]> {
    try {
        const tasksRef = collection(db, 'tasks');
        const q = query(
            tasksRef,
            where('status', '==', 'open'),
            orderBy('createdAt', 'desc')
        );

        const snapshot = await getDocs(q);

        const tasks: Task[] = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                title: data.title,
                description: data.description,
                category: data.category,
                location: data.location,
                budget: data.budget,
                status: data.status,
                clientId: data.clientId,
                providerId: data.providerId,
                images: data.images || [],
                deadline: data.deadline?.toDate() || null,
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date(),
            };
        });

        console.log(`✅ Retrieved ${tasks.length} open tasks`);
        return tasks;
    } catch (error) {
        console.error('❌ Error fetching open tasks:', error);
        throw new Error('Failed to fetch open tasks. Please try again.');
    }
}

/**
 * Get tasks with filters
 * @param filters - Object with optional filters
 * @returns Array of filtered tasks
 */
export async function getTasksWithFilters(filters?: {
    status?: string | string[];
    category?: string;
    minBudget?: number;
    maxBudget?: number;
}): Promise<Task[]> {
    try {
        const tasksRef = collection(db, 'tasks');
        const constraints: any[] = [];

        // Status filter (can be single or multiple)
        if (filters?.status) {
            if (Array.isArray(filters.status)) {
                // Multiple statuses - we'll filter client-side
                // Firestore doesn't support 'in' with multiple where clauses
            } else {
                constraints.push(where('status', '==', filters.status));
            }
        }

        // Category filter
        if (filters?.category) {
            constraints.push(where('category', '==', filters.category));
        }

        // Budget filters (client-side filtering)
        // Firestore doesn't support multiple range queries

        // Default ordering
        constraints.push(orderBy('createdAt', 'desc'));

        const q = query(tasksRef, ...constraints);
        const snapshot = await getDocs(q);

        let tasks: Task[] = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                title: data.title,
                description: data.description,
                category: data.category,
                location: data.location,
                budget: data.budget,
                status: data.status,
                clientId: data.clientId,
                providerId: data.providerId,
                images: data.images || [],
                deadline: data.deadline?.toDate() || null,
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date(),
            };
        });

        // Client-side filtering for multiple statuses
        if (filters?.status && Array.isArray(filters.status)) {
            tasks = tasks.filter(task => filters.status!.includes(task.status));
        }

        // Client-side budget filtering
        if (filters?.minBudget !== undefined) {
            tasks = tasks.filter(task => task.budget >= filters.minBudget!);
        }
        if (filters?.maxBudget !== undefined) {
            tasks = tasks.filter(task => task.budget <= filters.maxBudget!);
        }

        console.log(`✅ Retrieved ${tasks.length} tasks with filters:`, filters);
        return tasks;
    } catch (error) {
        console.error('❌ Error fetching tasks with filters:', error);
        throw new Error('Failed to fetch tasks. Please try again.');
    }
}

/**
 * Get a single task by ID
 * @param taskId - The ID of the task
 * @returns The task data or null if not found
 */
export async function getTaskById(taskId: string): Promise<Task | null> {
    try {
        const taskRef = doc(db, 'tasks', taskId);
        const taskSnap = await getDoc(taskRef);

        if (!taskSnap.exists()) {
            console.log('❌ Task not found:', taskId);
            return null;
        }

        const data = taskSnap.data();
        const task: Task = {
            id: taskSnap.id,
            title: data.title,
            description: data.description,
            category: data.category,
            location: data.location,
            budget: data.budget,
            status: data.status,
            clientId: data.clientId,
            providerId: data.providerId,
            images: data.images || [],
            deadline: data.deadline?.toDate() || null,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
        };

        console.log('✅ Task retrieved:', taskId);
        return task;
    } catch (error) {
        console.error('❌ Error fetching task:', error);
        throw new Error('Failed to fetch task. Please try again.');
    }
}

/**
 * Update a task
 * @param taskId - The ID of the task to update
 * @param updates - Partial task data to update
 */
export async function updateTask(
    taskId: string,
    updates: Partial<Omit<Task, 'id' | 'clientId' | 'createdAt'>>
): Promise<void> {
    try {
        const taskRef = doc(db, 'tasks', taskId);

        const updateData: DocumentData = {
            ...updates,
            updatedAt: Timestamp.now(),
        };

        // Convert Date to Timestamp if deadline is being updated
        if (updates.deadline) {
            updateData.deadline = Timestamp.fromDate(updates.deadline);
        }

        await updateDoc(taskRef, updateData);

        console.log('✅ Task updated successfully:', taskId);

        // Notify client if task is completed
        if (updates.status === 'completed') {
            try {
                const taskSnap = await getDoc(taskRef);
                if (taskSnap.exists()) {
                    const taskData = taskSnap.data();
                    const clientId = taskData.clientId;
                    const taskTitle = taskData.title;

                    if (clientId && taskTitle) {
                        await notifyTaskCompleted(clientId, taskId, taskTitle);
                        console.log('✅ Notification sent to client for completed task');
                    }
                }
            } catch (notifError) {
                console.error('⚠️ Failed to send task completion notification:', notifError);
                // Don't throw - notification failure shouldn't block task update
            }
        }
    } catch (error) {
        console.error('❌ Error updating task:', error);
        throw new Error('Failed to update task. Please try again.');
    }
}

/**
 * Delete a task
 * @param taskId - The ID of the task to delete
 */
export async function deleteTask(taskId: string): Promise<void> {
    try {
        const taskRef = doc(db, 'tasks', taskId);
        await deleteDoc(taskRef);

        console.log('✅ Task deleted successfully:', taskId);
    } catch (error) {
        console.error('❌ Error deleting task:', error);
        throw new Error('Failed to delete task. Please try again.');
    }
}

/**
 * Get tasks by category
 * @param category - The category to filter by
 * @returns Array of tasks in the category
 */
export async function getTasksByCategory(category: string): Promise<Task[]> {
    try {
        const tasksRef = collection(db, 'tasks');
        const q = query(
            tasksRef,
            where('category', '==', category),
            where('status', '==', 'open'),
            orderBy('createdAt', 'desc')
        );

        const snapshot = await getDocs(q);

        const tasks: Task[] = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                title: data.title,
                description: data.description,
                category: data.category,
                location: data.location,
                budget: data.budget,
                status: data.status,
                clientId: data.clientId,
                providerId: data.providerId,
                images: data.images || [],
                deadline: data.deadline?.toDate() || null,
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date(),
            };
        });

        console.log(`✅ Retrieved ${tasks.length} tasks in category: ${category}`);
        return tasks;
    } catch (error) {
        console.error('❌ Error fetching tasks by category:', error);
        throw new Error('Failed to fetch tasks by category. Please try again.');
    }
}

/**
 * Assign a task to a provider
 * @param taskId - The ID of the task
 * @param providerId - The ID of the provider
 */
export async function assignTask(
    taskId: string,
    providerId: string
): Promise<void> {
    try {
        const taskRef = doc(db, 'tasks', taskId);

        await updateDoc(taskRef, {
            providerId,
            status: 'assigned',
            updatedAt: Timestamp.now(),
        });

        console.log('✅ Task assigned to provider:', providerId);
    } catch (error) {
        console.error('❌ Error assigning task:', error);
        throw new Error('Failed to assign task. Please try again.');
    }
}

/**
 * Update task status with validation
 * @param taskId - The ID of the task
 * @param newStatus - The new status
 * @param userId - The ID of the user making the change
 */
export async function updateTaskStatus(
    taskId: string,
    newStatus: Task['status'],
    userId: string
): Promise<void> {
    try {
        const taskRef = doc(db, 'tasks', taskId);
        const taskSnap = await getDoc(taskRef);

        if (!taskSnap.exists()) {
            throw new Error('Task not found');
        }

        const task = { id: taskSnap.id, ...taskSnap.data() } as Task;

        // Validate user permissions
        if (task.clientId !== userId && task.providerId !== userId) {
            throw new Error('You do not have permission to update this task status');
        }

        // Validate status transitions
        const validTransitions: Record<Task['status'], Task['status'][]> = {
            'open': ['assigned', 'cancelled'],
            'assigned': ['in-progress', 'cancelled'],
            'in-progress': ['completed', 'cancelled'],
            'completed': [],
            'cancelled': []
        };

        const currentStatus = task.status;
        if (!validTransitions[currentStatus]?.includes(newStatus)) {
            throw new Error(`Invalid status transition from ${currentStatus} to ${newStatus}`);
        }

        // Update status
        await updateDoc(taskRef, {
            status: newStatus,
            updatedAt: Timestamp.now(),
        });

        console.log(`✅ Task status updated from ${currentStatus} to ${newStatus}`);
    } catch (error) {
        console.error('❌ Error updating task status:', error);
        throw error;
    }
}

/**
 * Alias for getTaskById for consistency with other libraries
 */
export const getTask = getTaskById;
