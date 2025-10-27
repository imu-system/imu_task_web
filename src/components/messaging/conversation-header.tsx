'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ArrowLeft, Phone, Video, Search, MoreVertical, MessageSquare, Pin, BellOff, Palette, AlertTriangle, Ban, Flag, Archive } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { Thread } from '@/lib/types';
import { useArchiveThread } from '@/hooks/use-messaging';
import Link from 'next/link';

interface ConversationHeaderProps {
  thread: Thread;
  currentUserId: string;
  locale?: string;
}

export function ConversationHeader({ thread, currentUserId, locale = 'fr' }: ConversationHeaderProps) {
  const t = useTranslations('messaging');
  const router = useRouter();
  const [showContactInfo, setShowContactInfo] = useState(false);
  const archiveMutation = useArchiveThread();

  // Get other participant
  const otherParticipantId = thread.participants.find(id => id !== currentUserId);
  const otherParticipant = otherParticipantId && thread.participantsData 
    ? thread.participantsData[otherParticipantId] 
    : null;

  // Format last seen
  const getActivityStatus = () => {
    if (!otherParticipant) return null;
    // TODO: Add lastSeen field to participant data type
    const lastSeen = (otherParticipant as any).lastSeen;
    if (!lastSeen) return null;
    
    const lastSeenDate = typeof lastSeen === 'string' 
      ? new Date(lastSeen) 
      : lastSeen;
    
    const minutesAgo = Math.floor((Date.now() - lastSeenDate.getTime()) / 60000);
    
    if (minutesAgo < 5) {
      return <span className="text-green-500 flex items-center gap-1">
        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        {t('online')}
      </span>;
    }
    
    return `${t('activeAgo')} ${formatDistanceToNow(lastSeenDate, { 
      locale: locale === 'fr' ? fr : enUS,
      addSuffix: false 
    })}`;
  };

  // Check if user is typing
  const isTyping = thread.typingUsers?.includes(otherParticipantId || '');

  // Get initials
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleArchive = async () => {
    await archiveMutation.mutateAsync(thread.id);
    router.push('/dashboard/messages');
  };

  return (
    <>
      <div className="sticky top-0 z-10 bg-gradient-to-r from-[#075E54] to-[#128C7E] dark:from-[#1F2C33] dark:to-[#1F2C33] text-white shadow-md backdrop-blur-sm">
        <div className="flex items-center gap-3 px-4 py-3 h-16">
          {/* Back button (mobile) */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-white hover:bg-white/10"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          {/* Avatar & Info */}
          <button
            onClick={() => setShowContactInfo(true)}
            className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-80 transition-opacity"
          >
            <Avatar className="w-10 h-10 ring-2 ring-white/20">
              <AvatarImage src={otherParticipant?.photoUrl} />
              <AvatarFallback className="bg-primary/20 text-white">
                {otherParticipant?.displayName ? getInitials(otherParticipant.displayName) : '?'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-white truncate">
                  {otherParticipant?.displayName || t('unknownUser')}
                </h2>
                {(otherParticipant as any)?.isPro && (
                  <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-300 text-xs">
                    PRO
                  </Badge>
                )}
              </div>
              
              <p className="text-xs text-white/70">
                {isTyping ? (
                  <span className="text-green-300 italic flex items-center gap-1">
                    {t('typing')}
                    <span className="flex gap-0.5">
                      <span className="w-1 h-1 bg-green-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1 h-1 bg-green-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1 h-1 bg-green-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </span>
                  </span>
                ) : getActivityStatus()}
              </p>
              
              {thread.taskTitle && (
                <Link 
                  href={`/dashboard/tasks/${thread.taskId}`}
                  className="text-xs text-white/60 hover:text-white hover:underline flex items-center gap-1 mt-0.5"
                >
                  <MessageSquare className="w-3 h-3" />
                  {thread.taskTitle}
                </Link>
              )}
            </div>
          </button>

          {/* Action buttons */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10 hidden sm:flex"
              title={t('call')}
            >
              <Phone className="w-5 h-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10 hidden sm:flex"
              title={t('videoCall')}
            >
              <Video className="w-5 h-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10 hidden md:flex"
              title={t('search')}
            >
              <Search className="w-5 h-5" />
            </Button>

            {/* More actions menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/10"
                >
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {thread.taskId && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/tasks/${thread.taskId}`}>
                        <MessageSquare className="w-4 h-4 mr-2" />
                        {t('viewTask')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                
                <DropdownMenuItem>
                  <Pin className="w-4 h-4 mr-2" />
                  {t('pinConversation')}
                </DropdownMenuItem>
                
                <DropdownMenuItem>
                  <BellOff className="w-4 h-4 mr-2" />
                  {t('muteNotifications')}
                </DropdownMenuItem>
                
                <DropdownMenuItem>
                  <Palette className="w-4 h-4 mr-2" />
                  {t('customize')}
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem className="text-orange-600">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  {t('openDispute')}
                </DropdownMenuItem>
                
                <DropdownMenuItem className="text-red-600">
                  <Ban className="w-4 h-4 mr-2" />
                  {t('blockUser')}
                </DropdownMenuItem>
                
                <DropdownMenuItem className="text-red-600">
                  <Flag className="w-4 h-4 mr-2" />
                  {t('reportUser')}
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={handleArchive}>
                  <Archive className="w-4 h-4 mr-2" />
                  {t('actions.archive')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Contact Info Drawer */}
      <Sheet open={showContactInfo} onOpenChange={setShowContactInfo}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{t('contactInfo')}</SheetTitle>
          </SheetHeader>
          
          <div className="flex flex-col items-center gap-4 mt-6">
            <Avatar className="w-32 h-32">
              <AvatarImage src={otherParticipant?.photoUrl} />
              <AvatarFallback className="bg-primary/10 text-2xl">
                {otherParticipant?.displayName ? getInitials(otherParticipant.displayName) : '?'}
              </AvatarFallback>
            </Avatar>
            
            <div className="text-center">
              <h3 className="text-lg font-semibold">
                {otherParticipant?.displayName || t('unknownUser')}
              </h3>
              {(otherParticipant as any)?.email && (
                <p className="text-sm text-muted-foreground">@{((otherParticipant as any).email as string).split('@')[0]}</p>
              )}
            </div>
            
            <div className="w-full space-y-3 mt-4">
              {(otherParticipant as any)?.isPro && (
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm">🏆 {t('rating')}</span>
                  <span className="font-medium">4.8/5 (124)</span>
                </div>
              )}
              
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm">✅ {t('completedMissions')}</span>
                <span className="font-medium">87</span>
              </div>
              
              {(otherParticipant as any)?.location && (
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm">📍 {t('location')}</span>
                  <span className="font-medium">{(otherParticipant as any).location}</span>
                </div>
              )}
            </div>
            
            <div className="flex gap-2 w-full mt-6">
              <Button variant="outline" className="flex-1" asChild>
                <Link href={`/profile/${otherParticipantId}`}>
                  {t('viewFullProfile')}
                </Link>
              </Button>
            </div>
            
            <div className="flex gap-2 w-full">
              <Button variant="outline" className="flex-1 text-red-600 hover:text-red-600">
                {t('blockUser')}
              </Button>
              <Button variant="outline" className="flex-1 text-red-600 hover:text-red-600">
                {t('reportUser')}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
