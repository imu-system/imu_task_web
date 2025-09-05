import Header from '@/components/header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ShoppingBasket,
  Spade,
  HeartHandshake,
  ShieldCheck,
  MessagesSquare,
  Sparkles,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

const categories = [
  {
    icon: <ShoppingBasket className="h-8 w-8" />,
    nameKey: 'categoryShopping',
  },
  {
    icon: <Spade className="h-8 w-8" />,
    nameKey: 'categoryGardening',
  },
  {
    icon: <Sparkles className="h-8 w-8" />,
    nameKey: 'categoryCleaning',
  },
  {
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8"><path d="M17 14h.01"/><path d="M12.5 4.5h-5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6.5l-4-4Z"/><path d="M15 4.5V8h3.5"/></svg>,
    nameKey: 'categoryAdmin',
  },
];

export default function Home() {
  const t = useTranslations('HomePage');
  
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

  return (
    <>
      <Header />
      <div className="flex flex-col">
        <section className="relative w-full py-20 md:py-32 lg:py-40 bg-card">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl font-headline">
                {t('title')}
              </h1>
              <p className="mt-4 text-lg md:text-xl text-muted-foreground">
                {t('subtitle')}
              </p>
              <p className="mt-4 max-w-xl mx-auto text-muted-foreground">
                {t('description')}
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg">
                  <Link href="/dashboard">{t('findHelp')}</Link>
                </Button>
                <Button asChild variant="secondary" size="lg">
                  <Link href="/dashboard">{t('offerServices')}</Link>
                </Button>
              </div>
            </div>
          </div>
          <Image
            src="https://picsum.photos/1920/1080"
            alt="Helping hands"
            data-ai-hint="helping hands"
            fill
            className="absolute inset-0 -z-10 object-cover opacity-10"
          />
        </section>

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

        <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32 bg-card">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-24 items-center">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl font-headline">
                  {t('howItWorksTitle')}
                </h2>
                <p className="text-muted-foreground">
                  {t('howItWorksDesc')}
                </p>
                <ul className="space-y-6">
                  <li className="flex items-start">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold mr-4">
                      1
                    </span>
                    <div>
                      <h3 className="font-semibold">{t('step1Title')}</h3>
                      <p className="text-muted-foreground">
                        {t('step1Desc')}
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold mr-4">
                      2
                    </span>
                    <div>
                      <h3 className="font-semibold">{t('step2Title')}</h3>
                      <p className="text-muted-foreground">
                        {t('step2Desc')}
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold mr-4">
                      3
                    </span>
                    <div>
                      <h3 className="font-semibold">{t('step3Title')}</h3>
                      <p className="text-muted-foreground">
                        {t('step3Desc')}
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
              <div>
                <Image
                  src="https://picsum.photos/600/500"
                  alt="How it works"
                  data-ai-hint="community connection"
                  width={600}
                  height={500}
                  className="rounded-xl shadow-lg"
                />
              </div>
            </div>
          </div>
        </section>

        <section id="categories" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter text-center sm:text-4xl font-headline">
              {t('categoriesTitle')}
            </h2>
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map((category) => (
                <Card key={category.nameKey} className="flex flex-col items-center justify-center p-6">
                  <div className="text-primary">{category.icon}</div>
                  <p className="mt-2 font-semibold">{t(category.nameKey as any)}</p>
                </Card>
              ))}
            </div>
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
                <Link href="/sign-up">{t('signUpFree')}</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
