'use client';

import { useState, useRef } from 'react';
import { Loader2, Camera, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ProfilePhotoUploadProps {
    currentPhotoUrl?: string;
    userName?: string;
    onUpload: (file: File) => Promise<string>;
}

export default function ProfilePhotoUpload({ currentPhotoUrl, userName, onUpload }: ProfilePhotoUploadProps) {
    const [photoUrl, setPhotoUrl] = useState(currentPhotoUrl);
    const [isUploading, setIsUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('File size must be less than 5MB');
            return;
        }

        // Show preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);

        // Upload
        setIsUploading(true);
        try {
            const uploadedUrl = await onUpload(file);
            setPhotoUrl(uploadedUrl);
            setPreviewUrl(null);
        } catch (error) {
            console.error('Error uploading photo:', error);
            alert('Failed to upload photo');
            setPreviewUrl(null);
        } finally {
            setIsUploading(false);
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const getInitials = (name?: string) => {
        if (!name) return 'U';
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    return (
        <div className="flex items-center gap-4">
            <div className="relative">
                <Avatar className="h-20 w-20">
                    <AvatarImage src={previewUrl || photoUrl} alt={userName} />
                    <AvatarFallback className="text-lg">
                        {getInitials(userName)}
                    </AvatarFallback>
                </Avatar>
                {isUploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                        <Loader2 className="h-6 w-6 animate-spin text-white" />
                    </div>
                )}
            </div>
            <div className="flex flex-col gap-2">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    aria-label="Upload profile photo"
                />
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClick}
                    disabled={isUploading}
                >
                    <Camera className="mr-2 h-4 w-4" />
                    Change photo
                </Button>
                <p className="text-xs text-muted-foreground">
                    JPG, PNG or GIF (max. 5MB)
                </p>
            </div>
        </div>
    );
}
