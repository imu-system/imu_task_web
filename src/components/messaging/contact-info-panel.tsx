'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { 
  X, Image as ImageIcon, FileText, Link as LinkIcon, 
  Music, MessageSquare, Bell, BellOff, Palette, 
  Ban, Flag, Archive, ChevronDown, ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Thread, Message, MessageType } from '@/lib/types';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface ContactInfoPanelProps {
  thread: Thread;
  messages: Message[];
  currentUserId: string;
  onClose: () => void;
  onMuteToggle?: () => void;
  onBlock?: () => void;
  onReport?: () => void;
  onArchive?: () => void;
}

export function ContactInfoPanel({
  thread,
  messages,
  currentUserId,
  onClose,
  onMuteToggle,
  onBlock,
  onReport,
  onArchive,
}: ContactInfoPanelProps) {
  const t = useTranslations('messaging');
  const [showMediaExpanded, setShowMediaExpanded] = useState(false);
  const [showDocsExpanded, setShowDocsExpanded] = useState(false);
  const [showLinksExpanded, setShowLinksExpanded] = useState(false);

  // Get other participant
  const otherParticipantId = thread.participants.find(id => id !== currentUserId);
  const otherParticipant = otherParticipantId && thread.participantsData
    ? thread.participantsData[otherParticipantId]
    : null;

  // Filter media, documents, links
  const mediaMessages = messages.filter(
    m => m.type === MessageType.image && m.attachments && m.attachments.length > 0
  );

  const documentMessages = messages.filter(
    m => m.type === MessageType.file && m.attachments && m.attachments.length > 0
  );

  const audioMessages = messages.filter(
    m => m.type === MessageType.audio && m.attachments && m.attachments.length > 0
  );

  // Extract links from text messages
  const linkRegex = /(https?:\/\/[^\s]+)/g;
  const linkMessages = messages.filter(m => {
    if (m.type !== MessageType.text) return false;
    return linkRegex.test(m.content);
  });

  const isMuted = thread.muteNotifications?.[currentUserId];

  return (
    <div className="w-full md:w-96 h-full bg-background border-l flex flex-col">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-semibold">{t('contactInfo')}</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Profile Section */}
          <div className="text-center space-y-3">
            <Avatar className="w-24 h-24 mx-auto">
              <AvatarImage src={otherParticipant?.photoUrl} />
              <AvatarFallback className="text-2xl">
                {otherParticipant?.displayName?.charAt(0).toUpperCase() || '?'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-bold">
                {otherParticipant?.displayName || t('unknownUser')}
              </h2>
              {(otherParticipant as any)?.isPro && (
                <Badge variant="secondary" className="mt-1">
                  PRO
                </Badge>
              )}
            </div>
            {(otherParticipant as any)?.bio && (
              <p className="text-sm text-muted-foreground">
                {(otherParticipant as any).bio}
              </p>
            )}
          </div>

          <Separator />

          {/* Task Link */}
          {thread.taskId && thread.taskTitle && (
            <>
              <div className="space-y-2">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  {t('relatedTask')}
                </h4>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  asChild
                >
                  <a href={`/dashboard/tasks/${thread.taskId}`}>
                    {thread.taskTitle}
                  </a>
                </Button>
              </div>
              <Separator />
            </>
          )}

          {/* Media Section */}
          <div className="space-y-2">
            <button
              onClick={() => setShowMediaExpanded(!showMediaExpanded)}
              className="w-full flex items-center justify-between text-sm font-semibold hover:text-primary"
            >
              <span className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                {t('mediaFiles')} ({mediaMessages.length})
              </span>
              {showMediaExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {/* Preview (first 3 or all if expanded) */}
            {mediaMessages.length > 0 && (
              <div className="grid grid-cols-3 gap-1">
                {(showMediaExpanded ? mediaMessages : mediaMessages.slice(0, 6)).map((msg) => {
                  const attachment = msg.attachments![0];
                  return (
                    <div
                      key={msg.id}
                      className="aspect-square relative rounded overflow-hidden bg-muted cursor-pointer hover:opacity-80 transition-opacity"
                    >
                      <Image
                        src={attachment.url}
                        alt={attachment.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <Separator />

          {/* Documents Section */}
          <div className="space-y-2">
            <button
              onClick={() => setShowDocsExpanded(!showDocsExpanded)}
              className="w-full flex items-center justify-between text-sm font-semibold hover:text-primary"
            >
              <span className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                {t('documents')} ({documentMessages.length})
              </span>
              {showDocsExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {showDocsExpanded && documentMessages.length > 0 && (
              <div className="space-y-1">
                {documentMessages.slice(0, 10).map((msg) => {
                  const attachment = msg.attachments![0];
                  return (
                    <a
                      key={msg.id}
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 rounded hover:bg-muted transition-colors text-sm"
                    >
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span className="flex-1 truncate">{attachment.name}</span>
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          <Separator />

          {/* Audio Section */}
          {audioMessages.length > 0 && (
            <>
              <div className="space-y-2">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <Music className="w-4 h-4" />
                  {t('audioMessages')} ({audioMessages.length})
                </h4>
              </div>
              <Separator />
            </>
          )}

          {/* Links Section */}
          <div className="space-y-2">
            <button
              onClick={() => setShowLinksExpanded(!showLinksExpanded)}
              className="w-full flex items-center justify-between text-sm font-semibold hover:text-primary"
            >
              <span className="flex items-center gap-2">
                <LinkIcon className="w-4 h-4" />
                {t('links')} ({linkMessages.length})
              </span>
              {showLinksExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {showLinksExpanded && linkMessages.length > 0 && (
              <div className="space-y-1">
                {linkMessages.slice(0, 10).map((msg) => {
                  const links = msg.content.match(linkRegex);
                  return links?.map((link, idx) => (
                    <a
                      key={`${msg.id}-${idx}`}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-2 rounded hover:bg-muted transition-colors text-sm text-primary truncate"
                    >
                      {link}
                    </a>
                  ));
                })}
              </div>
            )}
          </div>

          <Separator />

          {/* Actions */}
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={onMuteToggle}
            >
              {isMuted ? (
                <>
                  <Bell className="w-4 h-4 mr-2" />
                  {t('unmuteNotifications')}
                </>
              ) : (
                <>
                  <BellOff className="w-4 h-4 mr-2" />
                  {t('muteNotifications')}
                </>
              )}
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start"
            >
              <Palette className="w-4 h-4 mr-2" />
              {t('changeWallpaper')}
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={onArchive}
            >
              <Archive className="w-4 h-4 mr-2" />
              {t('archiveConversation')}
            </Button>

            <Separator />

            <Button
              variant="outline"
              className="w-full justify-start text-destructive hover:text-destructive"
              onClick={onBlock}
            >
              <Ban className="w-4 h-4 mr-2" />
              {t('blockUser')}
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start text-destructive hover:text-destructive"
              onClick={onReport}
            >
              <Flag className="w-4 h-4 mr-2" />
              {t('reportUser')}
            </Button>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
