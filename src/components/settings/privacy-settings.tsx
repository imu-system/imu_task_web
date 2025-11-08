
'use client';

import { useState } from 'react';
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

export default function PrivacySettings() {
  const { user, loading } = useAuth();
  const t = useTranslations('SettingsPage.privacy');

  // Dialog states
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  
  // Mock settings - Will be fetched from Firestore in Task 6
  const [profileVisibility, setProfileVisibility] = useState<'public' | 'private' | 'friends'>('public');
  const [searchEngineIndexing, setSearchEngineIndexing] = useState(true);
  const [cookieAnalytics, setCookieAnalytics] = useState(true);
  const [cookieMarketing, setCookieMarketing] = useState(false);
  const [emailNewsletter, setEmailNewsletter] = useState(true);
  const [emailMarketing, setEmailMarketing] = useState(false);
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [emailSecurity, setEmailSecurity] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);

  // Placeholder handlers - Will be replaced with real Firebase calls in Task 6
  const handleExportData = async (format: 'json' | 'csv', categories: string[]) => {
    console.log('Exporting data:', format, categories);
    // TODO Task 6: Generate and download user data export
    // const data = await generateUserDataExport(userId, categories);
    // const blob = format === 'json' ? new Blob([JSON.stringify(data)]) : convertToCSV(data);
    // downloadFile(blob, `data-export-${Date.now()}.${format}`);
    
    // Simulate delay
    await new Promise((resolve) => setTimeout(resolve, 2000));
    alert(t('dataDownload.exportSuccess'));
  };

  const handleSavePrivacySettings = async () => {
    setSavingSettings(true);
    try {
      console.log('Saving privacy settings:', {
        profileVisibility,
        searchEngineIndexing,
      });
      // TODO Task 6: Save to Firestore
      // await updateDoc(doc(db, 'users', userId), {
      //   privacySettings: { profileVisibility, searchEngineIndexing }
      // });
      alert(t('dataVisibility.saveSuccess'));
    } catch (err) {
      console.error('Failed to save privacy settings:', err);
      alert(t('dataVisibility.saveError'));
    } finally {
      setSavingSettings(false);
    }
  };

  const handleSaveCookiePreferences = async () => {
    setSavingSettings(true);
    try {
      console.log('Saving cookie preferences:', {
        analytics: cookieAnalytics,
        marketing: cookieMarketing,
      });
      // TODO Task 6: Save to localStorage and Firestore
      // localStorage.setItem('cookiePreferences', JSON.stringify({ analytics, marketing }));
      alert(t('cookies.saveSuccess'));
    } catch (err) {
      console.error('Failed to save cookie preferences:', err);
      alert(t('cookies.saveError'));
    } finally {
      setSavingSettings(false);
    }
  };

  const handleSaveEmailPreferences = async () => {
    setSavingSettings(true);
    try {
      console.log('Saving email preferences:', {
        newsletter: emailNewsletter,
        marketing: emailMarketing,
        updates: emailUpdates,
        security: emailSecurity,
      });
      // TODO Task 6: Save to Firestore
      // await updateDoc(doc(db, 'users', userId), {
      //   emailPreferences: { newsletter, marketing, updates, security }
      // });
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
