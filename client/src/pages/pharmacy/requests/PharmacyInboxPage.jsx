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
        setRequests(res.data.items || []);
      } catch (error) {
        console.error("Failed to load pharmacy inbox");
      } finally {
        setLoading(false);
      }
    };
    fetchInbox();
  }, []);

  const filteredRequests = requests.filter(req => 
    req.customerId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Request Inbox</h1>
          <p className="mt-2 text-slate-600 font-medium">Review and provide quotations for customer medicine requests.</p>
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
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Customer / Date</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Request Info</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {filteredRequests.map(req => (
                  <tr key={req._id} className="hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => navigate(`/pharmacy/requests/${req._id}`)}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-slate-900">{req.customerId?.name || 'Customer'}</div>
                      <div className="text-xs font-medium text-slate-500 mt-1 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(req.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900 mb-1">
                        #{req._id.substring(req._id.length - 6).toUpperCase()}
                      </div>
                      <div className="text-xs font-medium text-slate-500">
                        {req.items?.length || 0} items requested
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="warning">Action Required</Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="text-primary-600 hover:text-primary-800 font-bold flex items-center justify-end transition-colors">
                        Review & Quote <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default PharmacyInboxPage;
