'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  UtensilsCrossed,
  Sparkles,
  Users,
  Phone,
  Heart,
  CheckCircle2,
  Calendar,
  Shield,
  Clock,
  Accessibility,
  Mail,
  Send
} from 'lucide-react';
import Image from 'next/image';
import { Link } from '@/navigation';
import { useTranslations } from 'next-intl';
import placeholderImages from '@/app/lib/placeholder-images.json';
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';

export default function CareLinkPage() {
  const tCarelink = useTranslations('LandingPage.carelink.page');
  const tCarelinkBase = useTranslations('LandingPage.carelink');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const services = [
    {
      key: "mealDelivery",
      icon: UtensilsCrossed,
      gradient: "from-orange-500 to-red-500",
      features: [
        tCarelink('services.mealDelivery.feature1'),
        tCarelink('services.mealDelivery.feature2'),
        tCarelink('services.mealDelivery.feature3'),
        tCarelink('services.mealDelivery.feature4'),
        tCarelink('services.mealDelivery.feature5')
      ]
    },
    {
      key: "housekeeping",
      icon: Sparkles,
      gradient: "from-blue-500 to-cyan-500",
      features: [
        tCarelink('services.housekeeping.feature1'),
        tCarelink('services.housekeeping.feature2'),
        tCarelink('services.housekeeping.feature3'),
        tCarelink('services.housekeeping.feature4'),
        tCarelink('services.housekeeping.feature5')
      ]
    },
    {
      key: "accompaniment",
      icon: Users,
      gradient: "from-purple-500 to-pink-500",
      features: [
        tCarelink('services.accompaniment.feature1'),
        tCarelink('services.accompaniment.feature2'),
        tCarelink('services.accompaniment.feature3'),
        tCarelink('services.accompaniment.feature4'),
        tCarelink('services.accompaniment.feature5')
      ]
    },
    {
      key: "teleassistance",
      icon: Phone,
      gradient: "from-green-500 to-emerald-500",
      features: [
        tCarelink('services.teleassistance.feature1'),
        tCarelink('services.teleassistance.feature2'),
        tCarelink('services.teleassistance.feature3'),
        tCarelink('services.teleassistance.feature4'),
        tCarelink('services.teleassistance.feature5')
      ]
    },
  ];

  const timeline = [
    {
      phase: tCarelink('roadmap.phase1.quarter'),
      title: tCarelink('roadmap.phase1.title'),
      description: tCarelink('roadmap.phase1.description'),
      status: "À venir"
    },
    {
      phase: tCarelink('roadmap.phase2.quarter'),
      title: tCarelink('roadmap.phase2.title'),
      description: tCarelink('roadmap.phase2.description'),
      status: "Planifié"
    },
    {
      phase: tCarelink('roadmap.phase3.quarter'),
      title: tCarelink('roadmap.phase3.title'),
      description: tCarelink('roadmap.phase3.description'),
      status: "Planifié"
    },
    {
      phase: tCarelink('roadmap.phase4.quarter'),
      title: tCarelink('roadmap.phase4.title'),
      description: tCarelink('roadmap.phase4.description'),
      status: "Planifié"
    },
  ];

  const handlePreRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast({
      title: tCarelink('waitlist.successTitle'),
      description: tCarelink('waitlist.successDescription'),
    });

    setEmail('');
    setMessage('');
    setIsSubmitting(false);
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative w-full min-h-[700px] flex items-center bg-gradient-to-br from-orange-500/10 via-background to-red-500/10">
        <div className="absolute inset-0 -z-10">
          <Image
            src={placeholderImages.hero.src}
            alt="CareLink - Maintien à domicile"
            data-ai-hint="Senior souriant avec aide à domicile"
            fill
            className="object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background/90" />
        </div>

        <div className="container mx-auto px-4 md:px-6 py-16">
          <div className="max-w-5xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6 px-6 py-3 text-lg bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20">
              <Heart className="mr-2 h-6 w-6" />
              {tCarelink('badge')}
            </Badge>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight font-headline mb-6">
              <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                {tCarelink('hero.title')}
              </span>
            </h1>

            <p className="text-2xl md:text-3xl font-semibold mb-6">
              {tCarelink('hero.subtitle')}
            </p>

            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
              {tCarelink('hero.description')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <Button asChild size="lg" className="px-8 py-6 text-lg bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                <Link href="#pre-inscription">
                  <Mail className="mr-2 h-5 w-5" />
                  {tCarelink('waitlist.submitButton')}
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="px-8 py-6 text-lg">
                <Link href="#services">
                  Découvrir les services
                </Link>
              </Button>
            </div>

            <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-orange-500" />
                {tCarelink('hero.trust.pmr')}
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-orange-500" />
                {tCarelink('hero.trust.cesu')}
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-orange-500" />
                {tCarelink('hero.trust.tax')}
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-orange-500" />
                {tCarelink('hero.trust.certified')}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services détaillés */}
      <section id="services" className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl font-headline mb-4">
              {tCarelink('services.title')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {tCarelink('services.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <Card key={service.key} className="border-2 hover:border-orange-500 transition-all">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className={`p-4 rounded-2xl bg-gradient-to-br ${service.gradient}`}>
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl mb-2">
                          {tCarelink(`services.${service.key}.title`)}
                        </CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {service.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Accessibility Features */}
      <section className="py-16 bg-gradient-to-b from-accent/5 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-3xl p-8 md:p-12 border-2 border-orange-500/20">
              <div className="flex items-start gap-6">
                <div className="bg-orange-500/20 p-4 rounded-2xl flex-shrink-0">
                  <Accessibility className="h-12 w-12 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-6">{tCarelink('accessibility.title')}</h3>
                  <p className="text-muted-foreground mb-6">{tCarelink('accessibility.subtitle')}</p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-orange-500 flex-shrink-0 mt-1" />
                      <span>{tCarelink('accessibility.feature1')}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-orange-500 flex-shrink-0 mt-1" />
                      <span>{tCarelink('accessibility.feature2')}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-orange-500 flex-shrink-0 mt-1" />
                      <span>{tCarelink('accessibility.feature3')}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-orange-500 flex-shrink-0 mt-1" />
                      <span>{tCarelink('accessibility.feature4')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Roadmap Timeline */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl font-headline mb-4">
              {tCarelink('roadmap.title')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {tCarelink('roadmap.subtitle')}
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border hidden md:block" />

              <div className="space-y-8">
                {timeline.map((item, idx) => (
                  <div key={idx} className="relative flex items-start gap-6">
                    {/* Timeline dot */}
                    <div className="hidden md:flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex-shrink-0 relative z-10">
                      <Calendar className="h-8 w-8 text-white" />
                    </div>

                    {/* Content */}
                    <Card className="flex-1">
                      <CardHeader>
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="text-orange-600 border-orange-500">
                            {item.phase}
                          </Badge>
                          <Badge variant="secondary">{item.status}</Badge>
                        </div>
                        <CardTitle className="text-xl">{item.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">{item.description}</p>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pre-registration Form */}
      <section id="pre-inscription" className="py-16 bg-gradient-to-b from-accent/5 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Card className="border-2 border-orange-500/20">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl mb-2">
                  {tCarelink('waitlist.title')}
                </CardTitle>
                <CardDescription className="text-base">
                  {tCarelink('waitlist.subtitle')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePreRegister} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">{tCarelink('waitlist.emailLabel')}</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder={tCarelink('waitlist.emailPlaceholder')}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="text-lg"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">{tCarelink('waitlist.messageLabel')}</Label>
                    <Textarea
                      id="message"
                      placeholder={tCarelink('waitlist.messagePlaceholder')}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={4}
                      className="text-base"
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      tCarelink('waitlist.submitting')
                    ) : (
                      <>
                        <Send className="mr-2 h-5 w-5" />
                        {tCarelink('waitlist.submitButton')}
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    {tCarelink('waitlist.gdpr')}
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Des questions sur CareLink ?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Notre équipe est à votre disposition pour répondre à toutes vos questions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="outline" className="px-8 py-6">
                <Link href="/contact">
                  <Mail className="mr-2 h-5 w-5" />
                  Nous contacter
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="px-8 py-6">
                <Link href="/seniors">
                  Retour aux services seniors
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
