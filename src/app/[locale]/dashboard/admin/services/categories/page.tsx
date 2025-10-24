
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, Link } from '@/navigation';
import { useEffect, useState } from 'react';
import { Loader2, Shield, PlusCircle, MoreHorizontal, Trash2, Copy } from 'lucide-react';
import { UserRole, ServiceCategory } from '@/lib/types';
import { useLocale, useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { collection, onSnapshot, query, Timestamp, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { deleteServiceCategory, duplicateServiceCategory } from '@/lib/data';


export default function AdminCategoriesPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const t = useTranslations('AdminCategoriesPage');
    const tDashboard = useTranslations('DashboardNav');
    const locale = useLocale();
    const { toast } = useToast();
    
    const [categories, setCategories] = useState<ServiceCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

    useEffect(() => {
        if (!authLoading && (!user || !user.roles?.includes(UserRole.admin))) {
            router.push('/dashboard');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        setLoading(true);
        const q = query(collection(db, 'serviceCategories'));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const categoriesData: ServiceCategory[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                categoriesData.push({
                    id: doc.id,
                    ...data,
                    createdAt: (data.createdAt as Timestamp)?.toDate ? (data.createdAt as Timestamp).toDate() : new Date(),
                    updatedAt: (data.updatedAt as Timestamp)?.toDate ? (data.updatedAt as Timestamp).toDate() : new Date(),
                } as ServiceCategory);
            });
            setCategories(categoriesData.sort((a,b) => (a.displayOrder || 0) - (b.displayOrder || 0)));
            setLoading(false);
        }, (error) => {
            console.error("Error fetching service categories: ", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleDelete = async () => {
        if (!categoryToDelete) return;
        try {
            await deleteServiceCategory(categoryToDelete);
            toast({
                title: t('toastDeleteSuccessTitle'),
                description: t('toastDeleteSuccessDescription'),
            });
        } catch (error) {
            toast({
                variant: 'destructive',
                title: t('toastDeleteErrorTitle'),
                description: t('toastDeleteErrorDescription'),
            });
        } finally {
            setCategoryToDelete(null);
            setDialogOpen(false);
        }
    };

    const handleDuplicate = async (id: string) => {
        try {
            await duplicateServiceCategory(id);
            toast({
                title: t('toastDuplicateSuccessTitle'),
                description: t('toastDuplicateSuccessDescription'),
            });
        } catch (error) {
             toast({
                variant: 'destructive',
                title: t('toastDuplicateErrorTitle'),
                description: t('toastDuplicateErrorDescription'),
            });
        }
    };


    if (authLoading || loading || !user || !user.roles?.includes(UserRole.admin)) {
        return (
        <div className="flex justify-center items-center h-64">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
        );
    }

  return (
    <>
    <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>{t('deleteDialog.title')}</AlertDialogTitle>
                <AlertDialogDescription>
                    {t('deleteDialog.description')}
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>{t('deleteDialog.cancel')}</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>{t('deleteDialog.confirm')}</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>

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
            <Button asChild>
              <Link href="/dashboard/admin/services/categories/new">
                <PlusCircle className="mr-2 h-4 w-4"/>
                {t('newCategory')}
              </Link>
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
                            <TableHead className="w-[80px]">ID</TableHead>
                            <TableHead>Slug</TableHead>
                            <TableHead>Nom</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead>Ordre</TableHead>
                            <TableHead>Dernière MàJ</TableHead>
                            <TableHead className="w-[50px]"><span className="sr-only">Actions</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                             <TableRow>
                                <TableCell colSpan={7} className="text-center">
                                    <Loader2 className="h-8 w-8 animate-spin mx-auto my-8 text-primary" />
                                </TableCell>
                            </TableRow>
                        ) : categories.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                    {t('noCategories')}
                                </TableCell>
                            </TableRow>
                        ) : (
                            categories.map((category) => (
                                <TableRow key={category.id}>
                                    <TableCell className="font-mono text-xs text-muted-foreground">{category.id.substring(0, 6)}...</TableCell>
                                    <TableCell className="font-medium">{category.slug}</TableCell>
                                    <TableCell>{typeof category.name === 'string' ? category.name : (category.name?.fr || category.slug)}</TableCell>
                                    <TableCell>
                                        <Badge variant={category.isActive ? 'default' : 'destructive'}>
                                            {category.isActive ? t('statusActive') : t('statusInactive')}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{category.displayOrder}</TableCell>
                                    <TableCell>
                                        {new Intl.DateTimeFormat(locale, { dateStyle: 'short', timeStyle: 'short' }).format(new Date(category.updatedAt))}
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4"/>
                                                    <span className="sr-only">Ouvrir le menu</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>{t('actions')}</DropdownMenuLabel>
                                                <DropdownMenuSeparator/>
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/dashboard/admin/services/categories/edit/${category.id}`}>
                                                        {t('edit')}
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleDuplicate(category.id)}>
                                                    <Copy className="mr-2 h-4 w-4" />
                                                    {t('duplicate')}
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator/>
                                                <DropdownMenuItem 
                                                    className="text-destructive"
                                                    onClick={() => {
                                                        setCategoryToDelete(category.id);
                                                        setDialogOpen(true);
                                                    }}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    {t('delete')}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
       </Card>
    </div>
    </>
  );
}
