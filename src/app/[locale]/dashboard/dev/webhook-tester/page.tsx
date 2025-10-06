
'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Send, Save, PlusCircle, Trash2 } from 'lucide-react';

const mockLogs = [
    { time: "12:10:05", status: 200, statusText: "OK", latency: "122ms", response: '{"ok":true}' },
    { time: "11:55:30", status: 500, statusText: "Internal Server Error", latency: "300ms", response: '{"error":"something went wrong"}' },
];

export default function WebhookTesterPage() {
    const t = useTranslations('DevToolsPage.webhookTester');

    return (
        <div className="space-y-8">
             <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">
                    {t('title')}
                </h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t('card.title')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex gap-2">
                        <div className="w-40">
                             <Label htmlFor="method">{t('card.method')}</Label>
                             <Select defaultValue="POST">
                                <SelectTrigger id="method">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="POST">POST</SelectItem>
                                    <SelectItem value="PUT">PUT</SelectItem>
                                    <SelectItem value="PATCH">PATCH</SelectItem>
                                    <SelectItem value="DELETE">DELETE</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex-1 space-y-2">
                            <Label htmlFor="url">{t('card.url')}</Label>
                            <Input id="url" placeholder="https://example.com/webhook-test" />
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="payload">{t('card.payload')}</Label>
                        <Textarea id="payload" placeholder='{ "event": "user.created", "userId": "usr_123" }' className="font-mono" rows={8}/>
                    </div>
                    <div className="space-y-4">
                        <Label>{t('card.headers')}</Label>
                        <div className="flex gap-2 items-center">
                            <Input placeholder="Authorization" defaultValue="Authorization" className="w-1/3"/>
                            <Input placeholder="Bearer ..." defaultValue="Bearer sk_test_..." className="flex-1"/>
                            <Button variant="ghost" size="icon"><Trash2 className="text-destructive"/></Button>
                        </div>
                        <Button variant="outline" size="sm"><PlusCircle className="mr-2"/>{t('card.addHeader')}</Button>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="secondary"><Save className="mr-2"/>{t('card.saveTemplate')}</Button>
                        <Button><Send className="mr-2"/>{t('card.sendTest')}</Button>
                    </div>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>{t('logs.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <pre className="bg-muted p-4 rounded-lg text-xs font-mono max-h-80 overflow-auto">
                        {mockLogs.map((log, i) => (
                            <div key={i} className={`p-2 ${i > 0 ? 'border-t border-muted-foreground/20' : ''}`}>
                                <p><span className="text-muted-foreground">{log.time}</span> --- <span className={log.status === 200 ? 'text-green-500' : 'text-red-500'}>{log.status} {log.statusText}</span> --- <span className="text-blue-500">{log.latency}</span></p>
                                <p>{t('logs.response')}: {log.response}</p>
                            </div>
                        ))}
                    </pre>
                </CardContent>
            </Card>
        </div>
    );
}

