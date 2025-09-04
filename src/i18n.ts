import {notFound} from 'next/navigation';
import {getRequestConfig} from 'next-intl/server';

export const locales = ['en', 'fr', 'de', 'es', 'ja'];

export default getRequestConfig(async ({locale}) => {
  if (!locales.includes(locale as any)) notFound();

  const messages = await Promise.all([
    import(`../public/locales/${locale}/common.json`).then((m) => m.default),
    import(`../public/locales/${locale}/auth.json`).then((m) => m.default),
    import(`../public/locales/${locale}/landing.json`).then((m) => m.default),
    import(`../public/locales/${locale}/tasks.json`).then((m) => m.default),
    import(`../public/locales/${locale}/payments.json`).then((m) => m.default)
  ]);

  return {
    messages: Object.assign({}, ...messages)
  };
});
