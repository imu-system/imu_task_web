/**
 * Breadcrumbs Component
 * 
 * Navigation secondaire pour pages profondes
 * Support i18n complet avec next-intl
 * Accessible avec ARIA labels
 */

'use client';

import { Fragment } from 'react';
import { Link } from '@/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  /**
   * Afficher l'icône Home pour le premier item
   * @default true
   */
  showHomeIcon?: boolean;
  /**
   * Classe CSS personnalisée
   */
  className?: string;
}

/**
 * Composant Breadcrumbs
 * 
 * @example
 * ```tsx
 * <Breadcrumbs items={[
 *   { label: 'Dashboard', href: '/dashboard' },
 *   { label: 'Profile', href: '/profile' },
 *   { label: 'Settings', href: '/profile/settings' }
 * ]} />
 * ```
 */
export function Breadcrumbs({ 
  items, 
  showHomeIcon = true,
  className 
}: BreadcrumbsProps) {
  const t = useTranslations('Breadcrumbs');

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <nav 
      aria-label={t('ariaLabel')}
      className={cn(
        'flex items-center space-x-1 text-sm text-muted-foreground',
        className
      )}
    >
      <ol className="flex items-center space-x-1">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const Icon = item.icon;
          const showIcon = index === 0 && showHomeIcon && !Icon;

          return (
            <Fragment key={item.href}>
              <li className="flex items-center">
                {isLast ? (
                  // Dernier item : pas de lien, texte en bold
                  <span 
                    className="font-medium text-foreground flex items-center gap-1"
                    aria-current="page"
                  >
                    {showIcon && <Home className="h-4 w-4" />}
                    {Icon && <Icon className="h-4 w-4" />}
                    {item.label}
                  </span>
                ) : (
                  // Items précédents : liens cliquables
                  <Link
                    href={item.href}
                    className="hover:text-foreground transition-colors flex items-center gap-1"
                  >
                    {showIcon && <Home className="h-4 w-4" />}
                    {Icon && <Icon className="h-4 w-4" />}
                    {item.label}
                  </Link>
                )}
              </li>

              {/* Séparateur (sauf pour le dernier item) */}
              {!isLast && (
                <li>
                  <ChevronRight 
                    className="h-4 w-4 text-muted-foreground/50" 
                    aria-hidden="true"
                  />
                </li>
              )}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}

/**
 * Variante compacte pour mobile
 */
export function BreadcrumbsCompact({ items }: { items: BreadcrumbItem[] }) {
  const t = useTranslations('Breadcrumbs');

  if (!items || items.length === 0) {
    return null;
  }

  const lastItem = items[items.length - 1];
  const hasParent = items.length > 1;
  const parentItem = hasParent ? items[items.length - 2] : null;

  return (
    <nav 
      aria-label={t('ariaLabel')}
      className="flex items-center space-x-1 text-sm text-muted-foreground md:hidden"
    >
      {hasParent && parentItem && (
        <>
          <Link
            href={parentItem.href}
            className="hover:text-foreground transition-colors flex items-center gap-1"
          >
            <ChevronRight className="h-4 w-4 rotate-180" />
            {parentItem.label}
          </Link>
          <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
        </>
      )}
      <span className="font-medium text-foreground">
        {lastItem.label}
      </span>
    </nav>
  );
}
