/**
 * HandlingFields - Formulaire de champs spécifiques pour Manutention Simple
 * 
 * Catégorie: Déménagement & Manutention > Manutention Simple
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
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Move } from 'lucide-react';

interface HandlingFieldsProps {
    form: UseFormReturn<any>;
}

export function HandlingFields({ form }: HandlingFieldsProps) {
    const t = useTranslations('TaskForms.Handling');

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-2 pb-2 border-b">
                <Move className="h-5 w-5 text-primary" />
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
                                <SelectItem value="move_furniture">{t('taskType.move_furniture')}</SelectItem>
                                <SelectItem value="to_cellar">{t('taskType.to_cellar')}</SelectItem>
                                <SelectItem value="carry_groceries">{t('taskType.carry_groceries')}</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormDescription>{t('taskType.description')}</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Description des objets */}
            <FormField
                control={form.control}
                name="specificFields.itemsDescription"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('itemsDescription.label')}</FormLabel>
                        <FormControl>
                            <Textarea
                                placeholder={t('itemsDescription.placeholder')}
                                className="resize-none"
                                rows={4}
                                {...field}
                            />
                        </FormControl>
                        <FormDescription>{t('itemsDescription.description')}</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Nombre d'étages */}
            <FormField
                control={form.control}
                name="specificFields.floorsCount"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('floorsCount.label')}</FormLabel>
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
                        <FormDescription>{t('floorsCount.description')}</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Ascenseur disponible */}
            <FormField
                control={form.control}
                name="specificFields.hasElevator"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                            <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                            />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                            <FormLabel>{t('hasElevator.label')}</FormLabel>
                            <FormDescription>{t('hasElevator.description')}</FormDescription>
                        </div>
                    </FormItem>
                )}
            />
        </div>
    );
}
