/**
 * GardeningFields - Formulaire de champs spécifiques pour Entretien Jardin/Extérieur
 * 
 * Catégorie: Jardinage & Extérieur > Entretien Jardin/Extérieur
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
import { Sprout } from 'lucide-react';

interface GardeningFieldsProps {
    form: UseFormReturn<any>;
}

export function GardeningFields({ form }: GardeningFieldsProps) {
    const t = useTranslations('TaskForms.Gardening');

    const serviceOptions = [
        { value: 'mowing', label: t('serviceType.mowing') },
        { value: 'leaf_raking', label: t('serviceType.leaf_raking') },
        { value: 'weeding', label: t('serviceType.weeding') },
        { value: 'watering', label: t('serviceType.watering') },
        { value: 'planting', label: t('serviceType.planting') },
        { value: 'terrace_cleaning', label: t('serviceType.terrace_cleaning') },
        { value: 'hedge_trimming', label: t('serviceType.hedge_trimming') },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-2 pb-2 border-b">
                <Sprout className="h-5 w-5 text-primary" />
                <div>
                    <h3 className="text-lg font-semibold">{t('title')}</h3>
                    <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
                </div>
            </div>

            {/* Type de lieu */}
            <FormField
                control={form.control}
                name="specificFields.placeType"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('placeType.label')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('placeType.placeholder')} />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="garden">{t('placeType.garden')}</SelectItem>
                                <SelectItem value="balcony">{t('placeType.balcony')}</SelectItem>
                                <SelectItem value="courtyard">{t('placeType.courtyard')}</SelectItem>
                                <SelectItem value="driveway">{t('placeType.driveway')}</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormDescription>{t('placeType.description')}</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Surface */}
            <FormField
                control={form.control}
                name="specificFields.surfaceArea"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('surfaceArea.label')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('surfaceArea.placeholder')} />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="under_50">{t('surfaceArea.under_50')}</SelectItem>
                                <SelectItem value="50_150">{t('surfaceArea.50_150')}</SelectItem>
                                <SelectItem value="over_150">{t('surfaceArea.over_150')}</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormDescription>{t('surfaceArea.description')}</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Type de prestation */}
            <FormField
                control={form.control}
                name="specificFields.serviceType"
                render={() => (
                    <FormItem>
                        <FormLabel>{t('serviceType.label')}</FormLabel>
                        <FormDescription>{t('serviceType.description')}</FormDescription>
                        <div className="grid grid-cols-2 gap-4 mt-2">
                            {serviceOptions.map((service) => (
                                <FormField
                                    key={service.value}
                                    control={form.control}
                                    name="specificFields.serviceType"
                                    render={({ field }) => {
                                        return (
                                            <FormItem
                                                key={service.value}
                                                className="flex flex-row items-start space-x-3 space-y-0"
                                            >
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value?.includes(service.value)}
                                                        onCheckedChange={(checked) => {
                                                            return checked
                                                                ? field.onChange([...(field.value || []), service.value])
                                                                : field.onChange(
                                                                      field.value?.filter(
                                                                          (value: string) => value !== service.value
                                                                      )
                                                                  );
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormLabel className="font-normal cursor-pointer">
                                                    {service.label}
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

            {/* Outils fournis par */}
            <FormField
                control={form.control}
                name="specificFields.toolsProvidedBy"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('toolsProvidedBy.label')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('toolsProvidedBy.placeholder')} />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="client">{t('toolsProvidedBy.client')}</SelectItem>
                                <SelectItem value="provider">{t('toolsProvidedBy.provider')}</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormDescription>{t('toolsProvidedBy.description')}</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Évacuation des déchets */}
            <FormField
                control={form.control}
                name="specificFields.wasteDisposal"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('wasteDisposal.label')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('wasteDisposal.placeholder')} />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="green_bin">{t('wasteDisposal.green_bin')}</SelectItem>
                                <SelectItem value="compost">{t('wasteDisposal.compost')}</SelectItem>
                                <SelectItem value="provider_removes">{t('wasteDisposal.provider_removes')}</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormDescription>{t('wasteDisposal.description')}</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    );
}
