
'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link } from '@/navigation';
import { PlusCircle, Search, MoreHorizontal, Edit, Trash2, Copy, BookCopy, FileUp } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const mockTemplates = [
    { id: 'tpl1', name: 'Courses hebdomadaires', category: 'Courses', address: '123 Rue Principale, Paris', lastUsed: '05/09/2025' },
    { id: 'tpl2', name: 'Nettoyage Airbnb', category: 'Nettoyage', address: '24 Rue de la Paix, Lyon', lastUsed: '28/08/2025' },
    { id: 'tpl3', name: 'Visite hebdomadaire à Mamie', category: 'Visites', address: '7 Avenue Foch, Metz', lastUsed: '06/09/2025' },
];

export default function TaskTemplatesPage() {
    const t = useTranslations('TaskTemplatesPage');

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
                    <BookCopy className="h-8 w-8 text-primary"/>
                    {t('title')}
                </h1>
                <p className="text-muted-foreground">{t('subtitle')}</p>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="relative flex-1 md:grow-0">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder={t('searchPlaceholder')}
                                className="w-full rounded-lg bg-muted pl-8 md:w-[200px] lg:w-[336px]"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Select>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder={t('filterPlaceholder')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t('filters.all')}</SelectItem>
                                    <SelectItem value="shopping">{t('filters.shopping')}</SelectItem>
                                    <SelectItem value="cleaning">{t('filters.cleaning')}</SelectItem>
                                    <SelectItem value="visits">{t('filters.visits')}</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button asChild>
                                <Link href="/dashboard/templates/new">
                                    <PlusCircle className="mr-2"/>
                                    {t('newTemplate')}
                                </Link>
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {mockTemplates.map((template) => (
                        <Card key={template.id} className="flex flex-col md:flex-row justify-between items-start p-4 gap-4">
                            <div className="flex-1">
                                <h3 className="font-semibold text-lg">{template.name}</h3>
                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
                                    <span><strong>{t('list.category')}:</strong> {template.category}</span>
                                    <span><strong>{t('list.address')}:</strong> {template.address}</span>
                                    <span><strong>{t('list.lastUsed')}:</strong> {template.lastUsed}</span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button asChild>
                                    <Link href={`/dashboard/tasks/new?templateId=${template.id}`}>
                                        <FileUp className="mr-2"/>
                                        {t('list.createTask')}
                                    </Link>
                                </Button>
                                 <AlertDialog>
                                     <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" size="icon"><MoreHorizontal /></Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem asChild>
                                                <Link href={`/dashboard/templates/edit/${template.id}`}>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    {t('list.edit')}
                                                </Link>
                                            </DropdownMenuItem>
                                             <DropdownMenuItem>
                                                <Copy className="mr-2 h-4 w-4" />
                                                {t('list.duplicate')}
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <AlertDialogTrigger asChild>
                                                <DropdownMenuItem className="text-destructive">
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    {t('list.delete')}
                                                </DropdownMenuItem>
                                            </AlertDialogTrigger>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                     <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>{t('dialog.title')}</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                {t('dialog.description', { templateName: template.name })}
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>{t('dialog.cancel')}</AlertDialogCancel>
                                            <AlertDialogAction>{t('dialog.confirm')}</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </Card>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
