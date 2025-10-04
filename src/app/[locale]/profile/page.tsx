'use client';

import { useState, useRef, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { uploadAvatar } from '@/lib/storage';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  User,
  Mail,
  Calendar,
  Upload,
  Loader2,
  CheckCircle2,
  Camera,
  LogOut,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ProfilePage() {
  const { user, loading, updateUserProfile, logout } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const t = useTranslations('Profile');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [uploading, setUploading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Handle avatar upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      setUploading(true);
      setError('');

      // Upload to Firebase Storage
      const photoURL = await uploadAvatar(user.uid, file);

      // Update user profile
      await updateUserProfile({ photoURL });

      toast({
        title: t('avatarUpdated'),
        description: t('avatarUpdatedDescription'),
      });

      setSuccess(t('avatarUpdated'));
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Avatar upload error:', err);
      setError(err.message || t('uploadError'));
      toast({
        variant: 'destructive',
        title: t('error'),
        description: err.message || t('uploadError'),
      });
    } finally {
      setUploading(false);
    }
  };

  // Handle profile update
  const handleProfileUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setUpdating(true);
      setError('');

      if (!displayName.trim()) {
        throw new Error(t('nameRequired'));
      }

      await updateUserProfile({ displayName: displayName.trim() });

      toast({
        title: t('profileUpdated'),
        description: t('profileUpdatedDescription'),
      });

      setSuccess(t('profileUpdated'));
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Profile update error:', err);
      setError(err.message || t('updateError'));
      toast({
        variant: 'destructive',
        title: t('error'),
        description: err.message || t('updateError'),
      });
    } finally {
      setUpdating(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      router.push('/auth/login');
    } catch (err: any) {
      console.error('Logout error:', err);
      toast({
        variant: 'destructive',
        title: t('error'),
        description: t('logoutError'),
      });
    }
  };

  // Not authenticated
  if (!loading && !user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertDescription>
            {t('notAuthenticated')}{' '}
            <a href="/auth/login" className="font-medium underline">
              {t('loginLink')}
            </a>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-2xl">
          <Skeleton className="mb-6 h-10 w-48" />
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Skeleton className="h-24 w-24 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!user) return null;

  // Get user initials for avatar fallback
  const initials = user.displayName
    ? user.displayName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : user.email?.[0].toUpperCase() || 'U';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-3xl font-bold">{t('title')}</h1>

        {/* Success/Error alerts */}
        {success && (
          <Alert className="mb-4 border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Profile Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start gap-6">
              {/* Avatar */}
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                  <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
                </Avatar>

                {/* Upload button overlay */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-primary text-primary-foreground shadow-lg transition-opacity hover:opacity-90 disabled:opacity-50"
                  aria-label={t('changeAvatar')}
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </button>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  aria-label="Upload avatar"
                />
              </div>

              {/* User info */}
              <div className="flex-1">
                <CardTitle className="text-2xl">{user.displayName || 'Utilisateur'}</CardTitle>
                <CardDescription className="mt-1 flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {user.email}
                </CardDescription>
                <CardDescription className="mt-1 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {t('memberSince')}{' '}
                  {user.metadata.creationTime
                    ? new Date(user.metadata.creationTime).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                      })
                    : t('memberSince')}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              {/* Display Name */}
              <div className="space-y-2">
                <Label htmlFor="displayName">{t('displayName')}</Label>
                <Input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder={t('displayNamePlaceholder')}
                  disabled={updating}
                />
              </div>

              {/* Email (read-only) */}
              <div className="space-y-2">
                <Label htmlFor="email">{t('email')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={user.email || ''}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  {t('emailReadOnly')}
                </p>
              </div>

              {/* Update button */}
              <Button type="submit" disabled={updating || !displayName.trim()}>
                {updating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('updating')}
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    {t('updateProfile')}
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Account Stats */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t('statistics')}</CardTitle>
            <CardDescription>{t('statisticsDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border p-4">
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">{t('tasksCreated')}</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">{t('tasksCompleted')}</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">{t('reviews')}</p>
              </div>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              {t('statisticsComingSoon')}
            </p>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card>
          <CardHeader>
            <CardTitle>{t('accountActions')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start" asChild>
              <a href="/auth/forgot-password">
                <User className="mr-2 h-4 w-4" />
                {t('changePassword')}
              </a>
            </Button>

            <Button
              variant="destructive"
              className="w-full justify-start"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              {t('logout')}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
