import { Badge } from '@/components/ui/badge';
import { Accessibility } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

interface AccessibleBadgeProps {
  variant?: 'default' | 'outline' | 'solid';
  className?: string;
  showIcon?: boolean;
}

export function AccessibleBadge({ 
  variant = 'default', 
  className,
  showIcon = true 
}: AccessibleBadgeProps) {
  const t = useTranslations('common.badges');

  const variantStyles = {
    default: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800',
    outline: 'bg-transparent text-orange-700 border-orange-500 dark:text-orange-400',
    solid: 'bg-orange-500 text-white border-orange-600 dark:bg-orange-600',
  };

  return (
    <Badge 
      variant="secondary" 
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium',
        variantStyles[variant],
        className
      )}
    >
      {showIcon && <Accessibility className="h-3.5 w-3.5" aria-hidden="true" />}
      <span>{t('accessible')}</span>
    </Badge>
  );
}
