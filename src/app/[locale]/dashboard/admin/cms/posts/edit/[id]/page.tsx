
'use client';

import { useAuth } from '@/hooks/use-auth';
import { Link, useRouter } from '@/navigation';
import { useParams } from 'next/navigation';
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
import { Checkbox } from '@/components/ui/checkbox';


// Mock Data - In a real app, this would come from a database
const mockPostsData: any = {
    'post1': {
        title: { fr: "Bienvenue sur ImuTask !", en: "Welcome to ImuTask!", jp: "ImuTaskへようこそ！" },
        content: { fr: "Contenu de l'article en français...", en: "Article content in English...", jp: "記事の内容..." },
        excerpt: { fr: "Ceci est un extrait de l'article...", en: "This is an excerpt of the article...", jp: "これは記事の抜粋です..." },
        slug: 'bienvenue-sur-imutask',
        status: 'published',
        authorId: 'usr_1',
        publishedAt: new Date('2023-10-01T10:00:00Z'),
        seoTitle: { fr: "Bienvenue sur ImuTask !", en: "Welcome to ImuTask!", jp: "ImuTaskへようこそ！" },
        seoDescription: { fr: "Découvrez le lancement de notre plateforme.", en: "Discover the launch of our platform.", jp: "私たちのプラットフォームのローンチをご覧ください。" },
        isIndexed: true,
        tags: 'annonce, lancement',
        featuredImageUrl: 'https://picsum.photos/seed/post1/1200/600',
    }
};

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

export default function AdminEditPostPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const params = useParams<{ id: string }>();
    const postId = params.id;
    const t = useTranslations('AdminCmsPage.posts.edit');
    const { toast } = useToast();

    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const form = useForm<PostFormValues>({
        resolver: zodResolver(postSchema),
        defaultValues: {
            title: { fr: '', en: '', jp: '' },
            content: { fr: '', en: '', jp: '' },
            excerpt: { fr: '', en: '', jp: '' },
            slug: '',
            status: 'draft',
            authorId: '',
            publishedAt: new Date(),
            seoTitle: { fr: '', en: '', jp: '' },
            seoDescription: { fr: '', en: '', jp: '' },
            isIndexed: true,
            tags: '',
        }
    });

    useEffect(() => {
        if (!authLoading && (!user || !user.roles?.includes(UserRole.admin))) {
            router.push('/dashboard');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        setIsLoading(true);
        const postData = mockPostsData[postId];
        if (postData) {
            form.reset(postData);
        } else {
            toast({
                variant: 'destructive',
                title: t('toast.notFoundTitle'),
                description: t('toast.notFoundDescription')
            })
            router.push('/dashboard/admin/cms/posts');
        }
        setIsLoading(false);
    }, [postId, form, router, toast, t]);

    const onSubmit = async (data: PostFormValues) => {
        setIsSaving(true);
        console.log("Saving post data:", data);
        await new Promise(resolve => setTimeout(resolve, 1500));
        toast({
            title: t('toast.successTitle'),
            description: t('toast.successDescription'),
        });
        setIsSaving(false);
    }
    
    if (authLoading || isLoading || !user) {
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
                                {t('subtitle', { postId: postId.substring(0, 6) })}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" asChild>
                            <Link href={`/dashboard/admin/cms/posts/${postId}/preview`} target="_blank">
                                <Eye className="mr-2"/>
                                {t('previewButton')}
                            </Link>
                        </Button>
                        <Button type="submit" disabled={isSaving}>
                            {isSaving && <Loader2 className="mr-2 animate-spin"/>}
                            {t('saveButton')}
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
                    <div className="lg:col-span-3 space-y-8">
                         <Card>
                             <CardHeader>
                                 <CardTitle>{t('mainContent.title')}</CardTitle>
                             </CardHeader>
                             <CardContent>
                                 <Tabs defaultValue="fr">
                                     <TabsList>
                                         <TabsTrigger value="fr">{t('languages.fr')}</TabsTrigger>
                                         <TabsTrigger value="en">{t('languages.en')}</TabsTrigger>
                                         <TabsTrigger value="jp">{t('languages.jp')}</TabsTrigger>
                                     </TabsList>
                                     <TabsContent value="fr" className="space-y-4 pt-4">
                                         <FormField control={form.control} name="title.fr" render={({field}) => (<FormItem><FormLabel>{t('mainContent.postTitle')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                         <FormField control={form.control} name="content.fr" render={({field}) => (<FormItem><FormLabel>{t('mainContent.content')}</FormLabel><FormControl><Textarea {...field} rows={15} /></FormControl><FormMessage /></FormItem>)} />
                                     </TabsContent>
                                      <TabsContent value="en" className="space-y-4 pt-4">
                                         <FormField control={form.control} name="title.en" render={({field}) => (<FormItem><FormLabel>{t('mainContent.postTitle')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                         <FormField control={form.control} name="content.en" render={({field}) => (<FormItem><FormLabel>{t('mainContent.content')}</FormLabel><FormControl><Textarea {...field} rows={15} /></FormControl><FormMessage /></FormItem>)} />
                                     </TabsContent>
                                      <TabsContent value="jp" className="space-y-4 pt-4">
                                         <FormField control={form.control} name="title.jp" render={({field}) => (<FormItem><FormLabel>{t('mainContent.postTitle')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                         <FormField control={form.control} name="content.jp" render={({field}) => (<FormItem><FormLabel>{t('mainContent.content')}</FormLabel><FormControl><Textarea {...field} rows={15} /></FormControl><FormMessage /></FormItem>)} />
                                     </TabsContent>
                                 </Tabs>
                             </CardContent>
                         </Card>

                        <Card>
                            <CardHeader><CardTitle>{t('excerpt.title')}</CardTitle></CardHeader>
                            <CardContent>
                                <Tabs defaultValue="fr">
                                     <TabsList>
                                         <TabsTrigger value="fr">{t('languages.fr')}</TabsTrigger>
                                         <TabsTrigger value="en">{t('languages.en')}</TabsTrigger>
                                         <TabsTrigger value="jp">{t('languages.jp')}</TabsTrigger>
                                     </TabsList>
                                    <TabsContent value="fr" className="pt-4">
                                        <FormField control={form.control} name="excerpt.fr" render={({field}) => (<FormItem><FormLabel>{t('excerpt.label')}</FormLabel><FormControl><Textarea {...field} rows={3} /></FormControl><FormMessage /></FormItem>)} />
                                    </TabsContent>
                                     <TabsContent value="en" className="pt-4">
                                        <FormField control={form.control} name="excerpt.en" render={({field}) => (<FormItem><FormLabel>{t('excerpt.label')}</FormLabel><FormControl><Textarea {...field} rows={3} /></FormControl><FormMessage /></FormItem>)} />
                                    </TabsContent>
                                     <TabsContent value="jp" className="pt-4">
                                        <FormField control={form.control} name="excerpt.jp" render={({field}) => (<FormItem><FormLabel>{t('excerpt.label')}</FormLabel><FormControl><Textarea {...field} rows={3} /></FormControl><FormMessage /></FormItem>)} />
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader><CardTitle>{t('seo.title')}</CardTitle><CardDescription>{t('seo.description')}</CardDescription></CardHeader>
                            <CardContent className="space-y-6">
                                <FormField control={form.control} name="slug" render={({field}) => (<FormItem><FormLabel>{t('seo.slug')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                 <Tabs defaultValue="fr">
                                     <TabsList>
                                         <TabsTrigger value="fr">{t('languages.fr')}</TabsTrigger>
                                         <TabsTrigger value="en">{t('languages.en')}</TabsTrigger>
                                         <TabsTrigger value="jp">{t('languages.jp')}</TabsTrigger>
                                     </TabsList>
                                     <TabsContent value="fr" className="space-y-4 pt-4">
                                         <FormField control={form.control} name="seoTitle.fr" render={({field}) => (<FormItem><FormLabel>{t('seo.seoTitle')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                         <FormField control={form.control} name="seoDescription.fr" render={({field}) => (<FormItem><FormLabel>{t('seo.seoDescription')}</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />
                                     </TabsContent>
                                      <TabsContent value="en" className="space-y-4 pt-4">
                                         <FormField control={form.control} name="seoTitle.en" render={({field}) => (<FormItem><FormLabel>{t('seo.seoTitle')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                         <FormField control={form.control} name="seoDescription.en" render={({field}) => (<FormItem><FormLabel>{t('seo.seoDescription')}</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />
                                     </TabsContent>
                                      <TabsContent value="jp" className="space-y-4 pt-4">
                                         <FormField control={form.control} name="seoTitle.jp" render={({field}) => (<FormItem><FormLabel>{t('seo.seoTitle')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                         <FormField control={form.control} name="seoDescription.jp" render={({field}) => (<FormItem><FormLabel>{t('seo.seoDescription')}</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>)} />
                                     </TabsContent>
                                 </Tabs>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-1 space-y-8">
                        <Card>
                            <CardHeader><CardTitle>{t('publishing.title')}</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                 <FormField
                                    control={form.control}
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('publishing.status')}</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    <SelectItem value="draft">{t('status.draft')}</SelectItem>
                                                    <SelectItem value="published">{t('status.published')}</SelectItem>
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
                                            <FormLabel>{t('publishing.publishDate')}</FormLabel>
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
                                            <FormLabel>{t('publishing.author')}</FormLabel>
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
                                            <div className="space-y-0.5"><FormLabel>{t('publishing.indexation')}</FormLabel></div>
                                            <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        <Card>
                             <CardHeader><CardTitle>{t('organization.title')}</CardTitle></CardHeader>
                             <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="tags"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('organization.tags')}</FormLabel>
                                            <FormControl><Input {...field} placeholder={t('organization.tagsPlaceholder')} /></FormControl>
                                            <FormDescription>{t('organization.tagsDescription')}</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                             </CardContent>
                        </Card>
                        
                         <Card>
                             <CardHeader><CardTitle>{t('featuredImage.title')}</CardTitle></CardHeader>
                             <CardContent className="space-y-2">
                                <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                                    <p className="text-sm text-muted-foreground">{t('featuredImage.placeholder')}</p>
                                </div>
                                <Button variant="outline" className="w-full">{t('featuredImage.button')}</Button>
                             </CardContent>
                        </Card>
                    </div>
                </div>
            </form>
         </Form>
    );
}

    
