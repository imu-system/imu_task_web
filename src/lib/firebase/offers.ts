import {
    collection,
    addDoc,
    query,
    where,
    getDocs,
    getDoc,
    doc,
    updateDoc,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Offer, CreateOfferInput, OfferWithDetails } from '@/types/offer';

const OFFERS_COLLECTION = 'offers';

/**
 * Créer une nouvelle offre
 */
export async function createOffer(
    providerId: string,
    input: CreateOfferInput
): Promise<string> {
    // 1. Vérifier que la task existe et est ouverte
    const taskRef = doc(db, 'tasks', input.taskId);
    const taskSnap = await getDoc(taskRef);

    if (!taskSnap.exists()) {
        throw new Error('Task not found');
    }

    const task = taskSnap.data();

    if (task.status !== 'open') {
        throw new Error('Task is not open for offers');
    }

    // 2. Vérifier que le provider n'a pas déjà une offre pending
    const existingOffers = await getProviderOffersForTask(providerId, input.taskId);
    const hasPendingOffer = existingOffers.some(o => o.status === 'pending');

    if (hasPendingOffer) {
        throw new Error('You already have a pending offer for this task');
    }

    // 3. Valider le prix proposé vs budget task
    if (input.proposedPrice > task.budget * 1.5) {
        throw new Error(`Proposed price too high (max ${task.budget * 1.5}€)`);
    }

    // 4. Créer l'offre
    const offerData: Omit<Offer, 'id'> = {
        taskId: input.taskId,
        providerId,
        clientId: task.createdBy,
        proposedPrice: input.proposedPrice,
        message: input.message,
        estimatedDuration: input.estimatedDuration,
        availableFrom: input.availableFrom ? Timestamp.fromDate(input.availableFrom) : undefined,
        availableTo: input.availableTo ? Timestamp.fromDate(input.availableTo) : undefined,
        status: 'pending',
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp,
    };

    const docRef = await addDoc(collection(db, OFFERS_COLLECTION), offerData);

    // 5. TODO: Créer notification pour le client
    // await createNotification(task.createdBy, 'new_offer', { offerId: docRef.id });

    return docRef.id;
}

/**
 * Récupérer les offres d'un provider pour une task
 */
export async function getProviderOffersForTask(
    providerId: string,
    taskId: string
): Promise<Offer[]> {
    const q = query(
        collection(db, OFFERS_COLLECTION),
        where('providerId', '==', providerId),
        where('taskId', '==', taskId)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
    })) as Offer[];
}

/**
 * Récupérer toutes les offres pour une task
 */
export async function getOffersForTask(taskId: string): Promise<Offer[]> {
    const q = query(
        collection(db, OFFERS_COLLECTION),
        where('taskId', '==', taskId)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
    })) as Offer[];
}

/**
 * Récupérer les offres d'un provider
 */
export async function getProviderOffers(providerId: string): Promise<Offer[]> {
    const q = query(
        collection(db, OFFERS_COLLECTION),
        where('providerId', '==', providerId)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
    })) as Offer[];
}

/**
 * Retirer une offre (provider uniquement si status = pending)
 */
export async function withdrawOffer(offerId: string, providerId: string): Promise<void> {
    const offerRef = doc(db, OFFERS_COLLECTION, offerId);
    const offerSnap = await getDoc(offerRef);

    if (!offerSnap.exists()) {
        throw new Error('Offer not found');
    }

    const offer = offerSnap.data() as Offer;

    if (offer.providerId !== providerId) {
        throw new Error('Unauthorized');
    }

    if (offer.status !== 'pending') {
        throw new Error('Can only withdraw pending offers');
    }

    await updateDoc(offerRef, {
        status: 'withdrawn',
        updatedAt: serverTimestamp(),
    });
}

/**
 * Enrichir les offres avec les données du provider et de la task
 */
export async function enrichOffersWithDetails(offers: Offer[]): Promise<OfferWithDetails[]> {
    if (offers.length === 0) return [];

    const enrichedOffers = await Promise.all(
        offers.map(async (offer) => {
            // Récupérer données provider
            const providerRef = doc(db, 'users', offer.providerId);
            const providerSnap = await getDoc(providerRef);
            const providerData = providerSnap.exists() ? providerSnap.data() : null;

            // Récupérer données task
            const taskRef = doc(db, 'tasks', offer.taskId);
            const taskSnap = await getDoc(taskRef);
            const taskData = taskSnap.exists() ? taskSnap.data() : null;

            return {
                ...offer,
                providerName: providerData?.displayName || 'Provider',
                providerAvatar: providerData?.photoUrl,
                providerRating: providerData?.rating || undefined,
                providerReviewCount: providerData?.reviewCount || undefined,
                providerBadges: providerData?.badges || [],
                taskTitle: taskData?.title || '',
                taskBudget: taskData?.budget || 0,
                taskCategory: taskData?.category || '',
            } as OfferWithDetails;
        })
    );

    return enrichedOffers;
}

/**
 * Récupérer les offres d'une task avec détails enrichis
 */
export async function getOffersForTaskWithDetails(taskId: string): Promise<OfferWithDetails[]> {
    const offers = await getOffersForTask(taskId);
    return enrichOffersWithDetails(offers);
}

/**
 * Accepter une offre (client uniquement)
 * - Met à jour le statut de l'offre
 * - Rejette automatiquement les autres offres
 * - TODO: Créer le booking automatiquement
 */
export async function acceptOffer(offerId: string, clientId: string): Promise<void> {
    const offerRef = doc(db, OFFERS_COLLECTION, offerId);
    const offerSnap = await getDoc(offerRef);

    if (!offerSnap.exists()) {
        throw new Error('Offer not found');
    }

    const offer = offerSnap.data() as Offer;

    if (offer.clientId !== clientId) {
        throw new Error('Unauthorized');
    }

    if (offer.status !== 'pending') {
        throw new Error('Can only accept pending offers');
    }

    // Accepter l'offre
    await updateDoc(offerRef, {
        status: 'accepted',
        acceptedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });

    // Rejeter automatiquement les autres offres pour cette task
    const otherOffers = await getOffersForTask(offer.taskId);
    const rejectPromises = otherOffers
        .filter(o => o.id !== offerId && o.status === 'pending')
        .map(o => {
            const otherOfferRef = doc(db, OFFERS_COLLECTION, o.id);
            return updateDoc(otherOfferRef, {
                status: 'rejected',
                rejectedAt: serverTimestamp(),
                rejectionReason: 'Another offer was accepted',
                updatedAt: serverTimestamp(),
            });
        });

    await Promise.all(rejectPromises);

    // TODO: Créer le booking automatiquement
    // TODO: Créer notification pour le provider
    // TODO: Update task status to 'assigned'
}

/**
 * Rejeter une offre (client uniquement)
 */
export async function rejectOffer(
    offerId: string,
    clientId: string,
    reason?: string
): Promise<void> {
    const offerRef = doc(db, OFFERS_COLLECTION, offerId);
    const offerSnap = await getDoc(offerRef);

    if (!offerSnap.exists()) {
        throw new Error('Offer not found');
    }

    const offer = offerSnap.data() as Offer;

    if (offer.clientId !== clientId) {
        throw new Error('Unauthorized');
    }

    if (offer.status !== 'pending') {
        throw new Error('Can only reject pending offers');
    }

    await updateDoc(offerRef, {
        status: 'rejected',
        rejectedAt: serverTimestamp(),
        rejectionReason: reason || 'Rejected by client',
        updatedAt: serverTimestamp(),
    });

    // TODO: Créer notification pour le provider
}
