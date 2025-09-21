

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
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth';
import { doc, setDoc, getDoc, getFirestore, serverTimestamp, writeBatch } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useRouter } from '@/navigation';
import { z } from 'zod';
import { type Profile, UserRole, type User, UserStatus, KYCStatus } from '@/lib/types';

export const signUpSchema = z.object({
  name: z.string().min(2, "Le nom est requis"),
  email: z.string().email("Adresse e-mail invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  referralCode: z.string().optional(),
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
  serviceRadiusKm: z.coerce.number().min(0, "Le rayon doit être positif.").optional(),
});


export type SignUpFormValues = z.infer<typeof signUpSchema>;
export type SignInFormValues = z.infer<typeof signInSchema>;
export type ProfileFormValues = z.infer<typeof profileSchema>;


export interface AuthUser extends FirebaseUser {
    roles: UserRole[];
    status: UserStatus;
    KYCStatus: KYCStatus;
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
  signInWithGoogle: () => Promise<void>;
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

  useEffect(() => {
    function setTheme(theme: string){
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('imu_theme', theme);
    }
    const saved = localStorage.getItem('imu_theme');
    if(saved) {
        setTheme(saved);
    } else if(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches){
        setTheme('dark');
    } else {
        setTheme('light');
    }
  }, []);

  const fetchUserData = async (firebaseUser: FirebaseUser) => {
    try {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const profileDocRef = doc(db, 'profiles', firebaseUser.uid);

        const userDoc = await getDoc(userDocRef);
        const profileDoc = await getDoc(profileDocRef);
        
        let userData = userDoc.exists() ? (userDoc.data() as User) : null;
        let profileData = profileDoc.exists() ? (profileDoc.data() as Profile) : null;
        
        // If the user doc doesn't exist, it's a first-time sign-in (e.g., via Google)
        if (!userDoc.exists()) {
             const batch = writeBatch(db);

            const newUserDocData = {
                email: firebaseUser.email,
                roles: [UserRole.client],
                status: 'active',
                KYCStatus: 'not_required',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            };
            batch.set(userDocRef, newUserDocData);
            
            userData = {
              id: firebaseUser.uid,
              ...newUserDocData
            } as unknown as User;

            const newProfileDoc = {
                userId: firebaseUser.uid,
                displayName: firebaseUser.displayName || 'Utilisateur',
                photoUrl: firebaseUser.photoURL || '',
                bio: '',
                languages: ['fr'],
                averageRating: 0,
                reviewsCount: 0,
                skills: [],
                verifiedBadges: [],
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            };
            batch.set(profileDocRef, newProfileDoc);
            profileData = newProfileDoc as unknown as Profile;

            await batch.commit();
        }
        
         if (userData && firebaseUser.email === 'nathan.imogo@outlook.fr' && !userData.roles.includes(UserRole.admin)) {
            userData.roles.push(UserRole.admin);
        }
        
        // Ensure user has provider role for testing purposes
        if (userData && !userData.roles.includes(UserRole.provider)) {
            userData.roles.push(UserRole.provider);
        }


        const authUser: AuthUser = {
            ...firebaseUser,
            roles: userData?.roles || [],
            status: userData?.status || UserStatus.active,
            KYCStatus: userData?.KYCStatus || KYCStatus.not_required,
            profile: profileData,
        };

         if (authUser.email === 'nathan.imogo@outlook.fr' && !authUser.roles.includes(UserRole.admin)) {
            authUser.roles.push(UserRole.admin);
        }
        return authUser;
    } catch (err) {
        console.error("Failed to fetch/create user data:", err);
        setError("Impossible de récupérer les données utilisateur. Veuillez vérifier votre connexion.");
        return { 
            ...firebaseUser,
            roles: [], 
            status: UserStatus.active, 
            KYCStatus: KYCStatus.not_required,
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
              ...user, // Start with admin's firebase user object to have all methods
              uid: targetUser.id,
              email: targetUser.email,
              displayName: targetUser.displayName,
              photoURL: `https://i.pravatar.cc/150?u=${'targetUser.id'}`,
              roles: targetUser.roles,
              status: targetUser.status,
              KYCStatus: targetUser.kycStatus,
              profile: targetUser.profile,
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
        case 'auth/popup-closed-by-user':
            return 'La fenêtre de connexion a été fermée.';
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

  const signInWithGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
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
    <AuthContext.Provider value={{ user, loading, profileLoading, error, setError, signIn, signUp, signInWithGoogle, signOut, impersonatingUser, startImpersonation, stopImpersonation }}>
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
