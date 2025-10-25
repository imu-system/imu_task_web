/**
 * Dashboard Senior - Interface Simplifiée et Moderne
 * Version modernisée avec animations accessibles et analytics
 * 
 * Caractéristiques :
 * - Texte 24px minimum
 * - Contraste élevé (7:1)
 * - Boutons larges (60x60px minimum)
 * - Navigation linéaire simple
 * - Gros icônes
 * - Animations réduites (respect prefers-reduced-motion)
 * - Analytics pour interactions seniors
 */
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Calendar, 
  Heart, 
  Phone, 
  UtensilsCrossed, 
  Home, 
  Users, 
  Bell,
  Settings,
  HelpCircle,
  Volume2,
  VolumeX,
  UserPlus,
  Loader2,
  MapPin,
  Shield
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AccountType } from '@/lib/types';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { 
  AnimatedDiv, 
  AnimatedList, 
  AnimatedListItem, 
  AnimatedCard,
  GradientBackground,
  GlowCard,
  ShimmerCard
} from '@/components/ui/animated';
import { 
  logDashboardPageView,
  logGradientSectionView,
  logGlowCardClick,
  logAnimatedElementInteraction
} from '@/lib/analytics';
import { SOSButton } from '@/components/senior/sos-button';
import { VoiceControlPanel } from '@/components/senior/voice-control-panel';

interface CareContact {
  id: string;
  name: string;
  relation: string;
  phone: string;
  email?: string;
}

interface RecurringService {
  id: string;
  type: string;
  frequency: string;
  nextDate: Date;
  providerName: string;
}

export default function SeniorDashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [voiceMode, setVoiceMode] = useState(false);
  const [careContacts, setCareContacts] = useState<CareContact[]>([]);
  const [recurringServices, setRecurringServices] = useState<RecurringService[]>([]);
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', relation: '', phone: '', email: '' });

  useEffect(() => {
    const loadSeniorData = async () => {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        // Charger les contacts aidants depuis Firestore
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const userData = userSnap.data();
          const seniorInfo = userData?.profile?.seniorInfo;
          
          if (seniorInfo?.careContacts) {
            setCareContacts(seniorInfo.careContacts);
          }
          
          // Charger mode vocal depuis les préférences
          if (userData?.preferences?.voiceMode) {
            setVoiceMode(userData.preferences.voiceMode);
          }
        }
        
        // Charger les services récurrents
        const servicesQuery = query(
          collection(db, 'recurring_services'),
          where('userId', '==', user.uid),
          where('active', '==', true)
        );
        
        const servicesSnap = await getDocs(servicesQuery);
        const services = servicesSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          nextDate: doc.data().nextDate?.toDate()
        })) as RecurringService[];
        
        setRecurringServices(services);

        // Log analytics après chargement réussi
        logDashboardPageView(AccountType.senior, 'senior');
        logGradientSectionView('senior_header', AccountType.senior);
      } catch (error) {
        console.error('Error loading senior data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSeniorData();
  }, [user]);

  const toggleVoiceMode = async () => {
    if (!user?.uid) return;
    
    const newVoiceMode = !voiceMode;
    setVoiceMode(newVoiceMode);
    
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        'preferences.voiceMode': newVoiceMode
      });
      
      if (newVoiceMode && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance('Mode vocal activé');
        utterance.lang = 'fr-FR';
        window.speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.error('Error toggling voice mode:', error);
    }
  };

  const handleSOSCall = () => {
    // Appeler le premier contact ou numéro d'urgence
    if (careContacts.length > 0) {
      window.location.href = `tel:${careContacts[0].phone}`;
    } else {
      // Numéro d'urgence par défaut
      window.location.href = 'tel:112';
    }
  };

  const addContact = async () => {
    if (!user?.uid || !newContact.name || !newContact.phone) return;
    
    const contact: CareContact = {
      id: Date.now().toString(),
      ...newContact
    };
    
    const updatedContacts = [...careContacts, contact];
    setCareContacts(updatedContacts);
    
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        'profile.seniorInfo.careContacts': updatedContacts
      });
      
      setNewContact({ name: '', relation: '', phone: '', email: '' });
      setIsAddingContact(false);
    } catch (error) {
      console.error('Error adding contact:', error);
    }
  };

  const displayName = user?.displayName || 'Utilisateur';
  const firstName = displayName.split(' ')[0];

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
      href: '#contacts'
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
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Header moderne avec DashboardHeader */}
      <DashboardHeader 
        accountType={AccountType.senior}
        title="Mon espace personnel"
        showSearch={false}
      />

      {/* QuickActions pour seniors */}
      <QuickActions accountType={AccountType.senior} />

      {/* Header - Gros texte, simple avec gradient doux */}
      <GradientBackground 
        className="rounded-2xl p-8 mb-8 -mx-4 md:mx-0"
        colors={['#86efac', '#bef264', '#fde047']}
      >
        <AnimatedDiv variant="fadeIn" className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                Bonjour {firstName} 👋
              </h1>
              <p className="text-2xl text-gray-700 mt-2">
                Voici vos services pour aujourd'hui
              </p>
            </div>
            <ShimmerCard>
              <Button
                size="lg"
                variant={voiceMode ? 'default' : 'outline'}
                onClick={() => {
                  toggleVoiceMode();
                  logAnimatedElementInteraction('voice_button', 'shimmer', 'senior_voice_toggle');
                }}
                className="h-16 w-16 bg-white/90 hover:bg-white border-2"
                title={voiceMode ? 'Désactiver le mode vocal' : 'Activer le mode vocal'}
              >
                {voiceMode ? <Volume2 className="h-8 w-8" /> : <VolumeX className="h-8 w-8" />}
              </Button>
            </ShimmerCard>
          </div>
        </AnimatedDiv>
      </GradientBackground>

      {/* Panneau de Contrôle Vocal - Nouveau */}
      <AnimatedDiv variant="fadeInUp" className="mb-8">
        <GlowCard glowColor="rgba(59, 130, 246, 0.4)">
          <Card className="border-2 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950 dark:to-background">
            <CardHeader>
              <CardTitle className="text-3xl flex items-center gap-3">
                <Volume2 className="h-8 w-8" />
                Commandes Vocales
              </CardTitle>
              <CardDescription className="text-xl">
                Contrôlez le tableau de bord avec votre voix
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VoiceControlPanel 
                onCommandExecuted={(command) => {
                  console.log('Commande vocale exécutée:', command);
                  logAnimatedElementInteraction('voice_command', 'voice', `senior_voice_${command}`);
                }}
              />
            </CardContent>
          </Card>
        </GlowCard>
      </AnimatedDiv>

      {/* Bouton SOS avec Géolocalisation - Nouveau */}
      <AnimatedDiv variant="fadeInUp" className="mb-8">
        <GlowCard glowColor="rgba(239, 68, 68, 0.6)">
          <Card className="border-4 border-red-500 bg-gradient-to-br from-red-50 to-white dark:from-red-950 dark:to-background">
            <CardHeader>
              <CardTitle className="text-3xl flex items-center gap-3 text-red-700">
                <Shield className="h-8 w-8" />
                Aide d&apos;Urgence
              </CardTitle>
              <CardDescription className="text-xl">
                En cas d&apos;urgence, appuyez sur le bouton SOS pour envoyer votre position GPS à vos contacts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SOSButton 
                emergencyContacts={careContacts.map(c => ({ 
                  name: c.name, 
                  phone: c.phone 
                }))}
                onSOSActivated={(coords) => {
                  console.log('SOS activé avec coordonnées:', coords);
                  logAnimatedElementInteraction('sos_activated', 'geolocation', 'senior_emergency_gps');
                  
                  // TODO: Envoyer alerte réelle via API/SMS
                  // Exemple: sendSOSAlert(user.uid, coords, careContacts)
                }}
              />
            </CardContent>
          </Card>
        </GlowCard>
      </AnimatedDiv>

      {/* Contacts aidants avec animations */}
      {careContacts.length > 0 && (
        <AnimatedDiv variant="fadeInUp" className="mb-8 space-y-4">
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <Users className="h-8 w-8" />
            Mes contacts
          </h2>
          
          <AnimatedList className="grid gap-4 md:grid-cols-2">
            {careContacts.map((contact) => (
              <AnimatedListItem key={contact.id}>
                <GlowCard glowColor="rgba(59, 130, 246, 0.4)">
                  <Card className="border-2 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950 dark:to-background">
                    <CardHeader>
                      <CardTitle className="text-2xl">{contact.name}</CardTitle>
                      <CardDescription className="text-xl">
                        {contact.relation}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <ShimmerCard>
                        <Button 
                          size="lg" 
                          className="w-full text-xl py-6"
                          onClick={() => {
                            window.location.href = `tel:${contact.phone}`;
                            logGlowCardClick('senior_contact_call', contact.phone);
                          }}
                        >
                          <Phone className="mr-2 h-6 w-6" />
                          Appeler
                        </Button>
                      </ShimmerCard>
                      {contact.email && (
                        <ShimmerCard>
                          <Button 
                            size="lg" 
                            variant="outline"
                            className="w-full text-xl py-6"
                            onClick={() => {
                              window.location.href = `mailto:${contact.email}`;
                              logAnimatedElementInteraction('email_button', 'shimmer', 'senior_contact_email');
                            }}
                          >
                            Envoyer un email
                          </Button>
                        </ShimmerCard>
                      )}
                    </CardContent>
                  </Card>
                </GlowCard>
              </AnimatedListItem>
            ))}
          </AnimatedList>
          
          <ShimmerCard>
            <Dialog open={isAddingContact} onOpenChange={setIsAddingContact}>
              <DialogTrigger asChild>
                <Button size="lg" variant="outline" className="w-full md:w-auto text-xl py-6">
                  <UserPlus className="mr-2 h-6 w-6" />
                  Ajouter un contact
                </Button>
              </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="text-2xl">Ajouter un contact</DialogTitle>
                <DialogDescription className="text-lg">
                  Ajoutez une personne de confiance à contacter en cas de besoin
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name" className="text-lg">Nom</Label>
                  <Input
                    id="name"
                    value={newContact.name}
                    onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                    className="text-xl py-6"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="relation" className="text-lg">Relation (ex: Fils, Fille, Aidant)</Label>
                  <Input
                    id="relation"
                    value={newContact.relation}
                    onChange={(e) => setNewContact({...newContact, relation: e.target.value})}
                    className="text-xl py-6"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone" className="text-lg">Téléphone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={newContact.phone}
                    onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                    className="text-xl py-6"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-lg">Email (optionnel)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newContact.email}
                    onChange={(e) => setNewContact({...newContact, email: e.target.value})}
                    className="text-xl py-6"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={addContact} size="lg" className="text-xl py-6">
                  Ajouter
                </Button>
              </DialogFooter>
            </DialogContent>
            </Dialog>
          </ShimmerCard>
        </AnimatedDiv>
      )}

      {/* Services récurrents avec animations */}
      {recurringServices.length > 0 && (
        <AnimatedDiv variant="fadeInUp" className="mb-8 space-y-4">
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <Calendar className="h-8 w-8" />
            Services programmés
          </h2>
          
          <AnimatedList className="grid gap-4 md:grid-cols-2">
            {recurringServices.map((service) => (
              <AnimatedListItem key={service.id}>
                <GlowCard glowColor="rgba(34, 197, 94, 0.4)">
                  <Card className="border-2 bg-gradient-to-br from-green-50 to-white dark:from-green-950 dark:to-background">
                    <CardHeader>
                      <CardTitle className="text-2xl">{service.type}</CardTitle>
                      <CardDescription className="text-xl">
                        {service.providerName}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-lg mb-4">
                        <strong>Prochaine intervention:</strong><br />
                        {service.nextDate.toLocaleDateString('fr-FR', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      <p className="text-lg text-muted-foreground">
                        Fréquence: {service.frequency}
                      </p>
                    </CardContent>
                  </Card>
                </GlowCard>
              </AnimatedListItem>
            ))}
          </AnimatedList>
        </AnimatedDiv>
      )}

      {/* Actions rapides - Gros boutons avec animations */}
      <AnimatedDiv variant="fadeInUp" className="mb-8 space-y-4">
        <h2 className="text-3xl font-bold flex items-center gap-3">
          <Heart className="h-8 w-8 text-pink-600" />
          Actions rapides
        </h2>
        
        <AnimatedList className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <AnimatedListItem key={action.id}>
                <ShimmerCard>
                  <Button
                    variant="outline"
                    className="h-40 w-full flex-col gap-4 text-lg font-semibold hover:shadow-lg transition-all border-2"
                    asChild
                  >
                    <a 
                      href={action.href}
                      onClick={() => logAnimatedElementInteraction('quick_action', 'shimmer', `senior_${action.id}`)}
                    >
                      <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center`}>
                        <Icon className="h-10 w-10 text-white" />
                      </div>
                      <span className="text-center leading-tight">{action.label}</span>
                    </a>
                  </Button>
                </ShimmerCard>
              </AnimatedListItem>
            );
          })}
        </AnimatedList>
      </AnimatedDiv>

      {/* Aide et paramètres - Toujours accessibles avec animations */}
      <AnimatedDiv variant="fadeInUp" className="mb-8">
        <div className="grid gap-4 md:grid-cols-2">
          <ShimmerCard>
            <Button
              variant="outline"
              size="lg"
              className="h-24 w-full text-xl border-2"
              asChild
            >
              <a 
                href="/dashboard/settings"
                onClick={() => logAnimatedElementInteraction('settings_button', 'shimmer', 'senior_settings')}
              >
                <Settings className="mr-3 h-8 w-8" />
                Paramètres
              </a>
            </Button>
          </ShimmerCard>
          
          <ShimmerCard>
            <Button
              variant="outline"
              size="lg"
              className="h-24 w-full text-xl border-2"
              asChild
            >
              <a 
                href="/help"
                onClick={() => logAnimatedElementInteraction('help_button', 'shimmer', 'senior_help')}
              >
                <HelpCircle className="mr-3 h-8 w-8" />
                Aide & Support
              </a>
            </Button>
          </ShimmerCard>
        </div>
      </AnimatedDiv>

      {/* Note pour aidant */}
      <AnimatedDiv variant="fadeIn">
        <Alert className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-blue-200">
          <AlertDescription className="text-xl text-blue-900 dark:text-blue-100">
            💡 <strong>Aidant familial ?</strong> Vous pouvez gérer ce compte depuis vos paramètres.
          </AlertDescription>
        </Alert>
      </AnimatedDiv>
    </div>
  );
}
