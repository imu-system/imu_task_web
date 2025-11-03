/**
 * OrganizationFields - Formulaire de champs spécifiques pour Rangement & Organisation
 * 
 * Catégorie: Aide à Domicile & Petits Travaux > Rangement & Organisation
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
import { FolderKanban } from 'lucide-react';

interface OrganizationFieldsProps {
    form: UseFormReturn<any>;
}

export function OrganizationFields({ form }: OrganizationFieldsProps) {
    const t = useTranslations('TaskForms.Organization');

    const areasOptions = [
        { value: 'closet', label: t('areasToOrganize.closet') },
        { value: 'library', label: t('areasToOrganize.library') },
        { value: 'cellar', label: t('areasToOrganize.cellar') },
        { value: 'garage', label: t('areasToOrganize.garage') },
        { value: 'kitchen', label: t('areasToOrganize.kitchen') },
        { value: 'office', label: t('areasToOrganize.office') },
        { value: 'other', label: t('areasToOrganize.other') },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-2 pb-2 border-b">
                <FolderKanban className="h-5 w-5 text-primary" />
                <div>
                    <h3 className="text-lg font-semibold">{t('title')}</h3>
                    <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
                </div>
            </div>

            {/* Zones à organiser */}
            <FormField
                control={form.control}
                name="specificFields.areasToOrganize"
                render={() => (
                    <FormItem>
                        <FormLabel>{t('areasToOrganize.label')}</FormLabel>
                        <FormDescription>{t('areasToOrganize.description')}</FormDescription>
                        <div className="grid grid-cols-2 gap-4 mt-2">
                            {areasOptions.map((area) => (
                                <FormField
                                    key={area.value}
                                    control={form.control}
                                    name="specificFields.areasToOrganize"
                                    render={({ field }) => {
                                        return (
                                            <FormItem
                                                key={area.value}
                                                className="flex flex-row items-start space-x-3 space-y-0"
                                            >
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value?.includes(area.value)}
                                                        onCheckedChange={(checked) => {
                                                            return checked
                                                                ? field.onChange([...(field.value || []), area.value])
                                                                : field.onChange(
                                                                      field.value?.filter(
                                                                          (value: string) => value !== area.value
                                                                      )
                                                                  );
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormLabel className="font-normal cursor-pointer">
                                                    {area.label}
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

            {/* Objectif */}
            <FormField
                control={form.control}
                name="specificFields.goal"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('goal.label')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('goal.placeholder')} />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="declutter">{t('goal.declutter')}</SelectItem>
                                <SelectItem value="sort">{t('goal.sort')}</SelectItem>
                                <SelectItem value="classify">{t('goal.classify')}</SelectItem>
                                <SelectItem value="optimize">{t('goal.optimize')}</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormDescription>{t('goal.description')}</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Volume estimé */}
            <FormField
                control={form.control}
                name="specificFields.volumeEstimate"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('volumeEstimate.label')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('volumeEstimate.placeholder')} />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="small">{t('volumeEstimate.small')}</SelectItem>
                                <SelectItem value="medium">{t('volumeEstimate.medium')}</SelectItem>
                                <SelectItem value="large">{t('volumeEstimate.large')}</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormDescription>{t('volumeEstimate.description')}</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    );
}
