import React, { useState, useEffect } from 'react';
import { Inbox, ArrowRight, Clock, MapPin, Search } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import requestService from '../../../features/requests/requestService';
import { Card } from '../../../components/ui/Card';
import Skeleton from '../../../components/ui/Skeleton';
import EmptyState from '../../../components/ui/EmptyState';
import Badge from '../../../components/ui/Badge';
import Input from '../../../components/ui/Input';

const PharmacyInboxPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'pending', 'quoted'
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInbox = async () => {
      try {
        const res = await requestService.getPharmacyInbox();
        setRequests(res.data || []);
      } catch (error) {
        console.error("Failed to load pharmacy inbox");
      } finally {
        setLoading(false);
      }
    };
    fetchInbox();
  }, []);

  const filteredRequests = requests.filter(req => {
    const matchesSearch = req.customerId?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          req._id.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    
    if (filterType === 'pending') return !req.hasQuoted;
    if (filterType === 'quoted') return req.hasQuoted;
    return true;
  });

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-5 w-96 mb-8" />
        <Card className="p-4 space-y-4">
           {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20 w-full" />)}
        </Card>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500 bg-slate-50 min-h-screen">
      {/* Modern Header Section */}
      <div className="bg-[#0B1354] pb-24 pt-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden rounded-b-[3rem] mb-[-4rem]">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500 rounded-full mix-blend-screen filter blur-[80px] opacity-30 animate-pulse"></div>
        
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
             <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 flex items-center justify-center">
                <Inbox className="w-7 h-7 text-white" />
             </div>
             <div>
               <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">Request Inbox</h1>
               <p className="mt-2 text-blue-100 font-medium">Review and provide quotations for customer medicine requests.</p>
             </div>
          </div>
          <div className="w-full md:w-72 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-1.5 shadow-lg">
            <Input 
              icon={Search} 
              placeholder="Search by customer or ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white rounded-xl border-0"
            />
          </div>
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 relative z-20">
        {/* Filters */}
        <div className="flex overflow-x-auto gap-2 mb-6 pb-2 custom-scrollbar">
          <button 
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filterType === 'all' ? 'bg-primary-600 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
          >
            All Requests
          </button>
          <button 
            onClick={() => setFilterType('pending')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filterType === 'pending' ? 'bg-primary-600 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
          >
            Action Required
          </button>
          <button 
            onClick={() => setFilterType('quoted')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filterType === 'quoted' ? 'bg-primary-600 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
          >
            Quoted
          </button>
        </div>

        {requests.length === 0 ? (
        <EmptyState 
          icon={Inbox}
          title="Inbox Empty"
          description="You have no new medicine requests from customers at this time. When customers in your area request medicines, they will appear here."
        />
      ) : filteredRequests.length === 0 ? (
         <EmptyState 
          icon={Search}
          title="No Matches Found"
          description={`No requests matching "${searchTerm}".`}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRequests.map(req => (
            <Card 
              key={req._id} 
              className="flex flex-col bg-white/80 backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl hover:-translate-y-1 hover:shadow-xl hover:border-blue-200 transition-all cursor-pointer group overflow-hidden"
              onClick={() => navigate(`/pharmacy/requests/${req._id}`)}
            >
              <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg group-hover:text-primary-700 transition-colors">
                      {req.customerId?.fullName || 'Customer'}
                    </h3>
                    <div className="flex items-center text-xs text-slate-500 mt-1 gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(req.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  {req.hasQuoted ? (
                    <Badge variant="success">Quoted</Badge>
                  ) : (
                    <Badge variant="warning">Action Required</Badge>
                  )}
                </div>
                
                <div className="space-y-3 mt-6">
                  <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <div className="bg-white p-1.5 rounded-md shadow-sm border border-slate-100">
                      <span className="font-bold text-slate-900">#{req.requestNumber || req._id.substring(req._id.length - 6).toUpperCase()}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-900">{req.items?.length || 0}</span>
                      <span className="text-sm ml-1">Medicines Requested</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="px-5 py-4 border-t border-slate-100/60 bg-gradient-to-r from-transparent to-transparent group-hover:from-blue-50/50 group-hover:to-transparent flex justify-between items-center transition-colors">
                <span className="text-sm font-medium text-slate-500">Click to review</span>
                <div className="flex items-center text-sm font-bold text-primary-600 group-hover:text-primary-700">
                  {req.hasQuoted ? 'View Details' : 'Review & Quote'} <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      </div>
    </div>
  );
};

export default PharmacyInboxPage;
