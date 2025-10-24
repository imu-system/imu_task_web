'use client';

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface TaskLocation {
  address?: string;
  city?: string;
  country?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

interface TaskMapDisplayProps {
  location: string | TaskLocation;
}

export function TaskMapDisplay({ location }: TaskMapDisplayProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState('');
  const t = useTranslations('TaskDetail');

  useEffect(() => {
    // Check if Google Maps API is loaded
    if (!window.google || !window.google.maps) {
      setError('Google Maps API not loaded');
      return;
    }

    // Extract coordinates from location
    let coords: { lat: number; lng: number } | null = null;
    let addressText = '';

    if (typeof location === 'string') {
      addressText = location;
      // Can't show map without coordinates
      return;
    } else if (location.coordinates) {
      coords = {
        lat: location.coordinates.latitude,
        lng: location.coordinates.longitude,
      };
      addressText = location.address || location.city || '';
    }

    if (!coords || !mapRef.current) {
      return;
    }

    try {
      // Initialize map
      const map = new google.maps.Map(mapRef.current, {
        center: coords,
        zoom: 14,
        disableDefaultUI: false,
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: true,
        gestureHandling: 'cooperative',
      });

      // Add marker
      new google.maps.Marker({
        position: coords,
        map: map,
        title: addressText,
      });

      setMapLoaded(true);
    } catch (err) {
      console.error('Error initializing map:', err);
      setError('Failed to load map');
    }
  }, [location]);

  // Extract display text for location
  let displayText = '';
  if (typeof location === 'string') {
    displayText = location;
  } else {
    const parts = [];
    if (location.address) parts.push(location.address);
    if (location.city) parts.push(location.city);
    if (location.country) parts.push(location.country);
    displayText = parts.join(', ') || t('noLocation', { default: 'Non spécifié' });
  }

  const hasCoordinates =
    typeof location === 'object' && location.coordinates !== undefined;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          {t('location', { default: 'Localisation' })}
        </CardTitle>
        <CardDescription>{displayText}</CardDescription>
      </CardHeader>
      <CardContent>
        {hasCoordinates ? (
          <div className="relative">
            <div
              ref={mapRef}
              className="w-full h-64 rounded-lg overflow-hidden border bg-muted"
            />
            {!mapLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}
            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted text-sm text-muted-foreground">
                {error}
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-64 rounded-lg border bg-muted flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">
                {t('noMapAvailable', { default: 'Aucune carte disponible' })}
              </p>
              <p className="text-xs mt-1">{displayText}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
