// src/contexts/AuthContext.tsx
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { UserRole, Profile } from '@/lib/types';
import { createUserDocument, getUserDocument, getAccountType } from '@/lib/firestore-users';
import { setAccountTypeCookie, clearAccountTypeCookie } from '@/lib/account-type-cookie';

// Extended Firebase User type with custom properties
// Note: This is different from AppUser in lib/types.ts which is based on Firestore User
export interface AppUser extends FirebaseUser {
  roles?: UserRole[];
  kycStatus?: 'pending' | 'approved' | 'rejected';
  phone?: string;
  profile?: Profile;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (data: { displayName?: string; photoURL?: string }) => Promise<void>;
  startImpersonation?: (userId: string) => Promise<void>;
  stopImpersonation?: () => void;
  impersonatingUser?: AppUser | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Fetch user data from Firestore
          const userDoc = await getUserDocument(firebaseUser.uid);
          
          if (userDoc) {
            // User document exists, use Firestore data
            const appUser: AppUser = {
              ...firebaseUser,
              roles: userDoc.roles,
              profile: {
                displayName: userDoc.profile.displayName || firebaseUser.displayName || undefined,
                photoUrl: userDoc.profile.photoUrl || firebaseUser.photoURL || undefined,
              },
            };
            setUser(appUser);
            console.log('✅ User loaded from Firestore with roles:', userDoc.roles);
          } else {
            // User document doesn't exist yet (shouldn't happen after signup)
            // Create it with default values
            console.warn('⚠️ User document missing, creating with defaults');
            await createUserDocument(
              firebaseUser.uid,
              firebaseUser.email || '',
              firebaseUser.displayName || undefined
            );
            
            const appUser: AppUser = {
              ...firebaseUser,
              roles: [UserRole.client],
              profile: {
                displayName: firebaseUser.displayName || undefined,
                photoUrl: firebaseUser.photoURL || undefined,
              },
            };
            setUser(appUser);
          }
        } catch (error) {
          console.error('❌ Error loading user data from Firestore:', error);
          // Si erreur de permissions, déconnecter l'utilisateur
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
      
      // Gérer le cookie d'authentification pour le middleware
      if (firebaseUser) {
        // Créer un cookie pour indiquer l'état d'authentification
        document.cookie = `firebaseAuth=true; path=/; max-age=2592000; SameSite=Lax`;
        
        // Charger et set le cookie accountType
        try {
          const accountType = await getAccountType(firebaseUser.uid);
          if (accountType) {
            setAccountTypeCookie(accountType);
          }
        } catch (error) {
          console.error('❌ Error loading accountType for cookie:', error);
        }
      } else {
        // Supprimer les cookies si l'utilisateur se déconnecte
        document.cookie = 'firebaseAuth=; path=/; max-age=0';
        clearAccountTypeCookie();
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.log('🔐 Auth state changed:', firebaseUser ? `User: ${firebaseUser.email}` : 'No user');
      }
    });

    return unsubscribe;
  }, []);

  const signUp = async (email: string, password: string, displayName?: string) => {
    console.log('🔑 AuthContext.signUp appelé avec:', { email, displayName });
    try {
      console.log('📝 Création utilisateur Firebase Auth...');
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('✅ Utilisateur Firebase créé:', userCredential.user.uid);
      
      // Update Firebase Auth profile with display name if provided
      if (displayName && userCredential.user) {
        console.log('👤 Mise à jour du profil avec displayName...');
        await updateProfile(userCredential.user, { displayName });
      }
      
      // Create Firestore user document
      console.log('💾 Création du document Firestore...');
      await createUserDocument(
        userCredential.user.uid,
        userCredential.user.email || email,
        displayName
      );
      
      console.log('✅ User created:', userCredential.user.email);
    } catch (error: any) {
      console.error('❌ Sign up error:', error.message);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ User signed in:', userCredential.user.email);
    } catch (error: any) {
      console.error('❌ Sign in error:', error.message);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      const userCredential = await signInWithPopup(auth, provider);
      
      // Check if user document exists, create if not
      const userDoc = await getUserDocument(userCredential.user.uid);
      if (!userDoc) {
        await createUserDocument(
          userCredential.user.uid,
          userCredential.user.email || '',
          userCredential.user.displayName || undefined
        );
        console.log('✅ New Google user document created');
      }
      
      console.log('✅ User signed in with Google:', userCredential.user.email);
    } catch (error: any) {
      console.error('❌ Google sign in error:', error.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      console.log('✅ User signed out');
    } catch (error: any) {
      console.error('❌ Sign out error:', error.message);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      console.log('✅ Password reset email sent to:', email);
    } catch (error: any) {
      console.error('❌ Password reset error:', error.message);
      throw error;
    }
  };

  const updateUserProfile = async (data: { displayName?: string; photoURL?: string }) => {
    if (!user) {
      throw new Error('No user logged in');
    }
    
    try {
      await updateProfile(user, data);
      console.log('✅ User profile updated');
    } catch (error: any) {
      console.error('❌ Update profile error:', error.message);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    logout,
    signOut: logout, // alias for compatibility
    resetPassword,
    updateUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
