import {ReactNode} from 'react';
import {notFound} from 'next/navigation';
import {NextIntlClientProvider, useMessages} from 'next-intl';
import {unstable_setRequestLocale} from 'next-intl/server';
import {locales, type Locale} from '@/navigation';
import { AuthProvider } from '@/hooks/use-auth';
import { Toaster } from '@/components/ui/toaster';


type Props = {
  children: ReactNode;
  params: {locale: string};
};

// This is the root layout. It applies to all routes.
// It's a good place for providers, but not for visual layout
// that should differ between public and authenticated pages.
export default function LocaleLayout({children, params}: Props) {
  const {locale} = params;
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as Locale)) notFound();

  // Enable static rendering
  unstable_setRequestLocale(locale);

  const messages = useMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
        <AuthProvider>
            {children}
            <Toaster />
        </AuthProvider>
    </NextIntlClientProvider>
  );
}
