import React, { useState, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { Loader2, MapPin } from 'lucide-react';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

// Default center: Sri Lanka
const defaultCenter = { lat: 7.8731, lng: 80.7718 };

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false,
  clickableIcons: false,
  styles: [
    { featureType: 'poi', elementType: 'all', stylers: [{ visibility: 'off' }] }
  ],
};

const LocationPickerMap = ({ initialLat, initialLng, onLocationSelect }) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey || '',
  });

  const mapRef = useRef(null);
  const [markerPos, setMarkerPos] = useState(
    initialLat && initialLng
      ? { lat: parseFloat(initialLat), lng: parseFloat(initialLng) }
      : null
  );

  const onLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  const onUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);

  const handleMapClick = useCallback((e) => {
    if (!e.latLng) return;
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setMarkerPos({ lat, lng });
    if (onLocationSelect) onLocationSelect(lat, lng);
  }, [onLocationSelect]);

  const handleMarkerDrag = useCallback((e) => {
    if (!e.latLng) return;
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setMarkerPos({ lat, lng });
    if (onLocationSelect) onLocationSelect(lat, lng);
  }, [onLocationSelect]);

  if (!apiKey) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 gap-2">
        <MapPin className="w-8 h-8 text-red-400" />
        <p className="text-sm font-medium text-slate-500">Google Maps API Key Missing</p>
        <p className="text-xs text-slate-400">Please add VITE_GOOGLE_MAPS_API_KEY to your .env file</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 gap-2">
        <MapPin className="w-8 h-8 text-red-400" />
        <p className="text-sm font-medium text-slate-500">Google Maps failed to load</p>
        <p className="text-xs text-slate-400 text-center px-4">
          Check your API key. Make sure Maps JavaScript API and Billing are enabled in Google Cloud Console.
        </p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 gap-2">
        <Loader2 className="w-7 h-7 animate-spin text-[#0B1354]" />
        <p className="text-xs text-slate-400 font-medium">Loading map...</p>
      </div>
    );
  }

  const initialCenter =
    initialLat && initialLng
      ? { lat: parseFloat(initialLat), lng: parseFloat(initialLng) }
      : defaultCenter;

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={initialCenter}
      zoom={initialLat && initialLng ? 15 : 8}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={mapOptions}
      onClick={handleMapClick}
    >
      {markerPos && (
        <Marker
          position={markerPos}
          draggable
          onDragEnd={handleMarkerDrag}
        />
      )}
    </GoogleMap>
  );
};

export default LocationPickerMap;
