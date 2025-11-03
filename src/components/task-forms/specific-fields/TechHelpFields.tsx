/**
 * TechHelpFields - Formulaire de champs spécifiques pour Aide Informatique
 * 
 * Catégorie: Aide Numérique & Administrative > Aide Informatique
 * Basé sur CREATE_MISSION.md
 */

'use client';

import { UseFormReturn } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import {
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
    FormDescription,
} from '@/components/ui/form';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Monitor } from 'lucide-react';

interface TechHelpFieldsProps {
    form: UseFormReturn<any>;
}

export function TechHelpFields({ form }: TechHelpFieldsProps) {
    const t = useTranslations('TaskForms.TechHelp');

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-2 pb-2 border-b">
                <Monitor className="h-5 w-5 text-primary" />
                <div>
                    <h3 className="text-lg font-semibold">{t('title')}</h3>
                    <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
                </div>
            </div>

            {/* Type d'appareil */}
            <FormField
                control={form.control}
                name="specificFields.deviceType"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('deviceType.label')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('deviceType.placeholder')} />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="smartphone">{t('deviceType.smartphone')}</SelectItem>
                                <SelectItem value="tablet">{t('deviceType.tablet')}</SelectItem>
                                <SelectItem value="laptop">{t('deviceType.laptop')}</SelectItem>
                                <SelectItem value="desktop">{t('deviceType.desktop')}</SelectItem>
                                <SelectItem value="smart_tv">{t('deviceType.smart_tv')}</SelectItem>
                                <SelectItem value="internet_box">{t('deviceType.internet_box')}</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormDescription>{t('deviceType.description')}</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Système d'exploitation */}
            <FormField
                control={form.control}
                name="specificFields.operatingSystem"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('operatingSystem.label')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('operatingSystem.placeholder')} />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="windows">{t('operatingSystem.windows')}</SelectItem>
                                <SelectItem value="macos">{t('operatingSystem.macos')}</SelectItem>
                                <SelectItem value="ios">{t('operatingSystem.ios')}</SelectItem>
                                <SelectItem value="android">{t('operatingSystem.android')}</SelectItem>
                                <SelectItem value="linux">{t('operatingSystem.linux')}</SelectItem>
                                <SelectItem value="other">{t('operatingSystem.other')}</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormDescription>{t('operatingSystem.description')}</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Type de problème */}
            <FormField
                control={form.control}
                name="specificFields.issueType"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('issueType.label')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('issueType.placeholder')} />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="installation">{t('issueType.installation')}</SelectItem>
                                <SelectItem value="training">{t('issueType.training')}</SelectItem>
                                <SelectItem value="troubleshooting">{t('issueType.troubleshooting')}</SelectItem>
                                <SelectItem value="backup">{t('issueType.backup')}</SelectItem>
                                <SelectItem value="other">{t('issueType.other')}</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormDescription>{t('issueType.description')}</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Description spécifique du problème */}
            <FormField
                control={form.control}
                name="specificFields.specificIssue"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('specificIssue.label')}</FormLabel>
                        <FormControl>
                            <Input placeholder={t('specificIssue.placeholder')} {...field} />
                        </FormControl>
                        <FormDescription>{t('specificIssue.description')}</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Accès à distance possible */}
            <FormField
                control={form.control}
                name="specificFields.remoteAccessPossible"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                            <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                            />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                            <FormLabel>{t('remoteAccessPossible.label')}</FormLabel>
                            <FormDescription>{t('remoteAccessPossible.description')}</FormDescription>
                        </div>
                    </FormItem>
                )}
            />
        </div>
    );
}
