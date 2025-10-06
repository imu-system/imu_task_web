
'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Link } from '@/navigation';
import { ArrowLeft, Share2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="18px" height="18px" {...props}>
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.565-3.108-11.127-7.462l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C39.99,34.556,44,29.86,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
    </svg>
)

const AppleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18px" height="18px" {...props} fill="currentColor">
       <path d="M16.142,4.334c0.165-0.155,0.293-0.342,0.378-0.55C16.24,2.77,15.446,2,14.512,2c-0.32,0-0.74,0.118-1.125,0.334 c-0.428,0.244-0.89,0.56-1.383,0.56c-0.473,0-0.908-0.315-1.324-0.56C10.292,2.118,9.873,2,9.553,2C8.618,2,7.824,2.77,7.545,3.784 c0.085,0.208,0.213,0.395,0.378,0.55C6.188,6.046,5,8.857,5,12.012c0,3.22,1.242,5.972,3,7.59c0.43,0.402,0.852,0.84,1.38,1.152 C9.86,20.91,10.291,21,10.662,21c0.46,0,0.848-0.18,1.282-0.528c0.018-0.013,0.033-0.029,0.05-0.045 c0.018-0.018,0.037-0.033,0.055-0.051c0.41-0.411,0.729-0.915,0.92-1.476c-0.598-0.327-1.074-0.789-1.42-1.398 c-0.418-0.713-0.638-1.58-0.638-2.583c0-0.342,0.033-0.684,0.096-1.014c0.559,0.003,1.121-0.16,1.678-0.492 c1.248-0.756,2.11-1.923,2.448-3.3C18.98,6.33,17.915,4.722,16.142,4.334z M13.111,10.518c0.049-1.395,0.745-2.61,1.558-3.256 c-0.006,0.003-0.012,0.007-0.018,0.01c-0.74,0.407-1.283,1.186-1.47,2.118C13.151,9.757,13.111,10.137,13.111,10.518z"/>
    </svg>
)

export default function AvailabilitySettingsPage() {
    const t = useTranslations('AvailabilitySettingsPage');
    const { user, loading } = useAuth();
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            toast({
                title: t('toast.successTitle'),
                description: t('toast.successDescription'),
            });
        }, 1500);
    };

    if (loading || !user) {
      return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin h-12 w-12"/></div>
    }

    return (
        <div className="space-y-8 max-w-2xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/dashboard/availability">
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
                    <CardTitle>{t('sync.title')}</CardTitle>
                    <CardDescription>{t('sync.description')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                            <GoogleIcon />
                            <Label htmlFor="google-sync">{t('sync.google')}</Label>
                        </div>
                        <Switch id="google-sync" />
                    </div>
                     <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                            <AppleIcon />
                            <Label htmlFor="apple-sync">{t('sync.apple')}</Label>
                        </div>
                        <Switch id="apple-sync" />
                    </div>
                    <Separator/>
                     <Button variant="secondary" className="w-full">
                        <Share2 className="mr-2"/>
                        {t('sync.export')}
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t('rules.title')}</CardTitle>
                    <CardDescription>{t('rules.description')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                        <Label htmlFor="auto-decline" className="flex-1">{t('rules.decline')}</Label>
                        <Switch id="auto-decline" />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                        <Label htmlFor="auto-busy" className="flex-1">{t('rules.markBusy')}</Label>
                        <Switch id="auto-busy" defaultChecked />
                    </div>
                </CardContent>
            </Card>
            
            <div className="flex justify-end">
                <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving && <Loader2 className="animate-spin mr-2"/>}
                    {t('saveButton')}
                </Button>
            </div>
        </div>
    );
}

    