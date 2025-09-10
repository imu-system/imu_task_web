
'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, MoreHorizontal, Trash2, Edit, RefreshCw } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Link } from '@/navigation';

const mockWebhooks = [
    { id: 'wh_1', url: 'https://api.example.com/stripe-events', events: ['payment.succeeded', 'payment.failed'], status: 'active' },
    { id: 'wh_2', url: 'https://api.example.com/user-events', events: ['user.created', 'user.deleted'], status: 'inactive' },
];

const availableEvents = [
    'user.created', 'user.updated', 'user.deleted',
    'task.created', 'task.updated', 'task.canceled',
    'offer.created', 'offer.accepted',
    'booking.created', 'booking.completed',
    'payment.succeeded', 'payment.failed', 'payment.refunded',
];

export default function AdminWebhooksPage() {
    const t = useTranslations('AdminIntegrationsPage.webhooks');

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <CardTitle>{t('title')}</CardTitle>
                            <CardDescription>{t('description')}</CardDescription>
                        </div>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button>
                                    <PlusCircle className="mr-2"/>
                                    {t('createButton')}
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[600px]">
                                <DialogHeader>
                                    <DialogTitle>{t('dialog.title')}</DialogTitle>
                                    <DialogDescription>{t('dialog.description')}</DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="url">{t('dialog.urlLabel')}</Label>
                                        <Input id="url" placeholder="https://..." />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="secret">{t('dialog.secretLabel')}</Label>
                                        <Input id="secret" placeholder={t('dialog.secretPlaceholder')} />
                                        <p className="text-xs text-muted-foreground">{t('dialog.secretDescription')}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>{t('dialog.eventsLabel')}</Label>
                                        <div className="grid grid-cols-2 gap-2 p-4 border rounded-md max-h-60 overflow-y-auto">
                                            {availableEvents.map(event => (
                                                <div key={event} className="flex items-center space-x-2">
                                                    <Checkbox id={event} />
                                                    <Label htmlFor={event} className="text-sm font-normal">{event}</Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="ghost">{t('dialog.cancel')}</Button>
                                    <Button>{t('dialog.save')}</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('table.url')}</TableHead>
                                <TableHead>{t('table.events')}</TableHead>
                                <TableHead>{t('table.status')}</TableHead>
                                <TableHead><span className="sr-only">Actions</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockWebhooks.map(webhook => (
                                <TableRow key={webhook.id}>
                                    <TableCell className="font-mono text-sm">{webhook.url}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1 max-w-md">
                                            {webhook.events.map(event => (
                                                <Badge key={event} variant="secondary">{event}</Badge>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Switch checked={webhook.status === 'active'} />
                                    </TableCell>
                                    <TableCell className="text-right">
                                         <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon"><MoreHorizontal /></Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/dashboard/admin/integrations/webhooks/edit/${webhook.id}`}>
                                                        <Edit className="mr-2"/>{t('actions.edit')}
                                                    </Link>
                                                </DropdownMenuItem>
                                                 <DropdownMenuItem>
                                                    <RefreshCw className="mr-2"/>{t('actions.resend')}
                                                 </DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive">
                                                    <Trash2 className="mr-2"/>{t('actions.delete')}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
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
