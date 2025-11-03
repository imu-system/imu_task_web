'use client';

import { useEffect, useRef, useState } from 'react';
import { Task } from '@/lib/firestore-tasks';
import { loadGoogleMapsScript } from '@/lib/google-maps-config';
import { Loader2 } from 'lucide-react';

interface TasksMapProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  center?: { lat: number; lng: number };
  zoom?: number;
}

export function TasksMap({ tasks, onTaskClick, center, zoom = 12 }: TasksMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [infoWindow, setInfoWindow] = useState<google.maps.InfoWindow | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      loadGoogleMapsScript(() => {
        setIsLoaded(true);
      });
    } catch (err) {
      console.error('Error loading Google Maps:', err);
      setError('Failed to load Google Maps');
    }
  }, []);

  useEffect(() => {
    if (!isLoaded || !mapRef.current || map) return;

    try {
      const mapCenter = center || { lat: 48.8566, lng: 2.3522 };

      const newMap = new google.maps.Map(mapRef.current, {
        center: mapCenter,
        zoom: zoom,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }],
          },
        ],
      });

      setMap(newMap);
      setInfoWindow(new google.maps.InfoWindow());
    } catch (err) {
      console.error('Error initializing map:', err);
      setError('Failed to initialize map');
    }
  }, [isLoaded, center, zoom, map]);

  useEffect(() => {
    if (!map || !isLoaded || !infoWindow) return;

    markers.forEach(marker => marker.setMap(null));

    const newMarkers: google.maps.Marker[] = [];
    const bounds = new google.maps.LatLngBounds();

    tasks.forEach(task => {
      if (!task.adresse?.latitude || !task.adresse?.longitude) return;

      const position = {
        lat: task.adresse.latitude,
        lng: task.adresse.longitude,
      };

      const marker = new google.maps.Marker({
        position,
        map,
        title: task.title,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#22c55e',
          fillOpacity: 0.8,
          strokeColor: '#fff',
          strokeWeight: 2,
        },
      });

      const budgetHtml = task.budget ? '<div style="color: #22c55e; font-weight: 600;"><span>💰</span> ' + task.budget + '€</div>' : '';
      const locationHtml = task.location ? '<div style="color: #6b7280;"><span>📍</span> ' + task.location + '</div>' : '';
      const categoryHtml = task.category ? '<div style="color: #6b7280;"><span>🏷️</span> ' + task.category + '</div>' : '';

      const contentString = '<div style="padding: 8px; max-width: 250px;">' +
        '<h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1f2937;">' + task.title + '</h3>' +
        '<p style="margin: 0 0 8px 0; font-size: 14px; color: #6b7280;">' + task.description.substring(0, 100) + (task.description.length > 100 ? '...' : '') + '</p>' +
        '<div style="display: flex; flex-direction: column; gap: 4px; font-size: 13px;">' +
        budgetHtml + locationHtml + categoryHtml +
        '</div></div>';

      marker.addListener('click', () => {
        infoWindow.setContent(contentString);
        infoWindow.open(map, marker);
        if (onTaskClick) onTaskClick(task);
      });

      newMarkers.push(marker);
      bounds.extend(position);
    });

    setMarkers(newMarkers);

    if (newMarkers.length > 0) {
      map.fitBounds(bounds);
    }
  }, [map, tasks, isLoaded, infoWindow, onTaskClick, markers]);

  if (error) {
    return (
      <div className="h-[600px] w-full flex items-center justify-center bg-muted rounded-lg">
        <div className="text-center">
          <p className="text-destructive mb-2">⚠️ {error}</p>
          <p className="text-sm text-muted-foreground">
            Please check your Google Maps API key configuration
          </p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="h-[600px] w-full flex items-center justify-center bg-muted rounded-lg">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading map...</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={mapRef} 
      className="h-[600px] w-full rounded-lg border border-border" 
      data-testid="tasks-map"
    />
  );
}
