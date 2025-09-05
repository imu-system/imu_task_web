
'use client';

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

if (!GOOGLE_MAPS_API_KEY) {
  throw new Error("Missing Google Maps API key. Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your environment variables.");
}

export const loadGoogleMapsScript = (callback: () => void) => {
    const existingScript = document.getElementById('googleMapsScript');

    if (!existingScript) {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&callback=initMap`;
        script.id = 'googleMapsScript';
        document.body.appendChild(script);
        
        (window as any).initMap = () => {
          callback();
        };
    } else {
        callback();
    }
};
