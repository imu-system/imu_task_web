'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  HeartHandshake,
  ShieldCheck,
  MessagesSquare,
  Sparkles,
  Briefcase,
} from 'lucide-react';
import Image from 'next/image';
import { Link } from '@/navigation';
import { useTranslations } from 'next-intl';
import TestimonialsFinalCTA from '@/components/landing/testimonials-final-cta';
import placeholderImages from '@/app/lib/placeholder-images.json';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { HeroSearchBar } from '@/components/landing/hero-search-bar';
import { HeroMinimal } from '@/components/landing/hero-minimal';
import { CategoryPills } from '@/components/landing/category-pills';
import { TasksGrid } from '@/components/landing/tasks-grid';
import { HowItWorks } from '@/components/landing/how-it-works';
import { StatsTrust } from '@/components/landing/stats-trust';
import { ProfileCards } from '@/components/landing/profile-cards';
import { CarelinkPreview } from '@/components/landing/carelink-preview';
import { ServiceCategoriesShowcase } from '@/components/landing/service-categories-showcase';
import { useEffect, useRef } from 'react';
import { logLandingPageView } from '@/lib/analytics';
import { motion } from 'framer-motion';

/**
 * Page d'accueil ImuTask - Style Airbnb
 * 
 * 🎯 Priorité: Affichage immédiat des services disponibles
 * 
 * Architecture optimisée:
 * 1. Hero minimaliste (400-500px) - Barre de recherche visible
 * 2. Category Pills - Filtrage rapide
 * 3. ⭐ TasksGrid - TÂCHES DISPONIBLES IMMÉDIATEMENT ⭐
 * 4. ProfileCards - Segmentation utilisateurs
 * 5. ServiceCategoriesShowcase - Catalogue complet
 * 6. Features, Stats, HowItWorks - Information contextuelle
 * 7. Testimonials, FAQ, CareLink - Conversion & confiance
 */
export default function Home() {
  const t = useTranslations('LandingPage');
  const heroRef = useRef<HTMLDivElement>(null);
  // State pour le filtrage par catégorie
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    // Track landing page view on mount
    logLandingPageView();
  }, []);

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
      <div className="flex flex-col">
        {/* 
          🎯 SECTION 1: HERO MINIMALISTE (Style Airbnb)
          - Hauteur réduite: 400-500px (vs 600-700px)
          - Focus: Barre de recherche
          - Pas de boutons distractifs
        */}
        <div ref={heroRef}>
          <HeroMinimal />
        </div>

        {/* 
          🎯 SECTION 2: CATEGORY PILLS
          Filtrage rapide par catégorie (scroll horizontal)
        */}
        <div className="bg-gradient-to-b from-primary/5 to-background py-2">
          <CategoryPills 
            selectedCategory={selectedCategory}
            onCategorySelect={setSelectedCategory}
          />
        </div>

        {/* 
          🎯 SECTION 3: ⭐ TASKS GRID - STAR FEATURE ⭐
          AFFICHAGE IMMÉDIAT des tâches disponibles
          Comme Airbnb affiche les logements dès la page d'accueil
          16 tâches + pagination
        */}
        <div className="bg-gradient-to-b from-background via-accent/5 to-background py-4">
          <TasksGrid 
            maxTasks={16} 
            showViewAll={true} 
            filterByStatus="open"
            selectedCategory={selectedCategory}
          />
        </div>

        {/* 
          🎯 SECTION 4: PROFILE CARDS
          Pour qui est ImuTask ? (Particuliers, Pro, Seniors)
        */}
        <div className="bg-gradient-to-br from-purple-50/50 via-background to-blue-50/50 py-12">
          <ProfileCards />
        </div>

        {/* 
          🎯 SECTION 5: SERVICE CATEGORIES SHOWCASE
          8 catégories MVP + 15 services par catégorie
        */}
        <div className="bg-gradient-to-b from-background to-primary/5 py-12">
          <ServiceCategoriesShowcase />
        </div>

        {/* 
          🎯 SECTION 6: FEATURES (version compacte)
          Pourquoi choisir ImuTask ?
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
          Chiffres clés
        */}
        <div className="bg-gradient-to-r from-primary/10 via-purple-50/50 to-primary/10 py-12">
          <StatsTrust />
        </div>

        {/* 
          🎯 SECTION 8: HOW IT WORKS
          3 étapes simples
        */}
        <HowItWorks />

        {/* 
          🎯 SECTION 9: TESTIMONIALS + CTA
        */}
        <div className="bg-gradient-to-b from-background via-accent/10 to-background py-12">
          <TestimonialsFinalCTA />
        </div>

        {/* 
          🎯 SECTION 10: FAQ
        */}
        <section id="faq" className="w-full py-12 md:py-16 bg-gradient-to-br from-blue-50/30 via-purple-50/20 to-pink-50/30">
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
          Pour seniors et aidants
        */}
        <div className="bg-gradient-to-b from-background to-accent/5 py-12">
          <CarelinkPreview />
        </div>
      </div>
    </>
  );
}
