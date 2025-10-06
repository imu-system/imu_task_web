
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, Link } from '@/navigation';
import { useEffect, useState } from 'react';
import { Loader2, ListOrdered, Eye } from 'lucide-react';
import { UserRole, Task, TaskStatus } from '@/lib/types';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getTasks } from '@/lib/data';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';

const mockTasks: Task[] = getTasks();

export default function AdminTasksPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const t = useTranslations('AdminTasksPage');
    const tDashboard = useTranslations('DashboardNav');
    
    const [tasks, setTasks] = useState<Task[]>(mockTasks);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!authLoading && (!user || !user.roles?.includes(UserRole.admin))) {
            router.push('/dashboard');
        }
    }, [user, authLoading, router]);


    if (authLoading || loading || !user || !user.roles?.includes(UserRole.admin)) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }
    
    const getStatusVariant = (status: TaskStatus) => {
        switch (status) {
            case TaskStatus.published: return 'default';
            case TaskStatus.matched: return 'secondary';
            case TaskStatus.completed: return 'outline';
            case TaskStatus.canceled: return 'destructive';
            default: return 'outline';
        }
    }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
                    <ListOrdered className="h-8 w-8 text-primary"/>
                    {t('title')}
                </h1>
                <p className="text-muted-foreground">
                {t('subtitle')}
                </p>
            </div>
             <div className="w-full md:w-1/3">
                <Input placeholder={t('searchPlaceholder')} />
            </div>
        </div>

       <Card>
            <CardHeader>
                <CardTitle>{t('tableTitle')}</CardTitle>
                <CardDescription>{t('tableDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t('table.task')}</TableHead>
                            <TableHead>{t('table.client')}</TableHead>
                            <TableHead>{t('table.category')}</TableHead>
                            <TableHead>{t('table.status')}</TableHead>
                            <TableHead><span className="sr-only">{t('table.actions')}</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tasks.map((task) => (
                            <TableRow key={task.id}>
                                <TableCell>
                                    <div className="font-medium">{task.title}</div>
                                    <div className="text-sm text-muted-foreground font-mono">{task.id}</div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={task.client.profile?.photoUrl} />
                                            <AvatarFallback>{task.client.profile?.displayName.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <span>{task.client.profile?.displayName}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline">{task.categoryId}</Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={getStatusVariant(task.status)}>{t(`status.${task.status}`)}</Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button asChild variant="outline" size="sm">
                                        <Link href={`/dashboard/admin/tasks/${task.id}`}>
                                            <Eye className="mr-2 h-4 w-4" />
                                            {t('details')}
                                        </Link>
                                    </Button>
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

