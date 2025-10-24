
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from '@/navigation';
import { useEffect, useState } from 'react';
import { Loader2, Shield } from 'lucide-react';
import { UserRole, ServiceCategory } from '@/lib/types';
import { useLocale, useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function AdminCategoriesPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const t = useTranslations('AdminCategoriesPage');
    const tDashboard = useTranslations('DashboardNav');
    const locale = useLocale();
    
    const [categories, setCategories] = useState<ServiceCategory[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && (!user || !user.roles?.includes(UserRole.admin))) {
            router.push('/dashboard');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        setLoading(true);
        const q = query(collection(db, 'serviceCategories'));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            if (querySnapshot.empty) {
                // If firestore is empty, use mock data
                const mockCategories: ServiceCategory[] = [
                    { id: '1', name: 'Faire les courses alimentaires', icon: '🛒', slug: 'Faire les courses alimentaires', isActive: true, createdAt: new Date(), updatedAt: new Date() },
                    { id: '2', name: 'Livraison à domicile', icon: '📦', slug: 'Livraison à domicile', isActive: true, createdAt: new Date(), updatedAt: new Date() },
                    { id: '3', name: 'Ménage léger', icon: '🧹', slug: 'Ménage léger', isActive: true, createdAt: new Date(), updatedAt: new Date() },
                    { id: '4', name: 'Petits bricolages', icon: '🔧', slug: 'Petits bricolages', isActive: true, createdAt: new Date(), updatedAt: new Date() },
                    { id: '5', name: 'Jardinage simple', icon: '🌱', slug: 'Jardinage simple', isActive: true, createdAt: new Date(), updatedAt: new Date() },
                    { id: '6', name: 'Visites de convivialité', icon: '👋', slug: 'Visites de convivialité', isActive: true, createdAt: new Date(), updatedAt: new Date() },
                    { id: '7', name: 'Assistance numérique', icon: '💻', slug: 'Assistance numérique', isActive: true, createdAt: new Date(), updatedAt: new Date() },
                    { id: '8', name: 'Soutien scolaire', icon: '📚', slug: 'Soutien scolaire', isActive: true, createdAt: new Date(), updatedAt: new Date() },
                    { id: '9', name: 'Promenade de chiens', icon: '🐕', slug: 'Promenade de chiens', isActive: true, createdAt: new Date(), updatedAt: new Date() },
                    { id: '10', name: 'Aide pour déménagement léger', icon: '📦', slug: 'Aide pour déménagement léger', isActive: false, createdAt: new Date(), updatedAt: new Date() },
                ];
                setCategories(mockCategories);
            } else {
                const categoriesData: ServiceCategory[] = [];
                querySnapshot.forEach((doc) => {
                    categoriesData.push({ id: doc.id, ...doc.data() } as ServiceCategory);
                });
                setCategories(categoriesData);
            }
            setLoading(false);
        }, (error) => {
            console.error("Error fetching service categories: ", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (authLoading || loading || !user || !user.roles?.includes(UserRole.admin)) {
        return (
        <div className="flex justify-center items-center h-64">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
        );
    }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary"/>
            {tDashboard('admin')}
        </h1>
        <p className="text-muted-foreground">
          {t('subtitle')}
        </p>
      </div>

       <Card>
            <CardHeader>
                <CardTitle>{t('title')}</CardTitle>
                <CardDescription>{t('description')}</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t('tableHeaderName')}</TableHead>
                            <TableHead>{t('tableHeaderStatus')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {categories.map((category) => (
                            <TableRow key={category.id}>
                                <TableCell className="font-medium">{category.slug}</TableCell>
                                <TableCell>
                                    <Badge variant={category.isActive ? 'default' : 'destructive'}>
                                        {category.isActive ? t('statusActive') : t('statusInactive')}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
       </Card>
    </div>
  );
}
