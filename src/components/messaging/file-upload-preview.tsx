'use client';

import { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { X, Send, Image as ImageIcon, FileText, Crop, RotateCw, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface FileUploadPreviewProps {
  file: File;
  onSend: (file: File, caption?: string) => Promise<void>;
  onCancel: () => void;
}

export function FileUploadPreview({ file, onSend, onCancel }: FileUploadPreviewProps) {
  const t = useTranslations('messaging');
  const [caption, setCaption] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>(URL.createObjectURL(file));
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);
  const [showCropTools, setShowCropTools] = useState(false);
  
  const isImage = file.type.startsWith('image/');
  const isPdf = file.type === 'application/pdf';
  const isDocument = !isImage && !isPdf;

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Rotate image
  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  // Zoom in/out
  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.1, 3));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.1, 0.5));
  };

  // Send file
  const handleSend = async () => {
    setIsSending(true);
    try {
      // TODO: Apply transformations if needed (rotation, crop, etc.)
      await onSend(file, caption);
    } catch (error) {
      console.error('Error sending file:', error);
    } finally {
      setIsSending(false);
    }
  };

  // Cleanup on unmount
  const cleanup = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex flex-col">
      {/* Header */}
      <div className="bg-[#1F2C33] text-white p-4 flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            cleanup();
            onCancel();
          }}
          disabled={isSending}
          className="text-white hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </Button>

        <div className="flex-1 text-center">
          <h3 className="font-semibold truncate">{file.name}</h3>
          <p className="text-xs text-white/60">{formatFileSize(file.size)}</p>
        </div>

        {isImage && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowCropTools(!showCropTools)}
            disabled={isSending}
            className="text-white hover:bg-white/10"
          >
            <Crop className="w-5 h-5" />
          </Button>
        )}
      </div>

      {/* Preview Area */}
      <div className="flex-1 overflow-auto flex items-center justify-center p-4">
        {isImage ? (
          <div className="relative max-w-full max-h-full">
            <Image
              src={previewUrl}
              alt={file.name}
              width={800}
              height={600}
              className={cn(
                "object-contain transition-transform duration-200",
                "max-w-full max-h-[60vh]"
              )}
              style={{
                transform: `rotate(${rotation}deg) scale(${scale})`
              }}
            />
          </div>
        ) : isPdf ? (
          <div className="text-center">
            <div className="w-32 h-32 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText className="w-16 h-16 text-red-500" />
            </div>
            <p className="text-white font-semibold mb-1">{file.name}</p>
            <p className="text-white/60 text-sm">{formatFileSize(file.size)}</p>
          </div>
        ) : (
          <div className="text-center">
            <div className="w-32 h-32 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText className="w-16 h-16 text-blue-500" />
            </div>
            <p className="text-white font-semibold mb-1">{file.name}</p>
            <p className="text-white/60 text-sm">{formatFileSize(file.size)}</p>
          </div>
        )}
      </div>

      {/* Image Tools */}
      {isImage && showCropTools && (
        <div className="bg-[#1F2C33] p-4 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleRotate}
            disabled={isSending}
            className="bg-white/10 text-white hover:bg-white/20 border-white/20"
          >
            <RotateCw className="w-5 h-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleZoomOut}
            disabled={isSending || scale <= 0.5}
            className="bg-white/10 text-white hover:bg-white/20 border-white/20"
          >
            <ZoomOut className="w-5 h-5" />
          </Button>
          <div className="text-white text-sm font-mono min-w-[60px] text-center">
            {Math.round(scale * 100)}%
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleZoomIn}
            disabled={isSending || scale >= 3}
            className="bg-white/10 text-white hover:bg-white/20 border-white/20"
          >
            <ZoomIn className="w-5 h-5" />
          </Button>
        </div>
      )}

      {/* Caption & Send */}
      <div className="bg-[#1F2C33] p-4">
        <div className="max-w-2xl mx-auto flex items-end gap-2">
          <Textarea
            placeholder={t('addCaption')}
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            disabled={isSending}
            className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/40 resize-none"
            rows={1}
            maxLength={1000}
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={isSending}
            className="w-12 h-12 rounded-full bg-[#00A884] hover:bg-[#00A884]/90 shrink-0"
          >
            {isSending ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
        {caption.length > 0 && (
          <p className="text-xs text-white/60 text-right mt-1 max-w-2xl mx-auto">
            {caption.length}/1000
          </p>
        )}
      </div>
    </div>
  );
}
