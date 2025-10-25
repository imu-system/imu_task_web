
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useTranslations } from 'next-intl';
import { Loader2, Mail, Phone, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="18px" height="18px" {...props}>
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.565-3.108-11.127-7.462l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C39.99,34.556,44,29.86,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
    </svg>
);


export default function AccountSettings() {
    const { user, loading } = useAuth();
    const t = useTranslations('SettingsPage.account');

    if (loading || !user) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }
    
    // Check if the user signed in with Google
    const isGoogleSignIn = user.providerData.some(
        (provider) => provider.providerId === 'google.com'
    );

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>{t('email.title')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                        <div className="flex items-center gap-3">
                            <Mail className="h-5 w-5 text-muted-foreground"/>
                            <span>{user.email}</span>
                        </div>
                        <Button variant="outline" disabled>{t('email.button')}</Button>
                    </div>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>{t('phone.title')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                        <div className="flex items-center gap-3">
                            <Phone className="h-5 w-5 text-muted-foreground"/>
                            <span>{(user as any)?.phone || t('phone.notProvided')}</span>
                        </div>
                        <Button variant="outline">{(user as any)?.phone ? t('phone.buttonEdit') : t('phone.buttonAdd')}</Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t('linkedAccounts.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                    {isGoogleSignIn ? (
                         <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                            <div className="flex items-center gap-3">
                                <GoogleIcon />
                                <div className="font-semibold">{t('linkedAccounts.google')}</div>
                            </div>
                            <Button variant="outline" disabled>{t('linkedAccounts.manage')}</Button>
                        </div>
                    ) : (
                         <Button variant="outline"><GoogleIcon className="mr-2"/>{t('linkedAccounts.linkGoogle')}</Button>
                    )}
                </CardContent>
            </Card>

            <Card className="border-destructive">
                <CardHeader>
                    <CardTitle className="text-destructive">{t('deleteAccount.title')}</CardTitle>
                    <CardDescription>{t('deleteAccount.description')}</CardDescription>
                </CardHeader>
                <CardContent>
                     <Button variant="destructive">
                        <Trash2 className="mr-2"/>
                        {t('deleteAccount.button')}
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
