
'use client';

import { createLocalizedPathnamesNavigation } from 'next-intl/navigation';
import { useSearchParams as useNextSearchParams } from 'next/navigation';
import { locales, pathnames } from './lib/locales';

const navigation = createLocalizedPathnamesNavigation({ locales, pathnames });

// next-intl provides a strongly typed Link whose href is constrained to the
// literal pathnames. Many components build hrefs dynamically (template
// strings) or keep them as plain strings in fixtures; to avoid a large
// number of "Type 'string' is not assignable to ... Pathname" errors we
// export a loosened Link here. This is a pragmatic, temporary measure to
// reduce noise while we progressively align route typings and call-sites.
export const redirect = (navigation as any).redirect;
export const usePathname = (navigation as any).usePathname;
export const useRouter = (navigation as any).useRouter;
export const useParams = (navigation as any).useParams;

// Loosened Link: cast to any so components can pass string hrefs or
// template strings without TypeScript failing. Replace with the original
// strongly-typed Link once route unions are normalized.
export const Link: any = (navigation as any).Link;

// Re-export useSearchParams to avoid confusion
export const useSearchParams = useNextSearchParams;
