import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'ImuTask - Vos besoins, leur mission.',
  description:
    'Connecte personnes âgées et actifs avec des étudiants pour des services du quotidien.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
