'use client';

import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/hooks/use-notifications';

export function NotificationPermissionBanner() {
  const { permission, isSupported, requestPermission } = useNotifications();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    // Check if user previously dismissed the banner
    const dismissed = localStorage.getItem('notification-banner-dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
    }
  }, []);

  const handleRequestPermission = async () => {
    setIsRequesting(true);
    try {
      await requestPermission();
    } finally {
      setIsRequesting(false);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('notification-banner-dismissed', 'true');
  };

  // Don't show if:
  // - Not supported
  // - Permission already granted
  // - User dismissed
  // - Permission denied
  if (!isSupported || permission === 'granted' || isDismissed || permission === 'denied') {
    return null;
  }

  return (
    <Alert className="mb-4">
      <Bell className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <p className="font-medium">Enable notifications</p>
          <p className="text-sm text-muted-foreground">
            Get notified when you receive new messages
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleRequestPermission}
            disabled={isRequesting}
          >
            {isRequesting ? 'Enabling...' : 'Enable'}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
