
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
  ShoppingBasket,
  Spade,
  HeartHandshake,
  ShieldCheck,
  MessagesSquare,
  Sparkles,
  HelpCircle,
  Briefcase,
  Wrench,
  PawPrint,
  Loader2,
  Users,
  HardHat,
  Star,
  ArrowRight,
} from 'lucide-react';
import Image from 'next/image';
import { Link } from '@/navigation';
import { useTranslations } from 'next-intl';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useEffect, useState, ReactNode } from 'react';
import type { ServiceCategory } from '@/lib/types';
import TestimonialCard from '@/components/testimonial-card';
import TestimonialsFinalCTA from '@/components/landing/testimonials-final-cta';
import placeholderImages from '@/app/lib/placeholder-images.json';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { HeroSearchBar } from '@/components/landing/hero-search-bar';
import { CategoryPills } from '@/components/landing/category-pills';
import { TasksGrid } from '@/components/landing/tasks-grid';
import { HowItWorks } from '@/components/landing/how-it-works';
import { StatsTrust } from '@/components/landing/stats-trust';

const categoryIcons: Record<string, ReactNode> = {
  'shopping-basket': <ShoppingBasket className="h-8 w-8" />,
  spade: <Spade className="h-8 w-8" />,
  sparkles: <Sparkles className="h-8 w-8" />,
  'file-text': <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8"><path d="M17 14h.01"/><path d="M12.5 4.5h-5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6.5l-4-4Z"/><path d="M15 4.5V8h3.5"/></svg>,
  'help-circle': <HelpCircle className="h-8 w-8" />,
  briefcase: <Briefcase className="h-8 w-8" />,
  wrench: <Wrench className="h-8 w-8" />,
  'paw-print': <PawPrint className="h-8 w-8" />,
  default: <HelpCircle className="h-8 w-8" />,
};


export default function Home() {
  const t = useTranslations('HomePage');
  const tHeader = useTranslations('Header');
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const q = query(collection(db, 'serviceCategories'), limit(4));
        const querySnapshot = await getDocs(q);
        const categoriesData: ServiceCategory[] = [];
        querySnapshot.forEach((doc) => {
          categoriesData.push({ id: doc.id, ...doc.data() } as ServiceCategory);
        });
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  const features = [
    {
      icon: <HeartHandshake className="h-10 w-10 text-primary" />,
      title: t('feature1Title'),
      description: t('feature1Desc'),
    },
    {
      icon: <ShieldCheck className="h-10 w-10 text-primary" />,
      title: t('feature2Title'),
      description: t('feature2Desc'),
    },
    {
      icon: <MessagesSquare className="h-10 w-10 text-primary" />,
      title: t('feature3Title'),
      description: t('feature3Desc'),
    },
  ];

  const tLanding = useTranslations('LandingPage');

  return (
    <>
      <div className="flex flex-col">
        {/* Hero Section - Airbnb/BlaBlaCar Style */}
        <section className="relative w-full min-h-[600px] md:min-h-[700px] flex items-center bg-gradient-to-br from-primary/5 via-background to-accent/5">
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
              <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight font-headline">
                {tLanding('hero.title')}{' '}
                <span className="text-primary bg-clip-text">
                  {tLanding('hero.titleHighlight')}
                </span>
              </h1>

              {/* Subtitle */}
              <p className="mt-6 text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto">
                {tLanding('hero.subtitle')}
              </p>

              {/* Hero Search Bar */}
              <div className="mt-10 md:mt-14">
                <HeroSearchBar variant="hero" />
              </div>

              {/* CTA Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button asChild size="lg" className="text-base px-8 py-6 shadow-lg hover:shadow-xl transition-shadow">
                  <Link href="/dashboard/tasks/new">
                    <Sparkles className="mr-2 h-5 w-5" />
                    {tLanding('hero.cta.client')}
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-base px-8 py-6 shadow-md hover:shadow-lg transition-shadow">
                  <Link href="/inscription">
                    <Briefcase className="mr-2 h-5 w-5" />
                    {tLanding('hero.cta.provider')}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Category Pills Section - Horizontal Scroll */}
        <CategoryPills />

        {/* Tasks Grid Section - Recent/Popular Tasks */}
        <TasksGrid maxTasks={8} showViewAll={true} filterByStatus="pending" />

        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter text-center sm:text-4xl font-headline">
              {t('whyChoose')}
            </h2>
            <div className="mx-auto mt-12 grid gap-8 sm:grid-cols-1 md:grid-cols-3">
              {features.map((feature, index) => (
                <Card key={index} className="text-center">
                  <CardHeader>
                    <div className="mx-auto bg-accent/30 p-4 rounded-full w-fit">
                      {feature.icon}
                    </div>
                    <CardTitle className="mt-4 font-headline">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

    <StatsTrust />

        {/* How It Works Section - 3 Steps */}
        <HowItWorks />

        <TestimonialsFinalCTA />

        <section id="categories" className="w-full py-12 md:py-24 lg:py-32 bg-card">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter text-center sm:text-4xl font-headline">
              {t('categoriesTitle')}
            </h2>
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
              {loadingCategories ? (
                Array.from({ length: 4 }).map((_, index) => (
                    <Card key={index} className="flex flex-col items-center justify-center p-6 h-32">
                       <Loader2 className="h-8 w-8 animate-spin text-muted-foreground"/>
                    </Card>
                ))
              ) : (
                categories.map((category) => (
                    <Card key={category.id} className="flex flex-col items-center justify-center p-6 text-center">
                    <div className="text-primary">{categoryIcons[category.icon || 'default']}</div>
                    <p className="mt-2 font-semibold">{typeof category.name === 'string' ? category.name : (category.name?.fr || category.slug)}</p>
                    </Card>
                ))
              )}
            </div>
          </div>
        </section>

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

        <section className="w-full py-12 md:py-24 lg:py-32 bg-primary/10">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl font-headline">
              {t('readyToStartTitle')}
            </h2>
            <p className="mt-4 max-w-xl mx-auto text-muted-foreground">
              {t('readyToStartDesc')}
            </p>
            <div className="mt-8">
              <Button asChild size="lg">
                <Link href="/inscription">{t('signUpFree')}</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
