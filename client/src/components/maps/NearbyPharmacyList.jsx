import React, { useRef, useEffect } from 'react';
import AvailabilityStatusBadge from '../availability/AvailabilityStatusBadge';
import { Link } from 'react-router-dom';

const NearbyPharmacyList = ({
  pharmacies,
  selectedPharmacyId,
  onSelectPharmacy,
  selectedMedicines = []
}) => {
  const listRef = useRef(null);

  // Scroll the selected pharmacy into view automatically when it changes
  useEffect(() => {
    if (selectedPharmacyId && listRef.current) {
      const selectedEl = listRef.current.querySelector(`[data-pharmacy-id="${selectedPharmacyId}"]`);
      if (selectedEl) {
        selectedEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [selectedPharmacyId]);

  if (!pharmacies || pharmacies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-gray-50 rounded-lg border border-gray-200">
        <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Pharmacies Found</h3>
        <p className="text-gray-500">We couldn't find any pharmacies in this area. Try increasing the search radius or choosing a different location.</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto pr-2 custom-scrollbar" ref={listRef}>
      <div className="space-y-4">
        {pharmacies.map(pharmacy => {
          const isSelected = selectedPharmacyId === pharmacy._id;
          
          return (
            <div
              key={pharmacy._id}
              data-pharmacy-id={pharmacy._id}
              onClick={() => onSelectPharmacy(pharmacy._id)}
              className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                isSelected 
                  ? 'border-blue-500 bg-blue-50 shadow-md transform scale-[1.02]' 
                  : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className={`font-bold text-lg ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                  {pharmacy.name || pharmacy.businessName || 'Unknown Pharmacy'}
                </h4>
                {pharmacy.distance !== undefined && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {(pharmacy.distance / 1000).toFixed(1)} km
                  </span>
                )}
              </div>
              
              <p className="text-sm text-gray-600 mb-3 flex items-start gap-1">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>
                  {typeof pharmacy.address === 'object' && pharmacy.address !== null
                    ? [pharmacy.address.line1, pharmacy.address.city, pharmacy.address.district].filter(Boolean).join(', ')
                    : pharmacy.address || 'Address not available'}
                </span>
              </p>

              {/* Per-medicine availability status rows */}
              {pharmacy.medicineStatuses?.length > 0 ? (
                <div className="mt-3 pt-3 border-t border-gray-100 space-y-1.5">
                  {pharmacy.medicineStatuses.map(ms => (
                    <div key={ms.medicineId} className="flex items-center justify-between gap-2">
                      <span className="text-xs text-gray-600 truncate flex-1">{ms.name}</span>
                      <AvailabilityStatusBadge status={ms.status} />
                    </div>
                  ))}
                </div>
              ) : pharmacy.availabilityStatus ? (
                /* Fallback: single overall badge (when only 1 medicine searched or old API) */
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500">Stock Status:</span>
                    <AvailabilityStatusBadge status={pharmacy.availabilityStatus} />
                  </div>
                </div>
              ) : null}

              {/* Action Button when Selected */}
              {isSelected && (
                <div className="mt-4">
                  <Link 
                    to={`/customer/requests/new`}
                    state={{ 
                      preselectedPharmacyId: pharmacy._id, 
                      preselectedMedicines: selectedMedicines || [],
                      medicineStatuses: pharmacy.medicineStatuses || []
                    }}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                  >
                    Send Request
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NearbyPharmacyList;
