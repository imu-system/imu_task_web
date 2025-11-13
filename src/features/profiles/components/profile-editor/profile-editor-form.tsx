/**
 * Éditeur de Profil Public - Formulaire Principal
 * 
 * Permet au prestataire de modifier:
 * - Informations de base (nom, titre, bio)
 * - Localisation
 * - Catégories de services
 * - Compétences et langues
 * - Liens réseaux sociaux
 */

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { Loader2, Save, Globe, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { MultiSelect } from '@/components/ui/multi-select';
import { TagInput } from '@/components/ui/tag-input';
import { useToast } from '@/hooks/use-toast';
import { UpdatePublicProfileData } from '@/types/public-profile';

// Validation schema
const profileFormSchema = z.object({
  displayName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  headline: z.string().max(100, 'Le titre ne peut pas dépasser 100 caractères').optional(),
  bio: z.string().max(2000, 'La bio ne peut pas dépasser 2000 caractères').optional(),
  location: z.string().optional(),
  categories: z.array(z.string()).min(1, 'Sélectionnez au moins une catégorie'),
  skills: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  socialLinks: z.object({
    website: z.string().url('URL invalide').optional().or(z.literal('')),
    linkedin: z.string().url('URL invalide').optional().or(z.literal('')),
    instagram: z.string().optional(),
    facebook: z.string().optional(),
    twitter: z.string().optional(),
  }).optional(),
  metaTitle: z.string().max(60, 'Le titre SEO ne peut pas dépasser 60 caractères').optional(),
  metaDescription: z.string().max(160, 'La description SEO ne peut pas dépasser 160 caractères').optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface ProfileEditorFormProps {
  initialData?: Partial<ProfileFormValues>;
  onSave: (data: UpdatePublicProfileData) => Promise<void>;
  isSaving?: boolean;
}

// Options pour les catégories (à adapter selon vos catégories de services)
const CATEGORY_OPTIONS = [
  { value: 'aide-domicile', label: 'Aide à domicile & Petits travaux' },
  { value: 'courses-livraisons', label: 'Courses & Livraisons' },
  { value: 'aide-numerique', label: 'Aide Numérique & Administrative' },
  { value: 'demenagement', label: 'Déménagement & Manutention' },
  { value: 'accompagnement', label: 'Accompagnement & Présence' },
  { value: 'jardinage', label: 'Jardinage & Extérieur' },
  { value: 'animaux', label: 'Animaux de compagnie' },
  { value: 'evenements', label: 'Événements & Occasions spéciales' },
];

const LANGUAGE_OPTIONS = [
  { value: 'fr', label: 'Français' },
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'de', label: 'Deutsch' },
  { value: 'it', label: 'Italiano' },
  { value: 'pt', label: 'Português' },
  { value: 'ar', label: 'العربية' },
  { value: 'zh', label: '中文' },
  { value: 'ja', label: '日本語' },
];

export function ProfileEditorForm({ 
  initialData, 
  onSave, 
  isSaving = false 
}: ProfileEditorFormProps) {
  const t = useTranslations('ProfileEditor');
  const { toast } = useToast();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: initialData?.displayName || '',
      headline: initialData?.headline || '',
      bio: initialData?.bio || '',
      location: initialData?.location || '',
      categories: initialData?.categories || [],
      skills: initialData?.skills || [],
      languages: initialData?.languages || [],
      socialLinks: {
        website: initialData?.socialLinks?.website || '',
        linkedin: initialData?.socialLinks?.linkedin || '',
        instagram: initialData?.socialLinks?.instagram || '',
        facebook: initialData?.socialLinks?.facebook || '',
        twitter: initialData?.socialLinks?.twitter || '',
      },
      metaTitle: initialData?.metaTitle || '',
      metaDescription: initialData?.metaDescription || '',
    },
  });

  const handleSubmit = async (data: ProfileFormValues) => {
    try {
      await onSave(data);
      toast({
        title: t('saveSuccess'),
        description: t('saveSuccessDescription'),
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        variant: 'destructive',
        title: t('saveError'),
        description: t('saveErrorDescription'),
      });
    }
  };

  const bioLength = form.watch('bio')?.length || 0;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Informations de base */}
        <Card>
          <CardHeader>
            <CardTitle>{t('basicInfo.title')}</CardTitle>
            <CardDescription>{t('basicInfo.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Nom d'affichage */}
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('basicInfo.displayName')}</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Titre */}
            <FormField
              control={form.control}
              name="headline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('basicInfo.headline')}</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Développeur Web Full-Stack" 
                      {...field} 
                      maxLength={100}
                    />
                  </FormControl>
                  <FormDescription>
                    {t('basicInfo.headlineHelp')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Bio */}
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('basicInfo.bio')}</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder={t('basicInfo.bioPlaceholder')}
                      className="min-h-[150px]"
                      maxLength={2000}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {bioLength}/2000 {t('basicInfo.characters')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Localisation */}
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {t('basicInfo.location')}
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Paris, France" {...field} />
                  </FormControl>
                  <FormDescription>
                    {t('basicInfo.locationHelp')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Services & Compétences */}
        <Card>
          <CardHeader>
            <CardTitle>{t('services.title')}</CardTitle>
            <CardDescription>{t('services.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Catégories */}
            <FormField
              control={form.control}
              name="categories"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('services.categories')}</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={CATEGORY_OPTIONS}
                      selected={field.value || []}
                      onChange={field.onChange}
                      placeholder={t('services.categoriesPlaceholder')}
                    />
                  </FormControl>
                  <FormDescription>
                    {t('services.categoriesHelp')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Compétences */}
            <FormField
              control={form.control}
              name="skills"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('skills')}</FormLabel>
                  <FormControl>
                    <TagInput
                      tags={field.value || []}
                      onChange={field.onChange}
                      placeholder={t('skillsPlaceholder')}
                    />
                  </FormControl>
                  <FormDescription>{t('skillsDescription')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />            {/* Langues */}
            <FormField
              control={form.control}
              name="languages"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('services.languages')}</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={LANGUAGE_OPTIONS}
                      selected={field.value || []}
                      onChange={field.onChange}
                      placeholder={t('services.languagesPlaceholder')}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Liens Réseaux Sociaux */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              {t('social.title')}
            </CardTitle>
            <CardDescription>{t('social.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="socialLinks.website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('social.website')}</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="socialLinks.linkedin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>LinkedIn</FormLabel>
                  <FormControl>
                    <Input placeholder="https://linkedin.com/in/..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="socialLinks.instagram"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instagram</FormLabel>
                    <FormControl>
                      <Input placeholder="@username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="socialLinks.facebook"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Facebook</FormLabel>
                    <FormControl>
                      <Input placeholder="@username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="socialLinks.twitter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Twitter/X</FormLabel>
                    <FormControl>
                      <Input placeholder="@username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* SEO */}
        <Card>
          <CardHeader>
            <CardTitle>{t('seo.title')}</CardTitle>
            <CardDescription>{t('seo.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="metaTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('seo.metaTitle')}</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={t('seo.metaTitlePlaceholder')}
                      maxLength={60}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {field.value?.length || 0}/60 {t('basicInfo.characters')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="metaDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('seo.metaDescription')}</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder={t('seo.metaDescriptionPlaceholder')}
                      maxLength={160}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {field.value?.length || 0}/160 {t('basicInfo.characters')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button type="submit" disabled={isSaving} className="gap-2">
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t('saving')}
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {t('save')}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
