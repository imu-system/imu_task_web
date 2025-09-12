
'use client';

import TaskCard from '@/components/task-card';
import { useAuth } from '@/hooks/use-auth';
import { getOffers, getTasks } from '@/lib/data';
import { Offer, Task, TaskStatus, UserRole } from '@/lib/types';
import { useTranslations } from 'next-intl';
import { useEffect, useState, useMemo } from 'react';
import { Loader2, Briefcase, LayoutGrid, List } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from '@/navigation';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import TaskListCard from '@/components/task-list-card';

export default function ProviderOffersPage() {
    const t = useTranslations('ProviderOffersPage');
    const tTasks = useTranslations('MyTasksPage');
    const { user } = useAuth();
    const [recommendedTasks, setRecommendedTasks] = useState<Task[]>([]);
    const [sentOffers, setSentOffers] = useState<Offer[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'grid' | 'list'>('grid');
    const [searchTerm, setSearchTerm] = useState('');

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
    
    const filteredTasks = useMemo(() => {
        return recommendedTasks.filter(task => 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [recommendedTasks, searchTerm]);


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
                
                <div className="flex flex-col md:flex-row gap-4 justify-between">
                    <Input 
                        placeholder={tTasks('searchPlaceholder')}
                        className="max-w-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="flex items-center gap-2">
                        <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                            <Button variant={view === 'grid' ? 'default' : 'outline'} size="icon" onClick={() => setView('grid')}>
                                <LayoutGrid className="h-4 w-4" />
                                <span className="sr-only">{tTasks('viewGrid')}</span>
                            </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                            <p>{tTasks('viewGrid')}</p>
                            </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                            <Button variant={view === 'list' ? 'default' : 'outline'} size="icon" onClick={() => setView('list')}>
                                <List className="h-4 w-4" />
                                <span className="sr-only">{tTasks('viewList')}</span>
                            </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                            <p>{tTasks('viewList')}</p>
                            </TooltipContent>
                        </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>

                {filteredTasks.length > 0 ? (
                    <>
                        {view === 'grid' ? (
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {filteredTasks.map(task => (
                                    <TaskCard key={task.id} task={task} />
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredTasks.map(task => (
                                    <TaskListCard key={task.id} task={task} />
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                     <div className="text-center py-12 rounded-lg border bg-card">
                        <p className="text-muted-foreground">{searchTerm ? tTasks('noSearchResults') : t('recommendedTasks.noTasks')}</p>
                    </div>
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
