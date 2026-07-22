import React, { useState, useEffect } from 'react';
import useGeolocation from '../../hooks/useGeolocation';
import LocationPermissionState from '../../components/maps/LocationPermissionState';
import pharmacyService from '../../features/pharmacy/pharmacyService';
import { toast } from 'react-toastify';

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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Pharmacy Location Setup</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Current Location</h2>
        
        {profile?.location?.coordinates ? (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-800 font-medium">Your pharmacy location is currently set.</p>
            <p className="text-green-700 text-sm mt-1">
              Coordinates: {profile.location.coordinates[1].toFixed(5)}, {profile.location.coordinates[0].toFixed(5)}
            </p>
            {profile.locationUpdatedAt && (
              <p className="text-gray-500 text-xs mt-2">
                Last updated: {new Date(profile.locationUpdatedAt).toLocaleString()}
              </p>
            )}
          </div>
        ) : (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-yellow-800 font-medium">Your pharmacy location is not set.</p>
            <p className="text-yellow-700 text-sm mt-1">
              Please set your location so customers can find you on the map.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          {/* Automatic GPS Location */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-800 border-b pb-2">Detect Location</h3>
            <LocationPermissionState 
              status={status} 
              error={error} 
              onRequestLocation={requestLocation} 
            />
            
            {status === 'success' && (
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-md flex flex-col items-center">
                <p className="text-blue-800 mb-2">Location detected successfully!</p>
                <p className="text-sm text-blue-600 mb-4">
                  Lat: {latitude.toFixed(5)} | Lng: {longitude.toFixed(5)}
                </p>
                <button
                  onClick={handleSaveCurrentLocation}
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save This Location'}
                </button>
              </div>
            )}
          </div>

          {/* Manual Entry */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-800 border-b pb-2">Manual Entry</h3>
            <form onSubmit={handleManualSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={manualLat}
                  onChange={(e) => setManualLat(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g. 7.2906"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={manualLng}
                  onChange={(e) => setManualLng(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g. 80.6337"
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="w-full px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Coordinates'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PharmacyLocationPage;
