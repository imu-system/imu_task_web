/**
 * Messages Page
 * 
 * Page principale de messagerie avec liste des threads
 * Responsive: mobile (full screen thread list) et desktop (split view)
 * Updated: 28 Oct 2025
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { ThreadList } from '@/components/messaging/thread-list';
import { NewConversationButton } from '@/components/messaging/new-conversation-button';
import { NewConversationModal } from '@/components/messaging/new-conversation-modal';
import { NotificationBanner } from '@/components/messaging/notification-banner';
import { Skeleton } from '@/components/ui/skeleton';

export default function MessagesPage() {
  const t = useTranslations('messaging');
  const router = useRouter();
  const { user, loading: authLoading } = useRequireAuth();
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [isNewConversationOpen, setIsNewConversationOpen] = useState(false);
  const [showBanner, setShowBanner] = useState(true);

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
    <div className="h-full flex flex-col bg-[#F0F2F5] font-['Segoe_UI',_-apple-system,_system-ui,_'Helvetica_Neue',_sans-serif]" data-testid="messages-page">
      {/* Banner notification (optional, dismissible) */}
      {showBanner && (
        <NotificationBanner
          type="info"
          message="Vos conversations sont chiffrées de bout en bout pour votre sécurité"
          onDismiss={() => setShowBanner(false)}
        />
      )}

      {/* Mobile: Header avec retour - WhatsApp style */}
      <div className="md:hidden bg-[#00A884] text-white border-b border-[#00A884] px-4 py-3 flex items-center gap-3" data-testid="mobile-header">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-white hover:bg-white/10">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold">{t('title')}</h1>
        {/* Debug link (development only) */}
        {process.env.NODE_ENV === 'development' && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/dashboard/messages/debug')}
            className="ml-auto"
          >
            🐛 Debug
          </Button>
        )}
      </div>

      {/* Desktop + Mobile: Liste des threads */}
      <div className="flex-1 overflow-hidden relative bg-white md:bg-transparent md:max-w-[400px]">
        {/* Indicateur pour détection mobile dans les tests */}
        <div className="md:hidden" data-testid="mobile-view" />
        
        {/* Debug button (desktop, development only) */}
        {process.env.NODE_ENV === 'development' && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/dashboard/messages/debug')}
            className="hidden md:flex absolute top-4 right-4 z-10 gap-2"
          >
            🐛 Debug
          </Button>
        )}
        
        <ThreadList
          userId={user.uid}
          selectedThreadId={selectedThreadId}
          onSelectThread={handleSelectThread}
        />
      </div>

      {/* Desktop: Empty state pour sélection - WhatsApp style avec pattern */}
      <div className="hidden md:flex flex-col items-center justify-center h-full text-center absolute inset-y-0 right-0 left-[400px] pointer-events-none whatsapp-bg-pattern">
        <MessageSquare className="h-20 w-20 text-[#00A884]/30 mb-6" strokeWidth={1.5} />
        <h2 className="text-2xl font-light text-[#41525d]">{t('selectThread')}</h2>
        <p className="mt-3 text-sm text-[#667781] max-w-md">{t('selectThreadDescription')}</p>
      </div>

      {/* FAB: Nouvelle conversation */}
      <NewConversationButton onClick={() => setIsNewConversationOpen(true)} />

      {/* Modal: Sélection utilisateur */}
      <NewConversationModal
        open={isNewConversationOpen}
        onOpenChange={setIsNewConversationOpen}
        currentUserId={user.uid}
      />
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
