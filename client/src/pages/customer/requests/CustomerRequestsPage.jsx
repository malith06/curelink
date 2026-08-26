import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Clock, FileText, ChevronRight, Pill, Store } from 'lucide-react';
import requestService from '../../../features/requests/requestService';
import Button from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import StatusBadge from '../../../components/ui/StatusBadge';
import EmptyState from '../../../components/ui/EmptyState';
import Skeleton from '../../../components/ui/Skeleton';

const CustomerRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await requestService.getMyRequests();
        setRequests(res.data || []);
      } catch (error) {
        console.error("Failed to load requests");
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const filteredRequests = requests.filter(req => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'DRAFT') return req.status === 'DRAFT';
    if (activeTab === 'SUBMITTED') return ['SUBMITTED', 'QUOTATIONS_RECEIVED'].includes(req.status);
    if (activeTab === 'COMPLETED') return ['QUOTATION_ACCEPTED', 'CONVERTED_TO_ORDER', 'PROCESSING', 'READY_FOR_PICKUP', 'DISPATCHED', 'COMPLETED'].includes(req.status);
    if (activeTab === 'CANCELLED') return ['CANCELLED', 'EXPIRED'].includes(req.status);
    return false;
  });

  if (loading) {
    return (
      <div className="mx-auto px-4 py-12 max-w-5xl">
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-5 w-96 mb-8" />
        <Card className="p-4 space-y-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto px-4 py-12 max-w-5xl">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4">
        <div className="flex items-center gap-4">
           <div className="w-14 h-14 bg-[#0B1354]/10 rounded-2xl flex items-center justify-center">
              <FileText className="w-7 h-7 text-[#0B1354]" />
           </div>
           <div>
             <h1 className="text-3xl font-bold text-[#0B1354] tracking-tight">My Medicine Requests</h1>
             <p className="mt-1 text-slate-500 font-medium">Track your prescriptions and quotations from nearby pharmacies.</p>
           </div>
        </div>
        <Button onClick={() => navigate('/customer/requests/new')} icon={Plus}>
          New Request
        </Button>
      </div>

      {/* Status Tabs */}
      {!loading && requests.length > 0 && (
        <div className="flex overflow-x-auto gap-2 mb-6 pb-2 custom-scrollbar">
          {['ALL', 'DRAFT', 'SUBMITTED', 'COMPLETED', 'CANCELLED'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tab === 'ALL' ? 'All Requests' : tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      )}

      {filteredRequests.length === 0 ? (
        <EmptyState 
          icon={FileText}
          title={requests.length === 0 ? "No Requests Yet" : `No ${activeTab.toLowerCase()} requests`}
          description={requests.length === 0 ? "You haven't made any medicine requests yet." : "Try selecting a different filter."}
          action={
            requests.length === 0 && (
              <Button onClick={() => navigate('/customer/requests/new')} icon={Plus}>
                Start your first request
              </Button>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRequests.map(req => (
            <Card 
              key={req._id} 
              className="flex flex-col hover:border-primary-300 hover:shadow-md transition-all cursor-pointer group"
              onClick={() => navigate(`/customer/requests/${req._id}`)}
            >
              <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg group-hover:text-primary-700 transition-colors">
                      #{req._id.substring(req._id.length - 6).toUpperCase()}
                    </h3>
                    <div className="flex items-center text-xs text-slate-500 mt-1 gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(req.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <StatusBadge status={req.status} />
                </div>
                
                <div className="space-y-3 mt-6">
                  <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <div className="bg-white p-1.5 rounded-md shadow-sm border border-slate-100">
                      <Pill className="w-4 h-4 text-primary-500" />
                    </div>
                    <div>
                      <span className="font-semibold text-slate-900">{req.items?.length || 0}</span>
                      <span className="text-sm ml-1">Medicines</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <div className="bg-white p-1.5 rounded-md shadow-sm border border-slate-100">
                      <Store className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div>
                      <span className="font-semibold text-slate-900">{req.selectedPharmacyIds?.length || 0}</span>
                      <span className="text-sm ml-1">Pharmacies</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 rounded-b-xl flex justify-between items-center group-hover:bg-primary-50 transition-colors">
                <span className="text-sm font-medium text-primary-600 group-hover:text-primary-700">View Details</span>
                <ChevronRight className="w-4 h-4 text-primary-500 group-hover:translate-x-1 transition-transform" />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerRequestsPage;
