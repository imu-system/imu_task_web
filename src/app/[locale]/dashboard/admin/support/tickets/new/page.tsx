
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, Link } from '@/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Loader2, ArrowLeft } from 'lucide-react';
import { UserRole } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const mockAgents = [
    { id: 'agent1', name: 'Emma Moreau' },
    { id: 'agent2', name: 'Admin' },
];

export default function AdminNewTicketPage() {
    const { user: adminUser, loading: authLoading } = useAuth();
    const router = useRouter();
    const t = useTranslations('AdminSupportPage.newTicket');
    const { toast } = useToast();
    
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!authLoading && (!adminUser || !adminUser.roles?.includes(UserRole.admin))) {
            router.push('/dashboard');
        }
    }, [adminUser, authLoading, router]);

    const handleSave = async () => {
        setIsSaving(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast({
            title: t('toast.createSuccessTitle'),
            description: t('toast.createSuccessDescription'),
        });
        router.push('/dashboard/admin/support/tickets');
        setIsSaving(false);
    };

    if (authLoading || !adminUser || !adminUser.roles?.includes(UserRole.admin)) {
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
                    <Link href="/dashboard/admin/support/tickets">
                        <ArrowLeft className="h-4 w-4"/>
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-headline">
                        {t('title')}
                    </h1>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t('card.title')}</CardTitle>
                    <CardDescription>{t('card.description')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                     <div className="space-y-2">
                        <Label htmlFor="user">{t('card.userLabel')}</Label>
                        <Input id="user" placeholder={t('card.userPlaceholder')} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="subject">{t('card.subjectLabel')}</Label>
                        <Input id="subject" placeholder={t('card.subjectPlaceholder')} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="message">{t('card.messageLabel')}</Label>
                        <Textarea id="message" placeholder={t('card.messagePlaceholder')} rows={10} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="priority">{t('card.priorityLabel')}</Label>
                             <Select defaultValue="Medium">
                                <SelectTrigger><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Low">Low</SelectItem>
                                    <SelectItem value="Medium">Medium</SelectItem>
                                    <SelectItem value="High">High</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="agent">{t('card.agentLabel')}</Label>
                            <Select defaultValue="Unassigned">
                                <SelectTrigger><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Unassigned">Unassigned</SelectItem>
                                    {mockAgents.map(agent => (
                                        <SelectItem key={agent.id} value={agent.name}>{agent.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
                <Button variant="ghost" asChild><Link href="/dashboard/admin/support/tickets">{t('card.cancel')}</Link></Button>
                <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                    {t('card.create')}
                </Button>
            </div>
        </div>
    );
}
