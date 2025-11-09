'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Plus, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageReaction } from '@/lib/types';
import { cn } from '@/lib/utils';

interface MessageReactionsProps {
  reactions: MessageReaction[];
  currentUserId: string;
  onAddReaction: (emoji: string) => void;
  onRemoveReaction: (emoji: string) => void;
  className?: string;
}

const QUICK_REACTIONS = ['❤️', '👍', '😂', '😮', '😢', '🙏'];

export function MessageReactions({
  reactions,
  currentUserId,
  onAddReaction,
  onRemoveReaction,
  className,
}: MessageReactionsProps) {
  const t = useTranslations('messaging');
  const [showPicker, setShowPicker] = useState(false);

  // Group reactions by emoji
  const groupedReactions = reactions.reduce((acc, reaction) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = [];
    }
    acc[reaction.emoji].push(reaction);
    return acc;
  }, {} as Record<string, MessageReaction[]>);

  // Check if current user reacted with emoji
  const hasUserReacted = (emoji: string) => {
    return groupedReactions[emoji]?.some(r => r.userId === currentUserId);
  };

  // Handle reaction click
  const handleReactionClick = (emoji: string) => {
    if (hasUserReacted(emoji)) {
      onRemoveReaction(emoji);
    } else {
      onAddReaction(emoji);
    }
  };

  if (reactions.length === 0) {
    return null;
  }

  return (
    <div className={cn("flex flex-wrap gap-1 mt-1", className)}>
      {Object.entries(groupedReactions).map(([emoji, reactionList]) => {
        const isUserReacted = hasUserReacted(emoji);
        const count = reactionList.length;

        return (
          <Popover key={emoji}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "h-7 px-2 py-0 text-xs gap-1 rounded-full transition-all",
                  "hover:scale-110 active:scale-95",
                  isUserReacted
                    ? "bg-primary/20 border-primary/40 hover:bg-primary/30"
                    : "bg-background/80 hover:bg-background"
                )}
                onClick={() => handleReactionClick(emoji)}
              >
                <span className="text-base leading-none">{emoji}</span>
                {count > 1 && (
                  <span className="font-semibold">{count}</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2" align="start">
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground">
                  {t('reactedWith')} {emoji}
                </p>
                <div className="space-y-1 max-h-40 overflow-auto">
                  {reactionList.map((reaction) => (
                    <div
                      key={`${reaction.userId}-${reaction.emoji}`}
                      className="flex items-center gap-2 text-sm"
                    >
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="text-xs">
                          {reaction.userName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">
                        {reaction.userId === currentUserId
                          ? t('you')
                          : reaction.userName}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        );
      })}

      {/* Add reaction button */}
      <Popover open={showPicker} onOpenChange={setShowPicker}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-7 w-7 p-0 rounded-full hover:scale-110 transition-transform"
          >
            <Plus className="w-3 h-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="start">
          <div className="flex flex-wrap gap-2 max-w-[200px]">
            {QUICK_REACTIONS.map((emoji) => (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                className="h-10 w-10 p-0 text-2xl hover:scale-125 transition-transform"
                onClick={() => {
                  handleReactionClick(emoji);
                  setShowPicker(false);
                }}
              >
                {emoji}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

// Quick reaction button (shows on message hover)
interface QuickReactButtonProps {
  onReact: (emoji: string) => void;
}

export function QuickReactButton({ onReact }: QuickReactButtonProps) {
  const [showPicker, setShowPicker] = useState(false);

  return (
    <Popover open={showPicker} onOpenChange={setShowPicker}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full bg-background shadow-md hover:scale-110 transition-transform"
        >
          <Smile className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2" align="start">
        <div className="flex gap-1">
          {QUICK_REACTIONS.map((emoji) => (
            <Button
              key={emoji}
              variant="ghost"
              size="sm"
              className="h-10 w-10 p-0 text-2xl hover:scale-125 transition-transform"
              onClick={() => {
                onReact(emoji);
                setShowPicker(false);
              }}
            >
              {emoji}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
