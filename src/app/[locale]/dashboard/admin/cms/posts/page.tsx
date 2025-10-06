
'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, Trash2 } from 'lucide-react';
import { Link } from '@/navigation';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

type PostStatus = 'draft' | 'published' | 'archived';

interface Post {
    id: string;
    title: string;
    author: string;
    status: PostStatus;
    publishedAt: Date | null;
    updatedAt: Date;
}

const mockPosts: Post[] = [
    { id: 'post1', title: "Bienvenue sur ImuTask !", author: 'Nathan Imogo', status: 'published', publishedAt: new Date('2023-10-01T10:00:00Z'), updatedAt: new Date('2023-10-01T11:00:00Z') },
    { id: 'post2', title: "5 conseils pour une première mission réussie", author: 'Jane Doe', status: 'published', publishedAt: new Date('2023-10-15T14:00:00Z'), updatedAt: new Date('2023-10-15T14:00:00Z') },
    { id: 'post3', title: "Nouvelle fonctionnalité : Le portefeuille", author: 'Nathan Imogo', status: 'draft', publishedAt: null, updatedAt: new Date('2023-10-25T09:30:00Z') },
]

export default function AdminPostsPage() {
    const t = useTranslations('AdminCmsPage.posts');
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // In a real app, you would fetch this from your backend/CMS
        setPosts(mockPosts);
        setLoading(false);
    }, []);

    const getStatusVariant = (status: PostStatus) => {
        switch (status) {
            case 'published': return 'default';
            case 'draft': return 'secondary';
            case 'archived': return 'outline';
            default: return 'outline';
        }
    }


    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                        <CardTitle>{t('title')}</CardTitle>
                        <CardDescription>{t('description')}</CardDescription>
                    </div>
                    <Button asChild>
                        <Link href="/dashboard/admin/cms/posts/new">
                             <PlusCircle className="mr-2"/>
                            {t('actions.create')}
                        </Link>
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t('table.header.title')}</TableHead>
                            <TableHead>{t('table.header.author')}</TableHead>
                            <TableHead>{t('table.header.status')}</TableHead>
                            <TableHead>{t('table.header.publishedAt')}</TableHead>
                            <TableHead><span className="sr-only">{t('actions.title')}</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24">
                                    <Loader2 className="animate-spin text-primary"/>
                                </TableCell>
                            </TableRow>
                        ) : posts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                    {t('noPosts')}
                                </TableCell>
                            </TableRow>
                        ) : (
                            posts.map((post) => (
                                <TableRow key={post.id}>
                                    <TableCell className="font-medium">{post.title}</TableCell>
                                    <TableCell>{post.author}</TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusVariant(post.status)}>{t(`status.${post.status}`)}</Badge>
                                    </TableCell>
                                    <TableCell>{post.publishedAt ? post.publishedAt.toLocaleDateString() : '—'}</TableCell>
                                    <TableCell className="text-right">
                                         <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4"/>
                                                    <span className="sr-only">{t('actions.title')}</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/dashboard/admin/cms/posts/edit/${post.id}`}>{t('actions.edit')}</Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem asChild>
                                                     <Link href={`/dashboard/admin/cms/posts/${post.id}/preview`} target="_blank">{t('actions.view')}</Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive">
                                                     <Trash2 className="mr-2"/>
                                                    {t('actions.delete')}
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
    );
}
