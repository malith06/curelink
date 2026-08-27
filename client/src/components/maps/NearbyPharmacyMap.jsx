import React, { useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '1.5rem', // 3xl
};

const defaultCenter = {
  lat: 7.8731, // Default to Sri Lanka center if no location
  lng: 80.7718
};

// Clean, modern map style with muted colors
const mapStyles = [
  {
    featureType: 'all',
    elementType: 'geometry.fill',
    stylers: [{ weight: '2.00' }]
  },
  {
    featureType: 'all',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#9c9c9c' }]
  },
  {
    featureType: 'all',
    elementType: 'labels.text',
    stylers: [{ visibility: 'on' }]
  },
  {
    featureType: 'landscape',
    elementType: 'all',
    stylers: [{ color: '#f2f2f2' }]
  },
  {
    featureType: 'landscape',
    elementType: 'geometry.fill',
    stylers: [{ color: '#ffffff' }]
  },
  {
    featureType: 'landscape.man_made',
    elementType: 'geometry.fill',
    stylers: [{ color: '#ffffff' }]
  },
  {
    featureType: 'poi',
    elementType: 'all',
    stylers: [{ visibility: 'off' }]
  },
  {
    featureType: 'road',
    elementType: 'all',
    stylers: [{ saturation: -100 }, { lightness: 45 }]
  },
  {
    featureType: 'road',
    elementType: 'geometry.fill',
    stylers: [{ color: '#eeeeee' }]
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#7b7b7b' }]
  },
  {
    featureType: 'road',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#ffffff' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'all',
    stylers: [{ visibility: 'simplified' }]
  },
  {
    featureType: 'road.arterial',
    elementType: 'labels.icon',
    stylers: [{ visibility: 'off' }]
  },
  {
    featureType: 'transit',
    elementType: 'all',
    stylers: [{ visibility: 'off' }]
  },
  {
    featureType: 'water',
    elementType: 'all',
    stylers: [{ color: '#46bcec' }, { visibility: 'on' }]
  },
  {
    featureType: 'water',
    elementType: 'geometry.fill',
    stylers: [{ color: '#c8d7d4' }]
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#070707' }]
  },
  {
    featureType: 'water',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#ffffff' }]
  }
];

const NearbyPharmacyMap = ({ 
  userLocation, 
  pharmacies, 
  selectedPharmacyId, 
  onSelectPharmacy 
}) => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  });

  const [map, setMap] = useState(null);

  const onLoad = useCallback(function callback(map) {
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback(map) {
    setMap(null);
  }, []);

  const center = userLocation || defaultCenter;
  const zoom = userLocation ? 13 : 7; // Closer zoom if user location is known

  if (loadError) {
    return <div className="p-4 bg-red-50 text-red-800 rounded border border-red-200">Error loading maps. Please check your API key.</div>;
  }

  if (!isLoaded) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full bg-slate-50/50 rounded-3xl animate-pulse">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-4"></div>
        <span className="text-slate-500 font-medium tracking-wide">Loading Map...</span>
      </div>
    );
  }

  // Find the selected pharmacy object to display its info window
  const selectedPharmacy = pharmacies.find(p => p._id === selectedPharmacyId);

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={center}
      zoom={zoom}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={{
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        styles: mapStyles,
        disableDefaultUI: true,
        zoomControl: true,
      }}
    >
      {/* User Location Marker */}
      {userLocation && (
        <Marker 
          position={userLocation} 
          icon={{
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#3b82f6', // blue-500
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: '#ffffff'
          }}
          title="Your Location"
        />
      )}

      {/* Pharmacy Markers */}
      {pharmacies.map(pharmacy => {
        const hasCoordinates = pharmacy.location?.coordinates;
        if (!hasCoordinates) return null;
        
        // GeoJSON uses [longitude, latitude]
        const position = {
          lat: pharmacy.location.coordinates[1],
          lng: pharmacy.location.coordinates[0]
        };

        return (
          <Marker
            key={pharmacy._id}
            position={position}
            onClick={() => onSelectPharmacy(pharmacy._id)}
            icon={{
              path: window.google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
              scale: 6,
              fillColor: selectedPharmacyId === pharmacy._id ? '#ef4444' : '#10b981', // red-500 if selected, green-500 if not
              fillOpacity: 1,
              strokeWeight: 1,
              strokeColor: '#ffffff'
            }}
          />
        );
      })}

      {/* Info Window for Selected Pharmacy */}
      {selectedPharmacy && selectedPharmacy.location?.coordinates && (
        <InfoWindow
          position={{
            lat: selectedPharmacy.location.coordinates[1],
            lng: selectedPharmacy.location.coordinates[0]
          }}
          onCloseClick={() => onSelectPharmacy(null)}
        >
          <div className="p-3 max-w-[240px]">
            <h3 className="font-bold text-[#0B1354] mb-1.5 text-base leading-tight">
              {selectedPharmacy.name || selectedPharmacy.businessName || 'Unknown Pharmacy'}
            </h3>
            <p className="text-sm text-slate-600 mb-2 leading-relaxed">
              {typeof selectedPharmacy.address === 'object' && selectedPharmacy.address !== null
                ? [selectedPharmacy.address.line1, selectedPharmacy.address.city, selectedPharmacy.address.district].filter(Boolean).join(', ')
                : selectedPharmacy.address || 'Address not available'}
            </p>
            {selectedPharmacy.distance !== undefined && (
              <div className="inline-flex items-center px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                {(selectedPharmacy.distance / 1000).toFixed(1)} km away
              </div>
            )}
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
};

export default NearbyPharmacyMap;
