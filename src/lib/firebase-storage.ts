import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';

export interface UploadImageOptions {
    maxSizeMB?: number;
    allowedTypes?: string[];
    compressionQuality?: number;
}

const DEFAULT_OPTIONS: UploadImageOptions = {
    maxSizeMB: 5,
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    compressionQuality: 0.8,
};

/**
 * Validate image file
 */
export const validateImageFile = (
    file: File,
    options: UploadImageOptions = DEFAULT_OPTIONS
): { valid: boolean; error?: string } => {
    const { maxSizeMB, allowedTypes } = { ...DEFAULT_OPTIONS, ...options };

    // Check file type
    if (allowedTypes && !allowedTypes.includes(file.type)) {
        return {
            valid: false,
            error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`,
        };
    }

    // Check file size
    const maxSizeBytes = (maxSizeMB || 5) * 1024 * 1024;
    if (file.size > maxSizeBytes) {
        return {
            valid: false,
            error: `File size exceeds ${maxSizeMB}MB limit`,
        };
    }

    return { valid: true };
};

/**
 * Compress image using canvas
 */
export const compressImage = async (
    file: File,
    quality: number = 0.8
): Promise<File> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;

            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                if (!ctx) {
                    reject(new Error('Failed to get canvas context'));
                    return;
                }

                // Calculate new dimensions (max 1920x1080)
                let width = img.width;
                let height = img.height;
                const maxWidth = 1920;
                const maxHeight = 1080;

                if (width > maxWidth || height > maxHeight) {
                    const ratio = Math.min(maxWidth / width, maxHeight / height);
                    width = width * ratio;
                    height = height * ratio;
                }

                canvas.width = width;
                canvas.height = height;

                // Draw and compress
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            reject(new Error('Failed to compress image'));
                            return;
                        }

                        const compressedFile = new File([blob], file.name, {
                            type: file.type,
                            lastModified: Date.now(),
                        });

                        resolve(compressedFile);
                    },
                    file.type,
                    quality
                );
            };

            img.onerror = () => {
                reject(new Error('Failed to load image'));
            };
        };

        reader.onerror = () => {
            reject(new Error('Failed to read file'));
        };
    });
};

/**
 * Upload image to Firebase Storage
 */
export const uploadMessageImage = async (
    file: File,
    conversationId: string,
    userId: string,
    options: UploadImageOptions = DEFAULT_OPTIONS
): Promise<string> => {
    try {
        // Validate file
        const validation = validateImageFile(file, options);
        if (!validation.valid) {
            throw new Error(validation.error);
        }

        // Compress image
        const compressedFile = await compressImage(file, options.compressionQuality);

        // Create unique filename
        const timestamp = Date.now();
        const filename = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const path = `messages/${conversationId}/${userId}/${filename}`;

        // Upload to Firebase Storage
        const storageRef = ref(storage, path);
        const snapshot = await uploadBytes(storageRef, compressedFile, {
            contentType: file.type,
            customMetadata: {
                uploadedBy: userId,
                conversationId,
                originalName: file.name,
            },
        });

        // Get download URL
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
    } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
    }
};

/**
 * Delete image from Firebase Storage
 */
export const deleteMessageImage = async (imageUrl: string): Promise<void> => {
    try {
        // Extract path from URL
        const url = new URL(imageUrl);
        const pathMatch = url.pathname.match(/\/o\/(.+)\?/);

        if (!pathMatch) {
            throw new Error('Invalid image URL');
        }

        const path = decodeURIComponent(pathMatch[1]);
        const storageRef = ref(storage, path);

        await deleteObject(storageRef);
        console.log('Image deleted successfully');
    } catch (error) {
        console.error('Error deleting image:', error);
        throw error;
    }
};

/**
 * Get image metadata from URL
 */
export const getImageMetadata = (url: string): { filename: string; size?: string } => {
    try {
        const urlObj = new URL(url);
        const pathMatch = urlObj.pathname.match(/\/([^/]+)$/);
        const filename = pathMatch ? decodeURIComponent(pathMatch[1]) : 'image';

        return { filename };
    } catch (error) {
        return { filename: 'image' };
    }
};

/**
 * Generate thumbnail URL (if using Cloud Functions for image processing)
 */
export const getThumbnailUrl = (imageUrl: string, size: number = 200): string => {
    // For now, return original URL
    // In production, you can implement Cloud Function to generate thumbnails
    return imageUrl;
};
