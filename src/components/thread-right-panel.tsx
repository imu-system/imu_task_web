
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { Clock, CreditCard, FileText, ExternalLink, ShieldAlert, PlusCircle, Check, Shield, Flag } from 'lucide-react';
import { useTranslations } from "next-intl";
import { useAuth } from "@/hooks/use-auth";
import { UserRole } from "@/lib/types";

// Mock data
const timelineEvents = [
    { time: "12:00", text: "Booking créé", icon: <Check className="h-4 w-4" /> },
    { time: "12:30", text: "Paiement validé", icon: <CreditCard className="h-4 w-4" /> },
    { time: "14:00", text: "Preuve ajoutée", icon: <FileText className="h-4 w-4" /> },
];

const evidence = [
    { name: "Capture.png", url: "#" },
    { name: "Facture.pdf", url: "#" },
];

export function ThreadRightPanel({ threadId }: { threadId: string }) {
    const t = useTranslations('ThreadRightPanel');
    const { user } = useAuth();
    const isModerator = user?.roles.includes(UserRole.admin) || user?.roles.includes(UserRole.moderator);


    const ModeratorPanel = () => (
        <Card className="border-amber-500/50 bg-amber-500/5">
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-amber-700">
                    <Shield className="h-5 w-5"/>
                    {t('moderator.title')}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="text-xs space-y-1">
                    <p><strong>{t('moderator.threadId')}:</strong> <span className="font-mono">{threadId}</span></p>
                    <p><strong>{t('moderator.participants')}:</strong> Alice, Bob</p>
                </div>
                <Separator/>
                <div>
                     <p className="text-xs font-semibold mb-1">{t('moderator.lastMessage')}:</p>
                     <div className="flex items-center gap-2 text-sm p-2 bg-background rounded-md border">
                        <p className="flex-1 italic text-muted-foreground">"Ok pour demain"</p>
                        <Flag className="h-4 w-4 text-destructive"/>
                     </div>
                </div>
                <div className="grid grid-cols-3 gap-1">
                    <Button variant="outline" size="sm">{t('moderator.hide')}</Button>
                    <Button variant="outline" size="sm">{t('moderator.warn')}</Button>
                    <Button variant="destructive" size="sm">{t('moderator.suspend')}</Button>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="hidden lg:block w-80 border-l bg-background p-4 space-y-6 overflow-y-auto">
            
            {isModerator && <ModeratorPanel />}

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Clock className="h-5 w-5"/>
                        {t('timeline.title')}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-4">
                        {timelineEvents.map((event, index) => (
                            <li key={index} className="flex items-start gap-3 text-sm">
                                <div className="flex-shrink-0 pt-1">{event.icon}</div>
                                <div className="flex-1">
                                    <p className="font-medium">{event.text}</p>
                                    <p className="text-xs text-muted-foreground">{event.time}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="h-5 w-5"/>
                        {t('evidence.title')}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2">
                        {evidence.map((item, index) => (
                            <li key={index} className="flex items-center justify-between text-sm">
                                <span className="truncate">{item.name}</span>
                                <Button variant="ghost" size="icon" asChild>
                                    <a href={item.url} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="h-4 w-4"/>
                                    </a>
                                </Button>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="h-5 w-5"/>
                        {t('actions.title')}
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-2">
                    <Button variant="outline">
                        <ShieldAlert className="mr-2 h-4 w-4"/>
                        {t('actions.openDispute')}
                    </Button>
                     <Button variant="outline">
                        <PlusCircle className="mr-2 h-4 w-4"/>
                        {t('actions.createTask')}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
