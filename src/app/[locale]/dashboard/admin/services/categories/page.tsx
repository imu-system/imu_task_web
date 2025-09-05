
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from '@/navigation';
import { useEffect, useState } from 'react';
import { Loader2, Shield, PlusCircle, MoreHorizontal } from 'lucide-react';
import { UserRole } from '@/lib/types';
import { useLocale, useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

// Mock data based on the new specifications
const mockCategories = [
    { id: 'cat_1', slug: 'faire-courses-alimentaires', name: 'Faire les courses alimentaires', icon: '🛒', isActive: true, displayOrder: 1, updatedAt: new Date() },
    { id: 'cat_2', slug: 'livraison-domicile', name: 'Livraison à domicile', icon: '🚚', isActive: true, displayOrder: 2, updatedAt: new Date() },
    { id: 'cat_3', slug: 'menage-leger', name: 'Ménage léger', icon: '🧹', isActive: true, displayOrder: 10, updatedAt: new Date() },
    { id: 'cat_4', slug: 'petits-bricolages', name: 'Petits bricolages', icon: '🔧', isActive: true, displayOrder: 11, updatedAt: new Date() },
    { id: 'cat_5', slug: 'visites-convivialite', name: 'Visites de convivialité', icon: '💬', isActive: true, displayOrder: 20, updatedAt: new Date() },
    { id: 'cat_6', slug: 'soutien-scolaire', name: 'Soutien scolaire', icon: '📚', isActive: false, displayOrder: 30, updatedAt: new Date() },
];


export default function AdminCategoriesPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const t = useTranslations('AdminCategoriesPage');
    const tDashboard = useTranslations('DashboardNav');
    const locale = useLocale();
    
    // In the future, this will come from Firestore
    const [categories, setCategories] = useState(mockCategories);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!authLoading && (!user || !user.roles?.includes(UserRole.admin))) {
            router.push('/dashboard');
        }
    }, [user, authLoading, router]);

    if (authLoading || loading || !user || !user.roles?.includes(UserRole.admin)) {
        return (
        <div className="flex justify-center items-center h-64">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
        );
    }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
                    <Shield className="h-8 w-8 text-primary"/>
                    {tDashboard('admin')}
                </h1>
                <p className="text-muted-foreground">
                {t('subtitle')}
                </p>
            </div>
            <Button>
                <PlusCircle className="mr-2 h-4 w-4"/>
                {t('newCategory')}
            </Button>
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
                            <TableHead className="w-[50px]">ID</TableHead>
                            <TableHead>Slug</TableHead>
                            <TableHead>Nom (FR)</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead>Ordre</TableHead>
                            <TableHead>Dernière MàJ</TableHead>
                            <TableHead className="w-[50px]"><span className="sr-only">Actions</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {categories.map((category) => (
                            <TableRow key={category.id}>
                                <TableCell className="font-mono text-xs text-muted-foreground">{category.id.substring(4)}</TableCell>
                                <TableCell className="font-medium">{category.slug}</TableCell>
                                <TableCell>{category.name}</TableCell>
                                <TableCell>
                                    <Badge variant={category.isActive ? 'default' : 'destructive'}>
                                        {category.isActive ? t('statusActive') : t('statusInactive')}
                                    </Badge>
                                </TableCell>
                                <TableCell>{category.displayOrder}</TableCell>
                                <TableCell>
                                    {new Intl.DateTimeFormat(locale, { dateStyle: 'short', timeStyle: 'short' }).format(category.updatedAt)}
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <MoreHorizontal className="h-4 w-4"/>
                                                <span className="sr-only">Ouvrir le menu</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuItem>Modifier</DropdownMenuItem>
                                            <DropdownMenuItem>Dupliquer</DropdownMenuItem>
                                            <DropdownMenuItem className="text-destructive">Supprimer</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
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
