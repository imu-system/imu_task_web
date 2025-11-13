/**
 * Composant Badges de Qualité du Profil Public
 * 
 * Affiche les badges gagnés par le prestataire:
 * - Badges ImuAcademy
 * - Badges professionnels
 * - Badges de plateforme
 * - Badges d'achievement
 */

'use client';

import { useTranslations } from 'next-intl';
import { 
  Award, 
  Shield, 
  Medal, 
  Check,
  Star,
  Zap,
  Heart,
  Clock,
  MessageCircle,
  ThumbsUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { QualityBadge } from '@/types/public-profile';
import { format } from 'date-fns';
import { fr, enUS, ja, type Locale } from 'date-fns/locale';

interface ProfileBadgesProps {
  badges: QualityBadge[];
  locale?: string;
  className?: string;
}

const localeMap = {
  en: enUS,
  fr: fr,
  ja: ja,
};

// Map d'icônes pour les badges
const BADGE_ICON_MAP: Record<string, React.ElementType> = {
  // Platform badges
  verified: Shield,
  'top-rated': Star,
  responsive: Zap,
  reliable: ThumbsUp,
  'fast-delivery': Clock,
  'great-communication': MessageCircle,
  'repeat-client': Heart,
  
  // Academy badges
  starter: Award,
  communicator: MessageCircle,
  expert: Medal,
  master: Award,
  
  // Professional certifications
  certified: Check,
  professional: Medal,
  
  // Achievements
  achievement: Award,
  milestone: Star,
};

const BADGE_COLOR_MAP: Record<string, string> = {
  verified: 'bg-blue-100 text-blue-700 border-blue-200',
  'top-rated': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  responsive: 'bg-green-100 text-green-700 border-green-200',
  reliable: 'bg-purple-100 text-purple-700 border-purple-200',
  'fast-delivery': 'bg-orange-100 text-orange-700 border-orange-200',
  'great-communication': 'bg-cyan-100 text-cyan-700 border-cyan-200',
  'repeat-client': 'bg-pink-100 text-pink-700 border-pink-200',
};

export function ProfileBadges({ badges, locale = 'fr', className }: ProfileBadgesProps) {
  const t = useTranslations('PublicProfile.badges');
  const dateLocale = localeMap[locale as keyof typeof localeMap] || fr;

  if (badges.length === 0) {
    return null;
  }

  // Grouper les badges par type
  const badgesByType = badges.reduce((acc, badge) => {
    if (!acc[badge.type]) {
      acc[badge.type] = [];
    }
    acc[badge.type].push(badge);
    return acc;
  }, {} as Record<string, QualityBadge[]>);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Badges Platform (mis en avant) */}
      {badgesByType.platform && badgesByType.platform.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              {t('platformBadges')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {badgesByType.platform.map(badge => (
                <BadgeItem 
                  key={badge.id} 
                  badge={badge} 
                  dateLocale={dateLocale}
                  size="large"
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Autres badges */}
      {(badgesByType.academy || badgesByType.professional || badgesByType.achievement) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              {t('otherBadges')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {/* Academy Badges */}
              {badgesByType.academy?.map(badge => (
                <BadgeItem 
                  key={badge.id} 
                  badge={badge} 
                  dateLocale={dateLocale}
                />
              ))}

              {/* Professional Certifications */}
              {badgesByType.professional?.map(badge => (
                <BadgeItem 
                  key={badge.id} 
                  badge={badge} 
                  dateLocale={dateLocale}
                />
              ))}

              {/* Achievements */}
              {badgesByType.achievement?.map(badge => (
                <BadgeItem 
                  key={badge.id} 
                  badge={badge} 
                  dateLocale={dateLocale}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface BadgeItemProps {
  badge: QualityBadge;
  dateLocale: Locale;
  size?: 'default' | 'large';
}

function BadgeItem({ badge, dateLocale, size = 'default' }: BadgeItemProps) {
  const t = useTranslations('PublicProfile.badges');
  
  // Déterminer l'icône
  const IconComponent = badge.icon 
    ? BADGE_ICON_MAP[badge.icon] 
    : BADGE_ICON_MAP[badge.type] 
    || Award;

  // Déterminer la couleur
  const badgeColor = badge.color 
    ? undefined 
    : BADGE_COLOR_MAP[badge.id] || BADGE_COLOR_MAP[badge.type];

  // Formater la date
  const formattedDate = format(
    badge.issuedAt.toDate(), 
    'MMM yyyy',
    { locale: dateLocale }
  );

  if (size === 'large') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div 
              className={cn(
                "flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all hover:shadow-md cursor-help",
                badgeColor
              )}
              style={badge.color ? { 
                backgroundColor: `${badge.color}20`,
                borderColor: badge.color,
                color: badge.color
              } : undefined}
            >
              <IconComponent className="h-5 w-5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{badge.name}</p>
                <p className="text-xs opacity-75">{formattedDate}</p>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              <p className="font-semibold">{badge.name}</p>
              {badge.description && (
                <p className="text-sm text-muted-foreground">{badge.description}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {t('issuedOn')}: {formattedDate}
              </p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div 
            className={cn(
              "flex flex-col items-center gap-2 p-4 rounded-lg border transition-all hover:shadow-md cursor-help text-center",
              badgeColor
            )}
            style={badge.color ? { 
              backgroundColor: `${badge.color}15`,
              borderColor: badge.color,
              color: badge.color
            } : undefined}
          >
            <IconComponent className="h-8 w-8" />
            <div className="space-y-1">
              <p className="font-semibold text-xs leading-tight">{badge.name}</p>
              <p className="text-[10px] opacity-75">{formattedDate}</p>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p className="font-semibold">{badge.name}</p>
            {badge.description && (
              <p className="text-sm text-muted-foreground max-w-xs">
                {badge.description}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              {t('issuedOn')}: {formattedDate}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
