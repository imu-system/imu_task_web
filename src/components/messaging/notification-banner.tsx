/**
 * Notification Banner Component
 * 
 * Banner dismissible en haut de la page messages
 * Style WhatsApp avec icône et message
 */

'use client';

import { useState } from 'react';
import { X, Info, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type BannerType = 'info' | 'success' | 'warning';

interface NotificationBannerProps {
  type?: BannerType;
  message: string;
  onDismiss?: () => void;
  dismissible?: boolean;
}

const BANNER_STYLES: Record<BannerType, { bg: string; text: string; icon: typeof Info }> = {
  info: {
    bg: 'bg-blue-50 border-blue-200',
    text: 'text-blue-800',
    icon: Info,
  },
  success: {
    bg: 'bg-green-50 border-green-200',
    text: 'text-green-800',
    icon: CheckCircle,
  },
  warning: {
    bg: 'bg-amber-50 border-amber-200',
    text: 'text-amber-800',
    icon: AlertCircle,
  },
};

export function NotificationBanner({
  type = 'info',
  message,
  onDismiss,
  dismissible = true,
}: NotificationBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) return null;

  const { bg, text, icon: Icon } = BANNER_STYLES[type];

  return (
    <div 
      data-testid="notification-banner"
      className={cn(
        'flex items-center gap-3 px-4 py-3 border-b',
        bg,
        'animate-in slide-in-from-top duration-300'
      )}
    >
      <Icon className={cn('h-5 w-5 flex-shrink-0', text)} />
      <p className={cn('text-sm flex-1', text)}>{message}</p>
      {dismissible && (
        <Button
          data-testid="banner-dismiss"
          variant="ghost"
          size="icon"
          className={cn('h-6 w-6 flex-shrink-0', text, 'hover:bg-black/5')}
          onClick={handleDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
