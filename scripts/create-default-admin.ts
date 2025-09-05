import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, serverTimestamp, setDoc, writeBatch } from 'firebase/firestore';
import { auth, db } from '../src/lib/firebase';
import { UserRole } from '../src/lib/types';

async function ensureAdmin() {
  const email = 'nathan.imogo@outlook.fr';
  const password = 'Nath@1800';
  const displayName = 'Nathan Imogo';

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName });
    const batch = writeBatch(db);
    const userDoc = doc(db, 'users', cred.user.uid);
    batch.set(userDoc, {
      email,
      roles: [UserRole.client, UserRole.admin],
      status: 'active',
      KYCStatus: 'not_required',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    const profileDoc = doc(db, 'profiles', cred.user.uid);
    batch.set(profileDoc, {
      userId: cred.user.uid,
      displayName,
      photoUrl: '',
      bio: '',
      languages: ['fr'],
      averageRating: 0,
      reviewsCount: 0,
      skills: [],
      verifiedBadges: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    await batch.commit();
    console.log('Default admin user created');
  } catch (err: any) {
    if (err.code === 'auth/email-already-in-use') {
      console.log('Admin user already exists, signing in to confirm');
      await signInWithEmailAndPassword(auth, email, password);
      console.log('Sign-in successful');
    } else {
      console.error('Failed to create admin user:', err);
      process.exit(1);
    }
  }
}

ensureAdmin();
