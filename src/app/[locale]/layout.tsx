import { NextIntlClientProvider } from 'next-intl';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';
import '../globals.css';
import { getMessages } from 'next-intl/server';
import { AuthProvider } from '@/contexts/AuthContext';
import { NotificationToastProvider } from '@/components/notifications';
import { ReactQueryProvider } from '@/lib/react-query/provider';

const inter = Inter({ subsets: ['latin'] });

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return {
    title: 'ImuTask',
    description: 'Streamline your tasks and connect with providers.',
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();
 
  return (
    <html lang={locale}>
      <body className={inter.className}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ReactQueryProvider>
            <AuthProvider>
              <NotificationToastProvider>
                {children}
                <Toaster />
              </NotificationToastProvider>
            </AuthProvider>
          </ReactQueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
