/**
 * CompanionshipFields - Formulaire de champs spécifiques pour Compagnie & Loisirs
 * 
 * Catégorie: Accompagnement & Présence > Compagnie & Loisirs
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
import { Heart } from 'lucide-react';

interface CompanionshipFieldsProps {
    form: UseFormReturn<any>;
}

export function CompanionshipFields({ form }: CompanionshipFieldsProps) {
    const t = useTranslations('TaskForms.Companionship');

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-2 pb-2 border-b">
                <Heart className="h-5 w-5 text-primary" />
                <div>
                    <h3 className="text-lg font-semibold">{t('title')}</h3>
                    <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
                </div>
            </div>

            {/* Type d'activité */}
            <FormField
                control={form.control}
                name="specificFields.activityType"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('activityType.label')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('activityType.placeholder')} />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="conversation">{t('activityType.conversation')}</SelectItem>
                                <SelectItem value="reading">{t('activityType.reading')}</SelectItem>
                                <SelectItem value="games">{t('activityType.games')}</SelectItem>
                                <SelectItem value="cultural">{t('activityType.cultural')}</SelectItem>
                                <SelectItem value="walk">{t('activityType.walk')}</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormDescription>{t('activityType.description')}</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Durée */}
            <FormField
                control={form.control}
                name="specificFields.duration"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('duration.label')}</FormLabel>
                        <FormControl>
                            <Input
                                type="number"
                                min={30}
                                step={30}
                                placeholder="120"
                                {...field}
                                onChange={(e) => field.onChange(e.target.valueAsNumber || 120)}
                            />
                        </FormControl>
                        <FormDescription>{t('duration.description')}</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Centres d'intérêt du client */}
            <FormField
                control={form.control}
                name="specificFields.clientInterests"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('clientInterests.label')}</FormLabel>
                        <FormControl>
                            <Textarea
                                placeholder={t('clientInterests.placeholder')}
                                className="resize-none"
                                rows={4}
                                {...field}
                            />
                        </FormControl>
                        <FormDescription>{t('clientInterests.description')}</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    );
}
