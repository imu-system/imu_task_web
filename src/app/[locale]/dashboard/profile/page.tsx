
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
import { Loader2, PlusCircle, Home, Trash2, Edit, MapPin, Star, Medal, Languages, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import AddressForm from "@/components/address-form";
import { Badge } from "@/components/ui/badge";

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
      
      <Card>
          <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                    <Avatar className="h-28 w-28">
                        <AvatarImage src={user.profile?.photoUrl || undefined} />
                        <AvatarFallback className="text-3xl">{user.profile?.displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                        <CardTitle className="text-3xl">{user.profile?.displayName}</CardTitle>
                        <p className="text-muted-foreground">{user.profile?.bio || t('noBio')}</p>
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-muted-foreground pt-2">
                             {user.profile?.languages && user.profile.languages.length > 0 && (
                                <div className="flex items-center gap-2">
                                    <Languages className="h-4 w-4"/>
                                    <span>{user.profile.languages.join(', ')}</span>
                                </div>
                            )}
                             {user.profile?.city && (
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4"/>
                                    <span>{user.profile.city}</span>
                                </div>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-2 pt-2 justify-center sm:justify-start">
                            {user.profile?.verifiedBadges?.map(badge => (
                                <Badge key={badge} variant="secondary" className="bg-green-100 text-green-800">
                                    <ShieldCheck className="h-4 w-4 mr-1"/>
                                    {badge}
                                </Badge>
                            ))}
                            {user.profile?.skills?.map(skill => (
                                <Badge key={skill}>{skill}</Badge>
                            ))}
                        </div>
                    </div>
              </div>
          </CardContent>
      </Card>
      
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center md:text-left">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">{t('averageRating')}</CardTitle>
                    <Star className="h-4 w-4 text-muted-foreground"/>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{user.profile?.averageRating.toFixed(1) || 'N/A'}</div>
                    <p className="text-xs text-muted-foreground">{t('basedOn', {count: user.profile?.reviewsCount || 0})}</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">{t('completedMissions')}</CardTitle>
                    <Medal className="h-4 w-4 text-muted-foreground"/>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">12</div>
                    <p className="text-xs text-muted-foreground">{t('totalCompleted')}</p>
                </CardContent>
            </Card>
        </div>


        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>{t('editProfile')}</CardTitle>
                <CardDescription>{t('personalInfoDesc')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                 <div className="space-y-2">
                    <Label htmlFor="displayName">{t('fullName')}</Label>
                    <Input id="displayName" {...register('displayName')} />
                    {errors.displayName && <p className="text-xs text-destructive mt-1">{errors.displayName.message}</p>}
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="email">{t('emailAddress')}</Label>
                    <Input id="email" type="email" defaultValue={user.email || ''} disabled />
                </div>
                
                <div className="space-y-2">
                    <Label htmlFor="bio">{t('bio')}</Label>
                    <Textarea id="bio" placeholder={t('bioPlaceholder')} {...register('bio')} />
                    {errors.bio && <p className="text-xs text-destructive mt-1">{errors.bio.message}</p>}
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">{t('providerInfo')}</h3>
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
