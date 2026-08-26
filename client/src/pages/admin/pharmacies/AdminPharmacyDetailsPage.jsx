import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, AlertTriangle, Store, MapPin, Map, Calendar, ShieldCheck, Mail, Phone, Hash } from 'lucide-react';
import { toast } from 'react-toastify';
import adminService from '../../../features/admin/adminService';
import { Card, CardContent, CardHeader } from '../../../components/ui/Card';
import Skeleton from '../../../components/ui/Skeleton';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';

const AdminPharmacyDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pharmacy, setPharmacy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchPharmacy();
  }, [id]);

  const fetchPharmacy = async () => {
    try {
      setLoading(true);
      const res = await adminService.getPharmacyById(id);
      setPharmacy(res.data);
    } catch (error) {
      toast.error('Failed to load pharmacy details');
      navigate('/admin/pharmacies');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action) => {
    let reason = '';
    if (action === 'suspend' || action === 'reject') {
       reason = window.prompt(`Please provide a reason to ${action} this pharmacy:`);
       if (reason === null) return; // User cancelled
       if (reason.trim() === '') {
          toast.error('A reason is required');
          return;
       }
    }

    try {
      setActionLoading(true);
      await adminService.updatePharmacyStatus(id, action, reason);
      toast.success(`Pharmacy successfully ${action}ed`);
      fetchPharmacy();
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${action} pharmacy`);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        <Skeleton className="h-6 w-32 mb-6" />
        <Card>
          <CardContent className="p-8 space-y-6">
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-4 w-1/4" />
            <div className="mt-8 space-y-4">
               {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!pharmacy) return null;

  const getStatusVariant = (status) => {
    switch (status) {
      case 'APPROVED': return 'success';
      case 'REJECTED': return 'error';
      case 'SUSPENDED': return 'error';
      case 'PENDING': 
      case 'DRAFT': return 'warning';
      default: return 'default';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin/pharmacies')} className="p-2 hover:bg-slate-100 rounded-full transition-colors group">
            <ArrowLeft className="w-5 h-5 text-slate-600 group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-4">
              Pharmacy Details
            </h1>
            <p className="text-slate-500 font-medium mt-1">Review registration and moderation actions</p>
          </div>
        </div>
        <Badge variant={getStatusVariant(pharmacy.verificationStatus)} className="text-sm px-4 py-1.5 shadow-sm">
           {pharmacy.verificationStatus === 'DRAFT' ? 'PENDING' : pharmacy.verificationStatus}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader className="bg-primary-50/50 border-b border-primary-100 pb-6 pt-8">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-3xl shadow-inner border border-primary-200">
                  {pharmacy.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                   <h2 className="text-2xl font-black text-slate-900 tracking-tight">{pharmacy.name}</h2>
                   <p className="text-primary-700 font-medium flex items-center gap-2 mt-1">
                      <Mail className="w-4 h-4" /> {pharmacy.email}
                   </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
               <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
                  
                  <div className="p-8 space-y-6">
                     <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-2">
                        <Store className="w-4 h-4 text-slate-400" /> Business Identity
                     </h3>
                     
                     <div className="space-y-5">
                        <div>
                          <p className="text-sm text-slate-500 font-medium mb-1 flex items-center gap-1.5"><Hash className="w-4 h-4" /> Registration Number</p>
                          <p className="font-mono text-lg font-bold text-slate-900 bg-slate-50 inline-block px-3 py-1 rounded-lg border border-slate-200">{pharmacy.registrationNumber}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500 font-medium mb-1 flex items-center gap-1.5"><Phone className="w-4 h-4" /> Contact Phone</p>
                          <p className="font-bold text-slate-900">{pharmacy.phone}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500 font-medium mb-1 flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Registered On</p>
                          <p className="font-medium text-slate-900">{new Date(pharmacy.createdAt).toLocaleString()}</p>
                        </div>
                     </div>
                  </div>

                  <div className="p-8 space-y-6 bg-slate-50/50">
                     <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-2">
                        <MapPin className="w-4 h-4 text-slate-400" /> Location Details
                     </h3>
                     
                     <div className="space-y-5">
                        <div>
                          <p className="text-sm text-slate-500 font-medium mb-1">Physical Address</p>
                          <p className="font-bold text-slate-900 leading-relaxed">
                            {pharmacy.address?.street}<br/>
                            {pharmacy.address?.city}, {pharmacy.address?.state} {pharmacy.address?.zipCode}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500 font-medium mb-1 flex items-center gap-1.5"><Map className="w-4 h-4" /> Coordinates</p>
                          {pharmacy.location?.coordinates ? (
                            <div className="font-mono text-sm font-medium text-slate-700 bg-white inline-block px-3 py-1.5 rounded-lg border border-slate-200">
                              {pharmacy.location.coordinates[1].toFixed(5)}, {pharmacy.location.coordinates[0].toFixed(5)}
                            </div>
                          ) : (
                            <p className="font-medium text-slate-400 italic bg-white inline-block px-3 py-1 rounded-lg border border-slate-100">Not set</p>
                          )}
                        </div>
                        <div>
                          <p className="text-sm text-slate-500 font-medium mb-1">Delivery Services</p>
                          <Badge variant={pharmacy.deliveryAvailable ? 'success' : 'default'}>
                            {pharmacy.deliveryAvailable ? 'Available' : 'Not Available'}
                          </Badge>
                        </div>
                     </div>
                  </div>

               </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="sticky top-24 shadow-lg shadow-primary-900/5 ring-1 ring-slate-200">
            <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary-500" />
                Moderation Panel
              </h2>
              <p className="text-sm text-slate-500 font-medium mt-1">Manage pharmacy access</p>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
               {(pharmacy.verificationStatus === 'PENDING' || pharmacy.verificationStatus === 'DRAFT') && (
                 <>
                   <Button 
                     onClick={() => handleAction('approve')} disabled={actionLoading} isLoading={actionLoading}
                     variant="success" fullWidth size="lg" icon={CheckCircle}
                   >
                     Approve Pharmacy
                   </Button>
                   <Button 
                     onClick={() => handleAction('reject')} disabled={actionLoading}
                     variant="outline" fullWidth size="lg" icon={XCircle}
                     className="!text-red-600 !border-red-200 hover:!bg-red-50"
                   >
                     Reject Registration
                   </Button>
                   <p className="text-xs text-center text-slate-500 mt-2 font-medium">This action will notify the pharmacy owner via email.</p>
                 </>
               )}

               {pharmacy.verificationStatus === 'APPROVED' && (
                 <div className="space-y-4">
                    <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                       <p className="text-sm text-green-800 font-bold flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Pharmacy is active</p>
                    </div>
                    <Button 
                      onClick={() => handleAction('suspend')} disabled={actionLoading} isLoading={actionLoading}
                      variant="outline" fullWidth size="lg" icon={AlertTriangle}
                      className="!text-amber-600 !border-amber-200 hover:!bg-amber-50"
                    >
                      Suspend Pharmacy
                    </Button>
                 </div>
               )}

               {(pharmacy.verificationStatus === 'SUSPENDED' || pharmacy.verificationStatus === 'REJECTED') && (
                 <div className="space-y-4">
                    <div className={`p-4 rounded-xl border ${pharmacy.verificationStatus === 'SUSPENDED' ? 'bg-amber-50 border-amber-100' : 'bg-red-50 border-red-100'}`}>
                       <p className={`text-sm font-bold flex items-center gap-2 ${pharmacy.verificationStatus === 'SUSPENDED' ? 'text-amber-800' : 'text-red-800'}`}>
                          {pharmacy.verificationStatus === 'SUSPENDED' ? <AlertTriangle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                          Pharmacy is {pharmacy.verificationStatus.toLowerCase()}
                       </p>
                    </div>
                    {pharmacy.verificationStatus === 'SUSPENDED' && (
                      <Button 
                        onClick={() => handleAction('reactivate')} disabled={actionLoading} isLoading={actionLoading}
                        variant="primary" fullWidth size="lg" icon={CheckCircle}
                      >
                        Reactivate Pharmacy
                      </Button>
                    )}
                 </div>
               )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminPharmacyDetailsPage;
