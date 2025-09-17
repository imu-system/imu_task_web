
'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, Repeat, CalendarPlus, Link as LinkIcon, Bot, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { UserRole } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { Link } from '@/navigation';

const timeSlots = ["08:00 - 12:00", "12:00 - 18:00", "18:00 - 22:00"];

// Mock availability data
const availabilityData = [
  [true, false, true, true, true, false, false],
  [true, true, false, true, true, true, true],
  [false, true, true, false, false, true, false],
];

export default function AvailabilityPage() {
    const t = useTranslations('AvailabilityPage');
    const { user, loading } = useAuth();
    const isProvider = user?.roles.includes(UserRole.provider);
    const days = [t('days.mon'), t('days.tue'), t('days.wed'), t('days.thu'), t('days.fri'), t('days.sat'), t('days.sun')];

    if (loading || !user) {
      return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin h-12 w-12"/></div>
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
                <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
                    <Calendar className="h-8 w-8 text-primary"/>
                    {t('title')}
                </h1>
                <p className="text-muted-foreground">
                    {t('subtitle')}
                </p>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>{t('weekGrid.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                           <TableRow>
                                <TableHead className="w-[100px]">{t('weekGrid.time')}</TableHead>
                                {days.map(day => <TableHead key={day}>{day}</TableHead>)}
                           </TableRow>
                        </TableHeader>
                         <TableBody>
                            {timeSlots.map((slot, rowIndex) => (
                                <TableRow key={slot}>
                                    <TableCell className="font-medium">{slot}</TableCell>
                                    {availabilityData[rowIndex].map((isAvailable, colIndex) => (
                                        <TableCell key={colIndex}>
                                            <div className={cn(
                                                "w-full h-10 rounded-md",
                                                isAvailable ? "bg-green-200" : "bg-red-200/50"
                                            )}></div>
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t('actions.title')}</CardTitle>
                </CardHeader>
                 <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button variant="outline"><Repeat className="mr-2"/>{t('actions.recurring')}</Button>
                    <Button variant="outline"><CalendarPlus className="mr-2"/>{t('actions.exception')}</Button>
                    <Button variant="outline"><LinkIcon className="mr-2"/>{t('actions.sync')}</Button>
                </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bot className="h-6 w-6 text-primary"/>
                        {t('suggestions.title')}
                    </CardTitle>
                    <CardDescription>{t('suggestions.description')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                   <div className="p-3 bg-background rounded-lg border">
                        <p className="font-semibold">{t('suggestions.suggestion1.title')}</p>
                        <p className="text-sm text-muted-foreground">{t('suggestions.suggestion1.description')}</p>
                   </div>
                   <div className="p-3 bg-background rounded-lg border">
                        <p className="font-semibold">{t('suggestions.suggestion2.title')}</p>
                        <p className="text-sm text-muted-foreground">{t('suggestions.suggestion2.description')}</p>
                   </div>
                   <div className="flex gap-2 justify-end">
                       <Button variant="ghost"><X className="mr-2"/>{t('suggestions.ignore')}</Button>
                       <Button><Check className="mr-2"/>{t('suggestions.accept')}</Button>
                   </div>
                </CardContent>
            </Card>

        </div>
    )
}
