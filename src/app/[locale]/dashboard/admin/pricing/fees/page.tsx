
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from '@/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Loader2, Receipt, Percent } from 'lucide-react';
import { UserRole, ServiceCategory } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const feesSchema = z.object({
  globalRate: z.coerce.number().min(0, "Le taux doit être positif.").max(100, "Le taux ne peut pas dépasser 100."),
  categoryOverrides: z.array(z.object({
    categoryId: z.string(),
    rate: z.coerce.number().min(0).max(100).optional(),
  })).optional(),
  cityOverrides: z.array(z.object({
      city: z.string(),
      rate: z.coerce.number().min(0).max(100).optional(),
  })).optional(),
  countryOverrides: z.array(z.object({
      countryCode: z.string(),
      rate: z.coerce.number().min(0).max(100).optional(),
  })).optional(),
});

type FeesFormValues = z.infer<typeof feesSchema>;

// Mocking data for now
const mockCities = ["Paris", "Lyon", "Marseille"];
const mockCountries = [
    { code: 'FR', name: 'France' },
    { code: 'BE', name: 'Belgique' },
    { code: 'US', name: 'United States' },
];

export default function AdminFeesPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const t = useTranslations('AdminPricingPage.fees');
    const { toast } = useToast();

    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [categories, setCategories] = useState<ServiceCategory[]>([]);

    const form = useForm<FeesFormValues>({
        resolver: zodResolver(feesSchema),
        defaultValues: {
            globalRate: 15, // Mock default value
            categoryOverrides: [],
            cityOverrides: [],
            countryOverrides: [],
        },
    });

    useEffect(() => {
        const fetchInitialData = async () => {
            setIsLoading(true);
            try {
                // Fetch categories
                const catQuery = query(collection(db, 'serviceCategories'), where('isActive', '==', true));
                const catSnapshot = await getDocs(catQuery);
                const fetchedCategories = catSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ServiceCategory));
                setCategories(fetchedCategories);

                // Fetch current fee settings (mocked for now)
                const currentFees = {
                    globalRate: 15.0,
                    categoryOverrides: [ { categoryId: 'cleaning', rate: 20.0 } ],
                    cityOverrides: [ { city: 'Paris', rate: 18.0 } ],
                    countryOverrides: [ { countryCode: 'BE', rate: 12.0 } ],
                };

                const categoryOverrides = fetchedCategories.map(cat => {
                    const existingOverride = currentFees.categoryOverrides.find(o => o.categoryId === cat.id);
                    return { categoryId: cat.id, rate: existingOverride?.rate };
                });
                
                const cityOverrides = mockCities.map(city => {
                    const existingOverride = currentFees.cityOverrides.find(o => o.city === city);
                    return { city: city, rate: existingOverride?.rate };
                });

                const countryOverrides = mockCountries.map(country => {
                    const existingOverride = currentFees.countryOverrides.find(o => o.countryCode === country.code);
                    return { countryCode: country.code, rate: existingOverride?.rate };
                });

                form.reset({
                    globalRate: currentFees.globalRate,
                    categoryOverrides: categoryOverrides,
                    cityOverrides: cityOverrides,
                    countryOverrides: countryOverrides,
                });

            } catch (error) {
                console.error("Error fetching data:", error);
                toast({ variant: 'destructive', title: "Erreur", description: "Impossible de charger les données." });
            } finally {
                setIsLoading(false);
            }
        };
        fetchInitialData();
    }, [form, toast]);

    const onSubmit = async (data: FeesFormValues) => {
        setIsSaving(true);
        console.log("Saving fees:", data);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast({
            title: t('toast.successTitle'),
            description: t('toast.successDescription'),
        });
        setIsSaving(false);
    };
    
    useEffect(() => {
        if (!authLoading && (!user || !user.roles?.includes(UserRole.admin))) {
            router.push('/dashboard');
        }
    }, [user, authLoading, router]);

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
                        <Receipt className="h-8 w-8 text-primary"/>
                        {t('title')}
                    </h1>
                    <p className="text-muted-foreground">
                    {t('subtitle')}
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>{t('global.title')}</CardTitle>
                        <CardDescription>{t('global.description')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <FormField
                            control={form.control}
                            name="globalRate"
                            render={({ field }) => (
                                <FormItem className="max-w-xs">
                                    <FormLabel>{t('global.label')}</FormLabel>
                                    <div className="relative">
                                        <FormControl>
                                            <Input type="number" placeholder="15" {...field} />
                                        </FormControl>
                                        <Percent className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle>{t('categories.title')}</CardTitle>
                        <CardDescription>{t('categories.description')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t('categories.table.name')}</TableHead>
                                    <TableHead className="w-[200px]">{t('categories.table.rate')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {categories.map((category, index) => (
                                    <TableRow key={category.id}>
                                        <TableCell className="font-medium">{category.name?.fr || category.slug}</TableCell>
                                        <TableCell>
                                             <FormField
                                                control={form.control}
                                                name={`categoryOverrides.${index}.rate`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <div className="relative">
                                                            <FormControl>
                                                                <Input type="number" placeholder={t('categories.table.placeholder')} {...field} />
                                                            </FormControl>
                                                            <Percent className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                        </div>
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
                
                <Card>
                    <CardHeader>
                        <CardTitle>{t('countries.title')}</CardTitle>
                        <CardDescription>{t('countries.description')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t('countries.table.name')}</TableHead>
                                    <TableHead className="w-[200px]">{t('countries.table.rate')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mockCountries.map((country, index) => (
                                    <TableRow key={country.code}>
                                        <TableCell className="font-medium">{country.name} ({country.code})</TableCell>
                                        <TableCell>
                                             <FormField
                                                control={form.control}
                                                name={`countryOverrides.${index}.rate`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <div className="relative">
                                                            <FormControl>
                                                                <Input type="number" placeholder={t('categories.table.placeholder')} {...field} />
                                                            </FormControl>
                                                            <Percent className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                        </div>
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
                
                <Card>
                    <CardHeader>
                        <CardTitle>{t('cities.title')}</CardTitle>
                        <CardDescription>{t('cities.description')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t('cities.table.name')}</TableHead>
                                    <TableHead className="w-[200px]">{t('cities.table.rate')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mockCities.map((city, index) => (
                                    <TableRow key={city}>
                                        <TableCell className="font-medium">{city}</TableCell>
                                        <TableCell>
                                             <FormField
                                                control={form.control}
                                                name={`cityOverrides.${index}.rate`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <div className="relative">
                                                            <FormControl>
                                                                <Input type="number" placeholder={t('categories.table.placeholder')} {...field} />
                                                            </FormControl>
                                                            <Percent className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                        </div>
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
