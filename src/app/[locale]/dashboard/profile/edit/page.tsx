

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth, profileSchema, ProfileFormValues } from '@/hooks/use-auth';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { Loader2, ArrowLeft, Camera } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter, Link } from '@/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { MultiSelect } from '@/components/ui/multi-select';
import { Slider } from '@/components/ui/slider';
import { TagInput } from '@/components/ui/tag-input';

const availableLanguages = [
    { value: 'fr', label: 'Français' },
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Español' },
    { value: 'de', label: 'Deutsch' },
    { value: 'it', label: 'Italiano' },
];

export default function ProfileEditPage() {
  const { user, profileLoading } = useAuth();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const t = useTranslations('ProfilePage');
  const router = useRouter();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
        displayName: '',
        bio: '',
        languages: [],
        skills: [],
        serviceRadiusKm: 0,
    }
  });

  useEffect(() => {
    if (user?.profile) {
      form.reset({
        displayName: user.profile.displayName || '',
        bio: user.profile.bio || '',
        languages: user.profile.languages || [],
        skills: user.profile.skills || [],
        serviceRadiusKm: user.profile.serviceRadiusKm || 0,
      });
    }
  }, [user, form]);

  const onSubmit = async (data: ProfileFormValues) => {
    if (!user) return;
    setIsSaving(true);
    
    try {
      const profileRef = doc(db, "profiles", user.uid);
      await updateDoc(profileRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
      toast({
        title: t('toastSuccessTitle'),
        description: t('toastSuccessDescription'),
      });
      router.push('/dashboard/profile');
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        variant: "destructive",
        title: t('toastErrorTitle'),
        description: t('toastErrorDescription'),
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (profileLoading || !user) {
    return (
        <div className="flex justify-center items-center h-64">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
    )
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
        <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
                <Link href="/dashboard/profile">
                    <ArrowLeft className="h-4 w-4"/>
                </Link>
            </Button>
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">
                {t('editProfile')}
                </h1>
                <p className="text-muted-foreground">
                {t('personalInfoDesc')}
                </p>
            </div>
        </div>

        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>{t('personalInfo')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center gap-6">
                            <Avatar className="h-24 w-24">
                                <AvatarImage src={user.profile?.photoUrl || undefined} />
                                <AvatarFallback className="text-3xl">{user.profile?.displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="space-y-2">
                                <Label htmlFor="photo">{t('changePhoto')}</Label>
                                <Input id="photo" type="file" />
                                <p className="text-xs text-muted-foreground">PNG, JPG, GIF jusqu'à 10MB.</p>
                            </div>
                        </div>
                        
                        <FormField
                            control={form.control}
                            name="displayName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('fullName')}</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                         <div className="space-y-2">
                            <Label htmlFor="email">{t('emailAddress')}</Label>
                            <Input id="email" type="email" defaultValue={user.email || ''} disabled />
                        </div>
                        
                        <FormField
                            control={form.control}
                            name="bio"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('bio')}</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder={t('bioPlaceholder')} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        
                        <Separator />
                        
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">{t('providerInfo')}</h3>
                            <FormField
                                control={form.control}
                                name="languages"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('languages')}</FormLabel>
                                        <MultiSelect
                                            options={availableLanguages}
                                            selected={field.value}
                                            onChange={field.onChange}
                                            placeholder={t('languagesPlaceholder')}
                                        />
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="skills"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('skills')}</FormLabel>
                                         <TagInput
                                            tags={field.value}
                                            onChange={field.onChange}
                                            placeholder={t('skillsPlaceholder')}
                                        />
                                        <p className="text-xs text-muted-foreground">{t('commaSeparated')}</p>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="serviceRadiusKm"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('serviceRadius')} : {field.value || 0} km</FormLabel>
                                        <FormControl>
                                            <Slider
                                                defaultValue={[field.value || 0]}
                                                max={100}
                                                step={1}
                                                onValueChange={(value) => field.onChange(value[0])}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="ghost" asChild>
                                <Link href="/dashboard/profile">{t('addressForm.cancel')}</Link>
                            </Button>
                            <Button type="submit" disabled={isSaving}>
                                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {t('saveChanges')}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </Form>
    </div>
  );
}
