
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
import { CategoryPills } from '@/components/landing/category-pills';
import { TasksGrid } from '@/components/landing/tasks-grid';
import { HowItWorks } from '@/components/landing/how-it-works';
import { StatsTrust } from '@/components/landing/stats-trust';
import { ProfileCards } from '@/components/landing/profile-cards';
import { CarelinkPreview } from '@/components/landing/carelink-preview';


export default function Home() {
  const t = useTranslations('LandingPage');

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
                {t('hero.title')}{' '}
                <span className="text-primary bg-clip-text">
                  {t('hero.titleHighlight')}
                </span>
              </h1>

              {/* Subtitle */}
              <p className="mt-6 text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto">
                {t('hero.subtitle')}
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
                    {t('hero.cta.client')}
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-base px-8 py-6 shadow-md hover:shadow-lg transition-shadow">
                  <Link href="/inscription">
                    <Briefcase className="mr-2 h-5 w-5" />
                    {t('hero.cta.provider')}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Profile Segmentation Section - Who is it for? */}
        <ProfileCards />

        {/* Category Pills Section - Horizontal Scroll */}
        <CategoryPills />

        {/* Tasks Grid Section - Recent/Popular Tasks */}
        <TasksGrid maxTasks={8} showViewAll={true} filterByStatus="pending" />

        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-accent/5 to-background">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl font-headline mb-4">
                {t('features.title')}
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {t('features.subtitle')}
              </p>
            </div>
            <div className="mx-auto grid gap-8 sm:grid-cols-1 md:grid-cols-3">
              {features.map((feature, index) => (
                <Card 
                  key={index} 
                  className="text-center overflow-hidden border-2 hover:border-primary transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
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
              ))}
            </div>
          </div>
        </section>

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
