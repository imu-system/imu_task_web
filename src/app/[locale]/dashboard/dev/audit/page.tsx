
'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useState } from 'react';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';


const mockAuditLog = [
    { id: 'log1', date: '2025-09-12T12:34:00Z', actor: '@alice', action: 'Flag new-payment-flow set to 45% rollout' },
    { id: 'log2', date: '2025-09-12T11:15:00Z', actor: '@devops', action: 'Audience \'ESIEA\' import 120 users' },
    { id: 'log3', date: '2025-09-10T09:00:00Z', actor: 'system', action: 'Fixture \'demo-city\' run completed' },
];

export default function DevAuditPage() {
    const t = useTranslations('DevToolsPage.audit');
    const [dateRange, setDateRange] = useState<DateRange | undefined>();

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">
                    {t('title')}
                </h1>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <CardTitle>{t('table.title')}</CardTitle>
                        </div>
                        <Button variant="outline"><Download className="mr-2"/>{t('exportCsv')}</Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap items-end gap-4 mb-6">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">{t('filters.actor')}</label>
                            <Input placeholder="@alice" className="w-[180px]"/>
                        </div>
                         <div className="grid gap-2">
                            <label className="text-sm font-medium">{t('filters.action')}</label>
                            <Input placeholder="Flag update" className="w-[180px]"/>
                        </div>
                         <div className="grid gap-2">
                            <label className="text-sm font-medium">{t('filters.date')}</label>
                            <Popover>
                                <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className="w-[300px] justify-start text-left font-normal"
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dateRange?.from ? (
                                    dateRange.to ? (
                                        <>
                                        {format(dateRange.from, "LLL dd, y")} -{" "}
                                        {format(dateRange.to, "LLL dd, y")}
                                        </>
                                    ) : (
                                        format(dateRange.from, "LLL dd, y")
                                    )
                                    ) : (
                                    <span>{t('filters.pickDate')}</span>
                                    )}
                                </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    initialFocus
                                    mode="range"
                                    defaultMonth={dateRange?.from}
                                    selected={dateRange}
                                    onSelect={setDateRange}
                                    numberOfMonths={2}
                                />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <Button><Filter className="mr-2"/>{t('filters.filter')}</Button>
                        <Button variant="ghost"><X className="mr-2"/>{t('filters.clear')}</Button>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>#</TableHead>
                                <TableHead>{t('table.date')}</TableHead>
                                <TableHead>{t('table.actor')}</TableHead>
                                <TableHead>{t('table.action')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockAuditLog.map((log, index) => (
                                <TableRow key={log.id}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{new Date(log.date).toLocaleString()}</TableCell>
                                    <TableCell className="font-mono">{log.actor}</TableCell>
                                    <TableCell>{log.action}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
