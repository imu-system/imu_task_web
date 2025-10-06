
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useTranslations } from 'next-intl';
import { Loader2, KeyRound, Smartphone, Laptop, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const mockSessions = [
    { id: '1', browser: 'Chrome', city: 'Paris', country: 'FR', isCurrent: true, lastActive: 'Actif maintenant' },
    { id: '2', browser: 'iPhone App', city: 'Metz', country: 'FR', isCurrent: false, lastActive: 'Il y a 2 jours' },
];

export default function SecuritySettings() {
    const { user, loading } = useAuth();
    const t = useTranslations('SettingsPage.security');

    if (loading || !user) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }
    
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>{t('password.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                     <Button variant="outline">{t('password.button')}</Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t('twoFactor.title')}</CardTitle>
                </CardHeader>
                 <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                        <div>
                            <p className="font-semibold">{t('twoFactor.statusLabel')}</p>
                            <p className="text-sm text-destructive">{t('twoFactor.status.disabled')}</p>
                        </div>
                         <div className="flex gap-2">
                             <Button variant="outline">{t('twoFactor.enableSms')}</Button>
                             <Button variant="outline">{t('twoFactor.enableApp')}</Button>
                         </div>
                    </div>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>{t('sessions.title')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {mockSessions.map((session, index) => (
                        <div key={session.id}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                     {session.browser.includes('iPhone') ? <Smartphone className="h-6 w-6 text-muted-foreground"/> : <Laptop className="h-6 w-6 text-muted-foreground"/>}
                                     <div>
                                        <p className="font-semibold">{session.browser}</p>
                                        <p className="text-sm text-muted-foreground">{session.city}, {session.country} • {session.lastActive}</p>
                                     </div>
                                </div>
                                {session.isCurrent ? (
                                    <span className="text-sm font-semibold text-green-600">{t('sessions.currentSession')}</span>
                                ) : (
                                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                                        <Trash2 className="mr-2"/>
                                        {t('sessions.disconnect')}
                                    </Button>
                                )}
                            </div>
                             {index < mockSessions.length - 1 && <Separator className="mt-4"/>}
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    )
}
