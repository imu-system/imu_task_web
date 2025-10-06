

'use client';

import { useAuth } from '@/hooks/use-auth';
import { Link, useRouter } from '@/navigation';
import { useEffect, useState } from 'react';
import { Loader2, ArrowLeft, FileText, Calendar as CalendarIcon, Eye } from 'lucide-react';
import { UserRole } from '@/lib/types';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';


const mockUsers = [
    { id: 'usr_1', name: 'Nathan Imogo' },
    { id: 'usr_2', name: 'Jane Doe' },
];


const postSchema = z.object({
  title: z.object({
    fr: z.string().min(3, 'Le titre est requis.'),
    en: z.string().optional(),
    jp: z.string().optional(),
  }),
  content: z.object({
    fr: z.string().optional(),
    en: z.string().optional(),
    jp: z.string().optional(),
  }),
   excerpt: z.object({
    fr: z.string().optional(),
    en: z.string().optional(),
    jp: z.string().optional(),
  }),
  slug: z.string().min(3, 'Le slug est requis.'),
  status: z.enum(['draft', 'published']),
  authorId: z.string(),
  publishedAt: z.date(),
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
  tags: z.string().optional(),
});

type PostFormValues = z.infer<typeof postSchema>;

export default function AdminNewPostPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const t = useTranslations('AdminCmsPage.posts.new');
    const tEdit = useTranslations('AdminCmsPage.posts.edit');
    const { toast } = useToast();

    const [isSaving, setIsSaving] = useState(false);

    const form = useForm<PostFormValues>({
        resolver: zodResolver(postSchema),
        defaultValues: {
            title: { fr: '', en: '', jp: '' },
            content: { fr: '', en: '', jp: '' },
            excerpt: { fr: '', en: '', jp: '' },
            slug: '',
            status: 'draft',
            authorId: user?.uid || '',
            publishedAt: new Date(),
            seoTitle: { fr: '', en: '', jp: '' },
            seoDescription: { fr: '', en: '', jp: '' },
            isIndexed: true,
            tags: '',
        }
    });
    
    useEffect(() => {
        // Set authorId once user is loaded
        if (user) {
            form.setValue('authorId', user.uid);
        }
    }, [user, form]);

    useEffect(() => {
        if (!authLoading && (!user || !user.roles?.includes(UserRole.admin))) {
            router.push('/dashboard');
        }
    }, [user, authLoading, router]);


    const onSubmit = async (data: PostFormValues) => {
        setIsSaving(true);
        console.log("Creating post data:", data);
        await new Promise(resolve => setTimeout(resolve, 1500));
        toast({
            title: tEdit('toast.successTitle'),
            description: "Le nouvel article a été créé avec succès.",
        });
        setIsSaving(false);
        router.push('/dashboard/admin/cms/posts');
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
                            <Link href="/dashboard/admin/cms/posts">
                                <ArrowLeft className="h-4 w-4"/>
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight font-headline">
                                {t('title')}
                            </h1>
                            <p className="text-muted-foreground">
                                {t('subtitle')}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button type="submit" disabled={isSaving}>
                            {isSaving && <Loader2 className="mr-2 animate-spin"/>}
                            {tEdit('saveButton')}
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
                    <div className="lg:col-span-3 space-y-8">
                         <Card>
                             <CardHeader>
                                 <CardTitle>{tEdit('mainContent.title')}</CardTitle>
                             </CardHeader>
                             <CardContent>
                                 <Tabs defaultValue="fr">
                                     <TabsList>
                                         <TabsTrigger value="fr">{tEdit('languages.fr')}</TabsTrigger>
                                         <TabsTrigger value="en">{tEdit('languages.en')}</TabsTrigger>
                                         <TabsTrigger value="jp">{tEdit('languages.jp')}</TabsTrigger>
                                     </TabsList>
                                     <TabsContent value="fr" className="space-y-4 pt-4">
                                         <FormField control={form.control} name="title.fr" render={({field}) => (<FormItem><FormLabel>{tEdit('mainContent.postTitle')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                         <FormField control={form.control} name="content.fr" render={({field}) => (<FormItem><FormLabel>{tEdit('mainContent.content')}</FormLabel><FormControl><Textarea {...field} rows={15} /></FormControl><FormMessage /></FormItem>)} />
                                     </TabsContent>
                                      <TabsContent value="en" className="space-y-4 pt-4">
                                         <FormField control={form.control} name="title.en" render={({field}) => (<FormItem><FormLabel>{tEdit('mainContent.postTitle')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                         <FormField control={form.control} name="content.en" render={({field}) => (<FormItem><FormLabel>{tEdit('mainContent.content')}</FormLabel><FormControl><Textarea {...field} rows={15} /></FormControl><FormMessage /></FormItem>)} />
                                     </TabsContent>
                                      <TabsContent value="jp" className="space-y-4 pt-4">
                                         <FormField control={form.control} name="title.jp" render={({field}) => (<FormItem><FormLabel>{tEdit('mainContent.postTitle')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                         <FormField control={form.control} name="content.jp" render={({field}) => (<FormItem><FormLabel>{tEdit('mainContent.content')}</FormLabel><FormControl><Textarea {...field} rows={15} /></FormControl><FormMessage /></FormItem>)} />
                                     </TabsContent>
                                 </Tabs>
                             </CardContent>
                         </Card>

                        <Card>
                            <CardHeader><CardTitle>{tEdit('excerpt.title')}</CardTitle></CardHeader>
                            <CardContent>
                                <Tabs defaultValue="fr">
                                     <TabsList>
                                         <TabsTrigger value="fr">{tEdit('languages.fr')}</TabsTrigger>
                                         <TabsTrigger value="en">{tEdit('languages.en')}</TabsTrigger>
                                         <TabsTrigger value="jp">{tEdit('languages.jp')}</TabsTrigger>
                                     </TabsList>
                                    <TabsContent value="fr" className="pt-4">
                                        <FormField control={form.control} name="excerpt.fr" render={({field}) => (<FormItem><FormLabel>{tEdit('excerpt.label')}</FormLabel><FormControl><Textarea {...field} rows={3} /></FormControl><FormMessage /></FormItem>)} />
                                    </TabsContent>
                                     <TabsContent value="en" className="pt-4">
                                        <FormField control={form.control} name="excerpt.en" render={({field}) => (<FormItem><FormLabel>{tEdit('excerpt.label')}</FormLabel><FormControl><Textarea {...field} rows={3} /></FormControl><FormMessage /></FormItem>)} />
                                    </TabsContent>
                                     <TabsContent value="jp" className="pt-4">
                                        <FormField control={form.control} name="excerpt.jp" render={({field}) => (<FormItem><FormLabel>{tEdit('excerpt.label')}</FormLabel><FormControl><Textarea {...field} rows={3} /></FormControl><FormMessage /></FormItem>)} />
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader><CardTitle>{tEdit('seo.title')}</CardTitle><CardDescription>{tEdit('seo.description')}</CardDescription></CardHeader>
                            <CardContent className="space-y-6">
                                <FormField control={form.control} name="slug" render={({field}) => (<FormItem><FormLabel>{tEdit('seo.slug')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                 <Tabs defaultValue="fr">
                                     <TabsList>
                                         <TabsTrigger value="fr">{tEdit('languages.fr')}</TabsTrigger>
                                         <TabsTrigger value="en">{tEdit('languages.en')}</TabsTrigger>
                                         <TabsTrigger value="jp">{tEdit('languages.jp')}</TabsTrigger>
                                     </TabsList>
                                     <TabsContent value="fr" className="space-y-4 pt-4">
                                         <FormField control={form.control} name="seoTitle.fr" render={({field}) => (<FormItem><FormLabel>{tEdit('seo.seoTitle')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                         <FormField control={form.control} name="seoDescription.fr" render={({field}) => (<FormItem><FormLabel>{tEdit('seo.seoDescription')}</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />
                                     </TabsContent>
                                      <TabsContent value="en" className="space-y-4 pt-4">
                                         <FormField control={form.control} name="seoTitle.en" render={({field}) => (<FormItem><FormLabel>{tEdit('seo.seoTitle')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                         <FormField control={form.control} name="seoDescription.en" render={({field}) => (<FormItem><FormLabel>{tEdit('seo.seoDescription')}</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />
                                     </TabsContent>
                                      <TabsContent value="jp" className="space-y-4 pt-4">
                                         <FormField control={form.control} name="seoTitle.jp" render={({field}) => (<FormItem><FormLabel>{tEdit('seo.seoTitle')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                         <FormField control={form.control} name="seoDescription.jp" render={({field}) => (<FormItem><FormLabel>{tEdit('seo.seoDescription')}</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />
                                     </TabsContent>
                                 </Tabs>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-1 space-y-8">
                        <Card>
                            <CardHeader><CardTitle>{tEdit('publishing.title')}</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                 <FormField
                                    control={form.control}
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{tEdit('publishing.status')}</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    <SelectItem value="draft">{tEdit('status.draft')}</SelectItem>
                                                    <SelectItem value="published">{tEdit('status.published')}</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="publishedAt"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{tEdit('publishing.publishDate')}</FormLabel>
                                             <Popover>
                                                <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                                    {field.value ? format(field.value, "PPP") : (<span>Pick a date</span>)}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="authorId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{tEdit('publishing.author')}</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    {mockUsers.map(u => (<SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>))}
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
                                            <div className="space-y-0.5"><FormLabel>{tEdit('publishing.indexation')}</FormLabel></div>
                                            <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        <Card>
                             <CardHeader><CardTitle>{tEdit('organization.title')}</CardTitle></CardHeader>
                             <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="tags"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{tEdit('organization.tags')}</FormLabel>
                                            <FormControl><Input {...field} placeholder={tEdit('organization.tagsPlaceholder')} /></FormControl>
                                            <FormDescription>{tEdit('organization.tagsDescription')}</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                             </CardContent>
                        </Card>
                        
                         <Card>
                             <CardHeader><CardTitle>{tEdit('featuredImage.title')}</CardTitle></CardHeader>
                             <CardContent className="space-y-2">
                                <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                                    <p className="text-sm text-muted-foreground">{tEdit('featuredImage.placeholder')}</p>
                                </div>
                                <Button variant="outline" className="w-full">{tEdit('featuredImage.button')}</Button>
                             </CardContent>
                        </Card>
                    </div>
                </div>
            </form>
         </Form>
    );
}