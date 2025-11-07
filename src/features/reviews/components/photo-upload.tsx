'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { useToast } from '@/hooks/use-toast';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// ============================================================================
// TYPES
// ============================================================================

interface PhotoUploadProps {
  reviewId?: string; // Will be generated after review creation
  maxPhotos?: number;
  maxSizeMB?: number;
  photos: string[]; // Array of photo URLs
  onChange: (photos: string[]) => void;
  disabled?: boolean;
}

interface PhotoPreview {
  url: string;
  file?: File;
  uploading?: boolean;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Compress image to max 2MB
 */
async function compressImage(file: File, maxSizeMB: number = 2): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Calculate new dimensions to keep under maxSizeMB
        const maxDimension = 1920; // Max width/height
        if (width > height && width > maxDimension) {
          height = (height * maxDimension) / width;
          width = maxDimension;
        } else if (height > maxDimension) {
          width = (width * maxDimension) / height;
          height = maxDimension;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to blob with quality adjustment
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'));
              return;
            }
            
            // Check size
            const sizeInMB = blob.size / (1024 * 1024);
            if (sizeInMB > maxSizeMB) {
              // Reduce quality further if still too large
              const quality = Math.max(0.5, maxSizeMB / sizeInMB);
              canvas.toBlob(
                (reducedBlob) => {
                  if (reducedBlob) {
                    resolve(new File([reducedBlob], file.name, { type: 'image/jpeg' }));
                  } else {
                    reject(new Error('Failed to reduce image quality'));
                  }
                },
                'image/jpeg',
                quality
              );
            } else {
              resolve(new File([blob], file.name, { type: 'image/jpeg' }));
            }
          },
          'image/jpeg',
          0.85 // Initial quality
        );
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
  });
}

/**
 * Upload photo to Firebase Storage
 */
async function uploadPhoto(file: File, reviewId: string, index: number): Promise<string> {
  try {
    const storageRef = ref(storage, `reviews/${reviewId}/photo_${index}.jpg`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading photo:', error);
    throw new Error('Failed to upload photo');
  }
}

// ============================================================================
// PHOTO UPLOAD COMPONENT
// ============================================================================

export default function PhotoUpload({
  reviewId,
  maxPhotos = 5,
  maxSizeMB = 2,
  photos,
  onChange,
  disabled = false,
}: PhotoUploadProps) {
  const t = useTranslations('Reviews.photoUpload');
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<PhotoPreview[]>(
    photos.map(url => ({ url }))
  );
  const [uploading, setUploading] = useState(false);

  // Handle file selection
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length === 0) return;
    
    // Check max photos limit
    if (previews.length + files.length > maxPhotos) {
      toast({ 
        title: t('errors.tooManyPhotos', { max: maxPhotos }),
        variant: 'destructive'
      });
      return;
    }
    
    // Validate file types
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast({ 
          title: t('errors.invalidFileType', { name: file.name }),
          variant: 'destructive'
        });
        return false;
      }
      return true;
    });
    
    if (validFiles.length === 0) return;
    
    setUploading(true);
    
    try {
      // Compress and create previews
      const newPreviews: PhotoPreview[] = [];
      
      for (const file of validFiles) {
        try {
          const compressedFile = await compressImage(file, maxSizeMB);
          const previewUrl = URL.createObjectURL(compressedFile);
          
          newPreviews.push({
            url: previewUrl,
            file: compressedFile,
            uploading: reviewId ? true : false, // Only upload if reviewId exists
          });
        } catch (error) {
          console.error('Error compressing image:', error);
          toast({ 
            title: t('errors.compressionFailed', { name: file.name }),
            variant: 'destructive'
          });
        }
      }
      
      setPreviews(prev => [...prev, ...newPreviews]);
      
      // If reviewId exists, upload immediately
      if (reviewId) {
        const uploadedUrls: string[] = [];
        
        for (let i = 0; i < newPreviews.length; i++) {
          const preview = newPreviews[i];
          if (preview.file) {
            try {
              const photoIndex = previews.length + i;
              const downloadURL = await uploadPhoto(preview.file, reviewId, photoIndex);
              uploadedUrls.push(downloadURL);
              
              // Update preview to show uploaded URL
              setPreviews(prev => 
                prev.map(p => 
                  p.url === preview.url 
                    ? { url: downloadURL, uploading: false }
                    : p
                )
              );
            } catch (error) {
              toast({ 
                title: t('errors.uploadFailed'),
                variant: 'destructive'
              });
            }
          }
        }
        
        onChange([...photos, ...uploadedUrls]);
      } else {
        // Store preview URLs temporarily (will upload after review creation)
        onChange([...photos, ...newPreviews.map(p => p.url)]);
      }
      
      toast({ title: t('success', { count: newPreviews.length }) });
    } catch (error) {
      console.error('Error handling files:', error);
      toast({ 
        title: t('errors.uploadFailed'),
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Remove photo
  const handleRemove = (index: number) => {
    const newPreviews = previews.filter((_, i) => i !== index);
    setPreviews(newPreviews);
    onChange(newPreviews.map(p => p.url));
  };

  return (
    <div className="space-y-4">
      {/* Photo Grid */}
      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {previews.map((preview, index) => (
            <div
              key={index}
              className="relative aspect-square overflow-hidden rounded-lg border bg-muted"
            >
              <img
                src={preview.url}
                alt={`Preview ${index + 1}`}
                className="h-full w-full object-cover"
              />
              
              {preview.uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                </div>
              )}
              
              {!disabled && !preview.uploading && (
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="absolute right-2 top-2 rounded-full bg-destructive p-1 text-destructive-foreground transition-opacity hover:opacity-80"
                  aria-label={t('removePhoto')}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Upload Button */}
      {previews.length < maxPhotos && !disabled && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
            disabled={uploading}
            aria-label={t('addPhotos', { current: previews.length, max: maxPhotos })}
          />
          
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full"
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('uploading')}
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                {t('addPhotos', { current: previews.length, max: maxPhotos })}
              </>
            )}
          </Button>
          
          <p className="mt-2 text-xs text-muted-foreground">
            {t('description', { maxSize: maxSizeMB })}
          </p>
        </div>
      )}
      
      {/* Empty State */}
      {previews.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center">
          <ImageIcon className="mb-3 h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{t('emptyState')}</p>
        </div>
      )}
    </div>
  );
}
