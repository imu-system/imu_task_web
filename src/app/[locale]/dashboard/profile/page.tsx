

'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth, profileSchema, ProfileFormValues } from "@/hooks/use-auth";
import { UserRole } from "@/lib/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Loader2, PlusCircle, Home, Trash2, Edit, MapPin, Star, Medal, Languages, ShieldCheck, Camera, Lock, SatelliteDish, UserRound, Briefcase, Link as LinkIcon, File as FileIcon, GripVertical } from "lucide-react";
import { useTranslations } from "next-intl";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import AddressForm from "@/components/address-form";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/navigation";
import { Award, Shield } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { MultiSelect } from "@/components/ui/multi-select";
import { TagInput } from "@/components/ui/tag-input";
import { Form, FormControl, FormField } from "@/components/ui/form";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";


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
];

const mockEarnedBadges = [
    { id: 'b1', name: 'Starter', date: '2025-09-13', icon: <Award className="h-4 w-4"/> },
    { id: 'b2', name: 'Communicator Pro', date: '2025-09-20', icon: <Medal className="h-4 w-4"/> },
    { id: 'b3', name: 'Verified', date: '2025-09-10', icon: <Shield className="h-4 w-4"/> }
];

const mockPortfolioItems = [
    { id: 'p1', title: 'Logo pour une startup food-tech', type: 'file', url: 'https://picsum.photos/seed/logo/400/300', description: 'Création d\'une identité visuelle complète.' },
    { id: 'p2', title: 'Site vitrine en React', type: 'link', url: 'https://example.com', description: 'Développement d\'un site performant avec Next.js.' },
];

const availableLanguages = [
    { value: 'fr', label: 'Français' },
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Español' },
    { value: 'de', label: 'Deutsch' },
    { value: 'it', label: 'Italiano' },
];


const PortfolioItemForm = ({ onSave, onClose, item }: { onSave: (data: any) => void; onClose: () => void; item?: any; }) => {
    const t = useTranslations('ProfilePage.portfolio.form');
    const [itemType, setItemType] = useState<'link' | 'file'>(item?.type || 'link');

    // This would be a more complex form with its own state and validation
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({}); // Pass form data here
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="portfolio-title">{t('titleLabel')}</Label>
                <Input id="portfolio-title" placeholder={t('titlePlaceholder')} defaultValue={item?.title} required />
            </div>
            <div className="space-y-2">
                <Label>{t('typeLabel')}</Label>
                <RadioGroup defaultValue={itemType} onValueChange={(value) => setItemType(value as 'link' | 'file')}>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="link" id="type-link" />
                        <Label htmlFor="type-link" className="flex items-center gap-2">
                            <LinkIcon className="h-4 w-4" />
                            {t('typeLink')}
                        </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="file" id="type-file" />
                        <Label htmlFor="type-file" className="flex items-center gap-2">
                            <FileIcon className="h-4 w-4" />
                            {t('typeFile')}
                        </Label>
                    </div>
                </RadioGroup>
            </div>

            {itemType === 'link' ? (
                 <div className="space-y-2">
                    <Label htmlFor="portfolio-url">{t('urlLabel')}</Label>
                    <Input id="portfolio-url" type="url" placeholder="https://..." defaultValue={item?.url} required />
                </div>
            ) : (
                <div className="space-y-2">
                    <Label htmlFor="portfolio-file">{t('fileLabel')}</Label>
                    <Input id="portfolio-file" type="file" required={!item} />
                    {item && <p className="text-xs text-muted-foreground">{t('fileCurrent', { file: 'logo.png' })}</p>}
                </div>
            )}

            <div className="space-y-2">
                <Label htmlFor="portfolio-description">{t('descriptionLabel')}</Label>
                <Textarea id="portfolio-description" placeholder={t('descriptionPlaceholder')} defaultValue={item?.description} maxLength={300} />
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="ghost">{t('cancel')}</Button>
                </DialogClose>
                <Button type="submit">{t('save')}</Button>
            </DialogFooter>
        </form>
    );
};


export default function ProfilePage() {
  const { user, profileLoading } = useAuth();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
  const [isPortfolioFormOpen, setIsPortfolioFormOpen] = useState(false);
  const [editingPortfolioItem, setEditingPortfolioItem] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const t = useTranslations('ProfilePage');

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
  
  const { register, handleSubmit, formState: { errors, isDirty }, reset } = form;


  useEffect(() => {
    if (user?.profile) {
      reset({
        displayName: user.profile.displayName || '',
        bio: user.profile.bio || '',
        languages: user.profile.languages || [],
        skills: user.profile.skills || [],
        serviceRadiusKm: user.profile.serviceRadiusKm || 0,
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
        serviceRadiusKm: data.serviceRadiusKm,
        updatedAt: serverTimestamp()
      });
      toast({
        title: t('toastSuccessTitle'),
        description: t('toastSuccessDescription'),
      });
      setIsEditing(false); // Go back to view mode on successful save
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

  const handleQuickSave = async (field: 'languages' | 'skills', value: string[]) => {
      if(!user) return;
      
      const profileRef = doc(db, 'profiles', user.uid);
      try {
          await updateDoc(profileRef, {
              [field]: value,
              updatedAt: serverTimestamp()
          });
          toast({
              title: t('toastSuccessTitle'),
          })
      } catch (error) {
           toast({
              variant: "destructive",
              title: t('toastErrorTitle'),
            });
      }
  }

  const handleSavePortfolioItem = (data: any) => {
    console.log("Saving portfolio item:", data);
    toast({ title: "Réalisation ajoutée", description: "Votre nouvelle réalisation a été ajoutée à votre portfolio."});
    setIsPortfolioFormOpen(false);
    setEditingPortfolioItem(null);
  };

  const handleEditPortfolioItem = (item: any) => {
    setEditingPortfolioItem(item);
    setIsPortfolioFormOpen(true);
  }
  
  const handleDeletePortfolioItem = (itemId: string) => {
      console.log(`Deleting item ${itemId}`);
      toast({
          variant: "destructive",
          title: "Réalisation supprimée",
          description: "La réalisation a été supprimée de votre portfolio."
      });
  }

  if (profileLoading || !user) {
    return (
        <div className="flex justify-center items-center h-64">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
    )
  }
  
  if (isEditing) {
    return (
        <div className="space-y-8 max-w-4xl mx-auto">
             <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">
                {t('editProfile')}
                </h1>
                <p className="text-muted-foreground">
                {t('personalInfoDesc')}
                </p>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
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
                    <div className="space-y-2">
                        <Label htmlFor="serviceRadiusKm">{t('serviceRadius')}</Label>
                        <Input 
                            id="serviceRadiusKm" 
                            type="number"
                            {...register('serviceRadiusKm')} 
                            placeholder={t('serviceRadiusPlaceholder')}
                        />
                         {errors.serviceRadiusKm && <p className="text-xs text-destructive mt-1">{errors.serviceRadiusKm.message}</p>}
                    </div>
                </div>

                <Separator />
                
                 <div className="space-y-4">
                    <h3 className="text-lg font-medium">{t('portfolio.title')}</h3>
                    <div className="space-y-2">
                        {mockPortfolioItems.map(item => (
                            <div key={item.id} className="group flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                                <div className="flex items-center gap-3">
                                    <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                                    {item.type === 'link' ? <LinkIcon className="h-5 w-5 text-muted-foreground" /> : <FileIcon className="h-5 w-5 text-muted-foreground" />}
                                    <span className="font-medium">{item.title}</span>
                                </div>
                                <div className="hidden group-hover:flex items-center gap-1">
                                    <Button type="button" variant="ghost" size="icon" onClick={() => handleEditPortfolioItem(item)}>
                                        <Edit className="h-4 w-4"/>
                                    </Button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button type="button" variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                                <Trash2 className="h-4 w-4"/>
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>{t('portfolio.deleteDialog.title')}</AlertDialogTitle>
                                                <AlertDialogDescription>{t('portfolio.deleteDialog.description', { title: item.title })}</AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>{t('portfolio.form.cancel')}</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDeletePortfolioItem(item.id)}>{t('delete')}</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </div>
                        ))}
                    </div>

                     <Dialog open={isPortfolioFormOpen} onOpenChange={setIsPortfolioFormOpen}>
                        <DialogTrigger asChild>
                            <Button type="button" variant="outline" className="mt-4" onClick={() => setEditingPortfolioItem(null)}>
                                <PlusCircle className="mr-2"/>
                                {t('portfolio.addWork')}
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{editingPortfolioItem ? t('portfolio.form.titleEdit') : t('portfolio.form.title')}</DialogTitle>
                                <DialogDescription>{t('portfolio.form.description')}</DialogDescription>
                            </DialogHeader>
                            <PortfolioItemForm
                                item={editingPortfolioItem}
                                onSave={handleSavePortfolioItem}
                                onClose={() => setIsPortfolioFormOpen(false)}
                            />
                        </DialogContent>
                    </Dialog>
                </div>


                <div className="flex justify-end gap-2">
                    <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>{t('addressForm.cancel')}</Button>
                    <Button type="submit" disabled={isSaving || !isDirty}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {t('saveChanges')}
                    </Button>
                </div>
              </CardContent>
            </Card>
        </form>
      </div>
    );
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
                    <div className="relative">
                        <Avatar className="h-28 w-28">
                            <AvatarImage src={user.profile?.photoUrl || undefined} />
                            <AvatarFallback className="text-3xl">{user.profile?.displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <Button variant="outline" size="icon" className="absolute -bottom-2 -right-2 rounded-full border-2 border-background" onClick={() => setIsEditing(true)}>
                            <Camera className="h-4 w-4"/>
                            <span className="sr-only">{t('changePhoto')}</span>
                        </Button>
                    </div>
                    <div className="flex-1 space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                            <CardTitle className="text-3xl">{user.profile?.displayName}</CardTitle>
                             <div className="flex flex-wrap gap-2">
                                <Button onClick={() => setIsEditing(true)}>
                                    <Edit className="mr-2 h-4 w-4"/>
                                    {t('editProfile')}
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link href="/dashboard/profile/kyc">
                                        <Lock className="mr-2 h-4 w-4"/>
                                        {t('kycVerification')}
                                    </Link>
                                </Button>
                            </div>
                        </div>
                        <p className="text-muted-foreground">{user.profile?.bio || t('noBio')}</p>
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-muted-foreground pt-2">
                             <div className="flex items-center gap-2">
                                <Dialog>
                                    <DropdownMenu>
                                        <div className="flex items-center gap-2">
                                            <Languages className="h-4 w-4"/>
                                            <span>{user.profile?.languages?.join(', ') || t('languagesPlaceholder')}</span>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-6 w-6"><Edit className="h-3 w-3"/></Button>
                                            </DropdownMenuTrigger>
                                        </div>
                                        <DropdownMenuContent>
                                            <DialogTrigger asChild><DropdownMenuItem>{t('edit')}</DropdownMenuItem></DialogTrigger>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                    <DialogContent>
                                        <DialogHeader><DialogTitle>{t('languages')}</DialogTitle></DialogHeader>
                                        <Form {...form}>
                                            <form onSubmit={handleSubmit(d => handleQuickSave('languages', stringToArray(d.languages)))}>
                                                <FormField control={form.control} name="languages" render={({field}) => (
                                                    <MultiSelect
                                                        options={availableLanguages}
                                                        selected={field.value ?? []}
                                                        onChange={field.onChange}
                                                        placeholder={t('languagesPlaceholder')}
                                                    />
                                                )}/>
                                                <DialogFooter className="mt-4">
                                                    <Button type="submit">{t('saveChanges')}</Button>
                                                </DialogFooter>
                                            </form>
                                        </Form>
                                    </DialogContent>
                                </Dialog>
                            </div>
                             {user.profile?.city && (
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4"/>
                                    <span>{user.profile.city}</span>
                                </div>
                            )}
                             {user.roles.includes(UserRole.provider) && user.profile?.serviceRadiusKm && (
                                <div className="flex items-center gap-2">
                                    <SatelliteDish className="h-4 w-4"/>
                                    <span>{t('serviceRadiusDisplay', {km: user.profile.serviceRadiusKm})}</span>
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
                            
                             <Dialog>
                                <DropdownMenu>
                                    <div className="flex items-center gap-2">
                                        {user.profile?.skills?.map(skill => (
                                            <Badge key={skill}>{skill}</Badge>
                                        ))}
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-6 w-6"><Edit className="h-3 w-3"/></Button>
                                        </DropdownMenuTrigger>
                                    </div>
                                    <DropdownMenuContent>
                                        <DialogTrigger asChild><DropdownMenuItem>{t('edit')}</DropdownMenuItem></DialogTrigger>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <DialogContent>
                                    <DialogHeader><DialogTitle>{t('skills')}</DialogTitle></DialogHeader>
                                    <Form {...form}>
                                        <form onSubmit={handleSubmit(d => handleQuickSave('skills', stringToArray(d.skills)))}>
                                            <FormField control={form.control} name="skills" render={({field}) => (
                                                <TagInput
                                                    tags={field.value ?? []}
                                                    onChange={field.onChange}
                                                    placeholder={t('skillsPlaceholder')}
                                                />
                                            )}/>
                                            <DialogFooter className="mt-4">
                                                <Button type="submit">{t('saveChanges')}</Button>
                                            </DialogFooter>
                                        </form>
                                    </Form>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
              </div>
          </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <CardTitle>{t('portfolio.title')}</CardTitle>
        </CardHeader>
        <CardContent>
            {mockPortfolioItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {mockPortfolioItems.map(item => (
                        <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer" className="block border rounded-lg overflow-hidden group hover:shadow-lg transition-shadow">
                           <div className="aspect-video bg-muted overflow-hidden relative">
                                {item.type === 'file' ? (
                                    <img src={item.url} alt={item.title} className="w-full h-full object-cover" data-ai-hint="portfolio item"/>
                                ) : (
                                    <div className="flex items-center justify-center h-full bg-secondary">
                                        <LinkIcon className="h-12 w-12 text-muted-foreground"/>
                                    </div>
                                )}
                                <div className="absolute top-2 right-2 p-1.5 bg-background/80 rounded-full backdrop-blur-sm">
                                    {item.type === 'file' ? <FileIcon className="h-4 w-4 text-muted-foreground" /> : <LinkIcon className="h-4 w-4 text-muted-foreground" />}
                                </div>
                            </div>
                            <div className="p-4 bg-background">
                                <p className="font-semibold truncate">{item.title}</p>
                                <p className="text-sm text-muted-foreground truncate">{item.description}</p>
                            </div>
                        </a>
                    ))}
                </div>
            ) : (
                <div className="p-6 text-center border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground">{t('portfolio.empty')}</p>
                    <Button variant="outline" className="mt-4" onClick={() => setIsEditing(true)}>
                        <PlusCircle className="mr-2" />
                        {t('portfolio.addWork')}
                    </Button>
                </div>
            )}
        </CardContent>
    </Card>
      
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>{t('earnedBadges')}</CardTitle>
                    <Button variant="link" asChild>
                        <Link href="/dashboard/academy/certificates">{t('seeAllBadges')}</Link>
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
                {mockEarnedBadges.map(badge => (
                    <div key={badge.id} className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50">
                        <div className="p-2 bg-primary/10 text-primary rounded-full">
                           {badge.icon}
                        </div>
                        <div>
                            <p className="font-semibold">{badge.name}</p>
                            <p className="text-xs text-muted-foreground">{t('earnedOn', { date: badge.date })}</p>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center md:text-left">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">{t('averageRating')}</CardTitle>
                    <Star className="h-4 w-4 text-muted-foreground"/>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{user.profile?.averageRating?.toFixed(1) || 'N/A'}</div>
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

        <Card>
            <CardHeader>
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <CardTitle>{t('addressesTitle')}</CardTitle>
                        <CardDescription>{t('addressesDesc')}</CardDescription>
                    </div>
                    <Sheet open={isAddressFormOpen} onOpenChange={setIsAddressFormOpen}>
                        <SheetTrigger asChild>
                            <Button type="button" variant="outline">
                                <PlusCircle className="mr-2"/>
                                {t('addAddress')}
                            </Button>
                        </SheetTrigger>
                        <SheetContent>
                            <SheetHeader>
                                <SheetTitle>{t('addressForm.title')}</SheetTitle>
                                <SheetDescription/>
                            </SheetHeader>
                            <div className="py-4">
                                <AddressForm 
                                    onSave={(data) => console.log(data)}
                                    onClose={() => setIsAddressFormOpen(false)}
                                />
                            </div>
                        </SheetContent>
                    </Sheet>
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
