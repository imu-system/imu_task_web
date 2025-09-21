
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
      <DialogContent className="max-w-4xl h-full sm:h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="sr-only">Settings</DialogTitle>
        </DialogHeader>
        <div className="flex-1 flex gap-6 overflow-hidden">
            <div className="w-[30%] border-r pr-6">
                 <SettingsNav />
            </div>
            <div className="w-[70%] overflow-y-auto pr-6">
                <p>Le contenu des paramètres s'affichera ici.</p>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
