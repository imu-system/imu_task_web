
'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { WifiOff } from 'lucide-react';

export default function OfflineBanner() {
  const t = useTranslations('OfflineBanner');
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => setIsOffline(false);

    // Check on mount
    if (typeof window !== 'undefined' && !window.navigator.onLine) {
        handleOffline();
    }

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  if (!isOffline) {
    return null;
  }

  return (
    <div className="bg-destructive text-destructive-foreground py-2 px-4 flex items-center justify-center gap-2 text-sm z-50 relative">
      <WifiOff className="h-5 w-5" />
      <p>{t('offlineMessage')}</p>
    </div>
  );
}
