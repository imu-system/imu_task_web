
'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, WifiOff, RefreshCw, Trash2, Loader2, MessageSquare, UploadCloud, Check } from 'lucide-react';
import { Link } from '@/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

const mockPendingItems = [
    { id: '1', description: 'Message "Bonjour" → thread #1245', icon: <MessageSquare className="h-5 w-5 text-muted-foreground"/> },
    { id: '2', description: 'Upload CV.pdf (2,1 Mo)', icon: <UploadCloud className="h-5 w-5 text-muted-foreground"/> },
    { id: '3', description: 'Accept task #982', icon: <Check className="h-5 w-5 text-muted-foreground"/> },
];

export default function OfflineStatusPage() {
    const t = useTranslations('OfflinePage');
    const { toast } = useToast();
    const [isSyncing, setIsSyncing] = useState(false);
    const [isPurging, setIsPurging] = useState(false);

    const handleForceSync = () => {
        setIsSyncing(true);
        toast({
            title: t('toast.sync.title'),
            description: t('toast.sync.description'),
        });
        setTimeout(() => {
            setIsSyncing(false);
            toast({
                title: t('toast.syncSuccess.title'),
                description: t('toast.syncSuccess.description'),
            });
        }, 2000);
    }

    const handlePurge = () => {
        setIsPurging(true);
        toast({
            title: t('toast.purge.title'),
        });
        setTimeout(() => {
            setIsPurging(false);
            toast({
                 title: t('toast.purgeSuccess.title'),
            });
        }, 1500);
    }

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/dashboard">
                        <ArrowLeft className="h-4 w-4"/>
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-headline">
                        {t('title')}
                    </h1>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t('globalStatusCard.title')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
                        <WifiOff className="h-8 w-8"/>
                        <div>
                            <p className="font-bold text-lg">{t('globalStatusCard.statusOffline')}</p>
                            <p className="text-sm">{t('globalStatusCard.lastSync', { time: '14h32 (il y a 5 min)' })}</p>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <Button onClick={handleForceSync} disabled={isSyncing} className="flex-1">
                            {isSyncing ? <Loader2 className="mr-2 animate-spin"/> : <RefreshCw className="mr-2"/>}
                            {t('globalStatusCard.forceSync')}
                        </Button>
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive-outline" className="flex-1">
                                    <Trash2 className="mr-2"/>
                                    {t('globalStatusCard.purgeFiles')}
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>{t('purgeDialog.title')}</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        {t('purgeDialog.description')}
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>{t('purgeDialog.cancel')}</AlertDialogCancel>
                                    <AlertDialogAction onClick={handlePurge} disabled={isPurging}>
                                        {isPurging && <Loader2 className="mr-2 animate-spin"/>}
                                        {t('purgeDialog.confirm')}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t('outbox.title', { count: mockPendingItems.length })}</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-3">
                        {mockPendingItems.map(item => (
                            <li key={item.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/50">
                                <div className="flex items-center gap-3">
                                    {item.icon}
                                    <span className="text-sm">{item.description}</span>
                                </div>
                                <Button variant="ghost" size="sm">
                                    <RefreshCw className="mr-2 h-4 w-4"/>
                                    {t('outbox.retry')}
                                </Button>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>

        </div>
    );
}
