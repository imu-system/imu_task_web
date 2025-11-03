/**
 * AdminHelpFields - Formulaire de champs spécifiques pour Aide Administrative
 * 
 * Catégorie: Aide Numérique & Administrative > Aide Administrative
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
import { Checkbox } from '@/components/ui/checkbox';
import { FileText } from 'lucide-react';

interface AdminHelpFieldsProps {
    form: UseFormReturn<any>;
}

export function AdminHelpFields({ form }: AdminHelpFieldsProps) {
    const t = useTranslations('TaskForms.AdminHelp');

    const softwareOptions = [
        { value: 'word', label: t('softwareNeeded.word') },
        { value: 'excel', label: t('softwareNeeded.excel') },
        { value: 'powerpoint', label: t('softwareNeeded.powerpoint') },
        { value: 'pdf', label: t('softwareNeeded.pdf') },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-2 pb-2 border-b">
                <FileText className="h-5 w-5 text-primary" />
                <div>
                    <h3 className="text-lg font-semibold">{t('title')}</h3>
                    <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
                </div>
            </div>

            {/* Type de tâche */}
            <FormField
                control={form.control}
                name="specificFields.taskType"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('taskType.label')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('taskType.placeholder')} />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="form_filling">{t('taskType.form_filling')}</SelectItem>
                                <SelectItem value="scanning">{t('taskType.scanning')}</SelectItem>
                                <SelectItem value="email">{t('taskType.email')}</SelectItem>
                                <SelectItem value="filing">{t('taskType.filing')}</SelectItem>
                                <SelectItem value="writing">{t('taskType.writing')}</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormDescription>{t('taskType.description')}</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Logiciels nécessaires */}
            <FormField
                control={form.control}
                name="specificFields.softwareNeeded"
                render={() => (
                    <FormItem>
                        <FormLabel>{t('softwareNeeded.label')}</FormLabel>
                        <FormDescription>{t('softwareNeeded.description')}</FormDescription>
                        <div className="grid grid-cols-2 gap-4 mt-2">
                            {softwareOptions.map((software) => (
                                <FormField
                                    key={software.value}
                                    control={form.control}
                                    name="specificFields.softwareNeeded"
                                    render={({ field }) => {
                                        return (
                                            <FormItem
                                                key={software.value}
                                                className="flex flex-row items-start space-x-3 space-y-0"
                                            >
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value?.includes(software.value)}
                                                        onCheckedChange={(checked) => {
                                                            return checked
                                                                ? field.onChange([...(field.value || []), software.value])
                                                                : field.onChange(
                                                                      field.value?.filter(
                                                                          (value: string) => value !== software.value
                                                                      )
                                                                  );
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormLabel className="font-normal cursor-pointer">
                                                    {software.label}
                                                </FormLabel>
                                            </FormItem>
                                        );
                                    }}
                                />
                            ))}
                        </div>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Niveau de confidentialité */}
            <FormField
                control={form.control}
                name="specificFields.confidentialityLevel"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('confidentialityLevel.label')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('confidentialityLevel.placeholder')} />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="sensitive">{t('confidentialityLevel.sensitive')}</SelectItem>
                                <SelectItem value="normal">{t('confidentialityLevel.normal')}</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormDescription>{t('confidentialityLevel.description')}</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Équipement (imprimante/scanner) */}
            <FormField
                control={form.control}
                name="specificFields.hasPrinterScanner"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                            <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                            />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                            <FormLabel>{t('hasPrinterScanner.label')}</FormLabel>
                            <FormDescription>{t('hasPrinterScanner.description')}</FormDescription>
                        </div>
                    </FormItem>
                )}
            />
        </div>
    );
}
