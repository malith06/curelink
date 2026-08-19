import React, { useState, useEffect } from 'react';
import PharmacyProfileForm from '../../features/pharmacy/PharmacyProfileForm';
import pharmacyService from '../../features/pharmacy/pharmacyService';
import { toast } from 'react-toastify';
import { Store, ShieldAlert, Clock, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import Skeleton from '../../components/ui/Skeleton';
import Badge from '../../components/ui/Badge';

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
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-5 w-96 mb-8" />
        <Card className="p-8 space-y-6">
           <Skeleton className="h-12 w-full" />
           <Skeleton className="h-12 w-full" />
           <Skeleton className="h-32 w-full" />
        </Card>
      </div>
    );
  }

  const getStatusAlert = () => {
    if (!profile) return null;
    
    switch (profile.verificationStatus) {
      case 'PENDING':
        return (
          <div className="p-5 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-4 mb-8">
             <Clock className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
             <div>
               <h3 className="font-bold text-amber-900 text-lg">Verification Pending</h3>
               <p className="text-sm font-medium text-amber-800 mt-1 leading-relaxed">
                 Your profile is currently under review by our administrators. You cannot make changes to key details (like business name or registration number) at this time.
               </p>
             </div>
          </div>
        );
      case 'SUSPENDED':
        return (
          <div className="p-5 bg-red-50 rounded-2xl border border-red-100 flex items-start gap-4 mb-8">
             <ShieldAlert className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
             <div>
               <h3 className="font-bold text-red-900 text-lg">Account Suspended</h3>
               <p className="text-sm font-medium text-red-800 mt-1 leading-relaxed">
                 Your pharmacy account has been suspended. Please contact CureLink support immediately to resolve this issue.
               </p>
             </div>
          </div>
        );
      case 'APPROVED':
        return (
          <div className="p-4 bg-green-50 rounded-xl border border-green-100 flex items-center gap-3 mb-8">
             <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
             <p className="text-sm font-bold text-green-800">Your pharmacy is verified and active on CureLink.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex items-center gap-4">
           <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center">
              <Store className="w-7 h-7 text-primary-600" />
           </div>
           <div>
             <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Pharmacy Profile</h1>
             <p className="mt-1 text-slate-500 font-medium">
               Manage your pharmacy details, registration numbers, and operational settings.
             </p>
           </div>
        </div>
        {profile && (
          <Badge variant={
            profile.verificationStatus === 'APPROVED' ? 'success' : 
            profile.verificationStatus === 'PENDING' ? 'warning' : 'error'
          } className="px-4 py-1.5 shadow-sm">
            {profile.verificationStatus}
          </Badge>
        )}
      </div>

      {getStatusAlert()}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <PharmacyProfileForm initialData={profile} onSuccess={handleSuccess} />
      </div>
    </div>
  );
};

export default PharmacyProfilePage;
