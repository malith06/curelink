import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'react-toastify';
import adminService from '../../../features/admin/adminService';

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
    try {
      setActionLoading(true);
      await adminService.updatePharmacyStatus(id, action);
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
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!pharmacy) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6 flex justify-between items-center">
        <Link to="/admin/pharmacies" className="text-primary hover:text-primary-800 flex items-center text-sm font-medium">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Pharmacies
        </Link>
        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${
          pharmacy.verificationStatus === 'APPROVED' ? 'bg-green-100 text-green-800 border-green-200' :
          pharmacy.verificationStatus === 'REJECTED' ? 'bg-red-100 text-red-800 border-red-200' :
          pharmacy.verificationStatus === 'SUSPENDED' ? 'bg-orange-100 text-orange-800 border-orange-200' :
          'bg-yellow-100 text-yellow-800 border-yellow-200'
        }`}>
          {pharmacy.verificationStatus}
        </span>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">{pharmacy.businessName}</h1>
          <p className="text-gray-500 text-sm mt-1">Registered Owner: {pharmacy.ownerId?.email}</p>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Business Details</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Registration Number</p>
                <p className="font-medium text-gray-900">{pharmacy.registrationNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium text-gray-900">{pharmacy.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Address</p>
                <p className="font-medium text-gray-900">
                  {pharmacy.address?.street}<br/>
                  {pharmacy.address?.city}, {pharmacy.address?.state} {pharmacy.address?.zipCode}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Location Data</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Coordinates</p>
                {pharmacy.location?.coordinates ? (
                  <p className="font-medium text-gray-900">
                    Lat: {pharmacy.location.coordinates[1].toFixed(5)}, Lng: {pharmacy.location.coordinates[0].toFixed(5)}
                  </p>
                ) : (
                  <p className="font-medium text-gray-400 italic">Not set</p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500">Delivery Available</p>
                <p className="font-medium text-gray-900">{pharmacy.deliveryAvailable ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Created At</p>
                <p className="font-medium text-gray-900">{new Date(pharmacy.createdAt).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl shadow-sm border border-gray-200 p-6 flex flex-wrap gap-4 items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Moderation Actions</h3>
          <p className="text-sm text-gray-600">Update the verification status of this pharmacy.</p>
        </div>
        
        <div className="flex gap-3">
          {pharmacy.verificationStatus === 'PENDING' && (
            <>
              <button 
                onClick={() => handleAction('approve')} disabled={actionLoading}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium flex items-center transition-colors disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4 mr-2" /> Approve
              </button>
              <button 
                onClick={() => handleAction('reject')} disabled={actionLoading}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium flex items-center transition-colors disabled:opacity-50"
              >
                <XCircle className="w-4 h-4 mr-2" /> Reject
              </button>
            </>
          )}

          {pharmacy.verificationStatus === 'APPROVED' && (
            <button 
              onClick={() => handleAction('suspend')} disabled={actionLoading}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-md font-medium flex items-center transition-colors disabled:opacity-50"
            >
              <AlertTriangle className="w-4 h-4 mr-2" /> Suspend
            </button>
          )}

          {(pharmacy.verificationStatus === 'SUSPENDED' || pharmacy.verificationStatus === 'REJECTED') && (
            <button 
              onClick={() => handleAction('reactivate')} disabled={actionLoading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium flex items-center transition-colors disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4 mr-2" /> Reactivate
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPharmacyDetailsPage;
