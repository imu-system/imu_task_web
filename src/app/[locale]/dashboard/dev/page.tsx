
'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Flag, AreaChart, Users, AlertTriangle, HelpCircle, PlusCircle, Upload, Play, Clock, RefreshCw } from 'lucide-react';

const kpiData = [
  { titleKey: "kpi.totalFlags", value: "18", icon: <Flag /> },
  { titleKey: "kpi.activeRollouts", value: "4", icon: <AreaChart /> },
  { titleKey: "kpi.betaUsers", value: "132", icon: <Users /> },
  { titleKey: "kpi.errors", value: "0", icon: <AlertTriangle /> },
];

const recentActivity = [
    { time: "12:34", event: "flag `new-payment-flow` updated by @alice" },
    { time: "11:10", event: "rollout `mobile-a-b` reached 50%" },
];


export default function DevToolsDashboardPage() {
    const t = useTranslations('DevToolsPage');

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                     <h1 className="text-3xl font-bold tracking-tight font-headline">
                        {t('title')}
                    </h1>
                </div>
                <div className="flex items-center gap-2">
                    <Select defaultValue="staging">
                        <SelectTrigger className="w-[180px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="staging">Env: staging</SelectItem>
                            <SelectItem value="production">Env: production</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline" size="icon"><HelpCircle/></Button>
                </div>
            </div>

            <Card>
                <CardContent className="p-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {kpiData.map(kpi => (
                        <div key={kpi.titleKey} className="p-4 bg-muted rounded-lg">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">{t(kpi.titleKey as any)}</p>
                                {kpi.icon}
                            </div>
                            <p className="text-2xl font-bold mt-1">{kpi.value}</p>
                        </div>
                    ))}
                </CardContent>
                 <CardContent>
                     <p className="text-xs text-muted-foreground">{t('lastDeploy')}: 2025-09-12 12:34 UTC</p>
                </CardContent>
            </Card>
            
            <div className="flex flex-wrap gap-2">
                <Button><PlusCircle className="mr-2"/>{t('quickActions.createFlag')}</Button>
                <Button variant="outline"><Upload className="mr-2"/>{t('quickActions.importFlags')}</Button>
                <Button variant="outline"><Play className="mr-2"/>{t('quickActions.runFixtures')}</Button>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>{t('activity.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">{t('activity.time')}</TableHead>
                                <TableHead>{t('activity.event')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentActivity.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell className="font-mono text-xs text-muted-foreground">{item.time}</TableCell>
                                    <TableCell>{item.event}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

        </div>
    );
}
