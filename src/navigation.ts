
'use client';

import {createLocalizedPathnamesNavigation} from 'next-intl/navigation';
import { useSearchParams as useNextSearchParams } from 'next/navigation';
import { locales, pathnames } from './lib/locales';

const navigation = createLocalizedPathnamesNavigation({locales, pathnames});

export const {Link, redirect, usePathname, useRouter, useParams} = navigation;

// Re-export useSearchParams to avoid confusion
export const useSearchParams = useNextSearchParams;
