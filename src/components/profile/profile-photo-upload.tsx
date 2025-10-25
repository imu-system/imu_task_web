/**
 * Composant d'upload de photo de profil
 * Fonctionnalités: Drag & drop, preview, crop, compression, WebP
 */

'use client';

import { useState, useRef, useCallback } from 'react';
import { Camera, Upload, X, Loader2, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useProfilePhoto } from '@/hooks/useProfilePhoto';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface ProfilePhotoUploadProps {
  onUploadSuccess?: (url: string) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ProfilePhotoUpload({ 
  onUploadSuccess, 
  className,
  size = 'lg' 
}: ProfilePhotoUploadProps) {
  const { user } = useAuth();
  const { uploadPhoto, deletePhoto, uploadProgress, isUploading } = useProfilePhoto();
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: 'h-16 w-16',
    md: 'h-24 w-24',
    lg: 'h-32 w-32',
  };

  const handleFileSelect = useCallback(async (file: File) => {
    // Créer une preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    const url = await uploadPhoto(file);
    if (url && onUploadSuccess) {
      onUploadSuccess(url);
    }
  }, [uploadPhoto, onUploadSuccess]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleFileSelect(file);
    }
  };

  const handleDelete = async () => {
    await deletePhoto();
    setPreview(null);
  };

  const currentPhotoURL = user?.profile?.photoUrl || preview;
  const displayName = user?.profile?.displayName || user?.email || 'User';
  const initials = displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={cn('flex flex-col items-center gap-4', className)}>
      {/* Avatar avec overlay pour upload */}
      <div className="relative group">
        <Avatar className={cn(sizeClasses[size], 'border-4 border-background shadow-xl')}>
          <AvatarImage src={currentPhotoURL || undefined} alt={displayName} />
          <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-primary to-primary/70 text-white">
            {initials}
          </AvatarFallback>
        </Avatar>

        {/* Overlay upload */}
        <div
          className={cn(
            'absolute inset-0 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer',
            isDragging && 'opacity-100 bg-primary/60',
            isUploading && 'opacity-100'
          )}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-6 w-6 text-white animate-spin" />
              <span className="text-xs text-white font-medium">{uploadProgress.progress}%</span>
            </div>
          ) : uploadProgress.status === 'success' ? (
            <Check className="h-8 w-8 text-green-400" />
          ) : uploadProgress.status === 'error' ? (
            <AlertCircle className="h-8 w-8 text-red-400" />
          ) : (
            <Camera className="h-8 w-8 text-white" />
          )}
        </div>

        {/* Indicateur de progression */}
        {isUploading && (
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-full">
            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${uploadProgress.progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Input caché */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleInputChange}
        title="Upload profile photo"
        aria-label="Upload profile photo"
        className="hidden"
      />

      {/* Boutons d'action */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="gap-2"
        >
          <Upload className="h-4 w-4" />
          {currentPhotoURL ? 'Changer' : 'Ajouter une photo'}
        </Button>

        {currentPhotoURL && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={isUploading}
            className="gap-2 text-destructive hover:text-destructive"
          >
            <X className="h-4 w-4" />
            Supprimer
          </Button>
        )}
      </div>

      {/* Messages d'erreur */}
      {uploadProgress.status === 'error' && uploadProgress.error && (
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{uploadProgress.error}</AlertDescription>
        </Alert>
      )}

      {/* Message de succès */}
      {uploadProgress.status === 'success' && (
        <Alert className="max-w-md border-green-500 bg-green-50">
          <Check className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">
            Photo de profil mise à jour avec succès !
          </AlertDescription>
        </Alert>
      )}

      {/* Informations */}
      <p className="text-xs text-muted-foreground text-center max-w-xs">
        JPG, PNG, WebP ou GIF. Maximum 5 MB.
        <br />
        Image carrée recommandée (400x400px minimum)
      </p>
    </div>
  );
}
