
'use client';

import { useAuth } from '@/hooks/use-auth';
import { Link, useRouter } from '@/navigation';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2, ArrowLeft, User, Mail, Calendar, Check, X, ShieldAlert, FileUp } from 'lucide-react';
import { UserRole } from '@/lib/types';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

const mockKycRequests = [
    { 
        id: 'usr_2', 
        providerName: 'Jane Doe', 
        email: 'jane.doe@example.com', 
        country: 'FR', 
        status: 'pending', 
        submittedAt: '2023-10-26T10:00:00Z', 
        documents: [
            { type: 'identity_front', url: 'https://picsum.photos/seed/id_front/600/400', data: { name: 'Jane Doe', dob: '1990-05-15', expires: '2028-05-14' } },
            { type: 'identity_back', url: 'https://picsum.photos/seed/id_back/600/400' },
            { type: 'selfie', url: 'https://picsum.photos/seed/selfie/400/400' }
        ],
        history: [
            { event: 'Documents Submitted', date: '2023-10-26T10:00:00Z', actor: 'user' },
            { event: 'Automated Checks Passed', date: '2023-10-26T10:01:00Z', actor: 'system' }
        ]
    },
    { 
        id: 'usr_5', 
        providerName: 'Ahmed Benali', 
        email: 'ahmed.benali@example.com', 
        country: 'BE', 
        status: 'pending', 
        submittedAt: '2023-10-25T14:30:00Z', 
        documents: [
            { type: 'identity_front', url: 'https://picsum.photos/seed/id_front_2/600/400' },
            { type: 'selfie', url: 'https://picsum.photos/seed/selfie_2/400/400' }
        ],
        history: [
             { event: 'Documents Submitted', date: '2023-10-25T14:30:00Z', actor: 'user' },
        ]
    },
    { 
        id: 'usr_6', 
        providerName: 'Sophie Dubois', 
        email: 'sophie.dubois@example.com', 
        country: 'FR', 
        status: 'rejected', 
        submittedAt: '2023-10-24T09:00:00Z', 
        documents: [
            { type: 'identity_front', url: 'https://picsum.photos/seed/id_front_3/600/400' },
            { type: 'selfie', url: 'https://picsum.photos/seed/selfie_3/400/400' }
        ],
        history: [
             { event: 'Documents Submitted', date: '2023-10-24T09:00:00Z', actor: 'user' },
             { event: 'Rejected: Blurry photo', date: '2023-10-24T11:00:00Z', actor: 'admin' },
        ]
    },
];

const rejectionReasons = [
    { id: 'blurry', labelKey: 'reasons.blurry' },
    { id: 'expired', labelKey: 'reasons.expired' },
    { id: 'not_matching', labelKey: 'reasons.notMatching' },
    { id: 'other', labelKey: 'reasons.other' },
];

const resubmissionDocuments = [
    { id: 'identity_front', labelKey: 'documents.identity_front' },
    { id: 'identity_back', labelKey: 'documents.identity_back' },
    { id: 'selfie', labelKey: 'documents.selfie' },
];

export default function AdminKycDetailPage() {
    const { user: adminUser, loading: authLoading } = useAuth();
    const router = useRouter();
    const params = useParams<{ providerId: string }>();
    const providerId = params.providerId;
    const t = useTranslations('AdminKycDetailPage');
    const { toast } = useToast();

    const [provider, setProvider] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!authLoading && (!adminUser || !adminUser.roles?.includes(UserRole.admin))) {
            router.push('/dashboard');
        }
    }, [adminUser, authLoading, router]);

    useEffect(() => {
        setLoading(true);
        const fetchedProvider = mockKycRequests.find(p => p.id === providerId);
        if (fetchedProvider) {
            setProvider(fetchedProvider);
        }
        setLoading(false);
    }, [providerId]);
    
    const handleApprove = async () => {
        setIsSubmitting(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast({
            title: t('toast.approveSuccessTitle'),
            description: t('toast.approveSuccessDescription', { name: provider.providerName }),
        });
        router.push('/dashboard/admin/kyc');
        setIsSubmitting(false);
    }
    
    const handleReject = async () => {
        setIsSubmitting(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast({
            variant: 'destructive',
            title: t('toast.rejectSuccessTitle'),
            description: t('toast.rejectSuccessDescription', { name: provider.providerName }),
        });
        router.push('/dashboard/admin/kyc');
        setIsSubmitting(false);
    }

    const handleRequestResubmission = async () => {
        setIsSubmitting(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast({
            title: t('toast.resubmissionSuccessTitle'),
            description: t('toast.resubmissionSuccessDescription', { name: provider.providerName }),
        });
        router.push('/dashboard/admin/kyc');
        setIsSubmitting(false);
    }


    if (authLoading || loading || !adminUser || !adminUser.roles?.includes(UserRole.admin)) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }
    
    if (!provider) {
        return (
             <div className="text-center">
                <h1 className="text-xl">{t('notFound')}</h1>
                <Button asChild variant="link">
                    <Link href="/dashboard/admin/kyc">{t('backToList')}</Link>
                </Button>
            </div>
        )
    }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
                <Link href="/dashboard/admin/kyc">
                    <ArrowLeft className="h-4 w-4"/>
                    <span className="sr-only">{t('backToList')}</span>
                </Link>
            </Button>
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">
                    {t('title')}
                </h1>
                <p className="text-muted-foreground">
                    {t('subtitle', { providerName: provider.providerName })}
                </p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                {provider.documents.map((doc: any, index: number) => doc.type !== 'selfie' && (
                    <Card key={index}>
                        <CardHeader>
                            <CardTitle>{t(`documents.${doc.type}`)}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Image src={doc.url} alt={doc.type} width={600} height={400} className="rounded-lg border" data-ai-hint="ID card"/>
                            {doc.data && (
                                <>
                                <Separator className="my-4"/>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <p><strong>{t('data.name')}:</strong> {doc.data.name}</p>
                                    <p><strong>{t('data.dob')}:</strong> {doc.data.dob}</p>
                                    <p><strong>{t('data.expires')}:</strong> {doc.data.expires}</p>
                                </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            <aside className="space-y-8">
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>{t('cards.actions.title')}</CardTitle>
                        {provider.status === 'pending' && <Badge variant="secondary">{t('status.pending')}</Badge>}
                         {provider.status === 'rejected' && <Badge variant="destructive">{t('status.rejected')}</Badge>}
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-2">
                        <Button onClick={handleApprove} disabled={isSubmitting || provider.status !== 'pending'}>
                            {isSubmitting ? <Loader2 className="animate-spin mr-2"/> : <Check className="mr-2"/>}
                            {t('cards.actions.approve')}
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" disabled={isSubmitting || provider.status !== 'pending'}>
                                    <X className="mr-2"/> {t('cards.actions.reject')}
                                </Button>
                            </AlertDialogTrigger>
                             <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>{t('cards.actions.rejectDialog.title')}</AlertDialogTitle>
                                    <AlertDialogDescription>{t('cards.actions.rejectDialog.description')}</AlertDialogDescription>
                                </AlertDialogHeader>
                                <RadioGroup defaultValue="blurry" className="py-4 space-y-2">
                                    {rejectionReasons.map(reason => (
                                        <div key={reason.id} className="flex items-center space-x-2">
                                            <RadioGroupItem value={reason.id} id={`reject-${reason.id}`} />
                                            <Label htmlFor={`reject-${reason.id}`}>{t(reason.labelKey as any)}</Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>{t('cards.actions.rejectDialog.cancel')}</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleReject} disabled={isSubmitting}>
                                        {isSubmitting ? <Loader2 className="animate-spin mr-2"/> : null}
                                        {t('cards.actions.rejectDialog.confirm')}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="outline" disabled={isSubmitting || provider.status !== 'pending'}>
                                    <FileUp className="mr-2"/> {t('cards.actions.requestResubmission')}
                                </Button>
                            </AlertDialogTrigger>
                             <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>{t('cards.actions.resubmissionDialog.title')}</AlertDialogTitle>
                                    <AlertDialogDescription>{t('cards.actions.resubmissionDialog.description')}</AlertDialogDescription>
                                </AlertDialogHeader>
                                <div className="py-4 space-y-4">
                                    <div className="space-y-2">
                                        <Label>{t('cards.actions.resubmissionDialog.checklistLabel')}</Label>
                                        {resubmissionDocuments.map(doc => (
                                            <div key={doc.id} className="flex items-center space-x-2">
                                                <Checkbox id={`resubmit-${doc.id}`} />
                                                <Label htmlFor={`resubmit-${doc.id}`}>{t(doc.labelKey as any)}</Label>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="resubmission-message">{t('cards.actions.resubmissionDialog.messageLabel')}</Label>
                                        <Textarea id="resubmission-message" placeholder={t('cards.actions.resubmissionDialog.messagePlaceholder')} />
                                    </div>
                                </div>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>{t('cards.actions.resubmissionDialog.cancel')}</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleRequestResubmission} disabled={isSubmitting}>
                                        {isSubmitting ? <Loader2 className="animate-spin mr-2"/> : null}
                                        {t('cards.actions.resubmissionDialog.confirm')}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </CardContent>
                 </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle>{t('cards.provider.title')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16">
                                <AvatarImage src={provider.documents.find((d:any) => d.type === 'selfie')?.url} />
                                <AvatarFallback>{provider.providerName.charAt(0)}</AvatarFallback>
                            </Avatar>
                             <div>
                                <p className="font-bold text-lg">{provider.providerName}</p>
                                <p className="text-sm text-muted-foreground">{provider.email}</p>
                            </div>
                        </div>
                        <Separator/>
                         <div className="text-sm space-y-2">
                            <p><strong>{t('cards.provider.country')}:</strong> {provider.country}</p>
                            <p><strong>{t('cards.provider.memberSince')}:</strong> 2023-02-20</p>
                            <p><strong>{t('cards.provider.stripeId')}:</strong> cus_xxxx</p>
                        </div>
                    </CardContent>
                 </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle>{t('cards.history.title')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-4 text-sm">
                            {provider.history.map((entry: any, index: number) => (
                                <li key={index} className="flex items-start gap-3">
                                    <div className="flex-shrink-0 mt-1">
                                        <div className={`h-4 w-4 rounded-full ${entry.actor === 'system' ? 'bg-blue-500' : 'bg-primary'}`}></div>
                                    </div>
                                    <div>
                                        <p className="font-medium">{entry.event}</p>
                                        <p className="text-xs text-muted-foreground">{new Date(entry.date).toLocaleString()}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                 </Card>

                 <Button variant="outline" className="w-full">
                    <ShieldAlert className="mr-2"/>
                    {t('cards.actions.flag')}
                </Button>
            </aside>
        </div>
    </div>
  );
}
