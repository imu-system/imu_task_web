/**
 * React Query Hooks for Analytics
 * Custom hooks to fetch and cache analytics data with real-time updates
 */

'use client';

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import {
    getProviderStats,
    getMonthlyRevenue,
    getMonthlyMissions,
    getClientStats,
    getClientMonthlySpending,
    getClientCategoryDistribution,
    getAdminStats,
    getMonthlyGrowth,
    type MonthlyRevenue,
    type MonthlyMissions,
    type ClientStats,
    type AdminStats,
    type CategoryDistribution,
    type MonthlyGrowth,
} from '@/lib/firestore-analytics';

/**
 * Hook pour récupérer les stats d'un provider
 */
export function useProviderStats(providerId: string | undefined) {
    return useQuery({
        queryKey: ['providerStats', providerId],
        queryFn: () => {
            if (!providerId) throw new Error('Provider ID is required');
            return getProviderStats(providerId);
        },
        enabled: !!providerId,
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: true,
        refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
    });
}

/**
 * Hook pour récupérer les revenus mensuels d'un provider
 */
export function useProviderMonthlyRevenue(
    providerId: string | undefined,
    monthsBack: number = 6
): UseQueryResult<MonthlyRevenue[], Error> {
    return useQuery({
        queryKey: ['providerMonthlyRevenue', providerId, monthsBack],
        queryFn: () => {
            if (!providerId) throw new Error('Provider ID is required');
            return getMonthlyRevenue(providerId, monthsBack);
        },
        enabled: !!providerId,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: true,
    });
}

/**
 * Hook pour récupérer les missions mensuelles d'un provider
 */
export function useProviderMonthlyMissions(
    providerId: string | undefined,
    monthsBack: number = 6
): UseQueryResult<MonthlyMissions[], Error> {
    return useQuery({
        queryKey: ['providerMonthlyMissions', providerId, monthsBack],
        queryFn: () => {
            if (!providerId) throw new Error('Provider ID is required');
            return getMonthlyMissions(providerId, monthsBack);
        },
        enabled: !!providerId,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: true,
    });
}

/**
 * Hook pour récupérer les stats d'un client
 */
export function useClientStats(clientId: string | undefined) {
    return useQuery({
        queryKey: ['clientStats', clientId],
        queryFn: () => {
            if (!clientId) throw new Error('Client ID is required');
            return getClientStats(clientId);
        },
        enabled: !!clientId,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: true,
        refetchInterval: 10 * 60 * 1000,
    });
}

/**
 * Hook pour récupérer les dépenses mensuelles d'un client
 */
export function useClientMonthlySpending(
    clientId: string | undefined,
    monthsBack: number = 6
): UseQueryResult<MonthlyRevenue[], Error> {
    return useQuery({
        queryKey: ['clientMonthlySpending', clientId, monthsBack],
        queryFn: () => {
            if (!clientId) throw new Error('Client ID is required');
            return getClientMonthlySpending(clientId, monthsBack);
        },
        enabled: !!clientId,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: true,
    });
}

/**
 * Hook pour récupérer la distribution des catégories d'un client
 */
export function useClientCategoryDistribution(
    clientId: string | undefined
): UseQueryResult<CategoryDistribution[], Error> {
    return useQuery({
        queryKey: ['clientCategoryDistribution', clientId],
        queryFn: () => {
            if (!clientId) throw new Error('Client ID is required');
            return getClientCategoryDistribution(clientId);
        },
        enabled: !!clientId,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: true,
    });
}

/**
 * Hook pour récupérer les stats admin globales
 */
export function useAdminStats(): UseQueryResult<AdminStats | null, Error> {
    return useQuery({
        queryKey: ['adminStats'],
        queryFn: () => getAdminStats(),
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: true,
        refetchInterval: 15 * 60 * 1000, // Refetch every 15 minutes (heavy query)
    });
}

/**
 * Hook pour récupérer la croissance mensuelle (admin)
 */
export function useMonthlyGrowth(
    monthsBack: number = 12
): UseQueryResult<MonthlyGrowth[], Error> {
    return useQuery({
        queryKey: ['monthlyGrowth', monthsBack],
        queryFn: () => getMonthlyGrowth(monthsBack),
        staleTime: 10 * 60 * 1000, // 10 minutes (heavy query)
        refetchOnWindowFocus: false, // Don't refetch on focus for heavy queries
        refetchInterval: 30 * 60 * 1000, // Refetch every 30 minutes
    });
}

/**
 * Hook combiné pour récupérer toutes les analytics d'un provider
 */
export function useProviderAnalytics(providerId: string | undefined) {
    const stats = useProviderStats(providerId);
    const monthlyRevenue = useProviderMonthlyRevenue(providerId);
    const monthlyMissions = useProviderMonthlyMissions(providerId);

    return {
        stats,
        monthlyRevenue,
        monthlyMissions,
        isLoading: stats.isLoading || monthlyRevenue.isLoading || monthlyMissions.isLoading,
        isError: stats.isError || monthlyRevenue.isError || monthlyMissions.isError,
        error: stats.error || monthlyRevenue.error || monthlyMissions.error,
    };
}

/**
 * Hook combiné pour récupérer toutes les analytics d'un client
 */
export function useClientAnalytics(clientId: string | undefined) {
    const stats = useClientStats(clientId);
    const monthlySpending = useClientMonthlySpending(clientId);
    const categoryDistribution = useClientCategoryDistribution(clientId);

    return {
        stats,
        monthlySpending,
        categoryDistribution,
        isLoading: stats.isLoading || monthlySpending.isLoading || categoryDistribution.isLoading,
        isError: stats.isError || monthlySpending.isError || categoryDistribution.isError,
        error: stats.error || monthlySpending.error || categoryDistribution.error,
    };
}

/**
 * Hook combiné pour récupérer toutes les analytics admin
 */
export function useAdminAnalytics() {
    const stats = useAdminStats();
    const monthlyGrowth = useMonthlyGrowth(12);

    return {
        stats,
        monthlyGrowth,
        isLoading: stats.isLoading || monthlyGrowth.isLoading,
        isError: stats.isError || monthlyGrowth.isError,
        error: stats.error || monthlyGrowth.error,
    };
}
