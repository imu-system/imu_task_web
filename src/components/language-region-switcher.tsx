'use client';

import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Globe } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function LanguageRegionSwitcher() {
  const tLang = useTranslations('LanguageSwitcher');

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon">
          <Globe className="h-5 w-5" />
          <span className="sr-only">{tLang('changeLanguage')}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Langue & Région</h4>
            <p className="text-sm text-muted-foreground">
              Sélectionnez votre langue et région préférées.
            </p>
          </div>
          {/* Placeholder for the language/region grid */}
        </div>
      </PopoverContent>
    </Popover>
  );
}
