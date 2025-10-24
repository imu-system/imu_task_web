'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';
import { FileText, Users, CheckCircle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  number: number;
  icon: React.ReactNode;
  titleKey: string;
  descriptionKey: string;
}

const steps: Step[] = [
  {
    number: 1,
    icon: <FileText className="h-8 w-8" />,
    titleKey: 'step1.title',
    descriptionKey: 'step1.description',
  },
  {
    number: 2,
    icon: <Users className="h-8 w-8" />,
    titleKey: 'step2.title',
    descriptionKey: 'step2.description',
  },
  {
    number: 3,
    icon: <CheckCircle className="h-8 w-8" />,
    titleKey: 'step3.title',
    descriptionKey: 'step3.description',
  },
];

export function HowItWorks() {
  const t = useTranslations('LandingPage.howItWorks');

  return (
    <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-background to-accent/5">
      <div className="container mx-auto px-4 md:px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl font-headline mb-4">
            {t('title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              <Card className="relative h-full overflow-hidden border-2 hover:border-primary transition-all duration-300 hover:shadow-lg">
                <CardContent className="p-8 text-center">
                  {/* Number Badge */}
                  <div className="absolute top-6 right-6">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary font-bold text-xl">
                      {step.number}
                    </div>
                  </div>

                  {/* Icon */}
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-6">
                    {step.icon}
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-semibold mb-3 font-headline">
                    {t(step.titleKey)}
                  </h3>

                  {/* Description */}
                  <p className="text-muted-foreground leading-relaxed">
                    {t(step.descriptionKey)}
                  </p>
                </CardContent>
              </Card>

              {/* Arrow (between steps, not after last one) */}
              {index < steps.length - 1 && (
                <div className="hidden md:flex absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <ArrowRight className="h-5 w-5 text-primary" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-12">
          <Button asChild size="lg" className="text-base px-8 py-6 shadow-lg">
            <Link href="/dashboard/tasks/new">
              {t('cta.client')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="text-base px-8 py-6">
            <Link href="/inscription">
              {t('cta.provider')}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
