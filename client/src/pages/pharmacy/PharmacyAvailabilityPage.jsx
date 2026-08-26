import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import availabilityApi from '../../features/availability/availabilityApi';
import api from '../../api/axiosClient'; 
import pharmacyService from '../../features/pharmacy/pharmacyService';
import AvailabilityStatusBadge from '../../components/availability/AvailabilityStatusBadge';
import { Search, Edit2, Plus, PackageX, Package, Check, X } from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'AVAILABLE', label: 'Available', color: 'bg-green-100 text-green-800' },
  { value: 'LIMITED', label: 'Limited', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'CONFIRMATION_REQUIRED', label: 'Confirmation Required', color: 'bg-orange-100 text-orange-800' },
  { value: 'UNAVAILABLE', label: 'Unavailable', color: 'bg-red-100 text-red-800' }
];

const PharmacyAvailabilityPage = () => {
  const [profile, setProfile] = useState(null);
  const [availabilities, setAvailabilities] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [allMedicines, setAllMedicines] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const profileData = await pharmacyService.getMyPharmacyProfile();
      setProfile(profileData.data);

      if (profileData.data?.verificationStatus === 'APPROVED') {
        const availData = await availabilityApi.getMyAvailability({ limit: 50 });
        setAvailabilities(Array.isArray(availData.data) ? availData.data : []);
        
        try {
          const medsRes = await api.get('/medicines', { params: { limit: 100 } });
          setAllMedicines(medsRes.data?.data?.items || medsRes.data?.items || []);
        } catch (e) {
          console.error("Failed to load catalog", e);
        }
      }
    } catch (err) {
      toast.error('Failed to load availability data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim()) {
        fetchSearchResults(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const fetchSearchResults = async (query) => {
    try {
      setIsSearching(true);
      const res = await api.get('/medicines', { params: { search: query, limit: 20 } });
      setSearchResults(res.data.data?.items || res.data.items || []);
    } catch (err) {
      console.error('Failed to search medicines', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchMedicines = (e) => {
    e.preventDefault();
    // Handled by debounce useEffect
  };

  const handleStartEdit = (medicine, existingRecord = null) => {
    setEditingItem({
      medicineId: medicine?._id || existingRecord?.medicineId?._id,
      medicineName: medicine?.name || existingRecord?.medicineId?.name || 'Unknown Medicine',
      status: existingRecord?.status || 'AVAILABLE',
      notes: existingRecord?.notes || ''
    });
  };

  const handleSaveAvailability = async () => {
    if (!editingItem) return;
    try {
      await availabilityApi.updateAvailability(editingItem.medicineId, {
        status: editingItem.status,
        notes: editingItem.notes
      });
      toast.success('Availability updated successfully');
      setEditingItem(null);
      setSearchQuery('');
      setSearchResults([]);
      fetchData(); 
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update availability');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0B1354]"></div>
      </div>
    );
  }

  if (profile?.verificationStatus !== 'APPROVED') {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl text-center">
        <div className="bg-yellow-50 text-yellow-800 p-8 rounded-2xl shadow-sm border border-yellow-200 flex flex-col items-center">
          <PackageX className="w-16 h-16 mb-4 opacity-80" />
          <h2 className="text-2xl font-bold mb-2">Approval Required</h2>
          <p className="text-yellow-700">Your pharmacy must be approved before you can manage and publish medicine availability.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-[#0B1354]/10 p-3 rounded-xl text-[#0B1354]">
          <Package className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-bold text-[#0B1354]">Inventory Management</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Col: Search & Add */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[600px]">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
              Medicine Catalog
            </h2>
            <form onSubmit={handleSearchMedicines} className="mb-4 flex flex-col gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (!e.target.value.trim()) setSearchResults([]);
                  }}
                  placeholder="Search medicines..."
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0B1354]/20 focus:border-[#0B1354] outline-none transition-all"
                />
              </div>
              <button 
                type="submit"
                disabled={isSearching}
                className="w-full py-3 bg-[#0B1354] text-white font-medium rounded-xl hover:bg-[#0a1040] disabled:opacity-50 transition-colors flex justify-center items-center gap-2"
              >
                {isSearching ? 'Searching...' : 'Find Medicine'}
              </button>
            </form>

            <div className="flex-1 overflow-y-auto pr-1 -mr-1 custom-scrollbar">
              {(searchQuery.trim() ? searchResults : allMedicines).length > 0 ? (
                <ul className="space-y-2">
                  {(searchQuery.trim() ? searchResults : allMedicines).map((med) => (
                    <li key={med._id} className="p-3 flex justify-between items-center rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all group">
                      <div className="flex-1 min-w-0 pr-3">
                        <p className="font-medium text-gray-900 truncate">{med.name}</p>
                        {med.brand && <p className="text-xs text-gray-500 truncate">{med.brand}</p>}
                      </div>
                      <button
                        onClick={() => handleStartEdit(med)}
                        title="Update Availability"
                        className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-50 text-blue-600 rounded-full group-hover:bg-blue-600 group-hover:text-white transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 px-4">
                  <Search className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-sm">
                    {searchQuery.trim() ? 'No medicines found matching your search.' : 'No medicines available in the catalog.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Current List & Edit Form */}
        <div className="lg:col-span-8 space-y-6">
          
          {editingItem && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border-t-4 border-t-[#0B1354] border-l border-r border-b border-gray-100">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm font-medium text-blue-600 mb-1">Update Status For</p>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingItem.medicineName}
                  </h2>
                </div>
                <button onClick={() => setEditingItem(null)} className="text-gray-400 hover:text-gray-600 p-1">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Availability Status</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {STATUS_OPTIONS.map(opt => (
                      <label 
                        key={opt.value} 
                        className={`cursor-pointer border rounded-xl p-3 flex flex-col items-center text-center transition-all ${
                          editingItem.status === opt.value 
                            ? 'border-[#0B1354] bg-blue-50 ring-1 ring-[#0B1354]' 
                            : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                        }`}
                      >
                        <input 
                          type="radio" 
                          name="status" 
                          value={opt.value} 
                          checked={editingItem.status === opt.value}
                          onChange={(e) => setEditingItem({ ...editingItem, status: e.target.value })}
                          className="sr-only"
                        />
                        <span className={`text-xs font-semibold ${
                          editingItem.status === opt.value ? 'text-[#0B1354]' : 'text-gray-600'
                        }`}>
                          {opt.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Internal Notes (Optional)</label>
                  <textarea
                    value={editingItem.notes}
                    onChange={(e) => setEditingItem({ ...editingItem, notes: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0B1354]/20 focus:border-[#0B1354] outline-none h-24 transition-all resize-none"
                    placeholder="E.g., Out of stock until Friday. Awaiting new shipment."
                    maxLength={300}
                  />
                  <p className="text-xs text-gray-500 mt-2">Private note for pharmacy staff. Customers will not see this.</p>
                </div>
                
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => setEditingItem(null)}
                    className="px-5 py-2.5 font-medium text-gray-600 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveAvailability}
                    className="px-6 py-2.5 bg-[#0B1354] text-white font-medium rounded-xl hover:bg-[#0a1040] shadow-sm transition-all flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Confirm Update
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col min-h-[400px]">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-lg font-semibold text-gray-800">Current Inventory Log</h2>
              <span className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full">
                {availabilities.length} Records
              </span>
            </div>
            
            {availabilities.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-500">
                <PackageX className="w-12 h-12 mb-3 text-gray-300" />
                <p className="font-medium text-gray-700">No Inventory Published</p>
                <p className="text-sm mt-1">Search the catalog on the left to add your first medicine.</p>
              </div>
            ) : (
              <div className="overflow-x-auto flex-1">
                <table className="min-w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-white">Medicine</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-white">Status</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-white">Last Updated</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-white text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 bg-white">
                    {availabilities.map((record) => {
                      return (
                        <tr key={record._id} className="hover:bg-blue-50/30 transition-colors group">
                          <td className="px-6 py-4">
                            <p className="text-sm font-semibold text-gray-900">{record.medicineId?.name || 'Unknown Medicine'}</p>
                            {record.medicineId?.brand && <p className="text-xs text-gray-500">{record.medicineId.brand}</p>}
                          </td>
                          <td className="px-6 py-4">
                            <AvailabilityStatusBadge status={record.status} />
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                            {new Date(record.lastUpdated || record.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleStartEdit(null, record)}
                              className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-50 text-gray-500 hover:bg-blue-100 hover:text-blue-700 transition-colors"
                              title="Edit Availability"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PharmacyAvailabilityPage;
