import React, { useState, useEffect } from 'react';
import pharmacyService from './pharmacyService';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { Store, Hash, Phone, Mail, MapPin, Truck, Package, Save } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';

const PharmacyProfileForm = ({ initialData, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    registrationNumber: '',
    phone: '',
    email: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
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
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
        address: { ...prev.address, ...initialData.address },
        openingHours: { ...prev.openingHours, ...initialData.openingHours },
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
        registrationNumber: formData.registrationNumber,
        phone: formData.phone,
        email: formData.email || 'pharmacy@example.com',
        address: {
          line1: formData.address.street,
          city: formData.address.city,
          district: formData.address.state,
          postalCode: formData.address.zipCode,
          country: 'Sri Lanka'
        },
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
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const isReadOnly = initialData && ['PENDING', 'APPROVED', 'SUSPENDED'].includes(initialData.verificationStatus);

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
            <h3 className="text-lg font-bold text-slate-900 mb-1">Business Identity</h3>
            <p className="text-sm font-medium text-slate-500">Provide the official name and registration number of your pharmacy.</p>
         </div>
         <div className="md:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Pharmacy Name <span className="text-red-500">*</span></label>
                <Input
                  icon={Store}
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={isReadOnly}
                  required
                  placeholder="e.g. City Pharmacy"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Registration Number <span className="text-red-500">*</span></label>
                <Input
                  icon={Hash}
                  type="text"
                  name="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={handleChange}
                  disabled={isReadOnly}
                  required
                  placeholder="e.g. PH-12345"
                />
              </div>
            </div>
         </div>
      </div>

      {/* Contact Details Section */}
      <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
         <div className="md:col-span-1">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Contact Information</h3>
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
                  placeholder="pharmacy@example.com"
                />
              </div>
            </div>
         </div>
      </div>

      {/* Address Section */}
      <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
         <div className="md:col-span-1">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Location Details</h3>
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
                disabled={isReadOnly}
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
                  disabled={isReadOnly}
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
                  disabled={isReadOnly}
                  required
                  placeholder="Western Province"
                />
              </div>
            </div>
         </div>
      </div>

      {/* Settings Section */}
      <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
         <div className="md:col-span-1">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Operational Settings</h3>
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
