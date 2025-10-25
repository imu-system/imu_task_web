'use client';

import { useEffect, useState } from 'react';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Mic,
  MicOff,
  Volume2,
  AlertCircle,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoiceControlPanelProps {
  className?: string;
  onCommandExecuted?: (command: string) => void;
}

export function VoiceControlPanel({ className, onCommandExecuted }: VoiceControlPanelProps) {
  const {
    state,
    startListening,
    stopListening,
    registerCommand,
    unregisterCommand,
  } = useVoiceRecognition();

  const [showHelp, setShowHelp] = useState(false);
  const [lastCommand, setLastCommand] = useState<string | null>(null);

  // Commandes vocales disponibles
  const availableCommands = [
    {
      command: 'services',
      keywords: ['service', 'services', 'aide', 'aider'],
      description: 'Afficher les services disponibles',
      action: () => {
        setLastCommand('services');
        onCommandExecuted?.('services');
        // Navigation vers services
        window.location.hash = '#services';
      },
    },
    {
      command: 'contacts',
      keywords: ['contact', 'contacts', 'famille', 'appeler'],
      description: 'Afficher mes contacts',
      action: () => {
        setLastCommand('contacts');
        onCommandExecuted?.('contacts');
        window.location.hash = '#contacts';
      },
    },
    {
      command: 'sos',
      keywords: ['sos', 'urgence', 'aide urgente', 'secours', 'danger'],
      description: 'Activer l\'alerte SOS',
      action: () => {
        setLastCommand('sos');
        onCommandExecuted?.('sos');
        // Simuler click sur bouton SOS
        const sosButton = document.querySelector('[aria-label*="SOS"]') as HTMLButtonElement;
        if (sosButton) {
          sosButton.click();
        }
      },
    },
    {
      command: 'accueil',
      keywords: ['accueil', 'retour', 'menu principal', 'début'],
      description: 'Retour à l\'accueil',
      action: () => {
        setLastCommand('accueil');
        onCommandExecuted?.('accueil');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
    },
    {
      command: 'aide',
      keywords: ['aide', 'help', 'commande', 'commandes'],
      description: 'Afficher l\'aide vocale',
      action: () => {
        setLastCommand('aide');
        setShowHelp(true);
        
        // Lire les commandes disponibles
        if ('speechSynthesis' in window) {
          const commandsList = availableCommands
            .map(cmd => cmd.command)
            .join(', ');
          const utterance = new SpeechSynthesisUtterance(
            `Commandes disponibles : ${commandsList}`
          );
          utterance.lang = 'fr-FR';
          utterance.rate = 0.8;
          window.speechSynthesis.speak(utterance);
        }
      },
    },
  ];

  // Enregistrer les commandes au montage
  useEffect(() => {
    availableCommands.forEach(cmd => {
      registerCommand(cmd);
    });

    return () => {
      availableCommands.forEach(cmd => {
        unregisterCommand(cmd.command);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Toggle écoute
  const toggleListening = () => {
    if (state.isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Support du navigateur
  if (!state.isSupported) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Reconnaissance vocale non supportée par votre navigateur.
          <br />
          Utilisez Chrome, Edge ou Safari pour activer cette fonctionnalité.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Bouton principal d'écoute */}
      <div className="flex items-center gap-4">
        <Button
          onClick={toggleListening}
          size="lg"
          className={cn(
            'h-20 flex-1 text-xl font-semibold transition-all',
            state.isListening
              ? 'animate-pulse bg-red-500 hover:bg-red-600'
              : 'bg-blue-500 hover:bg-blue-600'
          )}
          aria-label={state.isListening ? 'Arrêter l\'écoute vocale' : 'Activer l\'écoute vocale'}
        >
          {state.isListening ? (
            <>
              <MicOff className="mr-2 h-6 w-6" />
              Arrêter l&apos;écoute
            </>
          ) : (
            <>
              <Mic className="mr-2 h-6 w-6" />
              Commande vocale
            </>
          )}
        </Button>

        <Button
          onClick={() => setShowHelp(!showHelp)}
          size="lg"
          variant="outline"
          className="h-20 w-20"
          aria-label="Afficher l'aide des commandes vocales"
        >
          <Info className="h-6 w-6" />
        </Button>
      </div>

      {/* État de l'écoute */}
      {state.isListening && (
        <Alert className="border-blue-500 bg-blue-50">
          <Volume2 className="h-5 w-5 animate-pulse text-blue-600" />
          <AlertDescription className="text-lg text-blue-800">
            <strong>Écoute en cours...</strong>
            <br />
            Dites une commande comme &quot;services&quot;, &quot;contacts&quot; ou &quot;SOS&quot;
          </AlertDescription>
        </Alert>
      )}

      {/* Transcript en temps réel */}
      {state.transcript && (
        <Alert className="border-green-500 bg-green-50">
          <Volume2 className="h-5 w-5 text-green-600" />
          <AlertDescription className="text-lg text-green-800">
            Vous avez dit : &quot;<strong>{state.transcript}</strong>&quot;
            <br />
            <span className="text-sm">
              Confiance: {Math.round(state.confidence * 100)}%
            </span>
          </AlertDescription>
        </Alert>
      )}

      {/* Dernière commande exécutée */}
      {lastCommand && !state.isListening && (
        <Alert className="border-green-500 bg-green-50">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <AlertDescription className="text-lg text-green-800">
            Commande &quot;<strong>{lastCommand}</strong>&quot; activée !
          </AlertDescription>
        </Alert>
      )}

      {/* Erreur */}
      {state.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-5 w-5" />
          <AlertDescription className="text-lg">
            <strong>Erreur:</strong> {state.error}
          </AlertDescription>
        </Alert>
      )}

      {/* Aide - Liste des commandes */}
      {showHelp && (
        <Alert className="border-blue-500 bg-blue-50">
          <Info className="h-5 w-5 text-blue-600" />
          <AlertDescription>
            <p className="mb-3 text-lg font-semibold text-blue-900">
              Commandes vocales disponibles :
            </p>
            <div className="space-y-2">
              {availableCommands.map((cmd) => (
                <div
                  key={cmd.command}
                  className="rounded border border-blue-200 bg-white p-3"
                >
                  <p className="text-lg font-medium text-blue-900">
                    &quot;{cmd.keywords.join('&quot; ou &quot;')}&quot;
                  </p>
                  <p className="text-sm text-blue-700">{cmd.description}</p>
                </div>
              ))}
            </div>
            <Button
              onClick={() => setShowHelp(false)}
              variant="outline"
              className="mt-4 w-full"
            >
              Fermer l&apos;aide
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Instructions initiales */}
      {!state.isListening && !state.error && !lastCommand && !showHelp && (
        <Alert className="border-gray-300 bg-gray-50">
          <Info className="h-5 w-5 text-gray-600" />
          <AlertDescription className="text-base text-gray-700">
            Appuyez sur &quot;<strong>Commande vocale</strong>&quot; et dites une commande.
            <br />
            Exemple : &quot;services&quot;, &quot;contacts&quot;, &quot;SOS&quot;
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
