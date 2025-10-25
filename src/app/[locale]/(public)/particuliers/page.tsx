'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Users, ShieldCheck, MessageSquare, Clock, Euro, Briefcase, HeartHandshake } from 'lucide-react';
import Image from 'next/image';
import { Link } from '@/navigation';
import { useTranslations } from 'next-intl';
import { HeroSearchBar } from '@/components/landing/hero-search-bar';
import { CategoryPills } from '@/components/landing/category-pills';
import { TasksGrid } from '@/components/landing/tasks-grid';
import { HowItWorks } from '@/components/landing/how-it-works';
import placeholderImages from '@/app/lib/placeholder-images.json';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export default function ParticuliersPage() {
  const t = useTranslations('LandingPage');
  const tIndividual = useTranslations('LandingPage.profiles.individual');
  const tFaq = useTranslations('LandingPage.faq');

  const benefits = [
    {
      icon: <Clock className="h-8 w-8 text-primary" />,
      title: tIndividual('benefits.timeGain.title'),
      description: tIndividual('benefits.timeGain.description')
    },
    {
      icon: <Euro className="h-8 w-8 text-primary" />,
      title: tIndividual('benefits.flexiblePrices.title'),
      description: tIndividual('benefits.flexiblePrices.description')
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: tIndividual('benefits.localHelp.title'),
      description: tIndividual('benefits.localHelp.description')
    },
    {
      icon: <ShieldCheck className="h-8 w-8 text-primary" />,
      title: tIndividual('benefits.securePayment.title'),
      description: tIndividual('benefits.securePayment.description')
    },
    {
      icon: <MessageSquare className="h-8 w-8 text-primary" />,
      title: tIndividual('benefits.easyComm.title'),
      description: tIndividual('benefits.easyComm.description')
    },
    {
      icon: <Sparkles className="h-8 w-8 text-primary" />,
      title: tIndividual('benefits.quality.title'),
      description: tIndividual('benefits.quality.description')
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative w-full min-h-[500px] md:min-h-[600px] flex items-center bg-gradient-to-br from-blue-500/10 via-background to-cyan-500/10">
        <div className="absolute inset-0 -z-10">
          <Image
            src={placeholderImages.hero.src}
            alt="Services pour particuliers"
            data-ai-hint="Personnes s'entraidant dans le quotidien"
            fill
            className="object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background/90" />
        </div>

        <div className="container mx-auto px-4 md:px-6 py-12 md:py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight font-headline mb-6">
              {tIndividual('hero.title')}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              {tIndividual('hero.subtitle')}
            </p>

            {/* Hero Search */}
            <div className="mb-8">
              <HeroSearchBar variant="hero" />
            </div>

            {/* CTA */}
            <Button asChild size="lg" className="text-base px-8 py-6 shadow-lg">
              <Link href="/dashboard/tasks/new">
                <Sparkles className="mr-2 h-5 w-5" />
                {tIndividual('hero.cta')}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Categories */}
      <CategoryPills />

      {/* Benefits Grid */}
      <section className="w-full py-16 md:py-24 bg-gradient-to-b from-accent/5 to-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl font-headline mb-4">
              {tIndividual('benefits.title')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {tIndividual('description')}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {benefits.map((benefit, index) => (
              <Card key={index} className="border-2 hover:border-primary transition-all hover:shadow-lg">
                <CardHeader>
                  <div className="mb-4 bg-primary/10 p-3 rounded-full w-fit">
                    {benefit.icon}
                  </div>
                  <CardTitle className="text-xl">{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Tasks */}
      <TasksGrid maxTasks={6} showViewAll={true} filterByStatus="pending" />

      {/* How It Works */}
      <HowItWorks />

      {/* FAQ */}
      <section className="w-full py-16 md:py-24 bg-accent/5">
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

      {/* Final CTA */}
      <section className="w-full py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              {t('finalCta.title')}
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              {t('finalCta.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="px-8 py-6">
                <Link href="/dashboard/tasks/new">
                  <Sparkles className="mr-2 h-5 w-5" />
                  {tIndividual('ctas.postMission')}
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="px-8 py-6">
                <Link href="/auth/signup">
                  {tIndividual('ctas.signup')}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Other Profiles */}
      <section className="w-full py-16 bg-accent/5">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Découvrez nos autres services</h2>
            <p className="text-muted-foreground">ImuTask s'adapte à tous les profils</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card className="border-2 hover:border-purple-500 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-4 mb-2">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500">
                    <Briefcase className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle>Vous êtes professionnel ?</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Développez votre activité avec ImuPro, notre plateforme dédiée aux professionnels certifiés.
                </p>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/professionnels">
                    Découvrir ImuPro
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-orange-500 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-4 mb-2">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500">
                    <HeartHandshake className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle>Services pour seniors</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Découvrez nos services adaptés aux seniors et personnes à mobilité réduite.
                </p>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/seniors">
                    Voir les services seniors
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
