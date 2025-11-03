/**
 * PackageFields - Formulaire de champs spécifiques pour Retrait/Dépôt de Colis
 * 
 * Catégorie: Courses & Livraisons > Retrait/Dépôt de Colis
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
import { Package } from 'lucide-react';

interface PackageFieldsProps {
    form: UseFormReturn<any>;
}

export function PackageFields({ form }: PackageFieldsProps) {
    const t = useTranslations('TaskForms.Package');

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-2 pb-2 border-b">
                <Package className="h-5 w-5 text-primary" />
                <div>
                    <h3 className="text-lg font-semibold">{t('title')}</h3>
                    <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
                </div>
            </div>

            {/* Type de service */}
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
                                <SelectItem value="pickup">{t('serviceType.pickup')}</SelectItem>
                                <SelectItem value="dropoff">{t('serviceType.dropoff')}</SelectItem>
                                <SelectItem value="mail">{t('serviceType.mail')}</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormDescription>{t('serviceType.description')}</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Nom du lieu */}
            <FormField
                control={form.control}
                name="specificFields.locationName"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('locationName.label')}</FormLabel>
                        <FormControl>
                            <Input placeholder={t('locationName.placeholder')} {...field} />
                        </FormControl>
                        <FormDescription>{t('locationName.description')}</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Adresse du lieu */}
            <FormField
                control={form.control}
                name="specificFields.locationAddress"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('locationAddress.label')}</FormLabel>
                        <FormControl>
                            <Input placeholder={t('locationAddress.placeholder')} {...field} />
                        </FormControl>
                        <FormDescription>{t('locationAddress.description')}</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Taille du colis */}
            <FormField
                control={form.control}
                name="specificFields.packageSize"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('packageSize.label')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('packageSize.placeholder')} />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="small">{t('packageSize.small')}</SelectItem>
                                <SelectItem value="medium">{t('packageSize.medium')}</SelectItem>
                                <SelectItem value="large_heavy">{t('packageSize.large_heavy')}</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormDescription>{t('packageSize.description')}</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Numéro de suivi */}
            <FormField
                control={form.control}
                name="specificFields.trackingNumber"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('trackingNumber.label')}</FormLabel>
                        <FormControl>
                            <Input placeholder={t('trackingNumber.placeholder')} {...field} />
                        </FormControl>
                        <FormDescription>{t('trackingNumber.description')}</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Modalité de paiement */}
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
                                <SelectItem value="provider_advance">{t('paymentMethod.provider_advance')}</SelectItem>
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
