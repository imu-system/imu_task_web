/**
 * Cloud Functions pour l'administration des rôles utilisateurs
 * Seulement accessible aux administrateurs
 */

import { onCall, HttpsError } from "firebase-functions/v2/https";
import { getFirestore } from "firebase-admin/firestore";
import { UserRole } from "../types/user";

const db = getFirestore();

/**
 * Assigner un rôle à un utilisateur
 * Requiert le rôle admin
 */
export const assignUserRole = onCall(async (request) => {
    // Vérifier l'authentification
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    const callerId = request.auth.uid;
    const { targetUid, role } = request.data;

    // Validation des paramètres
    if (!targetUid || typeof targetUid !== 'string') {
        throw new HttpsError('invalid-argument', 'targetUid is required and must be a string');
    }

    if (!role || typeof role !== 'string') {
        throw new HttpsError('invalid-argument', 'role is required and must be a string');
    }

    // Vérifier que le rôle est valide
    const validRoles = Object.values(UserRole);
    if (!validRoles.includes(role as UserRole)) {
        throw new HttpsError('invalid-argument', `Invalid role. Must be one of: ${validRoles.join(', ')}`);
    }

    try {
        // Vérifier que l'appelant est admin
        const callerDoc = await db.collection('users').doc(callerId).get();

        if (!callerDoc.exists) {
            throw new HttpsError('not-found', 'Caller user document not found');
        }

        const callerData = callerDoc.data();
        const callerRoles = callerData?.roles || [];

        if (!callerRoles.includes(UserRole.admin)) {
            throw new HttpsError(
                'permission-denied',
                'Only administrators can assign roles'
            );
        }

        // Récupérer l'utilisateur cible
        const targetDoc = await db.collection('users').doc(targetUid).get();

        if (!targetDoc.exists) {
            throw new HttpsError('not-found', `User ${targetUid} not found`);
        }

        const targetData = targetDoc.data();
        const currentRoles = targetData?.roles || [];

        // Vérifier si le rôle existe déjà
        if (currentRoles.includes(role)) {
            return {
                success: true,
                message: `User ${targetUid} already has role ${role}`,
                roles: currentRoles,
            };
        }

        // Ajouter le rôle
        const updatedRoles = [...currentRoles, role];

        await db.collection('users').doc(targetUid).update({
            roles: updatedRoles,
            updatedAt: new Date(),
        });

        // Log de l'opération
        await db.collection('admin_logs').add({
            action: 'assign_role',
            performedBy: callerId,
            performedByEmail: request.auth.token.email,
            targetUser: targetUid,
            targetUserEmail: targetData?.email,
            role: role,
            timestamp: new Date(),
        });

        console.log(`✅ Role ${role} assigned to ${targetUid} by ${callerId}`);

        return {
            success: true,
            message: `Role ${role} successfully assigned to user ${targetUid}`,
            roles: updatedRoles,
        };
    } catch (error: any) {
        console.error('❌ Error assigning role:', error);

        // Si c'est déjà une HttpsError, la relancer
        if (error instanceof HttpsError) {
            throw error;
        }

        // Sinon, créer une nouvelle erreur
        throw new HttpsError('internal', `Failed to assign role: ${error.message}`);
    }
});

/**
 * Retirer un rôle d'un utilisateur
 * Requiert le rôle admin
 */
export const removeUserRole = onCall(async (request) => {
    // Vérifier l'authentification
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    const callerId = request.auth.uid;
    const { targetUid, role } = request.data;

    // Validation des paramètres
    if (!targetUid || typeof targetUid !== 'string') {
        throw new HttpsError('invalid-argument', 'targetUid is required and must be a string');
    }

    if (!role || typeof role !== 'string') {
        throw new HttpsError('invalid-argument', 'role is required and must be a string');
    }

    // Empêcher de retirer son propre rôle admin
    if (callerId === targetUid && role === UserRole.admin) {
        throw new HttpsError(
            'permission-denied',
            'Cannot remove your own admin role'
        );
    }

    try {
        // Vérifier que l'appelant est admin
        const callerDoc = await db.collection('users').doc(callerId).get();

        if (!callerDoc.exists) {
            throw new HttpsError('not-found', 'Caller user document not found');
        }

        const callerData = callerDoc.data();
        const callerRoles = callerData?.roles || [];

        if (!callerRoles.includes(UserRole.admin)) {
            throw new HttpsError(
                'permission-denied',
                'Only administrators can remove roles'
            );
        }

        // Récupérer l'utilisateur cible
        const targetDoc = await db.collection('users').doc(targetUid).get();

        if (!targetDoc.exists) {
            throw new HttpsError('not-found', `User ${targetUid} not found`);
        }

        const targetData = targetDoc.data();
        const currentRoles = targetData?.roles || [];

        // Vérifier si le rôle existe
        if (!currentRoles.includes(role)) {
            return {
                success: true,
                message: `User ${targetUid} does not have role ${role}`,
                roles: currentRoles,
            };
        }

        // Retirer le rôle
        const updatedRoles = currentRoles.filter((r: string) => r !== role);

        // S'assurer qu'il reste au moins un rôle (client par défaut)
        if (updatedRoles.length === 0) {
            updatedRoles.push(UserRole.client);
        }

        await db.collection('users').doc(targetUid).update({
            roles: updatedRoles,
            updatedAt: new Date(),
        });

        // Log de l'opération
        await db.collection('admin_logs').add({
            action: 'remove_role',
            performedBy: callerId,
            performedByEmail: request.auth.token.email,
            targetUser: targetUid,
            targetUserEmail: targetData?.email,
            role: role,
            timestamp: new Date(),
        });

        console.log(`✅ Role ${role} removed from ${targetUid} by ${callerId}`);

        return {
            success: true,
            message: `Role ${role} successfully removed from user ${targetUid}`,
            roles: updatedRoles,
        };
    } catch (error: any) {
        console.error('❌ Error removing role:', error);

        if (error instanceof HttpsError) {
            throw error;
        }

        throw new HttpsError('internal', `Failed to remove role: ${error.message}`);
    }
});

/**
 * Lister tous les utilisateurs avec leurs rôles (pagination)
 * Requiert le rôle admin
 */
export const listUsersWithRoles = onCall(async (request) => {
    // Vérifier l'authentification
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    const callerId = request.auth.uid;
    const { limit = 50, startAfter } = request.data;

    try {
        // Vérifier que l'appelant est admin
        const callerDoc = await db.collection('users').doc(callerId).get();

        if (!callerDoc.exists) {
            throw new HttpsError('not-found', 'Caller user document not found');
        }

        const callerData = callerDoc.data();
        const callerRoles = callerData?.roles || [];

        if (!callerRoles.includes(UserRole.admin)) {
            throw new HttpsError(
                'permission-denied',
                'Only administrators can list users'
            );
        }

        // Construire la requête
        let query = db.collection('users')
            .orderBy('createdAt', 'desc')
            .limit(limit);

        if (startAfter) {
            const startDoc = await db.collection('users').doc(startAfter).get();
            if (startDoc.exists) {
                query = query.startAfter(startDoc);
            }
        }

        const snapshot = await query.get();

        const users = snapshot.docs.map(doc => ({
            uid: doc.id,
            email: doc.data().email,
            roles: doc.data().roles || [],
            profile: doc.data().profile || {},
            createdAt: doc.data().createdAt?.toDate().toISOString(),
        }));

        return {
            success: true,
            users,
            hasMore: snapshot.docs.length === limit,
            lastDocId: snapshot.docs[snapshot.docs.length - 1]?.id,
        };
    } catch (error: any) {
        console.error('❌ Error listing users:', error);

        if (error instanceof HttpsError) {
            throw error;
        }

        throw new HttpsError('internal', `Failed to list users: ${error.message}`);
    }
});
