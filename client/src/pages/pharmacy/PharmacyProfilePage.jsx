import React, { useState, useEffect } from 'react';
import PharmacyProfileForm from '../../features/pharmacy/PharmacyProfileForm';
import pharmacyService from '../../features/pharmacy/pharmacyService';
import { toast } from 'react-toastify';
import { Loader2 } from 'lucide-react';

const PharmacyProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await pharmacyService.getMyPharmacyProfile();
      setProfile(data.data);
    } catch (error) {
      if (error.response?.status !== 404) {
        toast.error('Failed to load profile');
      }
      // If 404, it just means they haven't created one yet
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSuccess = () => {
    toast.success(profile ? 'Profile updated successfully!' : 'Profile created successfully!');
    fetchProfile();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Pharmacy Profile</h1>
        <p className="mt-2 text-gray-600">
          Manage your pharmacy details, registration numbers, and operational settings.
        </p>
      </div>

      {profile && profile.verificationStatus !== 'APPROVED' && (
        <div className={`p-4 rounded-md mb-8 ${
          profile.verificationStatus === 'PENDING' ? 'bg-yellow-50 text-yellow-800 border border-yellow-200' :
          profile.verificationStatus === 'SUSPENDED' ? 'bg-red-50 text-red-800 border border-red-200' :
          'bg-gray-50 text-gray-800 border border-gray-200'
        }`}>
          <h3 className="font-semibold">Verification Status: {profile.verificationStatus}</h3>
          <p className="text-sm mt-1">
            {profile.verificationStatus === 'PENDING' && "Your profile is under review by our administrators. You cannot make changes to key details at this time."}
            {profile.verificationStatus === 'SUSPENDED' && "Your account has been suspended. Please contact support."}
          </p>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <PharmacyProfileForm initialData={profile} onSuccess={handleSuccess} />
      </div>
    </div>
  );
};

export default PharmacyProfilePage;
