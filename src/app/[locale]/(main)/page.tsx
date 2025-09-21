
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
} from 'lucide-react';
import Image from 'next/image';
import { Link } from '@/navigation';
import { useTranslations } from 'next-intl';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useEffect, useState, ReactNode } from 'react';
import type { ServiceCategory } from '@/lib/types';
import TestimonialCard from '@/components/testimonial-card';
import placeholderImages from '@/app/lib/placeholder-images.json';

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

  return (
    <>
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
                  <Link href="/sign-up">{tHeader('signUp')}</Link>
                </Button>
                <Button asChild variant="secondary" size="lg">
                  <Link href="/sign-in">{tHeader('signIn')}</Link>
                </Button>
              </div>
            </div>
          </div>
          <Image
            src={placeholderImages.hero.src}
            alt="Helping hands"
            data-ai-hint={placeholderImages.hero.hint}
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

        <section id="stats" className="w-full py-12 md:py-24 lg:py-32 bg-primary/5">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-3 text-center">
                    <div className="flex flex-col items-center">
                        <HardHat className="h-10 w-10 text-primary mb-4" />
                        <p className="text-4xl font-bold tracking-tighter">1500+</p>
                        <p className="text-muted-foreground">{t('stats.missions')}</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <Users className="h-10 w-10 text-primary mb-4" />
                        <p className="text-4xl font-bold tracking-tighter">800+</p>
                        <p className="text-muted-foreground">{t('stats.members')}</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <Star className="h-10 w-10 text-primary mb-4" />
                        <p className="text-4xl font-bold tracking-tighter">4.8/5</p>
                        <p className="text-muted-foreground">{t('stats.rating')}</p>
                    </div>
                </div>
            </div>
        </section>

        <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32 bg-card">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter text-center sm:text-4xl font-headline mb-12">
              {t('howItWorksTitle')}
            </h2>
            <div className="grid gap-8 lg:grid-cols-2">
                <Card className="flex flex-col">
                    <CardHeader className="items-center text-center">
                        <Users className="h-12 w-12 text-primary"/>
                        <CardTitle className="text-2xl mt-4">{t('forClients.title')}</CardTitle>
                        <CardDescription>{t('forClients.description')}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow flex items-center justify-center">
                       <Image
                          src={placeholderImages.forClients.src}
                          alt={t('forClients.title')}
                          data-ai-hint={placeholderImages.forClients.hint}
                          width={400}
                          height={300}
                          className="rounded-xl shadow-lg"
                        />
                    </CardContent>
                    <CardContent>
                        <Button asChild size="lg" className="w-full">
                            <Link href="/inscription?role=client">{t('forClients.button')}</Link>
                        </Button>
                    </CardContent>
                </Card>
                 <Card className="flex flex-col">
                    <CardHeader className="items-center text-center">
                        <HardHat className="h-12 w-12 text-primary"/>
                        <CardTitle className="text-2xl mt-4">{t('forProviders.title')}</CardTitle>
                        <CardDescription>{t('forProviders.description')}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow flex items-center justify-center">
                        <Image
                          src={placeholderImages.forProviders.src}
                          alt={t('forProviders.title')}
                          data-ai-hint={placeholderImages.forProviders.hint}
                          width={400}
                          height={300}
                          className="rounded-xl shadow-lg"
                        />
                    </CardContent>
                    <CardContent>
                       <Button asChild size="lg" className="w-full">
                            <Link href="/inscription?role=provider">{t('forProviders.button')}</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
          </div>
        </section>

        <section id="testimonials" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter text-center sm:text-4xl font-headline mb-12">
              {t('testimonials.title')}
            </h2>
            <div className="grid gap-8 lg:grid-cols-2">
                <TestimonialCard
                    name={t('testimonials.testimonial1.name')}
                    role={t('testimonials.testimonial1.role')}
                    avatarUrl={placeholderImages.testimonial1.src}
                    avatarFallback="M"
                    testimonial={t('testimonials.testimonial1.text')}
                />
                <TestimonialCard
                    name={t('testimonials.testimonial2.name')}
                    role={t('testimonials.testimonial2.role')}
                    avatarUrl={placeholderImages.testimonial2.src}
                    avatarFallback="L"
                    testimonial={t('testimonials.testimonial2.text')}
                />
            </div>
          </div>
        </section>

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
                    <p className="mt-2 font-semibold">{category.name.fr || category.slug}</p>
                    </Card>
                ))
              )}
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
