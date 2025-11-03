/**
 * CleaningFields - Formulaire de champs spécifiques pour Ménage & Entretien
 * 
 * Catégorie: Aide à Domicile & Petits Travaux > Ménage & Entretien
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
import { Sparkles } from 'lucide-react';

interface CleaningFieldsProps {
    form: UseFormReturn<any>;
}

export function CleaningFields({ form }: CleaningFieldsProps) {
    const t = useTranslations('TaskForms.Cleaning');

    // Watch pour afficher conditionnellement certains champs
    const propertyType = form.watch('specificFields.propertyType');
    const serviceType = form.watch('specificFields.serviceType');

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-2 pb-2 border-b">
                <Sparkles className="h-5 w-5 text-primary" />
                <div>
                    <h3 className="text-lg font-semibold">{t('title')}</h3>
                    <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
                </div>
            </div>

            {/* Type de lieu */}
            <FormField
                control={form.control}
                name="specificFields.propertyType"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('propertyType.label')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('propertyType.placeholder')} />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="apartment">{t('propertyType.apartment')}</SelectItem>
                                <SelectItem value="house">{t('propertyType.house')}</SelectItem>
                                <SelectItem value="office">{t('propertyType.office')}</SelectItem>
                                <SelectItem value="other">{t('propertyType.other')}</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormDescription>{t('propertyType.description')}</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Champ texte si "Autre" */}
            {propertyType === 'other' && (
                <FormField
                    control={form.control}
                    name="specificFields.propertyTypeOther"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('propertyTypeOther.label')}</FormLabel>
                            <FormControl>
                                <Input placeholder={t('propertyTypeOther.placeholder')} {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            )}

            {/* Surface estimée */}
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
                                <SelectItem value="under_30">{t('surfaceArea.under30')}</SelectItem>
                                <SelectItem value="30_60">{t('surfaceArea.30to60')}</SelectItem>
                                <SelectItem value="60_100">{t('surfaceArea.60to100')}</SelectItem>
                                <SelectItem value="over_100">{t('surfaceArea.over100')}</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormDescription>{t('surfaceArea.description')}</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Nombre de pièces */}
            <div className="space-y-3">
                <FormLabel>{t('rooms.label')}</FormLabel>
                <div className="grid grid-cols-3 gap-4">
                    <FormField
                        control={form.control}
                        name="specificFields.roomsCount.bedrooms"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-sm">{t('rooms.bedrooms')}</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min={0}
                                        placeholder="0"
                                        {...field}
                                        onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="specificFields.roomsCount.bathrooms"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-sm">{t('rooms.bathrooms')}</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min={0}
                                        placeholder="0"
                                        {...field}
                                        onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="specificFields.roomsCount.toilets"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-sm">{t('rooms.toilets')}</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min={0}
                                        placeholder="0"
                                        {...field}
                                        onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <p className="text-sm text-muted-foreground">{t('rooms.description')}</p>
            </div>

            {/* Type de prestation */}
            <FormField
                control={form.control}
                name="specificFields.serviceType"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('serviceType.label')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('serviceType.placeholder')} />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="one_time">{t('serviceType.oneTime')}</SelectItem>
                                <SelectItem value="deep_clean">{t('serviceType.deepClean')}</SelectItem>
                                <SelectItem value="moving_clean">{t('serviceType.movingClean')}</SelectItem>
                                <SelectItem value="specific">{t('serviceType.specific')}</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormDescription>{t('serviceType.description')}</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Tâches spécifiques (si "Nettoyage spécifique") */}
            {serviceType === 'specific' && (
                <FormField
                    control={form.control}
                    name="specificFields.specificCleaningTasks"
                    render={() => (
                        <FormItem>
                            <div className="mb-4">
                                <FormLabel>{t('specificTasks.label')}</FormLabel>
                                <FormDescription>{t('specificTasks.description')}</FormDescription>
                            </div>
                            {(['windows', 'oven', 'fridge'] as const).map((task) => (
                                <FormField
                                    key={task}
                                    control={form.control}
                                    name="specificFields.specificCleaningTasks"
                                    render={({ field }) => {
                                        return (
                                            <FormItem
                                                key={task}
                                                className="flex flex-row items-start space-x-3 space-y-0"
                                            >
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value?.includes(task)}
                                                        onCheckedChange={(checked) => {
                                                            return checked
                                                                ? field.onChange([...(field.value || []), task])
                                                                : field.onChange(
                                                                      field.value?.filter((value: string) => value !== task)
                                                                  );
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormLabel className="font-normal">
                                                    {t(`specificTasks.${task}`)}
                                                </FormLabel>
                                            </FormItem>
                                        );
                                    }}
                                />
                            ))}
                        </FormItem>
                    )}
                />
            )}

            {/* Fréquence */}
            <FormField
                control={form.control}
                name="specificFields.frequency"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('frequency.label')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('frequency.placeholder')} />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="one_time">{t('frequency.oneTime')}</SelectItem>
                                <SelectItem value="weekly">{t('frequency.weekly')}</SelectItem>
                                <SelectItem value="biweekly">{t('frequency.biweekly')}</SelectItem>
                                <SelectItem value="monthly">{t('frequency.monthly')}</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormDescription>{t('frequency.description')}</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Matériel fourni par */}
            <FormField
                control={form.control}
                name="specificFields.materialsProvidedBy"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('materialsProvidedBy.label')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('materialsProvidedBy.placeholder')} />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="client">{t('materialsProvidedBy.client')}</SelectItem>
                                <SelectItem value="provider">{t('materialsProvidedBy.provider')}</SelectItem>
                                <SelectItem value="provider_paid">{t('materialsProvidedBy.providerPaid')}</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormDescription>{t('materialsProvidedBy.description')}</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Accès */}
            <FormField
                control={form.control}
                name="specificFields.access"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('access.label')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('access.placeholder')} />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="easy">{t('access.easy')}</SelectItem>
                                <SelectItem value="difficult">{t('access.difficult')}</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormDescription>{t('access.description')}</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Détails d'accès (optionnel) */}
            <FormField
                control={form.control}
                name="specificFields.accessDetails"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('accessDetails.label')}</FormLabel>
                        <FormControl>
                            <Textarea
                                placeholder={t('accessDetails.placeholder')}
                                className="resize-none"
                                rows={3}
                                {...field}
                            />
                        </FormControl>
                        <FormDescription>{t('accessDetails.description')}</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    );
}
