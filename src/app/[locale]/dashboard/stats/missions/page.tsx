
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslations } from 'next-intl';
import { Loader2, ArrowLeft, Download, MessageSquare, Star } from 'lucide-react';
import { UserRole } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from '@/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const mockMissions = [
    { id: 'm1', name: 'Courses Client A', duration: '2h', earnings: 25.00, rating: 4, category: 'Courses', conversationLink: '#' },
    { id: 'm2', name: 'Nettoyage B', duration: '3h', earnings: 45.00, rating: 5, category: 'Nettoyage', conversationLink: '#' },
    { id: 'm3', name: 'Jardinage C', duration: '1.5h', earnings: 20.00, rating: 4, category: 'Jardinage', conversationLink: '#' },
];

export default function DetailedMissionsPage() {
    const { user, loading } = useAuth();
    const t = useTranslations('StatsPage.missions');

    if (loading || !user) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }
    
    const StarRating = ({ rating }: { rating: number }) => (
        <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
                <Star
                    key={i}
                    className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                />
            ))}
        </div>
    );

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/dashboard/stats">
                        <ArrowLeft className="h-4 w-4"/>
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-headline">
                        {t('title')}
                    </h1>
                    <p className="text-muted-foreground">{t('subtitle')}</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <CardTitle>{t('title')}</CardTitle>
                         <div className="flex items-center gap-2">
                            <Select defaultValue="all">
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder={t('filters.period')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t('filters.allMonths')}</SelectItem>
                                    <SelectItem value="sep-2025">Septembre 2025</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button variant="outline">
                                <Download className="mr-2"/>
                                {t('exportButton')}
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>#</TableHead>
                                <TableHead>{t('table.mission')}</TableHead>
                                <TableHead>{t('table.duration')}</TableHead>
                                <TableHead>{t('table.earnings')}</TableHead>
                                <TableHead>{t('table.rating')}</TableHead>
                                <TableHead>{t('table.category')}</TableHead>
                                <TableHead className="text-right">{t('table.actions')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockMissions.map((mission, index) => (
                                <TableRow key={mission.id}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell className="font-medium">{mission.name}</TableCell>
                                    <TableCell>{mission.duration}</TableCell>
                                    <TableCell>{mission.earnings.toFixed(2)}€</TableCell>
                                    <TableCell>
                                        <StarRating rating={mission.rating} />
                                    </TableCell>
                                    <TableCell><Badge variant="outline">{mission.category}</Badge></TableCell>
                                    <TableCell className="text-right">
                                        <Button asChild variant="ghost" size="sm">
                                            <Link href={mission.conversationLink}>
                                                <MessageSquare className="mr-2"/>
                                                {t('table.viewConversation')}
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
