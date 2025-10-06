'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { exportToCSV } from '@/lib/analytics/dashboard-analytics';
import { useToast } from '@/hooks/use-toast';

interface ExportReportsProps {
    userId: string;
    role: 'client' | 'provider';
}

type ReportType = 'revenue' | 'tasks' | 'activity';

export function ExportReports({ userId, role }: ExportReportsProps) {
    const [startDate, setStartDate] = useState<Date>();
    const [endDate, setEndDate] = useState<Date>();
    const [reportType, setReportType] = useState<ReportType>('revenue');
    const [isExporting, setIsExporting] = useState(false);
    const { toast } = useToast();

    const handleExport = async () => {
        if (!startDate || !endDate) {
            toast({
                title: 'Dates requises',
                description: 'Veuillez sélectionner une période.',
                variant: 'destructive',
            });
            return;
        }

        setIsExporting(true);

        try {
            // Simulated data fetch - replace with actual API calls
            const data = [
                { date: format(startDate, 'yyyy-MM-dd'), value: 0 },
            ];

            const filename = `${reportType}-${format(startDate, 'yyyy-MM-dd')}-${format(endDate, 'yyyy-MM-dd')}.csv`;
            exportToCSV(data, filename);

            toast({
                title: 'Export réussi',
                description: `Le rapport ${reportType} a été téléchargé.`,
            });
        } catch (error) {
            toast({
                title: 'Erreur',
                description: 'Une erreur est survenue lors de l\'export.',
                variant: 'destructive',
            });
        } finally {
            setIsExporting(false);
        }
    };

    const reportTypes: { value: ReportType; label: string }[] = [
        { value: 'revenue', label: role === 'provider' ? 'Revenus' : 'Dépenses' },
        { value: 'tasks', label: 'Tâches' },
        { value: 'activity', label: 'Activité' },
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle>Export de Rapports</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Date de début</label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        'w-full justify-start text-left font-normal',
                                        !startDate && 'text-muted-foreground'
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {startDate ? format(startDate, 'PPP', { locale: fr }) : 'Sélectionner'}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={startDate}
                                    onSelect={setStartDate}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Date de fin</label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        'w-full justify-start text-left font-normal',
                                        !endDate && 'text-muted-foreground'
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {endDate ? format(endDate, 'PPP', { locale: fr }) : 'Sélectionner'}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={endDate}
                                    onSelect={setEndDate}
                                    initialFocus
                                    disabled={(date) => startDate ? date < startDate : false}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Type de rapport</label>
                    <Select value={reportType} onValueChange={(value) => setReportType(value as ReportType)}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {reportTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <Button
                    onClick={handleExport}
                    disabled={isExporting || !startDate || !endDate}
                    className="w-full"
                >
                    <Download className="mr-2 h-4 w-4" />
                    {isExporting ? 'Export en cours...' : 'Exporter en CSV'}
                </Button>
            </CardContent>
        </Card>
    );
}
