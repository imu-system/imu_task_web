
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SettingsNav } from './settings-nav';

export function SettingsModal({ children }: { children: React.ReactNode }) {
  return (
    <Dialog>
      {children}
      <DialogContent className="max-w-4xl h-full sm:h-[90vh]">
        <DialogHeader>
          <DialogTitle className="sr-only">Settings</DialogTitle>
        </DialogHeader>
        <div className="flex h-full">
            <div className="w-[30%] border-r pr-6">
                 <SettingsNav />
            </div>
            <div className="w-[70%] pl-6">
                <p>Content goes here</p>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
