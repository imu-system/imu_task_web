/**
 * EventHelpFields - Formulaire de champs spécifiques pour Soutien Logistique Événementiel
 * 
 * Catégorie: Événements & Occasions Spéciales > Soutien Logistique Événementiel
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
import { PartyPopper } from 'lucide-react';

interface EventHelpFieldsProps {
    form: UseFormReturn<any>;
}

export function EventHelpFields({ form }: EventHelpFieldsProps) {
    const t = useTranslations('TaskForms.EventHelp');

    const serviceOptions = [
        { value: 'setup', label: t('serviceType.setup') },
        { value: 'cleanup', label: t('serviceType.cleanup') },
        { value: 'serving', label: t('serviceType.serving') },
        { value: 'greeting', label: t('serviceType.greeting') },
        { value: 'preparation', label: t('serviceType.preparation') },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-2 pb-2 border-b">
                <PartyPopper className="h-5 w-5 text-primary" />
                <div>
                    <h3 className="text-lg font-semibold">{t('title')}</h3>
                    <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
                </div>
            </div>

            {/* Type d'événement */}
            <FormField
                control={form.control}
                name="specificFields.eventType"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('eventType.label')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('eventType.placeholder')} />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="birthday">{t('eventType.birthday')}</SelectItem>
                                <SelectItem value="family_reception">{t('eventType.family_reception')}</SelectItem>
                                <SelectItem value="association">{t('eventType.association')}</SelectItem>
                                <SelectItem value="small_business">{t('eventType.small_business')}</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormDescription>{t('eventType.description')}</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Nombre d'invités */}
            <FormField
                control={form.control}
                name="specificFields.guestCount"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('guestCount.label')}</FormLabel>
                        <FormControl>
                            <Input
                                type="number"
                                min={1}
                                max={200}
                                placeholder="20"
                                {...field}
                                onChange={(e) => field.onChange(e.target.valueAsNumber || 10)}
                            />
                        </FormControl>
                        <FormDescription>{t('guestCount.description')}</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Type de service */}
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
                                min={1}
                                max={12}
                                placeholder="4"
                                {...field}
                                onChange={(e) => field.onChange(e.target.valueAsNumber || 4)}
                            />
                        </FormControl>
                        <FormDescription>{t('duration.description')}</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Équipement lourd */}
            <FormField
                control={form.control}
                name="specificFields.heavyEquipment"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('heavyEquipment.label')}</FormLabel>
                        <FormControl>
                            <Textarea
                                placeholder={t('heavyEquipment.placeholder')}
                                className="resize-none"
                                rows={3}
                                {...field}
                            />
                        </FormControl>
                        <FormDescription>{t('heavyEquipment.description')}</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    );
}
