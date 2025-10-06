
'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { ResponsiveContainer, AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Download, Filter } from 'lucide-react';

const rolloutListData = [
    { id: 'flag1', name: 'new-payment-flow (staging)', exposure: 45, conversion: 6 },
    { id: 'flag2', name: 'mobile-a-b (staging)', exposure: 12, conversion: -3 },
    { id: 'flag3', name: 'onboarding-guides (prod)', exposure: 100, conversion: 2 },
];

const exposureData = Array.from({ length: 7 }, (_, i) => ({
  date: `Day ${i + 1}`,
  exposure: 10 + i * 5 + Math.random() * 5,
}));

const kpiData = [
  { name: 'Day 1', control: 5.0, variant: 5.2 },
  { name: 'Day 2', control: 5.1, variant: 5.4 },
  { name: 'Day 3', control: 5.2, variant: 5.8 },
  { name: 'Day 4', control: 5.3, variant: 6.2 },
  { name: 'Day 5', control: 5.4, variant: 6.5 },
];

const segmentData = [
  { segment: 'Mobile', control: 60, variantA: 40 },
  { segment: 'Desktop', control: 55, variantA: 45 },
  { segment: 'New Users', control: 58, variantA: 42 },
];

export default function RolloutsPage() {
    const t = useTranslations('DevToolsPage.rollouts');

    return (
        <div className="space-y-8">
             <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">
                    {t('title')}
                </h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t('list.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                        <Select defaultValue="all">
                            <SelectTrigger className="w-[180px]"><SelectValue placeholder={t('list.filterFlag')} /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t('list.allFlags')}</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select defaultValue="staging">
                             <SelectTrigger className="w-[180px]"><SelectValue placeholder={t('list.filterEnv')} /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="staging">Staging</SelectItem>
                                <SelectItem value="production">Production</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline"><Filter className="mr-2"/>{t('list.filter')}</Button>
                    </div>
                    <ul className="space-y-2">
                        {rolloutListData.map(item => (
                            <li key={item.id} className="flex flex-wrap items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                                <span className="font-mono">{item.name}</span>
                                <div className="flex items-center gap-4 text-sm">
                                    <span>{t('list.exposure', { value: item.exposure })}</span>
                                    <span className={item.conversion > 0 ? 'text-green-600' : 'text-red-600'}>{t('list.conversion', { value: item.conversion.toFixed(1) })}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>{t('detail.title')}</CardTitle>
                            <CardDescription>new-payment-flow (staging)</CardDescription>
                        </div>
                        <Button variant="outline"><Download className="mr-2"/>{t('detail.export')}</Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-8">
                    <div>
                        <h3 className="font-semibold mb-2">{t('detail.exposureOverTime')}</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={exposureData}>
                                     <defs>
                                        <linearGradient id="colorExposure" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false}/>
                                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`}/>
                                    <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} formatter={(v) => `${(v as number).toFixed(1)}%`} />
                                    <Area type="monotone" dataKey="exposure" stroke="hsl(var(--primary))" fill="url(#colorExposure)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                     <div>
                        <h3 className="font-semibold mb-2">{t('detail.kpiConversion')}</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={kpiData}>
                                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false}/>
                                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`}/>
                                    <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} formatter={(v) => `${(v as number).toFixed(2)}%`} />
                                    <Legend/>
                                    <Line type="monotone" dataKey="control" name="Control" stroke="hsl(var(--chart-2))" />
                                    <Line type="monotone" dataKey="variant" name="Variant A" stroke="hsl(var(--chart-1))" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                     <div>
                        <h3 className="font-semibold mb-2">{t('detail.segmentExposure')}</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={segmentData} layout="vertical">
                                    <XAxis type="number" hide/>
                                    <YAxis type="category" dataKey="segment" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} width={80}/>
                                    <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} formatter={(v) => `${v}%`}/>
                                    <Legend/>
                                    <Bar dataKey="control" name="Control" stackId="a" fill="hsl(var(--chart-2))" />
                                    <Bar dataKey="variantA" name="Variant A" stackId="a" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]}/>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
