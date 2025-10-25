/**
 * Hook personnalisé pour gérer l'upload de photo de profil
 * Fonctionnalités: Upload Firebase Storage, compression, WebP, crop
 */

import { useState, useCallback } from 'react';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { storage, db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

interface UploadProgress {
    status: 'idle' | 'uploading' | 'processing' | 'success' | 'error';
    progress: number;
    error?: string;
}

interface UseProfilePhotoReturn {
    uploadPhoto: (file: File) => Promise<string | null>;
    deletePhoto: () => Promise<void>;
    uploadProgress: UploadProgress;
    isUploading: boolean;
}

export function useProfilePhoto(): UseProfilePhotoReturn {
    const { user } = useAuth();
    const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
        status: 'idle',
        progress: 0,
    });

    /**
     * Compresse et convertit l'image en WebP
     */
    const compressImage = useCallback(async (file: File, maxWidth: number = 400): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const reader = new FileReader();

            reader.onload = (e) => {
                img.src = e.target?.result as string;
            };

            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Redimensionner si nécessaire
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Canvas context error'));
                    return;
                }

                // Dessiner l'image redimensionnée
                ctx.drawImage(img, 0, 0, width, height);

                // Convertir en WebP avec qualité 0.8
                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(new Error('Compression failed'));
                        }
                    },
                    'image/webp',
                    0.8
                );
            };

            img.onerror = () => reject(new Error('Image load error'));
            reader.onerror = () => reject(new Error('File read error'));
            reader.readAsDataURL(file);
        });
    }, []);

    /**
     * Upload la photo vers Firebase Storage
     */
    const uploadPhoto = useCallback(
        async (file: File): Promise<string | null> => {
            if (!user?.uid) {
                setUploadProgress({
                    status: 'error',
                    progress: 0,
                    error: 'Utilisateur non connecté',
                });
                return null;
            }

            try {
                setUploadProgress({ status: 'processing', progress: 10 });

                // Validation du fichier
                const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
                if (!validTypes.includes(file.type)) {
                    throw new Error('Format de fichier non supporté. Utilisez JPG, PNG, WebP ou GIF.');
                }

                const maxSize = 5 * 1024 * 1024; // 5 MB
                if (file.size > maxSize) {
                    throw new Error('Fichier trop volumineux. Maximum 5 MB.');
                }

                setUploadProgress({ status: 'processing', progress: 30 });

                // Compression et conversion en WebP
                const compressedBlob = await compressImage(file, 400);

                setUploadProgress({ status: 'uploading', progress: 50 });

                // Upload vers Firebase Storage
                const fileName = `profile_photos/${user.uid}/avatar_${Date.now()}.webp`;
                const storageRef = ref(storage, fileName);

                await uploadBytes(storageRef, compressedBlob, {
                    contentType: 'image/webp',
                    customMetadata: {
                        userId: user.uid,
                        uploadedAt: new Date().toISOString(),
                    },
                });

                setUploadProgress({ status: 'uploading', progress: 80 });

                // Récupérer l'URL de téléchargement
                const downloadURL = await getDownloadURL(storageRef);

                setUploadProgress({ status: 'uploading', progress: 90 });

                // Mettre à jour le profil Firestore
                const userRef = doc(db, 'users', user.uid);
                await updateDoc(userRef, {
                    'profile.photoUrl': downloadURL,
                    'profile.photoPath': fileName,
                    'profile.updatedAt': new Date(),
                });

                setUploadProgress({ status: 'success', progress: 100 });

                // Reset après 2 secondes
                setTimeout(() => {
                    setUploadProgress({ status: 'idle', progress: 0 });
                }, 2000);

                return downloadURL;
            } catch (error: any) {
                console.error('Error uploading photo:', error);
                setUploadProgress({
                    status: 'error',
                    progress: 0,
                    error: error.message || 'Erreur lors de l\'upload',
                });

                // Reset après 5 secondes
                setTimeout(() => {
                    setUploadProgress({ status: 'idle', progress: 0 });
                }, 5000);

                return null;
            }
        },
        [user, compressImage]
    );

    /**
     * Supprime la photo de profil
     */
    const deletePhoto = useCallback(async () => {
        if (!user?.uid) return;

        try {
            setUploadProgress({ status: 'processing', progress: 50 });

            // Récupérer le chemin de la photo actuelle
            const userRef = doc(db, 'users', user.uid);
            const photoPath = user.profile?.photoPath;

            if (photoPath) {
                // Supprimer de Storage
                const storageRef = ref(storage, photoPath);
                await deleteObject(storageRef);
            }

            // Mettre à jour Firestore
            await updateDoc(userRef, {
                'profile.photoUrl': null,
                'profile.photoPath': null,
                'profile.updatedAt': new Date(),
            });

            setUploadProgress({ status: 'success', progress: 100 });

            setTimeout(() => {
                setUploadProgress({ status: 'idle', progress: 0 });
            }, 1000);
        } catch (error: any) {
            console.error('Error deleting photo:', error);
            setUploadProgress({
                status: 'error',
                progress: 0,
                error: error.message || 'Erreur lors de la suppression',
            });

            setTimeout(() => {
                setUploadProgress({ status: 'idle', progress: 0 });
            }, 3000);
        }
    }, [user]);

    return {
        uploadPhoto,
        deletePhoto,
        uploadProgress,
        isUploading: uploadProgress.status === 'uploading' || uploadProgress.status === 'processing',
    };
}
