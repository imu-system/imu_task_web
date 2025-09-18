

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
  '/dashboard/notifications/preferences': '/dashboard/notifications/preferences',
  '/dashboard/stats': '/dashboard/stats',
  '/dashboard/stats/compare': '/dashboard/stats/compare',
  '/dashboard/stats/tax': '/dashboard/stats/tax',
  '/dashboard/stats/goals': '/dashboard/stats/goals',
  '/dashboard/stats/missions': '/dashboard/stats/missions',
  '/dashboard/admin/support/tickets': '/dashboard/admin/support/tickets',
  '/dashboard/admin/support/tickets/[id]': '/dashboard/admin/support/tickets/[id]',
  '/legal/terms': '/legal/terms',
  '/dashboard/admin/notifications': '/dashboard/admin/notifications',
  '/dashboard/admin/notifications/broadcast': '/dashboard/admin/notifications/broadcast',
  '/dashboard/admin/notifications/templates': '/dashboard/admin/notifications/templates',
  '/dashboard/admin/notifications/templates/edit/[id]': '/dashboard/admin/notifications/templates/edit/[id]',
  '/dashboard/academy': '/dashboard/academy',
  '/dashboard/academy/course/[id]': '/dashboard/academy/course/[id]',
  '/dashboard/academy/course/[id]/quiz': '/dashboard/academy/course/[id]/quiz',
  '/dashboard/academy/certificate/[id]': '/dashboard/academy/certificate/[id]',
  '/dashboard/admin/academy': '/dashboard/admin/academy',
  '/dashboard/referrals': '/dashboard/referrals',
  '/dashboard/referrals/rewards': '/dashboard/referrals/rewards',
  '/dashboard/referrals/history': '/dashboard/referrals/history',
  '/dashboard/settings': '/dashboard/settings',
  '/dashboard/settings/account': '/dashboard/settings/account',
  '/dashboard/settings/security': '/dashboard/settings/security',
  '/dashboard/settings/billing': '/dashboard/settings/billing',
  '/dashboard/settings/privacy': '/dashboard/settings/privacy',

  // If locales use different paths, you can
  // specify each external path per locale.
  '/about': {
    en: '/about',
    fr: '/a-propos',
    jp: '/about',
  },
  '/legal': {
    en: '/legal',
    fr: '/legal',
    jp: '/legal',
  }

};

export const {Link, redirect, usePathname, useRouter} =
  createLocalizedPathnamesNavigation({locales, pathnames});
