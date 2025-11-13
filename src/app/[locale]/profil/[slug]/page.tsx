/**
 * Page Profil Public
 * 
 * Affiche le profil public d'un prestataire via son slug.
 * Accessible via: /profil/[slug]
 * 
 * Features:
 * - SEO optimisé (meta tags, Open Graph, Twitter Cards)
 * - Partage social
 * - QR Code génération
 * - Analytics tracking
 * - Responsive design
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';
import { ProfileHeader } from '@/features/profiles/components/profile-header';
import { ProfilePortfolio } from '@/features/profiles/components/profile-portfolio';
import { ProfileBadges } from '@/features/profiles/components/profile-badges';
import { ProfileReviews } from '@/features/profiles/components/profile-reviews';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  getPublicProfileBySlug, 
  trackProfileView 
} from '@/lib/firestore-public-profiles';
import { getUserReviews } from '@/lib/firestore-reviews';
import { MapPin, Calendar, Award, Star } from 'lucide-react';
import type { PublicProfile } from '@/types/public-profile';
import type { Review } from '@/types/reviews';

interface PublicProfilePageProps {
  params: {
    locale: string;
    slug: string;
  };
  searchParams: {
    source?: string;
    ref?: string;
  };
}

// Générer les metadata pour le SEO
export async function generateMetadata({
  params,
}: PublicProfilePageProps): Promise<Metadata> {
  const profile = await getPublicProfileBySlug(params.slug);

  if (!profile) {
    return {
      title: 'Profil non trouvé - ImuTask',
    };
  }

  const title = profile.metaTitle || `${profile.displayName} - ${profile.headline || 'Prestataire ImuTask'}`;
  const description = profile.metaDescription || 
    profile.bio?.slice(0, 160) || 
    `Découvrez le profil de ${profile.displayName} sur ImuTask`;

  const ogImage = profile.photoUrl || profile.logoUrl || '/og-default.png';
  const profileUrl = `${process.env.NEXT_PUBLIC_APP_URL}/profil/${profile.slug}`;

  return {
    title,
    description,
    keywords: [
      profile.displayName,
      ...(profile.categories || []),
      ...(profile.skills || []),
      profile.location,
      'ImuTask',
    ].filter((k): k is string => typeof k === 'string' && k.length > 0),
    authors: [{ name: profile.displayName }],
    openGraph: {
      type: 'profile',
      url: profileUrl,
      title,
      description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: profile.displayName,
        },
      ],
      siteName: 'ImuTask',
      locale: params.locale,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
    alternates: {
      canonical: profileUrl,
      languages: {
        'fr': `/fr/profil/${profile.slug}`,
        'en': `/en/profil/${profile.slug}`,
        'ja': `/ja/profil/${profile.slug}`,
      },
    },
    robots: {
      index: profile.visibility === 'public',
      follow: profile.visibility === 'public',
    },
  };
}

export default async function PublicProfilePage({
  params,
  searchParams,
}: PublicProfilePageProps) {
  const { locale, slug } = params;
  const t = await getTranslations('PublicProfile');

  // Récupérer le profil
  const profile = await getPublicProfileBySlug(slug);

  if (!profile || !profile.isActive) {
    notFound();
  }

  // Récupérer les avis
  const reviews = await getUserReviews(profile.userId, { 
    sortBy: 'recent',
    limit: 20 
  });

  // Tracker la vue (en arrière-plan)
  trackProfileView(profile.id, {
    source: searchParams.source || 'direct',
    referrer: searchParams.ref,
  }).catch(console.error);

  return (
    <div className="min-h-screen bg-background">
      {/* JSON-LD pour le SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Person',
            name: profile.displayName,
            jobTitle: profile.headline,
            description: profile.bio,
            image: profile.photoUrl || profile.logoUrl,
            url: `${process.env.NEXT_PUBLIC_APP_URL}/profil/${profile.slug}`,
            address: profile.location ? {
              '@type': 'PostalAddress',
              addressLocality: profile.location,
            } : undefined,
            aggregateRating: profile.reviewsCount > 0 ? {
              '@type': 'AggregateRating',
              ratingValue: profile.averageRating,
              reviewCount: profile.reviewsCount,
            } : undefined,
            knowsAbout: profile.skills,
            knowsLanguage: profile.languages,
          }),
        }}
      />

      <div 
        className="container mx-auto px-4 py-8 max-w-6xl"
        style={{
          backgroundColor: profile.customTheme?.backgroundColor,
          color: profile.customTheme?.textColor,
        }}
      >
        {/* Header */}
        <ProfileHeader 
          profile={profile} 
          onContactClick={() => {
            // Rediriger vers la création de tâche ou messagerie
            window.location.href = `/tasks/create?providerId=${profile.userId}`;
          }}
        />

        <div className="grid lg:grid-cols-3 gap-6 mt-6">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bio */}
            {profile.bio && (
              <Card>
                <CardHeader>
                  <CardTitle>{t('about')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {profile.bio}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Portfolio */}
            {profile.portfolio && profile.portfolio.length > 0 && (
              <ProfilePortfolio items={profile.portfolio} />
            )}

            {/* Avis */}
            <ProfileReviews
              reviews={reviews}
              averageRating={profile.averageRating}
              totalReviews={profile.reviewsCount}
              locale={locale}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Badges */}
            {profile.badges && profile.badges.length > 0 && (
              <ProfileBadges 
                badges={profile.badges} 
                locale={locale}
              />
            )}

            {/* Informations */}
            <Card>
              <CardHeader>
                <CardTitle>{t('information')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Localisation */}
                {profile.location && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">{t('location')}</p>
                      <p className="text-sm text-muted-foreground">
                        {profile.location}
                      </p>
                      {profile.serviceArea?.radiusKm && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {t('serviceRadius', { km: profile.serviceArea.radiusKm })}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <Separator />

                {/* Membre depuis */}
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">{t('memberSince')}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(profile.createdAt.toDate()).toLocaleDateString(locale, {
                        year: 'numeric',
                        month: 'long',
                      })}
                    </p>
                  </div>
                </div>

                {/* Missions complétées */}
                {profile.completedMissions > 0 && (
                  <>
                    <Separator />
                    <div className="flex items-start gap-3">
                      <Award className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">{t('completedMissions')}</p>
                        <p className="text-sm text-muted-foreground">
                          {profile.completedMissions} {t('missions')}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Compétences */}
            {profile.skills && profile.skills.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>{t('skills')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Langues */}
            {profile.languages && profile.languages.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>{t('languages')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {profile.languages.map((lang) => (
                      <Badge key={lang} variant="outline">
                        {lang.toUpperCase()}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Catégories de services */}
            {profile.categories && profile.categories.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>{t('services')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {profile.categories.map((category) => (
                      <div
                        key={category}
                        className="flex items-center gap-2 text-sm"
                      >
                        <Star className="h-4 w-4 text-muted-foreground" />
                        <span>{category}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Footer branding (si pas premium ou option désactivée) */}
        {(!profile.isPremium || !profile.premiumFeatures?.hideImuTaskBranding) && (
          <div className="text-center mt-12 py-6 text-sm text-muted-foreground">
            <p>
              {t('poweredBy')}{' '}
              <a
                href="/"
                className="font-semibold hover:underline"
                target="_blank"
              >
                ImuTask
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Composant de loading
function ProfileSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Card>
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row gap-6">
            <Skeleton className="h-32 w-32 rounded-full" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-96" />
              <div className="flex gap-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
