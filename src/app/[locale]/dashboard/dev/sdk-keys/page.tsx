
'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { KeyRound, Eye, EyeOff, Copy, RefreshCw, Info } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function SdkKeysPage() {
    const t = useTranslations('DevToolsPage.sdkKeys');
    const { toast } = useToast();
    const [showKey, setShowKey] = useState(false);

    const mockClientKey = 'pk_staging_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6';
    const mockMobileConfig = {
        apiBase: 'https://api.imutask.com/v1',
        env: 'staging',
        featureFlagsUrl: 'https://flags.imutask.com/config'
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: t('copied'),
        });
    };

    return (
        <div className="space-y-8">
             <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
                    <KeyRound className="h-8 w-8 text-primary"/>
                    {t('title')}
                </h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t('clientConfig.title')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between p-4 border rounded-lg bg-muted">
                        <p className="font-mono break-all">
                            {showKey ? mockClientKey : 'pk_staging_********************************'}
                        </p>
                        <div className="flex gap-2 mt-2 md:mt-0">
                            <Button variant="ghost" size="icon" onClick={() => setShowKey(!showKey)}>
                                {showKey ? <EyeOff/> : <Eye/>}
                            </Button>
                             <Button variant="ghost" size="icon" onClick={() => handleCopy(mockClientKey)}>
                                <Copy/>
                            </Button>
                        </div>
                    </div>
                    <Button variant="destructive-outline" disabled>
                        <RefreshCw className="mr-2"/>
                        {t('clientConfig.regenerate')}
                    </Button>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>{t('mobileConfig.title')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <pre className="p-4 bg-muted rounded-lg font-mono text-sm overflow-auto">
                        {JSON.stringify(mockMobileConfig, null, 2)}
                    </pre>
                    <Button variant="outline" onClick={() => handleCopy(JSON.stringify(mockMobileConfig, null, 2))}>
                        <Copy className="mr-2"/>
                        {t('mobileConfig.copy')}
                    </Button>
                </CardContent>
            </Card>

             <Card className="border-yellow-500/50 bg-yellow-500/5 text-yellow-800">
                <CardHeader className="flex flex-row items-center gap-3 space-y-0">
                    <Info className="h-6 w-6"/>
                    <CardTitle className="text-lg">{t('securityNote.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm">{t('securityNote.description')}</p>
                </CardContent>
            </Card>
        </div>
    );
}
