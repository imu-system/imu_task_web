'use client';

import { AccountType } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Check, User, Briefcase, Heart, LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

interface AccountTypeCardProps {
  type: AccountType;
  selected: boolean;
  onSelect: (type: AccountType) => void;
}

interface CardConfig {
  icon: LucideIcon;
  colorClass: string;
  gradientFrom: string;
  gradientTo: string;
  badgeClass: string;
}

const cardConfigs: Record<string, CardConfig> = {
  [AccountType.individual]: {
    icon: User,
    colorClass: 'text-blue-600',
    gradientFrom: 'from-blue-500',
    gradientTo: 'to-cyan-500',
    badgeClass: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  [AccountType.professional]: {
    icon: Briefcase,
    colorClass: 'text-green-600',
    gradientFrom: 'from-green-500',
    gradientTo: 'to-emerald-500',
    badgeClass: 'bg-green-100 text-green-700 border-green-200',
  },
  [AccountType.senior]: {
    icon: Heart,
    colorClass: 'text-rose-600',
    gradientFrom: 'from-rose-500',
    gradientTo: 'to-pink-500',
    badgeClass: 'bg-rose-100 text-rose-700 border-rose-200',
  },
};

export function AccountTypeCard({ type, selected, onSelect }: AccountTypeCardProps) {
  const t = useTranslations('Onboarding.accountType');
  const config = cardConfigs[type];
  const Icon = config.icon;

  // Get translated features
  const features = [
    t(`${type}.feature1`),
    t(`${type}.feature2`),
    t(`${type}.feature3`),
    t(`${type}.feature4`),
  ];

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -8 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <Card
        className={cn(
          'relative cursor-pointer transition-all duration-300 h-full',
          'border-2 hover:shadow-2xl',
          selected
            ? 'border-primary shadow-xl scale-105 bg-primary/5'
            : 'border-muted hover:border-primary/50'
        )}
        onClick={() => onSelect(type)}
      >
        {/* Selected Checkmark */}
        {selected && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="absolute -top-3 -right-3 z-10"
          >
            <div className="bg-primary text-primary-foreground rounded-full p-2 shadow-lg">
              <Check className="h-5 w-5" />
            </div>
          </motion.div>
        )}

        <CardHeader className="space-y-4">
          {/* Icon with gradient background */}
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            className="inline-block"
          >
            <div
              className={cn(
                'w-16 h-16 rounded-2xl flex items-center justify-center',
                'bg-gradient-to-br shadow-lg',
                config.gradientFrom,
                config.gradientTo
              )}
            >
              <Icon className="h-8 w-8 text-white" />
            </div>
          </motion.div>

          {/* Title */}
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold">
              {t(`${type}.title`)}
            </CardTitle>
            <CardDescription className="text-base leading-relaxed min-h-[48px]">
              {t(`${type}.description`)}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          {/* Features List */}
          <motion.ul
            className="space-y-3"
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.1,
                },
              },
            }}
          >
            {features.map((feature, index) => (
              <motion.li
                key={index}
                variants={{
                  hidden: { opacity: 0, x: -20 },
                  visible: { opacity: 1, x: 0 },
                }}
                className="flex items-start gap-3 group"
              >
                <div className={cn('shrink-0 mt-0.5', config.colorClass)}>
                  <Check className="h-5 w-5" />
                </div>
                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                  {feature}
                </span>
              </motion.li>
            ))}
          </motion.ul>

          {/* Selection hint */}
          {selected && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 pt-4 border-t"
            >
              <p className="text-sm text-center font-medium text-primary">
                {t('selected')} ✓
              </p>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
