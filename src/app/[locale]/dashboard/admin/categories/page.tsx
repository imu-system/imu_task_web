
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from '@/navigation';
import { useEffect } from 'react';
import { Loader2, Shield } from 'lucide-react';
import { UserRole } from '@/lib/types';
import { useLocale, useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { taskCategoriesByLocale } from '@/lib/data';
import { Badge } from '@/components/ui/badge';

export default function AdminCategoriesPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const t = useTranslations('AdminCategoriesPage');
    const tDashboard = useTranslations('DashboardNav');
    const locale = useLocale();
    const categories = taskCategoriesByLocale[locale as keyof typeof taskCategoriesByLocale] || taskCategoriesByLocale.en;

    useEffect(() => {
        if (!loading && (!user || !user.roles?.includes(UserRole.admin))) {
        router.push('/dashboard');
        }
    }, [user, loading, router]);

    if (loading || !user || !user.roles?.includes(UserRole.admin)) {
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
