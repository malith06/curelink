import React from 'react';

const LocationPermissionState = ({ status, error, onRequestLocation }) => {
  if (status === 'idle') {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-blue-50 rounded-lg border border-blue-100">
        <svg className="w-12 h-12 text-blue-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <h3 className="text-lg font-medium text-blue-900 mb-2">Location Required</h3>
        <p className="text-blue-700 text-center mb-4 max-w-md">
          To find nearby pharmacies, we need your current location. Your location is only used for this search.
        </p>
        <button
          onClick={onRequestLocation}
          className="px-6 py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition-colors"
        >
          Use My Current Location
        </button>
      </div>
    );
  }

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg border border-gray-200">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600 font-medium">Getting your location...</p>
      </div>
    );
  }

  if (status === 'permission-denied') {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-red-50 rounded-lg border border-red-100">
        <svg className="w-12 h-12 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h3 className="text-lg font-medium text-red-900 mb-2">Location Access Denied</h3>
        <p className="text-red-700 text-center mb-4 max-w-md">
          {error || 'Location permission was denied. You can enter your area manually or enable location access in your browser settings.'}
        </p>
      </div>
    );
  }

  if (status === 'position-unavailable' || status === 'timeout' || status === 'error' || status === 'unsupported') {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-orange-50 rounded-lg border border-orange-100">
        <svg className="w-12 h-12 text-orange-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-lg font-medium text-orange-900 mb-2">Location Error</h3>
        <p className="text-orange-700 text-center mb-4 max-w-md">
          {error || 'Unable to retrieve your location.'}
        </p>
        <button
          onClick={onRequestLocation}
          className="px-6 py-2 bg-orange-600 text-white font-medium rounded hover:bg-orange-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Returns null for 'success' since the parent component will handle rendering the actual content (map/list)
  return null;
};

export default LocationPermissionState;
