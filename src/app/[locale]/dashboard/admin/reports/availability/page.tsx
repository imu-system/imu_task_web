
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from '@/navigation';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { Loader2, Clock } from 'lucide-react';
import { UserRole } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";

const availabilityData = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i.toString().padStart(2, '0')}:00`,
  providers: 5 + Math.floor(Math.random() * 20) + (i > 8 && i < 20 ? i - 8 : 0) * 2 - Math.abs(i-14) * 2, // Simulate peak hours
  tasks: 2 + Math.floor(Math.random() * 10) + (i > 10 && i < 18 ? (i - 10) : 0),
}));

export default function AdminAvailabilityReportPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const t = useTranslations('AdminReportsPage.availability');

    useEffect(() => {
        if (!authLoading && (!user || !user.roles?.includes(UserRole.admin))) {
            router.push('/dashboard');
        }
    }, [user, authLoading, router]);

    if (authLoading || !user || !user.roles?.includes(UserRole.admin)) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }
    
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
                    <Clock className="h-8 w-8 text-primary"/>
                    {t('title')}
                </h1>
                <p className="text-muted-foreground">
                    {t('subtitle')}
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t('heatmap.title')}</CardTitle>
                    <CardDescription>{t('heatmap.description')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                        <AreaChart data={availabilityData}>
                            <defs>
                                <linearGradient id="colorProviders" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <XAxis 
                                dataKey="hour" 
                                stroke="#888888" 
                                fontSize={12} 
                                tickLine={false} 
                                axisLine={false} 
                                interval={2}
                            />
                            <YAxis 
                                stroke="#888888" 
                                fontSize={12} 
                                tickLine={false} 
                                axisLine={false}
                            />
                            <Tooltip 
                                cursor={{ fill: 'hsl(var(--muted))' }} 
                                contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                            />
                            <Legend />
                            <Area 
                                type="monotone" 
                                dataKey="providers" 
                                name={t('heatmap.providers')} 
                                stroke="hsl(var(--chart-2))" 
                                fill="url(#colorProviders)" 
                            />
                            <Area 
                                type="monotone" 
                                dataKey="tasks" 
                                name={t('heatmap.tasks')} 
                                stroke="hsl(var(--chart-1))" 
                                fill="url(#colorTasks)" 
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}
