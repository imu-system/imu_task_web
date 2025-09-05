
'use client';

import { useAuth } from '@/hooks/use-auth';
import { Link, useRouter } from '@/navigation';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2, ArrowLeft, User, ShieldCheck, Mail, Phone, CalendarDays, KeyRound, AlertTriangle, UserCog, EyeOff, Trash2, BadgeCheck, Languages, MapPin } from 'lucide-react';
import { UserRole } from '@/lib/types';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const profileEditSchema = z.object({
  displayName: z.string().min(2, "Le nom est requis."),
  city: z.string().optional(),
  languages: z.string().transform(val => val.split(',').map(s => s.trim()).filter(Boolean)),
  verifiedBadges: z.string().transform(val => val.split(',').map(s => s.trim()).filter(Boolean)),
});

type ProfileEditFormValues = z.infer<typeof profileEditSchema>;

// Using the same mock data as the list page for consistency
const mockUsers: any[] = [
    { id: 'usr_1', displayName: 'Nathan Imogo', email: 'nathan.imogo@outlook.fr', phone: '+33 6 12 34 56 78', roles: ['admin', 'client'], status: 'active', kycStatus: 'verified', createdAt: '2023-01-15T10:00:00Z', lastActiveAt: '2023-10-26T12:00:00Z', profile: { city: 'Paris', languages: ['Français', 'Anglais'], verifiedBadges: ['ID Verified', 'Payment Verified'] } },
    { id: 'usr_2', displayName: 'Jane Doe', email: 'jane.doe@example.com', phone: '+33 7 89 01 23 45', roles: ['provider'], status: 'active', kycStatus: 'pending', createdAt: '2023-02-20T11:30:00Z', lastActiveAt: '2023-10-25T18:45:00Z', profile: { city: 'Lyon', languages: ['Français'], verifiedBadges: [] }},
    { id: 'usr_3', displayName: 'John Smith', email: 'john.smith@example.com', phone: null, roles: ['client'], status: 'suspended', kycStatus: 'not_required', createdAt: '2023-05-10T08:00:00Z', lastActiveAt: '2023-09-01T22:10:00Z', profile: { city: 'Marseille', languages: ['Anglais'], verifiedBadges: [] } },
    { id: 'usr_4', displayName: 'Marie Curie', email: 'marie.curie@example.com', phone: '+33 1 23 45 67 89', roles: ['provider', 'client'], status: 'active', kycStatus: 'verified', createdAt: '2022-12-01T15:20:00Z', lastActiveAt: '2023-10-26T11:55:00Z', profile: { city: 'Lille', languages: ['Français', 'Polonais'], verifiedBadges: ['ID Verified'] } },
];


export default function AdminUserDetailPage() {
    const { user: adminUser, loading: authLoading } = useAuth();
    const router = useRouter();
    const params = useParams<{ id: string }>();
    const userId = params.id;
    const t = useTranslations('AdminUserDetailPage');
    const tUsers = useTranslations('AdminUsersPage');
    const { toast } = useToast();
    
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const form = useForm<ProfileEditFormValues>({
        resolver: zodResolver(profileEditSchema),
    });

    useEffect(() => {
        if (!authLoading && (!adminUser || !adminUser.roles?.includes(UserRole.admin))) {
            router.push('/dashboard');
        }
    }, [adminUser, authLoading, router]);

    useEffect(() => {
        setLoading(true);
        const fetchedUser = mockUsers.find(u => u.id === userId);
        if (fetchedUser) {
            setUser(fetchedUser);
            form.reset({
                displayName: fetchedUser.profile.displayName || fetchedUser.displayName,
                city: fetchedUser.profile.city || '',
                languages: (fetchedUser.profile.languages || []).join(', '),
                verifiedBadges: (fetchedUser.profile.verifiedBadges || []).join(', '),
            });
        } else {
            console.error("User not found");
        }
        setLoading(false);
    }, [userId, form]);

    const onSubmit = async (data: ProfileEditFormValues) => {
        setIsSaving(true);
        console.log("Saving data:", data);
        // In a real app, you'd call an update function here.
        // e.g., await updateUserProfileByAdmin(userId, data);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Update mock data for demonstration
        const userIndex = mockUsers.findIndex(u => u.id === userId);
        if(userIndex > -1) {
            mockUsers[userIndex].displayName = data.displayName;
            mockUsers[userIndex].profile.displayName = data.displayName;
            mockUsers[userIndex].profile.city = data.city;
            mockUsers[userIndex].profile.languages = data.languages;
            mockUsers[userIndex].profile.verifiedBadges = data.verifiedBadges;
        }

        toast({
            title: t('toastUpdateSuccessTitle'),
            description: t('toastUpdateSuccessDescription'),
        });
        setIsSaving(false);
        router.refresh();
    };

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
                                <AvatarFallback>{user.displayName.charAt(0)}</AvatarFallback>
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

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('cards.editProfile.title')}</CardTitle>
                                <CardDescription>{t('cards.editProfile.description')}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
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
                                    control={form.control}
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
                                    control={form.control}
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
                                    control={form.control}
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
                        </Card>
                        <div className="flex justify-end">
                            <Button type="submit" disabled={isSaving}>
                                {isSaving && <Loader2 className="animate-spin mr-2"/>}
                                {t('cards.editProfile.saveChanges')}
                            </Button>
                        </div>
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
                        <Button variant="outline" disabled><EyeOff className="mr-2"/> {t('cards.actions.impersonate')}</Button>
                        <Button variant="outline" disabled className="text-amber-600 hover:text-amber-700"><AlertTriangle className="mr-2"/> {t('cards.actions.suspend')}</Button>
                        <Button variant="destructive" disabled><Trash2 className="mr-2"/> {t('cards.actions.delete')}</Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
}

    