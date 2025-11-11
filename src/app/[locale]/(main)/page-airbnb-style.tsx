'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useScrollPosition } from '@/hooks/use-scroll-position';
import { logLandingPageView } from '@/lib/analytics';

// Components
import { Hero } from '@/components/landing/hero';
import { StickySearchBar } from '@/components/landing/sticky-search-bar';
import { CategoryPills } from '@/components/landing/category-pills';
import { TasksGrid } from '@/components/landing/tasks-grid';
import { ProfileCards } from '@/components/landing/profile-cards';
import { HowItWorks } from '@/components/landing/how-it-works';
import { StatsTrust } from '@/components/landing/stats-trust';
import { ServiceCategoriesShowcase } from '@/components/landing/service-categories-showcase';
import { CarelinkPreview } from '@/components/landing/carelink-preview';
import TestimonialsFinalCTA from '@/components/landing/testimonials-final-cta';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  HeartHandshake,
  ShieldCheck,
  MessagesSquare,
} from 'lucide-react';

/**
 * Page d'accueil ImuTask - Version Airbnb Style
 * 
 * Architecture:
 * 1. Hero minimaliste (400px) avec recherche
 * 2. Category Pills (scroll horizontal)
 * 3. TasksGrid - AFFICHAGE IMMÉDIAT des services disponibles ⭐
 * 4. ProfileCards - Qui sommes-nous ?
 * 5. Sections informatives (Features, HowItWorks, Stats, FAQ)
 * 6. CareLink + Testimonials
 */
export default function Home() {
  const t = useTranslations('LandingPage');
  const { scrollY, scrollDirection } = useScrollPosition();
  const [showStickySearch, setShowStickySearch] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const heroRef = useRef<HTMLDivElement>(null);

  // Track header visibility based on scroll
  useEffect(() => {
    if (scrollY > 100) {
      if (scrollDirection === 'down') {
        setIsHeaderVisible(false);
      } else if (scrollDirection === 'up') {
        setIsHeaderVisible(true);
      }
    } else {
      setIsHeaderVisible(true);
    }
  }, [scrollY, scrollDirection]);

  useEffect(() => {
    // Track landing page view on mount
    logLandingPageView();
  }, []);

  useEffect(() => {
    // Show sticky search when scrolled past hero section
    if (heroRef.current) {
      const heroHeight = heroRef.current.offsetHeight;
      setShowStickySearch(scrollY > heroHeight - 100);
    }
  }, [scrollY]);

  const features = [
    {
      icon: <HeartHandshake className="h-10 w-10 text-primary" />,
      title: t('features.feature1.title'),
      description: t('features.feature1.description'),
    },
    {
      icon: <ShieldCheck className="h-10 w-10 text-primary" />,
      title: t('features.feature2.title'),
      description: t('features.feature2.description'),
    },
    {
      icon: <MessagesSquare className="h-10 w-10 text-primary" />,
      title: t('features.feature3.title'),
      description: t('features.feature3.description'),
    },
  ];

  return (
    <>
      {/* Sticky Search Bar - Apparaît au scroll */}
      <motion.div 
        initial={false}
        animate={{
          y: showStickySearch ? 0 : -100,
          opacity: showStickySearch ? 1 : 0,
          top: isHeaderVisible ? '4rem' : '0rem',
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={`
          fixed left-0 right-0 z-40 bg-background/98 backdrop-blur-lg border-b shadow-xl
          ${showStickySearch ? 'pointer-events-auto' : 'pointer-events-none'}
        `}
      >
        <div className="container mx-auto px-4 py-3">
          <StickySearchBar />
        </div>
      </motion.div>

      <div className="flex flex-col">
        {/* 
          🎯 SECTION 1: HERO MINIMALISTE
          Style Airbnb: Simple, épuré, barre de recherche visible
          Max height: 400-500px
        */}
        <div ref={heroRef}>
          <Hero variant="default" />
        </div>

        {/* 
          🎯 SECTION 2: CATEGORY PILLS
          Navigation rapide par catégorie (comme Airbnb)
          Sticky au scroll pour filtrer en temps réel
        */}
        <CategoryPills />

        {/* 
          🎯 SECTION 3: TASKS GRID - ⭐ STAR FEATURE ⭐
          AFFICHAGE IMMÉDIAT des tâches disponibles
          Comme Airbnb affiche les logements directement
          12-16 tâches avec pagination
        */}
        <div className="py-8 md:py-12">
          <TasksGrid 
            maxTasks={16} 
            showViewAll={true} 
            filterByStatus="open"
          />
        </div>

        {/* 
          🎯 SECTION 4: PROFILE CARDS
          Pour qui est ImuTask ? (Particuliers, Pro, Seniors)
          Version compacte
        */}
        <ProfileCards />

        {/* 
          🎯 SECTION 5: SERVICE CATEGORIES SHOWCASE
          8 catégories MVP avec leurs 15 services
          Aide l'utilisateur à découvrir l'étendue des services
        */}
        <ServiceCategoriesShowcase />

        {/* 
          🎯 SECTION 6: FEATURES (version simplifiée)
          Pourquoi choisir ImuTask ?
          Réduit pour ne pas surcharger
        */}
        <motion.section 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-100px" }}
          id="features" 
          className="w-full py-12 md:py-16 bg-gradient-to-b from-accent/5 to-background"
        >
          <div className="container mx-auto px-4 md:px-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl font-headline mb-4">
                {t('features.title')}
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {t('features.subtitle')}
              </p>
            </motion.div>
            <div className="mx-auto grid gap-6 sm:grid-cols-1 md:grid-cols-3 max-w-5xl">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card 
                    className="h-full text-center overflow-hidden border-2 hover:border-primary transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                  >
                    <CardHeader>
                      <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit transition-transform duration-300 hover:scale-110">
                        {feature.icon}
                      </div>
                      <CardTitle className="mt-4 font-headline text-xl">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* 
          🎯 SECTION 7: STATS & TRUST
          Chiffres clés pour rassurer
        */}
        <StatsTrust />

        {/* 
          🎯 SECTION 8: HOW IT WORKS
          Comment ça marche ? (3 étapes)
        */}
        <HowItWorks />

        {/* 
          🎯 SECTION 9: TESTIMONIALS + CTA
          Témoignages clients + Call to Action
        */}
        <TestimonialsFinalCTA />

        {/* 
          🎯 SECTION 10: FAQ (version compacte)
          Questions fréquentes
        */}
        <section id="faq" className="w-full py-12 md:py-16 bg-muted/20">
          <div className="container mx-auto px-4 md:px-6 max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tighter text-center sm:text-4xl font-headline mb-8">
              {t('faq.title')}
            </h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>{t('faq.q1.question')}</AccordionTrigger>
                <AccordionContent>{t('faq.q1.answer')}</AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>{t('faq.q2.question')}</AccordionTrigger>
                <AccordionContent>{t('faq.q2.answer')}</AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>{t('faq.q3.question')}</AccordionTrigger>
                <AccordionContent>{t('faq.q3.answer')}</AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>

        {/* 
          🎯 SECTION 11: CARELINK PREVIEW
          Pour les seniors et aidants
        */}
        <CarelinkPreview />
      </div>
    </>
  );
}
