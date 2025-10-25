'use client';

import { AccountType } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Users, Briefcase, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AccountTypeSelectorProps {
  selectedType: AccountType | null;
  onSelect: (type: AccountType) => void;
  locale?: string;
}

const accountTypeConfig = {
  individual: {
    icon: Users,
    titleFr: 'Particulier',
    titleEn: 'Individual',
    descriptionFr: 'Proposez vos services ponctuellement dans vos temps libres',
    descriptionEn: 'Offer your services occasionally in your free time',
    badge: '0€',
    badgeFr: 'de frais',
    badgeEn: 'fees',
    color: 'from-blue-500 to-cyan-500',
    features: {
      fr: ['Aucune certification requise', 'Horaires 100% flexibles', 'Inscription gratuite', 'Paiement sécurisé'],
      en: ['No certification required', '100% flexible hours', 'Free registration', 'Secure payment']
    }
  },
  professional: {
    icon: Briefcase,
    titleFr: 'Professionnel',
    titleEn: 'Professional',
    descriptionFr: 'Développez votre activité avec ImuPro, notre plateforme pro',
    descriptionEn: 'Grow your business with ImuPro, our professional platform',
    badge: '⭐',
    badgeFr: 'Populaire',
    badgeEn: 'Popular',
    color: 'from-purple-500 to-pink-500',
    features: {
      fr: ['Badge Pro Vérifié', 'Leads qualifiés', 'Facturation automatisée', 'Outils de gestion'],
      en: ['Verified Pro Badge', 'Qualified leads', 'Automated invoicing', 'Management tools']
    }
  },
  senior: {
    icon: Heart,
    titleFr: 'Senior ou Aidant',
    titleEn: 'Senior or Caregiver',
    descriptionFr: 'Services adaptés pour le maintien à domicile',
    descriptionEn: 'Services adapted for home care',
    badge: '♿',
    badgeFr: 'Accessible',
    badgeEn: 'Accessible',
    color: 'from-emerald-500 to-teal-500',
    features: {
      fr: ['Interface simplifiée', 'Gros caractères', 'Services PMR certifiés', 'Gestion par aidant'],
      en: ['Simplified interface', 'Large fonts', 'Certified PMR services', 'Caregiver management']
    }
  }
};

export function AccountTypeSelector({ selectedType, onSelect, locale = 'fr' }: AccountTypeSelectorProps) {
  const isFr = locale === 'fr';

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">
          {isFr ? 'Choisissez votre profil' : 'Choose your profile'}
        </h2>
        <p className="text-muted-foreground">
          {isFr 
            ? 'Sélectionnez le type de compte qui vous correspond' 
            : 'Select the account type that suits you'}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {Object.entries(accountTypeConfig).map(([type, config]) => {
          const Icon = config.icon;
          const isSelected = selectedType === type;

          return (
            <Card
              key={type}
              className={cn(
                'relative cursor-pointer transition-all hover:shadow-lg border-2',
                isSelected
                  ? 'border-primary shadow-md scale-105'
                  : 'border-transparent hover:border-primary/50'
              )}
              onClick={() => onSelect(type as AccountType)}
            >
              {isSelected && (
                <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full p-1">
                  <Check className="h-4 w-4" />
                </div>
              )}

              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <div className={cn(
                    'p-3 rounded-lg bg-gradient-to-br',
                    config.color,
                    'text-white'
                  )}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {config.badge} {isFr ? config.badgeFr : config.badgeEn}
                  </Badge>
                </div>
                <CardTitle className="text-xl">
                  {isFr ? config.titleFr : config.titleEn}
                </CardTitle>
                <CardDescription className="text-sm h-12">
                  {isFr ? config.descriptionFr : config.descriptionEn}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <ul className="space-y-2 text-sm">
                  {(isFr ? config.features.fr : config.features.en).map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
