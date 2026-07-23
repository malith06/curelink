import React, { useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';

const mapContainerStyle = {
  width: '100%',
  height: '500px',
  borderRadius: '0.5rem',
};

const defaultCenter = {
  lat: 7.8731, // Default to Sri Lanka center if no location
  lng: 80.7718
};

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
      <div className="flex items-center justify-center w-full h-[500px] bg-gray-100 rounded-lg animate-pulse">
        <span className="text-gray-500 font-medium">Loading Map...</span>
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
          <div className="p-2 max-w-xs">
            <h3 className="font-semibold text-gray-900 mb-1">{selectedPharmacy.businessName}</h3>
            <p className="text-sm text-gray-600 mb-2">{selectedPharmacy.address}</p>
            {selectedPharmacy.distance !== undefined && (
              <p className="text-xs font-medium text-blue-600 mb-2">
                {(selectedPharmacy.distance / 1000).toFixed(1)} km away
              </p>
            )}
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
};

export default NearbyPharmacyMap;
