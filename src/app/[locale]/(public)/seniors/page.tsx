'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  UtensilsCrossed, 
  Sparkles, 
  Users, 
  Phone,
  Home,
  CheckCircle2,
  ArrowRight,
  Accessibility
} from 'lucide-react';
import Image from 'next/image';
import { Link } from '@/navigation';
import { useTranslations } from 'next-intl';
import { CarelinkPreview } from '@/components/landing/carelink-preview';
import { CategoryPills } from '@/components/landing/category-pills';
import placeholderImages from '@/app/lib/placeholder-images.json';

export default function SeniorsPage() {
  const tSenior = useTranslations('LandingPage.profiles.senior');
  const tCarelink = useTranslations('LandingPage.carelink');

  const pmrServices = [
    {
      icon: <Home className="h-8 w-8 text-orange-500" />,
      title: tSenior('services.homeHelp.title'),
      description: tSenior('services.homeHelp.description'),
      badge: true
    },
    {
      icon: <UtensilsCrossed className="h-8 w-8 text-orange-500" />,
      title: tSenior('services.mealDelivery.title'),
      description: tSenior('services.mealDelivery.description'),
      badge: true
    },
    {
      icon: <Users className="h-8 w-8 text-orange-500" />,
      title: tSenior('services.companionship.title'),
      description: tSenior('services.companionship.description'),
      badge: true
    },
    {
      icon: <Sparkles className="h-8 w-8 text-orange-500" />,
      title: tSenior('services.groceries.title'),
      description: tSenior('services.groceries.description'),
      badge: true
    },
    {
      icon: <Heart className="h-8 w-8 text-orange-500" />,
      title: tSenior('services.care.title'),
      description: tSenior('services.care.description'),
      badge: true
    },
    {
      icon: <Phone className="h-8 w-8 text-orange-500" />,
      title: tSenior('services.teleassistance.title'),
      description: tSenior('services.teleassistance.description'),
      badge: true
    },
  ];

  const advantages = [
    tSenior('advantages.trained'),
    tSenior('advantages.pmr'),
    tSenior('advantages.cesu'),
    tSenior('advantages.tax'),
    tSenior('advantages.proxy'),
    tSenior('advantages.simple')
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative w-full min-h-[600px] flex items-center bg-gradient-to-br from-orange-500/10 via-background to-red-500/10">
        <div className="absolute inset-0 -z-10">
          <Image
            src={placeholderImages.hero.src}
            alt="Services pour seniors"
            data-ai-hint="Seniors souriants recevant de l'aide à domicile"
            fill
            className="object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background/90" />
        </div>

        <div className="container mx-auto px-4 md:px-6 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6 px-4 py-2 text-base bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20">
              <Accessibility className="mr-2 h-5 w-5" />
              {tSenior('badge')}
            </Badge>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight font-headline mb-6">
              {tSenior('hero.title')}
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              {tSenior('hero.subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="px-8 py-6 text-lg bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                <Link href="#services">
                  <Heart className="mr-2 h-5 w-5" />
                  {tSenior('cta')}
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="px-8 py-6 text-lg">
                <Link href="/carelink">
                  {tCarelink('cta')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <p className="text-sm text-muted-foreground mt-6">
              {tSenior('hero.footer')}
            </p>
          </div>
        </div>
      </section>

      {/* Categories avec filtre PMR */}
      <section className="py-12 bg-accent/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Catégories adaptées</h2>
            <p className="text-muted-foreground flex items-center justify-center gap-2">
              <Accessibility className="h-5 w-5 text-orange-500" />
              Tous nos services sont accessibles aux personnes à mobilité réduite
            </p>
          </div>
          <CategoryPills />
        </div>
      </section>

      {/* Services PMR */}
      <section id="services" className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl font-headline mb-4">
              {tSenior('services.title')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {tSenior('services.subtitle')}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {pmrServices.map((service, index) => (
              <Card key={index} className="border-2 hover:border-orange-500 transition-all hover:shadow-lg">
                <CardHeader>
                  <div className="flex items-start justify-between mb-4">
                    <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 p-3 rounded-full w-fit">
                      {service.icon}
                    </div>
                    {service.badge && (
                      <Badge variant="secondary" className="bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20">
                        <Accessibility className="h-3 w-3 mr-1" />
                        PMR
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Advantages */}
      <section className="py-16 bg-gradient-to-b from-accent/5 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">{tSenior('advantages.title')}</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {advantages.map((adv, idx) => (
                <div key={idx} className="flex items-start gap-3 bg-card p-4 rounded-lg border">
                  <CheckCircle2 className="h-6 w-6 text-orange-500 flex-shrink-0 mt-0.5" />
                  <span className="text-lg">{adv}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Accessibility Features */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-3xl p-8 md:p-12">
              <div className="flex items-start gap-6">
                <div className="bg-orange-500/20 p-4 rounded-2xl">
                  <Accessibility className="h-10 w-10 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-4">{tSenior('accessibility.title')}</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-orange-500" />
                      {tSenior('accessibility.largeText')}
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-orange-500" />
                      {tSenior('accessibility.largeButtons')}
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-orange-500" />
                      {tSenior('accessibility.simpleNav')}
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-orange-500" />
                      {tSenior('accessibility.proxyMode')}
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-orange-500" />
                      {tSenior('accessibility.phoneSupport')}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CareLink Preview */}
      <CarelinkPreview />

      {/* Final CTA */}
      <section className="py-16 bg-gradient-to-b from-accent/5 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Besoin d'aide pour un proche ?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Contactez-nous pour discuter des besoins spécifiques et trouver la solution adaptée.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="px-8 py-6 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                <Link href="/auth/signup">
                  <Heart className="mr-2 h-5 w-5" />
                  Créer un compte
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="px-8 py-6">
                <Link href="/contact">
                  Nous contacter
                </Link>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-6">
              📞 Support téléphonique disponible • 💬 Assistance personnalisée
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
