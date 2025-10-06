
'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal, PlusCircle, Trash2, Edit } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Link } from '@/navigation';

const mockCannedResponses = [
    { id: 'canned1', shortcut: 'salutation', content: "Bonjour {{user.name}},\n\nMerci d'avoir contacté le support ImuTask.\n\nCordialement," },
    { id: 'canned2', shortcut: 'kyc_rejet', content: "Votre vérification d'identité a été rejetée car le document fourni était illisible. Veuillez soumettre à nouveau une photo claire de votre pièce d'identité." },
    { id: 'canned3', shortcut: 'remboursement_ok', content: "Nous avons bien procédé au remboursement de votre mission. Les fonds devraient apparaître sur votre compte d'ici 5 à 10 jours ouvrés." },
];


export default function AdminCannedResponsesPage() {
    const t = useTranslations('AdminSupportPage.canned');

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
                                <Button><PlusCircle className="mr-2"/>{t('actions.create')}</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>{t('dialog.createTitle')}</DialogTitle>
                                    <DialogDescription>{t('dialog.createDescription')}</DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="shortcut">{t('dialog.shortcutLabel')}</Label>
                                        <Input id="shortcut" placeholder={t('dialog.shortcutPlaceholder')} />
                                    </div>
                                     <div className="space-y-2">
                                        <Label htmlFor="content">{t('dialog.contentLabel')}</Label>
                                        <Textarea id="content" placeholder={t('dialog.contentPlaceholder')} rows={5} />
                                         <p className="text-xs text-muted-foreground">{t('dialog.variablesInfo')}</p>
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
                                <TableHead>{t('table.shortcut')}</TableHead>
                                <TableHead>{t('table.content')}</TableHead>
                                <TableHead><span className="sr-only">{t('table.actions')}</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockCannedResponses.map(response => (
                                <TableRow key={response.id}>
                                    <TableCell><code className="font-mono bg-muted p-1 rounded-sm">{response.shortcut}</code></TableCell>
                                    <TableCell className="max-w-md">
                                        <p className="truncate text-muted-foreground">{response.content}</p>
                                    </TableCell>
                                    <TableCell className="text-right">
                                         <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon"><MoreHorizontal /></Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/dashboard/admin/support/canned/edit/${response.id}`}>
                                                        <Edit className="mr-2 h-4 w-4"/>
                                                        {t('actions.edit')}
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive">
                                                    <Trash2 className="mr-2"/>
                                                    {t('actions.delete')}
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
