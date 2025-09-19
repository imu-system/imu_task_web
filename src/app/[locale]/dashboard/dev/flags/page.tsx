
'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Search } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Link } from '@/navigation';

const mockFlags = [
    { id: 'flag1', key: 'new-payment-flow', envs: ['dev', 'stg'], status: true, rollout: 45 },
    { id: 'flag2', key: 'chat-smart-replies', envs: ['stg', 'prod'], status: false, rollout: 0 },
    { id: 'flag3', key: 'onboarding-guides', envs: ['prod'], status: true, rollout: 100 },
    { id: 'flag4', key: 'experiments/expo-a', envs: ['stg'], status: true, rollout: 12 },
];


export default function FlagsPage() {
    const t = useTranslations('DevToolsPage.flags');
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
