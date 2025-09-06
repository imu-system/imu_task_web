
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
import { ContentPage, PageStatus } from '@/lib/types';
import { getPages } from '@/lib/data';

export default function AdminPagesPage() {
    const t = useTranslations('AdminCmsPage.pages');
    const [pages, setPages] = useState<ContentPage[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // In a real app, you would fetch this from your backend/CMS
        setPages(getPages());
        setLoading(false);
    }, []);

    const getStatusVariant = (status: PageStatus) => {
        switch (status) {
            case PageStatus.published: return 'default';
            case PageStatus.draft: return 'secondary';
            case PageStatus.archived: return 'outline';
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
                        <Link href="#">
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
                            <TableHead>{t('table.header.slug')}</TableHead>
                            <TableHead>{t('table.header.status')}</TableHead>
                            <TableHead>{t('table.header.lastModified')}</TableHead>
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
                        ) : pages.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                    {t('noPages')}
                                </TableCell>
                            </TableRow>
                        ) : (
                            pages.map((page) => (
                                <TableRow key={page.id}>
                                    <TableCell className="font-medium">{page.title.fr}</TableCell>
                                    <TableCell>
                                        <code className="text-sm text-muted-foreground bg-muted p-1 rounded-sm">/{page.slug}</code>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusVariant(page.status)}>{t(`status.${page.status}`)}</Badge>
                                    </TableCell>
                                    <TableCell>{new Date(page.updatedAt).toLocaleDateString()}</TableCell>
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
                                                    <Link href="#">{t('actions.edit')}</Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem asChild>
                                                     <Link href={`/${page.slug}`} target="_blank">{t('actions.view')}</Link>
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
