'use client';

/**
 * GMVChart Component
 * 
 * Phase 9: Option D - Dashboard Admin
 * 
 * Affiche un graphique combiné (barres + ligne) du GMV et des revenus plateforme
 * - Barres: GMV (volume total des transactions)
 * - Ligne: Revenus de la plateforme (commission 15-20%)
 */

import { useTranslations } from 'next-intl';
import {
    ComposedChart,
    Bar,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { DollarSign, TrendingUp, Activity } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useGMVByMonth, usePlatformRevenue, type MonthlyGMV } from '@/hooks/use-admin-stats';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { LiveIndicatorCompact } from './live-indicator';

// ========================================
// TYPES
// ========================================

interface GMVChartProps {
    monthsBack?: number;
    commissionRate?: number; // 0.15 = 15%
}

interface ChartTooltipProps {
    active?: boolean;
    payload?: Array<{
        value: number;
        dataKey: string;
        color: string;
        payload: MonthlyGMV & { platformRevenue?: number };
    }>;
}

// ========================================
// COMPONENT
// ========================================

export function GMVChart({ monthsBack = 6, commissionRate = 0.15 }: GMVChartProps) {
    const t = useTranslations('Admin');
    const { data: gmvData, loading: gmvLoading, error: gmvError, lastUpdate } = useGMVByMonth(monthsBack);
    const { data: revenueData, loading: revenueLoading } = usePlatformRevenue(monthsBack, commissionRate);

    const loading = gmvLoading || revenueLoading;
    const error = gmvError;

    // Combine GMV and revenue data
    const chartData = gmvData?.map((gmv, index) => ({
        ...gmv,
        platformRevenue: revenueData?.[index]?.revenue || 0
    }));

    // Calculate metrics
    const totalGMV = chartData?.reduce((sum, month) => sum + month.gmv, 0) || 0;
    const totalRevenue = chartData?.reduce((sum, month) => sum + (month.platformRevenue || 0), 0) || 0;
    const totalTransactions = chartData?.reduce((sum, month) => sum + month.transactions, 0) || 0;
    const avgTransaction = totalTransactions > 0 ? totalGMV / totalTransactions : 0;

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
                        <Skeleton className="h-[350px] w-full" />
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
                    <CardTitle>{t('gmv.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-[350px] text-muted-foreground">
                        <p>{t('gmv.error')}</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Empty state
    if (!chartData || chartData.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>{t('gmv.title')}</CardTitle>
                    <CardDescription>{t('gmv.description')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center h-[350px] text-center">
                        <Activity className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">{t('gmv.noData')}</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>{t('gmv.title')}</CardTitle>
                        <CardDescription>{t('gmv.description')}</CardDescription>
                    </div>
                    <LiveIndicatorCompact lastUpdate={lastUpdate ?? null} />
                </div>
            </CardHeader>
            <CardContent>
                {/* Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {/* Total GMV */}
                    <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
                        <div className="p-2 rounded-full bg-primary/10">
                            <DollarSign className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">
                                {t('gmv.totalGMV')}
                            </p>
                            <p className="text-2xl font-bold">
                                {new Intl.NumberFormat('fr-FR', {
                                    style: 'currency',
                                    currency: 'EUR',
                                    notation: 'compact'
                                }).format(totalGMV)}
                            </p>
                        </div>
                    </div>

                    {/* Platform Revenue */}
                    <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
                        <div className="p-2 rounded-full bg-green-500/10">
                            <TrendingUp className="h-5 w-5 text-green-500" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">
                                {t('gmv.platformRevenue')}
                            </p>
                            <p className="text-2xl font-bold">
                                {new Intl.NumberFormat('fr-FR', {
                                    style: 'currency',
                                    currency: 'EUR',
                                    notation: 'compact'
                                }).format(totalRevenue)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {(commissionRate * 100).toFixed(0)}% commission
                            </p>
                        </div>
                    </div>

                    {/* Average Transaction */}
                    <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
                        <div className="p-2 rounded-full bg-blue-500/10">
                            <Activity className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">
                                {t('gmv.avgTransaction')}
                            </p>
                            <p className="text-2xl font-bold">
                                {new Intl.NumberFormat('fr-FR', {
                                    style: 'currency',
                                    currency: 'EUR'
                                }).format(avgTransaction)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {totalTransactions} transactions
                            </p>
                        </div>
                    </div>
                </div>

                {/* Chart */}
                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart
                            data={chartData}
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
                                tickFormatter={(value) =>
                                    new Intl.NumberFormat('fr-FR', {
                                        style: 'currency',
                                        currency: 'EUR',
                                        notation: 'compact'
                                    }).format(value)
                                }
                            />
                            <Tooltip content={<CustomTooltip commissionRate={commissionRate} />} />
                            <Legend />
                            <Bar
                                dataKey="gmv"
                                fill="hsl(var(--primary))"
                                name="GMV (Volume total)"
                                radius={[8, 8, 0, 0]}
                            />
                            <Line
                                type="monotone"
                                dataKey="platformRevenue"
                                stroke="hsl(142, 76%, 36%)"
                                strokeWidth={3}
                                name="Revenus plateforme"
                                dot={{ r: 4 }}
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>

                {/* Summary */}
                <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-muted-foreground text-center">
                        {t('gmv.summary', {
                            transactions: totalTransactions,
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

function CustomTooltip({ active, payload, commissionRate }: ChartTooltipProps & { commissionRate: number }) {
    if (!active || !payload || payload.length === 0) {
        return null;
    }

    const data = payload[0].payload;

    return (
        <div className="rounded-lg border bg-background p-3 shadow-lg">
            <p className="font-semibold mb-2">{data.month}</p>
            <div className="space-y-1">
                <div className="flex items-center justify-between gap-4">
                    <span className="text-sm text-muted-foreground">GMV:</span>
                    <span className="font-semibold">
                        {new Intl.NumberFormat('fr-FR', {
                            style: 'currency',
                            currency: 'EUR'
                        }).format(data.gmv)}
                    </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                    <span className="text-sm text-muted-foreground">Revenus:</span>
                    <span className="font-semibold text-green-600">
                        {new Intl.NumberFormat('fr-FR', {
                            style: 'currency',
                            currency: 'EUR'
                        }).format(data.platformRevenue || 0)}
                    </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                    <span className="text-sm text-muted-foreground">Transactions:</span>
                    <span className="font-semibold">{data.transactions}</span>
                </div>
                <div className="flex items-center justify-between gap-4 pt-1 border-t">
                    <span className="text-sm text-muted-foreground">Commission:</span>
                    <span className="font-semibold text-sm">
                        {(commissionRate * 100).toFixed(0)}%
                    </span>
                </div>
            </div>
        </div>
    );
}
