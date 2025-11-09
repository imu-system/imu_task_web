'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import TextareaAutosize from 'react-textarea-autosize';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { useDebounce } from 'use-debounce';
import {
  Send,
  Smile,
  Paperclip,
  Mic,
  X,
  Camera,
  FileText,
  MapPin,
  Reply as ReplyIcon,
  Edit2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useSendMessage } from '@/hooks/use-messaging';
import { detectPII } from '@/lib/firestore-messages';
import { MessageType, Message } from '@/lib/types';
import { VoiceRecorder } from './voice-recorder';
import { FileUploadPreview } from './file-upload-preview';

interface MessageInputAdvancedProps {
  threadId: string;
  senderId: string;
  senderName: string;
  senderPhotoUrl?: string;
  onTyping?: (isTyping: boolean) => void;
  replyToMessage?: Message | null;
  onCancelReply?: () => void;
  editingMessage?: Message | null;
  onCancelEdit?: () => void;
}

export function MessageInputAdvanced({
  threadId,
  senderId,
  senderName,
  senderPhotoUrl,
  onTyping,
  replyToMessage,
  onCancelReply,
  editingMessage,
  onCancelEdit,
}: MessageInputAdvancedProps) {
  const t = useTranslations('messaging');
  const [content, setContent] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showPIIWarning, setShowPIIWarning] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);

  const sendMessageMutation = useSendMessage();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  const [debouncedContent] = useDebounce(content, 300);

  // Set content when editing
  useEffect(() => {
    if (editingMessage) {
      setContent(editingMessage.content);
      textareaRef.current?.focus();
    }
  }, [editingMessage]);

  // Emit typing indicator
  useEffect(() => {
    if (onTyping) {
      onTyping(content.length > 0);
    }
  }, [debouncedContent, onTyping, content.length]);

  // Check for PII
  useEffect(() => {
    if (content.trim()) {
      const hasPII = detectPII(content);
      setShowPIIWarning(hasPII);
    } else {
      setShowPIIWarning(false);
    }
  }, [content]);

  // Handle send message
  const handleSend = async (force = false) => {
    if (!content.trim() && !force) return;

    if (showPIIWarning && !force) {
      return; // User must confirm via "Send anyway" button
    }

    try {
      const messageData: any = {
        threadId,
        senderId,
        senderName,
        senderPhotoUrl,
        content: content.trim(),
        type: MessageType.text,
      };

      // Add reply reference
      if (replyToMessage) {
        messageData.replyTo = {
          messageId: replyToMessage.id,
          content: replyToMessage.content,
          senderId: replyToMessage.senderId,
          senderName: replyToMessage.senderName || 'Unknown',
          type: replyToMessage.type,
        };
      }

      if (editingMessage) {
        // TODO: Implement edit message mutation
        console.log('Edit message:', editingMessage.id, content);
        onCancelEdit?.();
      } else {
        await sendMessageMutation.mutateAsync(messageData);
      }

      setContent('');
      setShowPIIWarning(false);
      onCancelReply?.();
      textareaRef.current?.focus();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    } else if (e.key === 'Escape') {
      if (replyToMessage) {
        onCancelReply?.();
      }
      if (editingMessage) {
        onCancelEdit?.();
        setContent('');
      }
    }
  };

  // Handle emoji selection
  const handleEmojiClick = (emojiData: EmojiClickData) => {
    const emoji = emojiData.emoji;
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newContent = content.substring(0, start) + emoji + content.substring(end);

    setContent(newContent);
    setShowEmojiPicker(false);

    // Set cursor position after emoji
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
      textarea.focus();
    }, 0);
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileToUpload(file);
    e.target.value = ''; // Reset input
  };

  // Send file
  const handleSendFile = async (file: File, caption?: string) => {
    setUploadingFile(true);
    try {
      // TODO: Upload to Firebase Storage
      // const url = await uploadFileToStorage(file);

      const attachmentType = file.type.startsWith('image/')
        ? 'image'
        : file.type === 'application/pdf'
        ? 'pdf'
        : 'document';

      const messageData: any = {
        threadId,
        senderId,
        senderName,
        senderPhotoUrl,
        content: caption || (file.type.startsWith('image/') ? '' : file.name),
        type: file.type.startsWith('image/') ? MessageType.image : MessageType.file,
        attachments: [
          {
            id: `temp-${Date.now()}`,
            name: file.name,
            url: URL.createObjectURL(file), // Temporary - will be replaced with real upload
            type: attachmentType,
            mimeType: file.type,
            size: file.size,
          },
        ],
      };

      // Add reply reference if exists
      if (replyToMessage) {
        messageData.replyTo = {
          messageId: replyToMessage.id,
          content: replyToMessage.content,
          senderId: replyToMessage.senderId,
          senderName: replyToMessage.senderName || 'Unknown',
          type: replyToMessage.type,
        };
      }

      await sendMessageMutation.mutateAsync(messageData);
      setFileToUpload(null);
      onCancelReply?.();
    } catch (error) {
      console.error('Failed to upload file:', error);
    } finally {
      setUploadingFile(false);
    }
  };

  // Send audio
  const handleSendAudio = async (audioBlob: Blob, duration: number) => {
    try {
      // TODO: Upload to Firebase Storage
      // const url = await uploadAudioToStorage(audioBlob);

      await sendMessageMutation.mutateAsync({
        threadId,
        senderId,
        senderName,
        senderPhotoUrl,
        content: '',
        type: MessageType.audio,
        attachments: [
          {
            id: `temp-${Date.now()}`,
            name: `voice-${Date.now()}.webm`,
            url: URL.createObjectURL(audioBlob),
            type: 'audio',
            mimeType: 'audio/webm',
            size: audioBlob.size,
            duration,
          },
        ],
      });

      setShowVoiceRecorder(false);
    } catch (error) {
      console.error('Failed to send audio:', error);
    }
  };

  return (
    <>
      {/* Voice Recorder Modal */}
      {showVoiceRecorder && (
        <VoiceRecorder
          onSend={handleSendAudio}
          onCancel={() => setShowVoiceRecorder(false)}
        />
      )}

      {/* File Upload Preview Modal */}
      {fileToUpload && (
        <FileUploadPreview
          file={fileToUpload}
          onSend={handleSendFile}
          onCancel={() => setFileToUpload(null)}
        />
      )}

      <div className="sticky bottom-0 bg-background border-t shadow-lg">
        {/* Reply/Edit Bar */}
        {(replyToMessage || editingMessage) && (
          <div className="bg-muted/50 px-4 py-2 flex items-center gap-3 border-b">
            <div className="w-1 h-12 bg-primary rounded-full" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {editingMessage ? (
                  <>
                    <Edit2 className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold text-primary">
                      {t('editingMessage')}
                    </span>
                  </>
                ) : (
                  <>
                    <ReplyIcon className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold text-primary">
                      {t('replyingTo')} {replyToMessage?.senderName}
                    </span>
                  </>
                )}
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {editingMessage?.content || replyToMessage?.content}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                onCancelReply?.();
                onCancelEdit?.();
                setContent('');
              }}
              className="shrink-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* PII Warning */}
        {showPIIWarning && (
          <Alert variant="destructive" className="m-3 mb-0 rounded-b-none">
            <AlertDescription className="flex items-center justify-between text-sm">
              <span>
                ⚠️ {t('piiDetected')}
                <br />
                <span className="text-xs">{t('piiMessage')}</span>
              </span>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setContent('')}>
                  {t('cancel')}
                </Button>
                <Button variant="default" size="sm" onClick={() => handleSend(true)}>
                  {t('sendAnyway')}
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Main Input */}
        <div className="flex items-end gap-2 max-w-4xl mx-auto p-3">
          {/* Emoji Picker */}
          <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 rounded-full hover:bg-muted"
              >
                <Smile className="w-5 h-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent side="top" className="w-80 p-0 border-0">
              <EmojiPicker
                onEmojiClick={handleEmojiClick}
                autoFocusSearch={false}
                previewConfig={{ showPreview: false }}
                height={400}
              />
            </PopoverContent>
          </Popover>

          {/* Attachment Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 rounded-full hover:bg-muted"
                disabled={uploadingFile}
              >
                <Paperclip
                  className={cn('w-5 h-5', uploadingFile && 'animate-spin')}
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start">
              <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                <Camera className="w-4 h-4 mr-2" />
                {t('photoOrVideo')}
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => docInputRef.current?.click()}>
                <FileText className="w-4 h-4 mr-2" />
                {t('document')}
              </DropdownMenuItem>

              <DropdownMenuItem disabled>
                <MapPin className="w-4 h-4 mr-2" />
                {t('shareLocation')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Hidden file inputs */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={handleFileSelect}
          />
          <input
            ref={docInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
            className="hidden"
            onChange={handleFileSelect}
          />

          {/* Textarea */}
          <div className="flex-1 relative">
            <TextareaAutosize
              ref={textareaRef}
              minRows={1}
              maxRows={5}
              placeholder={t('typeMessage')}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              className={cn(
                'w-full resize-none rounded-full px-4 py-2.5 pr-12',
                'bg-muted focus:bg-background',
                'border-0 focus:ring-2 focus:ring-primary',
                'transition-all duration-200',
                'placeholder:text-muted-foreground'
              )}
              disabled={sendMessageMutation.isPending}
            />
          </div>

          {/* Send/Voice Button */}
          {content.trim() ? (
            <Button
              size="icon"
              className="rounded-full bg-[#00A884] hover:bg-[#00A884]/90 w-11 h-11 shrink-0"
              onClick={() => handleSend()}
              disabled={sendMessageMutation.isPending}
            >
              {sendMessageMutation.isPending ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          ) : (
            <Button
              size="icon"
              variant="ghost"
              className="rounded-full w-11 h-11 shrink-0 hover:bg-muted"
              onClick={() => setShowVoiceRecorder(true)}
            >
              <Mic className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
