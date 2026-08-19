import React, { useState, useEffect } from 'react';
import useGeolocation from '../hooks/useGeolocation';
import LocationPermissionState from '../components/maps/LocationPermissionState';
import NearbyPharmacyMap from '../components/maps/NearbyPharmacyMap';
import NearbyPharmacyList from '../components/maps/NearbyPharmacyList';
import api from '../api/axios';
import { Search, X, Loader2 } from 'lucide-react';
import Input from '../components/ui/Input';
import { Card } from '../components/ui/Card';

const NearbyPharmacySearchPage = () => {
  const { status, latitude, longitude, error, requestLocation } = useGeolocation();
  const [pharmacies, setPharmacies] = useState([]);
  const [selectedPharmacyId, setSelectedPharmacyId] = useState(null);
  
  // Search parameters
  const [radius, setRadius] = useState(10); // 10km default
  const [searchQuery, setSearchQuery] = useState('');
  const [medicineResults, setMedicineResults] = useState([]);
  const [selectedMedicineId, setSelectedMedicineId] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Fetch nearby pharmacies when location or filters change
  useEffect(() => {
    if (status === 'success' && latitude && longitude) {
      fetchNearbyPharmacies();
    }
  }, [status, latitude, longitude, radius, selectedMedicineId]);

  const fetchNearbyPharmacies = async () => {
    try {
      setIsSearching(true);
      const params = {
        lat: latitude,
        lng: longitude,
        radius: radius * 1000 // Convert to meters
      };
      if (selectedMedicineId) {
        params.medicineId = selectedMedicineId;
      }
      
      const response = await api.get('/pharmacies/nearby', { params });
      setPharmacies(response.data.data);
      // Reset selected pharmacy on new search
      setSelectedPharmacyId(null);
    } catch (err) {
      console.error('Error fetching nearby pharmacies', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleMedicineSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (!query.trim()) {
      setMedicineResults([]);
      setSelectedMedicineId('');
      return;
    }

    try {
      const response = await api.get('/medicines', { params: { search: query } });
      setMedicineResults(response.data.data?.items || response.data.items || []);
    } catch (err) {
      console.error('Error searching medicines', err);
    }
  };

  const handleSelectMedicine = (medId, medName) => {
    setSelectedMedicineId(medId);
    setSearchQuery(medName);
    setMedicineResults([]); // hide dropdown
  };

  const handleClearMedicineFilter = () => {
    setSelectedMedicineId('');
    setSearchQuery('');
    setMedicineResults([]);
  };

  return (
    <div className="mx-auto px-4 py-8 max-w-7xl h-[calc(100vh-80px)] flex flex-col">
      <h1 className="text-3xl font-bold text-slate-900 mb-6 flex-shrink-0 tracking-tight">Nearby Pharmacies</h1>
      
      {status !== 'success' ? (
        <div className="flex-1 flex items-center justify-center">
          <LocationPermissionState 
            status={status} 
            error={error} 
            onRequestLocation={requestLocation} 
          />
        </div>
      ) : (
        <div className="flex flex-col h-full space-y-6">
          
          {/* Controls Area */}
          <Card className="flex-shrink-0 flex flex-col md:flex-row gap-4 justify-between items-center z-10 relative p-4">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <label className="text-sm font-medium text-slate-700 whitespace-nowrap">Search Radius:</label>
              <select 
                value={radius} 
                onChange={(e) => setRadius(Number(e.target.value))}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none w-full md:w-32 transition-colors"
              >
                <option value={5}>5 km</option>
                <option value={10}>10 km</option>
                <option value={20}>20 km</option>
                <option value={50}>50 km</option>
              </select>
            </div>

            <div className="relative w-full md:w-96 flex-shrink-0">
              <div className="relative flex items-center">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-400" />
                </div>
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={handleMedicineSearch}
                  placeholder="Filter by medicine availability..."
                  className="pl-9 pr-10"
                />
                {selectedMedicineId && (
                  <button 
                    onClick={handleClearMedicineFilter}
                    className="absolute right-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              
              {/* Medicine Autocomplete Dropdown */}
              {medicineResults.length > 0 && !selectedMedicineId && (
                <ul className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto z-50 py-1">
                  {medicineResults.map(med => (
                    <li 
                      key={med._id}
                      onClick={() => handleSelectMedicine(med._id, med.genericName)}
                      className="px-4 py-2 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0 transition-colors"
                    >
                      <p className="font-medium text-slate-900 text-sm">{med.genericName}</p>
                      {med.brandName && <p className="text-xs text-slate-500 mt-0.5">{med.brandName}</p>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Card>

          {/* Map and List Area */}
          <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
            {/* List View */}
            <div className="w-full lg:w-1/3 h-[40vh] lg:h-full bg-white rounded-2xl shadow-sm border border-slate-200 p-2 overflow-hidden flex flex-col">
              {isSearching ? (
                <div className="flex justify-center items-center flex-1">
                  <Loader2 className="animate-spin text-primary-600 w-8 h-8" />
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto">
                  <NearbyPharmacyList 
                    pharmacies={pharmacies}
                    selectedPharmacyId={selectedPharmacyId}
                    onSelectPharmacy={setSelectedPharmacyId}
                  />
                </div>
              )}
            </div>
            
            {/* Map View */}
            <div className="w-full lg:w-2/3 h-[50vh] lg:h-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative">
              <NearbyPharmacyMap 
                userLocation={{ lat: latitude, lng: longitude }}
                pharmacies={pharmacies}
                selectedPharmacyId={selectedPharmacyId}
                onSelectPharmacy={setSelectedPharmacyId}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NearbyPharmacySearchPage;
