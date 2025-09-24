'use client';

import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Globe } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function LanguageRegionSwitcher() {
  const t = useTranslations('LanguageSwitcher');

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon">
          <Globe className="h-5 w-5" />
          <span className="sr-only">{t('changeLanguage')}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <Tabs defaultValue="language-region">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="language-region">{t('languageRegion')}</TabsTrigger>
                <TabsTrigger value="currency">{t('currency')}</TabsTrigger>
            </TabsList>
            <TabsContent value="language-region">
                 <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <h4 className="font-medium leading-none">{t('languageRegion')}</h4>
                        <p className="text-sm text-muted-foreground">
                        {t('languageRegionDescription')}
                        </p>
                    </div>
                    {/* La grille de sélection sera ajoutée ici */}
                </div>
            </TabsContent>
             <TabsContent value="currency">
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <h4 className="font-medium leading-none">{t('currency')}</h4>
                        <p className="text-sm text-muted-foreground">
                        {t('currencyDescription')}
                        </p>
                    </div>
                     {/* La grille de sélection des devises sera ajoutée ici */}
                </div>
            </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}
