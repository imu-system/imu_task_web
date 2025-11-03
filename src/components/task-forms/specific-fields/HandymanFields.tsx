/**
 * HandymanFields - Formulaire de champs spécifiques pour Petit Bricolage & Assemblage
 * 
 * Catégorie: Aide à Domicile & Petits Travaux > Petit Bricolage & Assemblage
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
import { Wrench } from 'lucide-react';

interface HandymanFieldsProps {
    form: UseFormReturn<any>;
}

export function HandymanFields({ form }: HandymanFieldsProps) {
    const t = useTranslations('TaskForms.Handyman');

    // Watch pour afficher conditionnellement certains champs
    const taskType = form.watch('specificFields.taskType');

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-2 pb-2 border-b">
                <Wrench className="h-5 w-5 text-primary" />
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
                                <SelectItem value="assemble">{t('taskType.assemble')}</SelectItem>
                                <SelectItem value="hang">{t('taskType.hang')}</SelectItem>
                                <SelectItem value="fix">{t('taskType.fix')}</SelectItem>
                                <SelectItem value="install">{t('taskType.install')}</SelectItem>
                                <SelectItem value="repair">{t('taskType.repair')}</SelectItem>
                                <SelectItem value="other">{t('taskType.other')}</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormDescription>{t('taskType.description')}</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Détails du meuble (si assemblage) */}
            {taskType === 'assemble' && (
                <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                    <h4 className="font-medium">{t('furnitureDetails.title')}</h4>
                    
                    <FormField
                        control={form.control}
                        name="specificFields.furnitureDetails.brand"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('furnitureDetails.brand.label')}</FormLabel>
                                <FormControl>
                                    <Input placeholder={t('furnitureDetails.brand.placeholder')} {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="specificFields.furnitureDetails.type"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('furnitureDetails.type.label')}</FormLabel>
                                <FormControl>
                                    <Input placeholder={t('furnitureDetails.type.placeholder')} {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="specificFields.furnitureDetails.packageCount"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('furnitureDetails.packageCount.label')}</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min={1}
                                        placeholder="1"
                                        {...field}
                                        onChange={(e) => field.onChange(e.target.valueAsNumber || 1)}
                                    />
                                </FormControl>
                                <FormDescription>{t('furnitureDetails.packageCount.description')}</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="specificFields.furnitureDetails.size"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('furnitureDetails.size.label')}</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('furnitureDetails.size.placeholder')} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="small">{t('furnitureDetails.size.small')}</SelectItem>
                                        <SelectItem value="medium">{t('furnitureDetails.size.medium')}</SelectItem>
                                        <SelectItem value="large">{t('furnitureDetails.size.large')}</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            )}

            {/* Outils fournis par */}
            <FormField
                control={form.control}
                name="specificFields.toolsProvidedBy"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('toolsProvidedBy.label')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('toolsProvidedBy.placeholder')} />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="client">{t('toolsProvidedBy.client')}</SelectItem>
                                <SelectItem value="provider">{t('toolsProvidedBy.provider')}</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormDescription>{t('toolsProvidedBy.description')}</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Hauteur de travail */}
            <FormField
                control={form.control}
                name="specificFields.workHeight"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('workHeight.label')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('workHeight.placeholder')} />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="ground">{t('workHeight.ground')}</SelectItem>
                                <SelectItem value="medium">{t('workHeight.medium')}</SelectItem>
                                <SelectItem value="high">{t('workHeight.high')}</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormDescription>{t('workHeight.description')}</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Type de mur (si fixation) */}
            {(taskType === 'hang' || taskType === 'fix') && (
                <FormField
                    control={form.control}
                    name="specificFields.wallType"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('wallType.label')}</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('wallType.placeholder')} />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="plaster">{t('wallType.plaster')}</SelectItem>
                                    <SelectItem value="concrete">{t('wallType.concrete')}</SelectItem>
                                    <SelectItem value="wood">{t('wallType.wood')}</SelectItem>
                                    <SelectItem value="unknown">{t('wallType.unknown')}</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormDescription>{t('wallType.description')}</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            )}

            {/* Détails matériaux (optionnel) */}
            <FormField
                control={form.control}
                name="specificFields.materialDetails"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('materialDetails.label')}</FormLabel>
                        <FormControl>
                            <Textarea
                                placeholder={t('materialDetails.placeholder')}
                                className="resize-none"
                                rows={4}
                                {...field}
                            />
                        </FormControl>
                        <FormDescription>{t('materialDetails.description')}</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    );
}
