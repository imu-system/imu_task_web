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
import { UserRole } from '@/lib/types';

// Extended User type with custom properties
export interface AppUser extends FirebaseUser {
  roles?: UserRole[];
  profile?: {
    displayName?: string;
    photoUrl?: string;
  };
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (data: { displayName?: string; photoURL?: string }) => Promise<void>;
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
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Extend the Firebase user with custom properties
        // TODO: Fetch user roles and profile from Firestore
        const appUser: AppUser = {
          ...firebaseUser,
          roles: [UserRole.client], // Default role, should be fetched from Firestore
          profile: {
            displayName: firebaseUser.displayName || undefined,
            photoUrl: firebaseUser.photoURL || undefined,
          },
        };
        setUser(appUser);
      } else {
        setUser(null);
      }
      setLoading(false);
      
      // Gérer le cookie d'authentification pour le middleware
      if (firebaseUser) {
        // Créer un cookie pour indiquer l'état d'authentification
        document.cookie = `firebaseAuth=true; path=/; max-age=2592000; SameSite=Lax`;
      } else {
        // Supprimer le cookie si l'utilisateur se déconnecte
        document.cookie = 'firebaseAuth=; path=/; max-age=0';
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.log('🔐 Auth state changed:', firebaseUser ? `User: ${firebaseUser.email}` : 'No user');
      }
    });

    return unsubscribe;
  }, []);

  const signUp = async (email: string, password: string, displayName?: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with display name if provided
      if (displayName && userCredential.user) {
        await updateProfile(userCredential.user, { displayName });
      }
      
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
    resetPassword,
    updateUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
