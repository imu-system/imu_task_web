
'use client';

import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, UserCircle, Calendar, PauseCircle, RotateCcw, Plus, TestTube, BarChart, Clock } from 'lucide-react';
import { Link } from '@/navigation';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';

const mockFlagData = {
    'new-payment-flow': {
        description: "Switch to new payment flow (A/B test)",
        owner: '@alice',
        created: '2025-08-01',
        status: 'ROLLING',
        env: 'staging',
        exposure: 45,
        conversions: 6,
        errors: 0.2
    }
};

const mockHistory = [
    { time: "12:34", event: "updated rollout -> 45% by @alice" },
    { time: "11:15", event: "rule added (country=FR) by @devops" },
    { time: "10:02", event: "flag created by @alice" },
];

const exposureData = Array.from({ length: 7 }, (_, i) => ({
    date: `Day ${i + 1}`,
    exposure: 10 + i * 5 + Math.random() * 5,
}));


export default function FlagDetailPage() {
    const params = useParams();
    const t = useTranslations('DevToolsPage.flagDetail');
    const flagKey = params.flagKey as string;
    const flag = mockFlagData[flagKey as keyof typeof mockFlagData] || mockFlagData['new-payment-flow'];

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/dashboard/dev/flags">
                            <ArrowLeft className="h-4 w-4"/>
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight font-headline">
                            <span className="text-muted-foreground">{t('flagTitle')}:</span> {flagKey}
                        </h1>
                    </div>
                </div>
                <Select defaultValue={flag.env}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="staging">Env: staging</SelectItem>
                        <SelectItem value="production">Env: production</SelectItem>
                    </SelectContent>
                </Select>
            </div>

             <Card>
                <CardHeader>
                    <CardTitle>{t('overview.title')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                            <p className="text-sm text-muted-foreground">{t('overview.key')}</p>
                            <p className="font-mono">{flagKey}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">{t('overview.status')}</p>
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary">{flag.status}</Badge>
                                <Button variant="outline" size="sm"><PauseCircle className="mr-2"/>{t('overview.pause')}</Button>
                                <Button variant="outline" size="sm"><RotateCcw className="mr-2"/>{t('overview.rollback')}</Button>
                            </div>
                        </div>
                    </div>
                     <p className="text-sm text-muted-foreground italic">"{flag.description}"</p>
                    <div className="flex gap-6 text-sm">
                        <div className="flex items-center gap-2">
                            <UserCircle className="text-muted-foreground"/>
                            <span>{t('overview.owner')}: {flag.owner}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="text-muted-foreground"/>
                            <span>{t('overview.created')}: {flag.created}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                 <Card>
                    <CardHeader>
                        <CardTitle>{t('targeting.title')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-3 bg-muted rounded-md">{t('targeting.rule1')}</div>
                        <div className="p-3 bg-muted rounded-md">{t('targeting.rule2')}</div>
                        <div className="p-3 bg-muted rounded-md">{t('targeting.default')}</div>
                        <div className="flex gap-2">
                            <Button variant="outline"><Plus className="mr-2"/>{t('targeting.addRule')}</Button>
                            <Button variant="secondary"><TestTube className="mr-2"/>{t('targeting.testUser')}</Button>
                        </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>{t('metrics.title')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p>{t('metrics.exposure')}: <strong>{flag.exposure}%</strong></p>
                        <p>{t('metrics.conversions')}: <strong className="text-green-600">+{flag.conversions}%</strong> vs ctrl</p>
                        <p>{t('metrics.errors')}: <strong className="text-red-600">{flag.errors}%</strong></p>
                        <div className="h-40">
                             <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={exposureData}>
                                    <defs>
                                        <linearGradient id="colorExposure" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <Area type="monotone" dataKey="exposure" stroke="hsl(var(--primary))" fill="url(#colorExposure)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t('schedule.title')}</CardTitle>
                </CardHeader>
                 <CardContent>
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                        <span><strong>{t('schedule.start')}:</strong> 2025-09-10 10:00 UTC</span>
                        <span><strong>{t('schedule.end')}:</strong> N/A</span>
                    </div>
                 </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>{t('history.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2">
                        {mockHistory.map((item, index) => (
                            <li key={index} className="flex items-center gap-2 text-sm">
                                <span className="font-mono text-muted-foreground">{item.time}</span>
                                <span>{item.event}</span>
                            </li>
                        ))}
                    </ul>
                     <Button variant="link" asChild className="p-0 mt-2"><Link href="#">{t('history.fullAudit')}</Link></Button>
                </CardContent>
            </Card>
        </div>
    )
}
