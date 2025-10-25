'use client';

import { useState, useCallback, useEffect } from 'react';

/**
 * Hook pour la géolocalisation avec suivi des erreurs
 * Optimisé pour bouton SOS avec envoi de coordonnées GPS
 */

export interface GeolocationCoordinates {
    latitude: number;
    longitude: number;
    accuracy: number;
    altitude: number | null;
    altitudeAccuracy: number | null;
    heading: number | null;
    speed: number | null;
    timestamp: number;
}

export interface GeolocationState {
    loading: boolean;
    error: string | null;
    coordinates: GeolocationCoordinates | null;
    isSupported: boolean;
    permissionStatus: 'granted' | 'denied' | 'prompt' | 'unknown';
}

export interface UseGeolocationReturn {
    state: GeolocationState;
    getCurrentPosition: () => Promise<GeolocationCoordinates | null>;
    watchPosition: () => number | null;
    clearWatch: (watchId: number) => void;
    requestPermission: () => Promise<boolean>;
}

export function useGeolocation(): UseGeolocationReturn {
    const [state, setState] = useState<GeolocationState>({
        loading: false,
        error: null,
        coordinates: null,
        isSupported: 'geolocation' in navigator,
        permissionStatus: 'unknown',
    });

    // Vérifier les permissions au montage
    useEffect(() => {
        if ('permissions' in navigator) {
            navigator.permissions
                .query({ name: 'geolocation' as PermissionName })
                .then(result => {
                    setState(prev => ({
                        ...prev,
                        permissionStatus: result.state as any,
                    }));

                    // Écouter les changements de permission
                    result.onchange = () => {
                        setState(prev => ({
                            ...prev,
                            permissionStatus: result.state as any,
                        }));
                    };
                })
                .catch(() => {
                    // Permissions API non supportée
                    setState(prev => ({
                        ...prev,
                        permissionStatus: 'unknown',
                    }));
                });
        }
    }, []);

    // Demander la permission
    const requestPermission = useCallback(async (): Promise<boolean> => {
        if (!state.isSupported) {
            setState(prev => ({
                ...prev,
                error: 'Géolocalisation non supportée par votre navigateur',
            }));
            return false;
        }

        try {
            // Demander via getCurrentPosition (déclenche la permission)
            await new Promise<void>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(
                    () => {
                        setState(prev => ({
                            ...prev,
                            permissionStatus: 'granted',
                            error: null,
                        }));
                        resolve();
                    },
                    (error) => {
                        if (error.code === 1) {
                            setState(prev => ({
                                ...prev,
                                permissionStatus: 'denied',
                                error: 'Permission de géolocalisation refusée',
                            }));
                        }
                        reject(error);
                    }
                );
            });
            return true;
        } catch (error) {
            return false;
        }
    }, [state.isSupported]);

    // Obtenir la position actuelle
    const getCurrentPosition = useCallback(async (): Promise<GeolocationCoordinates | null> => {
        if (!state.isSupported) {
            setState(prev => ({
                ...prev,
                error: 'Géolocalisation non supportée',
            }));
            return null;
        }

        setState(prev => ({ ...prev, loading: true, error: null }));

        return new Promise((resolve) => {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const coords: GeolocationCoordinates = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                        altitude: position.coords.altitude,
                        altitudeAccuracy: position.coords.altitudeAccuracy,
                        heading: position.coords.heading,
                        speed: position.coords.speed,
                        timestamp: position.timestamp,
                    };

                    console.log('[Geolocation] Position obtenue:', coords);

                    setState(prev => ({
                        ...prev,
                        loading: false,
                        coordinates: coords,
                        error: null,
                        permissionStatus: 'granted',
                    }));

                    resolve(coords);
                },
                (error) => {
                    console.error('[Geolocation] Erreur:', error);

                    let errorMessage = 'Erreur de géolocalisation';

                    switch (error.code) {
                        case 1: // PERMISSION_DENIED
                            errorMessage = 'Permission refusée. Autorisez la géolocalisation dans les paramètres.';
                            setState(prev => ({ ...prev, permissionStatus: 'denied' }));
                            break;
                        case 2: // POSITION_UNAVAILABLE
                            errorMessage = 'Position indisponible. Vérifiez votre connexion GPS.';
                            break;
                        case 3: // TIMEOUT
                            errorMessage = 'Délai dépassé. Réessayez.';
                            break;
                        default:
                            errorMessage = error.message || 'Erreur inconnue';
                    }

                    setState(prev => ({
                        ...prev,
                        loading: false,
                        error: errorMessage,
                    }));

                    resolve(null);
                },
                {
                    enableHighAccuracy: true, // Haute précision pour SOS
                    timeout: 10000, // 10 secondes max
                    maximumAge: 0, // Pas de cache, position fraîche
                }
            );
        });
    }, [state.isSupported]);

    // Surveiller la position (watch)
    const watchPosition = useCallback((): number | null => {
        if (!state.isSupported) {
            setState(prev => ({
                ...prev,
                error: 'Géolocalisation non supportée',
            }));
            return null;
        }

        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                const coords: GeolocationCoordinates = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    altitude: position.coords.altitude,
                    altitudeAccuracy: position.coords.altitudeAccuracy,
                    heading: position.coords.heading,
                    speed: position.coords.speed,
                    timestamp: position.timestamp,
                };

                console.log('[Geolocation] Position mise à jour:', coords);

                setState(prev => ({
                    ...prev,
                    coordinates: coords,
                    error: null,
                }));
            },
            (error) => {
                console.error('[Geolocation] Erreur watch:', error);

                let errorMessage = 'Erreur de suivi de position';

                switch (error.code) {
                    case 1:
                        errorMessage = 'Permission refusée';
                        break;
                    case 2:
                        errorMessage = 'Position indisponible';
                        break;
                    case 3:
                        errorMessage = 'Délai dépassé';
                        break;
                }

                setState(prev => ({
                    ...prev,
                    error: errorMessage,
                }));
            },
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 5000, // Cache de 5 secondes pour le watch
            }
        );

        console.log('[Geolocation] Watch démarré:', watchId);
        return watchId;
    }, [state.isSupported]);

    // Arrêter le suivi
    const clearWatch = useCallback((watchId: number) => {
        if (state.isSupported) {
            navigator.geolocation.clearWatch(watchId);
            console.log('[Geolocation] Watch arrêté:', watchId);
        }
    }, [state.isSupported]);

    return {
        state,
        getCurrentPosition,
        watchPosition,
        clearWatch,
        requestPermission,
    };
}
