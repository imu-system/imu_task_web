
'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import fr from '@/messages/fr.json';
import en from '@/messages/en.json';
import ja from '@/messages/ja.json';
import React, { useState } from 'react';

const allMessages: Record<string, any> = { fr, en, ja };

export default function AdminIoPage() {
    const t = useTranslations('AdminI18nPage.io');
    const tLang = useTranslations('Languages');
    const { toast } = useToast();
    const [fileToImport, setFileToImport] = useState<File | null>(null);
    const [importLocale, setImportLocale] = useState('fr');
    const [exportLocale, setExportLocale] = useState('fr');

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setFileToImport(event.target.files[0]);
        }
    };

    const handleImport = () => {
        if (!fileToImport) {
            toast({
                variant: 'destructive',
                title: t('toast.noFile.title'),
                description: t('toast.noFile.description'),
            });
            return;
        }
        // In a real app, you would read the file and send its content to an API
        console.log(`Importing ${fileToImport.name} for locale ${importLocale}...`);
        toast({
            title: t('toast.importSuccess.title'),
            description: t('toast.importSuccess.description', { locale: importLocale }),
        });
    };
    
    const handleExport = () => {
        const data = allMessages[exportLocale];
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
            JSON.stringify(data, null, 2)
        )}`;
        const link = document.createElement("a");
        link.href = jsonString;
        link.download = `${exportLocale}.json`;
        link.click();
    };

    return (
        <div className="grid md:grid-cols-2 gap-8">
            <Card>
                <CardHeader>
                    <CardTitle>{t('import.title')}</CardTitle>
                    <CardDescription>{t('import.description')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="import-locale">{t('import.localeLabel')}</Label>
                        <Select value={importLocale} onValueChange={setImportLocale}>
                            <SelectTrigger id="import-locale">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="fr">{tLang('fr')}</SelectItem>
                                <SelectItem value="en">{tLang('en')}</SelectItem>
                                <SelectItem value="jp">{tLang('jp')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="file-upload">{t('import.fileLabel')}</Label>
                        <Input id="file-upload" type="file" accept=".json" onChange={handleFileChange} />
                    </div>
                    <Button onClick={handleImport} className="w-full">
                        <Upload className="mr-2"/>
                        {t('import.button')}
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t('export.title')}</CardTitle>
                    <CardDescription>{t('export.description')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="space-y-2">
                        <Label htmlFor="export-locale">{t('export.localeLabel')}</Label>
                         <Select value={exportLocale} onValueChange={setExportLocale}>
                            <SelectTrigger id="export-locale">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="fr">{tLang('fr')}</SelectItem>
                                <SelectItem value="en">{tLang('en')}</SelectItem>
                                <SelectItem value="jp">{tLang('jp')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button onClick={handleExport} className="w-full">
                        <Download className="mr-2"/>
                        {t('export.button')}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
