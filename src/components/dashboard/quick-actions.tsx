'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  PlusCircle, 
  Search, 
  Calendar, 
  MessageSquare, 
  FileText, 
  Star,
  Briefcase,
  Users,
  Phone,
  Bell,
  Settings,
  TrendingUp,
  MapPin,
  Heart
} from 'lucide-react';
import { Link } from '@/navigation';
import { AccountType } from '@/lib/types';
import { cn } from '@/lib/utils';

interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: 'default' | 'secondary' | 'outline';
  className?: string;
}

interface QuickActionsProps {
  accountType: AccountType;
  className?: string;
  compact?: boolean;
}

/**
 * Actions rapides contextuelles selon le type de compte
 * 
 * - Client: Poster une tâche, chercher un service, voir favoris
 * - Pro: Voir missions, gérer agenda, envoyer devis
 * - Senior: Appeler aidant, services récurrents, SOS
 */
export function QuickActions({ 
  accountType, 
  className,
  compact = false 
}: QuickActionsProps) {
  
  const getQuickActions = (): QuickAction[] => {
    switch (accountType) {
      case AccountType.individual:
        return [
          {
            id: 'post-task',
            label: 'Poster une tâche',
            description: 'Créer une nouvelle demande de service',
            icon: <PlusCircle className="h-5 w-5" />,
            href: '/create-task',
            variant: 'default',
            className: 'bg-primary text-primary-foreground hover:bg-primary/90'
          },
          {
            id: 'search-services',
            label: 'Rechercher un service',
            description: 'Trouver le prestataire idéal',
            icon: <Search className="h-5 w-5" />,
            href: '/search',
            variant: 'outline'
          },
          {
            id: 'favorites',
            label: 'Mes favoris',
            description: 'Prestataires enregistrés',
            icon: <Heart className="h-5 w-5" />,
            href: '/dashboard/client/favorites',
            variant: 'outline'
          },
          {
            id: 'bookings',
            label: 'Mes réservations',
            description: 'Gérer vos rendez-vous',
            icon: <Calendar className="h-5 w-5" />,
            href: '/dashboard/bookings',
            variant: 'outline'
          },
          {
            id: 'messages',
            label: 'Messages',
            description: 'Discuter avec les prestataires',
            icon: <MessageSquare className="h-5 w-5" />,
            href: '/dashboard/messages',
            variant: 'outline'
          },
          {
            id: 'nearby',
            label: 'À proximité',
            description: 'Services près de vous',
            icon: <MapPin className="h-5 w-5" />,
            href: '/search?nearby=true',
            variant: 'outline'
          },
        ];

      case AccountType.professional:
        return [
          {
            id: 'new-missions',
            label: 'Nouvelles missions',
            description: 'Opportunités disponibles',
            icon: <TrendingUp className="h-5 w-5" />,
            href: '/dashboard/pro/missions',
            variant: 'default',
            className: 'bg-primary text-primary-foreground hover:bg-primary/90'
          },
          {
            id: 'send-quote',
            label: 'Envoyer un devis',
            description: 'Créer une proposition',
            icon: <FileText className="h-5 w-5" />,
            href: '/dashboard/pro/quotes/create',
            variant: 'outline'
          },
          {
            id: 'calendar',
            label: 'Mon agenda',
            description: 'Planning et rendez-vous',
            icon: <Calendar className="h-5 w-5" />,
            href: '/dashboard/pro/calendar',
            variant: 'outline'
          },
          {
            id: 'clients',
            label: 'Mes clients',
            description: 'Gérer les relations',
            icon: <Users className="h-5 w-5" />,
            href: '/dashboard/pro/clients',
            variant: 'outline'
          },
          {
            id: 'stats',
            label: 'Statistiques',
            description: 'Performances et revenus',
            icon: <Briefcase className="h-5 w-5" />,
            href: '/dashboard/pro',
            variant: 'outline'
          },
          {
            id: 'messages',
            label: 'Messages',
            description: 'Discussions clients',
            icon: <MessageSquare className="h-5 w-5" />,
            href: '/dashboard/messages',
            variant: 'outline'
          },
        ];

      case AccountType.senior:
        return [
          {
            id: 'call-caregiver',
            label: 'Appeler mon aidant',
            description: 'Contact rapide',
            icon: <Phone className="h-5 w-5" />,
            onClick: () => {
              // TODO: Implémenter l'appel rapide
              alert('Fonctionnalité d\'appel à venir');
            },
            variant: 'default',
            className: 'bg-primary text-primary-foreground hover:bg-primary/90'
          },
          {
            id: 'recurring-services',
            label: 'Services réguliers',
            description: 'Gérer mes abonnements',
            icon: <Calendar className="h-5 w-5" />,
            href: '/dashboard/senior/recurring',
            variant: 'outline'
          },
          {
            id: 'assistance',
            label: 'Demander de l\'aide',
            description: 'Trouver un service',
            icon: <Search className="h-5 w-5" />,
            href: '/search?category=home-assistance',
            variant: 'outline'
          },
          {
            id: 'sos',
            label: 'SOS Urgence',
            description: 'Aide immédiate',
            icon: <Bell className="h-5 w-5" />,
            onClick: () => {
              // TODO: Implémenter le système SOS
              if (confirm('Voulez-vous alerter vos contacts d\'urgence ?')) {
                alert('Alerte SOS envoyée à vos contacts');
              }
            },
            variant: 'default',
            className: 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
          },
        ];

      default:
        return [];
    }
  };

  const actions = getQuickActions();

  if (compact) {
    // Version compacte - Boutons horizontaux
    return (
      <div className={cn('flex flex-wrap gap-2', className)}>
        {actions.slice(0, 4).map((action) => (
          action.href ? (
            <Link key={action.id} href={action.href}>
              <Button 
                variant={action.variant as any} 
                size="sm"
                className={cn('gap-2', action.className)}
              >
                {action.icon}
                <span className="hidden sm:inline">{action.label}</span>
              </Button>
            </Link>
          ) : (
            <Button
              key={action.id}
              onClick={action.onClick}
              variant={action.variant as any}
              size="sm"
              className={cn('gap-2', action.className)}
            >
              {action.icon}
              <span className="hidden sm:inline">{action.label}</span>
            </Button>
          )
        ))}
      </div>
    );
  }

  // Version carte complète
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className={cn(
          'text-xl',
          accountType === 'senior' && 'text-2xl'
        )}>
          Actions rapides
        </CardTitle>
        <CardDescription>
          {accountType === AccountType.individual && 'Gérez vos services en un clic'}
          {accountType === AccountType.professional && 'Développez votre activité'}
          {accountType === AccountType.senior && 'Tout à portée de main'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className={cn(
          'grid gap-3',
          accountType === AccountType.senior ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-2 md:grid-cols-3'
        )}>
          {actions.map((action) => (
            action.href ? (
              <Link key={action.id} href={action.href}>
                <Button
                  variant={action.variant as any}
                  className={cn(
                    'w-full h-auto flex flex-col items-start gap-2 p-4',
                    accountType === AccountType.senior && 'h-24 p-6',
                    action.className
                  )}
                >
                  <div className="flex items-center gap-2 w-full">
                    {action.icon}
                    <span className={cn(
                      'font-semibold text-left',
                      accountType === AccountType.senior && 'text-lg'
                    )}>
                      {action.label}
                    </span>
                  </div>
                  <span className={cn(
                    'text-xs text-muted-foreground text-left w-full',
                    accountType === AccountType.senior && 'text-sm',
                    action.className && 'text-current opacity-80'
                  )}>
                    {action.description}
                  </span>
                </Button>
              </Link>
            ) : (
              <Button
                key={action.id}
                onClick={action.onClick}
                variant={action.variant as any}
                className={cn(
                  'w-full h-auto flex flex-col items-start gap-2 p-4',
                  accountType === AccountType.senior && 'h-24 p-6',
                  action.className
                )}
              >
                <div className="flex items-center gap-2 w-full">
                  {action.icon}
                  <span className={cn(
                    'font-semibold text-left',
                    accountType === AccountType.senior && 'text-lg'
                  )}>
                    {action.label}
                  </span>
                </div>
                <span className={cn(
                  'text-xs text-muted-foreground text-left w-full',
                  accountType === AccountType.senior && 'text-sm',
                  action.className && 'text-current opacity-80'
                )}>
                  {action.description}
                </span>
              </Button>
            )
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
