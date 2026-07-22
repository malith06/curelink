import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import availabilityApi from '../../features/availability/availabilityApi';
import api from '../../api/axios'; // Direct call for medicine search
import pharmacyService from '../../features/pharmacy/pharmacyService';
import AvailabilityStatusBadge from '../../components/availability/AvailabilityStatusBadge';

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
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Edit state
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [profileData, availData] = await Promise.all([
        pharmacyService.getMyPharmacyProfile(),
        availabilityApi.getMyAvailability({ limit: 50 })
      ]);
      setProfile(profileData.data);
      setAvailabilities(availData.data.items);
    } catch (err) {
      toast.error('Failed to load availability data');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchMedicines = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    try {
      setIsSearching(true);
      // Assuming public medicine search is available at GET /medicines?search=...
      const res = await api.get('/medicines', { params: { search: searchQuery } });
      setSearchResults(res.data.data?.items || res.data.items || []);
    } catch (err) {
      toast.error('Failed to search medicines');
    } finally {
      setIsSearching(false);
    }
  };

  const handleStartEdit = (medicine, existingRecord = null) => {
    setEditingItem({
      medicineId: medicine._id || existingRecord?.medicineId?._id,
      medicineName: medicine.genericName || existingRecord?.medicineId?.genericName || 'Unknown Medicine',
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
      fetchData(); // Refresh list
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update availability');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading...</div>;
  }

  if (profile?.verificationStatus !== 'APPROVED') {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl text-center">
        <div className="bg-yellow-50 text-yellow-800 p-6 rounded-lg border border-yellow-200">
          <h2 className="text-xl font-bold mb-2">Approval Required</h2>
          <p>Your pharmacy must be approved before you can publish medicine availability.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Medicine Availability Management</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Search & Add */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Add Medicine</h2>
            <form onSubmit={handleSearchMedicines} className="flex gap-2 mb-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by generic name..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
              />
              <button 
                type="submit"
                disabled={isSearching}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Search
              </button>
            </form>

            {searchResults.length > 0 && (
              <ul className="divide-y border rounded max-h-60 overflow-y-auto">
                {searchResults.map((med) => (
                  <li key={med._id} className="p-3 flex justify-between items-center hover:bg-gray-50">
                    <div>
                      <p className="font-medium text-gray-900">{med.genericName}</p>
                      {med.brandName && <p className="text-xs text-gray-500">{med.brandName}</p>}
                    </div>
                    <button
                      onClick={() => handleStartEdit(med)}
                      className="text-sm px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                    >
                      Update
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Right Col: Current List & Edit Form */}
        <div className="lg:col-span-2 space-y-6">
          
          {editingItem && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-blue-200">
              <h2 className="text-xl font-semibold mb-4 text-blue-900">
                Updating: {editingItem.medicineName}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={editingItem.status}
                    onChange={(e) => setEditingItem({ ...editingItem, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
                  >
                    {STATUS_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Private Notes (Optional)</label>
                  <textarea
                    value={editingItem.notes}
                    onChange={(e) => setEditingItem({ ...editingItem, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none h-24"
                    placeholder="E.g., Out of stock until Friday"
                    maxLength={300}
                  />
                  <p className="text-xs text-gray-500 mt-1">This note is for internal use and will not be displayed to customers publicly. Price information should not be included here.</p>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => setEditingItem(null)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveAvailability}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Save Availability
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800">Your Current Inventory Status</h2>
              <span className="text-sm text-gray-500">{availabilities.length} records</span>
            </div>
            
            {availabilities.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                You haven't published availability for any medicines yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medicine</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {availabilities.map((record) => {
                      const statusOpt = STATUS_OPTIONS.find(s => s.value === record.status);
                      return (
                        <tr key={record._id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {record.medicineId?.genericName || 'Unknown Medicine'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <AvailabilityStatusBadge status={record.status} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(record.lastUpdatedAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleStartEdit(null, record)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Edit
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
