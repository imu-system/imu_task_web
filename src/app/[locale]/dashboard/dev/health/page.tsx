
'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, RefreshCw, Trash2, CheckCircle, AlertTriangle } from 'lucide-react';

const mockServices = [
    { name: 'API (web)', status: 'ok', latency: '120ms' },
    { name: 'Worker (queues)', status: 'ok', backlog: '12' },
    { name: 'Stripe webhooks', status: 'degraded', error: '10m ago' },
    { name: 'TURN server', status: 'ok', latency: '30ms' },
];

const mockLogs = [
    'INFO: User usr_1 logged in.',
    'WARN: High latency detected on Stripe webhook endpoint.',
    'INFO: Task task_abc created.',
    'ERROR: Failed to process payment pi_123.',
];


export default function HealthPage() {
    const t = useTranslations('DevToolsPage.health');

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>{t('services.title')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {mockServices.map(service => (
                        <div key={service.name} className="flex items-center justify-between p-3 rounded-lg border">
                            <div className="flex items-center gap-3">
                                {service.status === 'ok' ? 
                                    <CheckCircle className="h-5 w-5 text-green-500"/> : 
                                    <AlertTriangle className="h-5 w-5 text-yellow-500"/>}
                                <span className="font-medium">{service.name}</span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                                {service.status === 'ok' ? 
                                    (service.latency ? `p99: ${service.latency}`: `backlog: ${service.backlog}`) :
                                    `last error: ${service.error}`
                                }
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t('actions.title')}</CardTitle>
                </CardHeader>
                 <CardContent className="flex gap-2">
                    <Button variant="outline"><RefreshCw className="mr-2"/>{t('actions.runHealthcheck')}</Button>
                    <Button variant="destructive-outline"><Trash2 className="mr-2"/>{t('actions.clearCache')}</Button>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>{t('logs.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <pre className="bg-muted p-4 rounded-lg text-xs font-mono max-h-60 overflow-auto">
                        {mockLogs.join('\n')}
                    </pre>
                </CardContent>
            </Card>
        </div>
    );
}
