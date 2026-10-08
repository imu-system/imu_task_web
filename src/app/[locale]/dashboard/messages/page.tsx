/**
 * Messages Page
 * 
 * Page principale de messagerie avec liste des threads
 * Responsive: mobile (full screen thread list) et desktop (split view)
 * Updated: 28 Oct 2025
 */

'use client';

import { useRouter } from '@/navigation';
import { useState, useEffect } from 'react';

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
    <div className="h-full flex bg-[#F0F2F5] font-['Segoe_UI',_-apple-system,_system-ui,_'Helvetica_Neue',_sans-serif]" data-testid="messages-page">
      {/* Mobile: Header avec retour - WhatsApp style */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-[#00A884] text-white border-b border-[#00896f] px-4 py-3 flex items-center gap-3 z-50 shadow-sm" data-testid="mobile-header">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-white hover:bg-white/10 -ml-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold flex-1">{t('title')}</h1>
        {/* Debug link (development only) */}
        {process.env.NODE_ENV === 'development' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/dashboard/messages/debug')}
            className="text-white hover:bg-white/10 text-xs"
          >
            🐛
          </Button>
        )}
      </div>

      {/* Left Panel: Liste des threads - WhatsApp style */}
      <div className="flex flex-col w-full md:w-[420px] md:border-r border-border/30 bg-white md:mt-0 mt-14 relative">
        {/* Desktop Header - WhatsApp green */}
        <div className="hidden md:flex items-center justify-between px-4 py-3 bg-[#00A884] text-white border-b border-[#00896f]">
          <div className="flex items-center gap-3">
            {user?.photoURL ? (
              <img 
                src={user.photoURL} 
                alt={user.displayName || ''} 
                className="w-10 h-10 rounded-full ring-2 ring-white/20"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-lg font-semibold">
                {user?.displayName?.[0]?.toUpperCase() || '?'}
              </div>
            )}
            <h1 className="text-lg font-semibold">{t('title')}</h1>
          </div>
          
          <div className="flex items-center gap-1">
            {process.env.NODE_ENV === 'development' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard/messages/debug')}
                className="text-white hover:bg-white/10 text-xs h-8 px-2"
              >
                🐛
              </Button>
            )}
          </div>
        </div>

        {/* Banner notification (optional, dismissible) */}
        {showBanner && (
          <NotificationBanner
            type="info"
            message={t('encryptionInfo') || "Vos conversations sont chiffrées de bout en bout"}
            onDismiss={() => setShowBanner(false)}
          />
        )}
        
        {/* Thread List */}
        <div className="flex-1 overflow-hidden">
          <ThreadList
            userId={user.uid}
            selectedThreadId={selectedThreadId}
            onSelectThread={handleSelectThread}
            onNewThread={() => setIsNewConversationOpen(true)}
          />
        </div>
      </div>

      {/* Right Panel: Desktop Empty state - WhatsApp style avec pattern */}
      <div className="hidden md:flex flex-1 flex-col items-center justify-center text-center bg-[#f8f9fa] border-l border-border/10 relative overflow-hidden">
        {/* Subtle pattern background */}
        <div className="absolute inset-0 empty-state-pattern" />
        
        <div className="relative z-10 max-w-md px-8">
          <div className="w-48 h-48 mx-auto mb-8 rounded-full bg-gradient-to-br from-[#00A884]/10 to-[#00A884]/5 flex items-center justify-center">
            <MessageSquare className="h-24 w-24 text-[#00A884]/40" strokeWidth={1.2} />
          </div>
          
          <h2 className="text-3xl font-light text-[#41525d] mb-4">
            {t('selectThread')}
          </h2>
          <p className="text-base text-[#667781] leading-relaxed mb-8">
            {t('selectThreadDescription')}
          </p>
          
          {/* CTA Button */}
          <Button
            onClick={() => setIsNewConversationOpen(true)}
            className="bg-[#00A884] hover:bg-[#00896f] text-white shadow-lg shadow-[#00A884]/20 px-8 py-6 text-base rounded-full transition-all hover:shadow-xl hover:shadow-[#00A884]/30 hover:scale-105"
          >
            <MessageSquare className="mr-2 h-5 w-5" />
            {t('newConversation') || 'Nouvelle conversation'}
          </Button>
        </div>
      </div>

      {/* FAB: Nouvelle conversation (Mobile) */}
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
