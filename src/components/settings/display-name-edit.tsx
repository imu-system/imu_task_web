'use client';

import { useState } from 'react';
import { Check, Pencil, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface DisplayNameEditProps {
    currentName?: string;
    onSave: (name: string) => Promise<void>;
}

export default function DisplayNameEdit({ currentName, onSave }: DisplayNameEditProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(currentName || '');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!name.trim() || name === currentName) {
            setIsEditing(false);
            setName(currentName || '');
            return;
        }

        setIsSaving(true);
        try {
            await onSave(name.trim());
            setIsEditing(false);
        } catch (error) {
            console.error('Error saving display name:', error);
            alert('Failed to save display name');
            setName(currentName || '');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setName(currentName || '');
    };

    if (isEditing) {
        return (
            <div className="flex items-center gap-2">
                <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isSaving}
                    className="max-w-xs"
                    autoFocus
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSave();
                        if (e.key === 'Escape') handleCancel();
                    }}
                />
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleSave}
                    disabled={isSaving || !name.trim()}
                >
                    {isSaving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Check className="h-4 w-4" />
                    )}
                </Button>
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCancel}
                    disabled={isSaving}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <span className="text-lg font-medium">{currentName || 'No name set'}</span>
            <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsEditing(true)}
            >
                <Pencil className="h-4 w-4" />
            </Button>
        </div>
    );
}
