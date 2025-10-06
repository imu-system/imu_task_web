// src/lib/storage.ts
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';

/**
 * Upload avatar image for a user
 * @param userId - User ID
 * @param file - Image file to upload
 * @returns Download URL of the uploaded image
 */
export async function uploadAvatar(userId: string, file: File): Promise<string> {
    try {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            throw new Error('File must be an image');
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            throw new Error('Image must be less than 5MB');
        }

        const storageRef = ref(storage, `avatars/${userId}/avatar.jpg`);
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);

        console.log('✅ Avatar uploaded:', downloadURL);
        return downloadURL;
    } catch (error: any) {
        console.error('❌ Avatar upload error:', error.message);
        throw error;
    }
}

/**
 * Upload task image
 * @param taskId - Task ID
 * @param file - Image file to upload
 * @param index - Image index (for multiple images)
 * @returns Download URL of the uploaded image
 */
export async function uploadTaskImage(
    taskId: string,
    file: File,
    index: number
): Promise<string> {
    try {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            throw new Error('File must be an image');
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            throw new Error('Image must be less than 10MB');
        }

        const ext = file.name.split('.').pop() || 'jpg';
        const storageRef = ref(storage, `tasks/${taskId}/image_${index}.${ext}`);
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);

        console.log('✅ Task image uploaded:', downloadURL);
        return downloadURL;
    } catch (error: any) {
        console.error('❌ Task image upload error:', error.message);
        throw error;
    }
}

/**
 * Upload chat file/image
 * @param conversationId - Conversation ID
 * @param messageId - Message ID
 * @param file - File to upload
 * @returns Download URL of the uploaded file
 */
export async function uploadChatFile(
    conversationId: string,
    messageId: string,
    file: File
): Promise<string> {
    try {
        // Validate file size (max 20MB)
        if (file.size > 20 * 1024 * 1024) {
            throw new Error('File must be less than 20MB');
        }

        const storageRef = ref(
            storage,
            `chat/${conversationId}/${messageId}/${file.name}`
        );
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);

        console.log('✅ Chat file uploaded:', downloadURL);
        return downloadURL;
    } catch (error: any) {
        console.error('❌ Chat file upload error:', error.message);
        throw error;
    }
}

/**
 * Delete a file from storage
 * @param path - Full path to the file in storage
 */
export async function deleteFile(path: string): Promise<void> {
    try {
        const storageRef = ref(storage, path);
        await deleteObject(storageRef);
        console.log('✅ File deleted:', path);
    } catch (error: any) {
        console.error('❌ File deletion error:', error.message);
        throw error;
    }
}

/**
 * Delete all task images
 * @param taskId - Task ID
 * @param imageCount - Number of images to delete
 */
export async function deleteTaskImages(taskId: string, imageCount: number): Promise<void> {
    const deletePromises = [];
    for (let i = 0; i < imageCount; i++) {
        deletePromises.push(deleteFile(`tasks/${taskId}/image_${i}.jpg`));
    }
    await Promise.all(deletePromises);
}
