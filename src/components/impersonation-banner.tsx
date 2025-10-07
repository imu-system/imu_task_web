
'use client';

import { useRouter } from '@/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from './ui/button';
import { AlertCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function ImpersonationBanner() {
  const { impersonatingUser, stopImpersonation } = useAuth();
  const t = useTranslations('ImpersonationBanner');

  if (!impersonatingUser) {
    return null;
  }

  return (
    <div className="bg-yellow-500 text-yellow-900 py-2 px-4 flex items-center justify-center gap-4 text-sm z-50 relative">
      <AlertCircle className="h-5 w-5" />
      <p>
        {t('impersonateWarning', { email: impersonatingUser.email })}
      </p>
      <Button
        variant="ghost"
        size="sm"
        onClick={stopImpersonation}
        className="text-current hover:bg-yellow-400/50 hover:text-yellow-900"
      >
        {t('stopImpersonation')}
      </Button>
    </div>
  );
}
