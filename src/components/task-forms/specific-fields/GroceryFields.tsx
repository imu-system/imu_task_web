/**
 * GroceryFields - Formulaire de champs spécifiques pour Courses Alimentaires
 * 
 * Catégorie: Courses & Livraisons > Courses Alimentaires
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
import { ShoppingCart } from 'lucide-react';

interface GroceryFieldsProps {
    form: UseFormReturn<any>;
}

export function GroceryFields({ form }: GroceryFieldsProps) {
    const t = useTranslations('TaskForms.Grocery');

    // Watch pour afficher conditionnellement certains champs
    const storeType = form.watch('specificFields.storeType');

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-2 pb-2 border-b">
                <ShoppingCart className="h-5 w-5 text-primary" />
                <div>
                    <h3 className="text-lg font-semibold">{t('title')}</h3>
                    <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
                </div>
            </div>

            {/* Type de magasin */}
            <FormField
                control={form.control}
                name="specificFields.storeType"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('storeType.label')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('storeType.placeholder')} />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="supermarket">{t('storeType.supermarket')}</SelectItem>
                                <SelectItem value="local_market">{t('storeType.localMarket')}</SelectItem>
                                <SelectItem value="bio_store">{t('storeType.bioStore')}</SelectItem>
                                <SelectItem value="other">{t('storeType.other')}</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormDescription>{t('storeType.description')}</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Nom du magasin */}
            <FormField
                control={form.control}
                name="specificFields.storeName"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('storeName.label')}</FormLabel>
                        <FormControl>
                            <Input placeholder={t('storeName.placeholder')} {...field} />
                        </FormControl>
                        <FormDescription>{t('storeName.description')}</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Liste de courses */}
            <FormField
                control={form.control}
                name="specificFields.shoppingList"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('shoppingList.label')}</FormLabel>
                        <FormControl>
                            <Textarea
                                placeholder={t('shoppingList.placeholder')}
                                className="resize-none"
                                rows={6}
                                {...field}
                            />
                        </FormControl>
                        <FormDescription>{t('shoppingList.description')}</FormDescription>
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

            {/* Besoins spécifiques (checkboxes) */}
            <FormField
                control={form.control}
                name="specificFields.specialNeeds"
                render={() => (
                    <FormItem>
                        <div className="mb-4">
                            <FormLabel>{t('specialNeeds.label')}</FormLabel>
                            <FormDescription>{t('specialNeeds.description')}</FormDescription>
                        </div>
                        {(['fresh', 'heavy', 'frozen'] as const).map((need) => (
                            <FormField
                                key={need}
                                control={form.control}
                                name="specificFields.specialNeeds"
                                render={({ field }) => {
                                    return (
                                        <FormItem
                                            key={need}
                                            className="flex flex-row items-start space-x-3 space-y-0"
                                        >
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value?.includes(need)}
                                                    onCheckedChange={(checked) => {
                                                        return checked
                                                            ? field.onChange([...(field.value || []), need])
                                                            : field.onChange(
                                                                  field.value?.filter((value: string) => value !== need)
                                                              );
                                                    }}
                                                />
                                            </FormControl>
                                            <FormLabel className="font-normal">
                                                {t(`specialNeeds.${need}`)}
                                            </FormLabel>
                                        </FormItem>
                                    );
                                }}
                            />
                        ))}
                    </FormItem>
                )}
            />

            {/* Méthode de paiement */}
            <FormField
                control={form.control}
                name="specificFields.paymentMethod"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('paymentMethod.label')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('paymentMethod.placeholder')} />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="cash">{t('paymentMethod.cash')}</SelectItem>
                                <SelectItem value="client_card">{t('paymentMethod.clientCard')}</SelectItem>
                                <SelectItem value="provider_advance">{t('paymentMethod.providerAdvance')}</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormDescription>{t('paymentMethod.description')}</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    );
}
