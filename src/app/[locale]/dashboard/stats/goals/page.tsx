
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, ArrowLeft, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from '@/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

export default function GoalsPage() {
    const { user, loading } = useAuth();
    const t = useTranslations('StatsPage.goals');
    const { toast } = useToast();
    
    const [earningsGoal, setEarningsGoal] = useState(1000);
    const [hoursGoal, setHoursGoal] = useState(60);
    const [acceptanceGoal, setAcceptanceGoal] = useState(95);

    const [isSaving, setIsSaving] = useState(false);

    // Mock data for current progress
    const currentEarnings = 450;
    const currentHours = 42;
    const currentAcceptance = 92;
    
    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            toast({
                title: t('toast.successTitle'),
                description: t('toast.successDescription'),
            });
            setIsSaving(false);
        }, 1000);
    }

    if (loading || !user) {
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
                    <Link href="/dashboard/stats">
                        <ArrowLeft className="h-4 w-4"/>
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
                        <Target className="h-8 w-8 text-primary"/>
                        {t('title')}
                    </h1>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t('card.title')}</CardTitle>
                    <CardDescription>{t('card.description')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    <div className="space-y-2">
                        <Label htmlFor="earnings-goal">{t('card.earningsGoal')}</Label>
                        <Input id="earnings-goal" type="number" value={earningsGoal} onChange={e => setEarningsGoal(Number(e.target.value))} />
                        <Progress value={(currentEarnings / earningsGoal) * 100} className="mt-2" />
                        <p className="text-sm text-muted-foreground text-right">{currentEarnings}€ / {earningsGoal}€</p>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="hours-goal">{t('card.hoursGoal')}</Label>
                        <Input id="hours-goal" type="number" value={hoursGoal} onChange={e => setHoursGoal(Number(e.target.value))} />
                        <Progress value={(currentHours / hoursGoal) * 100} className="mt-2" />
                        <p className="text-sm text-muted-foreground text-right">{currentHours}h / {hoursGoal}h</p>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="acceptance-goal">{t('card.acceptanceGoal')}</Label>
                        <Input id="acceptance-goal" type="number" value={acceptanceGoal} onChange={e => setAcceptanceGoal(Number(e.target.value))} />
                        <Progress value={(currentAcceptance / acceptanceGoal) * 100} className="mt-2" />
                        <p className="text-sm text-muted-foreground text-right">{currentAcceptance}% / {acceptanceGoal}%</p>
                    </div>
                </CardContent>
            </Card>
            
             <div className="flex justify-end">
                <Button size="lg" onClick={handleSave} disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                    {t('card.saveButton')}
                </Button>
            </div>
        </div>
    );
}
