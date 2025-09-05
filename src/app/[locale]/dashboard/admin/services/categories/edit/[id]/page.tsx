
'use client';

import { useAuth } from '@/hooks/use-auth';
import { Link, useRouter, useParams } from '@/navigation';
import { useEffect, useState } from 'react';
import { Loader2, ArrowLeft } from 'lucide-react';
import { UserRole, type ServiceCategory, type ServiceCategoryCreation } from '@/lib/types';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
// import { updateServiceCategory } from '@/lib/data';

const categoryFormSchema = z.object({
  name: z.string().min(3, 'Le nom doit contenir au moins 3 caractères.'),
  slug: z.string().min(3, 'Le slug doit contenir au moins 3 caractères.').regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug invalide (doit être en minuscules, sans espaces, ex: "home-cleaning").'),
  description: z.string().optional(),
  displayOrder: z.coerce.number().int().min(0).default(10),
  isActive: z.boolean().default(true),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

export default function AdminEditCategoryPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const params = useParams<{ id: string }>();
    const categoryId = params.id;

    const t = useTranslations('AdminCategoriesPage');
    const tForm = useTranslations('AdminCategoryForm');
    
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const form = useForm<CategoryFormValues>({
        resolver: zodResolver(categoryFormSchema),
        defaultValues: {
            isActive: true,
            displayOrder: 10,
        }
    });

    useEffect(() => {
        if (!authLoading && (!user || !user.roles?.includes(UserRole.admin))) {
            router.push('/dashboard');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        const fetchCategory = async () => {
            if (!categoryId) return;
            setIsLoading(true);
            try {
                const categoryRef = doc(db, 'serviceCategories', categoryId);
                const categorySnap = await getDoc(categoryRef);

                if (categorySnap.exists()) {
                    const categoryData = categorySnap.data() as ServiceCategory;
                    form.reset({
                        name: categoryData.name,
                        slug: categoryData.slug,
                        description: categoryData.description || '',
                        displayOrder: categoryData.displayOrder,
                        isActive: categoryData.isActive
                    });
                } else {
                     toast({
                        variant: "destructive",
                        title: "Catégorie non trouvée",
                    });
                    router.push('/dashboard/admin/services/categories');
                }
            } catch (error) {
                console.error("Error fetching category:", error);
                 toast({
                    variant: "destructive",
                    title: "Erreur",
                    description: "Impossible de charger les données de la catégorie."
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchCategory();
    }, [categoryId, form, router, toast]);

    const onSubmit = async (data: CategoryFormValues) => {
        setIsSaving(true);
        console.log("Form data to save:", data);
        // try {
            // const categoryData: ServiceCategoryCreation = {
            //     slug: data.slug,
            //     name: data.name,
            //     description: data.description,
            //     icon: '', // Placeholder for now
            //     displayOrder: data.displayOrder,
            //     isActive: data.isActive,
            // }
            // await updateServiceCategory(categoryId, categoryData);
            // toast({
            //     title: tForm('toastUpdateSuccessTitle'),
            //     description: tForm('toastUpdateSuccessDescription'),
            // });
            // router.push('/dashboard/admin/services/categories');
        // } catch (error) {
        //     console.error("Error updating category:", error);
        //     toast({
        //         variant: "destructive",
        //         title: tForm('toastErrorTitle'),
        //         description: tForm('toastUpdateErrorDescription'),
        //     });
        // } finally {
        //     setIsSaving(false);
        // }
         setTimeout(() => {
            toast({
                 title: "Fonctionnalité en cours de développement",
            });
            setIsSaving(false);
         }, 1000);
    }

    if (authLoading || isLoading || !user || !user.roles?.includes(UserRole.admin)) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/dashboard/admin/services/categories">
                        <ArrowLeft className="h-4 w-4"/>
                        <span className="sr-only">{tForm('backToList')}</span>
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-headline">
                        {tForm('titleEdit')}
                    </h1>
                    <p className="text-muted-foreground">
                        {tForm('subtitleEdit', { categoryId: categoryId.substring(0,6) })}
                    </p>
                </div>
            </div>


            <Card>
                <CardHeader>
                    <CardTitle>{tForm('cardTitle')}</CardTitle>
                    <CardDescription>{tForm('cardDescription')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{tForm('nameLabel')}</FormLabel>
                                            <FormControl>
                                                <Input placeholder={tForm('namePlaceholder')} {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="slug"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{tForm('slugLabel')}</FormLabel>
                                            <FormControl>
                                                <Input placeholder={tForm('slugPlaceholder')} {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{tForm('descriptionLabel')}</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder={tForm('descriptionPlaceholder')} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="displayOrder"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{tForm('displayOrderLabel')}</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="isActive"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{tForm('statusLabel')}</FormLabel>
                                            <div className="flex items-center space-x-2 pt-2">
                                                <FormControl>
                                                    <Switch
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                                <Label htmlFor="isActive">{tForm('statusActive')}</Label>
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <Button type="button" variant="ghost" asChild>
                                    <Link href="/dashboard/admin/services/categories">{tForm('cancel')}</Link>
                                </Button>
                                <Button type="submit" disabled={isSaving}>
                                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                                    {tForm('save')}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
