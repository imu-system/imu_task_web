/**
 * MapPicker Component
 * Composant de sélection de localisation avec Google Maps
 * - Autocomplete d'adresses
 * - Affichage de map interactive
 * - Sélection par clic sur la map
 * - Récupération des coordonnées GPS
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { loadGoogleMapsScript } from '@/lib/google-maps-config';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Navigation, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TaskLocation } from '@/lib/firestore-tasks';
import styles from './MapPicker.module.css';

interface MapPickerProps {
  /** Valeur actuelle de la localisation */
  value?: TaskLocation;
  /** Callback appelé lors de la sélection d'une localisation */
  onChange: (location: TaskLocation) => void;
  /** Texte du label */
  label?: string;
  /** Description d'aide */
  description?: string;
  /** Message d'erreur */
  error?: string;
  /** Hauteur de la map en pixels */
  mapHeight?: number;
  /** Zoom initial de la map */
  defaultZoom?: number;
  /** Centre par défaut de la map (lat, lng) */
  defaultCenter?: { lat: number; lng: number };
  /** Afficher ou non la map */
  showMap?: boolean;
  /** Classes CSS additionnelles */
  className?: string;
}

export function MapPicker({
  value,
  onChange,
  label = 'Localisation',
  description = 'Recherchez une adresse ou cliquez sur la carte',
  error,
  mapHeight = 400,
  defaultZoom = 13,
  defaultCenter = { lat: 48.8566, lng: 2.3522 }, // Paris par défaut
  showMap = true,
  className,
}: MapPickerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);
  const [address, setAddress] = useState(value?.address || '');
  const [isLocating, setIsLocating] = useState(false);

  const autocompleteInputRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  // Initialiser Google Maps et l'autocomplete
  useEffect(() => {
    if (!showMap && !autocompleteInputRef.current) return;

    setIsLoading(true);
    
    loadGoogleMapsScript(() => {
      try {
        // Initialiser l'autocomplete
        if (autocompleteInputRef.current) {
          autocompleteRef.current = new google.maps.places.Autocomplete(
            autocompleteInputRef.current,
            {
              types: ['address', 'geocode'],
              componentRestrictions: { country: ['fr', 'be', 'ch', 'lu'] }, // Pays francophones
            }
          );

          autocompleteRef.current.addListener('place_changed', handlePlaceSelect);
        }

        // Initialiser la map si demandée
        if (showMap && mapRef.current) {
          const center = value?.coordinates
            ? { lat: value.coordinates.latitude, lng: value.coordinates.longitude }
            : defaultCenter;

          mapInstanceRef.current = new google.maps.Map(mapRef.current, {
            center,
            zoom: value?.coordinates ? 15 : defaultZoom,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: true,
            styles: [
              {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }],
              },
            ],
          });

          // Ajouter un marqueur si une position est déjà définie
          if (value?.coordinates) {
            addMarker({
              lat: value.coordinates.latitude,
              lng: value.coordinates.longitude,
            });
          }

          // Permettre la sélection par clic sur la map
          mapInstanceRef.current.addListener('click', (e: google.maps.MapMouseEvent) => {
            if (e.latLng) {
              handleMapClick(e.latLng);
            }
          });
        }

        setIsLoading(false);
        setMapError(null);
      } catch (err) {
        console.error('Error initializing Google Maps:', err);
        setMapError('Impossible de charger Google Maps. Vérifiez votre clé API.');
        setIsLoading(false);
      }
    });

    // Cleanup
    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }
    };
  }, [showMap]);

  // Gérer la sélection d'un lieu depuis l'autocomplete
  const handlePlaceSelect = useCallback(() => {
    const place = autocompleteRef.current?.getPlace();

    if (!place || !place.geometry || !place.geometry.location) {
      setMapError('Lieu invalide. Veuillez sélectionner une adresse dans la liste.');
      return;
    }

    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();

    // Extraire les détails de l'adresse
    const addressComponents = place.address_components || [];
    let city = '';
    let country = '';

    addressComponents.forEach((component) => {
      if (component.types.includes('locality')) {
        city = component.long_name;
      }
      if (component.types.includes('country')) {
        country = component.long_name;
      }
    });

    const location: TaskLocation = {
      address: place.formatted_address || '',
      city: city || undefined,
      country: country || undefined,
      coordinates: {
        latitude: lat,
        longitude: lng,
      },
    };

    setAddress(place.formatted_address || '');
    onChange(location);

    // Mettre à jour la map
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setCenter({ lat, lng });
      mapInstanceRef.current.setZoom(15);
      addMarker({ lat, lng });
    }

    setMapError(null);
  }, [onChange]);

  // Gérer le clic sur la map
  const handleMapClick = useCallback(
    async (latLng: google.maps.LatLng) => {
      const lat = latLng.lat();
      const lng = latLng.lng();

      addMarker({ lat, lng });

      // Reverse geocoding pour obtenir l'adresse
      try {
        const geocoder = new google.maps.Geocoder();
        const result = await geocoder.geocode({ location: { lat, lng } });

        if (result.results && result.results[0]) {
          const place = result.results[0];
          const addressComponents = place.address_components || [];
          
          let city = '';
          let country = '';

          addressComponents.forEach((component) => {
            if (component.types.includes('locality')) {
              city = component.long_name;
            }
            if (component.types.includes('country')) {
              country = component.long_name;
            }
          });

          const location: TaskLocation = {
            address: place.formatted_address,
            city: city || undefined,
            country: country || undefined,
            coordinates: {
              latitude: lat,
              longitude: lng,
            },
          };

          setAddress(place.formatted_address);
          onChange(location);
          setMapError(null);
        }
      } catch (err) {
        console.error('Reverse geocoding error:', err);
        // On garde quand même les coordonnées même si le reverse geocoding échoue
        const location: TaskLocation = {
          address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
          coordinates: {
            latitude: lat,
            longitude: lng,
          },
        };
        setAddress(location.address);
        onChange(location);
      }
    },
    [onChange]
  );

  // Ajouter/déplacer le marqueur sur la map
  const addMarker = useCallback((position: { lat: number; lng: number }) => {
    if (!mapInstanceRef.current) return;

    if (markerRef.current) {
      markerRef.current.setPosition(position);
    } else {
      markerRef.current = new google.maps.Marker({
        position,
        map: mapInstanceRef.current,
        draggable: true,
        animation: google.maps.Animation.DROP,
      });

      // Permettre de déplacer le marqueur
      markerRef.current.addListener('dragend', () => {
        const pos = markerRef.current?.getPosition();
        if (pos) {
          handleMapClick(pos);
        }
      });
    }
  }, [handleMapClick]);

  // Utiliser la géolocalisation du navigateur
  const handleUseCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setMapError('La géolocalisation n\'est pas supportée par votre navigateur.');
      return;
    }

    setIsLocating(true);
    setMapError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        if (mapInstanceRef.current) {
          mapInstanceRef.current.setCenter({ lat, lng });
          mapInstanceRef.current.setZoom(15);
        }

        addMarker({ lat, lng });

        // Reverse geocoding
        try {
          const geocoder = new google.maps.Geocoder();
          const result = await geocoder.geocode({ location: { lat, lng } });

          if (result.results && result.results[0]) {
            const place = result.results[0];
            const addressComponents = place.address_components || [];
            
            let city = '';
            let country = '';

            addressComponents.forEach((component) => {
              if (component.types.includes('locality')) {
                city = component.long_name;
              }
              if (component.types.includes('country')) {
                country = component.long_name;
              }
            });

            const location: TaskLocation = {
              address: place.formatted_address,
              city: city || undefined,
              country: country || undefined,
              coordinates: {
                latitude: lat,
                longitude: lng,
              },
            };

            setAddress(place.formatted_address);
            onChange(location);
          }
        } catch (err) {
          console.error('Reverse geocoding error:', err);
        }

        setIsLocating(false);
      },
      (err) => {
        console.error('Geolocation error:', err);
        setMapError('Impossible d\'obtenir votre position. Vérifiez les permissions.');
        setIsLocating(false);
      }
    );
  }, [onChange, addMarker]);

  return (
    <div className={cn('space-y-4', className)} data-map-height={mapHeight}>
      {/* Champ de recherche d'adresse */}
      <div className="space-y-2">
        <Label htmlFor="address-autocomplete">
          {label}
          {error && <span className="text-destructive ml-1">*</span>}
        </Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="address-autocomplete"
              ref={autocompleteInputRef}
              type="text"
              placeholder="Rechercher une adresse..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="pl-9"
              disabled={isLoading}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleUseCurrentLocation}
            disabled={isLocating || isLoading}
            title="Utiliser ma position actuelle"
          >
            {isLocating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Navigation className="h-4 w-4" />
            )}
          </Button>
        </div>
        {description && !error && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>

      {/* Messages d'erreur */}
      {mapError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{mapError}</AlertDescription>
        </Alert>
      )}

      {/* Map interactive */}
      {showMap && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Carte interactive
            </CardTitle>
            <CardDescription className="text-xs">
              Cliquez sur la carte ou déplacez le marqueur pour ajuster la position
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <Skeleton 
                className={cn(
                  "w-full rounded-b-lg", 
                  styles.mapContainer,
                  mapHeight === 300 ? styles.height300 :
                  mapHeight === 400 ? styles.height400 :
                  mapHeight === 500 ? styles.height500 :
                  mapHeight === 600 ? styles.height600 :
                  styles.height400
                )} 
              />
            ) : (
              <div
                ref={mapRef}
                className={cn(
                  "w-full", 
                  styles.mapContainer,
                  mapHeight === 300 ? styles.height300 :
                  mapHeight === 400 ? styles.height400 :
                  mapHeight === 500 ? styles.height500 :
                  mapHeight === 600 ? styles.height600 :
                  styles.height400
                )}
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Coordonnées affichées (debug/info) */}
      {value?.coordinates && (
        <div className="text-xs text-muted-foreground">
          Coordonnées: {value.coordinates.latitude.toFixed(6)}, {value.coordinates.longitude.toFixed(6)}
        </div>
      )}
    </div>
  );
}
