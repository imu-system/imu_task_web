import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

type Props = {
  children: React.ReactNode;
  params: {locale: string};
};

export const metadata: Metadata = {
  title: 'ImuTask',
  description: 'Streamline your tasks and connect with providers.',
};

export default function RootLayout({
  children,
  params: {locale}
}: Props) {
  return (
    <html lang={locale}>
      <body className="font-body antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
