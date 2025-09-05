
'use client';

import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  AuthError,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, getFirestore, serverTimestamp, writeBatch } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useRouter } from '@/navigation';
import { z } from 'zod';
import { type Profile, UserRole } from '@/lib/types';

export const signUpSchema = z.object({
  name: z.string().min(2, "Le nom est requis"),
  email: z.string().email("Adresse e-mail invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

export const signInSchema = z.object({
  email: z.string().email("Adresse e-mail invalide"),
  password: z.string().min(1, "Le mot de passe est requis"),
});

export const profileSchema = z.object({
  displayName: z.string().min(2, "Le nom est requis."),
  bio: z.string().max(500, "La biographie ne peut pas dépasser 500 caractères.").optional(),
  languages: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),
});


export type SignUpFormValues = z.infer<typeof signUpSchema>;
export type SignInFormValues = z.infer<typeof signInSchema>;
export type ProfileFormValues = z.infer<typeof profileSchema>;


export interface AuthUser extends FirebaseUser {
    profile: Profile | null;
}


interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  profileLoading: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  signIn: (data: SignInFormValues) => Promise<void>;
  signUp: (data: SignUpFormValues) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        setLoading(true);
        setProfileLoading(true);
        if (firebaseUser) {
            try {
                const profileDocRef = doc(db, 'profiles', firebaseUser.uid);
                const profileDoc = await getDoc(profileDocRef);
                
                const authUser: AuthUser = {
                    ...firebaseUser,
                    profile: profileDoc.exists() ? (profileDoc.data() as Profile) : null
                };
                setUser(authUser);
            } catch (err) {
                console.error("Failed to fetch user profile:", err);
                // Set user without profile if firestore fails
                setUser({ ...firebaseUser, profile: null });
                setError("Impossible de récupérer le profil utilisateur. Veuillez vérifier votre connexion.");
            }
        } else {
            setUser(null);
        }
        setLoading(false);
        setProfileLoading(false);
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
      const firebaseUser = userCredential.user;

      // Update Firebase Auth profile
      await updateProfile(firebaseUser, { displayName: data.name });
      
      // Create user and profile documents in a batch
      const batch = writeBatch(db);

      const userDocRef = doc(db, 'users', firebaseUser.uid);
      
      const roles = [UserRole.client];
      if (firebaseUser.email === 'nathan.imogo@outlook.fr') {
          roles.push(UserRole.admin);
      }

      batch.set(userDocRef, {
        email: firebaseUser.email,
        roles: roles,
        status: 'active',
        KYCStatus: 'not_required',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      const profileDocRef = doc(db, 'profiles', firebaseUser.uid);
      batch.set(profileDocRef, {
        userId: firebaseUser.uid,
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
    setUser(null);
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, loading, profileLoading, error, setError, signIn, signUp, signOut }}>
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
