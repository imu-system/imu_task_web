'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Calendar, 
  Heart, 
  Phone, 
  UtensilsCrossed, 
  Home, 
  Users, 
  Bell,
  Settings,
  HelpCircle
} from 'lucide-react';
import { useTranslations } from 'next-intl';

/**
 * Dashboard Senior - Interface Simplifiée
 * 
 * Caractéristiques :
 * - Texte 24px minimum
 * - Contraste élevé (7:1)
 * - Boutons larges (60x60px minimum)
 * - Navigation linéaire simple
 * - Gros icônes
 */
export default function SeniorDashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const displayName = user?.displayName || 'Utilisateur';
  const firstName = displayName.split(' ')[0];

  // Services récurrents simulés
  const upcomingServices = [
    {
      id: 1,
      icon: UtensilsCrossed,
      title: 'Repas de demain',
      subtitle: 'Livraison à 11h30',
      time: 'Demain 11:30',
      color: 'from-orange-500 to-amber-500'
    },
    {
      id: 2,
      icon: Home,
      title: 'Aide ménagère',
      subtitle: 'Lundi 28/10 à 10h',
      time: 'Lundi 10:00',
      color: 'from-blue-500 to-cyan-500'
    }
  ];

  const quickActions = [
    {
      id: 1,
      icon: UtensilsCrossed,
      label: 'Commander un repas',
      color: 'from-orange-500 to-amber-500',
      href: '/dashboard/services/meals'
    },
    {
      id: 2,
      icon: Home,
      label: 'Aide à domicile',
      color: 'from-blue-500 to-cyan-500',
      href: '/dashboard/services/home-help'
    },
    {
      id: 3,
      icon: Users,
      label: 'Mes contacts',
      color: 'from-purple-500 to-pink-500',
      href: '/dashboard/contacts'
    },
    {
      id: 4,
      icon: Calendar,
      label: 'Mon planning',
      color: 'from-green-500 to-emerald-500',
      href: '/dashboard/calendar'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-2xl">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Header - Gros texte, simple */}
      <div className="mb-8 space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold">
          Bonjour {firstName} 👋
        </h1>
        <p className="text-2xl text-muted-foreground">
          Voici vos services pour aujourd'hui
        </p>
      </div>

      {/* Bouton SOS en haut - Toujours visible */}
      <Alert className="mb-8 border-red-200 bg-red-50 dark:bg-red-950/20">
        <Phone className="h-6 w-6 text-red-600" />
        <AlertDescription className="flex items-center justify-between">
          <span className="text-xl font-semibold text-red-900 dark:text-red-100">
            Besoin d'aide urgente ?
          </span>
          <Button 
            size="lg" 
            variant="destructive"
            className="text-xl px-8 py-6 h-auto"
          >
            <Phone className="mr-2 h-6 w-6" />
            Appeler l'assistance
          </Button>
        </AlertDescription>
      </Alert>

      {/* Services à venir - Cards grandes et claires */}
      <div className="mb-8 space-y-4">
        <h2 className="text-3xl font-bold flex items-center gap-3">
          <Calendar className="h-8 w-8" />
          Prochaines interventions
        </h2>
        
        <div className="grid gap-4 md:grid-cols-2">
          {upcomingServices.map((service) => {
            const Icon = service.icon;
            return (
              <Card key={service.id} className="border-2">
                <CardHeader className="pb-4">
                  <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${service.color} flex items-center justify-center mb-4`}>
                    <Icon className="h-10 w-10 text-white" />
                  </div>
                  <CardTitle className="text-2xl">{service.title}</CardTitle>
                  <CardDescription className="text-xl mt-2">
                    {service.subtitle}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button size="lg" className="w-full text-xl py-6">
                    Voir les détails
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Actions rapides - Gros boutons */}
      <div className="mb-8 space-y-4">
        <h2 className="text-3xl font-bold flex items-center gap-3">
          <Heart className="h-8 w-8" />
          Actions rapides
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.id}
                variant="outline"
                className="h-40 flex-col gap-4 text-lg font-semibold hover:shadow-lg transition-all border-2"
                asChild
              >
                <a href={action.href}>
                  <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center`}>
                    <Icon className="h-10 w-10 text-white" />
                  </div>
                  <span className="text-center leading-tight">{action.label}</span>
                </a>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Aide et paramètres - Toujours accessibles */}
      <div className="grid gap-4 md:grid-cols-2">
        <Button
          variant="outline"
          size="lg"
          className="h-24 text-xl border-2"
          asChild
        >
          <a href="/dashboard/settings">
            <Settings className="mr-3 h-8 w-8" />
            Paramètres
          </a>
        </Button>
        
        <Button
          variant="outline"
          size="lg"
          className="h-24 text-xl border-2"
          asChild
        >
          <a href="/help">
            <HelpCircle className="mr-3 h-8 w-8" />
            Aide & Support
          </a>
        </Button>
      </div>

      {/* Note pour aidant */}
      <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200">
        <p className="text-xl text-blue-900 dark:text-blue-100">
          💡 <strong>Aidant familial ?</strong> Vous pouvez gérer ce compte depuis vos paramètres.
        </p>
      </div>
    </div>
  );
}
