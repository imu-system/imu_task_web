
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from '@/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Loader2, Milestone } from 'lucide-react';
import { UserRole, ServiceCategory } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';


const guidanceSchema = z.object({
  categories: z.array(z.object({
    id: z.string(),
    recommendedPriceMin: z.coerce.number().int().min(0, "Doit être >= 0").optional().or(z.literal('')),
    recommendedPriceMax: z.coerce.number().int().min(0, "Doit être >= 0").optional().or(z.literal('')),
  })).refine(items => {
    return items.every(item => {
        const min = item.recommendedPriceMin === '' ? undefined : Number(item.recommendedPriceMin);
        const max = item.recommendedPriceMax === '' ? undefined : Number(item.recommendedPriceMax);
        if (min !== undefined && max !== undefined) {
            return max >= min;
        }
        return true;
    });
  }, {
    message: "Le max doit être >= au min.",
  })
});

type GuidanceFormValues = z.infer<typeof guidanceSchema>;


export default function AdminGuidancePage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const t = useTranslations('AdminPricingPage.guidance');
    const { toast } = useToast();
    
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [categories, setCategories] = useState<ServiceCategory[]>([]);

    const form = useForm<GuidanceFormValues>({
        resolver: zodResolver(guidanceSchema),
        defaultValues: {
            categories: []
        }
    });

    useEffect(() => {
        if (!authLoading && (!user || !user.roles?.includes(UserRole.admin))) {
            router.push('/dashboard');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        const fetchCategories = async () => {
            setIsLoading(true);
            try {
                const catQuery = query(collection(db, 'serviceCategories'), where('isActive', '==', true));
                const catSnapshot = await getDocs(catQuery);
                const fetchedCategories = catSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ServiceCategory));
                
                const sortedCategories = fetchedCategories.sort((a,b) => a.displayOrder - b.displayOrder);
                setCategories(sortedCategories);

                form.reset({
                    categories: sortedCategories.map(c => ({
                        id: c.id,
                        recommendedPriceMin: c.recommendedPriceMin || '',
                        recommendedPriceMax: c.recommendedPriceMax || '',
                    }))
                });

            } catch (error) {
                console.error("Error fetching categories:", error);
                toast({ variant: 'destructive', title: "Erreur", description: "Impossible de charger les catégories de service." });
            } finally {
                setIsLoading(false);
            }
        };
        fetchCategories();
    }, [form, toast]);
    
    const onSubmit = async (data: GuidanceFormValues) => {
        setIsSaving(true);
        const updatePromises: Promise<void>[] = [];

        for (const categoryData of data.categories) {
            const ref = doc(db, 'serviceCategories', categoryData.id);
            const minPrice = categoryData.recommendedPriceMin === '' ? null : Number(categoryData.recommendedPriceMin);
            const maxPrice = categoryData.recommendedPriceMax === '' ? null : Number(categoryData.recommendedPriceMax);

            const updatePayload: Partial<ServiceCategory> = {
                recommendedPriceMin: minPrice,
                recommendedPriceMax: maxPrice,
            };
            updatePromises.push(updateDoc(ref, updatePayload));
        }

        try {
            await Promise.all(updatePromises);
            toast({
                title: t('toast.successTitle'),
                description: t('toast.successDescription'),
            });
        } catch (error) {
            console.error("Error updating price guidance:", error);
            toast({ variant: 'destructive', title: "Erreur", description: t('toast.errorDescription') });
        } finally {
            setIsSaving(false);
        }
    };


    if (authLoading || isLoading || !user || !user.roles?.includes(UserRole.admin)) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }
    
    return (
        <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
                    <Milestone className="h-8 w-8 text-primary"/>
                    {t('title')}
                </h1>
                <p className="text-muted-foreground">
                {t('subtitle')}
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t('card.title')}</CardTitle>
                    <CardDescription>{t('card.description')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('table.category')}</TableHead>
                                <TableHead className="w-[200px]">{t('table.minPrice')}</TableHead>
                                <TableHead className="w-[200px]">{t('table.maxPrice')}</TableHead>
                            </TableRow>
                        </TableHeader>
                         <TableBody>
                            {categories.map((category, index) => (
                                <TableRow key={category.id}>
                                    <TableCell className="font-medium">{category.name?.fr || category.slug}</TableCell>
                                    <TableCell>
                                        <FormField
                                            control={form.control}
                                            name={`categories.${index}.recommendedPriceMin`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input type="number" placeholder={t('table.pricePlaceholder')} {...field} />
                                                    </FormControl>
                                                    <FormMessage/>
                                                </FormItem>
                                            )}
                                        />
                                    </TableCell>
                                    <TableCell>
                                         <FormField
                                            control={form.control}
                                            name={`categories.${index}.recommendedPriceMax`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input type="number" placeholder={t('table.pricePlaceholder')} {...field} />
                                                    </FormControl>
                                                    <FormMessage/>
                                                </FormItem>
                                            )}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

             <div className="flex justify-end">
                <Button type="submit" disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t('saveButton')}
                </Button>
            </div>
        </form>
        </Form>
    );
}
