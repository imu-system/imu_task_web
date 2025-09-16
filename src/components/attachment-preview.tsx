
'use client';

import { Attachment, AttachmentKind } from '@/lib/types';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Button } from './ui/button';
import { ShieldAlert, Trash2, FileText, Download, Play } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AttachmentPreviewProps {
    attachment: Attachment;
    threadId: string;
    onRemove?: (id: string) => void;
    isStaged?: boolean;
}


export default function AttachmentPreview({ attachment, threadId, onRemove, isStaged = false }: AttachmentPreviewProps) {
    const t = useTranslations('AttachmentPreview');
    const { toast } = useToast();

    const handleAddAsEvidence = async () => {
        // In a real app, this would find the related booking/dispute via threadId
        // and update it in Firestore with arrayUnion.
        console.log(`Adding ${attachment.id} as evidence for thread ${threadId}`);
        toast({
            title: t('toastSuccessTitle'),
            description: t('toastSuccessDescription', { filename: attachment.filename }),
        });
    };

    const handleRemove = () => {
        if(onRemove && attachment.id) {
            onRemove(attachment.id);
        }
    }


    if (attachment.kind === AttachmentKind.image) {
        return (
            <div className="mt-2 space-y-2">
                <Image src={attachment.url || '/placeholder.svg'} alt={attachment.filename || 'Image attachment'} width={200} height={150} className="rounded-lg object-cover" data-ai-hint="attached image"/>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="bg-background/80 hover:bg-background text-foreground text-xs h-7" onClick={handleAddAsEvidence} disabled={isStaged}>
                        <ShieldAlert className="mr-2 h-3 w-3"/>{t('addAsEvidence')}
                    </Button>
                    {isStaged && onRemove && (
                         <Button variant="destructive-outline" size="sm" className="bg-background/80 hover:bg-background text-xs h-7" onClick={handleRemove}>
                            <Trash2 className="mr-2 h-3 w-3"/>{t('delete')}
                        </Button>
                    )}
                </div>
            </div>
        )
    }

    if (attachment.kind === AttachmentKind.audio) {
        return (
            <div className="mt-2 space-y-2">
                <div className="flex items-center gap-2 p-2 border rounded-lg bg-background/80">
                    <Button variant="ghost" size="icon"><Play/></Button>
                    <div className="flex-1">
                        <p className="text-sm font-medium">{attachment.filename}</p>
                        <p className="text-xs text-muted-foreground">00:45</p>
                    </div>
                </div>
                 <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="bg-background/80 hover:bg-background text-foreground text-xs h-7" onClick={handleAddAsEvidence} disabled={isStaged}>
                        <ShieldAlert className="mr-2 h-3 w-3"/>{t('addAsEvidence')}
                    </Button>
                    {isStaged && onRemove && (
                         <Button variant="destructive-outline" size="sm" className="bg-background/80 hover:bg-background text-xs h-7" onClick={handleRemove}>
                            <Trash2 className="mr-2 h-3 w-3"/>{t('delete')}
                        </Button>
                    )}
                </div>
            </div>
        )
    }
    
     if (attachment.kind === AttachmentKind.file) {
        return (
            <div className="mt-2 space-y-2">
                <div className="flex items-center gap-2 p-3 border rounded-lg bg-background/80">
                    <FileText className="h-6 w-6 text-muted-foreground"/>
                    <div className="flex-1">
                        <p className="text-sm font-medium">{attachment.filename}</p>
                        <p className="text-xs text-muted-foreground">{(attachment.size / 1024).toFixed(1)} KB</p>
                    </div>
                    {!isStaged && (
                        <Button variant="ghost" size="icon" asChild>
                            <a href={attachment.url} download>
                                <Download/>
                                <span className="sr-only">{t('open')}</span>
                            </a>
                        </Button>
                    )}
                </div>
                 <div className="flex gap-2 mt-2">
                    <Button variant="outline" size="sm" className="bg-background/80 hover:bg-background text-foreground text-xs h-7" onClick={handleAddAsEvidence} disabled={isStaged}>
                        <ShieldAlert className="mr-2 h-3 w-3"/>{t('addAsEvidence')}
                    </Button>
                    {isStaged && onRemove && (
                         <Button variant="destructive-outline" size="sm" className="bg-background/80 hover:bg-background text-xs h-7" onClick={handleRemove}>
                            <Trash2 className="mr-2 h-3 w-3"/>{t('delete')}
                        </Button>
                    )}
                </div>
            </div>
        )
    }

    return null;
}
