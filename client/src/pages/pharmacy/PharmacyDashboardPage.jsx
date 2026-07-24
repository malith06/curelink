import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Store, MapPin, Package, Bell, Clock, Activity, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import pharmacyService from '../../features/pharmacy/pharmacyService';

const PharmacyDashboardPage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await pharmacyService.getMyPharmacyProfile();
        setProfile(res.data);
      } catch (err) {
        console.log('No profile found or error fetching profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const isApproved = profile?.verificationStatus === 'APPROVED';
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pharmacy Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Welcome back, {user?.name || profile?.name || 'Partner'}
          </p>
        </div>
        {profile && (
          <div className="px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm flex items-center gap-2">
            <Activity className={`w-5 h-5 ${isApproved ? 'text-green-500' : 'text-yellow-500'}`} />
            <span className="font-medium text-sm text-gray-700">
              Status: <span className={isApproved ? 'text-green-600' : 'text-yellow-600'}>{profile.verificationStatus}</span>
            </span>
          </div>
        )}
      </div>

      {!profile && (
        <div className="bg-primary-50 border-l-4 border-primary p-4 mb-8 rounded-r-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <Store className="h-5 w-5 text-primary" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-primary-800">Complete your profile</h3>
              <div className="mt-2 text-sm text-primary-700">
                <p>You need to complete your pharmacy profile and get approved before receiving medicine requests.</p>
              </div>
              <div className="mt-4">
                <Link to="/pharmacy/profile" className="text-sm font-medium text-primary-900 hover:text-primary-800 bg-white px-3 py-2 rounded shadow-sm border border-primary-200">
                  Go to Profile Setup
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
          <div className="p-6">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4 text-blue-600">
              <Store className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Pharmacy Profile</h3>
            <p className="text-gray-600 text-sm mb-4 min-h-[40px]">
              Manage your pharmacy details, registration numbers, and operational settings.
            </p>
            <Link to="/pharmacy/profile" className="text-blue-600 font-medium text-sm flex items-center hover:text-blue-800">
              Manage Profile <span className="ml-1">→</span>
            </Link>
          </div>
        </div>

        {/* Location Card */}
        <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow ${!profile ? 'opacity-60 pointer-events-none' : ''}`}>
          <div className="p-6">
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center mb-4 text-green-600">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Location Map</h3>
            <p className="text-gray-600 text-sm mb-4 min-h-[40px]">
              Set your exact GPS coordinates so nearby customers can find you easily.
            </p>
            <Link to="/pharmacy/location" className="text-green-600 font-medium text-sm flex items-center hover:text-green-800">
              Update Location <span className="ml-1">→</span>
            </Link>
          </div>
        </div>

        {/* Availability Card */}
        <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow ${!isApproved ? 'opacity-60 pointer-events-none' : ''}`}>
          <div className="p-6">
            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center mb-4 text-purple-600">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Medicine Stock</h3>
            <p className="text-gray-600 text-sm mb-4 min-h-[40px]">
              Update the availability of medicines in your inventory for public search.
            </p>
            <Link to="/pharmacy/availability" className="text-purple-600 font-medium text-sm flex items-center hover:text-purple-800">
              Manage Inventory <span className="ml-1">→</span>
            </Link>
          </div>
        </div>

        {/* Inbox / Requests Card */}
        <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow ${!isApproved ? 'opacity-60 pointer-events-none' : ''}`}>
          <div className="p-6">
            <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center mb-4 text-orange-600 relative">
              <Bell className="w-6 h-6" />
              {isApproved && (
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Medicine Requests</h3>
            <p className="text-gray-600 text-sm mb-4 min-h-[40px]">
              View incoming medicine requests from customers and provide quotations.
            </p>
            <Link to="/pharmacy/requests" className="text-orange-600 font-medium text-sm flex items-center hover:text-orange-800">
              View Inbox <span className="ml-1">→</span>
            </Link>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default PharmacyDashboardPage;
