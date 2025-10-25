
'use client';

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
import { StickySearchBar } from '@/components/landing/sticky-search-bar';
import { CategoryPills } from '@/components/landing/category-pills';
import { TasksGrid } from '@/components/landing/tasks-grid';
import { HowItWorks } from '@/components/landing/how-it-works';
import { StatsTrust } from '@/components/landing/stats-trust';
import { ProfileCards } from '@/components/landing/profile-cards';
import { CarelinkPreview } from '@/components/landing/carelink-preview';
import { useEffect, useState, useRef } from 'react';
import { logLandingPageView } from '@/lib/analytics';
import { useScrollPosition } from '@/hooks/use-scroll-position';
import { motion } from 'framer-motion';


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
      {/* Sticky Search Bar */}
      <motion.div 
        initial={false}
        animate={{
          y: showStickySearch ? 0 : -100,
          opacity: showStickySearch ? 1 : 0,
          top: isHeaderVisible ? '4rem' : '0rem', // 4rem = 64px (header height)
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
        {/* Hero Section - Airbnb/BlaBlaCar Style */}
        <section ref={heroRef} className="relative w-full min-h-[600px] md:min-h-[700px] flex items-center bg-gradient-to-br from-primary/5 via-background to-accent/5">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 -z-10">
            <Image
              src={placeholderImages.hero.src}
              alt="Helping hands"
              data-ai-hint={placeholderImages.hero.hint}
              fill
              className="object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background/90" />
          </div>

          <div className="container mx-auto px-4 md:px-6 py-12 md:py-20">
            <div className="max-w-5xl mx-auto text-center">
              {/* Main Headline */}
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight font-headline"
              >
                {t('hero.title')}{' '}
                <span className="text-primary bg-clip-text">
                  {t('hero.titleHighlight')}
                </span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="mt-6 text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto"
              >
                {t('hero.subtitle')}
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
                <Button asChild size="lg" className="text-base px-8 py-6 shadow-lg hover:shadow-xl transition-shadow">
                  <Link href="/dashboard/tasks/new">
                    <Sparkles className="mr-2 h-5 w-5" />
                    {t('hero.cta.client')}
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-base px-8 py-6 shadow-md hover:shadow-lg transition-shadow">
                  <Link href="/inscription">
                    <Briefcase className="mr-2 h-5 w-5" />
                    {t('hero.cta.provider')}
                  </Link>
                </Button>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Profile Segmentation Section - Who is it for? */}
        <ProfileCards />

        {/* Category Pills Section - Horizontal Scroll */}
        <CategoryPills />

        {/* Tasks Grid Section - Recent/Popular Tasks */}
        <TasksGrid maxTasks={8} showViewAll={true} filterByStatus="pending" />

        <motion.section 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-100px" }}
          id="features" 
          className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-accent/5 to-background"
        >
          <div className="container mx-auto px-4 md:px-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl font-headline mb-4">
                {t('features.title')}
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {t('features.subtitle')}
              </p>
            </motion.div>
            <div className="mx-auto grid gap-8 sm:grid-cols-1 md:grid-cols-3">
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

    <StatsTrust />

        {/* How It Works Section - 3 Steps */}
        <HowItWorks />

        <TestimonialsFinalCTA />

        <section id="faq" className="w-full py-12 md:py-24 lg:py-32">
            <div className="container mx-auto px-4 md:px-6 max-w-3xl">
                <h2 className="text-3xl font-bold tracking-tighter text-center sm:text-4xl font-headline mb-12">
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

        {/* CareLink Preview Section - For seniors and caregivers */}
        <CarelinkPreview />
      </div>
    </>
  );
}
