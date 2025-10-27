'use client';

import { AccountType } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { User, Briefcase, Heart, Check, X, ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';

interface AccountTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountType: AccountType;
  onSelectType: (type: AccountType) => void;
}

type FeatureComparison = {
  key: string;
  individual: boolean | string;
  professional: boolean | string;
  senior: boolean | string;
};

export function AccountTypeModal({
  isOpen,
  onClose,
  accountType,
  onSelectType,
}: AccountTypeModalProps) {
  const t = useTranslations('Onboarding.modal');

  // Configuration par type
  const typeConfig = {
    [AccountType.individual]: {
      icon: User,
      colorClass: 'text-blue-600',
      bgClass: 'bg-blue-50',
      borderClass: 'border-blue-200',
      buttonClass: 'bg-blue-600 hover:bg-blue-700',
    },
    [AccountType.professional]: {
      icon: Briefcase,
      colorClass: 'text-green-600',
      bgClass: 'bg-green-50',
      borderClass: 'border-green-200',
      buttonClass: 'bg-green-600 hover:bg-green-700',
    },
    [AccountType.senior]: {
      icon: Heart,
      colorClass: 'text-rose-600',
      bgClass: 'bg-rose-50',
      borderClass: 'border-rose-200',
      buttonClass: 'bg-rose-600 hover:bg-rose-700',
    },
  };

  const config = typeConfig[accountType];
  const Icon = config.icon;

  // Tableau de comparaison
  const comparisonFeatures: FeatureComparison[] = [
    {
      key: 'searchServices',
      individual: true,
      professional: false,
      senior: true,
    },
    {
      key: 'offerServices',
      individual: false,
      professional: true,
      senior: false,
    },
    {
      key: 'calendar',
      individual: false,
      professional: true,
      senior: false,
    },
    {
      key: 'statistics',
      individual: false,
      professional: true,
      senior: false,
    },
    {
      key: 'securePayment',
      individual: true,
      professional: true,
      senior: true,
    },
    {
      key: 'pmrServices',
      individual: false,
      professional: 'optional',
      senior: true,
    },
    {
      key: 'sosButton',
      individual: false,
      professional: false,
      senior: true,
    },
    {
      key: 'insurance',
      individual: false,
      professional: true,
      senior: false,
    },
  ];

  const handleSelectAndClose = () => {
    onSelectType(accountType);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          {/* Icon + Title */}
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-12 h-12 rounded-lg ${config.bgClass} ${config.borderClass} border-2 flex items-center justify-center`}>
              <Icon className={`w-6 h-6 ${config.colorClass}`} />
            </div>
            <DialogTitle className="text-2xl">
              {t(`${accountType}.title`)}
            </DialogTitle>
          </div>
          
          <DialogDescription className="text-base">
            {t(`${accountType}.subtitle`)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Cas d'usage */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="font-semibold text-lg mb-2">
              {t('useCaseTitle')}
            </h3>
            <p className="text-muted-foreground">
              {t(`${accountType}.useCase`)}
            </p>
          </motion.div>

          {/* Avantages */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="font-semibold text-lg mb-3">
              {t('benefitsTitle')}
            </h3>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <motion.div
                  key={num}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + num * 0.05 }}
                  className="flex items-start gap-2"
                >
                  <Check className={`w-5 h-5 mt-0.5 ${config.colorClass} flex-shrink-0`} />
                  <span className="text-sm">
                    {t(`${accountType}.benefit${num}`)}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Tarification */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className={`p-4 rounded-lg border-2 ${config.borderClass} ${config.bgClass}`}
          >
            <h3 className="font-semibold text-lg mb-2">
              {t('pricingTitle')}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t(`${accountType}.pricing`)}
            </p>
          </motion.div>

          {/* Tableau de comparaison */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h3 className="font-semibold text-lg mb-3">
              {t('comparisonTitle')}
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full border border-border rounded-lg">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-3 font-medium text-sm">
                      {t('featureColumn')}
                    </th>
                    <th className="text-center p-3 font-medium text-sm">
                      <div className="flex items-center justify-center gap-2">
                        <User className="w-4 h-4 text-blue-600" />
                        <span>{t('individualColumn')}</span>
                      </div>
                    </th>
                    <th className="text-center p-3 font-medium text-sm">
                      <div className="flex items-center justify-center gap-2">
                        <Briefcase className="w-4 h-4 text-green-600" />
                        <span>{t('professionalColumn')}</span>
                      </div>
                    </th>
                    <th className="text-center p-3 font-medium text-sm">
                      <div className="flex items-center justify-center gap-2">
                        <Heart className="w-4 h-4 text-rose-600" />
                        <span>{t('seniorColumn')}</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((feature, index) => (
                    <motion.tr
                      key={feature.key}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.7 + index * 0.05 }}
                      className="border-t border-border hover:bg-muted/50"
                    >
                      <td className="p-3 text-sm">
                        {t(`comparison.${feature.key}`)}
                      </td>
                      <td className="p-3 text-center">
                        {renderFeatureCell(feature.individual)}
                      </td>
                      <td className="p-3 text-center">
                        {renderFeatureCell(feature.professional)}
                      </td>
                      <td className="p-3 text-center">
                        {renderFeatureCell(feature.senior)}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="flex gap-3 pt-4 border-t border-border"
          >
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              {t('cancelButton')}
            </Button>
            <Button
              onClick={handleSelectAndClose}
              className={`flex-1 ${config.buttonClass} text-white`}
            >
              {t('selectButton')}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Helper pour afficher les cellules du tableau
function renderFeatureCell(value: boolean | string) {
  if (value === true) {
    return <Check className="w-5 h-5 text-green-600 mx-auto" />;
  }
  if (value === false) {
    return <X className="w-5 h-5 text-muted-foreground/30 mx-auto" />;
  }
  // C'est un string (ex: "optional")
  return (
    <span className="text-xs text-muted-foreground italic">
      {value}
    </span>
  );
}
