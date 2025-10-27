/**
 * Messages Page
 * 
 * Page principale de messagerie avec liste des threads
 * Responsive: mobile (full screen thread list) et desktop (split view)
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { ThreadList } from '@/components/messaging/thread-list';
import { Skeleton } from '@/components/ui/skeleton';

export default function MessagesPage() {
  const t = useTranslations('messaging');
  const router = useRouter();
  const { user, loading: authLoading } = useRequireAuth();
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);

  // Redirect vers le thread sélectionné
  const handleSelectThread = (threadId: string) => {
    setSelectedThreadId(threadId);
    router.push(`/dashboard/messages/${threadId}`);
  };

  // Loading state
  if (authLoading) {
    return <MessagesPageSkeleton />;
  }

  // Not authenticated (shouldn't happen with useRequireAuth)
  if (!user) {
    return null;
  }

  return (
    <div className="h-full flex flex-col">
      {/* Mobile: Header avec retour */}
      <div className="md:hidden border-b p-4 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold">{t('title')}</h1>
      </div>

      {/* Desktop + Mobile: Liste des threads */}
      <div className="flex-1 overflow-hidden">
        <ThreadList
          userId={user.uid}
          selectedThreadId={selectedThreadId}
          onSelectThread={handleSelectThread}
        />
      </div>

      {/* Desktop: Empty state pour sélection */}
      <div className="hidden md:flex flex-col items-center justify-center h-full text-center bg-muted/50 absolute inset-y-0 right-0 left-[400px] pointer-events-none">
        <MessageSquare className="h-16 w-16 text-muted-foreground" />
        <h2 className="mt-4 text-xl font-semibold">{t('selectThread')}</h2>
        <p className="mt-2 text-muted-foreground">{t('selectThreadDescription')}</p>
      </div>
    </div>
  );
}

// ============================================================================
// Loading Skeleton
// ============================================================================

function MessagesPageSkeleton() {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b space-y-3">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="flex-1 p-4 space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
