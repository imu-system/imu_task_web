/**
 * Geolocation utilities
 * Fonctions pour calculer les distances et filtrer par localisation
 */

import type { TaskLocation } from './firestore-tasks';

/**
 * Calcule la distance entre deux coordonnées GPS (formule de Haversine)
 * @param lat1 Latitude du point 1
 * @param lon1 Longitude du point 1
 * @param lat2 Latitude du point 2
 * @param lon2 Longitude du point 2
 * @returns Distance en kilomètres
 */
export function calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    const R = 6371; // Rayon de la Terre en km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 10) / 10; // Arrondi à 1 décimale
}

/**
 * Convertit des degrés en radians
 */
function toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
}

/**
 * Obtient la position actuelle de l'utilisateur
 * @returns Promise avec les coordonnées ou null si erreur
 */
export function getCurrentPosition(): Promise<GeolocationPosition | null> {
    return new Promise((resolve) => {
        if (!navigator.geolocation) {
            console.warn('Geolocation not supported');
            resolve(null);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => resolve(position),
            (error) => {
                console.warn('Geolocation error:', error);
                resolve(null);
            },
            {
                enableHighAccuracy: false,
                timeout: 10000,
                maximumAge: 300000, // Cache 5 minutes
            }
        );
    });
}

/**
 * Formate une distance pour l'affichage
 * @param distanceKm Distance en kilomètres
 * @returns String formatée (ex: "2.5 km", "< 1 km")
 */
export function formatDistance(distanceKm: number): string {
    if (distanceKm < 0.1) return '< 100 m';
    if (distanceKm < 1) return `${Math.round(distanceKm * 1000)} m`;
    if (distanceKm < 10) return `${distanceKm.toFixed(1)} km`;
    return `${Math.round(distanceKm)} km`;
}

/**
 * Extrait les coordonnées d'un objet TaskLocation
 * @param location L'objet location (peut être string ou TaskLocation)
 * @returns Les coordonnées ou null si non disponibles
 */
export function extractCoordinates(
    location: string | TaskLocation
): { latitude: number; longitude: number } | null {
    if (typeof location === 'string') {
        return null;
    }

    if (location.coordinates) {
        return location.coordinates;
    }

    return null;
}

/**
 * Filtre les tâches par distance
 * @param tasks Liste des tâches
 * @param userLat Latitude de l'utilisateur
 * @param userLng Longitude de l'utilisateur
 * @param maxDistanceKm Distance maximale en km
 * @returns Tâches filtrées avec distance ajoutée
 */
export function filterTasksByDistance<T extends { location: string | TaskLocation }>(
    tasks: T[],
    userLat: number,
    userLng: number,
    maxDistanceKm: number
): Array<T & { distance?: number }> {
    return tasks
        .map((task) => {
            const coords = extractCoordinates(task.location);
            if (!coords) {
                return { ...task, distance: undefined };
            }

            const distance = calculateDistance(
                userLat,
                userLng,
                coords.latitude,
                coords.longitude
            );

            return { ...task, distance };
        })
        .filter((task) => {
            // Garder les tâches sans coordonnées et celles dans le rayon
            return task.distance === undefined || task.distance <= maxDistanceKm;
        });
}

/**
 * Trie les tâches par distance
 * @param tasks Liste des tâches
 * @param userLat Latitude de l'utilisateur
 * @param userLng Longitude de l'utilisateur
 * @returns Tâches triées par distance (les plus proches en premier)
 */
export function sortTasksByDistance<T extends { location: string | TaskLocation }>(
    tasks: T[],
    userLat: number,
    userLng: number
): Array<T & { distance?: number }> {
    const tasksWithDistance = tasks.map((task) => {
        const coords = extractCoordinates(task.location);
        if (!coords) {
            return { ...task, distance: undefined };
        }

        const distance = calculateDistance(
            userLat,
            userLng,
            coords.latitude,
            coords.longitude
        );

        return { ...task, distance };
    });

    return tasksWithDistance.sort((a, b) => {
        // Les tâches sans distance à la fin
        if (a.distance === undefined && b.distance === undefined) return 0;
        if (a.distance === undefined) return 1;
        if (b.distance === undefined) return -1;
        return a.distance - b.distance;
    });
}
