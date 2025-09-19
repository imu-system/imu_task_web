'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Trash2, FileSpreadsheet, HardHat } from 'lucide-react';
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

const mockLogs = [
    '14:32:10 INFO: Starting seed: demo-city...',
    '14:32:12 INFO: Created 50 users.',
    '14:32:15 INFO: Created 200 tasks.',
    '14:32:16 SUCCESS: Seed demo-city completed successfully.',
];

export default function FixturesPage() {
    const t = useTranslations('DevToolsPage.fixtures');
    const [logs, setLogs] = useState<string[]>([]);

    const handleRunSeed = (seedName: string) => {
        // In a real app, this would trigger a server action
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Running seed: ${seedName}...`]);
        setTimeout(() => {
            setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] SUCCESS: Seed ${seedName} completed.`]);
        }, 2000);
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
                    <HardHat className="h-8 w-8 text-primary"/>
                    {t('title')}
                </h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t('actions.title')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <Button variant="outline" className="w-full justify-start" onClick={() => handleRunSeed('demo-city')}>
                        <Play className="mr-2"/>
                        {t('actions.runDemoCity')}
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => handleRunSeed('heavy-load')}>
                        <Play className="mr-2"/>
                        {t('actions.runHeavyLoad')}
                    </Button>
                     <Button variant="outline" className="w-full justify-start">
                        <FileSpreadsheet className="mr-2"/>
                        {t('actions.generateCsv')}
                    </Button>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive-outline" className="w-full justify-start">
                                <Trash2 className="mr-2"/>
                                {t('actions.clearTestData')}
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                             <AlertDialogHeader>
                                <AlertDialogTitle>{t('dialog.title')}</AlertDialogTitle>
                                <AlertDialogDescription>{t('dialog.description')}</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>{t('dialog.cancel')}</AlertDialogCancel>
                                <AlertDialogAction>{t('dialog.confirm')}</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t('logs.title')}</CardTitle>
                </CardHeader>
                 <CardContent>
                    <pre className="bg-muted p-4 rounded-lg text-xs font-mono max-h-60 overflow-auto">
                        {logs.length > 0 ? logs.join('\n') : t('logs.placeholder')}
                    </pre>
                </CardContent>
            </Card>
        </div>
    );
}

