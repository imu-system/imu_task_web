'use client';

/**
 * AdminStatsCards Component
 * 
 * Phase 9: Option D - Dashboard Admin
 * 
 * Affiche les KPIs principaux de la plateforme:
 * - Total utilisateurs
 * - Utilisateurs actifs (clients + providers)
 * - Total missions
 * - Missions actives/complétées
 */

import { useTranslations } from 'next-intl';
import { Users, UserCheck, ListTodo, CheckCircle, Activity, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useActiveUsersStats } from '@/hooks/use-admin-stats';
import { Skeleton } from '@/components/ui/skeleton';

// ========================================
// COMPONENT
// ========================================

export function AdminStatsCards() {
    const t = useTranslations('Admin');
    const { data: stats, loading, error } = useActiveUsersStats();

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
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        {t('stats.totalUsers')}
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.totalUsers}</div>
                    <p className="text-xs text-muted-foreground">
                        {t('stats.totalUsersDesc')}
                    </p>
                </CardContent>
            </Card>

            {/* Active Clients */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        {t('stats.activeClients')}
                    </CardTitle>
                    <UserCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.activeClients}</div>
                    <p className="text-xs text-muted-foreground">
                        {clientActiveRate}% {t('stats.ofTotal')}
                    </p>
                </CardContent>
            </Card>

            {/* Active Providers */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        {t('stats.activeProviders')}
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.activeProviders}</div>
                    <p className="text-xs text-muted-foreground">
                        {providerActiveRate}% {t('stats.ofTotal')}
                    </p>
                </CardContent>
            </Card>

            {/* Total Tasks */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        {t('stats.totalTasks')}
                    </CardTitle>
                    <ListTodo className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.totalTasks}</div>
                    <p className="text-xs text-muted-foreground">
                        {t('stats.totalTasksDesc')}
                    </p>
                </CardContent>
            </Card>

            {/* Completed Tasks */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        {t('stats.completedTasks')}
                    </CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.completedTasks}</div>
                    <p className="text-xs text-muted-foreground">
                        {taskCompletionRate}% {t('stats.completionRate')}
                    </p>
                </CardContent>
            </Card>

            {/* Active Tasks */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        {t('stats.activeTasks')}
                    </CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.activeTasks}</div>
                    <p className="text-xs text-muted-foreground">
                        {t('stats.activeTasksDesc')}
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
