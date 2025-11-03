/**
 * AccompanimentFields - Formulaire de champs spécifiques pour Accompagnement de Personnes
 * 
 * Catégorie: Accompagnement & Présence > Accompagnement de Personnes
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
import { UserRound } from 'lucide-react';

interface AccompanimentFieldsProps {
    form: UseFormReturn<any>;
}

export function AccompanimentFields({ form }: AccompanimentFieldsProps) {
    const t = useTranslations('TaskForms.Accompaniment');

    const specialNeedsOptions = [
        { value: 'reduced_mobility', label: t('specialNeeds.reduced_mobility') },
        { value: 'wheelchair', label: t('specialNeeds.wheelchair') },
        { value: 'hearing', label: t('specialNeeds.hearing') },
        { value: 'visual', label: t('specialNeeds.visual') },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-2 pb-2 border-b">
                <UserRound className="h-5 w-5 text-primary" />
                <div>
                    <h3 className="text-lg font-semibold">{t('title')}</h3>
                    <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
                </div>
            </div>

            {/* Type d'accompagnement */}
            <FormField
                control={form.control}
                name="specificFields.accompanimentType"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('accompanimentType.label')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('accompanimentType.placeholder')} />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="medical">{t('accompanimentType.medical')}</SelectItem>
                                <SelectItem value="walk">{t('accompanimentType.walk')}</SelectItem>
                                <SelectItem value="shopping">{t('accompanimentType.shopping')}</SelectItem>
                                <SelectItem value="social">{t('accompanimentType.social')}</SelectItem>
                                <SelectItem value="visit">{t('accompanimentType.visit')}</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormDescription>{t('accompanimentType.description')}</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Adresse de départ */}
            <FormField
                control={form.control}
                name="specificFields.fromAddress"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('fromAddress.label')}</FormLabel>
                        <FormControl>
                            <Input placeholder={t('fromAddress.placeholder')} {...field} />
                        </FormControl>
                        <FormDescription>{t('fromAddress.description')}</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Adresse d'arrivée */}
            <FormField
                control={form.control}
                name="specificFields.toAddress"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('toAddress.label')}</FormLabel>
                        <FormControl>
                            <Input placeholder={t('toAddress.placeholder')} {...field} />
                        </FormControl>
                        <FormDescription>{t('toAddress.description')}</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Durée estimée */}
            <FormField
                control={form.control}
                name="specificFields.duration"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('duration.label')}</FormLabel>
                        <FormControl>
                            <Input
                                type="number"
                                min={15}
                                step={15}
                                placeholder="60"
                                {...field}
                                onChange={(e) => field.onChange(e.target.valueAsNumber || 60)}
                            />
                        </FormControl>
                        <FormDescription>{t('duration.description')}</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Besoins spécifiques */}
            <FormField
                control={form.control}
                name="specificFields.specialNeeds"
                render={() => (
                    <FormItem>
                        <FormLabel>{t('specialNeeds.label')}</FormLabel>
                        <FormDescription>{t('specialNeeds.description')}</FormDescription>
                        <div className="grid grid-cols-2 gap-4 mt-2">
                            {specialNeedsOptions.map((need) => (
                                <FormField
                                    key={need.value}
                                    control={form.control}
                                    name="specificFields.specialNeeds"
                                    render={({ field }) => {
                                        return (
                                            <FormItem
                                                key={need.value}
                                                className="flex flex-row items-start space-x-3 space-y-0"
                                            >
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value?.includes(need.value)}
                                                        onCheckedChange={(checked) => {
                                                            return checked
                                                                ? field.onChange([...(field.value || []), need.value])
                                                                : field.onChange(
                                                                      field.value?.filter(
                                                                          (value: string) => value !== need.value
                                                                      )
                                                                  );
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormLabel className="font-normal cursor-pointer">
                                                    {need.label}
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

            {/* Mode de transport */}
            <FormField
                control={form.control}
                name="specificFields.transportMode"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('transportMode.label')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('transportMode.placeholder')} />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="walk">{t('transportMode.walk')}</SelectItem>
                                <SelectItem value="public_transport">{t('transportMode.public_transport')}</SelectItem>
                                <SelectItem value="provider_car">{t('transportMode.provider_car')}</SelectItem>
                                <SelectItem value="taxi">{t('transportMode.taxi')}</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormDescription>{t('transportMode.description')}</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    );
}
