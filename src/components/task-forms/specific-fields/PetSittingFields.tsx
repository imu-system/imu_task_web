/**
 * PetSittingFields - Formulaire de champs spécifiques pour Garde d'Animaux à Domicile
 * 
 * Catégorie: Animaux de Compagnie > Garde d'Animaux à Domicile
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
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Cat } from 'lucide-react';

interface PetSittingFieldsProps {
    form: UseFormReturn<any>;
}

export function PetSittingFields({ form }: PetSittingFieldsProps) {
    const t = useTranslations('TaskForms.PetSitting');

    const tasksOptions = [
        { value: 'feeding', label: t('tasks.feeding') },
        { value: 'litter', label: t('tasks.litter') },
        { value: 'play', label: t('tasks.play') },
        { value: 'medication', label: t('tasks.medication') },
        { value: 'water_plants', label: t('tasks.water_plants') },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-2 pb-2 border-b">
                <Cat className="h-5 w-5 text-primary" />
                <div>
                    <h3 className="text-lg font-semibold">{t('title')}</h3>
                    <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
                </div>
            </div>

            {/* Type d'animal */}
            <FormField
                control={form.control}
                name="specificFields.petType"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('petType.label')}</FormLabel>
                        <FormControl>
                            <Input placeholder={t('petType.placeholder')} {...field} />
                        </FormControl>
                        <FormDescription>{t('petType.description')}</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Nombre d'animaux */}
            <FormField
                control={form.control}
                name="specificFields.petCount"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('petCount.label')}</FormLabel>
                        <FormControl>
                            <Input
                                type="number"
                                min={1}
                                max={10}
                                placeholder="1"
                                {...field}
                                onChange={(e) => field.onChange(e.target.valueAsNumber || 1)}
                            />
                        </FormControl>
                        <FormDescription>{t('petCount.description')}</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Dates d'absence */}
            <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                <h4 className="font-medium">{t('absence.title')}</h4>
                
                <FormField
                    control={form.control}
                    name="specificFields.absenceStartDate"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('absence.startDate')}</FormLabel>
                            <FormControl>
                                <Input
                                    type="date"
                                    {...field}
                                    value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : field.value || ''}
                                    onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="specificFields.absenceEndDate"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('absence.endDate')}</FormLabel>
                            <FormControl>
                                <Input
                                    type="date"
                                    {...field}
                                    value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : field.value || ''}
                                    onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            {/* Fréquence des visites */}
            <FormField
                control={form.control}
                name="specificFields.visitsPerDay"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('visitsPerDay.label')}</FormLabel>
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
                        <FormDescription>{t('visitsPerDay.description')}</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Tâches à effectuer */}
            <FormField
                control={form.control}
                name="specificFields.tasks"
                render={() => (
                    <FormItem>
                        <FormLabel>{t('tasks.label')}</FormLabel>
                        <FormDescription>{t('tasks.description')}</FormDescription>
                        <div className="grid grid-cols-2 gap-4 mt-2">
                            {tasksOptions.map((task) => (
                                <FormField
                                    key={task.value}
                                    control={form.control}
                                    name="specificFields.tasks"
                                    render={({ field }) => {
                                        return (
                                            <FormItem
                                                key={task.value}
                                                className="flex flex-row items-start space-x-3 space-y-0"
                                            >
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value?.includes(task.value)}
                                                        onCheckedChange={(checked) => {
                                                            return checked
                                                                ? field.onChange([...(field.value || []), task.value])
                                                                : field.onChange(
                                                                      field.value?.filter(
                                                                          (value: string) => value !== task.value
                                                                      )
                                                                  );
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormLabel className="font-normal cursor-pointer">
                                                    {task.label}
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
        </div>
    );
}
