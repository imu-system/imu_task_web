
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter, Link } from '@/navigation';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { Loader2, BookOpen, PlusCircle, Award, BarChart, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { UserRole } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const mockCoursesStats = [
    { id: 'basics-task-management', title: "Gestion des missions : Les bases", enrolled: 45, completed: 30 },
    { id: 'communication-with-clients', title: "Communiquer avec les clients", enrolled: 20, completed: 5 },
    { id: 'profile-optimization', title: "Optimiser votre profil prestataire", enrolled: 32, completed: 18 },
];

export default function AdminAcademyPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const t = useTranslations('AdminAcademyPage');
    
    useEffect(() => {
        if (!authLoading && (!user || !user.roles?.includes(UserRole.admin))) {
            router.push('/dashboard');
        }
    }, [user, authLoading, router]);

    if (authLoading || !user || !user.roles?.includes(UserRole.admin)) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }
    
    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
                        <BookOpen className="h-8 w-8 text-primary"/>
                        {t('title')}
                    </h1>
                    <p className="text-muted-foreground">
                        {t('subtitle')}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline"><Award className="mr-2"/>{t('manageBadges')}</Button>
                    <Button variant="outline"><BarChart className="mr-2"/>{t('globalProgress')}</Button>
                    <Button><PlusCircle className="mr-2"/>{t('createCourse')}</Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t('courseList.title')}</CardTitle>
                    <CardDescription>{t('courseList.description')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('courseList.table.course')}</TableHead>
                                <TableHead>{t('courseList.table.enrolled')}</TableHead>
                                <TableHead>{t('courseList.table.completed')}</TableHead>
                                <TableHead>{t('courseList.table.completionRate')}</TableHead>
                                <TableHead><span className="sr-only">Actions</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockCoursesStats.map((course) => (
                                <TableRow key={course.id}>
                                    <TableCell className="font-medium">{course.title}</TableCell>
                                    <TableCell>{course.enrolled}</TableCell>
                                    <TableCell>{course.completed}</TableCell>
                                    <TableCell>{((course.completed / course.enrolled) * 100).toFixed(0)}%</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon"><MoreHorizontal/></Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem><Edit className="mr-2"/>{t('courseList.actions.edit')}</DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2"/>{t('courseList.actions.delete')}</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
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
