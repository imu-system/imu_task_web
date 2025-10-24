'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { ScrollArea } from './ui/scroll-area';

type LanguageOption = {
  code: (typeof locales)[number];
  name: string;
  region: string;
  flag: string;
};

const languageOptions: LanguageOption[] = [
  { code: 'fr', name: 'Français', region: 'France', flag: '🇫🇷' },
  { code: 'en', name: 'English', region: 'United States', flag: '🇺🇸' },
  { code: 'ja', name: '日本語', region: '日本', flag: '🇯🇵' },
];

type CurrencyOption = {
  code: string;
  name: string;
  symbol: string;
  flag: string;
};

const currencyOptions: CurrencyOption[] = [
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr', flag: '🇨🇭' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳' },
];

interface LanguageCurrencyModalProps {
  variant?: 'ghost' | 'outline' | 'default';
  className?: string;
}

export default function LanguageCurrencyModal({ 
  variant = 'ghost',
  className 
}: LanguageCurrencyModalProps) {
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
    setSearchTerm('');
  };

  const handleCurrencyChange = (currencyCode: string) => {
    setSelectedCurrency(currencyCode);
    // In a real app, this would update global state (Context/Zustand/Redux)
    // For now, we just update local state
    setOpen(false);
  };

  const filteredLanguages = languageOptions.filter((option) =>
    tLanguages(option.code as any)
      .toLowerCase()
      .includes(searchTerm.toLowerCase()) ||
    tCountries(option.code as any)
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const currentLanguage = languageOptions.find(lang => lang.code === currentLocale);
  const currentCurrencyOption = currencyOptions.find(curr => curr.code === selectedCurrency);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} className={cn("gap-2", className)}>
          <Globe className="h-5 w-5" />
          <span className="hidden md:inline text-sm font-medium">
            {currentLanguage?.flag} {currentLocale.toUpperCase()} | {currentCurrencyOption?.symbol} {selectedCurrency}
          </span>
          <span className="sr-only">{t('changeLanguageRegionCurrency')}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] rounded-3xl p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-2xl font-headline">
            {t('title')}
          </DialogTitle>
          <DialogDescription>
            {t('description')}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="language" className="w-full">
          <div className="px-6">
            <TabsList className="grid w-full grid-cols-2 h-12 rounded-2xl">
              <TabsTrigger value="language" className="rounded-xl text-base">
                {t('languageRegion')}
              </TabsTrigger>
              <TabsTrigger value="currency" className="rounded-xl text-base">
                {t('currency')}
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="language" className="px-6 pb-6 mt-6">
            <div className="space-y-4">
              <div className="relative">
                <Label htmlFor="search-language" className="sr-only">
                  {t('searchPlaceholder')}
                </Label>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="search-language"
                  placeholder={t('searchPlaceholder')}
                  className="pl-10 h-12 rounded-2xl"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <ScrollArea className="h-[400px] pr-4">
                <div className="grid grid-cols-2 gap-3">
                  {filteredLanguages.map((option) => (
                    <button
                      key={option.code}
                      onClick={() => handleLanguageChange(option.code)}
                      className={cn(
                        'flex items-start gap-3 p-4 rounded-2xl border-2 text-left transition-all duration-200',
                        'hover:bg-accent/50 hover:border-primary/50 hover:shadow-md',
                        currentLocale === option.code
                          ? 'border-primary bg-primary/5 shadow-md'
                          : 'border-border'
                      )}
                    >
                      <span className="text-3xl mt-0.5">{option.flag}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">
                          {tLanguages(option.code as any)}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {tCountries(option.code as any)}
                        </p>
                      </div>
                      {currentLocale === option.code && (
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                      )}
                    </button>
                  ))}
                </div>
              </ScrollArea>

              {filteredLanguages.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Globe className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">{t('noResults')}</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="currency" className="px-6 pb-6 mt-6">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {t('currencyDescription')}
              </p>

              <ScrollArea className="h-[400px] pr-4">
                <div className="grid grid-cols-2 gap-3">
                  {currencyOptions.map((option) => (
                    <button
                      key={option.code}
                      onClick={() => handleCurrencyChange(option.code)}
                      className={cn(
                        'flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all duration-200',
                        'hover:bg-accent/50 hover:border-primary/50 hover:shadow-md',
                        selectedCurrency === option.code
                          ? 'border-primary bg-primary/5 shadow-md'
                          : 'border-border'
                      )}
                    >
                      <span className="text-3xl">{option.flag}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold">
                          {tCurrencies(option.code as any)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {option.code}
                        </p>
                      </div>
                      <span className="text-2xl font-bold text-primary flex-shrink-0">
                        {option.symbol}
                      </span>
                      {selectedCurrency === option.code && (
                        <Check className="h-5 w-5 text-primary flex-shrink-0 ml-2" />
                      )}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
