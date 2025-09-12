
'use client';

import TaskCard from '@/components/task-card';
import { useAuth } from '@/hooks/use-auth';
import { getOffers, getTasks } from '@/lib/data';
import { Offer, Task, TaskStatus, UserRole } from '@/lib/types';
import { useTranslations } from 'next-intl';
import { useEffect, useState, useMemo } from 'react';
import { Loader2, Briefcase, LayoutGrid, List, Calendar as CalendarIcon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from '@/navigation';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import TaskListCard from '@/components/task-list-card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import TaskCalendarCard from '@/components/task-calendar-card';

export default function ProviderOffersPage() {
    const t = useTranslations('ProviderOffersPage');
    const tTasks = useTranslations('MyTasksPage');
    const { user } = useAuth();
    const [recommendedTasks, setRecommendedTasks] = useState<Task[]>([]);
    const [sentOffers, setSentOffers] = useState<Offer[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'grid' | 'list'>('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

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
    
    const tasksByDay = useMemo(() => {
        const tasksMap: { [key: string]: Task[] } = {};
        recommendedTasks.forEach(task => {
            const date = new Date(task.timeWindowStart).toDateString();
            if (!tasksMap[date]) {
                tasksMap[date] = [];
            }
            tasksMap[date].push(task);
        });
        return tasksMap;
    }, [recommendedTasks]);
    
    const tasksForSelectedDay = useMemo(() => {
        if (!selectedDate) return [];
        return tasksByDay[selectedDate.toDateString()] || [];
    }, [selectedDate, tasksByDay]);

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
    
    const DayWithTasks = ({ date }: { date: Date }) => {
        const dateString = date.toDateString();
        const tasksForDay = tasksByDay[dateString];

        if (tasksForDay) {
            return (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger className="w-full h-full flex items-center justify-center">
                            <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-primary"></div>
                            {date.getDate()}
                        </TooltipTrigger>
                        <TooltipContent>
                            <div className="p-1 space-y-1">
                                {tasksForDay.map(task => (
                                    <p key={task.id} className="text-xs">{task.title}</p>
                                ))}
                            </div>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )
        }
        return date.getDate();
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
            
            <Tabs defaultValue="list">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="list">{t('tabs.list')}</TabsTrigger>
                    <TabsTrigger value="calendar">{t('tabs.calendar')}</TabsTrigger>
                </TabsList>
                 <TabsContent value="list">
                    <div className="space-y-4 pt-4">
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
                 </TabsContent>
                 <TabsContent value="calendar">
                     <Card>
                        <CardHeader>
                            <CardTitle>{t('calendarView.title')}</CardTitle>
                            <CardDescription>{t('calendarView.description')}</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
                             <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={setSelectedDate}
                                className="rounded-md border p-0"
                                components={{
                                    Day: DayWithTasks
                                }}
                            />
                            <div className="space-y-4">
                                <h3 className="font-semibold text-lg">{t('calendarView.tasksFor', { date: selectedDate ? selectedDate.toLocaleDateString() : '...' })}</h3>
                                {tasksForSelectedDay.length > 0 ? (
                                    <div className="space-y-2">
                                        {tasksForSelectedDay.map(task => (
                                            <TaskCalendarCard key={task.id} task={task} />
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground pt-4">{t('calendarView.noTasksForDay')}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                 </TabsContent>
            </Tabs>

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
