import React from 'react';
import { MapPin, Loader2, AlertCircle, AlertTriangle } from 'lucide-react';

const LocationPermissionState = ({ status, error, onRequestLocation }) => {
  if (status === 'idle') {
    return (
      <div className="flex flex-col items-center justify-center p-8 sm:p-12 bg-white/80 backdrop-blur-md rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-6 shadow-sm">
          <MapPin className="h-10 w-10 animate-bounce" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">Location Required</h3>
        <p className="text-slate-600 text-center mb-8 max-w-md leading-relaxed">
          To find nearby pharmacies quickly and accurately, we need your current location. Your location is completely private and only used for this search.
        </p>
        <button
          onClick={onRequestLocation}
          className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 transition-all duration-300"
        >
          Use My Current Location
        </button>
      </div>
    );
  }

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white/80 backdrop-blur-md rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100">
        <Loader2 className="h-12 w-12 text-primary-600 animate-spin mb-6" />
        <p className="text-slate-700 font-medium text-lg">Getting your exact location...</p>
      </div>
    );
  }

  if (status === 'permission-denied') {
    return (
      <div className="flex flex-col items-center justify-center p-8 sm:p-12 bg-white/80 backdrop-blur-md rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-red-100 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-rose-500"></div>
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-red-50 text-red-500 mb-6 shadow-sm">
          <AlertCircle className="h-10 w-10" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">Location Access Denied</h3>
        <p className="text-slate-600 text-center max-w-md leading-relaxed">
          {error || 'Location permission was denied. You can enter your area manually or enable location access in your browser settings to find nearby pharmacies.'}
        </p>
      </div>
    );
  }

  if (status === 'position-unavailable' || status === 'timeout' || status === 'error' || status === 'unsupported') {
    return (
      <div className="flex flex-col items-center justify-center p-8 sm:p-12 bg-white/80 backdrop-blur-md rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-amber-100 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-orange-500"></div>
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-50 text-amber-500 mb-6 shadow-sm">
          <AlertTriangle className="h-10 w-10" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">Location Error</h3>
        <p className="text-slate-600 text-center mb-8 max-w-md leading-relaxed">
          {error || 'We were unable to retrieve your location at this moment. Please check your signal or try again.'}
        </p>
        <button
          onClick={onRequestLocation}
          className="px-8 py-3.5 bg-amber-500 text-white font-medium rounded-xl shadow-lg shadow-amber-500/30 hover:bg-amber-600 hover:shadow-amber-500/50 hover:scale-105 transition-all duration-300"
        >
          Try Again
        </button>
      </div>
    );
  }

  return null;
};

export default LocationPermissionState;
