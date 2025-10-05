/**
 * MessageInput Component
 * 
 * Text input for sending messages with auto-resize and keyboard shortcuts
 */

'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ImageUploadButton } from '@/components/chat/image-upload-button';
import { useTranslations } from 'next-intl';

interface MessageInputProps {
  conversationId: string;
  userId: string;
  onSend: (content: string, imageUrl?: string) => Promise<void>;
  sending: boolean;
  disabled?: boolean;
}

const MAX_LENGTH = 5000;
const DRAFT_KEY_PREFIX = 'message_draft_';

export function MessageInput({ conversationId, userId, onSend, sending, disabled = false }: MessageInputProps) {
  const t = useTranslations('messages');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const draftKey = `${DRAFT_KEY_PREFIX}${conversationId}`;

  // Load draft from localStorage on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem(draftKey);
    if (savedDraft) {
      setContent(savedDraft);
    }
  }, [draftKey]);

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  // Auto-save draft to localStorage (debounced)
  useEffect(() => {
    if (!content.trim()) {
      localStorage.removeItem(draftKey);
      return;
    }

    const timeoutId = setTimeout(() => {
      localStorage.setItem(draftKey, content);
    }, 500); // Debounce 500ms

    return () => clearTimeout(timeoutId);
  }, [content, draftKey]);

  const handleSend = async () => {
    if ((!content.trim() && !imageUrl) || sending) return;

    await onSend(content || '📷 Image', imageUrl || undefined);
    setContent('');
    setImageUrl(null);
    localStorage.removeItem(draftKey); // Clear draft after sending

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleImageUploaded = (url: string) => {
    setImageUrl(url);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    // Shift+Enter allows new line (default behavior)
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    // Enforce max length
    if (newContent.length <= MAX_LENGTH) {
      setContent(newContent);
    }
  };

  const remainingChars = MAX_LENGTH - content.length;
  const showCounter = content.length > MAX_LENGTH * 0.8; // Show when > 80%

  return (
    <div className="border-t bg-background">
      <div className="flex items-end gap-2 p-4">
        <ImageUploadButton
          conversationId={conversationId}
          userId={userId}
          onImageUploaded={handleImageUploaded}
          disabled={disabled || sending}
        />
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={handleContentChange}
            onKeyDown={handleKeyDown}
            placeholder={t('placeholders.typeMessage')}
            disabled={disabled || sending}
            className="min-h-[44px] max-h-[200px] resize-none pr-16"
            rows={1}
          />
          {showCounter && (
            <span
              className={`absolute bottom-2 right-2 text-xs ${
                remainingChars < 100 ? 'text-destructive font-medium' : 'text-muted-foreground'
              }`}
            >
              {remainingChars}
            </span>
          )}
        </div>
        <Button
          onClick={handleSend}
          disabled={(!content.trim() && !imageUrl) || sending || disabled}
          size="icon"
          className="shrink-0"
        >
          <Send className="h-4 w-4" />
          <span className="sr-only">{t('actions.send')}</span>
        </Button>
      </div>
      <div className="px-4 pb-2 text-xs text-muted-foreground">
        <span className="opacity-60">
          {t('hints.enterToSend')} • {t('hints.shiftEnterNewLine')}
        </span>
      </div>
    </div>
  );
}
