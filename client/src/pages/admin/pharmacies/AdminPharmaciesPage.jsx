import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Search, Store } from 'lucide-react';
import adminService from '../../../features/admin/adminService';

const AdminPharmaciesPage = () => {
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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

  const filteredPharmacies = pharmacies.filter(p => 
    p.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.registrationNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch(status) {
      case 'APPROVED': return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200';
      case 'SUSPENDED': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Pharmacies</h1>
          <p className="mt-2 text-gray-600">Review and verify pharmacy registrations.</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-t-xl border border-b-0 border-gray-200 flex justify-between items-center">
        <div className="relative w-72">
          <input
            type="text"
            placeholder="Search by name or reg number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        </div>
      </div>

      <div className="bg-white rounded-b-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredPharmacies.length === 0 ? (
          <div className="text-center py-12 text-gray-500 flex flex-col items-center">
            <Store className="w-12 h-12 text-gray-300 mb-3" />
            <p>No pharmacies found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reg Number</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPharmacies.map((pharmacy) => (
                  <tr key={pharmacy._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{pharmacy.businessName}</div>
                      <div className="text-xs text-gray-500">{pharmacy.ownerId?.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {pharmacy.registrationNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {pharmacy.address?.city || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 inline-flex text-xs font-medium rounded-full border ${getStatusColor(pharmacy.verificationStatus)}`}>
                        {pharmacy.verificationStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link to={`/admin/pharmacies/${pharmacy._id}`} className="text-primary hover:text-primary-800 font-semibold">
                        Review
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPharmaciesPage;
