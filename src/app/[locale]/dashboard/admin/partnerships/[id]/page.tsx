
'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Link, useParams } from '@/navigation';
import { ArrowLeft, Edit, Trash2, PlusCircle, Download, Users, BarChart, Clock, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const mockCampusData = {
    id: 'p1',
    university: 'Univ. de Metz',
    campus: 'Saulcy',
    contact: 'Dr. Dupont',
    status: 'active',
    createdAt: '01/03/2025',
    expiresAt: '01/03/2026',
    promoCodes: [
        { code: 'IMUSAULCY25', description: 'Valide jusqu’au 31/12/2025' },
        { code: 'IMUSAULCYFREE', description: 'Missions solidaires' },
    ],
    audience: {
        students: 325,
        hours: 2540,
    }
};

const ectsValidationData = {
    studentName: "Marie Lefevre",
    studentId: "#ST12345",
    completedMissions: 12,
    requestedHours: 24,
    status: "pending"
};

export default function PartnershipDetailPage() {
    const params = useParams();
    const t = useTranslations('PartnershipsPage.detail');

    // In a real app, you'd fetch data based on params.id
    const campus = mockCampusData;

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/dashboard/admin/partnerships">
                        <ArrowLeft className="h-4 w-4"/>
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight font-headline">
                        {campus.university} - {campus.campus}
                    </h1>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('info.title')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                <div><strong>{t('info.campus')}:</strong> {campus.campus}</div>
                                <div><strong>{t('info.contact')}:</strong> {campus.contact}</div>
                                <div><strong>{t('info.createdAt')}:</strong> {campus.createdAt}</div>
                                <div><strong>{t('info.expiresAt')}:</strong> {campus.expiresAt}</div>
                                <div>
                                    <strong>{t('info.status')}:</strong>
                                    <Badge variant="default" className="ml-2">✅ {t('status.active')}</Badge>
                                </div>
                            </div>
                            <Separator />
                            <div className="flex gap-2">
                                <Button variant="outline"><Edit className="mr-2"/>{t('info.edit')}</Button>
                                <Button variant="destructive-outline"><Trash2 className="mr-2"/>{t('info.terminate')}</Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>{t('stats.title')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                                <BarChart className="h-16 w-16 text-muted-foreground"/>
                                <p className="text-muted-foreground ml-2">{t('stats.graphPlaceholder')}</p>
                            </div>
                            <Button variant="outline"><Download className="mr-2"/>{t('stats.exportPdf')}</Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                             <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5"/>
                                {t('ects.title')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <div className="space-y-1 text-sm">
                                <p><strong>{t('ects.student')}:</strong> {ectsValidationData.studentName} ({ectsValidationData.studentId})</p>
                                <p><strong>{t('ects.missions')}:</strong> {ectsValidationData.completedMissions}</p>
                                <p><strong>{t('ects.hours')}:</strong> {ectsValidationData.requestedHours}h</p>
                                <div className="flex items-center gap-2">
                                     <strong>{t('info.status')}:</strong>
                                    <Badge variant="secondary">{t(`ects.status.${ectsValidationData.status}`)}</Badge>
                                </div>
                            </div>
                            <Separator/>
                            <div className="flex flex-wrap gap-2">
                                <Button>{t('ects.validate')}</Button>
                                <Button variant="destructive-outline">{t('ects.reject')}</Button>
                                <Button variant="outline"><Download className="mr-2"/>{t('ects.export')}</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('promo.title')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {campus.promoCodes.map(promo => (
                                <div key={promo.code}>
                                    <p className="font-mono text-sm bg-muted p-2 rounded-md inline-block">{promo.code}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{promo.description}</p>
                                </div>
                            ))}
                            <Button variant="outline" size="sm" className="w-full">
                                <PlusCircle className="mr-2"/>
                                {t('promo.generate')}
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>{t('audience.title')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-primary"/>
                                <span className="font-semibold">{campus.audience.students} {t('audience.students')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="h-5 w-5 text-primary"/>
                                <span className="font-semibold">{campus.audience.hours} {t('audience.hours')}</span>
                            </div>
                             <Button variant="outline" size="sm" className="w-full">
                                <Download className="mr-2"/>
                                {t('audience.exportCsv')}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
