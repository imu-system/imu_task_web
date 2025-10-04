// src/hooks/use-require-auth.ts
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Hook pour rediriger automatiquement vers la page de login
 * si l'utilisateur n'est pas authentifié
 * 
 * Usage dans un composant:
 * ```tsx
 * export default function ProtectedPage() {
 *   const { user, loading } = useRequireAuth();
 *   
 *   if (loading) return <LoadingSpinner />;
 *   
 *   return <div>Protected content for {user.email}</div>;
 * }
 * ```
 */
export function useRequireAuth(redirectTo: string = '/auth/login') {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            const currentPath = window.location.pathname;
            router.push(`${redirectTo}?returnUrl=${encodeURIComponent(currentPath)}`);
        }
    }, [user, loading, router, redirectTo]);

    return { user, loading };
}

/**
 * Hook pour vérifier si l'utilisateur a un rôle spécifique
 * 
 * Usage:
 * ```tsx
 * const hasAccess = useHasRole(['admin', 'provider']);
 * if (!hasAccess) return <AccessDenied />;
 * ```
 */
export function useHasRole(allowedRoles: string[]) {
    const { user } = useAuth();

    // TODO: Implémenter la logique de rôles depuis Firestore
    // Pour l'instant, on retourne true si l'utilisateur est connecté
    return !!user;
}

/**
 * Hook pour rediriger les utilisateurs authentifiés
 * Utile pour les pages de login/signup
 * 
 * Usage:
 * ```tsx
 * export default function LoginPage() {
 *   useRedirectIfAuthenticated('/dashboard');
 *   // ... reste du code
 * }
 * ```
 */
export function useRedirectIfAuthenticated(redirectTo: string = '/dashboard') {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && user) {
            router.push(redirectTo);
        }
    }, [user, loading, router, redirectTo]);

    return { user, loading };
}
