
'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Loader2, PlusCircle, Home, Trash2, Edit, MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import { Separator } from "@/components/ui/separator";

const profileSchema = z.object({
  displayName: z.string().min(2, "Le nom est requis."),
  bio: z.string().max(500, "La biographie ne peut pas dépasser 500 caractères.").optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

// Mock data for addresses
const mockAddresses = [
    { id: '1', label: 'Maison', formatted: '123 Rue Principale, 75001 Paris, France', isDefault: true },
    { id: '2', label: 'Travail', formatted: '456 Avenue des Champs-Élysées, 75008 Paris, France', isDefault: false },
]

export default function ProfilePage() {
  const { user, profileLoading } = useAuth();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const t = useTranslations('ProfilePage');

  const { register, handleSubmit, formState: { errors, isDirty }, reset } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
        displayName: '',
        bio: '',
    }
  });

  useEffect(() => {
    if (user?.profile) {
      reset({
        displayName: user.profile.displayName || '',
        bio: user.profile.bio || '',
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: ProfileFormValues) => {
    if (!user) return;
    setIsSaving(true);
    try {
      const profileRef = doc(db, "profiles", user.uid);
      await updateDoc(profileRef, {
        displayName: data.displayName,
        bio: data.bio,
      });
      toast({
        title: t('toastSuccessTitle'),
        description: t('toastSuccessDescription'),
      });
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
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          {t('title')}
        </h1>
        <p className="text-muted-foreground">
          {t('subtitle')}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>{t('personalInfo')}</CardTitle>
            <CardDescription>{t('personalInfoDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user.profile?.photoUrl || undefined} />
                <AvatarFallback>{user.profile?.displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <Button type="button" variant="outline">{t('changePhoto')}</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">{t('fullName')}</Label>
                <Input id="displayName" {...register('displayName')} />
                {errors.displayName && <p className="text-xs text-destructive mt-1">{errors.displayName.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t('emailAddress')}</Label>
                <Input id="email" type="email" defaultValue={user.email || ''} disabled />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">{t('bio')}</Label>
              <Textarea id="bio" placeholder={t('bioPlaceholder')} {...register('bio')} />
               {errors.bio && <p className="text-xs text-destructive mt-1">{errors.bio.message}</p>}
            </div>
            
             <div className="flex justify-end">
                <Button type="submit" disabled={isSaving || !isDirty}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t('saveChanges')}
                </Button>
            </div>
          </CardContent>
        </Card>
      </form>

       <Card>
            <CardHeader>
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <CardTitle>{t('addressesTitle')}</CardTitle>
                        <CardDescription>{t('addressesDesc')}</CardDescription>
                    </div>
                    <Button type="button" variant="outline">
                        <PlusCircle className="mr-2"/>
                        {t('addAddress')}
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {mockAddresses.map((address, index) => (
                    <div key={address.id}>
                        <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4">
                                <MapPin className="h-6 w-6 text-primary mt-1" />
                                <div>
                                    <p className="font-semibold">{address.label} {address.isDefault && <span className="text-xs text-muted-foreground">({t('default')})</span>}</p>
                                    <p className="text-sm text-muted-foreground">{address.formatted}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon">
                                    <Edit className="h-4 w-4"/>
                                    <span className="sr-only">{t('edit')}</span>
                                </Button>
                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                    <Trash2 className="h-4 w-4"/>
                                     <span className="sr-only">{t('delete')}</span>
                                </Button>
                            </div>
                        </div>
                        {index < mockAddresses.length - 1 && <Separator className="mt-4" />}
                    </div>
                ))}
            </CardContent>
        </Card>

    </div>
  );
}
