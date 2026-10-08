import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { locales } from './i18n';

// Routes publiques (accessibles sans auth)
const publicRoutes = [
  '/',
  '/particuliers',
  '/professionnels',
  '/seniors',
  '/carelink',
  '/auth/login',
  '/auth/signin',
  '/auth/signup',
  '/auth/forgot-password',
  '/sign-in',
  '/sign-up',
  '/connexion',
  '/inscription',
  '/legal/terms',
  '/legal/privacy',
  '/test-firebase',
  '/',
  '/particuliers',
  '/professionnels',
  '/about'
];

// Routes protégées nécessitant une authentification
const protectedRoutes = [
  '/dashboard',
  '/tasks',
  '/profile',
  '/wallet',
  '/messages',
  '/notifications',
  '/bookings',
  '/offers',
  '/onboarding'
];

// Routes nécessitant un accountType (après onboarding)
const accountTypeRequiredRoutes = [
  '/dashboard',
  '/tasks',
  '/profile',
  '/wallet',
  '/messages',
  '/bookings',
  '/offers'
];

/**
 * Helper: Vérifier si une route est publique
 */
function isPublicRoute(path: string): boolean {
  return publicRoutes.some(route =>
    path === route || path.startsWith(`${route}/`)
  );
}

/**
 * Helper: Vérifier si une route est protégée
 */
function isProtectedRoute(path: string): boolean {
  return protectedRoutes.some(route =>
    path.startsWith(route)
  );
}

/**
 * Helper: Vérifier si une route nécessite accountType
 */
function requiresAccountType(path: string): boolean {
  return accountTypeRequiredRoutes.some(route =>
    path.startsWith(route)
  );
}

/**
 * Helper: Détecter la locale préférée depuis les headers
 */
function getPreferredLocale(request: NextRequest): string {
  const acceptLanguage = request.headers.get('accept-language');

  if (!acceptLanguage) return 'fr'; // Default: français

  // Parser Accept-Language header (ex: "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7")
  const languages = acceptLanguage.split(',').map(lang => {
    const [locale, qValue] = lang.trim().split(';q=');
    const quality = qValue ? parseFloat(qValue) : 1.0;
    const shortLocale = locale.split('-')[0]; // "fr-FR" → "fr"
    return { locale: shortLocale, quality };
  });

  // Trier par qualité descendante
  languages.sort((a, b) => b.quality - a.quality);

  // Trouver la première locale supportée
  for (const { locale } of languages) {
    if (locales.includes(locale)) {
      return locale;
    }
  }

  return 'fr'; // Fallback
}

// Créer le middleware i18n
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale: 'fr',
  localeDetection: true
});

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // **Check 1: Locale Detection**
  // Si pas de locale dans l'URL, rediriger avec locale détectée
  const pathnameLocale = locales.find(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (!pathnameLocale && pathname === '/') {
    const preferredLocale = getPreferredLocale(request);
    const url = new URL(`/${preferredLocale}`, request.url);
    return NextResponse.redirect(url);
  }

  // Obtenir le path sans la locale
  const pathWithoutLocale = pathnameLocale
    ? pathname.replace(`/${pathnameLocale}`, '') || '/'
    : pathname;

  const locale = pathnameLocale || 'fr';

  // **Check 2: Authentication**
  // Vérifier la présence du cookie d'authentification Firebase
  const authCookie = request.cookies.get('firebaseAuth');
  const isAuthenticated = !!authCookie;

  // Si route protégée et non authentifié → redirect /signin
  if (isProtectedRoute(pathWithoutLocale) && !isAuthenticated) {
    // The localized sign-in screen lives at /sign-in (for example
    // /fr/connexion). Keep redirects on that route so the page uses the
    // SignInPage messages instead of the legacy /auth/signin screen.
    const signInPath = locale === 'fr' ? 'connexion' : 'sign-in';
    const signinUrl = new URL(`/${locale}/${signInPath}`, request.url);
    signinUrl.searchParams.set('returnUrl', pathname);
    return NextResponse.redirect(signinUrl);
  }

  // Si route auth et déjà authentifié → redirect /dashboard
  if (
    isAuthenticated &&
    (pathWithoutLocale.startsWith('/auth') ||
      pathWithoutLocale === '/sign-in' ||
      pathWithoutLocale === '/sign-up' ||
      pathWithoutLocale === '/connexion' ||
      pathWithoutLocale === '/inscription')
  ) {
    const dashboardUrl = new URL(`/${locale}/dashboard`, request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // **Check 3: AccountType Validation**
  // Note: On ne peut pas faire de requête Firestore dans le middleware Edge
  // On utilise un cookie "accountType" qui sera set par le client après auth
  const accountTypeCookie = request.cookies.get('accountType');
  const hasAccountType = !!accountTypeCookie?.value;

  // Si route nécessite accountType ET user auth MAIS pas d'accountType
  // → redirect /onboarding
  if (
    isAuthenticated &&
    requiresAccountType(pathWithoutLocale) &&
    !hasAccountType &&
    pathWithoutLocale !== '/onboarding'
  ) {
    const onboardingUrl = new URL(`/${locale}/onboarding`, request.url);
    return NextResponse.redirect(onboardingUrl);
  }

  // Si onboarding ET déjà accountType → redirect /dashboard
  if (
    isAuthenticated &&
    pathWithoutLocale === '/onboarding' &&
    hasAccountType
  ) {
    const dashboardUrl = new URL(`/${locale}/dashboard`, request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // Appliquer le middleware i18n
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    '/',
    '/(en|fr|de|es|ja)/:path*'
  ]
};
