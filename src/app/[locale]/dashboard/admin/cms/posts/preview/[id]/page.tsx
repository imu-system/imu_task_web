
'use client';

import { useParams } from '@/navigation';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from '@/navigation';
import { ArrowLeft, Check, Eye, Loader2, Globe } from 'lucide-react';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

const mockPostsData: any = {
    'post1': {
        title: { fr: "Bienvenue sur ImuTask !", en: "Welcome to ImuTask!", jp: "ImuTaskへようこそ！" },
        content: { fr: "C'est avec une immense joie que nous lançons officiellement ImuTask, une plateforme dédiée à connecter les générations. Notre mission est de permettre aux personnes ayant besoin d'un coup de main pour des tâches quotidiennes de trouver facilement des jeunes motivés et fiables dans leur communauté. Que ce soit pour faire les courses, un peu de jardinage ou une aide administrative, ImuTask est là pour vous. Nous croyons en la force de l'entraide locale pour tisser des liens sociaux forts. Rejoignez-nous dans cette belle aventure humaine !", en: "It is with great joy that we officially launch ImuTask, a platform dedicated to connecting generations. Our mission is to enable people who need a hand with daily tasks to easily find motivated and reliable young people in their community. Whether it's for shopping, a bit of gardening, or administrative help, ImuTask is here for you. We believe in the strength of local mutual aid to weave strong social bonds. Join us in this beautiful human adventure!", jp: "世代をつなぐプラットフォーム、ImuTaskを正式に開始できることを大変うれしく思います。私たちの使命は、日々の仕事で助けを必要とする人々が、地域社会で意欲的で信頼できる若者を簡単に見つけられるようにすることです。買い物、ちょっとしたガーデニング、または管理上の助けであれ、ImuTaskはあなたのためにここにあります。私たちは、強力な社会的絆を築くための地域相互扶助の力を信じています。この素晴らしい人間の冒険にぜひご参加ください！" },
        slug: 'bienvenue-sur-imutask',
        status: 'published',
        authorId: 'usr_1',
        publishedAt: new Date('2023-10-01T10:00:00Z'),
        featuredImageUrl: 'https://picsum.photos/seed/post1/1200/600',
    }
};


export default function PostPreviewPage() {
    const params = useParams<{ id: string }>();
    const postId = params.id;
    const t = useTranslations('AdminCmsPage.posts.preview');
    const { toast } = useToast();

    const [post, setPost] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const postData = mockPostsData[postId as string];
        if (postData) {
            setPost(postData);
        }
        setLoading(false);
    }, [postId]);

    const handlePublish = () => {
        toast({
            title: "Article publié !",
            description: "Votre article a été mis en ligne avec succès.",
        });
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-muted">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }
    
    if (!post) {
         return (
            <div className="min-h-screen bg-muted flex flex-col items-center justify-center p-4">
                <Card className="w-full max-w-lg">
                    <CardHeader>
                        <CardTitle>{t('notFound.title')}</CardTitle>
                        <CardDescription>{t('notFound.description')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="outline" asChild>
                            <Link href="/dashboard/admin/cms/posts">
                                <ArrowLeft className="mr-2"/>
                                {t('notFound.backToList')}
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
         )
    }

    return (
        <div className="min-h-screen bg-muted flex flex-col">
            <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <div className="p-2 bg-yellow-100 text-yellow-800 rounded-full">
                            <Eye className="h-5 w-5"/>
                        </div>
                        <div>
                            <h1 className="text-sm font-semibold">{t('title')}</h1>
                            <p className="text-xs text-muted-foreground">{t('description')}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-2">
                        <Button variant="outline" asChild>
                            <Link href={`/dashboard/admin/cms/posts/edit/${postId}`}>
                                <ArrowLeft className="mr-2"/>
                                {t('backToEdit')}
                            </Link>
                        </Button>
                        <Button onClick={handlePublish}>
                            <Check className="mr-2"/>
                            {t('publish')}
                        </Button>
                     </div>
                </div>
            </header>
            <main className="flex-1 py-8">
                <article className="container max-w-3xl mx-auto bg-background p-8 md:p-12 rounded-lg shadow-sm">
                    <header className="mb-8">
                        <h1 className="text-4xl md:text-5xl font-bold font-headline mb-4 text-center">{post.title.fr}</h1>
                        <p className="text-center text-muted-foreground">Publié par Nathan Imogo le {new Date(post.publishedAt).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </header>
                    
                    {post.featuredImageUrl && (
                        <div className="mb-8">
                            <Image 
                                src={post.featuredImageUrl} 
                                alt={post.title.fr} 
                                width={1200} 
                                height={600}
                                className="rounded-lg object-cover aspect-video"
                                data-ai-hint="article hero"
                            />
                        </div>
                    )}
                    
                    <Separator className="my-8"/>

                    <div className="prose prose-lg max-w-none">
                        <p>{post.content.fr}</p>
                    </div>
                </article>
            </main>
        </div>
    )
}
