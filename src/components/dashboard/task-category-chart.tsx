'use client';

/**
 * TaskCategoryChart Component
 * 
 * Phase 9: Option C - Graphiques de statistiques clients
 * 
 * Affiche un graphique en camembert (PieChart) montrant la répartition
 * des dépenses par catégorie de service
 */

import { useTranslations } from 'next-intl';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Legend,
    Tooltip
} from 'recharts';
import { Package } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useClientCategoryDistribution } from '@/hooks/use-analytics';
import type { CategoryDistribution } from '@/lib/firestore-analytics';
import { Skeleton } from '@/components/ui/skeleton';

// ========================================
// TYPES
// ========================================

interface TaskCategoryChartProps {
    userId: string;
}

interface ChartTooltipProps {
    active?: boolean;
    payload?: Array<{
        value: number;
        payload: CategoryDistribution;
    }>;
}

// ========================================
// COLORS
// ========================================

const COLORS = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
    '#8b5cf6', // violet
    '#ec4899', // pink
    '#f59e0b', // amber
];

// ========================================
// COMPONENT
// ========================================

export function TaskCategoryChart({ userId }: TaskCategoryChartProps) {
    const t = useTranslations('Dashboard');
    const { data: categoryData, isLoading: loading, isError, error } = useClientCategoryDistribution(userId);

    // Calculate totals
    const totalSpending = categoryData?.reduce((sum, cat) => sum + cat.spending, 0) || 0;
    const totalTasks = categoryData?.reduce((sum, cat) => sum + cat.count, 0) || 0;

    // Loading state
    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-64 mt-2" />
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center gap-4">
                        <Skeleton className="h-[300px] w-[300px] rounded-full" />
                        <div className="space-y-2 w-full">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-2/3" />
                        </div>
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
                    <CardTitle>{t('categories.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                        <p>{t('categories.error')}</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Empty state
    if (!categoryData || categoryData.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>{t('categories.title')}</CardTitle>
                    <CardDescription>{t('categories.description')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center h-[300px] text-center">
                        <Package className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">
                            {t('categories.noData')}
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('categories.title')}</CardTitle>
                <CardDescription>{t('categories.description')}</CardDescription>
            </CardHeader>
            <CardContent>
                {/* Summary Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="flex flex-col items-center justify-center p-4 rounded-lg border bg-card">
                        <p className="text-sm text-muted-foreground mb-1">
                            {t('categories.totalSpending')}
                        </p>
                        <p className="text-2xl font-bold">
                            {new Intl.NumberFormat('fr-FR', {
                                style: 'currency',
                                currency: 'EUR'
                            }).format(totalSpending)}
                        </p>
                    </div>
                    <div className="flex flex-col items-center justify-center p-4 rounded-lg border bg-card">
                        <p className="text-sm text-muted-foreground mb-1">
                            {t('categories.totalTasks')}
                        </p>
                        <p className="text-2xl font-bold">{totalTasks}</p>
                    </div>
                </div>

                {/* Pie Chart */}
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={categoryData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={renderCustomLabel}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="spending"
                            >
                                {categoryData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={COLORS[index % COLORS.length]}
                                    />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                                verticalAlign="bottom"
                                height={36}
                                formatter={(value, entry: any) => {
                                    const cat = categoryData.find(c => c.category === entry.payload.category);
                                    return `${value} (${cat?.count || 0})`;
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Category List */}
                <div className="mt-6 space-y-3">
                    {categoryData.slice(0, 5).map((cat, index) => (
                        <div
                            key={cat.category}
                            className="flex items-center justify-between p-3 rounded-lg border bg-card"
                        >
                            <div className="flex items-center gap-3">
                                {/* eslint-disable-next-line react/forbid-dom-props */}
                                <div
                                    className="w-4 h-4 rounded-full"
                                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                />
                                <div>
                                    <p className="font-medium">{cat.category}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {cat.count} {cat.count > 1 ? 'missions' : 'mission'}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-semibold">
                                    {new Intl.NumberFormat('fr-FR', {
                                        style: 'currency',
                                        currency: 'EUR'
                                    }).format(cat.spending)}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {cat.percentage.toFixed(1)}%
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {categoryData.length > 5 && (
                    <p className="text-sm text-muted-foreground text-center mt-4">
                        +{categoryData.length - 5} {t('categories.moreCategories')}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}

// ========================================
// CUSTOM LABEL
// ========================================

function renderCustomLabel(entry: any) {
    if (entry.percentage < 5) return null; // Don't show label for small slices
    return `${entry.percentage.toFixed(0)}%`;
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
            <p className="font-semibold mb-2">{data.category}</p>
            <div className="space-y-1">
                <div className="flex items-center justify-between gap-4">
                    <span className="text-sm text-muted-foreground">Dépenses:</span>
                    <span className="font-semibold">
                        {new Intl.NumberFormat('fr-FR', {
                            style: 'currency',
                            currency: 'EUR'
                        }).format(data.spending)}
                    </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                    <span className="text-sm text-muted-foreground">Missions:</span>
                    <span className="font-semibold">{data.count}</span>
                </div>
                <div className="flex items-center justify-between gap-4 pt-1 border-t">
                    <span className="text-sm text-muted-foreground">Part:</span>
                    <span className="font-semibold">{data.percentage.toFixed(1)}%</span>
                </div>
            </div>
        </div>
    );
}
