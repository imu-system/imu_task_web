/**
 * MovingFields - Formulaire de champs spécifiques pour Aide au Déménagement
 * 
 * Catégorie: Déménagement & Manutention > Aide au Déménagement
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
import { Truck } from 'lucide-react';

interface MovingFieldsProps {
    form: UseFormReturn<any>;
}

export function MovingFields({ form }: MovingFieldsProps) {
    const t = useTranslations('TaskForms.Moving');

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-2 pb-2 border-b">
                <Truck className="h-5 w-5 text-primary" />
                <div>
                    <h3 className="text-lg font-semibold">{t('title')}</h3>
                    <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
                </div>
            </div>

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
                                <SelectItem value="few_boxes">{t('volumeEstimate.few_boxes')}</SelectItem>
                                <SelectItem value="studio">{t('volumeEstimate.studio')}</SelectItem>
                                <SelectItem value="t2">{t('volumeEstimate.t2')}</SelectItem>
                                <SelectItem value="cellar">{t('volumeEstimate.cellar')}</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormDescription>{t('volumeEstimate.description')}</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Nombre de personnes nécessaires */}
            <FormField
                control={form.control}
                name="specificFields.peopleRequired"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('peopleRequired.label')}</FormLabel>
                        <FormControl>
                            <Input
                                type="number"
                                min={1}
                                max={5}
                                placeholder="2"
                                {...field}
                                onChange={(e) => field.onChange(e.target.valueAsNumber || 1)}
                            />
                        </FormControl>
                        <FormDescription>{t('peopleRequired.description')}</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Point de départ */}
            <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                <h4 className="font-medium">{t('departure.title')}</h4>
                
                <FormField
                    control={form.control}
                    name="specificFields.fromFloor"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('departure.floor.label')}</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    min={0}
                                    max={20}
                                    placeholder="0"
                                    {...field}
                                    onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                                />
                            </FormControl>
                            <FormDescription>{t('departure.floor.description')}</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="specificFields.fromHasElevator"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                                <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel>{t('departure.hasElevator')}</FormLabel>
                            </div>
                        </FormItem>
                    )}
                />
            </div>

            {/* Point d'arrivée */}
            <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                <h4 className="font-medium">{t('arrival.title')}</h4>
                
                <FormField
                    control={form.control}
                    name="specificFields.toFloor"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('arrival.floor.label')}</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    min={0}
                                    max={20}
                                    placeholder="0"
                                    {...field}
                                    onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                                />
                            </FormControl>
                            <FormDescription>{t('arrival.floor.description')}</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="specificFields.toHasElevator"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                                <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel>{t('arrival.hasElevator')}</FormLabel>
                            </div>
                        </FormItem>
                    )}
                />
            </div>

            {/* Véhicule nécessaire */}
            <FormField
                control={form.control}
                name="specificFields.vehicleNeeded"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('vehicleNeeded.label')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('vehicleNeeded.placeholder')} />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="client_has">{t('vehicleNeeded.client_has')}</SelectItem>
                                <SelectItem value="short_distance">{t('vehicleNeeded.short_distance')}</SelectItem>
                                <SelectItem value="provider_needed">{t('vehicleNeeded.provider_needed')}</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormDescription>{t('vehicleNeeded.description')}</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    );
}
