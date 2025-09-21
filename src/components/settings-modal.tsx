
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SettingsNav, type SettingsTab } from './settings-nav';
import { useState } from 'react';
import AccountSettings from './settings/account-settings';
import SecuritySettings from './settings/security-settings';
import BillingSettings from './settings/billing-settings';
import PrivacySettings from './settings/privacy-settings';

export function SettingsModal({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('account');

  const renderContent = () => {
    switch (activeTab) {
      case 'account':
        return <AccountSettings />;
      case 'security':
        return <SecuritySettings />;
      case 'billing':
        return <BillingSettings />;
      case 'privacy':
        return <PrivacySettings />;
      default:
        return null;
    }
  };

  return (
    <Dialog>
      {children}
      <DialogContent className="max-w-4xl h-full sm:h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="sr-only">Settings</DialogTitle>
        </DialogHeader>
        <div className="flex-1 flex gap-6 overflow-hidden p-6 pt-2">
            <div className="w-[30%] border-r pr-6">
                 <SettingsNav activeTab={activeTab} onTabChange={setActiveTab} />
            </div>
            <div className="w-[70%] overflow-y-auto pr-6">
                {renderContent()}
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
