
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useTranslations } from 'next-intl';
import { Loader2, Mail, Shield, Trash2, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
} from "@/components/ui/alert-dialog"

export default function SettingsHubPage() {
    const { user, loading } = useAuth();
    const t = useTranslations('SettingsPage');

    if (loading || !user) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('hub.title')}</CardTitle>
                <CardDescription>{t('hub.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                        <p className="font-semibold">{t('hub.email.label')}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                     <Button variant="outline" disabled>{t('hub.email.button')}</Button>
                </div>
                 <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                        <p className="font-semibold">{t('hub.payment.label')}</p>
                        <p className="text-sm text-muted-foreground">{t('hub.payment.value')}</p>
                    </div>
                    <Button variant="outline" disabled>{t('hub.payment.button')}</Button>
                </div>
                 <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                        <p className="font-semibold">{t('hub.twoFactor.label')}</p>
                        <p className="text-sm text-destructive">{t('hub.twoFactor.value')}</p>
                    </div>
                    <Button variant="outline">{t('hub.twoFactor.button')}</Button>
                </div>
                <Card className="bg-muted/50">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                           <Download className="h-5 w-5"/>
                           {t('hub.gdpr.title')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center gap-4">
                        <Button variant="secondary">{t('hub.gdpr.export')}</Button>
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive-outline">
                                    <Trash2 className="mr-2"/>
                                    {t('hub.gdpr.delete')}
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>{t('hub.gdpr.dialog.title')}</AlertDialogTitle>
                                    <AlertDialogDescription>{t('hub.gdpr.dialog.description')}</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>{t('hub.gdpr.dialog.cancel')}</AlertDialogCancel>
                                    <AlertDialogAction>{t('hub.gdpr.dialog.confirm')}</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </CardContent>
                </Card>
            </CardContent>
        </Card>
    )
}
