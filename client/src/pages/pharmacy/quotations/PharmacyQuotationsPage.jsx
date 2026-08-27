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
      case 'REJECTED': return 'error';
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
    <div className="animate-in fade-in duration-500 bg-slate-50 min-h-screen">
      {/* Modern Header Section */}
      <div className="bg-[#0B1354] pb-24 pt-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden rounded-b-[3rem] mb-[-4rem]">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500 rounded-full mix-blend-screen filter blur-[80px] opacity-30 animate-pulse"></div>
        
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
             <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 flex items-center justify-center">
                <FileText className="w-7 h-7 text-white" />
             </div>
             <div>
               <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">My Quotations</h1>
               <p className="mt-2 text-blue-100 font-medium">Track and manage all quotations you've drafted or sent.</p>
             </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 relative z-20">
        <div className="mb-8">
          {/* Filters and Search */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5 mb-6 pb-2 custom-scrollbar overflow-x-auto">
            <div className="flex gap-2 min-w-max">
              {['ALL', 'DRAFT', 'SUBMITTED', 'ACCEPTED', 'REJECTED'].map(status => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    filter === status 
                      ? 'bg-primary-600 text-white shadow-sm' 
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {status === 'ALL' ? 'All Quotations' : status.charAt(0) + status.slice(1).toLowerCase()}
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
        {filteredQuotations.length === 0 ? (
          <EmptyState 
            icon={FileText}
            title="No quotations found"
            description="You haven't created any quotations matching these filters."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuotations.map((quotation) => {
              const reqId = quotation.requestId?._id ? String(quotation.requestId._id) : String(quotation.requestId || '');
              
              return (
                <Card 
                  key={quotation._id} 
                  className="flex flex-col hover:border-primary-300 hover:shadow-md transition-all cursor-pointer group"
                  onClick={() => navigate(`/pharmacy/requests/${reqId}`)}
                >
                  <div className="p-5 flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-slate-900 text-lg group-hover:text-primary-700 transition-colors uppercase">
                          #{reqId.substring(Math.max(0, reqId.length - 6))}
                        </h3>
                        <div className="flex items-center text-xs text-slate-500 mt-1 gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(quotation.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <Badge variant={getStatusVariant(quotation.status)}>{quotation.status.replace(/_/g, ' ')}</Badge>
                    </div>
                    
                    <div className="space-y-3 mt-6">
                      <div className="flex items-center justify-between text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="bg-white p-1.5 rounded-md shadow-sm border border-slate-100 flex items-center justify-center">
                            <span className="font-bold text-slate-900 px-1">{quotation.items?.length || 0}</span>
                          </div>
                          <span className="text-sm font-semibold text-slate-700">Items Quoted</span>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-slate-500 font-medium">Total</div>
                          <div className="font-bold text-primary-700">Rs. {quotation.total ? quotation.total.toFixed(2) : '0.00'}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 rounded-b-xl flex justify-between items-center group-hover:bg-primary-50 transition-colors">
                    <span className="text-sm font-medium text-slate-500">Click to view</span>
                    <div className="flex items-center text-sm font-bold text-primary-600 group-hover:text-primary-700">
                      {quotation.status === 'DRAFT' ? 'Edit Draft' : 'View Details'} 
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default PharmacyQuotationsPage;
