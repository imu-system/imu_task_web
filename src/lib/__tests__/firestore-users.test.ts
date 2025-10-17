/**
 * Tests unitaires pour firestore-users.ts
 */

import {
    createUserDocument,
    getUserDocument,
    updateUserDocument,
    addUserRole,
} from '../firestore-users';
import { UserRole } from '../types';
import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    serverTimestamp,
} from 'firebase/firestore';

// Mock Firebase Firestore
jest.mock('firebase/firestore', () => ({
    doc: jest.fn(),
    getDoc: jest.fn(),
    setDoc: jest.fn(),
    updateDoc: jest.fn(),
    serverTimestamp: jest.fn(() => ({ _seconds: 1697500800, _nanoseconds: 0 })),
}));

// Mock Firebase app
jest.mock('../firebase', () => ({
    db: {},
}));

describe('firestore-users', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createUserDocument', () => {
        it('devrait créer un document utilisateur avec un displayName', async () => {
            const uid = 'test-uid-123';
            const email = 'test@example.com';
            const displayName = 'Test User';

            await createUserDocument(uid, email, displayName);

            expect(doc).toHaveBeenCalledWith({}, 'users', uid);
            expect(setDoc).toHaveBeenCalledWith(
                undefined, // doc reference (mocked)
                {
                    uid,
                    email,
                    roles: [UserRole.client],
                    profile: {
                        displayName,
                    },
                    createdAt: expect.any(Object),
                    updatedAt: expect.any(Object),
                }
            );
        });

        it('devrait créer un document utilisateur sans displayName', async () => {
            const uid = 'test-uid-456';
            const email = 'user@example.com';

            await createUserDocument(uid, email);

            expect(setDoc).toHaveBeenCalledWith(
                undefined,
                expect.objectContaining({
                    uid,
                    email,
                    roles: [UserRole.client],
                    profile: {
                        displayName: 'user', // Extrait de l'email
                    },
                })
            );
        });

        it('devrait propager les erreurs Firestore', async () => {
            const uid = 'test-uid-789';
            const email = 'error@example.com';
            const error = new Error('Firestore error');

            (setDoc as jest.Mock).mockRejectedValueOnce(error);

            await expect(createUserDocument(uid, email)).rejects.toThrow('Firestore error');
        });
    });

    describe('getUserDocument', () => {
        it('devrait récupérer un document utilisateur existant', async () => {
            const uid = 'test-uid-123';
            const mockData = {
                uid,
                email: 'test@example.com',
                roles: [UserRole.client, UserRole.provider],
                profile: {
                    displayName: 'Test User',
                    photoUrl: 'https://example.com/photo.jpg',
                },
                skills: ['plomberie', 'électricité'],
                availability: true,
                createdAt: { _seconds: 1697500800, _nanoseconds: 0 },
                updatedAt: { _seconds: 1697500800, _nanoseconds: 0 },
            };

            (getDoc as jest.Mock).mockResolvedValueOnce({
                exists: () => true,
                data: () => mockData,
            });

            const result = await getUserDocument(uid);

            expect(doc).toHaveBeenCalledWith({}, 'users', uid);
            expect(getDoc).toHaveBeenCalled();
            expect(result).toEqual(mockData);
        });

        it('devrait retourner null si le document n\'existe pas', async () => {
            const uid = 'non-existent-uid';

            (getDoc as jest.Mock).mockResolvedValueOnce({
                exists: () => false,
            });

            const result = await getUserDocument(uid);

            expect(result).toBeNull();
        });

        it('devrait retourner null en cas d\'erreur', async () => {
            const uid = 'error-uid';

            (getDoc as jest.Mock).mockRejectedValueOnce(new Error('Firestore error'));

            const result = await getUserDocument(uid);

            expect(result).toBeNull();
        });

        it('devrait gérer les documents avec des champs manquants', async () => {
            const uid = 'incomplete-uid';
            const mockData = {
                uid,
                email: 'incomplete@example.com',
                // roles manquant
                // profile manquant
            };

            (getDoc as jest.Mock).mockResolvedValueOnce({
                exists: () => true,
                data: () => mockData,
            });

            const result = await getUserDocument(uid);

            expect(result).toEqual({
                uid,
                email: 'incomplete@example.com',
                roles: [UserRole.client], // Valeur par défaut
                profile: {}, // Valeur par défaut
                skills: undefined,
                availability: undefined,
                createdAt: undefined,
                updatedAt: undefined,
            });
        });
    });

    describe('updateUserDocument', () => {
        it('devrait mettre à jour un document utilisateur', async () => {
            const uid = 'test-uid-123';
            const updates = {
                profile: {
                    displayName: 'Updated Name',
                    bio: 'New bio',
                },
                skills: ['jardinage'],
            };

            await updateUserDocument(uid, updates);

            expect(doc).toHaveBeenCalledWith({}, 'users', uid);
            expect(updateDoc).toHaveBeenCalledWith(
                undefined,
                {
                    ...updates,
                    updatedAt: expect.any(Object),
                }
            );
        });

        it('devrait propager les erreurs Firestore', async () => {
            const uid = 'test-uid-456';
            const updates = { profile: { bio: 'New bio' } };
            const error = new Error('Update failed');

            (updateDoc as jest.Mock).mockRejectedValueOnce(error);

            await expect(updateUserDocument(uid, updates)).rejects.toThrow('Update failed');
        });
    });

    describe('addUserRole', () => {
        it('devrait ajouter un rôle à un utilisateur', async () => {
            const uid = 'test-uid-123';
            const mockUserDoc = {
                uid,
                email: 'test@example.com',
                roles: [UserRole.client],
                profile: {},
                createdAt: {} as any,
                updatedAt: {} as any,
            };

            // Mock getUserDocument
            (getDoc as jest.Mock).mockResolvedValueOnce({
                exists: () => true,
                data: () => mockUserDoc,
            });

            await addUserRole(uid, UserRole.provider);

            expect(updateDoc).toHaveBeenCalledWith(
                undefined,
                expect.objectContaining({
                    roles: [UserRole.client, UserRole.provider],
                })
            );
        });

        it('ne devrait pas ajouter un rôle déjà existant', async () => {
            const uid = 'test-uid-456';
            const mockUserDoc = {
                uid,
                email: 'test@example.com',
                roles: [UserRole.client, UserRole.provider],
                profile: {},
                createdAt: {} as any,
                updatedAt: {} as any,
            };

            (getDoc as jest.Mock).mockResolvedValueOnce({
                exists: () => true,
                data: () => mockUserDoc,
            });

            await addUserRole(uid, UserRole.provider);

            // updateDoc ne devrait pas être appelé car le rôle existe déjà
            expect(updateDoc).not.toHaveBeenCalled();
        });

        it('devrait lever une erreur si l\'utilisateur n\'existe pas', async () => {
            const uid = 'non-existent-uid';

            (getDoc as jest.Mock).mockResolvedValueOnce({
                exists: () => false,
            });

            await expect(addUserRole(uid, UserRole.provider)).rejects.toThrow('User not found');
        });
    });
});
