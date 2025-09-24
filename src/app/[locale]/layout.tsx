
import {ReactNode} from 'react';
import {notFound} from 'next/navigation';
import {NextIntlClientProvider} from 'next-intl';
import {getRequestConfig} from 'next-intl/server';
import {locales, type Locale} from '@/lib/locales';
import { AuthProvider } from '@/hooks/use-auth';
import { Toaster } from '@/components/ui/toaster';


type Props = {
  children: ReactNode;
  params: {locale: string};
};

// This is the root layout. It applies to all routes.
// It's a good place for providers, but not for visual layout
// that should differ between public and authenticated pages.
export default async function LocaleLayout({children, params}: Props) {
  const locale = params.locale;
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as Locale)) notFound();

  let messages;
  try {
    messages = (await import(`@/messages/${locale}.json`)).default;
  } catch (error) {
    notFound();
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
        <AuthProvider>
            {children}
            <Toaster />
        </AuthProvider>
    </NextIntlClientProvider>
  );
}
