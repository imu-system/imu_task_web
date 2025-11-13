'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from '@/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, Bell, BellOff, CheckCircle2, AlertCircle } from 'lucide-react';
import {
  getProviderPreferences,
  saveProviderPreferences,
} from '@/lib/firestore-provider-preferences';
import type { ProviderPreferences } from '@/lib/task-matching';

const SERVICE_CATEGORIES = [
  { id: 'home_services', labelKey: 'homeServices' },
  { id: 'delivery', labelKey: 'delivery' },
  { id: 'digital_help', labelKey: 'digitalHelp' },
  { id: 'moving', labelKey: 'moving' },
  { id: 'companionship', labelKey: 'companionship' },
  { id: 'gardening', labelKey: 'gardening' },
  { id: 'pet_care', labelKey: 'petCare' },
  { id: 'events', labelKey: 'events' },
] as const;

export default function NotificationSettingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const t = useTranslations('NotificationSettings');
  const tCommon = useTranslations('Common');

  // State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Preferences state
  const [enableNotifications, setEnableNotifications] = useState(true);
  const [serviceRadius, setServiceRadius] = useState(25);
  const [minBudget, setMinBudget] = useState(0);
  const [maxBudget, setMaxBudget] = useState(500);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [channels, setChannels] = useState<('in-app' | 'email' | 'push')[]>(['in-app']);

  // Check if user is provider
  useEffect(() => {
    if (!user) {
      router.push('/auth/signin');
      return;
    }

    const hasProviderRole = user.roles?.includes('provider' as any);
    const isProvider = user.profile?.accountType === 'professional' || hasProviderRole;

    if (!isProvider) {
      router.push('/dashboard');
    }
  }, [user, router]);

  // Load preferences
  useEffect(() => {
    const loadPreferences = async () => {
      if (!user?.id) return;

      setLoading(true);
      try {
        const prefs = await getProviderPreferences(user.id);

        if (prefs) {
          setEnableNotifications(prefs.enableTaskNotifications ?? true);
          setServiceRadius(prefs.serviceRadiusKm ?? 25);
          setMinBudget(prefs.minBudget ?? 0);
          setMaxBudget(prefs.maxBudget ?? 500);
          setSelectedCategories(prefs.preferredCategories ?? []);
          setChannels(prefs.notificationChannels ?? ['in-app']);
        }
      } catch (err) {
        console.error('Error loading preferences:', err);
        setError(t('errorLoading') || 'Failed to load preferences');
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, [user, t]);

  // Handle save
  const handleSave = async () => {
    if (!user?.id) return;

    setSaving(true);
    setSuccess(false);
    setError('');

    try {
      const preferences: ProviderPreferences = {
        enableTaskNotifications: enableNotifications,
        serviceRadiusKm: serviceRadius,
        minBudget,
        maxBudget,
        preferredCategories: selectedCategories,
        notificationChannels: channels,
      };

      await saveProviderPreferences(user.id, preferences);

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving preferences:', err);
      setError(t('errorSaving') || 'Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  // Handle category toggle
  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev: string[]) =>
      prev.includes(categoryId)
        ? prev.filter((id: string) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // Handle channel toggle
  const toggleChannel = (channel: 'in-app' | 'email' | 'push') => {
    setChannels((prev: ('in-app' | 'email' | 'push')[]) =>
      prev.includes(channel)
        ? prev.filter((c: 'in-app' | 'email' | 'push') => c !== channel)
        : [...prev, channel]
    );
  };

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto py-6 px-4" data-testid="notification-settings-page">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Bell className="h-8 w-8" />
          {t('title') || 'Notification Settings'}
        </h1>
        <p className="text-muted-foreground">
          {t('description') || 'Configure which tasks you want to be notified about'}
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="pt-6 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>{t('loading') || 'Loading preferences...'}</span>
          </CardContent>
        </Card>
      )}

      {/* Settings Form */}
      {!loading && (
        <div className="space-y-6">
          {/* Success/Error Messages */}
          {success && (
            <Alert className="bg-green-50 border-green-200" data-testid="success-message">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                {t('saveSuccess') || 'Preferences saved successfully!'}
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive" data-testid="error-message">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Enable/Disable Notifications */}
          <Card>
            <CardHeader>
              <CardTitle>{t('enableTitle') || 'Task Notifications'}</CardTitle>
              <CardDescription>
                {t('enableDescription') || 'Receive notifications when new relevant tasks are posted'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {enableNotifications ? (
                    <Bell className="h-5 w-5 text-blue-600" />
                  ) : (
                    <BellOff className="h-5 w-5 text-gray-400" />
                  )}
                  <Label htmlFor="enable-notifications" className="font-medium">
                    {enableNotifications
                      ? (t('enabled') || 'Enabled')
                      : (t('disabled') || 'Disabled')}
                  </Label>
                </div>
                <Switch
                  id="enable-notifications"
                  checked={enableNotifications}
                  onCheckedChange={setEnableNotifications}
                  data-testid="enable-notifications-switch"
                />
              </div>
            </CardContent>
          </Card>

          {/* Preferred Categories */}
          <Card>
            <CardHeader>
              <CardTitle>{t('categoriesTitle') || 'Preferred Categories'}</CardTitle>
              <CardDescription>
                {t('categoriesDescription') || 'Select which types of tasks you want to receive'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SERVICE_CATEGORIES.map(cat => (
                  <div key={cat.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${cat.id}`}
                      checked={selectedCategories.includes(cat.id)}
                      onCheckedChange={() => toggleCategory(cat.id)}
                      disabled={!enableNotifications}
                      data-testid={`category-checkbox-${cat.id}`}
                    />
                    <Label
                      htmlFor={`category-${cat.id}`}
                      className={!enableNotifications ? 'text-muted-foreground' : ''}
                    >
                      {tCommon(`categories.${cat.id}` as any) || cat.id}
                    </Label>
                  </div>
                ))}
              </div>

              {selectedCategories.length === 0 && enableNotifications && (
                <p className="text-sm text-muted-foreground mt-4">
                  {t('noCategoriesWarning') || 'Select at least one category to receive notifications'}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Service Radius */}
          <Card>
            <CardHeader>
              <CardTitle>{t('radiusTitle') || 'Service Radius'}</CardTitle>
              <CardDescription>
                {t('radiusDescription') || 'Maximum distance you\'re willing to travel for tasks'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <Label>{t('radius') || 'Radius'}</Label>
                  <Badge variant="secondary">{serviceRadius} km</Badge>
                </div>
                <Slider
                  value={[serviceRadius]}
                  onValueChange={([value]) => setServiceRadius(value)}
                  min={5}
                  max={100}
                  step={5}
                  disabled={!enableNotifications}
                  data-testid="service-radius-slider"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>5 km</span>
                  <span>100 km</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Budget Range */}
          <Card>
            <CardHeader>
              <CardTitle>{t('budgetTitle') || 'Budget Range'}</CardTitle>
              <CardDescription>
                {t('budgetDescription') || 'Only receive notifications for tasks within this budget range'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="min-budget">{t('minBudget') || 'Minimum Budget'}</Label>
                  <Input
                    id="min-budget"
                    type="number"
                    value={minBudget}
                    onChange={(e) => setMinBudget(Number(e.target.value))}
                    min={0}
                    disabled={!enableNotifications}
                    data-testid="min-budget-input"
                  />
                </div>
                <div>
                  <Label htmlFor="max-budget">{t('maxBudget') || 'Maximum Budget'}</Label>
                  <Input
                    id="max-budget"
                    type="number"
                    value={maxBudget}
                    onChange={(e) => setMaxBudget(Number(e.target.value))}
                    min={minBudget}
                    disabled={!enableNotifications}
                    data-testid="max-budget-input"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Channels */}
          <Card>
            <CardHeader>
              <CardTitle>{t('channelsTitle') || 'Notification Channels'}</CardTitle>
              <CardDescription>
                {t('channelsDescription') || 'Choose how you want to receive notifications'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="channel-in-app"
                    checked={channels.includes('in-app')}
                    onCheckedChange={() => toggleChannel('in-app')}
                    disabled={!enableNotifications}
                    data-testid="channel-in-app"
                  />
                  <Label htmlFor="channel-in-app">
                    {t('channelInApp') || 'In-app notifications'}
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="channel-email"
                    checked={channels.includes('email')}
                    onCheckedChange={() => toggleChannel('email')}
                    disabled={!enableNotifications}
                    data-testid="channel-email"
                  />
                  <Label htmlFor="channel-email">
                    {t('channelEmail') || 'Email notifications'}
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="channel-push"
                    checked={channels.includes('push')}
                    onCheckedChange={() => toggleChannel('push')}
                    disabled={!enableNotifications}
                    data-testid="channel-push"
                  />
                  <Label htmlFor="channel-push">
                    {t('channelPush') || 'Push notifications'}
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard')}
              disabled={saving}
            >
              {t('cancel') || 'Cancel'}
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              data-testid="save-button"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('saving') || 'Saving...'}
                </>
              ) : (
                t('save') || 'Save Preferences'
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
