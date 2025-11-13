/**
 * Composant Header du Profil Public
 * 
 * Affiche les informations principales du profil:
 * - Photo/logo
 * - Nom et titre
 * - Badges
 * - Localisation
 * - Note moyenne
 * - Boutons d'action
 */

'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { 
  MapPin, 
  Star, 
  MessageCircle, 
  Share2, 
  Globe,
  Linkedin,
  Instagram,
  Facebook,
  Twitter,
  Check,
  Award,
  Shield,
  Medal
} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { PublicProfile, QualityBadge } from '@/types/public-profile';
import { trackCTAClick, trackProfileShare } from '@/lib/firestore-public-profiles';
import { useToast } from '@/hooks/use-toast';

interface ProfileHeaderProps {
  profile: PublicProfile;
  onContactClick?: () => void;
  isOwnProfile?: boolean;
}

const SOCIAL_ICONS = {
  linkedin: Linkedin,
  instagram: Instagram,
  facebook: Facebook,
  twitter: Twitter,
  website: Globe,
};

const BADGE_ICONS: Record<string, React.ElementType> = {
  verified: Shield,
  academy: Award,
  achievement: Medal,
  professional: Check,
  platform: Shield,
};

export function ProfileHeader({ 
  profile, 
  onContactClick, 
  isOwnProfile = false 
}: ProfileHeaderProps) {
  const t = useTranslations('PublicProfile');
  const { toast } = useToast();
  const [isSharing, setIsSharing] = useState(false);

  const {
    displayName,
    headline,
    photoUrl,
    logoUrl,
    isPro,
    businessName,
    location,
    averageRating,
    reviewsCount,
    badges,
    socialLinks,
    customTheme,
    completedMissions,
  } = profile;

  const displayPhoto = isPro && logoUrl ? logoUrl : photoUrl;
  const displayTitle = isPro && businessName ? businessName : displayName;

  // Générer les initiales pour l'avatar fallback
  const initials = displayTitle
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleContactClick = async () => {
    await trackCTAClick(profile.id);
    onContactClick?.();
  };

  const handleShare = async (platform: string) => {
    setIsSharing(true);
    await trackProfileShare(profile.id, platform);

    const profileUrl = `${window.location.origin}/profil/${profile.slug}`;
    const shareText = `Découvrez le profil de ${displayTitle} sur ImuTask`;

    try {
      switch (platform) {
        case 'copy':
          await navigator.clipboard.writeText(profileUrl);
          toast({
            title: t('shareCopied'),
            description: t('shareCopiedDescription'),
          });
          break;
        
        case 'native':
          if ('share' in navigator && typeof navigator.share === 'function') {
            await navigator.share({
              title: shareText,
              url: profileUrl,
            });
          }
          break;
        
        case 'facebook':
          window.open(
            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}`,
            '_blank'
          );
          break;
        
        case 'twitter':
          window.open(
            `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(profileUrl)}`,
            '_blank'
          );
          break;
        
        case 'linkedin':
          window.open(
            `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}`,
            '_blank'
          );
          break;
        
        case 'whatsapp':
          window.open(
            `https://wa.me/?text=${encodeURIComponent(`${shareText} ${profileUrl}`)}`,
            '_blank'
          );
          break;
      }
    } catch (error) {
      console.error('Error sharing:', error);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Card 
      className={cn(
        "relative overflow-hidden",
        customTheme?.coverImage && "pt-32"
      )}
    >
      {/* Cover Image */}
      {customTheme?.coverImage && (
        <div 
          className="absolute top-0 left-0 right-0 h-32 bg-cover bg-center"
          style={{ 
            backgroundImage: `url(${customTheme.coverImage})`,
            backgroundColor: customTheme.backgroundColor || '#f3f4f6'
          }}
        />
      )}

      <div className="p-6 md:p-8 relative">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-background shadow-lg">
              <AvatarImage src={displayPhoto} alt={displayTitle} />
              <AvatarFallback 
                className="text-2xl font-bold"
                style={{ 
                  backgroundColor: customTheme?.primaryColor || '#6366f1',
                  color: customTheme?.textColor || '#ffffff'
                }}
              >
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Main Info */}
          <div className="flex-1 space-y-3">
            {/* Name and Badges */}
            <div>
              <div className="flex items-start gap-3 flex-wrap">
                <h1 
                  className="text-3xl font-bold"
                  style={{ color: customTheme?.textColor }}
                >
                  {displayTitle}
                </h1>
                
                {/* Quality Badges */}
                {badges.slice(0, 3).map((badge) => {
                  const BadgeIcon = BADGE_ICONS[badge.type] || Award;
                  return (
                    <Badge 
                      key={badge.id}
                      variant="secondary"
                      className="gap-1"
                      style={{ 
                        backgroundColor: badge.color || customTheme?.accentColor,
                        color: '#ffffff'
                      }}
                    >
                      <BadgeIcon className="h-3 w-3" />
                      {badge.name}
                    </Badge>
                  );
                })}
              </div>

              {/* Headline */}
              {headline && (
                <p 
                  className="text-lg text-muted-foreground mt-2"
                  style={{ color: customTheme?.textColor ? `${customTheme.textColor}99` : undefined }}
                >
                  {headline}
                </p>
              )}
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-4 text-sm">
              {/* Rating */}
              {reviewsCount > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{averageRating.toFixed(1)}</span>
                  <span className="text-muted-foreground">
                    ({reviewsCount} {t('reviews')})
                  </span>
                </div>
              )}

              {/* Location */}
              {location && (
                <>
                  <Separator orientation="vertical" className="h-5" />
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {location}
                  </div>
                </>
              )}

              {/* Completed Missions */}
              {completedMissions > 0 && (
                <>
                  <Separator orientation="vertical" className="h-5" />
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Check className="h-4 w-4" />
                    {completedMissions} {t('completedMissions')}
                  </div>
                </>
              )}
            </div>

            {/* Social Links */}
            {socialLinks && Object.keys(socialLinks).length > 0 && (
              <div className="flex gap-2">
                {Object.entries(socialLinks).map(([platform, url]) => {
                  if (!url) return null;
                  const Icon = SOCIAL_ICONS[platform as keyof typeof SOCIAL_ICONS];
                  if (!Icon) return null;

                  return (
                    <Button
                      key={platform}
                      variant="ghost"
                      size="icon"
                      asChild
                      className="h-8 w-8"
                    >
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={platform}
                      >
                        <Icon className="h-4 w-4" />
                      </a>
                    </Button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Actions */}
          {!isOwnProfile && (
            <div className="flex flex-col gap-2 md:items-end">
              <Button 
                onClick={handleContactClick}
                size="lg"
                className="gap-2"
                style={{
                  backgroundColor: customTheme?.primaryColor,
                  color: customTheme?.textColor || '#ffffff'
                }}
              >
                <MessageCircle className="h-4 w-4" />
                {t('contact')}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Share2 className="h-4 w-4" />
                    {t('share')}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {'share' in navigator && typeof navigator.share === 'function' && (
                    <DropdownMenuItem onClick={() => handleShare('native')}>
                      <Share2 className="h-4 w-4 mr-2" />
                      {t('shareNative')}
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => handleShare('copy')}>
                    {t('copyLink')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShare('whatsapp')}>
                    WhatsApp
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShare('facebook')}>
                    Facebook
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShare('twitter')}>
                    Twitter
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShare('linkedin')}>
                    LinkedIn
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
