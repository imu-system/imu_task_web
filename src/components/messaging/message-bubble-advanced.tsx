'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { formatDistanceToNow } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import {
  Check,
  CheckCheck,
  Download,
  FileText,
  Image as ImageIcon,
  AlertTriangle,
  Reply as ReplyIcon,
  Forward,
  Copy,
  Pin,
  Edit2,
  Trash2,
  MoreVertical,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Message } from '@/lib/types';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { MessageReactions, QuickReactButton } from './message-reactions';

interface MessageBubbleAdvancedProps {
  message: Message;
  isOwnMessage: boolean;
  isRead: boolean;
  senderAvatar?: string;
  senderName?: string;
  locale?: string;
  showAvatar?: boolean;
  currentUserId: string;
  onReply?: (message: Message) => void;
  onEdit?: (message: Message) => void;
  onDelete?: (messageId: string) => void;
  onForward?: (message: Message) => void;
  onPin?: (messageId: string) => void;
  onReact?: (messageId: string, emoji: string) => void;
  onRemoveReaction?: (messageId: string, emoji: string) => void;
}

export function MessageBubbleAdvanced({
  message,
  isOwnMessage,
  isRead,
  senderAvatar,
  senderName,
  locale = 'fr',
  showAvatar = true,
  currentUserId,
  onReply,
  onEdit,
  onDelete,
  onForward,
  onPin,
  onReact,
  onRemoveReaction,
}: MessageBubbleAdvancedProps) {
  const t = useTranslations('messaging');
  const [imageError, setImageError] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const formatTime = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (mimeType?: string) => {
    if (mimeType?.startsWith('image/')) return ImageIcon;
    return FileText;
  };

  // Copy message content
  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
  };

  // System message (centered, gray)
  if (message.type === 'system') {
    return (
      <div className="flex justify-center my-3">
        <div className="bg-black/5 dark:bg-white/5 px-4 py-2 rounded-lg max-w-md">
          <p className="text-xs text-center text-muted-foreground flex items-center gap-2">
            <span className="text-base">🤖</span>
            <span>{message.content}</span>
          </p>
        </div>
      </div>
    );
  }

  // Deleted message
  if (message.isDeleted) {
    return (
      <div
        className={cn(
          'flex gap-2 mb-2',
          isOwnMessage ? 'flex-row-reverse' : 'flex-row'
        )}
      >
        {!isOwnMessage && showAvatar && (
          <Avatar className="w-8 h-8 mt-auto">
            <AvatarImage src={senderAvatar} />
            <AvatarFallback className="bg-primary/10 text-xs">
              {senderName ? getInitials(senderName) : '?'}
            </AvatarFallback>
          </Avatar>
        )}
        {!isOwnMessage && !showAvatar && <div className="w-8" />}

        <div
          className={cn(
            'max-w-[65%] sm:max-w-md px-3 py-2 rounded-lg',
            'bg-muted/50 italic text-muted-foreground text-sm'
          )}
        >
          {t('messageDeleted')}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex gap-2 mb-2 group relative animate-in slide-in-from-bottom-2 duration-200',
        isOwnMessage ? 'flex-row-reverse' : 'flex-row'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Avatar (for received messages) */}
      {!isOwnMessage && showAvatar && (
        <Avatar className="w-8 h-8 mt-auto">
          <AvatarImage src={senderAvatar} />
          <AvatarFallback className="bg-primary/10 text-xs">
            {senderName ? getInitials(senderName) : '?'}
          </AvatarFallback>
        </Avatar>
      )}
      {!isOwnMessage && !showAvatar && <div className="w-8" />}

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Quick Actions (show on hover) */}
        {isHovered && (
          <div
            className={cn(
              'absolute z-10 flex items-center gap-1 transition-opacity',
              isOwnMessage ? 'right-2' : 'left-10',
              '-top-3'
            )}
          >
            {/* Quick React */}
            {onReact && (
              <QuickReactButton
                onReact={(emoji) => onReact(message.id, emoji)}
              />
            )}

            {/* More Actions Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full bg-background shadow-md hover:scale-110 transition-transform"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isOwnMessage ? 'end' : 'start'}>
                {onReply && (
                  <DropdownMenuItem onClick={() => onReply(message)}>
                    <ReplyIcon className="w-4 h-4 mr-2" />
                    {t('reply')}
                  </DropdownMenuItem>
                )}

                {onForward && (
                  <DropdownMenuItem onClick={() => onForward(message)}>
                    <Forward className="w-4 h-4 mr-2" />
                    {t('forward')}
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem onClick={handleCopy}>
                  <Copy className="w-4 h-4 mr-2" />
                  {t('copy')}
                </DropdownMenuItem>

                {onPin && (
                  <DropdownMenuItem onClick={() => onPin(message.id)}>
                    <Pin className="w-4 h-4 mr-2" />
                    {message.isPinned ? t('unpin') : t('pin')}
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />

                {isOwnMessage && onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(message)}>
                    <Edit2 className="w-4 h-4 mr-2" />
                    {t('edit')}
                  </DropdownMenuItem>
                )}

                {(isOwnMessage || !isOwnMessage) && onDelete && (
                  <DropdownMenuItem
                    onClick={() => onDelete(message.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {t('delete')}
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {/* Message bubble */}
        <div
          className={cn(
            'max-w-[65%] sm:max-w-md flex flex-col',
            isOwnMessage ? 'items-end' : 'items-start'
          )}
        >
          {/* Pinned indicator */}
          {message.isPinned && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
              <Pin className="w-3 h-3" />
              <span>{t('pinned')}</span>
            </div>
          )}

          {/* Reply reference */}
          {message.replyTo && (
            <div
              className={cn(
                'px-3 py-2 mb-1 rounded-lg text-sm bg-muted/50 w-full border-l-4',
                isOwnMessage ? 'border-primary/50' : 'border-muted'
              )}
            >
              <p className="font-semibold text-xs text-primary mb-1">
                {message.replyTo.senderName}
              </p>
              <p className="text-muted-foreground truncate text-xs">
                {message.replyTo.content}
              </p>
            </div>
          )}

          {/* PII Warning */}
          {message.containsPII && (
            <Alert variant="destructive" className="mb-2 text-xs">
              <AlertTriangle className="h-3 w-3" />
              <AlertDescription>{t('piiWarning')}</AlertDescription>
            </Alert>
          )}

          {/* Bubble content */}
          <div
            className={cn(
              'relative px-3 py-2 shadow-sm',
              isOwnMessage
                ? 'bg-[#DCF8C6] dark:bg-[#005C4B] rounded-lg rounded-br-none'
                : 'bg-white dark:bg-[#202C33] rounded-lg rounded-bl-none',
              message.type === 'image' && 'p-1'
            )}
          >
            {/* Text message */}
            {message.type === 'text' && (
              <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
                {message.content}
              </p>
            )}

            {/* Image message */}
            {message.type === 'image' &&
              message.attachments &&
              message.attachments.length > 0 && (
                <div className="relative rounded-lg overflow-hidden">
                  {!imageError ? (
                    <Image
                      src={message.attachments[0].url}
                      alt={message.attachments[0].name}
                      width={280}
                      height={280}
                      className="object-cover cursor-pointer hover:opacity-95 transition-opacity"
                      onClick={() => setShowLightbox(true)}
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <div className="w-[280px] h-[280px] bg-muted flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                  {message.content && (
                    <p className="px-2 py-1 text-sm">{message.content}</p>
                  )}
                </div>
              )}

            {/* File message */}
            {message.type === 'file' &&
              message.attachments &&
              message.attachments.length > 0 && (
                <div className="flex items-center gap-3 p-2 bg-muted/30 dark:bg-muted/10 rounded min-w-[200px]">
                  {(() => {
                    const FileIconComponent = getFileIcon(
                      message.attachments[0].mimeType
                    );
                    return <FileIconComponent className="w-10 h-10 text-primary" />;
                  })()}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate text-sm">
                      {message.attachments[0].name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(message.attachments[0].size)}
                    </p>
                  </div>
                  <Button size="icon" variant="ghost" className="shrink-0" asChild>
                    <a
                      href={message.attachments[0].url}
                      download={message.attachments[0].name}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </Button>
                </div>
              )}

            {/* Timestamp, edited, and read status */}
            <div
              className={cn(
                'flex items-center justify-end gap-1 mt-1',
                message.type === 'image' && message.content ? 'px-2' : ''
              )}
            >
              {message.isEdited && (
                <span className="text-[11px] opacity-60 italic">
                  {t('edited')}
                </span>
              )}
              <span className="text-[11px] opacity-60">
                {formatTime(message.createdAt)}
              </span>
              {isOwnMessage && (
                <span
                  className={cn(
                    'flex items-center',
                    isRead ? 'text-blue-400' : 'text-gray-400'
                  )}
                >
                  {isRead ? (
                    <CheckCheck className="w-4 h-4" />
                  ) : message.createdAt ? (
                    <CheckCheck className="w-4 h-4" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                </span>
              )}
            </div>
          </div>

          {/* Reactions */}
          {message.reactions && message.reactions.length > 0 && onReact && onRemoveReaction && (
            <MessageReactions
              reactions={message.reactions}
              currentUserId={currentUserId}
              onAddReaction={(emoji) => onReact(message.id, emoji)}
              onRemoveReaction={(emoji) => onRemoveReaction(message.id, emoji)}
              className="mt-1"
            />
          )}
        </div>
      </div>
    </div>
  );
}
