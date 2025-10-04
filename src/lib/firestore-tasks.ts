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
}

export interface CreateTaskData {
    title: string;
    description: string;
    category: string;
    location: string;
    budget: number;
    deadline?: Date | null;
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
        };

        const docRef = await addDoc(tasksRef, newTask);

        console.log('✅ Task created successfully with ID:', docRef.id);
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
 * Alias for getTaskById for consistency with other libraries
 */
export const getTask = getTaskById;
