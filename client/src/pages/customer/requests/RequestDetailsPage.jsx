import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, Plus, Check, Search, Trash2, Send } from 'lucide-react';
import { toast } from 'react-toastify';
import requestService from '../../../features/requests/requestService';
import api from '../../../api/axiosClient'; // for medicine/pharmacy search

const RequestDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);

  // Draft mode states
  const [searchQuery, setSearchQuery] = useState('');
  const [medicineResults, setMedicineResults] = useState([]);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [prescriptionRequired, setPrescriptionRequired] = useState(false);
  
  // Submit state
  const [pharmacies, setPharmacies] = useState([]);
  const [selectedPharmacyIds, setSelectedPharmacyIds] = useState([]);

  useEffect(() => {
    fetchRequest();
    // Load nearby pharmacies just in case they want to submit
    fetchNearbyPharmacies();
  }, [id]);

  const fetchRequest = async () => {
    try {
      setLoading(true);
      const res = await requestService.getRequestById(id);
      setRequest(res.data);
    } catch (error) {
      toast.error("Failed to fetch request details");
      navigate('/customer/requests');
    } finally {
      setLoading(false);
    }
  };

  const fetchNearbyPharmacies = async () => {
    try {
      // In a real app we'd use geolocation. For now we just fetch all approved pharmacies.
      const res = await api.get('/pharmacies/nearby', { params: { lat: 0, lng: 0, radius: 50000000 }}); 
      setPharmacies(res.data.data || res.data || []);
    } catch (err) {
      console.log('Could not load pharmacies');
    }
  };

  const handleMedicineSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (!query) {
      setMedicineResults([]);
      return;
    }
    try {
      const res = await api.get('/medicines', { params: { search: query } });
      setMedicineResults(res.data.items || res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddItem = async () => {
    if (!selectedMedicine) return;
    try {
      await requestService.addItemToRequest(id, {
        medicineId: selectedMedicine._id,
        quantity,
        prescriptionRequired: selectedMedicine.requiresPrescription || prescriptionRequired
      });
      toast.success('Item added to draft');
      setSelectedMedicine(null);
      setSearchQuery('');
      setQuantity(1);
      fetchRequest();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add item');
    }
  };

  const handleSubmitRequest = async () => {
    if (selectedPharmacyIds.length === 0) {
      return toast.error('Please select at least one pharmacy.');
    }
    try {
      await requestService.submitRequest(id, selectedPharmacyIds);
      toast.success('Request sent to pharmacies!');
      fetchRequest();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit request');
    }
  };

  const handleAcceptQuotation = async (pharmacyId) => {
    try {
      await requestService.acceptQuotation(id, pharmacyId);
      toast.success('Quotation accepted!');
      fetchRequest();
      // Auto-trigger payment for demonstration
      await requestService.processPayment(id);
      toast.success('Payment processed successfully!');
      fetchRequest();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to accept quotation');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!request) return null;

  const isDraft = request.status === 'DRAFT';

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-6">
        <Link to="/customer/requests" className="text-primary hover:text-primary-800 flex items-center text-sm font-medium">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Requests
        </Link>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Request #{request._id.substring(request._id.length - 6).toUpperCase()}</h1>
            <p className="text-gray-500 text-sm mt-1">{new Date(request.createdAt).toLocaleString()}</p>
          </div>
          <span className={`px-4 py-1.5 rounded-full text-sm font-medium border ${
            isDraft ? 'bg-gray-100 text-gray-800 border-gray-200' :
            request.status === 'SUBMITTED' ? 'bg-blue-100 text-blue-800 border-blue-200' :
            request.status === 'ACCEPTED' || request.status === 'COMPLETED' ? 'bg-green-100 text-green-800 border-green-200' :
            'bg-yellow-100 text-yellow-800 border-yellow-200'
          }`}>
            {request.status.replace(/_/g, ' ')}
          </span>
        </div>

        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Requested Items</h3>
          
          {/* Item List */}
          {request.items && request.items.length > 0 ? (
            <ul className="divide-y border rounded-md mb-6">
              {request.items.map((item, idx) => (
                <li key={idx} className="p-4 flex justify-between items-center bg-white">
                  <div>
                    <span className="font-semibold text-gray-900">{item.medicineId?.genericName || 'Medicine'}</span>
                    <span className="text-gray-600 text-sm ml-4 bg-gray-100 px-2 py-1 rounded">Qty: {item.quantity}</span>
                  </div>
                  {item.prescriptionRequired && (
                    <span className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded border border-red-100">Prescription Required</span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center p-8 border border-dashed rounded-md bg-gray-50 mb-6">
              <p className="text-gray-500">No items added to this draft yet.</p>
            </div>
          )}

          {/* Draft Mode: Add Items */}
          {isDraft && (
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-6 mb-8">
              <h4 className="font-medium text-blue-900 mb-4">Add Medicine to Request</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="md:col-span-2 relative">
                  <label className="block text-sm text-gray-700 mb-1">Search Medicine</label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleMedicineSearch}
                    placeholder="Type generic name..."
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                  {medicineResults.length > 0 && !selectedMedicine && (
                    <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded shadow-lg max-h-48 overflow-y-auto">
                      {medicineResults.map(med => (
                        <li 
                          key={med._id} 
                          onClick={() => { setSelectedMedicine(med); setSearchQuery(med.genericName); setMedicineResults([]); }}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                        >
                          {med.genericName} {med.requiresPrescription ? '(Rx)' : ''}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <button 
                    onClick={handleAddItem}
                    disabled={!selectedMedicine}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 font-medium"
                  >
                    Add Item
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Draft Mode: Submit to Pharmacies */}
          {isDraft && request.items.length > 0 && (
            <div className="border-t border-gray-200 pt-8 mt-4">
              <h4 className="font-semibold text-gray-900 mb-2">Select Pharmacies</h4>
              <p className="text-gray-600 text-sm mb-4">Choose up to 5 nearby pharmacies to send this request to for quotations.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 max-h-60 overflow-y-auto p-1">
                {pharmacies.map(pharmacy => (
                  <label key={pharmacy._id} className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${selectedPharmacyIds.includes(pharmacy._id) ? 'border-primary bg-primary-50' : 'hover:bg-gray-50'}`}>
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary"
                      checked={selectedPharmacyIds.includes(pharmacy._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          if (selectedPharmacyIds.length >= 5) return toast.warning('You can only select up to 5 pharmacies');
                          setSelectedPharmacyIds([...selectedPharmacyIds, pharmacy._id]);
                        } else {
                          setSelectedPharmacyIds(selectedPharmacyIds.filter(id => id !== pharmacy._id));
                        }
                      }}
                    />
                    <div className="ml-3">
                      <span className="block text-sm font-medium text-gray-900">{pharmacy.businessName}</span>
                      <span className="block text-xs text-gray-500">{pharmacy.address?.city || 'Unknown location'}</span>
                    </div>
                  </label>
                ))}
              </div>

              <div className="flex justify-end">
                <button 
                  onClick={handleSubmitRequest}
                  disabled={selectedPharmacyIds.length === 0}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center disabled:opacity-50"
                >
                  <Send className="w-5 h-5 mr-2" /> Send Request for Quotations
                </button>
              </div>
            </div>
          )}

          {/* Non-Draft Mode: Quotations */}
          {!isDraft && (
            <div className="border-t border-gray-200 pt-8 mt-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Quotations from Pharmacies</h3>
              
              {request.quotations && request.quotations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {request.quotations.map((quotation, idx) => (
                    <div key={idx} className={`border rounded-xl p-5 ${
                      quotation.status === 'ACCEPTED' ? 'border-green-500 bg-green-50 shadow-sm' : 
                      quotation.status === 'REJECTED' ? 'border-red-200 opacity-60' : 
                      'border-gray-200 bg-white hover:border-gray-300'
                    }`}>
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-bold text-gray-900">{quotation.pharmacyId?.businessName || 'Pharmacy'}</h4>
                        <span className={`text-xs font-bold px-2 py-1 rounded ${
                          quotation.status === 'ACCEPTED' ? 'bg-green-200 text-green-800' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {quotation.status}
                        </span>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        {quotation.items.map((qItem, i) => (
                          <div key={i} className="flex justify-between text-sm">
                            <span className="text-gray-600">{qItem.medicineId?.genericName || 'Item'} (x{qItem.quantity})</span>
                            <span className="font-medium">
                              {qItem.isAvailable ? `Rs. ${qItem.price?.toFixed(2) || '0.00'}` : <span className="text-red-500">Unavailable</span>}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="border-t pt-3 flex justify-between items-center">
                        <span className="font-bold text-lg text-gray-900">Total: Rs. {quotation.totalPrice?.toFixed(2) || '0.00'}</span>
                        
                        {request.status === 'QUOTATION_RECEIVED' && quotation.status === 'PENDING' && (
                          <button 
                            onClick={() => handleAcceptQuotation(quotation.pharmacyId._id)}
                            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-700 text-sm font-medium transition-colors"
                          >
                            Accept & Pay
                          </button>
                        )}
                        
                        {quotation.status === 'ACCEPTED' && request.paymentStatus === 'PAID' && (
                          <span className="text-green-600 text-sm font-bold flex items-center">
                            <Check className="w-4 h-4 mr-1" /> PAID
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 flex items-center">
                  <Search className="w-5 h-5 mr-3 flex-shrink-0" />
                  <p>Pharmacies are currently reviewing your request. Quotations will appear here once they respond.</p>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default RequestDetailsPage;
