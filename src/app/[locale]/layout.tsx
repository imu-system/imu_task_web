
import {ReactNode} from 'react';
import {notFound} from 'next/navigation';
import {NextIntlClientProvider, useMessages} from 'next-intl';
import {unstable_setRequestLocale} from 'next-intl/server';
import Header from '@/components/header';
import Footer from '@/components/footer';
import {locales, type Locale} from '@/navigation';
import { AuthProvider } from '@/hooks/use-auth';
import { Toaster } from '@/components/ui/toaster';

type Props = {
  children: ReactNode;
  params: {locale: string};
};

export default function LocaleLayout({children, params}: Props) {
  const {locale} = params;
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as Locale)) notFound();

  // Enable static rendering
  unstable_setRequestLocale(locale);

  const messages = useMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AuthProvider>
            <div className="relative flex min-h-dvh flex-col">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
            <Toaster />
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
