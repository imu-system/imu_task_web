'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from '@/navigation';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import {
  Sparkles,
  FolderKanban,
  Wrench,
  ShoppingCart,
  Package,
  Monitor,
  FileText,
  Truck,
  Move,
  UserRound,
  Heart,
  Sprout,
  Dog,
  Cat,
  PartyPopper,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ServiceCategory {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  titleKey: string;
  descriptionKey: string;
  services: {
    icon: React.ComponentType<{ className?: string }>;
    nameKey: string;
    slug: string;
  }[];
  color: string;
  gradient: string;
}

export function ServiceCategoriesShowcase() {
  const router = useRouter();
  const t = useTranslations('LandingPage.serviceCategories');
  const tCommon = useTranslations('Common');

  const categories: ServiceCategory[] = [
    {
      id: 'home-help',
      icon: Sparkles,
      titleKey: 'homeHelp.title',
      descriptionKey: 'homeHelp.description',
      color: 'text-blue-600',
      gradient: 'from-blue-50 to-blue-100/50',
      services: [
        { icon: Sparkles, nameKey: 'homeHelp.cleaning', slug: 'menage-entretien' },
        { icon: Wrench, nameKey: 'homeHelp.handyman', slug: 'petit-bricolage' },
        { icon: FolderKanban, nameKey: 'homeHelp.organization', slug: 'rangement' },
      ],
    },
    {
      id: 'shopping-delivery',
      icon: ShoppingCart,
      titleKey: 'shoppingDelivery.title',
      descriptionKey: 'shoppingDelivery.description',
      color: 'text-amber-600',
      gradient: 'from-amber-50 to-amber-100/50',
      services: [
        { icon: ShoppingCart, nameKey: 'shoppingDelivery.grocery', slug: 'courses-alimentaires' },
        { icon: Package, nameKey: 'shoppingDelivery.package', slug: 'colis-livraison' },
      ],
    },
    {
      id: 'tech-admin',
      icon: Monitor,
      titleKey: 'techAdmin.title',
      descriptionKey: 'techAdmin.description',
      color: 'text-violet-600',
      gradient: 'from-violet-50 to-violet-100/50',
      services: [
        { icon: Monitor, nameKey: 'techAdmin.techHelp', slug: 'aide-informatique' },
        { icon: FileText, nameKey: 'techAdmin.adminHelp', slug: 'aide-administrative' },
      ],
    },
    {
      id: 'moving-handling',
      icon: Truck,
      titleKey: 'movingHandling.title',
      descriptionKey: 'movingHandling.description',
      color: 'text-teal-600',
      gradient: 'from-teal-50 to-teal-100/50',
      services: [
        { icon: Truck, nameKey: 'movingHandling.moving', slug: 'demenagement' },
        { icon: Move, nameKey: 'movingHandling.handling', slug: 'manutention' },
      ],
    },
    {
      id: 'accompaniment',
      icon: UserRound,
      titleKey: 'accompaniment.title',
      descriptionKey: 'accompaniment.description',
      color: 'text-rose-600',
      gradient: 'from-rose-50 to-rose-100/50',
      services: [
        { icon: UserRound, nameKey: 'accompaniment.accompaniment', slug: 'accompagnement' },
        { icon: Heart, nameKey: 'accompaniment.companionship', slug: 'compagnie' },
      ],
    },
    {
      id: 'gardening',
      icon: Sprout,
      titleKey: 'gardening.title',
      descriptionKey: 'gardening.description',
      color: 'text-green-600',
      gradient: 'from-green-50 to-green-100/50',
      services: [
        { icon: Sprout, nameKey: 'gardening.gardening', slug: 'jardinage' },
      ],
    },
    {
      id: 'pet-care',
      icon: Dog,
      titleKey: 'petCare.title',
      descriptionKey: 'petCare.description',
      color: 'text-pink-600',
      gradient: 'from-pink-50 to-pink-100/50',
      services: [
        { icon: Dog, nameKey: 'petCare.dogWalking', slug: 'promenade-chien' },
        { icon: Cat, nameKey: 'petCare.petSitting', slug: 'garde-animaux' },
      ],
    },
    {
      id: 'events',
      icon: PartyPopper,
      titleKey: 'events.title',
      descriptionKey: 'events.description',
      color: 'text-indigo-600',
      gradient: 'from-indigo-50 to-indigo-100/50',
      services: [
        { icon: PartyPopper, nameKey: 'events.eventHelp', slug: 'aide-evenementielle' },
      ],
    },
  ];

  const handleCategoryClick = (slug: string) => {
    router.push(`/tasks?category=${slug}`);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <section className="w-full py-12 md:py-20 lg:py-24 bg-gradient-to-b from-background to-accent/5">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl font-headline mb-4">
            {t('title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            {t('subtitle')}
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {categories.map((category) => {
            const CategoryIcon = category.icon;
            return (
              <motion.div key={category.id} variants={itemVariants}>
                <Card
                  className={cn(
                    'h-full overflow-hidden border-2 transition-all duration-300',
                    'hover:shadow-xl hover:-translate-y-1 hover:border-primary/50',
                    'bg-gradient-to-br',
                    category.gradient
                  )}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-3 rounded-full bg-background shadow-sm">
                        <CategoryIcon className={cn('h-6 w-6', category.color)} />
                      </div>
                      <CardTitle className="text-xl font-headline">
                        {t(category.titleKey)}
                      </CardTitle>
                    </div>
                    <CardDescription className="text-sm leading-relaxed">
                      {t(category.descriptionKey)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {category.services.map((service) => {
                        const ServiceIcon = service.icon;
                        return (
                          <Button
                            key={service.slug}
                            variant="ghost"
                            className="w-full justify-start gap-3 h-auto py-3 px-4 hover:bg-background/80"
                            onClick={() => handleCategoryClick(service.slug)}
                          >
                            <ServiceIcon className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                            <span className="text-sm font-medium text-left flex-1">
                              {t(service.nameKey)}
                            </span>
                            <ArrowRight className="h-4 w-4 flex-shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                          </Button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Button
            size="lg"
            onClick={() => router.push('/tasks')}
            className="gap-2 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {t('viewAllServices')}
            <ArrowRight className="h-5 w-5" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
