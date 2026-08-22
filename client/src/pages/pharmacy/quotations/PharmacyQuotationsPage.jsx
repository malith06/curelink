import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, FileText, ArrowRight, Clock } from 'lucide-react';
import { toast } from 'react-toastify';
import quotationService from '../../../features/quotations/quotationService';
import { Card } from '../../../components/ui/Card';
import Skeleton from '../../../components/ui/Skeleton';
import Badge from '../../../components/ui/Badge';
import Input from '../../../components/ui/Input';
import EmptyState from '../../../components/ui/EmptyState';

const PharmacyQuotationsPage = () => {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuotations();
  }, []);

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      const res = await quotationService.getPharmacyQuotations();
      setQuotations(res.data?.quotations || []);
    } catch (error) {
      toast.error('Failed to load your quotations');
    } finally {
      setLoading(false);
    }
  };

  const filteredQuotations = quotations.filter(q => {
    const matchesFilter = filter === 'ALL' || q.status === filter;
    
    // Safely get the request ID as a string, handling both populated objects and raw ObjectIds
    const reqIdString = q.requestId?._id ? String(q.requestId._id) : String(q.requestId || '');
    const matchesSearch = !searchTerm || (reqIdString && reqIdString.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesFilter && matchesSearch;
  });

  const getStatusVariant = (status) => {
    switch (status) {
      case 'ACCEPTED': return 'success';
      case 'DECLINED': return 'error';
      case 'SUBMITTED': return 'info';
      case 'DRAFT': return 'warning';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-5 w-96 mb-8" />
        <Card className="p-4 space-y-4">
           {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-16 w-full" />)}
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">My Quotations</h1>
          <p className="mt-2 text-slate-600 font-medium">Track and manage all quotations you've drafted or sent.</p>
        </div>
      </div>

      <Card className="overflow-hidden mb-8">
        {/* Filters and Search */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-center gap-5">
          <div className="flex flex-wrap gap-2">
            {['ALL', 'DRAFT', 'SUBMITTED', 'ACCEPTED', 'DECLINED'].map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  filter === status 
                    ? 'bg-primary-600 text-white shadow-md shadow-primary-600/20' 
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
          <div className="w-full md:w-72">
             <Input 
                icon={Search} 
                placeholder="Search by Request ID..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
             />
          </div>
        </div>

        {/* Quotations List */}
        <div className="overflow-x-auto">
          {filteredQuotations.length === 0 ? (
            <EmptyState 
              icon={FileText}
              title="No quotations found"
              description="You haven't created any quotations matching these filters."
            />
          ) : (
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Request ID / Date</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Items</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Total (Rs)</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {filteredQuotations.map((quotation) => (
                  <tr key={quotation._id} className="hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => {
                    const reqId = quotation.requestId?._id ? String(quotation.requestId._id) : String(quotation.requestId || '');
                    navigate(`/pharmacy/requests/${reqId}`);
                  }}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-mono text-sm font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md inline-block mb-1 border border-slate-200">
                        #{(() => {
                           const reqId = quotation.requestId?._id ? String(quotation.requestId._id) : String(quotation.requestId || '');
                           return reqId.substring(Math.max(0, reqId.length - 6)).toUpperCase();
                        })()}
                      </div>
                      <div className="text-xs font-medium text-slate-500 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(quotation.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                       <Badge variant={getStatusVariant(quotation.status)}>{quotation.status.replace(/_/g, ' ')}</Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 text-center font-bold">
                      {quotation.items?.length || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-600 text-right font-black">
                      {quotation.total ? quotation.total.toFixed(2) : '0.00'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="text-primary-600 hover:text-primary-800 flex items-center justify-end font-bold transition-colors">
                        {quotation.status === 'DRAFT' ? 'Edit Draft' : 'View Details'}
                        <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
};

export default PharmacyQuotationsPage;
