'use client';

/**
 * ClientSpendingChart Component
 * 
 * Phase 9: Option C - Graphiques de statistiques clients
 * 
 * Affiche un graphique en barres des dépenses mensuelles du client
 * avec métriques clés (total, moyenne, tendance)
 */

import { useTranslations } from 'next-intl';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useClientMonthlySpending } from '@/hooks/use-analytics';
import type { MonthlyRevenue } from '@/lib/firestore-analytics';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// ========================================
// TYPES
// ========================================

interface ClientSpendingChartProps {
    userId: string;
    monthsBack?: number;
}

interface ChartTooltipProps {
    active?: boolean;
    payload?: Array<{
        value: number;
        payload: MonthlyRevenue;
    }>;
}

// ========================================
// COMPONENT
// ========================================

export function ClientSpendingChart({ userId, monthsBack = 6 }: ClientSpendingChartProps) {
    const t = useTranslations('Dashboard');
    const { data: monthlySpending, isLoading: loading, isError, error } = useClientMonthlySpending(userId, monthsBack);

    // Calculate metrics
    const totalSpending = monthlySpending?.reduce((sum, month) => sum + month.revenue, 0) || 0;
    const totalBookings = monthlySpending?.reduce((sum, month) => sum + month.bookings, 0) || 0;
    const avgPerMonth = monthlySpending && monthlySpending.length > 0 
        ? totalSpending / monthlySpending.length 
        : 0;

    // Calculate trend (compare last 3 months vs previous 3)
    const calculateTrend = (): { value: number; isPositive: boolean } => {
        if (!monthlySpending || monthlySpending.length < 6) {
            return { value: 0, isPositive: true };
        }

        const recentSpending = monthlySpending.slice(-3).reduce((sum, m) => sum + m.revenue, 0);
        const previousSpending = monthlySpending.slice(-6, -3).reduce((sum, m) => sum + m.revenue, 0);

        if (previousSpending === 0) return { value: 0, isPositive: true };

        const percentChange = ((recentSpending - previousSpending) / previousSpending) * 100;
        return {
            value: Math.abs(percentChange),
            isPositive: percentChange >= 0
        };
    };

    const trend = calculateTrend();

    // Loading state
    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-64 mt-2" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <Skeleton className="h-20 flex-1" />
                            <Skeleton className="h-20 flex-1" />
                            <Skeleton className="h-20 flex-1" />
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
            <Card>
                <CardHeader>
                    <CardTitle>{t('spending.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                        <p>{t('spending.error')}</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Empty state
    if (!monthlySpending || monthlySpending.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>{t('spending.title')}</CardTitle>
                    <CardDescription>{t('spending.description')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center h-[300px] text-center">
                        <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">
                            {t('spending.noData')}
                        </p>
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
                        <CardTitle>{t('spending.title')}</CardTitle>
                        <CardDescription>{t('spending.description')}</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {/* Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {/* Total Spending */}
                    <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
                        <div className="p-2 rounded-full bg-primary/10">
                            <DollarSign className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">
                                {t('spending.totalSpending')}
                            </p>
                            <p className="text-2xl font-bold">
                                {new Intl.NumberFormat('fr-FR', {
                                    style: 'currency',
                                    currency: 'EUR'
                                }).format(totalSpending)}
                            </p>
                        </div>
                    </div>

                    {/* Average per Month */}
                    <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
                        <div className="p-2 rounded-full bg-blue-500/10">
                            <Calendar className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">
                                {t('spending.avgPerMonth')}
                            </p>
                            <p className="text-2xl font-bold">
                                {new Intl.NumberFormat('fr-FR', {
                                    style: 'currency',
                                    currency: 'EUR'
                                }).format(avgPerMonth)}
                            </p>
                        </div>
                    </div>

                    {/* Trend */}
                    <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
                        <div className={cn(
                            "p-2 rounded-full",
                            trend.isPositive ? "bg-orange-500/10" : "bg-green-500/10"
                        )}>
                            {trend.isPositive ? (
                                <TrendingUp className="h-5 w-5 text-orange-500" />
                            ) : (
                                <TrendingDown className="h-5 w-5 text-green-500" />
                            )}
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">
                                {t('spending.trend')}
                            </p>
                            <p className={cn(
                                "text-2xl font-bold",
                                trend.isPositive ? "text-orange-600" : "text-green-600"
                            )}>
                                {trend.isPositive ? '+' : '-'}{trend.value.toFixed(1)}%
                            </p>
                        </div>
                    </div>
                </div>

                {/* Chart */}
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={monthlySpending}
                            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
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
                            <Tooltip content={<CustomTooltip />} />
                            <Bar
                                dataKey="revenue"
                                radius={[8, 8, 0, 0]}
                            >
                                {monthlySpending.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.revenue > 0 ? 'hsl(var(--primary))' : 'hsl(var(--muted))'}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Summary */}
                <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-muted-foreground text-center">
                        {t('spending.summary', { 
                            count: totalBookings,
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
                    <span className="text-sm text-muted-foreground">Dépenses:</span>
                    <span className="font-semibold">
                        {new Intl.NumberFormat('fr-FR', {
                            style: 'currency',
                            currency: 'EUR'
                        }).format(data.revenue)}
                    </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                    <span className="text-sm text-muted-foreground">Missions:</span>
                    <span className="font-semibold">{data.bookings}</span>
                </div>
                {data.bookings > 0 && (
                    <div className="flex items-center justify-between gap-4 pt-1 border-t">
                        <span className="text-sm text-muted-foreground">Moyenne:</span>
                        <span className="font-semibold text-sm">
                            {new Intl.NumberFormat('fr-FR', {
                                style: 'currency',
                                currency: 'EUR'
                            }).format(data.revenue / data.bookings)}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
