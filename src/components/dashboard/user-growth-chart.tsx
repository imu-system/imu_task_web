'use client';

/**
 * UserGrowthChart Component
 * 
 * Phase 9: Option D - Dashboard Admin
 * 
 * Affiche un graphique d'aire empilée de la croissance des utilisateurs
 * - Clients (bleu)
 * - Providers (vert)
 * - Total cumulatif
 */

import { useTranslations } from 'next-intl';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';
import { Users, UserPlus, Briefcase } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUserGrowth, type UserGrowth } from '@/hooks/use-admin-stats';
import { Skeleton } from '@/components/ui/skeleton';

// ========================================
// TYPES
// ========================================

interface UserGrowthChartProps {
    monthsBack?: number;
}

interface ChartTooltipProps {
    active?: boolean;
    payload?: Array<{
        value: number;
        dataKey: string;
        color: string;
        payload: UserGrowth;
    }>;
}

// ========================================
// COMPONENT
// ========================================

export function UserGrowthChart({ monthsBack = 6 }: UserGrowthChartProps) {
    const t = useTranslations('Admin');
    const { data: userGrowth, loading, error } = useUserGrowth(monthsBack);

    // Calculate metrics
    const totalNewClients = userGrowth?.reduce((sum, month) => sum + month.newClients, 0) || 0;
    const totalNewProviders = userGrowth?.reduce((sum, month) => sum + month.newProviders, 0) || 0;
    const currentTotal = userGrowth?.[userGrowth.length - 1]?.totalUsers || 0;

    // Loading state
    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-64" />
                    <Skeleton className="h-4 w-80 mt-2" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Skeleton className="h-24" />
                            <Skeleton className="h-24" />
                            <Skeleton className="h-24" />
                        </div>
                        <Skeleton className="h-[300px] w-full" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Error state
    if (error) {
        return (
            <Card className="border-destructive">
                <CardHeader>
                    <CardTitle>{t('userGrowth.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                        <p>{t('userGrowth.error')}</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Empty state
    if (!userGrowth || userGrowth.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>{t('userGrowth.title')}</CardTitle>
                    <CardDescription>{t('userGrowth.description')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center h-[300px] text-center">
                        <Users className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">{t('userGrowth.noData')}</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('userGrowth.title')}</CardTitle>
                <CardDescription>{t('userGrowth.description')}</CardDescription>
            </CardHeader>
            <CardContent>
                {/* Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {/* New Clients */}
                    <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
                        <div className="p-2 rounded-full bg-blue-500/10">
                            <UserPlus className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">
                                {t('userGrowth.newClients')}
                            </p>
                            <p className="text-2xl font-bold">+{totalNewClients}</p>
                        </div>
                    </div>

                    {/* New Providers */}
                    <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
                        <div className="p-2 rounded-full bg-green-500/10">
                            <Briefcase className="h-5 w-5 text-green-500" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">
                                {t('userGrowth.newProviders')}
                            </p>
                            <p className="text-2xl font-bold">+{totalNewProviders}</p>
                        </div>
                    </div>

                    {/* Total Users */}
                    <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
                        <div className="p-2 rounded-full bg-primary/10">
                            <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">
                                {t('userGrowth.totalUsers')}
                            </p>
                            <p className="text-2xl font-bold">{currentTotal}</p>
                        </div>
                    </div>
                </div>

                {/* Chart */}
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={userGrowth}
                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis
                                dataKey="month"
                                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                                tickLine={{ stroke: 'hsl(var(--border))' }}
                            />
                            <YAxis
                                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                                tickLine={{ stroke: 'hsl(var(--border))' }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Area
                                type="monotone"
                                dataKey="newClients"
                                stackId="1"
                                stroke="hsl(217, 91%, 60%)"
                                fill="hsl(217, 91%, 60%)"
                                fillOpacity={0.6}
                                name="Nouveaux clients"
                            />
                            <Area
                                type="monotone"
                                dataKey="newProviders"
                                stackId="1"
                                stroke="hsl(142, 76%, 36%)"
                                fill="hsl(142, 76%, 36%)"
                                fillOpacity={0.6}
                                name="Nouveaux providers"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Summary */}
                <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-muted-foreground text-center">
                        {t('userGrowth.summary', {
                            total: totalNewClients + totalNewProviders,
                            months: monthsBack
                        })}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}

// ========================================
// CUSTOM TOOLTIP
// ========================================

function CustomTooltip({ active, payload }: ChartTooltipProps) {
    if (!active || !payload || payload.length === 0) {
        return null;
    }

    const data = payload[0].payload;

    return (
        <div className="rounded-lg border bg-background p-3 shadow-lg">
            <p className="font-semibold mb-2">{data.month}</p>
            <div className="space-y-1">
                <div className="flex items-center justify-between gap-4">
                    <span className="text-sm text-blue-600">Clients:</span>
                    <span className="font-semibold">+{data.newClients}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                    <span className="text-sm text-green-600">Providers:</span>
                    <span className="font-semibold">+{data.newProviders}</span>
                </div>
                <div className="flex items-center justify-between gap-4 pt-1 border-t">
                    <span className="text-sm text-muted-foreground">Total cumulé:</span>
                    <span className="font-semibold">{data.totalUsers}</span>
                </div>
            </div>
        </div>
    );
}
