import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { locales } from './i18n';

// Routes protégées nécessitant une authentification
const protectedRoutes = [
  '/dashboard',
  '/tasks',
  '/profile',
  '/wallet',
  '/messages',
  '/notifications',
  '/bookings',
  '/offers'
];

// Routes publiques (accessibles sans auth)
const publicRoutes = [
  '/auth/login',
  '/auth/signup',
  '/auth/forgot-password',
  '/test-firebase'
];

// Créer le middleware i18n
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale: 'en'
});

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Extraire la locale du pathname
  const pathnameLocale = locales.find(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  // Obtenir le path sans la locale
  const pathWithoutLocale = pathnameLocale
    ? pathname.replace(`/${pathnameLocale}`, '') || '/'
    : pathname;

  // Vérifier si la route est protégée
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathWithoutLocale.startsWith(route)
  );

  // Vérifier si la route est publique
  const isPublicRoute = publicRoutes.some((route) =>
    pathWithoutLocale.startsWith(route)
  );

  // Vérifier la présence du cookie d'authentification Firebase
  const authCookie = request.cookies.get('firebaseAuth');
  const isAuthenticated = !!authCookie;

  // Si route protégée et non authentifié, rediriger vers login
  if (isProtectedRoute && !isAuthenticated) {
    const locale = pathnameLocale || 'en';
    const loginUrl = new URL(`/${locale}/auth/login`, request.url);

    // Ajouter le returnUrl pour rediriger après connexion
    loginUrl.searchParams.set('returnUrl', pathname);

    return NextResponse.redirect(loginUrl);
  }

  // Si route publique d'auth et déjà authentifié, rediriger vers dashboard
  if (isPublicRoute && isAuthenticated && pathWithoutLocale.startsWith('/auth')) {
    const locale = pathnameLocale || 'en';
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
