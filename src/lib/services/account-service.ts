/**
 * Account Service - Firebase Auth & Firestore operations for user account management
 */

import {
  updateEmail as firebaseUpdateEmail,
  updatePassword as firebaseUpdatePassword,
  updateProfile,
  reauthenticateWithCredential,
  EmailAuthProvider,
  deleteUser as firebaseDeleteUser,
} from 'firebase/auth';
import { doc, updateDoc, getDoc, deleteDoc, collection, getDocs, writeBatch } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { auth, db, storage } from '@/lib/firebase';

export interface UpdateProfileData {
  displayName?: string;
  email?: string;
  phone?: string;
  photoURL?: string;
  bio?: string;
  location?: string;
}

/**
 * Update user profile (Auth + Firestore)
 */
export async function updateUserProfile(userId: string, data: UpdateProfileData): Promise<void> {
  const user = auth.currentUser;
  if (!user || user.uid !== userId) {
    throw new Error('User not authenticated');
  }

  // Update Firebase Auth profile
  if (data.displayName !== undefined || data.photoURL !== undefined) {
    await updateProfile(user, {
      displayName: data.displayName ?? user.displayName,
      photoURL: data.photoURL ?? user.photoURL,
    });
  }

  // Update email (requires reauthentication)
  if (data.email && data.email !== user.email) {
    // Email update will be handled separately with reauthentication
    // This is just the Firestore update
  }

  // Update Firestore document
  const userRef = doc(db, 'users', userId);
  const firestoreData: Record<string, any> = {
    updatedAt: new Date().toISOString(),
  };

  if (data.displayName !== undefined) firestoreData.displayName = data.displayName;
  if (data.email !== undefined) firestoreData.email = data.email;
  if (data.phone !== undefined) firestoreData.phone = data.phone;
  if (data.photoURL !== undefined) firestoreData.photoURL = data.photoURL;
  if (data.bio !== undefined) firestoreData.bio = data.bio;
  if (data.location !== undefined) firestoreData.location = data.location;

  await updateDoc(userRef, firestoreData);
}

/**
 * Update user email (requires current password for reauthentication)
 */
export async function updateUserEmail(newEmail: string, currentPassword: string): Promise<void> {
  const user = auth.currentUser;
  if (!user || !user.email) {
    throw new Error('User not authenticated');
  }

  // Reauthenticate user
  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);

  // Update email in Auth
  await firebaseUpdateEmail(user, newEmail);

  // Update email in Firestore
  const userRef = doc(db, 'users', user.uid);
  await updateDoc(userRef, {
    email: newEmail,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Update user password (requires current password for reauthentication)
 */
export async function updateUserPassword(currentPassword: string, newPassword: string): Promise<void> {
  const user = auth.currentUser;
  if (!user || !user.email) {
    throw new Error('User not authenticated');
  }

  // Reauthenticate user
  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);

  // Update password
  await firebaseUpdatePassword(user, newPassword);
}

/**
 * Upload profile photo to Firebase Storage
 */
export async function uploadProfilePhoto(userId: string, file: File): Promise<string> {
  const user = auth.currentUser;
  if (!user || user.uid !== userId) {
    throw new Error('User not authenticated');
  }

  // Validate file type and size
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.');
  }

  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error('File size exceeds 5MB limit.');
  }

  // Delete old photo if exists
  if (user.photoURL) {
    try {
      const oldPhotoRef = ref(storage, user.photoURL);
      await deleteObject(oldPhotoRef);
    } catch (err) {
      console.warn('Failed to delete old photo:', err);
    }
  }

  // Upload new photo
  const photoRef = ref(storage, `profile-photos/${userId}/${Date.now()}_${file.name}`);
  await uploadBytes(photoRef, file);
  const photoURL = await getDownloadURL(photoRef);

  // Update profile with new photo URL
  await updateUserProfile(userId, { photoURL });

  return photoURL;
}

/**
 * Delete user account (cascade delete all user data)
 */
export async function deleteUserAccount(userId: string, password: string): Promise<void> {
  const user = auth.currentUser;
  if (!user || user.uid !== userId || !user.email) {
    throw new Error('User not authenticated');
  }

  // Reauthenticate user
  const credential = EmailAuthProvider.credential(user.email, password);
  await reauthenticateWithCredential(user, credential);

  // Delete all user data from Firestore (cascade)
  const batch = writeBatch(db);

  // Delete user document
  batch.delete(doc(db, 'users', userId));

  // Delete user's tasks
  const tasksSnapshot = await getDocs(collection(db, 'tasks'));
  tasksSnapshot.docs
    .filter((taskDoc) => taskDoc.data().userId === userId)
    .forEach((taskDoc) => batch.delete(taskDoc.ref));

  // Delete user's proposals
  const proposalsSnapshot = await getDocs(collection(db, 'proposals'));
  proposalsSnapshot.docs
    .filter((proposalDoc) => proposalDoc.data().providerId === userId)
    .forEach((proposalDoc) => batch.delete(proposalDoc.ref));

  // Delete user's bookings
  const bookingsSnapshot = await getDocs(collection(db, 'bookings'));
  bookingsSnapshot.docs
    .filter((bookingDoc) => {
      const data = bookingDoc.data();
      return data.clientId === userId || data.providerId === userId;
    })
    .forEach((bookingDoc) => batch.delete(bookingDoc.ref));

  // Delete user's messages
  const messagesSnapshot = await getDocs(collection(db, 'messages'));
  messagesSnapshot.docs
    .filter((messageDoc) => {
      const data = messageDoc.data();
      return data.senderId === userId || data.receiverId === userId;
    })
    .forEach((messageDoc) => batch.delete(messageDoc.ref));

  // Commit batch delete
  await batch.commit();

  // Delete profile photo from Storage
  if (user.photoURL) {
    try {
      const photoRef = ref(storage, user.photoURL);
      await deleteObject(photoRef);
    } catch (err) {
      console.warn('Failed to delete profile photo:', err);
    }
  }

  // Finally, delete Auth user
  await firebaseDeleteUser(user);
}
