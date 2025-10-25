'use client';

import { useState } from 'react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AlertTriangle, MapPin, Phone, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SOSButtonProps {
  className?: string;
  onSOSActivated?: (coordinates: { latitude: number; longitude: number }) => void;
  emergencyContacts?: Array<{ name: string; phone: string }>;
}

export function SOSButton({ className, onSOSActivated, emergencyContacts }: SOSButtonProps) {
  const { state: geoState, getCurrentPosition } = useGeolocation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [sosStatus, setSOSStatus] = useState<'idle' | 'activating' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Ouvrir la confirmation
  const handleSOSClick = () => {
    setIsDialogOpen(true);
    setSOSStatus('idle');
    setErrorMessage(null);
  };

  // Confirmer et activer SOS
  const confirmSOS = async () => {
    setSOSStatus('activating');
    setErrorMessage(null);

    try {
      // 1. Obtenir la position GPS
      const coords = await getCurrentPosition();

      if (!coords) {
        throw new Error(geoState.error || 'Impossible d\'obtenir votre position');
      }

      console.log('[SOS] Position obtenue:', coords);

      // 2. Appeler le callback avec les coordonnées
      if (onSOSActivated) {
        onSOSActivated({
          latitude: coords.latitude,
          longitude: coords.longitude,
        });
      }

      // 3. Simuler l'envoi aux services d'urgence (à implémenter)
      // Dans une vraie app: envoyer SMS, appeler API, notifier contacts, etc.
      await sendSOSAlert(coords);

      // 4. Succès
      setSOSStatus('success');

      // Feedback vocal
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(
          'Alerte SOS envoyée. Vos contacts d\'urgence ont été notifiés.'
        );
        utterance.lang = 'fr-FR';
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
      }

      // Fermer après 3 secondes
      setTimeout(() => {
        setIsDialogOpen(false);
        setSOSStatus('idle');
      }, 3000);
    } catch (error: any) {
      console.error('[SOS] Erreur:', error);
      setSOSStatus('error');
      setErrorMessage(error.message || 'Erreur lors de l\'activation SOS');

      // Feedback vocal
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(
          'Erreur lors de l\'envoi de l\'alerte. Veuillez réessayer.'
        );
        utterance.lang = 'fr-FR';
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  // Simuler l'envoi d'alerte SOS
  const sendSOSAlert = async (coords: any) => {
    // TODO: Implémenter l'envoi réel
    // - Envoyer SMS via API (Twilio, etc.)
    // - Notifier contacts d'urgence
    // - Logger dans Firestore
    // - Appeler service d'urgence si configuré

    console.log('[SOS] Envoi alerte avec coordonnées:', coords);

    // Simuler un délai réseau
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Exemple de log Firestore (à décommenter)
    /*
    const db = getFirestore();
    await addDoc(collection(db, 'sos_alerts'), {
      userId: user.uid,
      timestamp: Timestamp.now(),
      coordinates: {
        latitude: coords.latitude,
        longitude: coords.longitude,
        accuracy: coords.accuracy,
      },
      status: 'sent',
    });
    */
  };

  return (
    <>
      {/* Bouton SOS - Grande taille pour seniors */}
      <Button
        onClick={handleSOSClick}
        className={cn(
          'relative h-32 w-full overflow-hidden border-4 border-red-500 bg-gradient-to-br from-red-500 to-red-700 text-white shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-red-500/50',
          'text-2xl font-bold',
          className
        )}
        aria-label="Bouton d'urgence SOS - Appuyer pour envoyer une alerte avec votre position"
      >
        <div className="flex flex-col items-center gap-2">
          <AlertTriangle className="h-12 w-12 animate-pulse" />
          <span>SOS URGENCE</span>
          <span className="text-sm font-normal">Appuyer pour alerter</span>
        </div>

        {/* Animation de pulsation */}
        <div className="absolute inset-0 animate-pulse bg-red-600 opacity-20" />
      </Button>

      {/* Dialog de confirmation */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              Alerte SOS
            </DialogTitle>
            <DialogDescription className="text-lg">
              {sosStatus === 'idle' && (
                <>
                  Voulez-vous vraiment envoyer une alerte d&apos;urgence ?
                  <br />
                  <strong>Vos contacts seront notifiés avec votre position GPS.</strong>
                </>
              )}
              {sosStatus === 'activating' && 'Envoi de l\'alerte en cours...'}
              {sosStatus === 'success' && 'Alerte envoyée avec succès !'}
              {sosStatus === 'error' && 'Erreur lors de l\'envoi de l\'alerte'}
            </DialogDescription>
          </DialogHeader>

          {/* Affichage de l'état */}
          <div className="py-4">
            {sosStatus === 'activating' && (
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
                <div className="space-y-2 text-center">
                  <p className="text-sm text-muted-foreground">
                    <MapPin className="mr-1 inline h-4 w-4" />
                    Obtention de votre position GPS...
                  </p>
                  {geoState.coordinates && (
                    <p className="text-xs text-green-600">
                      Position: {geoState.coordinates.latitude.toFixed(6)}, {geoState.coordinates.longitude.toFixed(6)}
                      <br />
                      Précision: ±{Math.round(geoState.coordinates.accuracy)}m
                    </p>
                  )}
                </div>
              </div>
            )}

            {sosStatus === 'success' && (
              <Alert className="border-green-500 bg-green-50">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>Alerte envoyée !</strong>
                  <br />
                  Vos contacts d&apos;urgence ont été notifiés avec votre position GPS.
                </AlertDescription>
              </Alert>
            )}

            {sosStatus === 'error' && (
              <Alert variant="destructive">
                <XCircle className="h-5 w-5" />
                <AlertDescription>
                  <strong>Erreur</strong>
                  <br />
                  {errorMessage || 'Une erreur est survenue. Veuillez réessayer.'}
                </AlertDescription>
              </Alert>
            )}

            {/* Contacts d'urgence */}
            {sosStatus === 'idle' && emergencyContacts && emergencyContacts.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Contacts qui seront alertés :</p>
                <div className="space-y-1">
                  {emergencyContacts.map((contact, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 rounded border p-2 text-sm"
                    >
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{contact.name}</span>
                      <span className="text-muted-foreground">({contact.phone})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Avertissement permission géolocalisation */}
            {sosStatus === 'idle' && geoState.permissionStatus === 'denied' && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Permission de géolocalisation refusée. Veuillez l&apos;activer dans les paramètres de votre navigateur pour utiliser le bouton SOS.
                </AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-row">
            {sosStatus === 'idle' && (
              <>
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="text-lg"
                >
                  Annuler
                </Button>
                <Button
                  onClick={confirmSOS}
                  disabled={geoState.permissionStatus === 'denied'}
                  className="bg-red-500 text-lg hover:bg-red-600"
                >
                  <AlertTriangle className="mr-2 h-5 w-5" />
                  Confirmer SOS
                </Button>
              </>
            )}
            {sosStatus === 'success' && (
              <Button onClick={() => setIsDialogOpen(false)} className="w-full text-lg">
                Fermer
              </Button>
            )}
            {sosStatus === 'error' && (
              <>
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="text-lg"
                >
                  Annuler
                </Button>
                <Button onClick={confirmSOS} className="bg-red-500 text-lg hover:bg-red-600">
                  Réessayer
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
