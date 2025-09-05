
'use client';

import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  AuthError,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getFirestore, serverTimestamp, writeBatch } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useRouter } from '@/navigation';
import { z } from 'zod';

export const signUpSchema = z.object({
  name: z.string().min(2, "Le nom est requis"),
  email: z.string().email("Adresse e-mail invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

export const signInSchema = z.object({
  email: z.string().email("Adresse e-mail invalide"),
  password: z.string().min(1, "Le mot de passe est requis"),
});


export type SignUpFormValues = z.infer<typeof signUpSchema>;
export type SignInFormValues = z.infer<typeof signInSchema>;


interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  signIn: (data: SignInFormValues) => Promise<void>;
  signUp: (data: SignUpFormValues) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAuthError = (err: AuthError) => {
    switch (err.code) {
        case 'auth/user-not-found':
            return 'Aucun compte trouvé avec cet e-mail.';
        case 'auth/wrong-password':
            return 'Mot de passe incorrect.';
        case 'auth/email-already-in-use':
            return 'Cette adresse e-mail est déjà utilisée.';
        case 'auth/invalid-email':
            return 'Adresse e-mail invalide.';
        default:
            return 'Une erreur d\'authentification est survenue.';
    }
  }

  const signIn = async (data: SignInFormValues) => {
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      router.push('/dashboard');
    } catch (err) {
      setError(handleAuthError(err as AuthError));
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (data: SignUpFormValues) => {
    setLoading(true);
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;

      // Update Firebase Auth profile
      await updateProfile(user, { displayName: data.name });
      
      // Create user and profile documents in a batch
      const batch = writeBatch(db);

      const userDocRef = doc(db, 'users', user.uid);
      batch.set(userDocRef, {
        email: user.email,
        roles: ['client'],
        status: 'active',
        KYCStatus: 'not_required',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      const profileDocRef = doc(db, 'profiles', user.uid);
      batch.set(profileDocRef, {
        userId: user.uid,
        displayName: data.name,
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

      router.push('/dashboard');
    } catch (err) {
      setError(handleAuthError(err as AuthError));
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, setError, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
