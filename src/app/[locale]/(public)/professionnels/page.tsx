'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Briefcase, 
  TrendingUp, 
  Award, 
  Users, 
  Calendar, 
  Shield,
  CheckCircle2,
  ArrowRight,
  Heart
} from 'lucide-react';
import Image from 'next/image';
import { Link } from '@/navigation';
import { useTranslations } from 'next-intl';
import placeholderImages from '@/app/lib/placeholder-images.json';

export default function ProfessionnelsPage() {
  const tPro = useTranslations('LandingPage.profiles.professional');

  const features = [
    {
      icon: <TrendingUp className="h-8 w-8 text-purple-500" />,
      title: tPro('features.growth.title'),
      description: tPro('features.growth.description')
    },
    {
      icon: <Award className="h-8 w-8 text-purple-500" />,
      title: tPro('features.badge.title'),
      description: tPro('features.badge.description')
    },
    {
      icon: <Users className="h-8 w-8 text-purple-500" />,
      title: tPro('features.clientManagement.title'),
      description: tPro('features.clientManagement.description')
    },
    {
      icon: <Calendar className="h-8 w-8 text-purple-500" />,
      title: tPro('features.smartPlanning.title'),
      description: tPro('features.smartPlanning.description')
    },
    {
      icon: <Shield className="h-8 w-8 text-purple-500" />,
      title: tPro('features.securePayments.title'),
      description: tPro('features.securePayments.description')
    },
    {
      icon: <Briefcase className="h-8 w-8 text-purple-500" />,
      title: tPro('features.portfolio.title'),
      description: tPro('features.portfolio.description')
    },
  ];

  const categories = [
    tPro('categories.plumbing'),
    tPro('categories.electricity'),
    tPro('categories.handyman'),
    tPro('categories.itSupport'),
    tPro('categories.tutoring'),
    tPro('categories.coaching'),
    tPro('categories.more')
  ];

  const advantages = [
    tPro('advantages.commission'),
    tPro('advantages.leads'),
    tPro('advantages.billing'),
    tPro('advantages.analytics'),
    tPro('advantages.support'),
    tPro('advantages.flexible')
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative w-full min-h-[600px] flex items-center bg-gradient-to-br from-purple-500/10 via-background to-pink-500/10">
        <div className="absolute inset-0 -z-10">
          <Image
            src={placeholderImages.hero.src}
            alt="Services professionnels"
            data-ai-hint="Professionnels au travail"
            fill
            className="object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background/90" />
        </div>

        <div className="container mx-auto px-4 md:px-6 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6 px-4 py-2 bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20">
              {tPro('badge')}
            </Badge>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight font-headline mb-6">
              {tPro('hero.title')}{' '}
              <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                ImuPro
              </span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              {tPro('hero.subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="px-8 py-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                <Link href="/auth/signup?type=pro">
                  <Briefcase className="mr-2 h-5 w-5" />
                  {tPro('hero.cta')}
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="px-8 py-6">
                <Link href="#avantages">
                  {tPro('cta')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories professionnelles */}
      <section className="py-16 bg-accent/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{tPro('categories.title')}</h2>
            <p className="text-muted-foreground">Rejoignez des centaines de professionnels déjà actifs</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
            {categories.map((cat, idx) => (
              <Badge key={idx} variant="outline" className="px-4 py-2 text-sm">
                {cat}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="avantages" className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl font-headline mb-4">
              {tPro('features.title')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {tPro('description')}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="border-2 hover:border-purple-500 transition-all hover:shadow-lg">
                <CardHeader>
                  <div className="mb-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-3 rounded-full w-fit">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Advantages List */}
      <section className="py-16 bg-gradient-to-b from-accent/5 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">{tPro('advantages.title')}</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {advantages.map((adv, idx) => (
                <div key={idx} className="flex items-start gap-3 bg-card p-4 rounded-lg border">
                  <CheckCircle2 className="h-6 w-6 text-purple-500 flex-shrink-0 mt-0.5" />
                  <span className="text-lg">{adv}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">{tPro('pricing.title')}</h2>
              <p className="text-muted-foreground">{tPro('pricing.subtitle')}</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Starter */}
              <Card className="relative border-2">
                <CardHeader>
                  <CardTitle>{tPro('pricing.starter.name')}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{tPro('pricing.starter.price')}</span>
                    <span className="text-muted-foreground">{tPro('pricing.starter.period')}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      {tPro('pricing.starter.commission')}
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      {tPro('pricing.starter.feature1')}
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      {tPro('pricing.starter.feature2')}
                    </li>
                  </ul>
                  <Button asChild variant="outline" className="w-full mt-6">
                    <Link href="/auth/signup?type=pro&plan=starter">{tPro('pricing.starter.cta')}</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Plus (Populaire) */}
              <Card className="relative border-2 border-purple-500 shadow-lg">
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-500">
                  ⭐ {tPro('pricing.plus.badge')}
                </Badge>
                <CardHeader>
                  <CardTitle>{tPro('pricing.plus.name')}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{tPro('pricing.plus.price')}</span>
                    <span className="text-muted-foreground">{tPro('pricing.plus.period')}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      {tPro('pricing.plus.commission')}
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      {tPro('pricing.plus.feature2')}
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      {tPro('pricing.plus.feature3')}
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      {tPro('pricing.plus.feature4')}
                    </li>
                  </ul>
                  <Button asChild className="w-full mt-6 bg-purple-500 hover:bg-purple-600">
                    <Link href="/auth/signup?type=pro&plan=plus">{tPro('pricing.plus.cta')}</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Elite */}
              <Card className="relative border-2">
                <CardHeader>
                  <CardTitle>{tPro('pricing.elite.name')}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{tPro('pricing.elite.price')}</span>
                    <span className="text-muted-foreground">{tPro('pricing.elite.period')}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      {tPro('pricing.elite.commission')}
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      {tPro('pricing.elite.feature1')}
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      {tPro('pricing.elite.feature2')}
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      {tPro('pricing.elite.feature3')}
                    </li>
                  </ul>
                  <Button asChild variant="outline" className="w-full mt-6">
                    <Link href="/auth/signup?type=pro&plan=elite">{tPro('pricing.elite.cta')}</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Prêt à développer votre activité ?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Rejoignez ImuPro aujourd'hui et commencez à recevoir des demandes de clients qualifiés.
            </p>
            <Button asChild size="lg" className="px-8 py-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
              <Link href="/auth/signup?type=pro">
                <Briefcase className="mr-2 h-5 w-5" />
                Créer mon compte Pro
              </Link>
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              Sans engagement • Inscription gratuite • Annulation à tout moment
            </p>
          </div>
        </div>
      </section>

      {/* Other Profiles */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Découvrez nos autres services</h2>
            <p className="text-muted-foreground">ImuTask s'adapte à tous les profils</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card className="border-2 hover:border-blue-500 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-4 mb-2">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle>Vous êtes particulier ?</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Trouvez de l'aide pour vos tâches quotidiennes rapidement et en toute confiance.
                </p>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/particuliers">
                    Voir les services particuliers
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-orange-500 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-4 mb-2">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500">
                    <Heart className="h-6 w-6 text-white" />
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
