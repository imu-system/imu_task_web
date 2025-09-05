import {createLocalizedPathnamesNavigation} from 'next-intl/navigation';

export const locales = ['en', 'fr'] as const;

// The `pathnames` object holds pairs of internal
// and external paths, separated by locale.
export const pathnames = {
  // If all locales use the same path, a single
  // external path can be used for all locales.
  '/': '/',
  '/dashboard': '/dashboard',

  // If locales use different paths, you can
  // specify each external path per locale.
  '/about': {
    en: '/about',
    fr: '/a-propos'
  },

};

export const {Link, redirect, usePathname, useRouter} =
  createLocalizedPathnamesNavigation({locales, pathnames});
