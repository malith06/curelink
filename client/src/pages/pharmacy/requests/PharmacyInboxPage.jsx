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

  const filteredRequests = requests.filter(req => 
    req.customerId?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req._id.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    <div className="max-w-7xl mx-auto px-4 py-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex items-center gap-4">
           <div className="w-14 h-14 bg-[#0B1354]/10 rounded-2xl flex items-center justify-center">
              <Inbox className="w-7 h-7 text-[#0B1354]" />
           </div>
           <div>
             <h1 className="text-3xl font-bold text-[#0B1354] tracking-tight">Request Inbox</h1>
             <p className="mt-1 text-slate-500 font-medium">Review and provide quotations for customer medicine requests.</p>
           </div>
        </div>
        <div className="w-full md:w-72">
          <Input 
            icon={Search} 
            placeholder="Search by customer or ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
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
              className="flex flex-col hover:border-primary-300 hover:shadow-md transition-all cursor-pointer group"
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
                  <Badge variant="warning">Action Required</Badge>
                </div>
                
                <div className="space-y-3 mt-6">
                  <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <div className="bg-white p-1.5 rounded-md shadow-sm border border-slate-100">
                      <span className="font-bold text-slate-900">#{req._id.substring(req._id.length - 6).toUpperCase()}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-900">{req.items?.length || 0}</span>
                      <span className="text-sm ml-1">Medicines Requested</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 rounded-b-xl flex justify-between items-center group-hover:bg-primary-50 transition-colors">
                <span className="text-sm font-medium text-slate-500">Click to review</span>
                <div className="flex items-center text-sm font-bold text-primary-600 group-hover:text-primary-700">
                  Review & Quote <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PharmacyInboxPage;
