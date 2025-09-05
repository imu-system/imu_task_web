
'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth, profileSchema, ProfileFormValues } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Loader2, PlusCircle, Home, Trash2, Edit, MapPin, Star, Medal } from "lucide-react";
import { useTranslations } from "next-intl";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import AddressForm from "@/components/address-form";

// Helper function to split string by comma and trim whitespace
const stringToArray = (str: string | undefined | string[]): string[] => {
    if (Array.isArray(str)) return str;
    if (!str) return [];
    return str.split(',').map(item => item.trim()).filter(Boolean);
};

// Mock data for addresses
const mockAddresses = [
    { id: '1', label: 'Maison', formatted: '123 Rue Principale, 75001 Paris, France', isDefault: true },
    { id: '2', label: 'Travail', formatted: '456 Avenue des Champs-Élysées, 75008 Paris, France', isDefault: false },
]

export default function ProfilePage() {
  const { user, profileLoading } = useAuth();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
  const t = useTranslations('ProfilePage');

  const { register, handleSubmit, formState: { errors, isDirty }, reset } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
        displayName: '',
        bio: '',
        languages: [],
        skills: [],
    }
  });

  useEffect(() => {
    if (user?.profile) {
      reset({
        displayName: user.profile.displayName || '',
        bio: user.profile.bio || '',
        languages: user.profile.languages || [],
        skills: user.profile.skills || [],
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: ProfileFormValues) => {
    if (!user) return;
    setIsSaving(true);
    
    // The form gives us strings, we need to convert them to arrays
    const languagesArray = stringToArray(data.languages as string | string[]);
    const skillsArray = stringToArray(data.skills as string | string[]);

    try {
      const profileRef = doc(db, "profiles", user.uid);
      await updateDoc(profileRef, {
        displayName: data.displayName,
        bio: data.bio,
        languages: languagesArray,
        skills: skillsArray,
        updatedAt: serverTimestamp()
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
                <div className="flex flex-col sm:flex-row gap-6">
                    <div className="flex-shrink-0">
                        <Avatar className="h-24 w-24">
                            <AvatarImage src={user.profile?.photoUrl || undefined} />
                            <AvatarFallback>{user.profile?.displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <Button type="button" variant="outline" className="mt-2 w-full">{t('changePhoto')}</Button>
                    </div>
                    <div className="flex-grow space-y-4">
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
                </div>
                
                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center md:text-left">
                    <div className="p-4 bg-accent/50 rounded-lg">
                        <div className="flex items-center justify-center md:justify-start gap-2">
                            <Star className="h-5 w-5 text-yellow-500"/>
                            <p className="text-lg font-bold">{user.profile?.averageRating.toFixed(1) || '0.0'}</p>
                        </div>
                        <p className="text-sm text-muted-foreground">{t('averageRating')}</p>
                    </div>
                    <div className="p-4 bg-accent/50 rounded-lg">
                        <div className="flex items-center justify-center md:justify-start gap-2">
                            <Medal className="h-5 w-5 text-primary"/>
                            <p className="text-lg font-bold">{user.profile?.reviewsCount || 0}</p>
                        </div>
                         <p className="text-sm text-muted-foreground">{t('reviewsCount')}</p>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="bio">{t('bio')}</Label>
                    <Textarea id="bio" placeholder={t('bioPlaceholder')} {...register('bio')} />
                    {errors.bio && <p className="text-xs text-destructive mt-1">{errors.bio.message}</p>}
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                    <CardTitle className="text-xl">{t('providerInfo')}</CardTitle>
                     <div className="space-y-2">
                        <Label htmlFor="languages">{t('languages')}</Label>
                        <Input 
                            id="languages" 
                            {...register('languages')} 
                            placeholder={t('languagesPlaceholder')} 
                        />
                         <p className="text-xs text-muted-foreground">{t('commaSeparated')}</p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="skills">{t('skills')}</Label>
                        <Input 
                            id="skills" 
                            {...register('skills')} 
                            placeholder={t('skillsPlaceholder')}
                        />
                        <p className="text-xs text-muted-foreground">{t('commaSeparated')}</p>
                    </div>
                </div>

              </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button type="submit" disabled={isSaving || !isDirty}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t('saveChanges')}
                </Button>
            </div>
        </form>

        <Card>
            <CardHeader>
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <CardTitle>{t('addressesTitle')}</CardTitle>
                        <CardDescription>{t('addressesDesc')}</CardDescription>
                    </div>
                    <Dialog open={isAddressFormOpen} onOpenChange={setIsAddressFormOpen}>
                        <DialogTrigger asChild>
                            <Button type="button" variant="outline">
                                <PlusCircle className="mr-2"/>
                                {t('addAddress')}
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{t('addressForm.title')}</DialogTitle>
                            </DialogHeader>
                            <AddressForm 
                                onSave={(data) => console.log(data)}
                                onClose={() => setIsAddressFormOpen(false)}
                            />
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {mockAddresses.map((address, index) => (
                    <div key={address.id}>
                        <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4">
                                <MapPin className="h-6 w-6 text-primary mt-1" />
                                <div>
                                    <p className="font-semibold">{address.label}</p>
                                    <p className="text-sm text-muted-foreground">{address.formatted}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" className={address.isDefault ? "text-yellow-500 hover:text-yellow-600" : "text-muted-foreground hover:text-yellow-500"}>
                                    <Star className={`h-5 w-5 ${address.isDefault ? 'fill-current' : ''}`}/>
                                    <span className="sr-only">{t('setDefault')}</span>
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
                {mockAddresses.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">{t('noAddresses')}</p>
                )}
            </CardContent>
        </Card>
    </div>
  );
}

    