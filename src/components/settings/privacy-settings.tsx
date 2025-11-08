
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslations } from 'next-intl';
import { Loader2, Download, Eye, EyeOff, Globe, Cookie, Mail, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import DataExportDialog from './data-export-dialog';
import {
  generateUserDataExport,
  convertToCSV,
  downloadFile,
  updatePrivacySettings as updatePrivacySettingsService,
  updateCookiePreferences as updateCookiePreferencesService,
  updateEmailPreferences as updateEmailPreferencesService,
  getPrivacySettings,
  getCookiePreferences,
  getEmailPreferences,
} from '@/lib/services/privacy-service';

export default function PrivacySettings() {
  const { user, loading } = useAuth();
  const t = useTranslations('SettingsPage.privacy');

  // Dialog states
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  
  // Settings state - Fetched from Firestore
  const [profileVisibility, setProfileVisibility] = useState<'public' | 'private' | 'friends'>('public');
  const [searchEngineIndexing, setSearchEngineIndexing] = useState(true);
  const [cookieAnalytics, setCookieAnalytics] = useState(true);
  const [cookieMarketing, setCookieMarketing] = useState(false);
  const [emailNewsletter, setEmailNewsletter] = useState(true);
  const [emailMarketing, setEmailMarketing] = useState(false);
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [emailSecurity, setEmailSecurity] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);

  // Load settings from Firestore on mount
  useEffect(() => {
    if (!user) return;

    const loadSettings = async () => {
      try {
        const [privacy, cookies, email] = await Promise.all([
          getPrivacySettings(user.uid),
          getCookiePreferences(user.uid),
          getEmailPreferences(user.uid),
        ]);

        if (privacy) {
          setProfileVisibility(privacy.profileVisibility);
          setSearchEngineIndexing(privacy.searchEngineIndexing);
        }

        setCookieAnalytics(cookies.analytics);
        setCookieMarketing(cookies.marketing);

        setEmailNewsletter(email.newsletter);
        setEmailMarketing(email.marketing);
        setEmailUpdates(email.updates);
        setEmailSecurity(email.security);
      } catch (err) {
        console.error('Failed to load privacy settings:', err);
      }
    };

    loadSettings();
  }, [user]);

  // Real handlers with Firebase services
  const handleExportData = async (format: 'json' | 'csv', categories: string[]) => {
    if (!user) return;

    try {
      const data = await generateUserDataExport(user.uid, categories);
      
      const content = format === 'json' 
        ? JSON.stringify(data, null, 2) 
        : convertToCSV(data);
      
      const mimeType = format === 'json' ? 'application/json' : 'text/csv';
      const filename = `imu-task-data-export-${Date.now()}.${format}`;
      
      downloadFile(content, filename, mimeType);
      alert(t('dataDownload.exportSuccess'));
    } catch (err) {
      console.error('Failed to export data:', err);
      alert(t('dataDownload.exportError'));
    }
  };

  const handleSavePrivacySettings = async () => {
    if (!user) return;

    setSavingSettings(true);
    try {
      await updatePrivacySettingsService(user.uid, {
        profileVisibility,
        searchEngineIndexing,
      });
      alert(t('dataVisibility.saveSuccess'));
    } catch (err) {
      console.error('Failed to save privacy settings:', err);
      alert(t('dataVisibility.saveError'));
    } finally {
      setSavingSettings(false);
    }
  };

  const handleSaveCookiePreferences = async () => {
    if (!user) return;

    setSavingSettings(true);
    try {
      await updateCookiePreferencesService(user.uid, {
        essential: true, // Always true
        analytics: cookieAnalytics,
        marketing: cookieMarketing,
      });
      alert(t('cookies.saveSuccess'));
    } catch (err) {
      console.error('Failed to save cookie preferences:', err);
      alert(t('cookies.saveError'));
    } finally {
      setSavingSettings(false);
    }
  };

  const handleSaveEmailPreferences = async () => {
    if (!user) return;

    setSavingSettings(true);
    try {
      await updateEmailPreferencesService(user.uid, {
        newsletter: emailNewsletter,
        marketing: emailMarketing,
        updates: emailUpdates,
        security: emailSecurity,
      });
      alert(t('notifications.saveSuccess'));
    } catch (err) {
      console.error('Failed to save email preferences:', err);
      alert(t('notifications.saveError'));
    } finally {
      setSavingSettings(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Data Download Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            {t('dataDownload.title')}
          </CardTitle>
          <CardDescription>{t('dataDownload.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setExportDialogOpen(true)}>
            <Download className="mr-2 h-4 w-4" />
            {t('dataDownload.button')}
          </Button>
        </CardContent>
      </Card>

      {/* Profile Visibility Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {profileVisibility === 'public' ? (
              <Eye className="h-5 w-5" />
            ) : (
              <EyeOff className="h-5 w-5" />
            )}
            {t('dataVisibility.title')}
          </CardTitle>
          <CardDescription>{t('dataVisibility.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup value={profileVisibility} onValueChange={(v) => setProfileVisibility(v as typeof profileVisibility)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="public" id="public" />
              <Label htmlFor="public" className="cursor-pointer">
                <div>
                  <p className="font-medium">{t('dataVisibility.public')}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('dataVisibility.publicDesc')}
                  </p>
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="private" id="private" />
              <Label htmlFor="private" className="cursor-pointer">
                <div>
                  <p className="font-medium">{t('dataVisibility.private')}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('dataVisibility.privateDesc')}
                  </p>
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="friends" id="friends" />
              <Label htmlFor="friends" className="cursor-pointer">
                <div>
                  <p className="font-medium">{t('dataVisibility.friendsOnly')}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('dataVisibility.friendsOnlyDesc')}
                  </p>
                </div>
              </Label>
            </div>
          </RadioGroup>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="search-indexing" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                {t('dataVisibility.searchEngine')}
              </Label>
              <p className="text-sm text-muted-foreground">
                {t('dataVisibility.searchEngineDesc')}
              </p>
            </div>
            <Switch
              id="search-indexing"
              checked={searchEngineIndexing}
              onCheckedChange={setSearchEngineIndexing}
            />
          </div>

          <Button onClick={handleSavePrivacySettings} disabled={savingSettings}>
            {savingSettings && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('dataVisibility.save')}
          </Button>
        </CardContent>
      </Card>

      {/* Cookie Preferences Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cookie className="h-5 w-5" />
            {t('cookies.title')}
          </CardTitle>
          <CardDescription>{t('cookies.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="font-medium">{t('cookies.essential')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('cookies.essentialDesc')}
              </p>
            </div>
            <Switch checked disabled />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="cookie-analytics" className="font-medium">
                {t('cookies.analytics')}
              </Label>
              <p className="text-sm text-muted-foreground">
                {t('cookies.analyticsDesc')}
              </p>
            </div>
            <Switch
              id="cookie-analytics"
              checked={cookieAnalytics}
              onCheckedChange={setCookieAnalytics}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="cookie-marketing" className="font-medium">
                {t('cookies.marketing')}
              </Label>
              <p className="text-sm text-muted-foreground">
                {t('cookies.marketingDesc')}
              </p>
            </div>
            <Switch
              id="cookie-marketing"
              checked={cookieMarketing}
              onCheckedChange={setCookieMarketing}
            />
          </div>

          <Button onClick={handleSaveCookiePreferences} disabled={savingSettings}>
            {savingSettings && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('cookies.save')}
          </Button>
        </CardContent>
      </Card>

      {/* Email Notifications Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            {t('notifications.title')}
          </CardTitle>
          <CardDescription>{t('notifications.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="email-newsletter">{t('notifications.newsletter')}</Label>
            <Switch
              id="email-newsletter"
              checked={emailNewsletter}
              onCheckedChange={setEmailNewsletter}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <Label htmlFor="email-marketing">{t('notifications.marketing')}</Label>
            <Switch
              id="email-marketing"
              checked={emailMarketing}
              onCheckedChange={setEmailMarketing}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <Label htmlFor="email-updates">{t('notifications.updates')}</Label>
            <Switch
              id="email-updates"
              checked={emailUpdates}
              onCheckedChange={setEmailUpdates}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-security" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                {t('notifications.security')}
              </Label>
              <p className="text-sm text-muted-foreground">
                {t('notifications.securityDesc')}
              </p>
            </div>
            <Switch
              id="email-security"
              checked={emailSecurity}
              onCheckedChange={setEmailSecurity}
            />
          </div>

          <Button onClick={handleSaveEmailPreferences} disabled={savingSettings}>
            {savingSettings && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('notifications.save')}
          </Button>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <DataExportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        onExport={handleExportData}
      />
    </div>
  );
}
