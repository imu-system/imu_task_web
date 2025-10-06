import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

export const locales = ['en', 'fr', 'ja'];

export default getRequestConfig(async ({ requestLocale }) => {
  // Await the locale
  const locale = await requestLocale;

  if (!locales.includes(locale as any)) notFound();

  // Import from src/messages instead of public/locales
  const messages = (await import(`./messages/${locale}.json`)).default;

  return {
    locale,
    messages
  };
});
