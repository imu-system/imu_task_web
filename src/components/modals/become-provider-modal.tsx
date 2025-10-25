'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Briefcase, 
  User, 
  Heart, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  TrendingUp,
  Shield
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface BecomeProviderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BecomeProviderModal({ open, onOpenChange }: BecomeProviderModalProps) {
  const t = useTranslations('BecomeProviderModal');
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<'individual' | 'professional' | null>(null);

  const providerTypes = [
    {
      type: 'individual' as const,
      icon: User,
      title: t('individual.title'),
      description: t('individual.description'),
      gradient: 'from-blue-500 to-cyan-500',
      benefits: [
        t('individual.benefits.noCertification'),
        t('individual.benefits.flexible'),
        t('individual.benefits.freeSignup'),
        t('individual.benefits.securePayment'),
      ],
      badge: t('individual.badge'),
      cta: t('individual.cta'),
      href: '/auth/signup?type=individual&role=provider',
    },
    {
      type: 'professional' as const,
      icon: Briefcase,
      title: t('professional.title'),
      description: t('professional.description'),
      gradient: 'from-purple-500 to-pink-500',
      benefits: [
        t('professional.benefits.verifiedBadge'),
        t('professional.benefits.qualifiedLeads'),
        t('professional.benefits.autoInvoicing'),
        t('professional.benefits.managementTools'),
      ],
      badge: t('professional.badge'),
      cta: t('professional.cta'),
      href: '/professionnels',
    },
  ];

  const handleSelectType = (type: 'individual' | 'professional', href: string) => {
    setSelectedType(type);
    setTimeout(() => {
      router.push(href);
      onOpenChange(false);
      setSelectedType(null);
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-center mb-2">
            <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              {t('title')}
            </span>
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            {t('subtitle')}
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 mt-6">
          {providerTypes.map((provider) => {
            const Icon = provider.icon;
            const isSelected = selectedType === provider.type;

            return (
              <Card
                key={provider.type}
                className={`
                  relative cursor-pointer transition-all duration-300
                  ${isSelected ? 'ring-4 ring-primary scale-[1.02]' : 'hover:shadow-xl hover:border-primary/50'}
                  border-2
                `}
                onClick={() => handleSelectType(provider.type, provider.href)}
              >
                {provider.badge && (
                  <Badge 
                    variant="secondary" 
                    className="absolute -top-3 -right-3 px-3 py-1 text-sm font-semibold shadow-lg"
                  >
                    {provider.badge}
                  </Badge>
                )}

                <CardHeader className="pb-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-4 rounded-2xl bg-gradient-to-br ${provider.gradient} shadow-lg`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-2xl mb-2">{provider.title}</CardTitle>
                      <CardDescription className="text-base">
                        {provider.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {provider.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{benefit}</span>
                      </div>
                    ))}
                  </div>

                  <Button 
                    className={`
                      w-full mt-4 bg-gradient-to-r ${provider.gradient} 
                      hover:opacity-90 text-white shadow-lg
                      ${isSelected ? 'animate-pulse' : ''}
                    `}
                    size="lg"
                  >
                    {provider.cta}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Additional info */}
        <div className="mt-8 p-6 bg-gradient-to-r from-primary/5 to-purple-500/5 rounded-2xl border border-primary/10">
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 rounded-full bg-primary/10">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-semibold">{t('globalBenefits.simple.title')}</h4>
              <p className="text-sm text-muted-foreground">{t('globalBenefits.simple.description')}</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 rounded-full bg-primary/10">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-semibold">{t('globalBenefits.grow.title')}</h4>
              <p className="text-sm text-muted-foreground">{t('globalBenefits.grow.description')}</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 rounded-full bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-semibold">{t('globalBenefits.secure.title')}</h4>
              <p className="text-sm text-muted-foreground">{t('globalBenefits.secure.description')}</p>
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-4">
          {t('footer')} <Button variant="link" className="p-0 h-auto" onClick={() => {
            router.push('/auth/signin');
            onOpenChange(false);
          }}>{t('signIn')}</Button>
        </p>
      </DialogContent>
    </Dialog>
  );
}
