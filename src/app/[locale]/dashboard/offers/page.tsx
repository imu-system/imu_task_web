
'use client';

import TaskCard from '@/components/task-card';
import { useAuth } from '@/hooks/use-auth';
import { getOffers, getTasks } from '@/lib/data';
import { Offer, Task, TaskStatus, UserRole } from '@/lib/types';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Loader2, Briefcase } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from '@/navigation';

export default function ProviderOffersPage() {
    const t = useTranslations('ProviderOffersPage');
    const { user } = useAuth();
    const [recommendedTasks, setRecommendedTasks] = useState<Task[]>([]);
    const [sentOffers, setSentOffers] = useState<Offer[]>([]);
    const [loading, setLoading] = useState(true);

    const isProvider = user?.roles.includes(UserRole.provider);

    useEffect(() => {
        if (user && isProvider) {
            setLoading(true);
            const allTasks = getTasks();
            const allOffers = getOffers();
            
            // For now, just show published tasks as "recommended"
            setRecommendedTasks(allTasks.filter(t => t.status === TaskStatus.published));
            
            // Filter offers sent by the current provider
            setSentOffers(allOffers.filter(o => o.providerId === user.uid));
            
            setLoading(false);
        } else {
            setLoading(false);
        }
    }, [user, isProvider]);

    if (loading) {
        return <div className="flex h-64 items-center justify-center"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>;
    }
    
    if (!isProvider) {
        return (
            <div className="text-center p-8">
                <h2 className="text-xl font-semibold">{t('notProvider.title')}</h2>
                <p className="text-muted-foreground mt-2">{t('notProvider.description')}</p>
                 <Button asChild className="mt-4"><Link href="/dashboard/profile">{t('notProvider.button')}</Link></Button>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight font-headline">
                    <Briefcase className="h-8 w-8 text-primary" />
                    {t('title')}
                </h1>
                <p className="text-muted-foreground">{t('subtitle')}</p>
            </div>
            
            <div className="space-y-4">
                <h2 className="text-2xl font-bold font-headline">{t('recommendedTasks.title')}</h2>
                {recommendedTasks.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {recommendedTasks.map(task => (
                            <TaskCard key={task.id} task={task} />
                        ))}
                    </div>
                ) : (
                    <p className="text-muted-foreground">{t('recommendedTasks.noTasks')}</p>
                )}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t('sentOffers.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('sentOffers.table.task')}</TableHead>
                                <TableHead>{t('sentOffers.table.yourPrice')}</TableHead>
                                <TableHead>{t('sentOffers.table.status')}</TableHead>
                                <TableHead><span className="sr-only">Actions</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sentOffers.length > 0 ? (
                                sentOffers.map(offer => (
                                    <TableRow key={offer.id}>
                                        <TableCell className="font-medium">{offer.task?.title}</TableCell>
                                        <TableCell>{offer.proposedPrice}€</TableCell>
                                        <TableCell><Badge>{offer.status}</Badge></TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={`/dashboard/tasks/${offer.taskId}`}>{t('sentOffers.table.view')}</Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">{t('sentOffers.noOffers')}</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
