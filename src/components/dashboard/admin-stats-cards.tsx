'use client';

/**
 * AdminStatsCards Component
 * 
 * Phase 9: Option D - Dashboard Admin
 * Phase 9: Option G - Analytics Temps Réel (KPI Badges avec CountUp)
 * 
 * Affiche les KPIs principaux de la plateforme:
 * - Total utilisateurs
 * - Utilisateurs actifs (clients + providers)
 * - Total missions
 * - Missions actives/complétées
 * 
 * Features Option G:
 * - CountUp animations pour les valeurs numériques
 * - Change detection (compare previous vs current)
 * - Badge +X (vert) si augmentation détectée
 */

import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import CountUp from 'react-countup';
import { Users, UserCheck, ListTodo, CheckCircle, Activity, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useActiveUsersStats } from '@/hooks/use-admin-stats';
import { Skeleton } from '@/components/ui/skeleton';

// ========================================
// HELPER COMPONENTS
// ========================================

interface KPICardProps {
    title: string;
    value: number;
    change: number;
    description: string;
    icon: React.ReactNode;
}

function KPICard({ title, value, change, description, icon }: KPICardProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    {title}
                </CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="flex items-baseline gap-2">
                    <div className="text-2xl font-bold">
                        <CountUp 
                            end={value} 
                            duration={1.5}
                            separator=","
                            preserveValue
                        />
                    </div>
                    {change > 0 && (
                        <Badge 
                            variant="default" 
                            className="bg-green-500 hover:bg-green-600 text-white animate-pulse"
                        >
                            +{change}
                        </Badge>
                    )}
                    {change < 0 && (
                        <Badge 
                            variant="destructive" 
                            className="animate-pulse"
                        >
                            {change}
                        </Badge>
                    )}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                    {description}
                </p>
            </CardContent>
        </Card>
    );
}

// ========================================
// COMPONENT
// ========================================

export function AdminStatsCards() {
    const t = useTranslations('Admin');
    const { data: stats, loading, error } = useActiveUsersStats();

    // Change detection for KPI badges
    const previousStatsRef = useRef<typeof stats | null>(null);
    const [changes, setChanges] = useState({
        totalUsers: 0,
        activeClients: 0,
        activeProviders: 0,
        totalTasks: 0,
        completedTasks: 0,
        activeTasks: 0
    });

    // Calculate changes when stats update
    useEffect(() => {
        if (stats && previousStatsRef.current) {
            setChanges({
                totalUsers: stats.totalUsers - previousStatsRef.current.totalUsers,
                activeClients: stats.activeClients - previousStatsRef.current.activeClients,
                activeProviders: stats.activeProviders - previousStatsRef.current.activeProviders,
                totalTasks: stats.totalTasks - previousStatsRef.current.totalTasks,
                completedTasks: stats.completedTasks - previousStatsRef.current.completedTasks,
                activeTasks: stats.activeTasks - previousStatsRef.current.activeTasks
            });
        }
        previousStatsRef.current = stats;
    }, [stats]);

    // Loading state
    if (loading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-4 rounded" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-16" />
                            <Skeleton className="h-3 w-32 mt-2" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    // Error state
    if (error || !stats) {
        return (
            <Card className="border-destructive">
                <CardHeader>
                    <CardTitle>{t('stats.error')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        {error?.message || 'Unable to load statistics'}
                    </p>
                </CardContent>
            </Card>
        );
    }

    // Calculate percentages
    const clientActiveRate = stats.totalUsers > 0 
        ? (stats.activeClients / stats.totalUsers * 100).toFixed(1) 
        : '0';
    const providerActiveRate = stats.totalUsers > 0 
        ? (stats.activeProviders / stats.totalUsers * 100).toFixed(1) 
        : '0';
    const taskCompletionRate = stats.totalTasks > 0 
        ? (stats.completedTasks / stats.totalTasks * 100).toFixed(1) 
        : '0';

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Total Users */}
            <KPICard
                title={t('stats.totalUsers')}
                value={stats.totalUsers}
                change={changes.totalUsers}
                description={t('stats.totalUsersDesc')}
                icon={<Users className="h-4 w-4 text-muted-foreground" />}
            />

            {/* Active Clients */}
            <KPICard
                title={t('stats.activeClients')}
                value={stats.activeClients}
                change={changes.activeClients}
                description={`${clientActiveRate}% ${t('stats.ofTotal')}`}
                icon={<UserCheck className="h-4 w-4 text-muted-foreground" />}
            />

            {/* Active Providers */}
            <KPICard
                title={t('stats.activeProviders')}
                value={stats.activeProviders}
                change={changes.activeProviders}
                description={`${providerActiveRate}% ${t('stats.ofTotal')}`}
                icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
            />

            {/* Total Tasks */}
            <KPICard
                title={t('stats.totalTasks')}
                value={stats.totalTasks}
                change={changes.totalTasks}
                description={t('stats.totalTasksDesc')}
                icon={<ListTodo className="h-4 w-4 text-muted-foreground" />}
            />

            {/* Completed Tasks */}
            <KPICard
                title={t('stats.completedTasks')}
                value={stats.completedTasks}
                change={changes.completedTasks}
                description={`${taskCompletionRate}% ${t('stats.completionRate')}`}
                icon={<CheckCircle className="h-4 w-4 text-muted-foreground" />}
            />

            {/* Active Tasks */}
            <KPICard
                title={t('stats.activeTasks')}
                value={stats.activeTasks}
                change={changes.activeTasks}
                description={t('stats.activeTasksDesc')}
                icon={<Activity className="h-4 w-4 text-muted-foreground" />}
            />
        </div>
    );
}
