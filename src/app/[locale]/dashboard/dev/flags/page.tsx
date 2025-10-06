
'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Search, PlusCircle } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Link } from '@/navigation';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const mockFlags = [
    { id: 'flag1', key: 'new-payment-flow', envs: ['dev', 'stg'], status: true, rollout: 45 },
    { id: 'flag2', key: 'chat-smart-replies', envs: ['stg', 'prod'], status: false, rollout: 0 },
    { id: 'flag3', key: 'onboarding-guides', envs: ['prod'], status: true, rollout: 100 },
    { id: 'flag4', key: 'experiments/expo-a', envs: ['stg'], status: true, rollout: 12 },
];


export default function FlagsPage() {
    const t = useTranslations('DevToolsPage.flags');
    const tDialog = useTranslations('DevToolsPage.flagDialog');

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <CardTitle>{t('title')}</CardTitle>
                        </div>
                        <div className="flex items-center gap-2">
                             <div className="relative flex-1 md:grow-0">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder={t('searchPlaceholder')}
                                    className="w-full rounded-lg bg-muted pl-8 md:w-[200px] lg:w-[336px]"
                                />
                            </div>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button>
                                        <PlusCircle className="mr-2"/>
                                        {t('createButton')}
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md">
                                    <DialogHeader>
                                        <DialogTitle>{tDialog('title')}</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="key">{tDialog('keyLabel')}</Label>
                                            <Input id="key" placeholder="new-cool-feature" />
                                        </div>
                                         <div className="space-y-2">
                                            <Label htmlFor="name">{tDialog('nameLabel')}</Label>
                                            <Input id="name" placeholder="New Cool Feature" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="description">{tDialog('descriptionLabel')}</Label>
                                            <Textarea id="description" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>{tDialog('environmentsLabel')}</Label>
                                            <div className="flex gap-4">
                                                <div className="flex items-center gap-2"><Checkbox id="env-dev" defaultChecked/> <Label htmlFor="env-dev">dev</Label></div>
                                                <div className="flex items-center gap-2"><Checkbox id="env-stg" defaultChecked/> <Label htmlFor="env-stg">staging</Label></div>
                                                <div className="flex items-center gap-2"><Checkbox id="env-prod"/> <Label htmlFor="env-prod">production</Label></div>
                                            </div>
                                        </div>
                                         <div className="space-y-2">
                                            <Label htmlFor="type">{tDialog('typeLabel')}</Label>
                                            <Select defaultValue="boolean">
                                                <SelectTrigger id="type"><SelectValue/></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="boolean">Boolean</SelectItem>
                                                    <SelectItem value="gradual-rollout">Gradual Rollout</SelectItem>
                                                    <SelectItem value="multivariate">Multivariate</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                         <div className="space-y-2">
                                            <Label htmlFor="tags">{tDialog('tagsLabel')}</Label>
                                            <Input id="tags" placeholder="payment, experiment" />
                                        </div>
                                         <div className="space-y-2">
                                            <Label htmlFor="owner">{tDialog('ownerLabel')}</Label>
                                            <Input id="owner" defaultValue="@alice" />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button variant="ghost">{tDialog('cancel')}</Button>
                                        <Button variant="outline">{tDialog('saveDraft')}</Button>
                                        <Button>{tDialog('saveAndCreate')}</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]"><Checkbox/></TableHead>
                                <TableHead>{t('table.key')}</TableHead>
                                <TableHead>{t('table.envs')}</TableHead>
                                <TableHead>{t('table.status')}</TableHead>
                                <TableHead>{t('table.rollout')}</TableHead>
                                <TableHead><span className="sr-only">Actions</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockFlags.map(flag => (
                                <TableRow key={flag.id}>
                                    <TableCell><Checkbox/></TableCell>
                                    <TableCell>
                                        <Link href={`/dashboard/dev/flags/${flag.key}`} className="font-mono hover:underline">
                                            {flag.key}
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-1">
                                            {flag.envs.map(env => (
                                                <Badge key={env} variant="outline">{env}</Badge>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Switch checked={flag.status} />
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Progress value={flag.rollout} className="h-2 w-24"/>
                                            <span className="text-muted-foreground">{flag.rollout}%</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon"><MoreHorizontal/></Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/dashboard/dev/flags/${flag.key}`}>{t('actions.details')}</Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>{t('actions.history')}</DropdownMenuItem>
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
