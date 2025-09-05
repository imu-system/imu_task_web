
'use client';

import { useAuth } from '@/hooks/use-auth';
import { Link, useRouter } from '@/navigation';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2, ArrowLeft, User, ShieldCheck, Mail, Phone, CalendarDays, KeyRound, AlertTriangle, UserCog, Eye, Trash2, BadgeCheck, Languages, MapPin, UserPlus, FileUp } from 'lucide-react';
import { UserRole, UserStatus } from '@/lib/types';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';


const profileEditSchema = z.object({
  displayName: z.string().min(2, "Le nom est requis."),
  city: z.string().optional(),
  languages: z.string().transform(val => val.split(',').map(s => s.trim()).filter(Boolean)),
  verifiedBadges: z.string().transform(val => val.split(',').map(s => s.trim()).filter(Boolean)),
});

type ProfileEditFormValues = z.infer<typeof profileEditSchema>;

const rolesFormSchema = z.object({
    roles: z.array(z.string()).refine(value => value.some(role => role), {
        message: "L'utilisateur doit avoir au moins un rôle."
    })
})
type RolesFormValues = z.infer<typeof rolesFormSchema>;


// Using the same mock data as the list page for consistency
const mockUsers: any[] = [
    { id: 'usr_1', displayName: 'Nathan Imogo', email: 'nathan.imogo@outlook.fr', phone: '+33 6 12 34 56 78', roles: ['admin', 'client'], status: 'active', kycStatus: 'verified', createdAt: '2023-01-15T10:00:00Z', lastActiveAt: '2023-10-26T12:00:00Z', profile: { city: 'Paris', languages: ['Français', 'Anglais'], verifiedBadges: ['ID Verified', 'Payment Verified'] } },
    { id: 'usr_2', displayName: 'Jane Doe', email: 'jane.doe@example.com', phone: '+33 7 89 01 23 45', roles: ['provider'], status: 'active', kycStatus: 'pending', createdAt: '2023-02-20T11:30:00Z', lastActiveAt: '2023-10-25T18:45:00Z', profile: { city: 'Lyon', languages: ['Français'], verifiedBadges: [] }},
    { id: 'usr_3', displayName: 'John Smith', email: 'john.smith@example.com', phone: null, roles: ['client'], status: 'suspended', kycStatus: 'not_required', createdAt: '2023-05-10T08:00:00Z', lastActiveAt: '2023-09-01T22:10:00Z', profile: { city: 'Marseille', languages: ['Anglais'], verifiedBadges: [] } },
    { id: 'usr_4', displayName: 'Marie Curie', email: 'marie.curie@example.com', phone: '+33 1 23 45 67 89', roles: ['provider', 'client'], status: 'active', kycStatus: 'verified', createdAt: '2022-12-01T15:20:00Z', lastActiveAt: '2023-10-26T11:55:00Z', profile: { city: 'Lille', languages: ['Français', 'Polonais'], verifiedBadges: ['ID Verified'] } },
];


export default function AdminUserDetailPage() {
    const { user: adminUser, loading: authLoading, startImpersonation } = useAuth();
    const router = useRouter();
    const params = useParams<{ id: string }>();
    const userId = params.id;
    const t = useTranslations('AdminUserDetailPage');
    const tUsers = useTranslations('AdminUsersPage');
    const { toast } = useToast();
    
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isSavingRoles, setIsSavingRoles] = useState(false);
    const [isSuspensionDialogOpen, setSuspensionDialogOpen] = useState(false);
    const [isReactivationDialogOpen, setReactivationDialogOpen] = useState(false);
    const [isKycResetDialogOpen, setKycResetDialogOpen] = useState(false);

    const profileForm = useForm<ProfileEditFormValues>({
        resolver: zodResolver(profileEditSchema),
    });

    const rolesForm = useForm<RolesFormValues>({
        resolver: zodResolver(rolesFormSchema),
    });

    useEffect(() => {
        if (!authLoading && (!adminUser || !adminUser.roles?.includes(UserRole.admin))) {
            router.push('/dashboard');
        }
    }, [adminUser, authLoading, router]);

    useEffect(() => {
        setLoading(true);
        // Find user in mock data, assuming adminUser's uid could be in mockUsers as well
        const fetchedUser = mockUsers.find(u => u.id === userId || (adminUser && u.id === adminUser.uid && userId === adminUser.uid));
        
        if (fetchedUser) {
            setUser(fetchedUser);
            profileForm.reset({
                displayName: fetchedUser.displayName || '',
                city: fetchedUser.profile?.city || '',
                languages: (fetchedUser.profile?.languages || []).join(', '),
                verifiedBadges: (fetchedUser.profile?.verifiedBadges || []).join(', '),
            });
            rolesForm.reset({
                roles: fetchedUser.roles || []
            })
        } else {
             // Special case for the admin user if not in mock data
            if (adminUser && userId === adminUser.uid) {
                 setUser({
                    id: adminUser.uid,
                    displayName: adminUser.profile?.displayName || adminUser.displayName,
                    email: adminUser.email,
                    roles: adminUser.roles,
                    status: adminUser.status,
                    kycStatus: adminUser.KYCStatus,
                    createdAt: adminUser.metadata.creationTime,
                    profile: adminUser.profile
                });
                profileForm.reset({
                    displayName: adminUser.profile?.displayName || adminUser.displayName || '',
                    city: adminUser.profile?.city || '',
                    languages: (adminUser.profile?.languages || []).join(', '),
                    verifiedBadges: (adminUser.profile?.verifiedBadges || []).join(', '),
                });
                rolesForm.reset({ roles: adminUser.roles });
            } else {
                console.error("User not found");
            }
        }
        setLoading(false);
    }, [userId, profileForm, rolesForm, adminUser]);

    const onProfileSubmit = async (data: ProfileEditFormValues) => {
        setIsSaving(true);
        console.log("Saving profile data:", data);
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast({
            title: t('toastUpdateSuccessTitle'),
            description: t('toastUpdateSuccessDescription'),
        });
        setIsSaving(false);
    };

    const onRolesSubmit = async (data: RolesFormValues) => {
        setIsSavingRoles(true);
        console.log("Saving roles data:", data);
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast({
            title: t('cards.roles.toastSuccessTitle'),
            description: t('cards.roles.toastSuccessDescription'),
        });
        setIsSavingRoles(false);
    };
    
    const handleSuspendUser = async () => {
        console.log("Suspending user...");
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast({
            title: t('cards.actions.toastSuspendSuccessTitle'),
            description: t('cards.actions.toastSuspendSuccessDescription'),
        });
        setSuspensionDialogOpen(false);
    }
    
    const handleReactivateUser = async () => {
        console.log("Reactivating user...");
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast({
            title: t('cards.actions.toastReactivateSuccessTitle'),
            description: t('cards.actions.toastReactivateSuccessDescription'),
        });
        setReactivationDialogOpen(false);
    }
    
    const handleResetKyc = async () => {
        console.log("Resetting KYC...");
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast({
            title: t('cards.actions.toastResetKycSuccessTitle'),
            description: t('cards.actions.toastResetKycSuccessDescription'),
        });
        setKycResetDialogOpen(false);
    }

    const handleImpersonate = () => {
        if (user) {
            startImpersonation(user);
            router.push('/dashboard');
        }
    }

    if (authLoading || loading || !adminUser || !adminUser.roles?.includes(UserRole.admin)) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }
    
    if (!user) {
        return (
            <div className="text-center">
                <h1 className="text-xl">{t('userNotFound')}</h1>
                <Button asChild variant="link"><Link href="/dashboard/admin/users">{t('backToList')}</Link></Button>
            </div>
        )
    }

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'active': return 'default';
            case 'suspended': return 'destructive';
            default: return 'secondary';
        }
    }

    const getKycVariant = (kycStatus: string) => {
        switch (kycStatus) {
            case 'verified': return 'default';
            case 'pending': return 'secondary';
            case 'rejected': return 'destructive';
            default: return 'outline';
        }
    }
    
    const availableRoles = [
        { id: UserRole.client, label: tUsers('roles.client') },
        { id: UserRole.provider, label: tUsers('roles.provider') },
        { id: UserRole.moderator, label: tUsers('roles.moderator') },
    ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
        <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
                <Link href="/dashboard/admin/users">
                    <ArrowLeft className="h-4 w-4"/>
                    <span className="sr-only">{t('backToList')}</span>
                </Link>
            </Button>
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">
                    {t('title')}
                </h1>
                <p className="text-muted-foreground font-mono text-xs">
                    ID: {user.id}
                </p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>{t('cards.summary.title')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-20 w-20">
                                <AvatarImage src={`https://i.pravatar.cc/150?u=${user.id}`} />
                                <AvatarFallback>{user.displayName?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <h2 className="text-2xl font-bold">{user.displayName}</h2>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {user.roles.map((role: string) => (
                                        <Badge key={role} variant={role === 'admin' ? 'destructive' : 'secondary'}>{tUsers(`roles.${role}`)}</Badge>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <Separator/>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground"/>
                                <span>{user.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground"/>
                                <span>{user.phone || t('noInfo')}</span>
                            </div>
                             <div className="flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4 text-muted-foreground"/>
                                <span className="mr-2">{t('cards.summary.status')}:</span>
                                <Badge variant={getStatusVariant(user.status)}>{tUsers(`status.${user.status}`)}</Badge>
                            </div>
                            <div className="flex items-center gap-2">
                                <KeyRound className="h-4 w-4 text-muted-foreground"/>
                                <span className="mr-2">{t('cards.summary.kyc')}:</span>
                                <Badge variant={getKycVariant(user.kycStatus)}>{tUsers(`kycStatus.${user.kycStatus}`)}</Badge>
                            </div>
                            <div className="flex items-center gap-2 col-span-full">
                                <CalendarDays className="h-4 w-4 text-muted-foreground"/>
                                <span>{t('cards.summary.memberSince', { date: new Date(user.createdAt).toLocaleDateString() })}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('cards.editProfile.title')}</CardTitle>
                                <CardDescription>{t('cards.editProfile.description')}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={profileForm.control}
                                    name="displayName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('cards.editProfile.displayName')}</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={profileForm.control}
                                    name="city"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('cards.editProfile.city')}</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder={t('cards.editProfile.cityPlaceholder')} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={profileForm.control}
                                    name="languages"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('cards.editProfile.languages')}</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder={t('cards.editProfile.commaSeparated')}/>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                 <FormField
                                    control={profileForm.control}
                                    name="verifiedBadges"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('cards.editProfile.verifiedBadges')}</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder={t('cards.editProfile.commaSeparated')}/>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                            <CardContent className="flex justify-end">
                                <Button type="submit" disabled={isSaving}>
                                    {isSaving && <Loader2 className="animate-spin mr-2"/>}
                                    {t('cards.editProfile.saveChanges')}
                                </Button>
                            </CardContent>
                        </Card>
                    </form>
                </Form>

            </div>
            <div className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>{t('cards.actions.title')}</CardTitle>
                        <CardDescription>{t('cards.actions.description')}</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-2">
                        <Button variant="outline" onClick={handleImpersonate} disabled={user.id === adminUser?.uid}>
                            <Eye className="mr-2"/> {t('cards.actions.impersonate')}
                        </Button>
                        
                        {user.status === UserStatus.active ? (
                            <AlertDialog open={isSuspensionDialogOpen} onOpenChange={setSuspensionDialogOpen}>
                                <AlertDialogTrigger asChild>
                                    <Button variant="outline" className="text-amber-600 hover:text-amber-700">
                                        <AlertTriangle className="mr-2"/> {t('cards.actions.suspend')}
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>{t('cards.actions.suspendDialog.title')}</AlertDialogTitle>
                                        <AlertDialogDescription>{t('cards.actions.suspendDialog.description', { name: user.displayName })}</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="suspension-reason">{t('cards.actions.suspendDialog.reasonLabel')}</Label>
                                            <Textarea id="suspension-reason" placeholder={t('cards.actions.suspendDialog.reasonPlaceholder')} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="suspension-duration">{t('cards.actions.suspendDialog.durationLabel')}</Label>
                                            <Select defaultValue="7d">
                                                <SelectTrigger id="suspension-duration">
                                                    <SelectValue placeholder="Choisir une durée"/>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="7d">{t('cards.actions.suspendDialog.duration7d')}</SelectItem>
                                                    <SelectItem value="30d">{t('cards.actions.suspendDialog.duration30d')}</SelectItem>
                                                    <SelectItem value="permanent">{t('cards.actions.suspendDialog.durationPermanent')}</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox id="notify-user" defaultChecked />
                                            <label htmlFor="notify-user" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                                {t('cards.actions.suspendDialog.notifyUser')}
                                            </label>
                                        </div>
                                    </div>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>{t('cards.actions.suspendDialog.cancel')}</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleSuspendUser}>{t('cards.actions.suspendDialog.confirm')}</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        ) : (
                             <AlertDialog open={isReactivationDialogOpen} onOpenChange={setReactivationDialogOpen}>
                                <AlertDialogTrigger asChild>
                                    <Button variant="outline" className="text-green-600 hover:text-green-700">
                                        <BadgeCheck className="mr-2"/> {t('cards.actions.reactivate')}
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>{t('cards.actions.reactivateDialog.title')}</AlertDialogTitle>
                                        <AlertDialogDescription>{t('cards.actions.reactivateDialog.description', { name: user.displayName })}</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>{t('cards.actions.reactivateDialog.cancel')}</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleReactivateUser}>{t('cards.actions.reactivateDialog.confirm')}</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}
                        
                        <AlertDialog open={isKycResetDialogOpen} onOpenChange={setKycResetDialogOpen}>
                            <AlertDialogTrigger asChild>
                                <Button variant="outline"><FileUp className="mr-2"/> {t('cards.actions.resetKyc')}</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>{t('cards.actions.resetKycDialog.title')}</AlertDialogTitle>
                                    <AlertDialogDescription>{t('cards.actions.resetKycDialog.description', { name: user.displayName })}</AlertDialogDescription>
                                </AlertDialogHeader>
                                <div className="space-y-2 py-2">
                                    <Label htmlFor="kyc-reset-reason">{t('cards.actions.resetKycDialog.reasonLabel')}</Label>
                                    <Textarea id="kyc-reset-reason" placeholder={t('cards.actions.resetKycDialog.reasonPlaceholder')} />
                                </div>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>{t('cards.actions.resetKycDialog.cancel')}</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleResetKyc}>{t('cards.actions.resetKycDialog.confirm')}</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>

                        <Button variant="destructive" disabled><Trash2 className="mr-2"/> {t('cards.actions.delete')}</Button>
                    </CardContent>
                </Card>

                <Form {...rolesForm}>
                    <form onSubmit={rolesForm.handleSubmit(onRolesSubmit)}>
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('cards.roles.title')}</CardTitle>
                                <CardDescription>{t('cards.roles.description')}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={rolesForm.control}
                                    name="roles"
                                    render={() => (
                                        <FormItem>
                                            {availableRoles.map((item) => (
                                                <FormField
                                                    key={item.id}
                                                    control={rolesForm.control}
                                                    name="roles"
                                                    render={({ field }) => {
                                                        const isProviderRole = item.id === UserRole.provider;
                                                        const kycNotVerified = user.kycStatus !== 'verified';
                                                        return (
                                                            <FormItem key={item.id} className="flex flex-row items-center space-x-3 space-y-0">
                                                                <FormControl>
                                                                    <Checkbox
                                                                        checked={field.value?.includes(item.id)}
                                                                        onCheckedChange={(checked) => {
                                                                            return checked
                                                                                ? field.onChange([...field.value, item.id])
                                                                                : field.onChange(
                                                                                    field.value?.filter(
                                                                                        (value) => value !== item.id
                                                                                    )
                                                                                )
                                                                        }}
                                                                    />
                                                                </FormControl>
                                                                <FormLabel className="font-normal flex items-center gap-2">
                                                                    {item.label}
                                                                    {isProviderRole && kycNotVerified && (
                                                                        <TooltipProvider>
                                                                            <Tooltip>
                                                                                <TooltipTrigger>
                                                                                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                                                                                </TooltipTrigger>
                                                                                <TooltipContent>
                                                                                    <p>{t('cards.roles.kycWarning')}</p>
                                                                                </TooltipContent>
                                                                            </Tooltip>
                                                                        </TooltipProvider>
                                                                    )}
                                                                </FormLabel>
                                                            </FormItem>
                                                        )
                                                    }}
                                                />
                                            ))}
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {user.roles.includes('admin') && (
                                     <div className="flex flex-row items-center space-x-3 space-y-0 text-muted-foreground">
                                        <Checkbox checked disabled/>
                                        <label className="font-normal opacity-70">{tUsers('roles.admin')} ({t('cards.roles.adminUneditable')})</label>
                                    </div>
                                )}

                            </CardContent>
                            <CardContent className="flex justify-end">
                                <Button type="submit" disabled={isSavingRoles}>
                                    {isSavingRoles && <Loader2 className="animate-spin mr-2"/>}
                                    {t('cards.roles.save')}
                                </Button>
                            </CardContent>
                        </Card>
                    </form>
                </Form>
            </div>
        </div>
    </div>
  );
}

    