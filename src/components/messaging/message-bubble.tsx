'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { formatDistanceToNow } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { Check, CheckCheck, Download, FileText, Image as ImageIcon, AlertTriangle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Message } from '@/lib/types';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
  isRead: boolean;
  senderAvatar?: string;
  senderName?: string;
  locale?: string;
  showAvatar?: boolean;
}

export function MessageBubble({
  message,
  isOwnMessage,
  isRead,
  senderAvatar,
  senderName,
  locale = 'fr',
  showAvatar = true,
}: MessageBubbleProps) {
  const t = useTranslations('messaging');
  const [imageError, setImageError] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);

  const formatTime = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
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

  return (
    <div className={cn(
      "flex gap-2 mb-2 animate-in slide-in-from-bottom-2 duration-200",
      isOwnMessage ? "flex-row-reverse" : "flex-row"
    )}>
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

      {/* Message bubble */}
      <div className={cn(
        "max-w-[65%] sm:max-w-md flex flex-col",
        isOwnMessage ? "items-end" : "items-start"
      )}>
        {/* PII Warning */}
        {message.containsPII && (
          <Alert variant="destructive" className="mb-2 text-xs">
            <AlertTriangle className="h-3 w-3" />
            <AlertDescription>
              {t('piiWarning')}
            </AlertDescription>
          </Alert>
        )}

        {/* Bubble content */}
        <div className={cn(
          "relative px-3 py-2 shadow-sm",
          isOwnMessage
            ? "bg-[#DCF8C6] dark:bg-[#005C4B] rounded-lg rounded-br-none"
            : "bg-white dark:bg-[#202C33] rounded-lg rounded-bl-none",
          message.type === 'image' && "p-1"
        )}>
          {/* Text message */}
          {message.type === 'text' && (
            <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
              {message.content}
            </p>
          )}

          {/* Image message */}
          {message.type === 'image' && message.attachments && message.attachments.length > 0 && (
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
          {message.type === 'file' && message.attachments && message.attachments.length > 0 && (
            <div className="flex items-center gap-3 p-2 bg-muted/30 dark:bg-muted/10 rounded min-w-[200px]">
              {(() => {
                const FileIconComponent = getFileIcon(message.attachments[0].mimeType);
                return <FileIconComponent className="w-10 h-10 text-primary" />;
              })()}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate text-sm">{message.attachments[0].name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(message.attachments[0].size)}
                </p>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="shrink-0"
                asChild
              >
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

          {/* Timestamp and read status */}
          <div className={cn(
            "flex items-center justify-end gap-1 mt-1",
            message.type === 'image' && message.content ? "px-2" : ""
          )}>
            <span className="text-[11px] opacity-60">
              {formatTime(message.createdAt)}
            </span>
            {isOwnMessage && (
              <span className={cn(
                "flex items-center",
                isRead ? "text-blue-400" : "text-gray-400"
              )}>
                {isRead ? (
                  <CheckCheck className="w-4 h-4" />
                ) : (
                  message.createdAt ? (
                    <CheckCheck className="w-4 h-4" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )
                )}
              </span>
            )}
          </div>
        </div>

        {/* Tail SVG */}
        <svg
          className={cn(
            "absolute bottom-0 w-3 h-3",
            isOwnMessage ? "right-0 translate-x-[2px]" : "left-0 -translate-x-[2px]"
          )}
          viewBox="0 0 8 13"
          width="8"
          height="13"
        >
          <path
            d="M1.533,3.568 L8.009,3.568 L8.009,0.017 C7.574,0.017 5.283,0.017 1.533,0.017 C1.533,0.017 1.533,2.188 1.533,3.568 Z"
            className={cn(
              isOwnMessage
                ? "fill-[#DCF8C6] dark:fill-[#005C4B]"
                : "fill-white dark:fill-[#202C33]"
            )}
          />
        </svg>
      </div>

      {/* Lightbox for images */}
      {showLightbox && message.type === 'image' && message.attachments && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setShowLightbox(false)}
        >
          <div className="relative max-w-4xl max-h-full">
            <Image
              src={message.attachments[0].url}
              alt={message.attachments[0].name}
              width={1200}
              height={1200}
              className="object-contain max-h-[90vh]"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-white hover:bg-white/10"
              onClick={() => setShowLightbox(false)}
            >
              ✕
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
