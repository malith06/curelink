import React, { useState, useEffect } from 'react';
import useGeolocation from '../../hooks/useGeolocation';
import LocationPermissionState from '../../components/maps/LocationPermissionState';
import pharmacyService from '../../features/pharmacy/pharmacyService';
import { toast } from 'react-toastify';
import { MapPin, Navigation, Edit3, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const PharmacyLocationPage = () => {
  const { status, latitude, longitude, error, requestLocation } = useGeolocation();
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);
  const [manualLat, setManualLat] = useState('');
  const [manualLng, setManualLng] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await pharmacyService.getMyPharmacyProfile();
        setProfile(data.data);
        if (data.data?.location?.coordinates) {
          // GeoJSON is [longitude, latitude]
          setManualLng(data.data.location.coordinates[0]);
          setManualLat(data.data.location.coordinates[1]);
        }
      } catch (err) {
        console.error('Failed to fetch profile', err);
      }
    };
    fetchProfile();
  }, []);

  const handleSaveLocation = async (lat, lng) => {
    try {
      setSaving(true);
      await pharmacyService.updateLocation(parseFloat(lat), parseFloat(lng));
      toast.success('Location updated successfully!');
      
      // Update local profile state
      setProfile(prev => ({
        ...prev,
        location: {
          type: 'Point',
          coordinates: [parseFloat(lng), parseFloat(lat)]
        },
        locationUpdatedAt: new Date().toISOString()
      }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update location');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCurrentLocation = () => {
    if (latitude && longitude) {
      setManualLat(latitude);
      setManualLng(longitude);
      handleSaveLocation(latitude, longitude);
    }
  };

  const handleManualSave = (e) => {
    e.preventDefault();
    if (!manualLat || !manualLng) {
      toast.error('Please enter both latitude and longitude');
      return;
    }
    handleSaveLocation(manualLat, manualLng);
  };

  return (
    <div className="animate-in fade-in duration-500 bg-slate-50 min-h-screen">
      {/* Modern Header Section */}
      <div className="bg-[#0B1354] pb-24 pt-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden rounded-b-[3rem] mb-[-4rem]">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500 rounded-full mix-blend-screen filter blur-[80px] opacity-30 animate-pulse"></div>

        <div className="max-w-5xl mx-auto relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 flex items-center justify-center">
              <MapPin className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">Pharmacy Location</h1>
              <p className="mt-2 text-blue-100 font-medium">Set your location so customers can find you on the map.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 relative z-20">

        {/* Current Location Status */}
        {profile?.location?.coordinates ? (
          <div className="p-5 bg-green-50 rounded-2xl border border-green-100 flex items-start gap-4 mb-8">
            <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-green-900 text-lg">Location is Set</h3>
              <p className="text-sm font-medium text-green-800 mt-1">
                Coordinates: {profile.location.coordinates[1].toFixed(5)}, {profile.location.coordinates[0].toFixed(5)}
              </p>
              {profile.locationUpdatedAt && (
                <p className="text-xs text-green-700 mt-1">
                  Last updated: {new Date(profile.locationUpdatedAt).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="p-5 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-4 mb-8">
            <AlertCircle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-amber-900 text-lg">Location Not Set</h3>
              <p className="text-sm font-medium text-amber-800 mt-1">
                Please set your pharmacy location so customers can find you on the map.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Automatic GPS Location */}
          <Card className="bg-white/80 backdrop-blur-xl border border-white/50 shadow-xl rounded-3xl overflow-hidden">
            <CardHeader>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Navigation className="w-5 h-5 text-primary-500" />
                Detect My Location
              </h2>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <p className="text-sm text-slate-500 font-medium">Allow browser location access to automatically detect and save your pharmacy coordinates.</p>
              <LocationPermissionState 
                status={status} 
                error={error} 
                onRequestLocation={requestLocation} 
              />
              
              {status === 'success' && (
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                  <p className="text-blue-800 font-bold mb-1">Location Detected!</p>
                  <p className="text-sm text-blue-600 mb-4 font-medium">
                    Lat: {latitude.toFixed(5)} | Lng: {longitude.toFixed(5)}
                  </p>
                  <Button
                    onClick={handleSaveCurrentLocation}
                    disabled={saving}
                    isLoading={saving}
                    fullWidth
                    icon={Navigation}
                  >
                    Save This Location
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Manual Entry */}
          <Card className="bg-white/80 backdrop-blur-xl border border-white/50 shadow-xl rounded-3xl overflow-hidden">
            <CardHeader>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-primary-500" />
                Manual Coordinates
              </h2>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-sm text-slate-500 font-medium mb-4">Manually enter your GPS coordinates. You can find them from Google Maps.</p>
              <form onSubmit={handleManualSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={manualLat}
                    onChange={(e) => setManualLat(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0B1354]/20 focus:border-[#0B1354] outline-none transition-all font-medium"
                    placeholder="e.g. 7.29060"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={manualLng}
                    onChange={(e) => setManualLng(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0B1354]/20 focus:border-[#0B1354] outline-none transition-all font-medium"
                    placeholder="e.g. 80.63370"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={saving}
                  isLoading={saving}
                  fullWidth
                  icon={MapPin}
                >
                  Save Coordinates
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PharmacyLocationPage;
