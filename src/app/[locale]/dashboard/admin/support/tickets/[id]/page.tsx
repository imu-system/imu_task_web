
'use client';

import { useAuth } from '@/hooks/use-auth';
import { Link, useRouter } from '@/navigation';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2, ArrowLeft, User, Calendar, MessageSquare, Send, Paperclip, UserCog, Tag, Shield } from 'lucide-react';
import { UserRole } from '@/lib/types';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const mockTicket = { 
    id: 'TKT-001', 
    subject: "Problème de paiement pour la mission #task3", 
    user: { id: 'usr_1', name: "Anne-Marie Dupont", avatar: 'https://i.pravatar.cc/150?u=usr_1' }, 
    status: "Open", 
    priority: "High", 
    assignedTo: "Emma Moreau", 
    createdAt: '2024-10-26T11:45:00Z',
    bookingId: 'booking1',
    messages: [
        { from: 'user', content: "Bonjour, le paiement pour ma mission semble avoir échoué mais mon compte a été débité. Pouvez-vous vérifier ? Merci.", timestamp: '2024-10-26T11:45:00Z' }
    ]
};

export default function AdminTicketDetailPage() {
    const { user: adminUser, loading: authLoading } = useAuth();
    const router = useRouter();
    const params = useParams<{ id: string }>();
    const ticketId = params.id;
    const t = useTranslations('AdminSupportPage.ticketDetail');
    
    const [ticket, setTicket] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && (!adminUser || !adminUser.roles?.includes(UserRole.admin))) {
            router.push('/dashboard');
        }
    }, [adminUser, authLoading, router]);

    useEffect(() => {
        setLoading(true);
        // In a real app, you would fetch the ticket details
        setTicket(mockTicket);
        setLoading(false);
    }, [ticketId]);

    if (authLoading || loading || !adminUser || !adminUser.roles?.includes(UserRole.admin)) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }
    
    if (!ticket) {
        return (
            <div className="text-center">
                <h1 className="text-xl">{t('notFound')}</h1>
                 <Button asChild variant="link"><Link href="/dashboard/admin/support/tickets">{t('backToList')}</Link></Button>
            </div>
        )
    }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
        <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
                <Link href="/dashboard/admin/support/tickets">
                    <ArrowLeft className="h-4 w-4"/>
                    <span className="sr-only">{t('backToList')}</span>
                </Link>
            </Button>
            <div>
                <h1 className="text-2xl font-bold tracking-tight font-headline">
                    {ticket.subject}
                </h1>
                <p className="text-muted-foreground font-mono text-xs">
                    ID: {ticket.id}
                </p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>{t('cards.conversation.title')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {ticket.messages.map((msg: any, index: number) => (
                            <div key={index} className="flex gap-3">
                                <Avatar>
                                    <AvatarImage src={msg.from === 'user' ? ticket.user.avatar : undefined} />
                                    <AvatarFallback>{msg.from === 'user' ? ticket.user.name.charAt(0) : 'A'}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <p className="font-semibold">{msg.from === 'user' ? ticket.user.name : "Support"}</p>
                                        <p className="text-xs text-muted-foreground">{new Date(msg.timestamp).toLocaleString()}</p>
                                    </div>
                                    <p className="p-3 bg-muted rounded-md mt-1">{msg.content}</p>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle>{t('cards.response.title')}</CardTitle>
                        <CardDescription>{t('cards.response.description')}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Select>
                            <SelectTrigger>
                                <SelectValue placeholder={t('cards.response.cannedPlaceholder')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="salutation">{t('cards.response.canned.greeting')}</SelectItem>
                                <SelectItem value="kyc_rejet">{t('cards.response.canned.kycRejection')}</SelectItem>
                                <SelectItem value="remboursement_ok">{t('cards.response.canned.refundOk')}</SelectItem>
                            </SelectContent>
                        </Select>
                        <Textarea placeholder={t('cards.response.textAreaPlaceholder')} rows={8}/>
                        <div className="flex justify-between items-center">
                            <Button variant="outline"><Paperclip className="mr-2"/>{t('cards.response.attachFile')}</Button>
                            <Button><Send className="mr-2"/>{t('cards.response.send')}</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>{t('cards.details.title')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm">
                         <div>
                            <p className="font-semibold">{t('cards.details.status')}</p>
                            <Select defaultValue={ticket.status}>
                                <SelectTrigger><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Open">Open</SelectItem>
                                    <SelectItem value="In Progress">In Progress</SelectItem>
                                    <SelectItem value="Closed">Closed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                         <div>
                            <p className="font-semibold">{t('cards.details.priority')}</p>
                            <Select defaultValue={ticket.priority}>
                                <SelectTrigger><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Low">Low</SelectItem>
                                    <SelectItem value="Medium">Medium</SelectItem>
                                    <SelectItem value="High">High</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                         <div>
                            <p className="font-semibold">{t('cards.details.agent')}</p>
                            <Select defaultValue="Emma Moreau">
                                <SelectTrigger><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Unassigned">Unassigned</SelectItem>
                                    <SelectItem value="Emma Moreau">Emma Moreau</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                         <div>
                            <p className="font-semibold">{t('cards.details.tags')}</p>
                            <Input placeholder={t('cards.details.tagsPlaceholder')} />
                        </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>{t('cards.context.title')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <Button variant="link" asChild className="p-0 h-auto">
                            <Link href={`/dashboard/admin/users/${ticket.user.id}`}>{t('cards.context.viewUser')}</Link>
                        </Button>
                        <Button variant="link" asChild className="p-0 h-auto">
                            <Link href={`/dashboard/admin/bookings/${ticket.bookingId}`}>{t('cards.context.viewBooking')}</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
}

