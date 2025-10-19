/**
 * Firestore Security Rules Tests
 * Tests pour valider les règles de sécurité Firestore, notamment pour KYC
 */

import {
    assertFails,
    assertSucceeds,
    initializeTestEnvironment,
    RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { setDoc, getDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

// Polyfill fetch for Node.js environment
global.fetch = fetch as any;

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
    // Charger les règles Firestore
    const rulesPath = path.join(__dirname, '../../../firestore.rules');
    const rules = fs.readFileSync(rulesPath, 'utf8');

    testEnv = await initializeTestEnvironment({
        projectId: 'demo-imu-task-test',
        firestore: {
            rules,
            host: 'localhost',
            port: 8080,
        },
    });
});

afterAll(async () => {
    await testEnv.cleanup();
});

afterEach(async () => {
    await testEnv.clearFirestore();
});

describe('KYC Submissions Rules', () => {
    const userId = 'user123';
    const adminId = 'admin456';
    const otherUserId = 'other789';

    beforeEach(async () => {
        // Créer un utilisateur admin dans Firestore
        await testEnv.withSecurityRulesDisabled(async (context) => {
            const firestore = context.firestore();
            await setDoc(doc(firestore, 'users', adminId), {
                email: 'admin@example.com',
                roles: ['admin'],
            });
            await setDoc(doc(firestore, 'users', userId), {
                email: 'user@example.com',
                roles: ['user'],
            });
            await setDoc(doc(firestore, 'users', otherUserId), {
                email: 'other@example.com',
                roles: ['user'],
            });
        });
    });

    describe('Create KYC Submission', () => {
        it('should allow authenticated user to create their own submission', async () => {
            const userContext = testEnv.authenticatedContext(userId);
            const firestore = userContext.firestore();

            const submission = {
                userId: userId,
                status: 'pending',
                documents: [
                    {
                        type: 'identity',
                        url: 'https://example.com/doc.pdf',
                        fileName: 'id.pdf',
                    },
                ],
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            await assertSucceeds(
                setDoc(doc(firestore, 'kyc_submissions', 'sub123'), submission)
            );
        });

        it('should deny user creating submission for another user', async () => {
            const userContext = testEnv.authenticatedContext(userId);
            const firestore = userContext.firestore();

            const submission = {
                userId: otherUserId, // Tentative de créer pour un autre utilisateur
                status: 'pending',
                documents: [
                    {
                        type: 'identity',
                        url: 'https://example.com/doc.pdf',
                        fileName: 'id.pdf',
                    },
                ],
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            await assertFails(
                setDoc(doc(firestore, 'kyc_submissions', 'sub123'), submission)
            );
        });

        it('should deny submission with invalid status', async () => {
            const userContext = testEnv.authenticatedContext(userId);
            const firestore = userContext.firestore();

            const submission = {
                userId: userId,
                status: 'approved', // Statut invalide à la création
                documents: [
                    {
                        type: 'identity',
                        url: 'https://example.com/doc.pdf',
                        fileName: 'id.pdf',
                    },
                ],
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            await assertFails(
                setDoc(doc(firestore, 'kyc_submissions', 'sub123'), submission)
            );
        });

        it('should deny submission with no documents', async () => {
            const userContext = testEnv.authenticatedContext(userId);
            const firestore = userContext.firestore();

            const submission = {
                userId: userId,
                status: 'pending',
                documents: [], // Pas de documents
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            await assertFails(
                setDoc(doc(firestore, 'kyc_submissions', 'sub123'), submission)
            );
        });

        it('should deny unauthenticated user', async () => {
            const unauthContext = testEnv.unauthenticatedContext();
            const firestore = unauthContext.firestore();

            const submission = {
                userId: userId,
                status: 'pending',
                documents: [
                    {
                        type: 'identity',
                        url: 'https://example.com/doc.pdf',
                        fileName: 'id.pdf',
                    },
                ],
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            await assertFails(
                setDoc(doc(firestore, 'kyc_submissions', 'sub123'), submission)
            );
        });
    });

    describe('Read KYC Submission', () => {
        beforeEach(async () => {
            // Créer une soumission test
            await testEnv.withSecurityRulesDisabled(async (context) => {
                const firestore = context.firestore();
                await setDoc(doc(firestore, 'kyc_submissions', 'sub123'), {
                    userId: userId,
                    status: 'pending',
                    documents: [
                        {
                            type: 'identity',
                            url: 'https://example.com/doc.pdf',
                            fileName: 'id.pdf',
                        },
                    ],
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
            });
        });

        it('should allow user to read their own submission', async () => {
            const userContext = testEnv.authenticatedContext(userId);
            const firestore = userContext.firestore();

            await assertSucceeds(getDoc(doc(firestore, 'kyc_submissions', 'sub123')));
        });

        it('should allow admin to read any submission', async () => {
            const adminContext = testEnv.authenticatedContext(adminId);
            const firestore = adminContext.firestore();

            await assertSucceeds(getDoc(doc(firestore, 'kyc_submissions', 'sub123')));
        });

        it('should deny other user to read submission', async () => {
            const otherContext = testEnv.authenticatedContext(otherUserId);
            const firestore = otherContext.firestore();

            await assertFails(getDoc(doc(firestore, 'kyc_submissions', 'sub123')));
        });
    });

    describe('Update KYC Submission', () => {
        beforeEach(async () => {
            // Créer une soumission test
            await testEnv.withSecurityRulesDisabled(async (context) => {
                const firestore = context.firestore();
                await setDoc(doc(firestore, 'kyc_submissions', 'sub123'), {
                    userId: userId,
                    status: 'pending',
                    documents: [
                        {
                            type: 'identity',
                            url: 'https://example.com/doc.pdf',
                            fileName: 'id.pdf',
                        },
                    ],
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
            });
        });

        it('should allow admin to approve submission', async () => {
            const adminContext = testEnv.authenticatedContext(adminId);
            const firestore = adminContext.firestore();

            await assertSucceeds(
                updateDoc(doc(firestore, 'kyc_submissions', 'sub123'), {
                    status: 'approved',
                    reviewedBy: adminId,
                    reviewedAt: new Date(),
                })
            );
        });

        it('should allow admin to reject submission', async () => {
            const adminContext = testEnv.authenticatedContext(adminId);
            const firestore = adminContext.firestore();

            await assertSucceeds(
                updateDoc(doc(firestore, 'kyc_submissions', 'sub123'), {
                    status: 'rejected',
                    rejectionReason: 'Invalid documents',
                    reviewedBy: adminId,
                    reviewedAt: new Date(),
                })
            );
        });

        it('should deny regular user to update submission', async () => {
            const userContext = testEnv.authenticatedContext(userId);
            const firestore = userContext.firestore();

            await assertFails(
                updateDoc(doc(firestore, 'kyc_submissions', 'sub123'), {
                    status: 'approved',
                })
            );
        });

        it('should deny admin changing userId', async () => {
            const adminContext = testEnv.authenticatedContext(adminId);
            const firestore = adminContext.firestore();

            await assertFails(
                updateDoc(doc(firestore, 'kyc_submissions', 'sub123'), {
                    userId: otherUserId,
                    status: 'approved',
                })
            );
        });
    });

    describe('Delete KYC Submission', () => {
        beforeEach(async () => {
            // Créer une soumission test
            await testEnv.withSecurityRulesDisabled(async (context) => {
                const firestore = context.firestore();
                await setDoc(doc(firestore, 'kyc_submissions', 'sub123'), {
                    userId: userId,
                    status: 'pending',
                    documents: [
                        {
                            type: 'identity',
                            url: 'https://example.com/doc.pdf',
                            fileName: 'id.pdf',
                        },
                    ],
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
            });
        });

        it('should deny user deleting their own submission', async () => {
            const userContext = testEnv.authenticatedContext(userId);
            const firestore = userContext.firestore();

            await assertFails(deleteDoc(doc(firestore, 'kyc_submissions', 'sub123')));
        });

        it('should deny admin deleting submission', async () => {
            const adminContext = testEnv.authenticatedContext(adminId);
            const firestore = adminContext.firestore();

            await assertFails(deleteDoc(doc(firestore, 'kyc_submissions', 'sub123')));
        });
    });
});
