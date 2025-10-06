
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Link, useRouter } from '@/navigation';
import { useEffect, useState } from 'react';
import { Loader2, ArrowLeft } from 'lucide-react';
import { UserRole } from '@/lib/types';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

const pageSchema = z.object({
  slug: z.string().min(3, 'Le slug est requis.'),
  title: z.object({
    fr: z.string().min(3, 'Le titre FR est requis.'),
    en: z.string().optional(),
    jp: z.string().optional(),
  }),
  content: z.object({
    fr: z.string().optional(),
    en: z.string().optional(),
    jp: z.string().optional(),
  }),
  status: z.enum(['draft', 'published', 'archived']),
  seoTitle: z.object({
    fr: z.string().optional(),
    en: z.string().optional(),
    jp: z.string().optional(),
  }),
  seoDescription: z.object({
    fr: z.string().optional(),
    en: z.string().optional(),
    jp: z.string().optional(),
  }),
  isIndexed: z.boolean().default(true),
});

type PageFormValues = z.infer<typeof pageSchema>;

export default function AdminNewPagePage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const t = useTranslations('AdminCmsPage.pages');
    const { toast } = useToast();

    const [isSaving, setIsSaving] = useState(false);

    const form = useForm<PageFormValues>({
        resolver: zodResolver(pageSchema),
        defaultValues: {
            slug: '',
            title: { fr: '', en: '', jp: '' },
            content: { fr: '', en: '', jp: '' },
            status: 'draft',
            seoTitle: { fr: '', en: '', jp: '' },
            seoDescription: { fr: '', en: '', jp: '' },
            isIndexed: true,
        }
    });

    useEffect(() => {
        if (!authLoading && (!user || !user.roles?.includes(UserRole.admin))) {
            router.push('/dashboard');
        }
    }, [user, authLoading, router]);

    const onSubmit = async (data: PageFormValues) => {
        setIsSaving(true);
        console.log("Creating page data:", data);
        await new Promise(resolve => setTimeout(resolve, 1500));
        toast({
            title: t('form.toastSuccessTitle'),
            description: t('form.toastSuccessDescription'),
        });
        setIsSaving(false);
        router.push('/dashboard/admin/cms/pages');
    }
    
    if (authLoading || !user) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }

    return (
         <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" asChild>
                            <Link href="/dashboard/admin/cms/pages">
                                <ArrowLeft className="h-4 w-4"/>
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight font-headline">
                                {t('form.titleNew')}
                            </h1>
                            <p className="text-muted-foreground">
                                {t('form.subtitleNew')}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button type="submit" disabled={isSaving}>
                            {isSaving && <Loader2 className="mr-2 animate-spin"/>}
                            {t('form.saveButton')}
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
                    <div className="lg:col-span-3 space-y-8">
                         <Card>
                             <CardHeader>
                                 <CardTitle>{t('form.mainContent.title')}</CardTitle>
                             </CardHeader>
                             <CardContent>
                                 <Tabs defaultValue="fr">
                                     <TabsList>
                                         <TabsTrigger value="fr">{t('form.languages.fr')}</TabsTrigger>
                                         <TabsTrigger value="en">{t('form.languages.en')}</TabsTrigger>
                                         <TabsTrigger value="jp">{t('form.languages.jp')}</TabsTrigger>
                                     </TabsList>
                                     <TabsContent value="fr" className="space-y-4 pt-4">
                                         <FormField control={form.control} name="title.fr" render={({field}) => (<FormItem><FormLabel>{t('form.mainContent.pageTitle')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                         <FormField control={form.control} name="content.fr" render={({field}) => (<FormItem><FormLabel>{t('form.mainContent.content')}</FormLabel><FormControl><Textarea {...field} rows={15} /></FormControl><FormMessage /></FormItem>)} />
                                     </TabsContent>
                                      <TabsContent value="en" className="space-y-4 pt-4">
                                         <FormField control={form.control} name="title.en" render={({field}) => (<FormItem><FormLabel>{t('form.mainContent.pageTitle')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                         <FormField control={form.control} name="content.en" render={({field}) => (<FormItem><FormLabel>{t('form.mainContent.content')}</FormLabel><FormControl><Textarea {...field} rows={15} /></FormControl><FormMessage /></FormItem>)} />
                                     </TabsContent>
                                      <TabsContent value="jp" className="space-y-4 pt-4">
                                         <FormField control={form.control} name="title.jp" render={({field}) => (<FormItem><FormLabel>{t('form.mainContent.pageTitle')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                         <FormField control={form.control} name="content.jp" render={({field}) => (<FormItem><FormLabel>{t('form.mainContent.content')}</FormLabel><FormControl><Textarea {...field} rows={15} /></FormControl><FormMessage /></FormItem>)} />
                                     </TabsContent>
                                 </Tabs>
                             </CardContent>
                         </Card>

                        <Card>
                            <CardHeader><CardTitle>{t('form.seo.title')}</CardTitle><CardDescription>{t('form.seo.description')}</CardDescription></CardHeader>
                            <CardContent className="space-y-6">
                                <FormField control={form.control} name="slug" render={({field}) => (<FormItem><FormLabel>{t('form.seo.slug')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                 <Tabs defaultValue="fr">
                                     <TabsList>
                                         <TabsTrigger value="fr">{t('form.languages.fr')}</TabsTrigger>
                                         <TabsTrigger value="en">{t('form.languages.en')}</TabsTrigger>
                                         <TabsTrigger value="jp">{t('form.languages.jp')}</TabsTrigger>
                                     </TabsList>
                                     <TabsContent value="fr" className="space-y-4 pt-4">
                                         <FormField control={form.control} name="seoTitle.fr" render={({field}) => (<FormItem><FormLabel>{t('form.seo.seoTitle')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                         <FormField control={form.control} name="seoDescription.fr" render={({field}) => (<FormItem><FormLabel>{t('form.seo.seoDescription')}</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />
                                     </TabsContent>
                                      <TabsContent value="en" className="space-y-4 pt-4">
                                         <FormField control={form.control} name="seoTitle.en" render={({field}) => (<FormItem><FormLabel>{t('form.seo.seoTitle')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                         <FormField control={form.control} name="seoDescription.en" render={({field}) => (<FormItem><FormLabel>{t('form.seo.seoDescription')}</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />
                                     </TabsContent>
                                      <TabsContent value="jp" className="space-y-4 pt-4">
                                         <FormField control={form.control} name="seoTitle.jp" render={({field}) => (<FormItem><FormLabel>{t('form.seo.seoTitle')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                         <FormField control={form.control} name="seoDescription.jp" render={({field}) => (<FormItem><FormLabel>{t('form.seo.seoDescription')}</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />
                                     </TabsContent>
                                 </Tabs>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-1 space-y-8">
                        <Card>
                            <CardHeader><CardTitle>{t('form.publishing.title')}</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                 <FormField
                                    control={form.control}
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('form.publishing.status')}</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    <SelectItem value="draft">{t('status.draft')}</SelectItem>
                                                    <SelectItem value="published">{t('status.published')}</SelectItem>
                                                    <SelectItem value="archived">{t('status.archived')}</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="isIndexed"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                            <div className="space-y-0.5"><FormLabel>{t('form.publishing.indexation')}</FormLabel></div>
                                            <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>
         </Form>
    );
}
    