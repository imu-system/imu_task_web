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
  Loader2
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

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
      {/* Header - Gros texte, simple */}
      <div className="mb-8 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold">
              Bonjour {firstName} 👋
            </h1>
            <p className="text-2xl text-muted-foreground">
              Voici vos services pour aujourd'hui
            </p>
          </div>
          <Button
            size="lg"
            variant={voiceMode ? 'default' : 'outline'}
            onClick={toggleVoiceMode}
            className="h-16 w-16"
            title={voiceMode ? 'Désactiver le mode vocal' : 'Activer le mode vocal'}
          >
            {voiceMode ? <Volume2 className="h-8 w-8" /> : <VolumeX className="h-8 w-8" />}
          </Button>
        </div>
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
            onClick={handleSOSCall}
          >
            <Phone className="mr-2 h-6 w-6" />
            {careContacts.length > 0 ? `Appeler ${careContacts[0].name}` : 'Appeler le 112'}
          </Button>
        </AlertDescription>
      </Alert>

      {/* Contacts aidants */}
      {careContacts.length > 0 && (
        <div className="mb-8 space-y-4">
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <Users className="h-8 w-8" />
            Mes contacts
          </h2>
          
          <div className="grid gap-4 md:grid-cols-2">
            {careContacts.map((contact) => (
              <Card key={contact.id} className="border-2">
                <CardHeader>
                  <CardTitle className="text-2xl">{contact.name}</CardTitle>
                  <CardDescription className="text-xl">
                    {contact.relation}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    size="lg" 
                    className="w-full text-xl py-6"
                    onClick={() => window.location.href = `tel:${contact.phone}`}
                  >
                    <Phone className="mr-2 h-6 w-6" />
                    Appeler
                  </Button>
                  {contact.email && (
                    <Button 
                      size="lg" 
                      variant="outline"
                      className="w-full text-xl py-6"
                      onClick={() => window.location.href = `mailto:${contact.email}`}
                    >
                      Envoyer un email
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
          
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
        </div>
      )}

      {/* Services récurrents */}
      {recurringServices.length > 0 && (
        <div className="mb-8 space-y-4">
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <Calendar className="h-8 w-8" />
            Services programmés
          </h2>
          
          <div className="grid gap-4 md:grid-cols-2">
            {recurringServices.map((service) => (
              <Card key={service.id} className="border-2">
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
            ))}
          </div>
        </div>
      )}

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
