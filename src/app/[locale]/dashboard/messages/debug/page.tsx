'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Database, MessageSquare, Users, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { createTestThread, createMultipleTestThreads, checkMessagingData } from '@/lib/test-data-messaging';
import { useUserThreads } from '@/hooks/use-messaging';
import { Skeleton } from '@/components/ui/skeleton';
import { ThreadStatus } from '@/lib/types';

/**
 * Page de debug pour la messagerie
 * Route: /dashboard/messages/debug
 * 
 * Permet de :
 * - Vérifier l'état de la base de données
 * - Créer des threads de test
 * - Diagnostiquer les problèmes de chargement
 */
export default function MessagingDebugPage() {
  const t = useTranslations();
  const { user, loading: authLoading } = useRequireAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [dbStats, setDbStats] = useState<{ threadsCount: number; messagesCount: number } | null>(null);

  // Hook de messagerie pour tester - DÉSACTIVÉ en real-time pour éviter les erreurs
  const {
    data: threads = [],
    isLoading: isLoadingThreads,
    error: threadsError,
  } = useUserThreads(user?.uid || '', { 
    status: ThreadStatus.active
  });

  // Vérifier l'état de la DB au chargement
  useEffect(() => {
    if (user) {
      checkMessagingData()
        .then(setDbStats)
        .catch(console.error);
    }
  }, [user]);

  const handleCreateSingleThread = async () => {
    if (!user) return;

    setIsCreating(true);
    setStatus('idle');
    setMessage('');

    try {
      const threadId = await createTestThread(
        user.uid,
        'test-user-demo',
        { withMessages: true }
      );
      
      setStatus('success');
      setMessage(`Thread créé avec succès ! ID: ${threadId}`);
      
      // Rafraîchir les stats
      const stats = await checkMessagingData();
      setDbStats(stats);
    } catch (error) {
      setStatus('error');
      setMessage(`Erreur: ${error instanceof Error ? error.message : 'Inconnue'}`);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateMultipleThreads = async () => {
    if (!user) return;

    setIsCreating(true);
    setStatus('idle');
    setMessage('');

    try {
      await createMultipleTestThreads(user.uid);
      
      setStatus('success');
      setMessage('4 threads de test créés avec succès !');
      
      // Rafraîchir les stats
      const stats = await checkMessagingData();
      setDbStats(stats);
    } catch (error) {
      setStatus('error');
      setMessage(`Erreur: ${error instanceof Error ? error.message : 'Inconnue'}`);
    } finally {
      setIsCreating(false);
    }
  };

  const handleRefreshStats = async () => {
    try {
      const stats = await checkMessagingData();
      setDbStats(stats);
      setStatus('success');
      setMessage('Statistiques rafraîchies');
    } catch (error) {
      setStatus('error');
      setMessage(`Erreur: ${error instanceof Error ? error.message : 'Inconnue'}`);
    }
  };

  // Loading state
  if (authLoading) {
    return <DebugPageSkeleton />;
  }

  // Not authenticated (shouldn't happen with useRequireAuth)
  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Debug Messagerie</h1>
        <p className="text-muted-foreground">
          Diagnostiquer et tester le système de messagerie
        </p>
      </div>

      {/* Alerte si aucun thread */}
      {dbStats?.threadsCount === 0 && (
        <Alert className="border-orange-500 bg-orange-50">
          <AlertDescription className="text-sm">
            <strong>⚠️ Aucun thread trouvé !</strong>
            <br />
            La collection "threads" est vide ou n'existe pas encore. 
            Cliquez sur "Créer 4 threads de test" ci-dessous pour initialiser la messagerie.
          </AlertDescription>
        </Alert>
      )}

      {/* État de la base de données */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            État de la base de données
          </CardTitle>
          <CardDescription>
            Statistiques en temps réel des collections Firestore
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {dbStats?.threadsCount ?? '...'}
              </div>
              <div className="text-sm text-muted-foreground">Threads</div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {dbStats?.messagesCount ?? '...'}
              </div>
              <div className="text-sm text-muted-foreground">Messages</div>
            </div>
          </div>

          <Button
            onClick={handleRefreshStats}
            variant="outline"
            className="w-full"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Rafraîchir les statistiques
          </Button>
        </CardContent>
      </Card>

      {/* État du hook useUserThreads */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Hook useUserThreads
          </CardTitle>
          <CardDescription>
            État du hook React Query pour les threads de l'utilisateur
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 border rounded">
              <span className="text-sm font-medium">isLoading:</span>
              <span className="text-sm">
                {isLoadingThreads ? (
                  <span className="flex items-center gap-2 text-orange-600">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    true
                  </span>
                ) : (
                  <span className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    false
                  </span>
                )}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 border rounded">
              <span className="text-sm font-medium">Threads chargés:</span>
              <span className="text-sm font-bold">{threads.length}</span>
            </div>

            <div className="flex items-center justify-between p-3 border rounded">
              <span className="text-sm font-medium">Erreur:</span>
              <span className="text-sm">
                {threadsError ? (
                  <span className="flex items-center gap-2 text-red-600">
                    <XCircle className="h-4 w-4" />
                    {String(threadsError)}
                  </span>
                ) : (
                  <span className="text-muted-foreground">Aucune</span>
                )}
              </span>
            </div>
          </div>

          {threads.length > 0 && (
            <div className="p-3 border rounded bg-muted/50">
              <div className="text-sm font-medium mb-2">Premiers threads:</div>
              <ul className="text-sm space-y-1">
                {threads.slice(0, 3).map((thread) => (
                  <li key={thread.id} className="truncate">
                    • {thread.id} - {typeof thread.lastMessage === 'string' ? thread.lastMessage : thread.lastMessage?.content || 'Pas de message'}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions de test */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Créer des données de test
          </CardTitle>
          <CardDescription>
            Générer des threads et messages pour tester l'interface
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleCreateSingleThread}
            disabled={isCreating}
            className="w-full"
          >
            {isCreating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Création en cours...
              </>
            ) : (
              <>
                <MessageSquare className="h-4 w-4 mr-2" />
                Créer 1 thread de test
              </>
            )}
          </Button>

          <Button
            onClick={handleCreateMultipleThreads}
            disabled={isCreating}
            variant="secondary"
            className="w-full"
          >
            {isCreating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Création en cours...
              </>
            ) : (
              <>
                <Users className="h-4 w-4 mr-2" />
                Créer 4 threads de test
              </>
            )}
          </Button>

          {status !== 'idle' && (
            <Alert variant={status === 'success' ? 'default' : 'destructive'}>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Informations utilisateur */}
      <Card>
        <CardHeader>
          <CardTitle>Utilisateur actuel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div><strong>UID:</strong> {user.uid}</div>
            <div><strong>Email:</strong> {user.email}</div>
            <div><strong>Nom:</strong> {user.displayName || 'Non défini'}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// Loading Skeleton
// ============================================================================

function DebugPageSkeleton() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <Skeleton className="h-9 w-64 mb-2" />
        <Skeleton className="h-5 w-96" />
      </div>

      {/* État de la base de données */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="p-4 border rounded-lg">
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>

      {/* Hook state */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
