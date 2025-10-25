'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook pour la reconnaissance vocale avec Web Speech API
 * Optimisé pour les utilisateurs seniors avec commandes simples
 */

export interface VoiceCommand {
    command: string;
    action: () => void;
    keywords: string[];
}

export interface VoiceRecognitionState {
    isListening: boolean;
    transcript: string;
    error: string | null;
    isSupported: boolean;
    confidence: number;
}

export interface UseVoiceRecognitionReturn {
    state: VoiceRecognitionState;
    startListening: () => void;
    stopListening: () => void;
    registerCommand: (command: VoiceCommand) => void;
    unregisterCommand: (commandName: string) => void;
}

export function useVoiceRecognition(): UseVoiceRecognitionReturn {
    const [state, setState] = useState<VoiceRecognitionState>({
        isListening: false,
        transcript: '',
        error: null,
        isSupported: false,
        confidence: 0,
    });

    const recognitionRef = useRef<any>(null);
    const commandsRef = useRef<Map<string, VoiceCommand>>(new Map());

    // Vérifier le support du navigateur
    useEffect(() => {
        const SpeechRecognition =
            (window as any).SpeechRecognition ||
            (window as any).webkitSpeechRecognition;

        if (SpeechRecognition) {
            setState(prev => ({ ...prev, isSupported: true }));

            // Initialiser la reconnaissance vocale
            const recognition = new SpeechRecognition();
            recognition.continuous = true; // Écoute continue
            recognition.interimResults = false; // Résultats finaux seulement
            recognition.lang = 'fr-FR'; // Langue française
            recognition.maxAlternatives = 1;

            // Événement: résultat de reconnaissance
            recognition.onresult = (event: any) => {
                const last = event.results.length - 1;
                const transcript = event.results[last][0].transcript.toLowerCase().trim();
                const confidence = event.results[last][0].confidence;

                console.log('[Voice] Reconnu:', transcript, 'Confiance:', confidence);

                setState(prev => ({
                    ...prev,
                    transcript,
                    confidence,
                    error: null,
                }));

                // Matcher avec les commandes enregistrées
                matchCommand(transcript);
            };

            // Événement: erreur
            recognition.onerror = (event: any) => {
                console.error('[Voice] Erreur:', event.error);

                let errorMessage = 'Erreur de reconnaissance vocale';

                switch (event.error) {
                    case 'no-speech':
                        errorMessage = 'Aucun son détecté. Veuillez parler plus fort.';
                        break;
                    case 'audio-capture':
                        errorMessage = 'Microphone non disponible. Vérifiez vos permissions.';
                        break;
                    case 'not-allowed':
                        errorMessage = 'Permission microphone refusée. Autorisez l\'accès au micro.';
                        break;
                    case 'network':
                        errorMessage = 'Erreur réseau. Vérifiez votre connexion.';
                        break;
                    case 'aborted':
                        errorMessage = 'Reconnaissance arrêtée.';
                        break;
                }

                setState(prev => ({
                    ...prev,
                    error: errorMessage,
                    isListening: false,
                }));
            };

            // Événement: fin de reconnaissance
            recognition.onend = () => {
                console.log('[Voice] Reconnaissance terminée');
                setState(prev => ({ ...prev, isListening: false }));
            };

            recognitionRef.current = recognition;
        } else {
            setState(prev => ({
                ...prev,
                isSupported: false,
                error: 'Reconnaissance vocale non supportée par votre navigateur',
            }));
        }

        // Cleanup
        return () => {
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.stop();
                } catch (e) {
                    // Ignore errors during cleanup
                }
            }
        };
    }, []);

    // Matcher les commandes
    const matchCommand = useCallback((transcript: string) => {
        const commands = Array.from(commandsRef.current.values());

        for (const cmd of commands) {
            // Vérifier si au moins un keyword correspond
            const matched = cmd.keywords.some(keyword =>
                transcript.includes(keyword.toLowerCase())
            );

            if (matched) {
                console.log('[Voice] Commande détectée:', cmd.command);

                // Feedback vocal
                if ('speechSynthesis' in window) {
                    const utterance = new SpeechSynthesisUtterance(
                        `Commande ${cmd.command} activée`
                    );
                    utterance.lang = 'fr-FR';
                    utterance.rate = 0.9; // Vitesse légèrement ralentie pour seniors
                    utterance.pitch = 1.0;
                    window.speechSynthesis.speak(utterance);
                }

                // Exécuter l'action
                cmd.action();
                break; // Une seule commande à la fois
            }
        }
    }, []);

    // Démarrer l'écoute
    const startListening = useCallback(() => {
        if (!state.isSupported) {
            setState(prev => ({
                ...prev,
                error: 'Reconnaissance vocale non supportée',
            }));
            return;
        }

        if (!recognitionRef.current) {
            setState(prev => ({
                ...prev,
                error: 'Service de reconnaissance non initialisé',
            }));
            return;
        }

        try {
            recognitionRef.current.start();
            setState(prev => ({
                ...prev,
                isListening: true,
                error: null,
                transcript: '',
            }));

            console.log('[Voice] Écoute démarrée');

            // Feedback vocal
            if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance('Écoute activée');
                utterance.lang = 'fr-FR';
                utterance.rate = 0.9;
                window.speechSynthesis.speak(utterance);
            }
        } catch (error: any) {
            console.error('[Voice] Erreur démarrage:', error);
            setState(prev => ({
                ...prev,
                error: error.message || 'Erreur lors du démarrage',
                isListening: false,
            }));
        }
    }, [state.isSupported]);

    // Arrêter l'écoute
    const stopListening = useCallback(() => {
        if (!recognitionRef.current) return;

        try {
            recognitionRef.current.stop();
            setState(prev => ({
                ...prev,
                isListening: false,
                transcript: '',
            }));

            console.log('[Voice] Écoute arrêtée');

            // Feedback vocal
            if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance('Écoute désactivée');
                utterance.lang = 'fr-FR';
                utterance.rate = 0.9;
                window.speechSynthesis.speak(utterance);
            }
        } catch (error: any) {
            console.error('[Voice] Erreur arrêt:', error);
        }
    }, []);

    // Enregistrer une commande
    const registerCommand = useCallback((command: VoiceCommand) => {
        commandsRef.current.set(command.command, command);
        console.log('[Voice] Commande enregistrée:', command.command);
    }, []);

    // Désenregistrer une commande
    const unregisterCommand = useCallback((commandName: string) => {
        commandsRef.current.delete(commandName);
        console.log('[Voice] Commande supprimée:', commandName);
    }, []);

    return {
        state,
        startListening,
        stopListening,
        registerCommand,
        unregisterCommand,
    };
}
