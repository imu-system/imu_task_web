import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ShieldCheck, CreditCard, Clock, Users, Star } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function StatsTrust() {
  const t = useTranslations('HomePage.stats');

  return (
    <section id="stats" className="w-full py-12 md:py-20 lg:py-28 bg-primary/5">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4">
          <Card className="p-6 rounded-3xl shadow-md flex flex-col items-center text-center">
            <ShieldCheck className="h-10 w-10 text-primary mb-3" />
            <p className="text-4xl md:text-5xl font-bold tracking-tight">1,500+</p>
            <p className="text-muted-foreground mt-2">{t('missions')}</p>
          </Card>

          <Card className="p-6 rounded-3xl shadow-md flex flex-col items-center text-center">
            <Users className="h-10 w-10 text-primary mb-3" />
            <p className="text-4xl md:text-5xl font-bold tracking-tight">800+</p>
            <p className="text-muted-foreground mt-2">{t('members')}</p>
          </Card>

          <Card className="p-6 rounded-3xl shadow-md flex flex-col items-center text-center">
            <Star className="h-10 w-10 text-primary mb-3" />
            <p className="text-4xl md:text-5xl font-bold tracking-tight">4.8/5</p>
            <p className="text-muted-foreground mt-2">{t('rating')}</p>
          </Card>

          <Card className="p-6 rounded-3xl shadow-md flex flex-col items-center text-center">
            <CreditCard className="h-10 w-10 text-primary mb-3" />
            <p className="text-4xl md:text-5xl font-bold tracking-tight">✓</p>
            <p className="text-muted-foreground mt-2">{t('securePayments')}</p>
          </Card>
        </div>

        <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-3 bg-card/80 p-3 rounded-2xl shadow-sm">
              <ShieldCheck className="h-6 w-6 text-primary" />
              <div>
                <p className="text-sm font-semibold">{t('trust.badge1.title')}</p>
                <p className="text-xs text-muted-foreground">{t('trust.badge1.desc')}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-card/80 p-3 rounded-2xl shadow-sm">
              <CreditCard className="h-6 w-6 text-primary" />
              <div>
                <p className="text-sm font-semibold">{t('trust.badge2.title')}</p>
                <p className="text-xs text-muted-foreground">{t('trust.badge2.desc')}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-card/80 p-3 rounded-2xl shadow-sm">
              <Clock className="h-6 w-6 text-primary" />
              <div>
                <p className="text-sm font-semibold">{t('trust.badge3.title')}</p>
                <p className="text-xs text-muted-foreground">{t('trust.badge3.desc')}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-card/80 p-3 rounded-2xl shadow-sm">
              <Users className="h-6 w-6 text-primary" />
              <div>
                <p className="text-sm font-semibold">{t('trust.badge4.title')}</p>
                <p className="text-xs text-muted-foreground">{t('trust.badge4.desc')}</p>
              </div>
            </div>
          </div>

          <div className="flex-shrink-0">
            <Button asChild className="rounded-2xl">
              <a href="/security">{t('trust.learnMore')}</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default StatsTrust;
