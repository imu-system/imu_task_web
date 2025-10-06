
'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import fr from '@/messages/fr.json';
import en from '@/messages/en.json';
import ja from '@/messages/ja.json';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

type Translations = { [key: string]: string | Translations };

const flattenKeys = (obj: Translations, prefix = ''): Record<string, string> => {
    return Object.keys(obj).reduce((acc, k) => {
        const pre = prefix.length ? prefix + '.' : '';
        if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
            Object.assign(acc, flattenKeys(obj[k] as Translations, pre + k));
        } else {
            acc[pre + k] = obj[k] as string;
        }
        return acc;
    }, {} as Record<string, string>);
};

const groupKeys = (keys: string[]): Record<string, string[]> => {
    return keys.reduce((acc, key) => {
        const group = key.split('.')[0];
        if (!acc[group]) {
            acc[group] = [];
        }
        acc[group].push(key);
        return acc;
    }, {} as Record<string, string[]>);
}


export default function AdminKeysPage() {
    const t = useTranslations('AdminI18nPage.keys');
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);

    const [translations, setTranslations] = useState({ fr, en, jp });

    const handleSave = () => {
        setIsSaving(true);
        // In a real app, this would trigger an API call to save the JSON files.
        console.log("Saving translations:", translations);
        setTimeout(() => {
            toast({
                title: t('toast.saveSuccessTitle'),
                description: t('toast.saveSuccessDescription'),
            });
            setIsSaving(false);
        }, 1500);
    }
    
    const allKeys = [...new Set([...Object.keys(flattenKeys(fr)), ...Object.keys(flattenKeys(en)), ...Object.keys(flattenKeys(jp))])].sort();
    const groupedKeys = groupKeys(allKeys);


    const getValue = (lang: 'fr' | 'en' | 'jp', key: string): string => {
        const keys = key.split('.');
        let current: any = translations[lang];
        for (const k of keys) {
            current = current?.[k];
        }
        return current ?? '';
    }

    const handleChange = (lang: 'fr' | 'en' | 'jp', key: string, value: string) => {
        setTranslations(prev => {
            const newTranslations = JSON.parse(JSON.stringify(prev)); // Deep copy
            const keys = key.split('.');
            let current = newTranslations[lang];
            for (let i = 0; i < keys.length - 1; i++) {
                current[keys[i]] = current[keys[i]] || {};
                current = current[keys[i]];
            }
            current[keys[keys.length - 1]] = value;
            return newTranslations;
        });
    }

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <CardTitle>{t('title')}</CardTitle>
                            <CardDescription>{t('description')}</CardDescription>
                        </div>
                        <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving && <Loader2 className="mr-2 animate-spin"/>}
                            {t('saveButton')}
                        </Button>
                    </div>
                </CardHeader>
            </Card>

            <Accordion type="multiple" className="w-full space-y-4">
                {Object.entries(groupedKeys).map(([groupName, keys]) => (
                     <Card key={groupName}>
                        <AccordionItem value={groupName} className="border-b-0">
                            <AccordionTrigger className="p-6 text-lg font-semibold hover:no-underline">
                                {groupName}
                            </AccordionTrigger>
                            <AccordionContent className="px-6 pb-6">
                                <div className="space-y-6">
                                    {keys.map(key => {
                                        const frValue = getValue('fr', key);
                                        const enValue = getValue('en', key);
                                        const jpValue = getValue('jp', key);

                                        return (
                                        <div key={key} className="space-y-2 p-4 border rounded-lg bg-background/50">
                                            <Label htmlFor={`key-${key}`} className="font-mono text-sm text-muted-foreground">{key}</Label>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="space-y-1">
                                                    <Label htmlFor={`fr-${key}`}>FR</Label>
                                                    <Input id={`fr-${key}`} value={frValue} onChange={(e) => handleChange('fr', key, e.target.value)} className={!frValue ? "border-yellow-400" : ""} placeholder={!frValue ? t('missingKey') : ''}/>
                                                </div>
                                                <div className="space-y-1">
                                                     <Label htmlFor={`en-${key}`}>EN</Label>
                                                    <Input id={`en-${key}`} value={enValue} onChange={(e) => handleChange('en', key, e.target.value)} className={!enValue ? "border-yellow-400" : ""} placeholder={!enValue ? t('missingKey') : ''}/>
                                                </div>
                                                <div className="space-y-1">
                                                     <Label htmlFor={`jp-${key}`}>JP</Label>
                                                    <Input id={`jp-${key}`} value={jpValue} onChange={(e) => handleChange('jp', key, e.target.value)} className={!jpValue ? "border-yellow-400" : ""} placeholder={!jpValue ? t('missingKey') : ''}/>
                                                </div>
                                            </div>
                                        </div>
                                    )})
                                    }
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                     </Card>
                ))}
            </Accordion>
        </div>
    );
}
