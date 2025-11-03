/**
 * DogWalkingFields - Formulaire de champs spécifiques pour Promenade de Chien
 * 
 * Catégorie: Garde d'Animaux > Promenade de Chien
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
import { Dog } from 'lucide-react';

interface DogWalkingFieldsProps {
    form: UseFormReturn<any>;
}

export function DogWalkingFields({ form }: DogWalkingFieldsProps) {
    const t = useTranslations('TaskForms.DogWalking');

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-2 pb-2 border-b">
                <Dog className="h-5 w-5 text-primary" />
                <div>
                    <h3 className="text-lg font-semibold">{t('title')}</h3>
                    <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
                </div>
            </div>

            {/* Race du chien */}
            <FormField
                control={form.control}
                name="specificFields.dogBreed"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('dogBreed.label')}</FormLabel>
                        <FormControl>
                            <Input placeholder={t('dogBreed.placeholder')} {...field} />
                        </FormControl>
                        <FormDescription>{t('dogBreed.description')}</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Taille du chien */}
            <FormField
                control={form.control}
                name="specificFields.dogSize"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('dogSize.label')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('dogSize.placeholder')} />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="small">{t('dogSize.small')}</SelectItem>
                                <SelectItem value="medium">{t('dogSize.medium')}</SelectItem>
                                <SelectItem value="large">{t('dogSize.large')}</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormDescription>{t('dogSize.description')}</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Tempérament (checkboxes) */}
            <FormField
                control={form.control}
                name="specificFields.temperament"
                render={() => (
                    <FormItem>
                        <div className="mb-4">
                            <FormLabel>{t('temperament.label')}</FormLabel>
                            <FormDescription>{t('temperament.description')}</FormDescription>
                        </div>
                        {(['sociable', 'reactive', 'calm', 'energetic'] as const).map((trait) => (
                            <FormField
                                key={trait}
                                control={form.control}
                                name="specificFields.temperament"
                                render={({ field }) => {
                                    return (
                                        <FormItem
                                            key={trait}
                                            className="flex flex-row items-start space-x-3 space-y-0"
                                        >
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value?.includes(trait)}
                                                    onCheckedChange={(checked) => {
                                                        return checked
                                                            ? field.onChange([...(field.value || []), trait])
                                                            : field.onChange(
                                                                  field.value?.filter((value: string) => value !== trait)
                                                              );
                                                    }}
                                                />
                                            </FormControl>
                                            <FormLabel className="font-normal">
                                                {t(`temperament.${trait}`)}
                                            </FormLabel>
                                        </FormItem>
                                    );
                                }}
                            />
                        ))}
                    </FormItem>
                )}
            />

            {/* Nombre de promenades par jour */}
            <FormField
                control={form.control}
                name="specificFields.walksPerDay"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('walksPerDay.label')}</FormLabel>
                        <FormControl>
                            <Input
                                type="number"
                                min={1}
                                max={5}
                                placeholder="1"
                                {...field}
                                onChange={(e) => field.onChange(e.target.valueAsNumber || 1)}
                            />
                        </FormControl>
                        <FormDescription>{t('walksPerDay.description')}</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Durée de chaque promenade */}
            <FormField
                control={form.control}
                name="specificFields.walkDuration"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('walkDuration.label')}</FormLabel>
                        <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={field.value?.toString()}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('walkDuration.placeholder')} />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="30">{t('walkDuration.30min')}</SelectItem>
                                <SelectItem value="60">{t('walkDuration.60min')}</SelectItem>
                                <SelectItem value="90">{t('walkDuration.90min')}</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormDescription>{t('walkDuration.description')}</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Besoins spéciaux (médicaments, nourriture) */}
            <div className="space-y-4">
                <FormLabel>{t('specialNeeds.label')}</FormLabel>
                <FormField
                    control={form.control}
                    name="specificFields.specialNeeds.medication"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                                <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                            <FormLabel className="font-normal">
                                {t('specialNeeds.medication')}
                            </FormLabel>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="specificFields.specialNeeds.feeding"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                                <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                            <FormLabel className="font-normal">
                                {t('specialNeeds.feeding')}
                            </FormLabel>
                        </FormItem>
                    )}
                />
                <p className="text-sm text-muted-foreground">{t('specialNeeds.description')}</p>
            </div>

            {/* Équipement nécessaire (checkboxes) */}
            <FormField
                control={form.control}
                name="specificFields.equipment"
                render={() => (
                    <FormItem>
                        <div className="mb-4">
                            <FormLabel>{t('equipment.label')}</FormLabel>
                            <FormDescription>{t('equipment.description')}</FormDescription>
                        </div>
                        {(['leash', 'muzzle', 'waste_bags'] as const).map((item) => (
                            <FormField
                                key={item}
                                control={form.control}
                                name="specificFields.equipment"
                                render={({ field }) => {
                                    return (
                                        <FormItem
                                            key={item}
                                            className="flex flex-row items-start space-x-3 space-y-0"
                                        >
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value?.includes(item)}
                                                    onCheckedChange={(checked) => {
                                                        return checked
                                                            ? field.onChange([...(field.value || []), item])
                                                            : field.onChange(
                                                                  field.value?.filter((value: string) => value !== item)
                                                              );
                                                    }}
                                                />
                                            </FormControl>
                                            <FormLabel className="font-normal">
                                                {t(`equipment.${item}`)}
                                            </FormLabel>
                                        </FormItem>
                                    );
                                }}
                            />
                        ))}
                    </FormItem>
                )}
            />
        </div>
    );
}
