'use client';

import { useRef, useState } from 'react';
import { ImagePlus, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { uploadMessageImage, validateImageFile } from '@/lib/firebase-storage';

interface ImageUploadButtonProps {
  conversationId: string;
  userId: string;
  onImageUploaded: (imageUrl: string) => void;
  disabled?: boolean;
}

export function ImageUploadButton({
  conversationId,
  userId,
  onImageUploaded,
  disabled,
}: ImageUploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    setUploading(true);
    try {
      const imageUrl = await uploadMessageImage(file, conversationId, userId);
      onImageUploaded(imageUrl);
      setPreview(null);
      
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload image');
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="relative">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || uploading}
        aria-label="Upload image file"
      />

      {preview && (
        <div className="absolute bottom-full left-0 mb-2 p-2 bg-background border rounded-2xl shadow-lg">
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="max-w-xs max-h-40 rounded"
            />
            <Button
              size="icon"
              variant="destructive"
              className="absolute top-1 right-1 h-6 w-6"
              onClick={handleCancel}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {uploading ? 'Uploading...' : 'Click send to share'}
          </p>
        </div>
      )}

      {error && (
        <Alert variant="destructive" className="absolute bottom-full left-0 mb-2">
          <AlertDescription className="text-sm">{error}</AlertDescription>
        </Alert>
      )}

      <Button
        type="button"
        size="icon"
        variant="ghost"
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled || uploading}
        className={cn(uploading && 'cursor-not-allowed')}
      >
        {uploading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <ImagePlus className="h-5 w-5" />
        )}
      </Button>
    </div>
  );
}
