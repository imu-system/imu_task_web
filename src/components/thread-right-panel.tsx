
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { Clock, CreditCard, FileText, ExternalLink, ShieldAlert, PlusCircle, Check } from 'lucide-react';
import { useTranslations } from "next-intl";

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

    return (
        <div className="hidden lg:block w-80 border-l bg-background p-4 space-y-6 overflow-y-auto">
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
