
'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link, useRouter } from '@/navigation';
import { useParams } from 'next/navigation';
import { ArrowLeft, Download, CheckCircle, ExternalLink } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

const mockCertificates: any = {
    'cert-pro-communicator': {
        id: 'cert-pro-communicator',
        badgeName: "Pro Communicator",
        courseName: "Communication with Clients",
        userName: "Nathan Imogo",
        date: new Date('2025-09-13'),
        certificateId: "IMU-ACD-2025-001"
    },
     'cert-starter': {
        id: 'cert-starter',
        badgeName: "Starter",
        courseName: "Basics of Task Management",
        userName: "Nathan Imogo",
        date: new Date('2025-09-10'),
        certificateId: "IMU-ACD-2025-002"
    }
}


export default function CertificatePage() {
    const t = useTranslations('CertificatePage');
    const params = useParams<{ id: string }>();
    const { user, loading } = useAuth();
    const [certificate, setCertificate] = useState<any>(null);

    useEffect(() => {
        // In a real app, you would fetch this data based on the ID
        const certData = mockCertificates[params.id as string] || Object.values(mockCertificates)[0];
        setCertificate(certData);
    }, [params.id]);
    
    if (loading || !user || !certificate) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }
    

    return (
        <div className="space-y-8 max-w-2xl mx-auto">
             <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/dashboard/academy/certificates">
                        <ArrowLeft className="h-4 w-4"/>
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-headline">
                        {t('title', { badgeName: certificate.badgeName })}
                    </h1>
                </div>
            </div>

            <Card>
                <CardHeader className="text-center bg-muted/50">
                    <CheckCircle className="h-16 w-16 mx-auto text-green-500"/>
                    <CardTitle className="text-2xl pt-2">{t('card.title')}</CardTitle>
                    <CardDescription>{t('card.issuedTo', { name: certificate.userName })}</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                    <p className="text-center text-lg">{t('card.forCompleting')} <strong>{certificate.courseName}</strong></p>
                    <Separator/>
                    <div className="text-sm text-muted-foreground space-y-1">
                        <p><strong>{t('card.date')}:</strong> {certificate.date.toLocaleDateString()}</p>
                        <p><strong>{t('card.id')}:</strong> <span className="font-mono">{certificate.certificateId}</span></p>
                    </div>
                </CardContent>
            </Card>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button size="lg">
                    <Download className="mr-2"/>
                    {t('actions.download')}
                </Button>
                 <Button size="lg" variant="outline">
                    <ExternalLink className="mr-2"/>
                    {t('actions.verify')}
                </Button>
            </div>
        </div>
    );
}
