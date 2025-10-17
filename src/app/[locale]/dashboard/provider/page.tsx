/**
 * Dashboard Provider - Vue du prestataire
 */
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

export default function ProviderDashboardPage() {
    const { user } = useAuth();

    const isProvider = user?.roles?.includes(UserRole.provider) ?? false;

    if (!isProvider) {
        return (
            <div className="container py-12">
                <Card>
                    <CardHeader>
                        <CardTitle>Accès refusé</CardTitle>
                        <CardDescription>
                            Vous devez être inscrit comme prestataire pour accéder à cette page.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    return (
        <div className="container py-12" data-testid="provider-dashboard">
            <h1 className="text-3xl font-bold mb-6">Tableau de bord prestataire</h1>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            Bienvenue !
                        </CardTitle>
                        <CardDescription>
                            Vous êtes maintenant un prestataire ImuTask
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Vous pouvez maintenant recevoir des offres de missions et gérer votre activité.
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Missions actives</CardTitle>
                        <CardDescription>0 missions en cours</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">0</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Revenus</CardTitle>
                        <CardDescription>Ce mois-ci</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">0 €</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
