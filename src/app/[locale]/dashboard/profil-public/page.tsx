/**
 * Dashboard Profil Public
 * 
 * Page de gestion du profil public pour les prestataires.
 * 
 * Fonctionnalités:
 * - Édition des informations du profil
 * - Gestion du portfolio
 * - Analytics (vues, clics, conversions)
 * - Toggle publier/dépublier
 * - Prévisualisation
 * - QR Code & partage URL
 * - Options premium
 */

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from '@/navigation';
import { useTranslations } from 'next-intl';
import { 
  Eye, EyeOff, ExternalLink, Share2, QrCode, 
  TrendingUp, MousePointerClick, Users, Download,
  Sparkles, Lock, Copy, Check
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  getPublicProfileByUserId, 
  publishProfile, 
  unpublishProfile,
  updatePublicProfile,
  addPortfolioItem,
  updatePortfolioItem,
  deletePortfolioItem,
  reorderPortfolio,
  getProfileAnalytics
} from '@/lib/firestore-public-profiles';
import { ProfileEditorForm } from '@/features/profiles/components/profile-editor/profile-editor-form';
import { PortfolioEditor } from '@/features/profiles/components/profile-editor/portfolio-editor';
import type { PublicProfile, PortfolioItem } from '@/types/public-profile';
import { ProfileVisibility } from '@/types/public-profile';
import { Skeleton } from '@/components/ui/skeleton';
// @ts-ignore - QRCode types are installed
import QRCode from 'qrcode';
import { uploadToStorage } from '@/lib/firebase-storage';

export default function PublicProfileDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const t = useTranslations('Dashboard.publicProfile');
  const { toast } = useToast();

  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Charger le profil
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        router.push('/auth/signin');
        return;
      }

      try {
        const publicProfile = await getPublicProfileByUserId(user.uid);
        
        if (!publicProfile) {
          // Créer un profil par défaut si inexistant
          toast({
            title: t('noProfile'),
            description: t('createProfileFirst'),
            variant: 'default',
          });
          setLoading(false);
          return;
        }

        setProfile(publicProfile);

        // Charger les analytics
        const analyticsData = await getProfileAnalytics(publicProfile.id);
        setAnalytics(analyticsData);

        // Générer le QR Code
        if (publicProfile.slug) {
          const profileUrl = `${window.location.origin}/profil/${publicProfile.slug}`;
          const qr = await QRCode.toDataURL(profileUrl, {
            width: 300,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#FFFFFF',
            },
          });
          setQrCodeUrl(qr);
        }
      } catch (error) {
        console.error('Erreur chargement profil:', error);
        toast({
          variant: 'destructive',
          title: t('loadError'),
          description: t('loadErrorDescription'),
        });
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user, router, t, toast]);

  // Toggle publier/dépublier
  const handleTogglePublish = async () => {
    if (!profile || !user) return;

    setSaving(true);
    try {
      if (profile.visibility === ProfileVisibility.PUBLIC) {
        await unpublishProfile(user.uid);
        setProfile({ ...profile, visibility: ProfileVisibility.PRIVATE });
        toast({
          title: t('unpublished'),
          description: t('unpublishedDescription'),
        });
      } else {
        await publishProfile(user.uid);
        setProfile({ ...profile, visibility: ProfileVisibility.PUBLIC });
        toast({
          title: t('published'),
          description: t('publishedDescription'),
        });
      }
    } catch (error) {
      console.error('Erreur toggle publish:', error);
      toast({
        variant: 'destructive',
        title: t('toggleError'),
        description: t('toggleErrorDescription'),
      });
    } finally {
      setSaving(false);
    }
  };

  // Copier l'URL
  const handleCopyUrl = async () => {
    if (!profile?.slug) return;

    const profileUrl = `${window.location.origin}/profil/${profile.slug}`;
    await navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    toast({
      title: t('urlCopied'),
      description: t('urlCopiedDescription'),
    });
    setTimeout(() => setCopied(false), 2000);
  };

  // Télécharger le QR Code
  const handleDownloadQR = () => {
    if (!qrCodeUrl) return;

    const link = document.createElement('a');
    link.download = `imutask-profil-${profile?.slug || 'qrcode'}.png`;
    link.href = qrCodeUrl;
    link.click();
  };

  // Sauvegarder les modifications du profil
  const handleSaveProfile = async (data: any) => {
    if (!user) return;

    setSaving(true);
    try {
      await updatePublicProfile(user.uid, data);
      
      // Recharger le profil
      const updatedProfile = await getPublicProfileByUserId(user.uid);
      if (updatedProfile) {
        setProfile(updatedProfile);
      }

      toast({
        title: t('saved'),
        description: t('savedDescription'),
      });
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      throw error; // Laisse le formulaire gérer l'erreur
    } finally {
      setSaving(false);
    }
  };

  // Gestion du portfolio
  const handleAddPortfolioItem = async (item: Omit<PortfolioItem, 'id' | 'createdAt'>) => {
    if (!user) return;

    await addPortfolioItem(user.uid, item);
    
    // Recharger le profil
    const updatedProfile = await getPublicProfileByUserId(user.uid);
    if (updatedProfile) {
      setProfile(updatedProfile);
    }
  };

  const handleUpdatePortfolioItem = async (itemId: string, updates: Partial<PortfolioItem>) => {
    if (!user) return;

    await updatePortfolioItem(user.uid, itemId, updates);
    
    // Recharger le profil
    const updatedProfile = await getPublicProfileByUserId(user.uid);
    if (updatedProfile) {
      setProfile(updatedProfile);
    }
  };

  const handleDeletePortfolioItem = async (itemId: string) => {
    if (!user) return;

    await deletePortfolioItem(user.uid, itemId);
    
    // Recharger le profil
    const updatedProfile = await getPublicProfileByUserId(user.uid);
    if (updatedProfile) {
      setProfile(updatedProfile);
    }
  };

  const handleReorderPortfolio = async (itemIds: string[]) => {
    if (!user) return;

    await reorderPortfolio(user.uid, itemIds);
    
    // Recharger le profil
    const updatedProfile = await getPublicProfileByUserId(user.uid);
    if (updatedProfile) {
      setProfile(updatedProfile);
    }
  };

  const handleUploadFile = async (file: File): Promise<string> => {
    if (!user) throw new Error('Non authentifié');

    const path = `public-profiles/${user.uid}/portfolio/${Date.now()}-${file.name}`;
    const url = await uploadToStorage(file, path);
    return url;
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (!profile) {
    return (
      <div className="container max-w-7xl mx-auto py-8 px-4">
        <Alert>
          <AlertTitle>{t('noProfileTitle')}</AlertTitle>
          <AlertDescription>{t('noProfileDescription')}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const profileUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/profil/${profile.slug}`;
  const isPublished = profile.visibility === 'public';

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
            <p className="text-muted-foreground">{t('description')}</p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => window.open(profileUrl, '_blank')}
              className="gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              {t('preview')}
            </Button>
          </div>
        </div>

        {/* Status Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={isPublished}
                    onCheckedChange={handleTogglePublish}
                    disabled={saving}
                  />
                  <div>
                    <Label className="text-base font-semibold">
                      {isPublished ? t('published') : t('unpublished')}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {isPublished ? t('visibleToPublic') : t('onlyVisibleToYou')}
                    </p>
                  </div>
                </div>
                
                {isPublished && (
                  <Badge variant="default" className="gap-1">
                    <Eye className="h-3 w-3" />
                    {t('live')}
                  </Badge>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyUrl}
                  className="gap-2"
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  {copied ? t('copied') : t('copyUrl')}
                </Button>
              </div>
            </div>

            {/* URL Preview */}
            {profile.slug && (
              <div className="mt-4 p-3 bg-muted rounded-md">
                <p className="text-sm font-mono break-all">{profileUrl}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="analytics" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="analytics">{t('analytics')}</TabsTrigger>
          <TabsTrigger value="profile">{t('profileTab')}</TabsTrigger>
          <TabsTrigger value="portfolio">{t('portfolioTab')}</TabsTrigger>
          <TabsTrigger value="share">{t('shareTab')}</TabsTrigger>
        </TabsList>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('totalViews')}
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {profile.stats.totalViews || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t('thisMonth')}: {profile.stats.viewsThisMonth || 0}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('ctaClicks')}
                </CardTitle>
                <MousePointerClick className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {profile.stats.ctaClicks || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t('conversionRate')}: {
                    profile.stats.totalViews > 0 
                      ? ((profile.stats.ctaClicks / profile.stats.totalViews) * 100).toFixed(1)
                      : 0
                  }%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('shares')}
                </CardTitle>
                <Share2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {profile.stats.shareCount || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t('uniqueVisitors')}: {profile.stats.uniqueVisitors || 0}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Premium Features Upsell */}
          {!profile.isPremium && (
            <Alert>
              <Sparkles className="h-4 w-4" />
              <AlertTitle>{t('upgradeToPremium')}</AlertTitle>
              <AlertDescription>
                {t('premiumDescription')}
                <Button variant="link" className="px-2">
                  {t('learnMore')}
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Analytics détaillés (premium) */}
          {profile.isPremium && analytics && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  {t('detailedAnalytics')}
                </CardTitle>
                <CardDescription>{t('analyticsDescription')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">{t('topSources')}</h4>
                    {/* Placeholder pour graphiques */}
                    <p className="text-sm text-muted-foreground">{t('comingSoon')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>{t('editProfile')}</CardTitle>
              <CardDescription>{t('editProfileDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileEditorForm
                initialData={{
                  displayName: profile.displayName,
                  headline: profile.headline,
                  bio: profile.bio,
                  location: profile.location,
                  categories: profile.categories,
                  skills: profile.skills,
                  languages: profile.languages,
                  socialLinks: profile.socialLinks,
                  metaTitle: profile.metaTitle,
                  metaDescription: profile.metaDescription,
                }}
                onSave={handleSaveProfile}
                isSaving={saving}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Portfolio Tab */}
        <TabsContent value="portfolio">
          <PortfolioEditor
            items={profile.portfolio || []}
            maxItems={profile.maxPortfolioItems || (profile.isPremium ? 50 : 10)}
            onAdd={handleAddPortfolioItem}
            onUpdate={handleUpdatePortfolioItem}
            onDelete={handleDeletePortfolioItem}
            onReorder={handleReorderPortfolio}
            onUpload={handleUploadFile}
          />
        </TabsContent>

        {/* Share Tab */}
        <TabsContent value="share" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* QR Code */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5" />
                  {t('qrCode')}
                </CardTitle>
                <CardDescription>{t('qrCodeDescription')}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-4">
                {qrCodeUrl && (
                  <>
                    <div className="p-4 bg-white rounded-lg border">
                      <img src={qrCodeUrl} alt="QR Code" className="w-64 h-64" />
                    </div>
                    <Button onClick={handleDownloadQR} className="gap-2">
                      <Download className="h-4 w-4" />
                      {t('downloadQR')}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Partage social */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="h-5 w-5" />
                  {t('socialShare')}
                </CardTitle>
                <CardDescription>{t('socialShareDescription')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3"
                  onClick={() => window.open(
                    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}`,
                    '_blank'
                  )}
                >
                  <span className="text-[#1877F2]">Facebook</span>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3"
                  onClick={() => window.open(
                    `https://twitter.com/intent/tweet?url=${encodeURIComponent(profileUrl)}`,
                    '_blank'
                  )}
                >
                  <span className="text-[#1DA1F2]">Twitter</span>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3"
                  onClick={() => window.open(
                    `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}`,
                    '_blank'
                  )}
                >
                  <span className="text-[#0A66C2]">LinkedIn</span>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3"
                  onClick={() => window.open(
                    `https://wa.me/?text=${encodeURIComponent(profileUrl)}`,
                    '_blank'
                  )}
                >
                  <span className="text-[#25D366]">WhatsApp</span>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Premium Features */}
          {profile.isPremium && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  {t('premiumFeatures')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-semibold">{t('customDomain')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {profile.premiumFeatures?.customDomain || t('notConfigured')}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">{t('configure')}</Button>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-semibold">{t('hideBranding')}</Label>
                    <p className="text-sm text-muted-foreground">{t('hideBrandingDescription')}</p>
                  </div>
                  <Switch
                    checked={profile.premiumFeatures?.hideImuTaskBranding || false}
                    onCheckedChange={async (checked) => {
                      if (user && profile.premiumFeatures) {
                        await updatePublicProfile(user.uid, {
                          premiumFeatures: {
                            ...profile.premiumFeatures,
                            hideImuTaskBranding: checked,
                          },
                        });
                      }
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="container max-w-7xl mx-auto py-8 px-4">
      <div className="space-y-6">
        <Skeleton className="h-12 w-96" />
        <Skeleton className="h-32 w-full" />
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    </div>
  );
}
