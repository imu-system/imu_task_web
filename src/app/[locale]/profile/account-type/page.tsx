/**
 * Page Profil - Édition AccountType
 * 
 * Permet aux utilisateurs de :
 * - Visualiser leur profil actuel
 * - Changer d'AccountType (individual → professional → senior)
 * - Workflow de validation avec confirmation
 * - Migration automatique des données
 * - Vérification des permissions Firestore
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslations } from 'next-intl';
import { AccountType } from '@/lib/types';
import { setAccountTypeCookie } from '@/lib/account-type-cookie';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  User, 
  Briefcase, 
  Heart, 
  ArrowRight, 
  Check, 
  X,
  AlertTriangle,
  Info
} from 'lucide-react';
import { logEvent } from '@/lib/analytics';

interface AccountTypeOption {
  value: AccountType;
  label: string;
  description: string;
  icon: typeof User;
  color: string;
  features: string[];
}

const ACCOUNT_TYPE_OPTIONS: AccountTypeOption[] = [
  {
    value: AccountType.individual,
    label: 'Particulier',
    description: 'Publiez des tâches et trouvez des prestataires',
    icon: User,
    color: 'bg-blue-500',
    features: [
      'Publier des tâches illimitées',
      'Rechercher des prestataires qualifiés',
      'Gérer vos demandes de service',
      'Messagerie avec les professionnels',
      'Historique des tâches complètes'
    ]
  },
  {
    value: AccountType.professional,
    label: 'Professionnel',
    description: 'Répondez aux missions et développez votre activité',
    icon: Briefcase,
    color: 'bg-purple-500',
    features: [
      'Recevoir des propositions de missions',
      'Gérer vos clients et rendez-vous',
      'Statistiques de revenus en temps réel',
      'Calendrier de disponibilités',
      'Badge professionnel vérifié',
      'Facturation intégrée'
    ]
  },
  {
    value: AccountType.senior,
    label: 'Senior',
    description: 'Services simplifiés et assistance prioritaire',
    icon: Heart,
    color: 'bg-rose-500',
    features: [
      'Interface simplifiée et accessible',
      'Services récurrents automatiques',
      'Contacts d\'urgence (SOS)',
      'Commande vocale intégrée',
      'Assistance prioritaire 24/7',
      'Rappels automatiques'
    ]
  }
];

const MIGRATION_WARNINGS: Record<string, string[]> = {
  [AccountType.individual]: [
    'Vos tâches publiées seront conservées',
    'Vos messages avec prestataires resteront accessibles'
  ],
  [AccountType.professional]: [
    'Vos propositions en cours seront conservées',
    'Vos clients et calendrier seront migrés',
    'Vos statistiques de revenus resteront disponibles'
  ],
  [AccountType.senior]: [
    'Vos services récurrents seront conservés',
    'Vos contacts d\'urgence seront migrés',
    'Vos rappels automatiques continueront'
  ]
};

export default function ProfileAccountTypePage({ params }: { params: { locale: string } }) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const t = useTranslations('Breadcrumbs');
  
  const [currentAccountType, setCurrentAccountType] = useState<AccountType | null>(null);
  const [selectedAccountType, setSelectedAccountType] = useState<AccountType | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Charger le profil utilisateur
  useEffect(() => {
    if (user?.uid) {
      loadUserProfile();
    }
  }, [user]);
  
  const loadUserProfile = async () => {
    if (!user?.uid) return;
    
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setCurrentAccountType(userData.profile?.accountType || AccountType.individual);
      }
    } catch (err) {
      console.error('Erreur chargement profil:', err);
      setError('Impossible de charger votre profil');
    }
  };
  
  const handleSelectAccountType = (accountType: AccountType) => {
    if (accountType === currentAccountType) {
      return; // Déjà le type actuel
    }
    
    setSelectedAccountType(accountType);
    setShowConfirmDialog(true);
    
    // Analytics
    logEvent('account_type_change_initiated', {
      from: currentAccountType,
      to: accountType
    });
  };
  
  const handleConfirmChange = async () => {
    if (!user?.uid || !selectedAccountType) return;
    
    setIsUpdating(true);
    setError(null);
    
    try {
      const userRef = doc(db, 'users', user.uid);
      
      // Mise à jour du profil avec le nouveau AccountType
      await updateDoc(userRef, {
        'profile.accountType': selectedAccountType,
        'profile.accountTypeChangedAt': serverTimestamp(),
        'profile.previousAccountType': currentAccountType,
        updatedAt: serverTimestamp()
      });
      
      // Migration des données selon le type
      await migrateAccountData(currentAccountType!, selectedAccountType);
      
      // Update cookie for middleware
      setAccountTypeCookie(selectedAccountType);
      
      // Succès
      setSuccess(true);
      setCurrentAccountType(selectedAccountType);
      
      // Analytics
      logEvent('account_type_changed', {
        from: currentAccountType,
        to: selectedAccountType,
        success: true
      });
      
      // Redirection après 2s
      setTimeout(() => {
        router.push(`/${params.locale}/dashboard/${selectedAccountType}`);
      }, 2000);
      
    } catch (err) {
      console.error('Erreur changement AccountType:', err);
      setError('Impossible de changer de type de compte. Veuillez réessayer.');
      
      // Analytics
      logEvent('account_type_change_failed', {
        from: currentAccountType,
        to: selectedAccountType,
        error: err instanceof Error ? err.message : 'Unknown error'
      });
      
    } finally {
      setIsUpdating(false);
      setShowConfirmDialog(false);
    }
  };
  
  const migrateAccountData = async (from: AccountType, to: AccountType) => {
    if (!user?.uid) return;
    
    // Migration spécifique selon le changement
    const userRef = doc(db, 'users', user.uid);
    
    if (to === AccountType.professional) {
      // Initialiser les données Pro
      await updateDoc(userRef, {
        'profile.professionalInfo': {
          serviceCategories: [],
          availability: {},
          pricing: {},
          rating: 0,
          reviewsCount: 0,
          verified: false,
          createdAt: serverTimestamp()
        }
      });
    }
    
    if (to === AccountType.senior) {
      // Initialiser les données Senior
      await updateDoc(userRef, {
        'profile.seniorInfo': {
          careContacts: [],
          recurringServices: [],
          preferences: {
            largeText: true,
            voiceControl: true,
            notifications: true
          },
          createdAt: serverTimestamp()
        }
      });
    }
    
    // Log migration
    logEvent('account_data_migrated', {
      from,
      to,
      userId: user.uid
    });
  };
  
  const handleCancelChange = () => {
    setShowConfirmDialog(false);
    setSelectedAccountType(null);
    
    logEvent('account_type_change_cancelled', {
      from: currentAccountType,
      to: selectedAccountType
    });
  };
  
  if (authLoading || !currentAccountType) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Breadcrumbs */}
      <Breadcrumbs 
        items={[
          { label: t('dashboard'), href: '/dashboard' },
          { label: t('profile'), href: '/profile' },
          { label: t('accountType'), href: '/profile/account-type' }
        ]}
        className="mb-6"
      />
      
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2">Type de compte</h1>
        <p className="text-muted-foreground">
          Choisissez le type de compte qui correspond le mieux à vos besoins
        </p>
      </motion.div>
      
      {/* Current Account Type */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-8"
      >
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Votre compte actuel : <strong>{ACCOUNT_TYPE_OPTIONS.find(opt => opt.value === currentAccountType)?.label}</strong>
          </AlertDescription>
        </Alert>
      </motion.div>
      
      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8"
          >
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Success Message */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="mb-8"
          >
            <Alert className="bg-green-50 border-green-200">
              <Check className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Type de compte modifié avec succès ! Redirection en cours...
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Account Type Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {ACCOUNT_TYPE_OPTIONS.map((option, index) => {
          const Icon = option.icon;
          const isCurrent = option.value === currentAccountType;
          const isSelected = option.value === selectedAccountType;
          
          return (
            <motion.div
              key={option.value}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  isCurrent ? 'ring-2 ring-purple-500' : ''
                } ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => handleSelectAccountType(option.value)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-full ${option.color}`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    {isCurrent && (
                      <Badge variant="default">Actuel</Badge>
                    )}
                  </div>
                  <CardTitle className="text-xl">{option.label}</CardTitle>
                  <CardDescription>{option.description}</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-2">
                    {option.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {!isCurrent && (
                    <Button
                      className="w-full mt-4"
                      variant={isSelected ? 'default' : 'outline'}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectAccountType(option.value);
                      }}
                    >
                      Choisir ce type
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
      
      {/* Confirmation Dialog */}
      <AnimatePresence>
        {showConfirmDialog && selectedAccountType && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={handleCancelChange}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold">Confirmer le changement</h3>
              </div>
              
              <p className="text-muted-foreground mb-4">
                Vous êtes sur le point de changer votre type de compte de{' '}
                <strong>{ACCOUNT_TYPE_OPTIONS.find(opt => opt.value === currentAccountType)?.label}</strong>
                {' '}vers{' '}
                <strong>{ACCOUNT_TYPE_OPTIONS.find(opt => opt.value === selectedAccountType)?.label}</strong>.
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-blue-900 mb-2">Ce qui sera conservé :</h4>
                <ul className="space-y-1">
                  {MIGRATION_WARNINGS[currentAccountType]?.map((warning, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-blue-800">
                      <Check className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>{warning}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleCancelChange}
                  disabled={isUpdating}
                >
                  <X className="mr-2 h-4 w-4" />
                  Annuler
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleConfirmChange}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Migration...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Confirmer
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
