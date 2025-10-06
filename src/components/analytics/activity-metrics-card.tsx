'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Activity, Clock, CheckCircle2, Target } from 'lucide-react';
import { ActivityMetrics } from '@/lib/analytics/dashboard-analytics';

interface ActivityMetricsCardProps {
    metrics: ActivityMetrics;
    role: 'client' | 'provider';
}

export function ActivityMetricsCard({ metrics, role }: ActivityMetricsCardProps) {
    const formatHours = (hours: number) => {
        if (hours < 24) return `${hours.toFixed(1)}h`;
        const days = Math.floor(hours / 24);
        return `${days}j ${(hours % 24).toFixed(0)}h`;
    };

    const getMetricColor = (value: number, threshold: number, inverse = false) => {
        const isGood = inverse ? value < threshold : value > threshold;
        return isGood ? 'text-green-600' : 'text-yellow-600';
    };

    const clientMetrics = [
        {
            title: 'Tâches Créées',
            value: metrics.tasksCreated,
            icon: Activity,
            color: 'text-blue-600',
        },
        {
            title: 'Propositions Reçues',
            value: metrics.proposalsReceived,
            icon: Target,
            color: 'text-purple-600',
        },
        {
            title: 'Taux de Complétion',
            value: `${metrics.completionRate.toFixed(1)}%`,
            icon: metrics.completionRate >= 70 ? TrendingUp : TrendingDown,
            color: getMetricColor(metrics.completionRate, 70),
        },
        {
            title: 'Temps de Réponse Moyen',
            value: formatHours(metrics.averageResponseTime),
            icon: Clock,
            color: getMetricColor(metrics.averageResponseTime, 24, true),
        },
    ];

    const providerMetrics = [
        {
            title: 'Missions Complétées',
            value: metrics.bookingsCompleted,
            icon: CheckCircle2,
            color: 'text-green-600',
        },
        {
            title: 'Taux de Complétion',
            value: `${metrics.completionRate.toFixed(1)}%`,
            icon: metrics.completionRate >= 80 ? TrendingUp : TrendingDown,
            color: getMetricColor(metrics.completionRate, 80),
        },
    ];

    const displayMetrics = role === 'client' ? clientMetrics : providerMetrics;

    return (
        <>
            {displayMetrics.map((metric, index) => (
                <Card key={index}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {metric.title}
                        </CardTitle>
                        <metric.icon className={`h-4 w-4 ${metric.color}`} />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${metric.color}`}>
                            {metric.value}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </>
    );
}
