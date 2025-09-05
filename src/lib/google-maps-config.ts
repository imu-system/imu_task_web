
'use client';

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export const loadGoogleMapsScript = (callback: () => void) => {
    if (!GOOGLE_MAPS_API_KEY) {
        console.warn("Google Maps API key is missing. Address autocomplete will be disabled. Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your environment variables.");
        return;
    }

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
        // If the script is already there, the callback might have been missed,
        // so we check if the google object is available.
        if ((window as any).google) {
            callback();
        } else {
            // If not, we set the initMap function again.
             (window as any).initMap = () => {
                callback();
            };
        }
    }
};
