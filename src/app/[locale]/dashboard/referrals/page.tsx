
'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Gift, Copy, Share2, Mail, Users, DollarSign, School, CheckCircle, Clock, MessageSquare, Twitter, UserPlus, Award } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link } from '@/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="18px" height="18px" {...props}>
        <path fill="#fff" d="M4.868,43.303l2.694-9.835C5.9,30.59,5.026,27.324,5.026,24.01c0-7.854,6.398-14.252,14.252-14.252 c3.927,0,7.613,1.527,10.39,4.304c2.777,2.777,4.304,6.463,4.304,10.39c0,7.854-6.398,14.252-14.252,14.252 c-3.425,0-6.6,-1.21-9.111-3.24L4.868,43.303z"/>
        <path fill="#fff" d="M4.868,43.303l2.694-9.835C5.9,30.59,5.026,27.324,5.026,24.01c0-7.854,6.398-14.252,14.252-14.252 c3.927,0,7.613,1.527,10.39,4.304c2.777,2.777,4.304,6.463,4.304,10.39c0,7.854-6.398,14.252-14.252,14.252 c-3.425,0-6.6,-1.21-9.111-3.24L4.868,43.303z"/>
        <path fill="#40c351" d="M19.278,34.559c-3.131,0-6.079-1.02-8.55-2.825L4,34.998l3.254-6.573c-2.005-2.6-3.226-5.83-3.226-9.395 c0-7.854,6.398-14.252,14.252-14.252c3.927,0,7.613,1.527,10.39,4.304c2.777,2.777,4.304,6.463,4.304,10.39 c0,7.854-6.398,14.252-14.252,14.252C22.695,34.559,20.963,34.559,19.278,34.559z"/>
        <path fill="#fff" d="M26.393,20.333c-0.344-0.959-2.203-0.959-2.203-0.959c-0.928,0-1.88,0.222-2.67,0.735 c-0.881,0.569-1.272,1.21-1.57,1.821c-0.318,0.66-0.66,1.401-0.66,1.401s-0.23,0.735-0.23,1.285c0,0.549,0.549,1.155,0.549,1.155 c0.134,0.166,0.268,0.332,0.402,0.498c0.473,0.569,0.947,1.138,1.42,1.707s0.982,1.104,1.551,1.603 c1.138,0.995,2.44,1.5,3.953,1.961c1.512,0.462,3.131,0.332,3.131,0.332s0.831-0.083,1.272-0.5c0.44-0.418,1.01-1.335,1.01-1.335 s0.418-0.834,0.23-1.467c-0.188-0.632-0.84-0.749-0.84-0.749s-1.229-0.498-2.67-1.168c-1.44-0.669-1.44-0.669-1.44-0.669 s-0.549-0.25-0.84-0.084c-0.291,0.166-0.622,0.582-0.622,0.582s-0.211,0.249-0.45,0.332c-0.239,0.084-0.478,0.025-0.687-0.059 c-0.899-0.349-1.896-0.831-2.756-1.597c-1.385-1.218-2.316-2.646-2.316-2.646s-0.25-0.418,0-0.75 c0.25-0.332,0.5-0.418,0.5-0.418s0.188-0.111,0.376-0.056c0.188,0.056,0.376,0.222,0.376,0.222s0.273,0.316,0.449,0.499 c0.176,0.182,0.352,0.222,0.562,0.138c0.211-0.083,0.5-0.25,0.5-0.25s0.418-0.332,0.527-0.527c0.11-0.194,0.141-0.402,0.04-0.611 C26.793,20.735,26.438,20.417,26.393,20.333z"/>
    </svg>
)

const mockReferrals = [
    { name: 'Sarah T.', date: '12/09/2025', status: 'active', gain: 5 },
    { name: 'Alex M.', date: '10/09/2025', status: 'pending', gain: 0 },
    { name: 'Julien R.', date: '05/09/2025', status: 'active', gain: 5 },
];

const howItWorksSteps = [
    { icon: <Share2 className="h-8 w-8" />, titleKey: 'howItWorks.step1.title', descriptionKey: 'howItWorks.step1.description' },
    { icon: <UserPlus className="h-8 w-8" />, titleKey: 'howItWorks.step2.title', descriptionKey: 'howItWorks.step2.description' },
    { icon: <Award className="h-8 w-8" />, titleKey: 'howItWorks.step3.title', descriptionKey: 'howItWorks.step3.description' },
]

export default function ReferralsPage() {
    const { user, loading } = useAuth();
    const t = useTranslations('ReferralsPage');
    const { toast } = useToast();

    const handleCopy = (textToCopy: string) => {
        navigator.clipboard.writeText(textToCopy);
        toast({
            title: t('codeCard.copied'),
        });
    };

    if (loading || !user) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }
    
    const referralCode = `IMU-${user.profile?.displayName?.toUpperCase()}-2025`;
    const referralLink = `https://imutask.com/r/${referralCode}`;


    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
                    <Gift className="h-8 w-8 text-primary"/>
                    {t('title')}
                </h1>
                <p className="text-muted-foreground">
                    {t('subtitle')}
                </p>
            </div>

            <Card className="bg-primary/5 border-primary/20 text-center">
                <CardHeader>
                    <CardTitle className="text-2xl">{t('callToAction.title')}</CardTitle>
                    <CardDescription className="text-base">{t('callToAction.description')}</CardDescription>
                </CardHeader>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>{t('codeCard.title')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 bg-muted rounded-lg font-mono text-center text-2xl tracking-widest">
                            {referralCode}
                        </div>
                        <Button className="w-full" variant="outline" onClick={() => handleCopy(referralCode)}>
                            <Copy className="mr-2"/>
                            {t('codeCard.copy')}
                        </Button>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>{t('linkCard.title')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Input value={referralLink} readOnly />
                         <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <Button variant="outline"><WhatsAppIcon className="mr-2"/> WhatsApp</Button>
                            <Button variant="outline"><MessageSquare className="mr-2"/> {t('invite.smsButton')}</Button>
                            <Button variant="outline"><Twitter className="mr-2"/> Twitter</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t('howItWorks.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row justify-around items-start text-center gap-8">
                        {howItWorksSteps.map(step => (
                            <div key={step.titleKey} className="flex flex-col items-center gap-2 flex-1">
                                <div className="p-4 bg-primary/10 text-primary rounded-full">
                                    {step.icon}
                                </div>
                                <h3 className="font-semibold">{t(step.titleKey as any)}</h3>
                                <p className="text-sm text-muted-foreground">{t(step.descriptionKey as any)}</p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
            
             <Card>
                <CardHeader>
                    <CardTitle>{t('stats.title')}</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-muted rounded-lg flex items-center gap-4">
                        <Users className="h-8 w-8 text-primary"/>
                        <div>
                            <p className="text-sm text-muted-foreground">{t('stats.referred')}</p>
                            <p className="text-2xl font-bold">12</p>
                        </div>
                    </div>
                    <div className="p-4 bg-muted rounded-lg flex items-center gap-4">
                        <DollarSign className="h-8 w-8 text-primary"/>
                        <div>
                            <p className="text-sm text-muted-foreground">{t('stats.rewards')}</p>
                            <p className="text-2xl font-bold">65,00 €</p>
                        </div>
                    </div>
                     <div className="p-4 bg-muted rounded-lg flex items-center gap-4">
                        <DollarSign className="h-8 w-8 text-yellow-500"/>
                        <div>
                            <p className="text-sm text-muted-foreground">{t('stats.pendingRewards')}</p>
                            <p className="text-2xl font-bold">20,00 €</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle>{t('history.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('history.name')}</TableHead>
                                <TableHead>{t('history.date')}</TableHead>
                                <TableHead>{t('history.status')}</TableHead>
                                <TableHead className="text-right">{t('history.gain')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockReferrals.map((referral, index) => (
                                <TableRow key={index}>
                                    <TableCell className="font-medium">{referral.name}</TableCell>
                                    <TableCell>{referral.date}</TableCell>
                                    <TableCell>
                                        <Badge variant={referral.status === 'active' ? 'default' : 'secondary'} className="flex items-center w-fit gap-1">
                                            {referral.status === 'active' ? <CheckCircle className="h-3 w-3"/> : <Clock className="h-3 w-3"/>}
                                            {t(`history.statuses.${referral.status}`)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">{referral.gain > 0 ? `${referral.gain.toFixed(2)} €` : '-'}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <div className="flex justify-center gap-4">
                <Button variant="outline" asChild>
                    <Link href="/dashboard/referrals/history">{t('actions.history')}</Link>
                </Button>
                <Button asChild>
                    <Link href="/dashboard/referrals/rewards">{t('actions.rewards')}</Link>
                </Button>
            </div>
        </div>
    );
}
