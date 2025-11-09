'use client';

import { useTranslations } from 'next-intl';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface TypingIndicatorProps {
  userName?: string;
  userAvatar?: string;
  variant?: 'bubble' | 'inline';
  className?: string;
}

export function TypingIndicator({
  userName,
  userAvatar,
  variant = 'bubble',
  className,
}: TypingIndicatorProps) {
  const t = useTranslations('messaging');

  if (variant === 'inline') {
    return (
      <div className={cn("flex items-center gap-2 text-sm text-muted-foreground", className)}>
        <span className="italic">{userName || t('someone')} {t('isTyping')}</span>
        <div className="flex gap-1">
          <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce [animation-delay:-0.3s]" />
          <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce [animation-delay:-0.15s]" />
          <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex gap-2 mb-2 animate-in slide-in-from-bottom-2 duration-200", className)}>
      {/* Avatar */}
      {userAvatar !== undefined && (
        <Avatar className="w-8 h-8">
          <AvatarImage src={userAvatar} />
          <AvatarFallback className="bg-primary/10 text-xs">
            {userName?.charAt(0).toUpperCase() || '?'}
          </AvatarFallback>
        </Avatar>
      )}

      {/* Typing bubble */}
      <div className="bg-white dark:bg-[#202C33] rounded-lg rounded-bl-none px-4 py-3 shadow-sm">
        <div className="flex gap-1.5">
          <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]" />
          <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]" />
          <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
        </div>
      </div>
    </div>
  );
}
