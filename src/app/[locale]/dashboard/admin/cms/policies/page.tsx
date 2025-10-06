
'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Loader2, History, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';

const mockPolicyData = {
    terms: {
        title: { fr: "Conditions Générales d'Utilisation", en: "Terms of Service", jp: "利用規約" },
        seoTitle: { fr: "Conditions d'Utilisation - ImuTask", en: "Terms of Service - ImuTask", jp: "利用規約 - ImuTask" },
        seoDescription: { fr: "Consultez les conditions d'utilisation de ImuTask.", en: "Read the terms of service for ImuTask.", jp: "ImuTaskの利用規約をお読みください。" },
        content: { fr: "Contenu des conditions d'utilisation en français...", en: "Content of the terms of service in English...", jp: "フランス語の利用規約の内容..." },
    },
    privacy: {
        title: { fr: "Politique de Confidentialité", en: "Privacy Policy", jp: "プライバシーポリシー" },
        seoTitle: { fr: "Politique de Confidentialité - ImuTask", en: "Privacy Policy - ImuTask", jp: "プライバシーポリシー - ImuTask" },
        seoDescription: { fr: "Notre engagement pour la protection de vos données.", en: "Our commitment to protecting your data.", jp: "お客様のデータを保護するための当社の取り組み。" },
        content: { fr: "Contenu de la politique de confidentialité en français...", en: "Content of the privacy policy in English...", jp: "フランス語のプライバシーポリシーの内容..." },
    }
}

export default function AdminPoliciesPage() {
    const t = useTranslations('AdminCmsPage.policies');
    const tLang = useTranslations('Languages');
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [isScheduling, setIsScheduling] = useState(false);
    const [scheduledDate, setScheduledDate] = useState<Date | undefined>();


    const handleSave = async (policy: 'terms' | 'privacy') => {
        setIsSaving(true);
        console.log(`Saving ${policy}...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast({
            title: t('toast.saveSuccessTitle'),
            description: t('toast.saveSuccessDescription'),
        });
        setIsSaving(false);
    }
     const handlePublish = async (policy: 'terms' | 'privacy') => {
        setIsPublishing(true);
        console.log(`Publishing ${policy}...`);
        await new Promise(resolve => setTimeout(resolve, 1500));
        toast({
            title: t('toast.publishSuccessTitle'),
            description: t('toast.publishSuccessDescription'),
        });
        setIsPublishing(false);
    }

    const PolicyEditor = ({ policyType }: { policyType: 'terms' | 'privacy' }) => (
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                 <Card>
                    <CardHeader>
                        <CardTitle>{t(`form.${policyType}.title`)}</CardTitle>
                        <CardDescription>{t(`form.${policyType}.description`)}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        <Tabs defaultValue="fr" className="w-full">
                            <TabsList>
                                <TabsTrigger value="fr">{tLang('fr')}</TabsTrigger>
                                <TabsTrigger value="en">{tLang('en')}</TabsTrigger>
                                <TabsTrigger value="jp">{tLang('jp')}</TabsTrigger>
                            </TabsList>
                            <TabsContent value="fr" className="space-y-4 pt-4">
                                <div className="space-y-2">
                                    <Label htmlFor={`${policyType}-title-fr`}>{t('form.fields.pageTitle')}</Label>
                                    <Input id={`${policyType}-title-fr`} defaultValue={mockPolicyData[policyType].title.fr}/>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor={`${policyType}-content-fr`}>{t('form.fields.content')}</Label>
                                    <Textarea id={`${policyType}-content-fr`} rows={15} defaultValue={mockPolicyData[policyType].content.fr} />
                                     <p className="text-xs text-muted-foreground">{t('form.fields.markdown')}</p>
                                </div>
                            </TabsContent>
                            <TabsContent value="en" className="space-y-4 pt-4">
                                 <div className="space-y-2">
                                    <Label htmlFor={`${policyType}-title-en`}>{t('form.fields.pageTitle')}</Label>
                                    <Input id={`${policyType}-title-en`} defaultValue={mockPolicyData[policyType].title.en}/>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor={`${policyType}-content-en`}>{t('form.fields.content')}</Label>
                                    <Textarea id={`${policyType}-content-en`} rows={15} defaultValue={mockPolicyData[policyType].content.en} />
                                    <p className="text-xs text-muted-foreground">{t('form.fields.markdown')}</p>
                                </div>
                            </TabsContent>
                             <TabsContent value="jp" className="space-y-4 pt-4">
                                 <div className="space-y-2">
                                    <Label htmlFor={`${policyType}-title-jp`}>{t('form.fields.pageTitle')}</Label>
                                    <Input id={`${policyType}-title-jp`} defaultValue={mockPolicyData[policyType].title.jp}/>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor={`${policyType}-content-jp`}>{t('form.fields.content')}</Label>
                                    <Textarea id={`${policyType}-content-jp`} rows={15} defaultValue={mockPolicyData[policyType].content.jp} />
                                    <p className="text-xs text-muted-foreground">{t('form.fields.markdown')}</p>
                                </div>
                            </TabsContent>
                        </Tabs>

                        <Separator />

                        <div>
                            <h3 className="text-lg font-medium">{t('form.seo.title')}</h3>
                            <p className="text-sm text-muted-foreground">{t('form.seo.description')}</p>
                            <div className="space-y-4 mt-4">
                                 <div className="space-y-2">
                                    <Label htmlFor={`${policyType}-seo-title-fr`}>{t('form.fields.seoTitle')} (FR)</Label>
                                    <Input id={`${policyType}-seo-title-fr`} defaultValue={mockPolicyData[policyType].seoTitle.fr}/>
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor={`${policyType}-seo-desc-fr`}>{t('form.fields.seoDescription')} (FR)</Label>
                                    <Textarea id={`${policyType}-seo-desc-fr`} rows={2} defaultValue={mockPolicyData[policyType].seoDescription.fr}/>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor={`${policyType}-seo-title-en`}>{t('form.fields.seoTitle')} (EN)</Label>
                                    <Input id={`${policyType}-seo-title-en`} defaultValue={mockPolicyData[policyType].seoTitle.en}/>
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor={`${policyType}-seo-desc-en`}>{t('form.fields.seoDescription')} (EN)</Label>
                                    <Textarea id={`${policyType}-seo-desc-en`} rows={2} defaultValue={mockPolicyData[policyType].seoDescription.en}/>
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor={`${policyType}-seo-title-jp`}>{t('form.fields.seoTitle')} (JP)</Label>
                                    <Input id={`${policyType}-seo-title-jp`} defaultValue={mockPolicyData[policyType].seoTitle.jp}/>
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor={`${policyType}-seo-desc-jp`}>{t('form.fields.seoDescription')} (JP)</Label>
                                    <Textarea id={`${policyType}-seo-desc-jp`} rows={2} defaultValue={mockPolicyData[policyType].seoDescription.jp}/>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
             <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>{t('form.history.title')}</CardTitle>
                        <CardDescription>{t('form.history.description')}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <span className="font-semibold text-sm">{t('form.history.status')}: </span>
                            <span className="text-sm text-muted-foreground">{t('form.history.published')}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{t('form.history.lastSaved')} 2 minutes ago</p>
                        <Button variant="outline" disabled className="w-full">
                            <History className="mr-2"/>
                            {t('form.history.viewHistory')}
                        </Button>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>{t('form.scheduling.title')}</CardTitle>
                        <CardDescription>{t('form.scheduling.description')}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <Switch id="schedule-switch" checked={isScheduling} onCheckedChange={setIsScheduling} />
                            <Label htmlFor="schedule-switch">{t('form.scheduling.enable')}</Label>
                        </div>
                        {isScheduling && (
                            <div className="space-y-4 pt-2">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                                            <CalendarIcon className="mr-2"/>
                                            {scheduledDate ? format(scheduledDate, "PPP") : (<span>{t('form.scheduling.pickDate')}</span>)}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar mode="single" selected={scheduledDate} onSelect={setScheduledDate} initialFocus/>
                                    </PopoverContent>
                                </Popover>
                                <div className="space-y-2">
                                    <Label htmlFor="schedule-time">{t('form.scheduling.timeLabel')}</Label>
                                    <Input id="schedule-time" type="time" defaultValue="09:00" />
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
                <div className="flex flex-col gap-2">
                     <Button onClick={() => handlePublish(policyType)} disabled={isSaving || isPublishing}>
                        {isPublishing ? <Loader2 className="mr-2 animate-spin"/> : null}
                        {isScheduling ? t('form.scheduleButton') : t('form.publishButton')}
                    </Button>
                    <Button variant="secondary" onClick={() => handleSave(policyType)} disabled={isSaving || isPublishing}>
                        {isSaving && <Loader2 className="mr-2 animate-spin"/>}
                        {t('form.saveDraftButton')}
                    </Button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            <Tabs defaultValue="terms" className="w-full">
                <TabsList>
                    <TabsTrigger value="terms">{t('tabs.terms')}</TabsTrigger>
                    <TabsTrigger value="privacy">{t('tabs.privacy')}</TabsTrigger>
                </TabsList>
                <TabsContent value="terms" className="mt-6">
                   <PolicyEditor policyType="terms"/>
                </TabsContent>
                <TabsContent value="privacy" className="mt-6">
                   <PolicyEditor policyType="privacy"/>
                </TabsContent>
            </Tabs>
        </div>
    );
}
