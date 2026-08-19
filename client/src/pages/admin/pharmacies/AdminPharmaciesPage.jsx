import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Store, ArrowRight, Activity, MapPin } from 'lucide-react';
import adminService from '../../../features/admin/adminService';
import { Card } from '../../../components/ui/Card';
import Skeleton from '../../../components/ui/Skeleton';
import EmptyState from '../../../components/ui/EmptyState';
import Badge from '../../../components/ui/Badge';
import Input from '../../../components/ui/Input';

const AdminPharmaciesPage = () => {
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('ALL');
  const navigate = useNavigate();

  useEffect(() => {
    fetchPharmacies();
  }, []);

  const fetchPharmacies = async () => {
    try {
      setLoading(true);
      const res = await adminService.getPharmacies();
      setPharmacies(res.data.items || res.data || []);
    } catch (error) {
      console.error("Failed to fetch pharmacies");
    } finally {
      setLoading(false);
    }
  };

  const filteredPharmacies = pharmacies.filter(p => {
    const matchesSearch = p.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.registrationNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.ownerId?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'ALL' || p.verificationStatus === filter;
    return matchesSearch && matchesFilter;
  });

  const getStatusVariant = (status) => {
    switch(status) {
      case 'APPROVED': return 'success';
      case 'PENDING': return 'warning';
      case 'REJECTED': return 'error';
      case 'SUSPENDED': return 'error';
      default: return 'default';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Manage Pharmacies</h1>
          <p className="mt-2 text-slate-600 font-medium">Review and verify pharmacy registrations across the platform.</p>
        </div>
      </div>

      <Card className="overflow-hidden mb-8">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-center gap-5">
           <div className="flex flex-wrap gap-2">
            {['ALL', 'PENDING', 'APPROVED', 'SUSPENDED', 'REJECTED'].map(status => (
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
          <div className="w-full md:w-80">
            <Input
              icon={Search}
              placeholder="Search by name, reg number, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        ) : filteredPharmacies.length === 0 ? (
          <EmptyState
            icon={Store}
            title="No pharmacies found"
            description="There are no pharmacies matching your search or filter criteria."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Business Info</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Reg Number</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {filteredPharmacies.map((pharmacy) => (
                  <tr key={pharmacy._id} className="hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => navigate(`/admin/pharmacies/${pharmacy._id}`)}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold">
                          {pharmacy.businessName?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900">{pharmacy.businessName}</div>
                          <div className="text-xs font-medium text-slate-500">{pharmacy.ownerId?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                       <span className="font-mono text-sm font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                          {pharmacy.registrationNumber || 'N/A'}
                       </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {pharmacy.address?.city || 'Not set'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                       <Badge variant={getStatusVariant(pharmacy.verificationStatus)}>{pharmacy.verificationStatus}</Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="text-primary-600 hover:text-primary-800 font-bold flex items-center justify-end transition-colors">
                        Review <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminPharmaciesPage;
