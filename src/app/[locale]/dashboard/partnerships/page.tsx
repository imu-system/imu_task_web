
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, Link } from '@/navigation';
import { useEffect, useState } from 'react';
import { Loader2, Handshake, PlusCircle, MoreHorizontal, Eye, Edit, Trash2, Search } from 'lucide-react';
import { UserRole } from '@/lib/types';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
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
} from "@/components/ui/alert-dialog"

const mockPartnerships = [
    { id: 'p1', university: 'Univ. de Metz', campus: 'Saulcy', students: 325, status: 'active' },
    { id: 'p2', university: 'Univ. Tokyo', campus: 'Shinjuku', students: 512, status: 'pending' },
    { id: 'p3', university: 'Univ. Paris 8', campus: 'Vincennes', students: 87, status: 'expired' },
];


export default function PartnershipsPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const t = useTranslations('PartnershipsPage');
    
    if (authLoading || !user) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }
    
    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'active': return 'default';
            case 'pending': return 'secondary';
            case 'expired': return 'destructive';
            default: return 'outline';
        }
    }


  return (
    <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
                    <Handshake className="h-8 w-8 text-primary"/>
                    {t('title')}
                </h1>
                 <p className="text-muted-foreground">{t('subtitle')}</p>
            </div>
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
                    <Button>
                        <PlusCircle className="mr-2"/>
                        {t('createButton')}
                    </Button>
                 </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t('table.university')}</TableHead>
                            <TableHead>{t('table.campus')}</TableHead>
                            <TableHead>{t('table.students')}</TableHead>
                            <TableHead>{t('table.status')}</TableHead>
                            <TableHead><span className="sr-only">{t('table.actions')}</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {mockPartnerships.map((partnership) => (
                            <TableRow key={partnership.id}>
                                <TableCell className="font-medium">{partnership.university}</TableCell>
                                <TableCell>{partnership.campus}</TableCell>
                                <TableCell>{partnership.students}</TableCell>
                                <TableCell>
                                    <Badge variant={getStatusVariant(partnership.status)}>{t(`status.${partnership.status}`)}</Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                     <AlertDialog>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4"/>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem>
                                                    <Eye className="mr-2 h-4 w-4"/>
                                                    {t('table.viewDetails')}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <Edit className="mr-2 h-4 w-4"/>
                                                    {t('table.edit')}
                                                </DropdownMenuItem>
                                                <AlertDialogTrigger asChild>
                                                    <DropdownMenuItem className="text-destructive">
                                                        <Trash2 className="mr-2 h-4 w-4"/>
                                                        {t('table.delete')}
                                                    </DropdownMenuItem>
                                                </AlertDialogTrigger>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>{t('dialog.title')}</AlertDialogTitle>
                                                <AlertDialogDescription>{t('dialog.description', { name: partnership.university })}</AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>{t('dialog.cancel')}</AlertDialogCancel>
                                                <AlertDialogAction>{t('dialog.confirm')}</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
       </Card>
    </div>
  );
}

