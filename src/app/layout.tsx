import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ImuTask',
  description: 'Streamline your tasks and connect with providers.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
