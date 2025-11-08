'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslations } from 'next-intl';
import { Loader2, Mail, Phone, Trash2, User as UserIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import DeleteAccountDialog from './delete-account-dialog';
import PhoneDialog from './phone-dialog';
import EmailDialog from './email-dialog';
import ProfilePhotoUpload from './profile-photo-upload';
import DisplayNameEdit from './display-name-edit';
import { deleteUserAccount } from '@/lib/services/account-service';

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="18px" height="18px" {...props}>
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.565-3.108-11.127-7.462l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C39.99,34.556,44,29.86,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
    </svg>
);


export default function AccountSettings() {
    const { user, loading } = useAuth();
    const t = useTranslations('SettingsPage.account');
    
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [phoneDialogOpen, setPhoneDialogOpen] = useState(false);
    const [emailDialogOpen, setEmailDialogOpen] = useState(false);

    if (loading || !user) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }
    
    // Check if the user signed in with Google
    const isGoogleSignIn = user.providerData.some(
        (provider) => provider.providerId === 'google.com'
    );

    // Real handlers with Firebase services
    const handleDeleteAccount = async (password: string) => {
        try {
            if (!user) throw new Error('User not authenticated');
            await deleteUserAccount(user.uid, password);
            alert(t('account.deleteSuccess'));
            // User will be signed out automatically after deletion
        } catch (err: any) {
            console.error('Failed to delete account:', err);
            if (err.code === 'auth/wrong-password') {
                alert(t('account.wrongPassword'));
            } else {
                alert(t('account.deleteError'));
            }
        }
    };

    const handleSavePhone = async (phone: string) => {
        try {
            if (!user) throw new Error('User not authenticated');
            const { updateUserProfile } = await import('@/lib/services/account-service');
            await updateUserProfile(user.uid, { phone });
            alert(t('account.phoneSuccess'));
        } catch (err) {
            console.error('Failed to save phone:', err);
            alert(t('account.phoneError'));
        }
    };

    const handleSaveEmail = async (email: string, password: string) => {
        try {
            const { updateUserEmail } = await import('@/lib/services/account-service');
            await updateUserEmail(email, password);
            alert(t('account.emailSuccess'));
        } catch (err: any) {
            console.error('Failed to save email:', err);
            if (err.code === 'auth/wrong-password') {
                alert(t('account.wrongPassword'));
            } else if (err.code === 'auth/email-already-in-use') {
                alert(t('account.emailInUse'));
            } else {
                alert(t('account.emailError'));
            }
        }
    };

    const handleUploadPhoto = async (file: File): Promise<string> => {
        try {
            if (!user) throw new Error('User not authenticated');
            const { uploadProfilePhoto } = await import('@/lib/services/account-service');
            const photoURL = await uploadProfilePhoto(user.uid, file);
            return photoURL;
        } catch (err: any) {
            console.error('Failed to upload photo:', err);
            alert(err.message || t('account.photoError'));
            throw err;
        }
    };

    const handleSaveDisplayName = async (name: string) => {
        try {
            if (!user) throw new Error('User not authenticated');
            const { updateUserProfile } = await import('@/lib/services/account-service');
            await updateUserProfile(user.uid, { displayName: name });
            alert(t('account.displayNameSuccess'));
        } catch (err) {
            console.error('Failed to save display name:', err);
            alert(t('account.displayNameError'));
        }
    };

    const handleLinkGoogle = async () => {
        console.log('Link Google account');
        // TODO: Implement Firebase Google linking
        alert('Google account linking will be implemented in Backend Integration task');
    };

    return (
        <div className="space-y-6">
            {/* Profile Photo and Display Name */}
            <Card>
                <CardHeader>
                    <CardTitle>Profile</CardTitle>
                    <CardDescription>Manage your profile photo and display name</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <ProfilePhotoUpload
                        currentPhotoUrl={user.photoURL || undefined}
                        userName={user.displayName || user.email || undefined}
                        onUpload={handleUploadPhoto}
                    />
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Display Name</label>
                        <DisplayNameEdit
                            currentName={user.displayName || undefined}
                            onSave={handleSaveDisplayName}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Email */}
            <Card>
                <CardHeader>
                    <CardTitle>{t('email.title')}</CardTitle>
                    <CardDescription>{t('email.description')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                        <div className="flex items-center gap-3">
                            <Mail className="h-5 w-5 text-muted-foreground"/>
                            <span>{user.email}</span>
                        </div>
                        <Button 
                            variant="outline" 
                            onClick={() => setEmailDialogOpen(true)}
                            disabled={isGoogleSignIn}
                        >
                            {t('email.button')}
                        </Button>
                    </div>
                    {isGoogleSignIn && (
                        <p className="text-sm text-muted-foreground">
                            Email cannot be changed for Google sign-in accounts
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Phone */}
             <Card>
                <CardHeader>
                    <CardTitle>{t('phone.title')}</CardTitle>
                    <CardDescription>{t('phone.description')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                        <div className="flex items-center gap-3">
                            <Phone className="h-5 w-5 text-muted-foreground"/>
                            <span>{user?.phone || t('phone.notProvided')}</span>
                        </div>
                        <Button 
                            variant="outline"
                            onClick={() => setPhoneDialogOpen(true)}
                        >
                            {user?.phone ? t('phone.buttonEdit') : t('phone.buttonAdd')}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Linked Accounts */}
            <Card>
                <CardHeader>
                    <CardTitle>{t('linkedAccounts.title')}</CardTitle>
                    <CardDescription>{t('linkedAccounts.description')}</CardDescription>
                </CardHeader>
                <CardContent>
                    {isGoogleSignIn ? (
                         <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                            <div className="flex items-center gap-3">
                                <GoogleIcon />
                                <div className="font-semibold">{t('linkedAccounts.google')}</div>
                            </div>
                            <Button variant="outline" disabled>{t('linkedAccounts.manage')}</Button>
                        </div>
                    ) : (
                         <Button variant="outline" onClick={handleLinkGoogle}>
                            <GoogleIcon className="mr-2"/>
                            {t('linkedAccounts.linkGoogle')}
                        </Button>
                    )}
                </CardContent>
            </Card>

            {/* Delete Account */}
            <Card className="border-destructive">
                <CardHeader>
                    <CardTitle className="text-destructive">{t('deleteAccount.title')}</CardTitle>
                    <CardDescription>{t('deleteAccount.description')}</CardDescription>
                </CardHeader>
                <CardContent>
                     <Button 
                        variant="destructive"
                        onClick={() => setDeleteDialogOpen(true)}
                    >
                        <Trash2 className="mr-2"/>
                        {t('deleteAccount.button')}
                    </Button>
                </CardContent>
            </Card>

            {/* Dialogs */}
            <DeleteAccountDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={handleDeleteAccount}
            />
            <PhoneDialog
                open={phoneDialogOpen}
                onOpenChange={setPhoneDialogOpen}
                currentPhone={user?.phone}
                onSave={handleSavePhone}
            />
            <EmailDialog
                open={emailDialogOpen}
                onOpenChange={setEmailDialogOpen}
                currentEmail={user.email || ''}
                onSave={handleSaveEmail}
            />
        </div>
    )
}
