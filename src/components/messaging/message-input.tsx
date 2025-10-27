'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import TextareaAutosize from 'react-textarea-autosize';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { useDebounce } from 'use-debounce';
import { Send, Smile, Paperclip, Mic, X, Camera, FileText, MapPin } from 'lucide-react';
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
import { MessageType } from '@/lib/types';

interface MessageInputProps {
  threadId: string;
  senderId: string;
  senderName: string;
  senderPhotoUrl?: string;
  onTyping?: (isTyping: boolean) => void;
}

export function MessageInput({
  threadId,
  senderId,
  senderName,
  senderPhotoUrl,
  onTyping,
}: MessageInputProps) {
  const t = useTranslations('messaging');
  const [content, setContent] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showPIIWarning, setShowPIIWarning] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [uploadingFile, setUploadingFile] = useState(false);
  
  const sendMessageMutation = useSendMessage();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout>();

  const [debouncedContent] = useDebounce(content, 300);

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
      await sendMessageMutation.mutateAsync({
        threadId,
        senderId,
        senderName,
        senderPhotoUrl,
        content: content.trim(),
        type: MessageType.text,
      });

      setContent('');
      setShowPIIWarning(false);
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

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);

    try {
      // TODO: Upload to Firebase Storage
      // const url = await uploadFileToStorage(file);
      
      const attachmentType = file.type.startsWith('image/') 
        ? 'image' 
        : file.type === 'application/pdf' 
        ? 'pdf' 
        : 'document';
      
      // For now, just send a placeholder
      await sendMessageMutation.mutateAsync({
        threadId,
        senderId,
        senderName,
        senderPhotoUrl,
        content: file.type.startsWith('image/') ? '' : file.name,
        type: file.type.startsWith('image/') ? MessageType.image : MessageType.file,
        attachments: [{
          id: `temp-${Date.now()}`,
          name: file.name,
          url: URL.createObjectURL(file), // Temporary - will be replaced with real upload
          type: attachmentType,
          mimeType: file.type,
          size: file.size,
        }],
      });
    } catch (error) {
      console.error('Failed to upload file:', error);
    } finally {
      setUploadingFile(false);
      if (e.target) e.target.value = '';
    }
  };

  // Handle voice recording
  const startVoiceRecording = () => {
    setIsRecording(true);
    setRecordingDuration(0);
    
    recordingIntervalRef.current = setInterval(() => {
      setRecordingDuration(prev => prev + 1);
    }, 1000);
    
    // TODO: Start actual audio recording with WebRTC
  };

  const stopVoiceRecording = () => {
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
    }
    setIsRecording(false);
    setRecordingDuration(0);
    
    // TODO: Stop recording and upload
  };

  const cancelRecording = () => {
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
    }
    setIsRecording(false);
    setRecordingDuration(0);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="sticky bottom-0 bg-background border-t shadow-lg">
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
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setContent('')}
              >
                {t('cancel')}
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => handleSend(true)}
              >
                {t('sendAnyway')}
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Voice Recording Overlay */}
      {isRecording && (
        <div className="absolute inset-0 bg-background/95 backdrop-blur-sm flex items-center justify-center gap-4 z-50">
          {/* Waveform animation */}
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-1 bg-red-500 rounded-full animate-pulse"
                style={{
                  height: `${Math.random() * 20 + 10}px`,
                  animationDelay: `${i * 100}ms`,
                }}
              />
            ))}
          </div>

          {/* Timer */}
          <span className="text-red-500 font-mono text-lg">
            {formatDuration(recordingDuration)}
          </span>

          {/* Actions */}
          <Button
            size="icon"
            variant="ghost"
            onClick={cancelRecording}
            className="ml-4"
          >
            <X className="w-5 h-5" />
          </Button>

          <Button
            size="icon"
            className="bg-primary"
            onClick={stopVoiceRecording}
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
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
              <Paperclip className={cn(
                "w-5 h-5",
                uploadingFile && "animate-spin"
              )} />
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
          onChange={handleFileUpload}
          title={t('photoOrVideo')}
          aria-label={t('photoOrVideo')}
        />
        <input
          ref={docInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
          className="hidden"
          onChange={handleFileUpload}
          title={t('document')}
          aria-label={t('document')}
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
              "w-full resize-none rounded-full px-4 py-2.5 pr-12",
              "bg-muted focus:bg-background",
              "border-0 focus:ring-2 focus:ring-primary",
              "transition-all duration-200",
              "placeholder:text-muted-foreground"
            )}
            disabled={sendMessageMutation.isPending}
          />
        </div>

        {/* Send/Voice Button */}
        {content.trim() ? (
          <Button
            size="icon"
            className="rounded-full bg-primary hover:bg-primary/90 w-11 h-11 shrink-0"
            onClick={() => handleSend()}
            disabled={sendMessageMutation.isPending}
          >
            <Send className="w-5 h-5" />
          </Button>
        ) : (
          <Button
            size="icon"
            variant="ghost"
            className="rounded-full w-11 h-11 shrink-0 hover:bg-muted"
            onMouseDown={startVoiceRecording}
            onMouseUp={stopVoiceRecording}
            onTouchStart={startVoiceRecording}
            onTouchEnd={stopVoiceRecording}
          >
            <Mic className="w-5 h-5" />
          </Button>
        )}
      </div>
    </div>
  );
}
