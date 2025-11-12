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
import { createBooking } from './firestore-bookings';
import { getTask } from './firestore-tasks';
import { notifyNewProposal, notifyProposalAccepted, notifyProposalRejected } from './firestore-notifications';

// Types
export interface Proposal {
    id?: string;
    taskId: string;
    providerId: string;
    clientId: string;
    amount: number;
    message: string;
    estimatedDuration?: string;
    status: 'pending' | 'accepted' | 'rejected';
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateProposalData {
    taskId: string;
    providerId: string;
    clientId: string;
    amount: number;
    message: string;
    estimatedDuration?: string;
}

/**
 * Create a new proposal in Firestore
 * @param proposalData - The proposal data
 * @returns The ID of the created proposal
 */
export async function createProposal(
    proposalData: CreateProposalData
): Promise<string> {
    try {
        const proposalsRef = collection(db, 'proposals');

        const newProposal = {
            taskId: proposalData.taskId,
            providerId: proposalData.providerId,
            clientId: proposalData.clientId,
            amount: proposalData.amount,
            message: proposalData.message,
            estimatedDuration: proposalData.estimatedDuration || null,
            status: 'pending' as const,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        };

        const docRef = await addDoc(proposalsRef, newProposal);

        // 🔔 Notify task owner of new proposal
        const task = await getTask(proposalData.taskId);
        if (task) {
            await notifyNewProposal(
                proposalData.clientId,
                proposalData.providerId,
                'Provider', // TODO: Get provider name from user profile
                task.title,
                docRef.id,
                proposalData.taskId
            );
        }

        console.log('✅ Proposal created successfully with ID:', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('❌ Error creating proposal:', error);
        throw new Error('Failed to create proposal. Please try again.');
    }
}

/**
 * Get all proposals by a specific provider
 * @param providerId - The ID of the provider
 * @returns Array of proposals
 */
export async function getProviderProposals(providerId: string): Promise<Proposal[]> {
    try {
        const proposalsRef = collection(db, 'proposals');
        const q = query(
            proposalsRef,
            where('providerId', '==', providerId),
            orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(q);

        const proposals: Proposal[] = querySnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                taskId: data.taskId,
                providerId: data.providerId,
                clientId: data.clientId,
                amount: data.amount,
                message: data.message,
                estimatedDuration: data.estimatedDuration || undefined,
                status: data.status,
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date(),
            };
        });

        console.log('✅ Found', proposals.length, 'proposals for provider:', providerId);
        return proposals;
    } catch (error) {
        console.error('❌ Error fetching provider proposals:', error);
        throw new Error('Failed to load proposals. Please try again.');
    }
}

/**
 * Get all proposals for a specific task
 * @param taskId - The ID of the task
 * @returns Array of proposals
 */
export async function getTaskProposals(taskId: string): Promise<Proposal[]> {
    try {
        const proposalsRef = collection(db, 'proposals');
        // TEMPORARY: Removed orderBy until Firestore index is built
        // Index creation: https://console.firebase.google.com/.../firestore/indexes
        const q = query(
            proposalsRef,
            where('taskId', '==', taskId)
            // orderBy('createdAt', 'desc') // TODO: Uncomment when index is ready
        );

        const querySnapshot = await getDocs(q);

        const proposals: Proposal[] = querySnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                taskId: data.taskId,
                providerId: data.providerId,
                clientId: data.clientId,
                amount: data.amount,
                message: data.message,
                estimatedDuration: data.estimatedDuration || undefined,
                status: data.status,
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date(),
            };
        });

        // Sort client-side until index is ready
        proposals.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        console.log('✅ Found', proposals.length, 'proposals for task:', taskId);
        return proposals;
    } catch (error) {
        console.error('❌ Error fetching task proposals:', error);
        throw new Error('Failed to load proposals. Please try again.');
    }
}

/**
 * Get all proposals for a specific client
 * @param clientId - The ID of the client
 * @returns Array of proposals
 */
export async function getClientProposals(clientId: string): Promise<Proposal[]> {
    try {
        const proposalsRef = collection(db, 'proposals');
        const q = query(
            proposalsRef,
            where('clientId', '==', clientId),
            orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(q);

        const proposals: Proposal[] = querySnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                taskId: data.taskId,
                providerId: data.providerId,
                clientId: data.clientId,
                amount: data.amount,
                message: data.message,
                estimatedDuration: data.estimatedDuration || undefined,
                status: data.status,
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date(),
            };
        });

        console.log('✅ Found', proposals.length, 'proposals for client:', clientId);
        return proposals;
    } catch (error) {
        console.error('❌ Error fetching client proposals:', error);
        throw new Error('Failed to load proposals. Please try again.');
    }
}

/**
 * Get a specific proposal by ID
 * @param proposalId - The ID of the proposal
 * @returns The proposal or null if not found
 */
export async function getProposal(proposalId: string): Promise<Proposal | null> {
    try {
        const proposalRef = doc(db, 'proposals', proposalId);
        const proposalSnap = await getDoc(proposalRef);

        if (!proposalSnap.exists()) {
            console.log('❌ Proposal not found with ID:', proposalId);
            return null;
        }

        const data = proposalSnap.data();
        const proposal: Proposal = {
            id: proposalSnap.id,
            taskId: data.taskId,
            providerId: data.providerId,
            clientId: data.clientId,
            amount: data.amount,
            message: data.message,
            estimatedDuration: data.estimatedDuration || undefined,
            status: data.status,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
        };

        console.log('✅ Proposal found:', proposal);
        return proposal;
    } catch (error) {
        console.error('❌ Error fetching proposal:', error);
        throw new Error('Failed to load proposal. Please try again.');
    }
}

/**
 * Update a proposal's status
 * @param proposalId - The ID of the proposal
 * @param status - The new status
 */
export async function updateProposalStatus(
    proposalId: string,
    status: 'pending' | 'accepted' | 'rejected'
): Promise<void> {
    try {
        const proposalRef = doc(db, 'proposals', proposalId);

        await updateDoc(proposalRef, {
            status,
            updatedAt: Timestamp.now(),
        });

        console.log('✅ Proposal status updated to:', status);
    } catch (error) {
        console.error('❌ Error updating proposal status:', error);
        throw new Error('Failed to update proposal status. Please try again.');
    }
}

/**
 * Update a proposal
 * @param proposalId - The ID of the proposal
 * @param updates - The fields to update
 */
export async function updateProposal(
    proposalId: string,
    updates: Partial<Omit<Proposal, 'id' | 'taskId' | 'providerId' | 'clientId' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
    try {
        const proposalRef = doc(db, 'proposals', proposalId);

        await updateDoc(proposalRef, {
            ...updates,
            updatedAt: Timestamp.now(),
        });

        console.log('✅ Proposal updated successfully');
    } catch (error) {
        console.error('❌ Error updating proposal:', error);
        throw new Error('Failed to update proposal. Please try again.');
    }
}

/**
 * Delete a proposal
 * @param proposalId - The ID of the proposal to delete
 */
export async function deleteProposal(proposalId: string): Promise<void> {
    try {
        const proposalRef = doc(db, 'proposals', proposalId);
        await deleteDoc(proposalRef);

        console.log('✅ Proposal deleted successfully:', proposalId);
    } catch (error) {
        console.error('❌ Error deleting proposal:', error);
        throw new Error('Failed to delete proposal. Please try again.');
    }
}

/**
 * Accept a proposal (and reject all other proposals for the same task)
 * Also creates a booking automatically
 * @param proposalId - The ID of the proposal to accept
 * @param taskId - The ID of the task
 * @returns The created booking ID
 */
export async function acceptProposal(
    proposalId: string,
    taskId: string
): Promise<{ bookingId: string }> {
    try {
        // Get the proposal and task details
        const proposalDoc = await getDoc(doc(db, 'proposals', proposalId));
        if (!proposalDoc.exists()) {
            throw new Error('Proposal not found');
        }

        const proposalData = proposalDoc.data();
        const task = await getTask(taskId);

        if (!task) {
            throw new Error('Task not found');
        }

        // Accept the selected proposal
        await updateProposalStatus(proposalId, 'accepted');

        // 🔔 Notify provider that their proposal was accepted
        await notifyProposalAccepted(
            proposalData.providerId,
            task.title,
            proposalId,
            taskId
        );

        // Reject all other proposals for this task
        const taskProposals = await getTaskProposals(taskId);
        const otherProposals = taskProposals.filter(p => p.id !== proposalId && p.status === 'pending');

        for (const proposal of otherProposals) {
            if (proposal.id) {
                await updateProposalStatus(proposal.id, 'rejected');

                // 🔔 Notify rejected providers
                await notifyProposalRejected(
                    proposal.providerId,
                    task.title,
                    proposal.id
                );
            }
        }

        // Create a booking automatically
        const bookingId = await createBooking({
            taskId,
            clientId: task.clientId,
            providerId: proposalData.providerId,
            proposalId,
            amount: proposalData.amount,
            notes: proposalData.message || undefined,
        });

        console.log('✅ Proposal accepted, booking created:', bookingId);

        return { bookingId };
    } catch (error) {
        console.error('❌ Error accepting proposal:', error);
        throw new Error('Failed to accept proposal. Please try again.');
    }
}
