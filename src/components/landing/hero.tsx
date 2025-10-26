'use client';

import { Button } from '@/components/ui/button';
import { Sparkles, Briefcase, Heart } from 'lucide-react';
import Image from 'next/image';
import { Link } from '@/navigation';
import { useTranslations } from 'next-intl';
import { HeroSearchBar } from '@/components/landing/hero-search-bar';
import { motion } from 'framer-motion';
import placeholderImages from '@/app/lib/placeholder-images.json';

interface HeroProps {
  variant?: 'default' | 'seniors';
}

export function Hero({ variant = 'default' }: HeroProps) {
  const t = useTranslations('LandingPage.hero');
  const isSenior = variant === 'seniors';

  // Configuration par variant
  const config = isSenior
    ? {
        gradient: 'from-rose-50/90 via-pink-50/80 to-purple-50/70',
        titleGradient: 'from-rose-500 via-pink-500 to-purple-500',
        image: placeholderImages.seniors?.src || placeholderImages.hero.src,
        imageHint: placeholderImages.seniors?.hint || 'Senior woman smiling with caregiver',
        ctaIcon: Heart,
        ctaHref: '/seniors',
        ctaVariant: 'default' as const,
        secondaryCta: true,
      }
    : {
        gradient: 'from-primary/5 via-background to-accent/5',
        titleGradient: 'text-primary',
        image: placeholderImages.hero.src,
        imageHint: placeholderImages.hero.hint,
        ctaIcon: Sparkles,
        ctaHref: '/dashboard/tasks/new',
        ctaVariant: 'default' as const,
        secondaryCta: true,
      };

  const CtaIcon = config.ctaIcon;

  return (
    <section className={`relative w-full min-h-[600px] md:min-h-[700px] flex items-center bg-gradient-to-br ${config.gradient}`}>
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 -z-10">
        <Image
          src={config.image}
          alt={isSenior ? t('seniorVariant.imageAlt') : 'Helping hands'}
          data-ai-hint={config.imageHint}
          fill
          className="object-cover opacity-20"
          priority
        />
        <div 
          className={`absolute inset-0 ${
            isSenior 
              ? 'bg-gradient-to-b from-rose-50/95 via-pink-50/90 to-purple-50/95' 
              : 'bg-gradient-to-b from-background/80 via-background/60 to-background/90'
          }`} 
        />
      </div>

      <div className="container mx-auto px-4 md:px-6 py-12 md:py-20">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge variant Seniors */}
          {isSenior && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-100 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 mb-6"
            >
              <Heart className="h-4 w-4 text-rose-600 dark:text-rose-400" />
              <span className="text-sm font-medium text-rose-700 dark:text-rose-300">
                {t('seniorVariant.badge')}
              </span>
            </motion.div>
          )}

          {/* Main Headline */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight font-headline"
          >
            {isSenior ? (
              <>
                {t('seniorVariant.title')}{' '}
                <span className={`bg-gradient-to-r ${config.titleGradient} bg-clip-text text-transparent`}>
                  {t('seniorVariant.titleHighlight')}
                </span>
              </>
            ) : (
              <>
                {t('title')}{' '}
                <span className={config.titleGradient}>
                  {t('titleHighlight')}
                </span>
              </>
            )}
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-6 text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto"
          >
            {isSenior ? t('seniorVariant.subtitle') : t('subtitle')}
          </motion.p>

          {/* Hero Search Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-10 md:mt-14"
          >
            <HeroSearchBar variant="hero" />
          </motion.div>

          {/* CTA Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button 
              asChild 
              size="lg" 
              className={`
                text-base px-8 py-6 shadow-lg hover:shadow-xl transition-shadow
                ${isSenior ? 'bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 hover:from-rose-600 hover:via-pink-600 hover:to-purple-600' : ''}
              `}
            >
              <Link href={config.ctaHref}>
                <CtaIcon className="mr-2 h-5 w-5" />
                {isSenior ? t('seniorVariant.cta.primary') : t('cta.client')}
              </Link>
            </Button>
            
            {config.secondaryCta && (
              <Button 
                asChild 
                variant="outline" 
                size="lg" 
                className="text-base px-8 py-6 shadow-md hover:shadow-lg transition-shadow"
              >
                <Link href={isSenior ? '/inscription?type=senior' : '/inscription'}>
                  <Briefcase className="mr-2 h-5 w-5" />
                  {isSenior ? t('seniorVariant.cta.secondary') : t('cta.provider')}
                </Link>
              </Button>
            )}
          </motion.div>

          {/* Features Pills Seniors */}
          {isSenior && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-12 flex flex-wrap gap-3 justify-center max-w-2xl mx-auto"
            >
              {['accessible', 'secure', 'simple'].map((feature) => (
                <div
                  key={feature}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur border border-rose-200 dark:border-rose-800 shadow-sm"
                >
                  <span className="text-xl">
                    {feature === 'accessible' && '♿'}
                    {feature === 'secure' && '🔒'}
                    {feature === 'simple' && '📱'}
                  </span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t(`seniorVariant.features.${feature}`)}
                  </span>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
