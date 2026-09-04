import React, { useState, useEffect } from 'react';
import pharmacyService from './pharmacyService';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { Store, Phone, Mail, MapPin, Truck, Package, Save, Camera, Loader2, Navigation, Map, X, Check } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';
import useGeolocation from '../../hooks/useGeolocation';
import LocationPickerMap from '../../components/maps/LocationPickerMap';

const PharmacyProfileForm = ({ initialData, onSuccess }) => {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.fullName || '',
    photoUrl: null,
    phone: user?.phone || '',
    email: user?.email || '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
    },
    location: {
      coordinates: ['', ''] // [lng, lat]
    },
    openingHours: {
      monday: { open: '09:00', close: '17:00', isClosed: false },
      tuesday: { open: '09:00', close: '17:00', isClosed: false },
      wednesday: { open: '09:00', close: '17:00', isClosed: false },
      thursday: { open: '09:00', close: '17:00', isClosed: false },
      friday: { open: '09:00', close: '17:00', isClosed: false },
      saturday: { open: '09:00', close: '13:00', isClosed: false },
      sunday: { open: '00:00', close: '00:00', isClosed: true },
    },
    deliveryAvailable: false,
    pickupAvailable: true,
  });

  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [error, setError] = useState(null);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [tempCoords, setTempCoords] = useState({ lat: '', lng: '' });

  const { status: geoStatus, latitude: geoLat, longitude: geoLng, error: geoError, requestLocation } = useGeolocation();

  useEffect(() => {
    if (geoLat && geoLng) {
      setFormData(prev => ({
        ...prev,
        location: {
          coordinates: [geoLng, geoLat]
        }
      }));

      // Auto-fill address using Reverse Geocoding
      const fetchAddress = async () => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${geoLat}&lon=${geoLng}`);
          const data = await res.json();
          if (data && data.address) {
            setFormData(prev => {
              const city = data.address.city || data.address.town || data.address.village || data.address.county || prev.address.city;
              const state = data.address.state || data.address.region || prev.address.state;
              const road = data.address.road || '';
              const house = data.address.house_number || '';
              const street = [house, road].filter(Boolean).join(' ') || data.display_name.split(',')[0] || prev.address.street;

              return {
                ...prev,
                address: {
                  ...prev.address,
                  street: street,
                  city: city,
                  state: state
                }
              };
            });
          }
        } catch (err) {
          console.error("Failed to reverse geocode:", err);
        }
      };
      
      fetchAddress();
    }
  }, [geoLat, geoLng]);

  useEffect(() => {
    if (initialData) {
      const mapInitialHours = (dayData, defaultData) => {
        if (!dayData) return defaultData;
        return {
          open: dayData.openTime || defaultData.open,
          close: dayData.closeTime || defaultData.close,
          isClosed: !dayData.isOpen
        };
      };

      setFormData(prev => ({
        ...prev,
        ...initialData,
        address: { 
          street: initialData.address?.line1 || prev.address.street,
          city: initialData.address?.city || prev.address.city,
          state: initialData.address?.district || prev.address.state,
          zipCode: initialData.address?.postalCode || prev.address.zipCode,
        },
        location: {
          coordinates: initialData.location?.coordinates || prev.location.coordinates,
        },
        openingHours: initialData.openingHours ? {
          monday: mapInitialHours(initialData.openingHours.monday, prev.openingHours.monday),
          tuesday: mapInitialHours(initialData.openingHours.tuesday, prev.openingHours.tuesday),
          wednesday: mapInitialHours(initialData.openingHours.wednesday, prev.openingHours.wednesday),
          thursday: mapInitialHours(initialData.openingHours.thursday, prev.openingHours.thursday),
          friday: mapInitialHours(initialData.openingHours.friday, prev.openingHours.friday),
          saturday: mapInitialHours(initialData.openingHours.saturday, prev.openingHours.saturday),
          sunday: mapInitialHours(initialData.openingHours.sunday, prev.openingHours.sunday),
        } : prev.openingHours,
      }));
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.includes('.')) {
      const [parent, child, subchild] = name.split('.');
      if (subchild) {
        setFormData((prev) => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: {
              ...prev[parent][child],
              [subchild]: type === 'checkbox' ? checked : value,
            },
          },
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: type === 'checkbox' ? checked : value,
          },
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingPhoto(true);
      setError(null);
      const uploadData = new FormData();
      uploadData.append('image', file);

      const res = await pharmacyService.uploadPharmacyPhoto(uploadData);
      setFormData(prev => ({ ...prev, photoUrl: res.data.photoUrl }));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Map frontend data to backend schema
      const mapHours = (day) => ({
        isOpen: !day.isClosed,
        openTime: day.isClosed ? null : day.open,
        closeTime: day.isClosed ? null : day.close
      });

      const payload = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email || 'pharmacy@example.com',
        photoUrl: formData.photoUrl,
        address: {
          line1: formData.address.street,
          city: formData.address.city,
          district: formData.address.state,
          postalCode: formData.address.zipCode
        },
        location: (formData.location.coordinates[0] !== '' && formData.location.coordinates[1] !== '') ? {
          type: 'Point',
          coordinates: [parseFloat(formData.location.coordinates[0]), parseFloat(formData.location.coordinates[1])]
        } : undefined,
        deliveryAvailable: formData.deliveryAvailable,
        pickupAvailable: formData.pickupAvailable,
        openingHours: {
          monday: mapHours(formData.openingHours.monday),
          tuesday: mapHours(formData.openingHours.tuesday),
          wednesday: mapHours(formData.openingHours.wednesday),
          thursday: mapHours(formData.openingHours.thursday),
          friday: mapHours(formData.openingHours.friday),
          saturday: mapHours(formData.openingHours.saturday),
          sunday: mapHours(formData.openingHours.sunday),
        }
      };

      if (initialData) {
        await pharmacyService.updatePharmacyProfile(payload);
      } else {
        await pharmacyService.createPharmacyProfile(payload);
      }
      if (onSuccess) onSuccess();
    } catch (err) {
      const apiMsg = err.response?.data?.message;
      const apiErrors = err.response?.data?.errors;
      const errorStr = apiErrors?.length ? apiErrors.join(', ') : apiMsg || 'Something went wrong';
      setError(errorStr);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="divide-y divide-slate-100">
      
      {error && (
        <div className="p-4 mx-6 mt-6 bg-red-50 text-red-700 font-medium rounded-xl border border-red-100">
          {error}
        </div>
      )}

      {/* Business Details Section */}
      <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
         <div className="md:col-span-1">
            <h3 className="text-lg font-bold text-[#0B1354] mb-1">Business Identity</h3>
            <p className="text-sm font-medium text-slate-500">Provide the official name and registration number of your pharmacy.</p>
         </div>
         <div className="md:col-span-2 space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Pharmacy Name <span className="text-red-500">*</span></label>
                <Input
                  icon={Store}
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g. City Pharmacy"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Pharmacy Photo</label>
                <div className="flex items-center gap-4">
                  {formData.photoUrl ? (
                    <img src={formData.photoUrl} alt="Pharmacy" className="w-20 h-20 rounded-lg object-cover border border-slate-200" />
                  ) : (
                    <div className="w-20 h-20 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                      <Store className="w-8 h-8" />
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/jpeg, image/png, image/webp"
                      onChange={handlePhotoUpload}
                      disabled={uploadingPhoto}
                      className="hidden"
                      id="photo-upload"
                    />
                    <label
                      htmlFor="photo-upload"
                      className={`inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 cursor-pointer shadow-sm transition-all`}
                    >
                      {uploadingPhoto ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Camera className="w-4 h-4 mr-2" />}
                      {uploadingPhoto ? 'Uploading...' : 'Upload Photo'}
                    </label>
                    <p className="mt-2 text-xs text-slate-500">JPG, PNG, or WEBP up to 5MB.</p>
                  </div>
                </div>
              </div>
            </div>
         </div>
      </div>

      {/* Contact Details Section */}
      <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
         <div className="md:col-span-1">
            <h3 className="text-lg font-bold text-[#0B1354] mb-1">Contact Information</h3>
            <p className="text-sm font-medium text-slate-500">How customers and CureLink administrators can reach you.</p>
         </div>
         <div className="md:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Phone Number <span className="text-red-500">*</span></label>
                <Input
                  icon={Phone}
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="+94 77 123 4567"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Email Address <span className="text-red-500">*</span></label>
                <Input
                  icon={Mail}
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled
                  placeholder="pharmacy@example.com"
                />
              </div>
            </div>
         </div>
      </div>

      {/* Address Section */}
      <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
         <div className="md:col-span-1">
            <h3 className="text-lg font-bold text-[#0B1354] mb-1">Location Details</h3>
            <p className="text-sm font-medium text-slate-500">The physical address where customers will pick up their orders.</p>
         </div>
         <div className="md:col-span-2 space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Street Address <span className="text-red-500">*</span></label>
              <Input
                icon={MapPin}
                type="text"
                name="address.street"
                value={formData.address.street}
                onChange={handleChange}
                required
                placeholder="123 Main Street"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">City <span className="text-red-500">*</span></label>
                <Input
                  type="text"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleChange}
                  required
                  placeholder="Colombo"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">District/State <span className="text-red-500">*</span></label>
                <Input
                  type="text"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleChange}
                  required
                  placeholder="Western Province"
                />
              </div>
            </div>

            {/* GPS Coordinates */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 mt-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">GPS Coordinates</h4>
                  <p className="text-xs font-medium text-slate-500">Helps customers find you on the map accurately.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <Button
                    type="button"
                    onClick={() => {
                      setTempCoords({
                        lat: formData.location.coordinates[1],
                        lng: formData.location.coordinates[0],
                      });
                      setShowMapPicker(true);
                    }}
                    variant="outline"
                    size="sm"
                    icon={Map}
                  >
                    Pick on Map
                  </Button>
                  <Button
                    type="button"
                    onClick={requestLocation}
                    variant="outline"
                    size="sm"
                    icon={Navigation}
                    isLoading={geoStatus === 'loading'}
                  >
                    Get Current Location
                  </Button>
                  {geoError && <p className="text-xs text-red-500 mt-1 font-medium w-full text-right">{geoError}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Latitude</label>
                  <Input
                    type="number"
                    step="any"
                    name="location.coordinates.1"
                    value={formData.location.coordinates[1]}
                    onChange={(e) => {
                      setFormData(prev => ({
                        ...prev,
                        location: { coordinates: [prev.location.coordinates[0], e.target.value] }
                      }));
                    }}
                    placeholder="e.g. 6.9271"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Longitude</label>
                  <Input
                    type="number"
                    step="any"
                    name="location.coordinates.0"
                    value={formData.location.coordinates[0]}
                    onChange={(e) => {
                      setFormData(prev => ({
                        ...prev,
                        location: { coordinates: [e.target.value, prev.location.coordinates[1]] }
                      }));
                    }}
                    placeholder="e.g. 79.8612"
                  />
                </div>
              </div>
            </div>

            {/* Map Picker Modal */}
            {showMapPicker && (
              <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col overflow-hidden" style={{ maxHeight: '90vh' }}>

                  {/* Modal Header */}
                  <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#0B1354]/10 flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-[#0B1354]" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-base">Pick Your Pharmacy Location</h3>
                        <p className="text-xs text-slate-500">Click anywhere on the map to place a pin on your location</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowMapPicker(false)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Map Area */}
                  <div style={{ height: '460px' }}>
                    <LocationPickerMap
                      initialLat={tempCoords.lat || null}
                      initialLng={tempCoords.lng || null}
                      onLocationSelect={(lat, lng) => {
                        setTempCoords({ lat, lng });
                      }}
                    />
                  </div>

                  {/* Selected Coords Preview */}
                  <div className="px-5 py-3 bg-slate-50 border-t border-slate-100">
                    {tempCoords.lat && tempCoords.lng ? (
                      <div className="flex items-center gap-2 text-sm text-slate-700">
                        <MapPin className="w-4 h-4 text-green-600 shrink-0" />
                        <span className="font-medium">Selected:</span>
                        <span className="font-mono text-slate-600">
                          {parseFloat(tempCoords.lat).toFixed(6)}, {parseFloat(tempCoords.lng).toFixed(6)}
                        </span>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400">Click on the map to set your pharmacy location.</p>
                    )}
                  </div>

                  {/* Modal Actions */}
                  <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-slate-100">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowMapPicker(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      icon={Check}
                      disabled={!tempCoords.lat || !tempCoords.lng}
                      onClick={async () => {
                        const lat = tempCoords.lat;
                        const lng = tempCoords.lng;
                        setFormData(prev => ({
                          ...prev,
                          location: { coordinates: [lng, lat] }
                        }));
                        setShowMapPicker(false);

                        // Auto reverse geocode
                        try {
                          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
                          const data = await res.json();
                          if (data && data.address) {
                            setFormData(prev => {
                              const city = data.address.city || data.address.town || data.address.village || data.address.county || prev.address.city;
                              const state = data.address.state || data.address.region || prev.address.state;
                              const road = data.address.road || '';
                              const house = data.address.house_number || '';
                              const street = [house, road].filter(Boolean).join(' ') || data.display_name.split(',')[0] || prev.address.street;
                              return { ...prev, address: { ...prev.address, street, city, state } };
                            });
                          }
                        } catch (err) {
                          console.error('Reverse geocode failed:', err);
                        }
                      }}
                    >
                      Confirm Location
                    </Button>
                  </div>
                </div>
              </div>
            )}
         </div>
      </div>

      {/* Settings Section */}
      <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
         <div className="md:col-span-1">
            <h3 className="text-lg font-bold text-[#0B1354] mb-1">Operational Settings</h3>
            <p className="text-sm font-medium text-slate-500">Configure what services you offer to customers.</p>
         </div>
         <div className="md:col-span-2 space-y-4">
            
            <label className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
              <div className="flex items-center h-5 mt-0.5">
                 <input
                   type="checkbox"
                   name="deliveryAvailable"
                   checked={formData.deliveryAvailable}
                   onChange={handleChange}
                   className="h-4 w-4 text-primary-600 rounded border-slate-300 focus:ring-primary-500"
                 />
              </div>
              <div className="flex-1">
                 <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Truck className="w-4 h-4 text-slate-500" /> Offer Delivery Services
                 </div>
                 <p className="text-sm font-medium text-slate-500 mt-1">Check this if you can deliver medicines to customers' homes.</p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
              <div className="flex items-center h-5 mt-0.5">
                 <input
                   type="checkbox"
                   name="pickupAvailable"
                   checked={formData.pickupAvailable}
                   onChange={handleChange}
                   className="h-4 w-4 text-primary-600 rounded border-slate-300 focus:ring-primary-500"
                 />
              </div>
              <div className="flex-1">
                 <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Package className="w-4 h-4 text-slate-500" /> Offer In-Store Pickup
                 </div>
                 <p className="text-sm font-medium text-slate-500 mt-1">Check this to allow customers to pick up orders directly from your pharmacy.</p>
              </div>
            </label>
            
         </div>
      </div>

      <div className="p-6 md:p-8 bg-slate-50/50 flex justify-end">
        <Button
          type="submit"
          disabled={loading}
          isLoading={loading}
          icon={Save}
          size="lg"
        >
          {initialData ? 'Update Profile' : 'Create Profile'}
        </Button>
      </div>
    </form>
  );
};

export default PharmacyProfileForm;
