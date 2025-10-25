
'use client';

import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Check, Globe, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from './ui/input';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { locales } from '@/lib/locales';
import { Label } from './ui/label';

type LanguageOption = {
  code: (typeof locales)[number];
  name: string;
  region: string;
};

const languageOptions: LanguageOption[] = [
  { code: 'fr', name: 'Français', region: 'France' },
  { code: 'en', name: 'English', region: 'United States' },
  { code: 'ja', name: '日本語', region: '日本' },
];

type CurrencyOption = {
    code: string;
    name: string;
    symbol: string;
};

const currencyOptions: CurrencyOption[] = [
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
];


export default function LanguageRegionSwitcher() {
  const t = useTranslations('LanguageSwitcher');
  const tCountries = useTranslations('Countries');
  const tLanguages = useTranslations('Languages');
  const tCurrencies = useTranslations('Currencies');
  const currentLocale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('EUR');


  const handleLanguageChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
    setOpen(false);
  };
  
  const handleCurrencyChange = (currencyCode: string) => {
      setSelectedCurrency(currencyCode);
      // In a real app, this would likely update a global state (Context/Zustand/Redux)
      // For now, we just update the local state.
      setOpen(false);
  }

  const filteredOptions = languageOptions.filter(option => 
    tLanguages(option.code as any).toLowerCase().includes(searchTerm.toLowerCase()) ||
    tCountries(option.code as any).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="gap-1">
          <Globe className="h-5 w-5" />
           <span className="hidden text-sm font-medium sm:inline">
            {currentLocale.toUpperCase()} | {selectedCurrency}
          </span>
          <span className="sr-only">{t('changeLanguageRegionCurrency')}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 imu-glass p-4" align="end">
        <Tabs defaultValue="language-region">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="language-region">
              {t('languageRegion')}
            </TabsTrigger>
            <TabsTrigger value="currency">{t('currency')}</TabsTrigger>
          </TabsList>
          <TabsContent value="language-region">
            <div className="py-4">
              <div className="relative mb-4">
                  <Label htmlFor="search-language" className="sr-only">{t('searchPlaceholder')}</Label>
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                  <Input 
                      id="search-language"
                      placeholder={t('searchPlaceholder')} 
                      className="pl-8" 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                  />
              </div>
              <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-2">
                {filteredOptions.map((option) => (
                  <button
                    key={option.code}
                    onClick={() => handleLanguageChange(option.code)}
                    className={cn(
                      'flex flex-col items-start p-3 rounded-lg border text-left hover:bg-accent/50 transition-colors relative',
                      currentLocale === option.code && 'border-primary ring-2 ring-primary'
                    )}
                  >
                    <span className="text-sm font-medium">{tLanguages(option.code as any)}</span>
                    <span className="text-xs text-muted-foreground">{tCountries(option.code as any)}</span>
                    {currentLocale === option.code && (
                        <Check className="h-4 w-4 absolute top-2 right-2 text-primary"/>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </TabsContent>
          <TabsContent value="currency">
             <div className="py-4">
                <p className="text-sm text-muted-foreground mb-4">
                  {t('currencyDescription')}
                </p>
                <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-2">
                    {currencyOptions.map((option) => (
                        <button
                            key={option.code}
                            onClick={() => handleCurrencyChange(option.code)}
                             className={cn(
                                'flex items-center justify-between p-3 rounded-lg border text-left hover:bg-accent/50 transition-colors',
                                selectedCurrency === option.code && 'border-primary ring-2 ring-primary'
                            )}
                        >
                            <div>
                                <p className="text-sm font-medium">{tCurrencies(option.code as any)}</p>
                                <p className="text-xs text-muted-foreground">{option.code}</p>
                            </div>
                            <span className="text-xl font-semibold">{option.symbol}</span>
                        </button>
                    ))}
                </div>
            </div>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}
