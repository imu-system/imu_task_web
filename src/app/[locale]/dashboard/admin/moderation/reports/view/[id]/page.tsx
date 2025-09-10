
'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, User, Shield, AlertTriangle, EyeOff, ShieldOff, MessageSquare } from 'lucide-react';
import { Link, useRouter } from '@/navigation';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
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
} from "@/components/ui/alert-dialog";
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const mockReports: any = {
    'rep1': { 
        id: 'rep1', 
        type: 'Utilisateur', 
        content: 'John Smith', 
        contentType: 'profile',
        reporter: { id: 'user1', name: 'Anne-Marie Dupont' },
        reportedUser: { id: 'usr_3', name: 'John Smith', avatarUrl: 'https://i.pravatar.cc/150?u=usr_3' },
        reason: 'Contenu inapproprié dans la bio', 
        contentPreview: "Bio: Je suis le meilleur, tous les autres sont nuls. Engagez-moi ou vous le regretterez. #arnaque",
        date: '2024-10-26T10:00:00Z', 
        link: '/dashboard/admin/users/usr_3',
        status: 'open',
    },
     'rep2': { 
        id: 'rep2', 
        type: 'Mission', 
        content: 'Nettoyage de printemps extrême',
        contentType: 'task',
        reporter: { id: 'user2', name: 'Lucas Bernard' },
        reportedUser: { id: 'user4', name: 'Marc Dubois', avatarUrl: 'https://i.pravatar.cc/150?u=user4' },
        reason: 'Mission dangereuse/irréalisable', 
        contentPreview: "Description: Je cherche quelqu'un pour nettoyer mon grenier qui n'a pas été ouvert depuis 50 ans. Présence possible d'animaux sauvages et de structures instables. Le port d'un équipement de protection est obligatoire et non fourni.",
        date: '2024-10-25T14:30:00Z', 
        link: '/dashboard/admin/tasks/task_xyz',
        status: 'open',
    },
};

export default function AdminViewReportPage() {
    const t = useTranslations('AdminModerationPage.viewReport');
    const params = useParams<{ id: string }>();
    const reportId = params.id;
    const { toast } = useToast();
    const router = useRouter();

    const [report, setReport] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const data = mockReports[reportId];
        if (data) {
            setReport(data);
        }
        setLoading(false);
    }, [reportId]);
    
    const handleAction = async (action: string) => {
        console.log(`Performing action: ${action} on report ${reportId}`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast({
            title: t('toast.successTitle'),
            description: t('toast.successDescription', { action }),
        });
        router.push('/dashboard/admin/moderation/reports');
    }

    if (loading) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>;
    }

    if (!report) {
        return (
            <div className="text-center">
                <h1 className="text-xl">{t('notFound')}</h1>
                <Button asChild variant="link">
                    <Link href="/dashboard/admin/moderation/reports">{t('backToList')}</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/dashboard/admin/moderation/reports">
                        <ArrowLeft className="h-4 w-4"/>
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-headline">
                        {t('title')}
                    </h1>
                     <p className="text-muted-foreground font-mono text-xs">
                        ID: {report.id}
                    </p>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 space-y-8">
                     <Card>
                        <CardHeader>
                            <CardTitle>{t('cards.content.title')}</CardTitle>
                            <CardDescription>
                                {t('cards.content.description', { type: report.type.toLowerCase(), content: report.content })}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                             <blockquote className="border-l-2 pl-6 italic bg-muted p-4 rounded-r-md">
                                {report.contentPreview}
                            </blockquote>
                            <Button asChild variant="link" className="mt-2 px-0">
                                <Link href={report.link}>{t('cards.content.viewFull')}</Link>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>{t('cards.report.title')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <p><strong>{t('cards.report.reason')}:</strong> {report.reason}</p>
                            <p><strong>{t('cards.report.reporter')}:</strong> <Link href={`/dashboard/admin/users/${report.reporter.id}`} className="text-primary hover:underline">{report.reporter.name}</Link></p>
                            <p><strong>{t('cards.report.date')}:</strong> {new Date(report.date).toLocaleString()}</p>
                        </CardContent>
                    </Card>
                </div>

                 <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('cards.reportedUser.title')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <div className="flex items-center gap-3">
                                <Avatar className="h-12 w-12">
                                    <AvatarImage src={report.reportedUser.avatarUrl} />
                                    <AvatarFallback>{report.reportedUser.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold">{report.reportedUser.name}</p>
                                    <Button asChild variant="link" className="p-0 h-auto">
                                        <Link href={`/dashboard/admin/users/${report.reportedUser.id}`}>{t('cards.reportedUser.viewProfile')}</Link>
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>{t('cards.actions.title')}</CardTitle>
                            <CardDescription>{t('cards.actions.description')}</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 gap-2">
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="outline"><EyeOff className="mr-2"/>{t('cards.actions.hideContent')}</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>{t('cards.actions.dialogs.hide.title')}</AlertDialogTitle>
                                    <AlertDialogDescription>{t('cards.actions.dialogs.hide.description')}</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>{t('cards.actions.dialogs.cancel')}</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleAction('content hidden')}>{t('cards.actions.dialogs.hide.confirm')}</AlertDialogAction>
                                </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="outline" className="text-amber-600 hover:text-amber-700">
                                        <AlertTriangle className="mr-2"/>{t('cards.actions.warnUser')}
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>{t('cards.actions.dialogs.warn.title')}</AlertDialogTitle>
                                        <AlertDialogDescription>{t('cards.actions.dialogs.warn.description')}</AlertDialogDescription>
                                    </AlertDialogHeader>
                                     <div className="space-y-2 py-2">
                                        <Label htmlFor="warning-message">{t('cards.actions.dialogs.warn.messageLabel')}</Label>
                                        <Textarea id="warning-message" placeholder={t('cards.actions.dialogs.warn.messagePlaceholder')} />
                                    </div>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>{t('cards.actions.dialogs.cancel')}</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleAction('user warned')}>{t('cards.actions.dialogs.warn.confirm')}</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive"><Shield className="mr-2"/>{t('cards.actions.suspendUser')}</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>{t('cards.actions.dialogs.suspend.title')}</AlertDialogTitle>
                                        <AlertDialogDescription>{t('cards.actions.dialogs.suspend.description')}</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>{t('cards.actions.dialogs.cancel')}</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleAction('user suspended')}>{t('cards.actions.dialogs.suspend.confirm')}</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                            <Separator className="my-2" />
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost"><ShieldOff className="mr-2"/>{t('cards.actions.dismiss')}</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>{t('cards.actions.dialogs.dismiss.title')}</AlertDialogTitle>
                                        <AlertDialogDescription>{t('cards.actions.dialogs.dismiss.description')}</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>{t('cards.actions.dialogs.cancel')}</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleAction('report dismissed')}>{t('cards.actions.dialogs.dismiss.confirm')}</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
