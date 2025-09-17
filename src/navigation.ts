
import {createLocalizedPathnamesNavigation} from 'next-intl/navigation';

export const locales = ['en', 'fr', 'jp'] as const;
export type Locale = (typeof locales)[number];

// The `pathnames` object holds pairs of internal
// and external paths, separated by locale.
export const pathnames = {
  // If all locales use the same path, a single
  // external path can be used for all locales.
  '/': '/',
  '/dashboard': '/dashboard',
  '/sign-in': {
    en: '/sign-in',
    fr: '/connexion',
    jp: '/sign-in',
  },
  '/inscription': {
    en: '/sign-up',
    fr: '/inscription',
    jp: '/sign-up',
  },
  '/dashboard/profile': '/dashboard/profile',
  '/dashboard/profile/edit': '/dashboard/profile/edit',
  '/dashboard/profile/badges': '/dashboard/profile/badges',
  '/dashboard/profile/kyc': '/dashboard/profile/kyc',
  '/dashboard/availability': '/dashboard/availability',
  '/dashboard/reviews': '/dashboard/reviews',
  '/dashboard/notifications': '/dashboard/notifications',
  '/legal/terms': '/legal/terms',

  // If locales use different paths, you can
  // specify each external path per locale.
  '/about': {
    en: '/about',
    fr: '/a-propos',
    jp: '/about',
  },

};

export const {Link, redirect, usePathname, useRouter} =
  createLocalizedPathnamesNavigation({locales, pathnames});

    