
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
import { type Profile, UserRole, type User } from '@/lib/types';

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
  languages: z.union([z.string(), z.array(z.string())]).optional(),
  skills: z.union([z.string(), z.array(z.string())]).optional(),
});


export type SignUpFormValues = z.infer<typeof signUpSchema>;
export type SignInFormValues = z.infer<typeof signInSchema>;
export type ProfileFormValues = z.infer<typeof profileSchema>;


export interface AuthUser extends FirebaseUser, Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'profile'> {
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
  impersonatingUser: AuthUser | null;
  startImpersonation: (targetUser: any) => void;
  stopImpersonation: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [originalAdmin, setOriginalAdmin] = useState<AuthUser | null>(null);
  const router = useRouter();

  const impersonatingUser = originalAdmin ? user : null;

  const fetchUserData = async (firebaseUser: FirebaseUser) => {
    try {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const profileDocRef = doc(db, 'profiles', firebaseUser.uid);

        const userDoc = await getDoc(userDocRef);
        const profileDoc = await getDoc(profileDocRef);
        
        let userData = userDoc.exists() ? (userDoc.data() as User) : null;
        const profileData = profileDoc.exists() ? (profileDoc.data() as Profile) : null;
        
         if (userData && firebaseUser.email === 'nathan.imogo@outlook.fr' && !userData.roles.includes(UserRole.admin)) {
            userData.roles.push(UserRole.admin);
        }
        
        // Ensure user has provider role for testing purposes
        if (userData && !userData.roles.includes(UserRole.provider)) {
            userData.roles.push(UserRole.provider);
        }


        const authUser: AuthUser = {
            ...firebaseUser,
            ...(userData || { email: firebaseUser.email, roles: [], status: 'active', KYCStatus: 'not_required' }),
            profile: profileData,
        };

         if (authUser.email === 'nathan.imogo@outlook.fr' && !authUser.roles.includes(UserRole.admin)) {
            authUser.roles.push(UserRole.admin);
        }
        return authUser;
    } catch (err) {
        console.error("Failed to fetch user data:", err);
        setError("Impossible de récupérer les données utilisateur. Veuillez vérifier votre connexion.");
        return { 
            ...firebaseUser,
            email: firebaseUser.email!,
            roles: [], 
            status: 'active', 
            KYCStatus: 'not_required',
            profile: null 
        };
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (originalAdmin) return; // Don't do anything if we are impersonating

        setLoading(true);
        setProfileLoading(true);
        if (firebaseUser) {
            const fullUser = await fetchUserData(firebaseUser);
            setUser(fullUser);
        } else {
            setUser(null);
        }
        setLoading(false);
        setProfileLoading(false);
    });
    return () => unsubscribe();
  }, [originalAdmin]);

  const startImpersonation = (targetUser: any) => {
      if (user && user.roles.includes(UserRole.admin)) {
          setOriginalAdmin(user);
          // We need to create a complete AuthUser object for the target
           const impersonatedAuthUser: AuthUser = {
              uid: targetUser.id,
              email: targetUser.email,
              displayName: targetUser.displayName,
              photoURL: `https://i.pravatar.cc/150?u=${targetUser.id}`,
              roles: targetUser.roles,
              status: targetUser.status,
              KYCStatus: targetUser.kycStatus,
              profile: targetUser.profile,
              // Add mock Firebase User properties as they don't exist on the simple mock object
              providerData: user.providerData, 
              isAnonymous: false,
              tenantId: null,
              delete: async () => console.log("Delete called on impersonated user"),
              getIdToken: async () => 'mock-token',
              getIdTokenResult: async () => ({ token: 'mock-token' } as any),
              reload: async () => console.log("Reload called on impersonated user"),
              toJSON: () => ({ uid: targetUser.id, email: targetUser.email }),
          };
          setUser(impersonatedAuthUser);
      }
  }

  const stopImpersonation = () => {
      if (originalAdmin) {
          setUser(originalAdmin);
          setOriginalAdmin(null);
      }
  }


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
      // Special rule for the admin user for demo purposes
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
    if (originalAdmin) {
        stopImpersonation();
    }
    await firebaseSignOut(auth);
    setUser(null);
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, loading, profileLoading, error, setError, signIn, signUp, signOut, impersonatingUser, startImpersonation, stopImpersonation }}>
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
