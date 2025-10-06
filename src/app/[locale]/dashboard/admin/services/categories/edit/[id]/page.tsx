
'use client';

import { useAuth } from '@/hooks/use-auth';
import { Link, useRouter } from '@/navigation';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2, ArrowLeft } from 'lucide-react';
import { UserRole, type ServiceCategory } from '@/lib/types';
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
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { updateServiceCategory } from '@/lib/data';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const categoryFormSchema = z.object({
  slug: z.string().min(3, 'Le slug doit contenir au moins 3 caractères.').regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug invalide (doit être en minuscules, sans espaces, ex: "home-cleaning").'),
  displayOrder: z.coerce.number().int().min(0).default(10),
  isActive: z.boolean().default(true),
  name: z.object({
      fr: z.string().min(3, 'Le nom FR doit contenir au moins 3 caractères.'),
      en: z.string().min(3, 'Le nom EN doit contenir au moins 3 caractères.'),
  }),
  description: z.object({
      fr: z.string().optional(),
      en: z.string().optional(),
  }),
  recommendedPriceMin: z.coerce.number().int().min(0).optional(),
  recommendedPriceMax: z.coerce.number().int().min(0).optional(),
  targetCities: z.string().optional(),
  internalNotes: z.string().optional(),
}).refine(data => {
    if (data.recommendedPriceMin !== undefined && data.recommendedPriceMax !== undefined) {
        return data.recommendedPriceMax >= data.recommendedPriceMin;
    }
    return true;
}, {
    message: "Le prix maximum doit être supérieur ou égal au prix minimum.",
    path: ["recommendedPriceMax"],
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

export default function AdminEditCategoryPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const params = useParams<{ id: string }>();
    const categoryId = params.id;
    const localStorageKey = `edit-category-form-${categoryId}`;

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
            name: { fr: '', en: '' },
            description: { fr: '', en: '' },
        }
    });

    const watchedValues = form.watch();

    useEffect(() => {
        if (!isLoading) {
            try {
                localStorage.setItem(localStorageKey, JSON.stringify(watchedValues));
            } catch (e) {
                console.error("Could not save to localStorage", e);
            }
        }
    }, [watchedValues, isLoading, localStorageKey]);


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
                    
                    let savedData = null;
                    try {
                         const item = localStorage.getItem(localStorageKey);
                         if (item) savedData = JSON.parse(item);
                    } catch (e) {
                        console.error("Could not read from localStorage", e);
                        savedData = null;
                    }

                    const defaultValues = savedData || {
                        slug: categoryData.slug,
                        displayOrder: categoryData.displayOrder,
                        isActive: categoryData.isActive,
                        name: categoryData.name || { fr: '', en: '' },
                        description: categoryData.description || { fr: '', en: '' },
                        recommendedPriceMin: categoryData.recommendedPriceMin,
                        recommendedPriceMax: categoryData.recommendedPriceMax,
                        targetCities: categoryData.targetCities,
                        internalNotes: categoryData.internalNotes,
                    };
                    form.reset(defaultValues);
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
    }, [categoryId, form, router, toast, localStorageKey]);

    const onSubmit = async (data: CategoryFormValues) => {
        if (!categoryId) return;
        setIsSaving(true);
        try {
            await updateServiceCategory(categoryId, data);
            try {
                localStorage.removeItem(localStorageKey);
            } catch (e) {
                 console.error("Could not remove from localStorage", e);
            }
            toast({
                title: tForm('toastUpdateSuccessTitle'),
                description: tForm('toastUpdateSuccessDescription'),
            });
            router.push('/dashboard/admin/services/categories');
        } catch (error) {
            console.error("Error updating category:", error);
            toast({
                variant: "destructive",
                title: tForm('toastErrorTitle'),
                description: tForm('toastUpdateErrorDescription'),
            });
        } finally {
            setIsSaving(false);
        }
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


            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <Tabs defaultValue="general">
                        <TabsList className="mb-4">
                            <TabsTrigger value="general">{tForm('tabs.general')}</TabsTrigger>
                            <TabsTrigger value="translations">{tForm('tabs.translations')}</TabsTrigger>
                        </TabsList>
                        <TabsContent value="general">
                             <Card>
                                <CardHeader>
                                    <CardTitle>{tForm('cardTitleGeneral')}</CardTitle>
                                    <CardDescription>{tForm('cardDescriptionGeneral')}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
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
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="recommendedPriceMin"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>{tForm('priceMinLabel')}</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" {...field} placeholder="e.g. 1500 for 15.00€" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="recommendedPriceMax"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>{tForm('priceMaxLabel')}</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" {...field} placeholder="e.g. 3000 for 30.00€" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <FormField
                                        control={form.control}
                                        name="targetCities"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{tForm('targetCitiesLabel')}</FormLabel>
                                                <FormControl>
                                                    <Input placeholder={tForm('targetCitiesPlaceholder')} {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="internalNotes"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{tForm('internalNotesLabel')}</FormLabel>
                                                <FormControl>
                                                    <Textarea placeholder={tForm('internalNotesPlaceholder')} {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value="translations">
                             <Card>
                                <CardHeader>
                                    <CardTitle>{tForm('cardTitleTranslations')}</CardTitle>
                                    <CardDescription>{tForm('cardDescriptionTranslations')}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                     <div className="space-y-4 p-4 border rounded-md">
                                        <h3 className="font-medium">Français</h3>
                                        <FormField
                                            control={form.control}
                                            name="name.fr"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>{tForm('nameLabel')}</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder={tForm('namePlaceholderFR')} {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="description.fr"
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
                                     </div>
                                     <div className="space-y-4 p-4 border rounded-md">
                                        <h3 className="font-medium">English</h3>
                                         <FormField
                                            control={form.control}
                                            name="name.en"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>{tForm('nameLabel')}</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder={tForm('namePlaceholderEN')} {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="description.en"
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
                                     </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                    
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
        </div>
    );
}
