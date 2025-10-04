/**
 * MessageInput Component
 * 
 * Text input for sending messages with auto-resize and keyboard shortcuts
 */

'use client';

import { useState, useRef, useEffect } from 'react';
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

export function MessageInput({ conversationId, userId, onSend, sending, disabled = false }: MessageInputProps) {
  const t = useTranslations('messages');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  const handleSend = async () => {
    if ((!content.trim() && !imageUrl) || sending) return;

    await onSend(content || '📷 Image', imageUrl || undefined);
    setContent('');
    setImageUrl(null);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleImageUploaded = (url: string) => {
    setImageUrl(url);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Ctrl+Enter or Cmd+Enter
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-end gap-2 p-4 border-t bg-background">
      <ImageUploadButton
        conversationId={conversationId}
        userId={userId}
        onImageUploaded={handleImageUploaded}
        disabled={disabled || sending}
      />
      <Textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={t('placeholders.typeMessage')}
        disabled={disabled || sending}
        className="min-h-[44px] max-h-[200px] resize-none"
        rows={1}
      />
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
  );
}
