import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Send, Search, LayoutGrid, List, Plus, Minus, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import requestService from '../../../features/requests/requestService';
import quotationService from '../../../features/quotations/quotationService';
import api from '../../../api/axiosClient'; // for medicine/pharmacy search
import prescriptionService from '../../../features/prescriptions/prescriptionService';
import Button from '../../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import StatusBadge from '../../../components/ui/StatusBadge';
import Input from '../../../components/ui/Input';
import EmptyState from '../../../components/ui/EmptyState';
import Skeleton from '../../../components/ui/Skeleton';

const RequestDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [request, setRequest] = useState(null);
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'compare'

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
    
    // Check for preselected pharmacy
    if (location.state?.preselectedPharmacyId) {
      setSelectedPharmacyIds([location.state.preselectedPharmacyId]);
    }
  }, [id, location.state]);

  const fetchRequest = async () => {
    try {
      setLoading(true);
      const res = await requestService.getRequestById(id);
      setRequest(res.data);
      
      if (res.data.status !== 'DRAFT') {
        const qRes = await quotationService.getRequestQuotations(id);
        setQuotations(Array.isArray(qRes.data) ? qRes.data : (qRes.data?.quotations || []));
      } else {
        // If draft, load nearby pharmacies that have the requested items
        const medicineIds = res.data.items?.map(i => i.medicineId?._id || i.medicineId).join(',');
        fetchNearbyPharmacies(medicineIds);
      }
    } catch (error) {
      toast.error("Failed to fetch request details");
      navigate('/customer/requests');
    } finally {
      setLoading(false);
    }
  };

  const fetchNearbyPharmacies = async (medicineIds) => {
    try {
      // In a real app we'd use geolocation. For now we just fetch all approved pharmacies.
      const params = { lat: 0, lng: 0, radius: 50000000 };
      if (medicineIds) {
        params.medicineIds = medicineIds;
      }
      const res = await api.get('/pharmacies/nearby', { params }); 
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
      setMedicineResults(res.data.data?.items || res.data.items || []);
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
        prescriptionRequired: selectedMedicine.prescriptionRequired || prescriptionRequired
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

  const handleUpdateQuantity = async (medicineId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await requestService.updateRequestItem(id, medicineId, { quantity: newQuantity });
      // Update local state for immediate feedback
      setRequest(prev => ({
        ...prev,
        items: prev.items.map(item => 
          (item.medicineId?._id === medicineId || item.medicineId === medicineId)
            ? { ...item, quantity: newQuantity }
            : item
        )
      }));
    } catch (err) {
      toast.error('Failed to update quantity');
      fetchRequest(); // Revert on failure
    }
  };

  const handleRemoveItem = async (medicineId) => {
    try {
      await requestService.removeRequestItem(id, medicineId);
      toast.success('Item removed');
      fetchRequest();
    } catch (err) {
      toast.error('Failed to remove item');
    }
  };

  const handleSubmitRequest = async () => {
    if (selectedPharmacyIds.length === 0) {
      return toast.error('Please select at least one pharmacy.');
    }
    if (request.prescriptionRequired && (!request.prescriptionIds || request.prescriptionIds.length === 0)) {
      return toast.error('Please upload a prescription first.');
    }
    try {
      await requestService.submitRequest(id, selectedPharmacyIds);
      toast.success('Request sent to pharmacies!');
      fetchRequest();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit request');
    }
  };


  const handleAcceptQuotation = async (quotationId) => {
    if (!window.confirm("Are you sure you want to accept this quotation and proceed to checkout?")) {
      return;
    }
    
    try {
      setProcessing(true);
      await quotationService.acceptQuotation(id, quotationId);
      toast.success('Quotation accepted! Please proceed to checkout.');
      
      const acceptedQuotation = quotations.find(q => q._id === quotationId);
      navigate(`/customer/orders/create/${quotationId}`, { state: { quotation: acceptedQuotation } });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to accept quotation');
      setProcessing(false);
    }
  };

  const handleCancelRequest = async () => {
    const reason = window.prompt("Please enter a reason for cancelling this request (optional):");
    if (reason === null) return; // User clicked Cancel in prompt

    try {
      setProcessing(true);
      await requestService.cancelRequest(id, reason);
      toast.success('Request cancelled successfully');
      fetchRequest();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel request');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto px-4 py-12 max-w-5xl">
        <Skeleton className="h-10 w-64 mb-4" />
        <Card>
          <CardContent className="p-6 space-y-4">
             <Skeleton className="h-32 w-full" />
             <Skeleton className="h-48 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!request) return null;

  const isDraft = request.status === 'DRAFT';

  return (
    <div className="animate-in fade-in duration-500 bg-slate-50 min-h-screen pb-20">
      {/* Modern Header Section */}
      <div className="bg-[#0B1354] pb-24 pt-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden rounded-b-[3rem] mb-[-4rem]">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500 rounded-full mix-blend-screen filter blur-[80px] opacity-30 animate-pulse"></div>
        
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col gap-6">
          <Link to="/customer/requests" className="text-blue-200 hover:text-white flex items-center text-sm font-medium w-fit group transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1 transition-transform group-hover:-translate-x-1" /> Back to Requests
          </Link>
          
          <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
            <div className="flex items-center gap-4">
               <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-lg">
                  <List className="w-7 h-7 text-white" />
               </div>
               <div>
                 <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
                   Request #{request.requestNumber || request._id.substring(request._id.length - 6).toUpperCase()}
                   <div className="hidden sm:block"><StatusBadge status={request.status} /></div>
                 </h1>
                 <p className="mt-1 text-blue-100 font-medium">Created on {new Date(request.createdAt).toLocaleString()}</p>
               </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="sm:hidden"><StatusBadge status={request.status} /></div>
              {['DRAFT', 'SUBMITTED', 'QUOTATIONS_RECEIVED', 'QUOTATION_ACCEPTED'].includes(request.status) && (
                <button 
                  onClick={handleCancelRequest}
                  disabled={processing}
                  className="px-4 py-2 text-sm font-medium rounded-lg border border-white/30 text-white hover:bg-white/10 hover:border-white/50 transition-colors disabled:opacity-50"
                >
                  Cancel Request
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 relative z-20">
        <div className="space-y-8">
          <Card className="border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl overflow-hidden">
            <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            {isDraft && <span className="bg-primary-100 text-primary-700 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">1</span>}
            <h3 className="text-lg font-semibold text-slate-900">Requested Items</h3>
          </div>
          
          {/* Item List */}
          {request.items && request.items.length > 0 ? (
            <ul className="divide-y divide-slate-100 border border-slate-200 rounded-xl mb-8 overflow-hidden">
              {request.items.map((item, idx) => {
                const medId = item.medicineId?._id || item.medicineId;
                return (
                  <li key={idx} className="p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white hover:bg-slate-50 transition-colors gap-4">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-slate-900">
                        {item.medicineSnapshot?.name || item.medicineId?.name || 'Medicine'}
                        {(item.medicineSnapshot?.dosage || item.medicineId?.dosage) && (
                          <span className="text-slate-500 font-normal ml-1">({item.medicineSnapshot?.dosage || item.medicineId?.dosage})</span>
                        )}
                      </span>
                      {item.prescriptionRequired && (
                        <span className="text-xs bg-rose-50 text-rose-700 px-2 py-1 rounded-md border border-rose-100 font-medium whitespace-nowrap">Rx Required</span>
                      )}
                    </div>
                    
                    {isDraft ? (
                      <div className="flex items-center gap-4 self-end sm:self-auto">
                        <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                          <button 
                            onClick={() => handleUpdateQuantity(medId, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-50 transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <input 
                            type="number"
                            min="1"
                            value={item.quantity === '' ? '' : item.quantity}
                            onChange={(e) => {
                              const val = e.target.value;
                              setRequest(prev => ({
                                ...prev,
                                items: prev.items.map(i => 
                                  (i.medicineId?._id === medId || i.medicineId === medId) 
                                    ? { ...i, quantity: val === '' ? '' : (parseInt(val, 10) || '') } 
                                    : i
                                )
                              }));
                            }}
                            onBlur={(e) => {
                              const val = parseInt(e.target.value, 10);
                              if (!isNaN(val) && val > 0) {
                                // Only call API if we have a valid number
                                handleUpdateQuantity(medId, val);
                              } else {
                                // Fallback to 1 if empty or invalid
                                handleUpdateQuantity(medId, 1);
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.target.blur();
                              }
                            }}
                            className="w-12 text-center font-medium text-slate-900 text-sm focus:outline-none focus:ring-0 bg-transparent border-none p-0"
                          />
                          <button 
                            onClick={() => handleUpdateQuantity(medId, item.quantity + 1)}
                            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <button 
                          onClick={() => handleRemoveItem(medId)}
                          className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-slate-600 text-sm bg-slate-100 px-3 py-1 rounded-full font-medium self-end sm:self-auto">
                        Qty: {item.quantity}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="text-center p-8 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 mb-8">
              <p className="text-slate-500 font-medium">No items added to this draft yet.</p>
            </div>
          )}

          {/* Draft Mode: Add Items */}
          {isDraft && (
            <div className="bg-primary-50 border border-primary-100 rounded-xl p-6 mb-8">
              <h4 className="font-semibold text-primary-900 mb-4">Add Medicine to Request</h4>
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
                <div className="w-full md:flex-1 relative">
                  <label className="block text-sm font-medium text-primary-900 mb-1.5">Search Medicine</label>
                  <Input
                    type="text"
                    value={searchQuery}
                    onChange={handleMedicineSearch}
                    placeholder="Type generic name..."
                    className="w-full"
                  />
                  {medicineResults.length > 0 && !selectedMedicine && (
                    <ul className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto py-1">
                      {medicineResults.map(med => (
                        <li 
                          key={med._id} 
                          onClick={() => { setSelectedMedicine(med); setSearchQuery(med.name); setMedicineResults([]); }}
                          className="px-4 py-2 hover:bg-slate-50 cursor-pointer text-sm font-medium text-slate-900 transition-colors"
                        >
                          {med.name} {med.dosage && <span className="text-slate-500 font-normal ml-1">({med.dosage})</span>} {med.prescriptionRequired ? <span className="text-rose-500 text-xs ml-1">(Rx)</span> : ''}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="w-full md:w-24">
                  <label className="block text-sm font-medium text-primary-900 mb-1.5">Qty</label>
                  <Input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div className="w-full md:w-auto mt-4 md:mt-0">
                  <Button 
                    onClick={handleAddItem}
                    disabled={!selectedMedicine}
                    className="w-full"
                  >
                    Add Item
                  </Button>
                </div>
              </div>
            </div>
          )}


          {/* Prescription Section */}
          <div className="mt-8 border-t border-slate-100 pt-8">
            <div className="flex items-center gap-2 mb-4">
              {isDraft && <span className="bg-primary-100 text-primary-700 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">2</span>}
              <h3 className="text-lg font-semibold text-slate-900">Prescription</h3>
            </div>
            
            {isDraft && (!request.prescriptionIds || request.prescriptionIds.length === 0) && (
              <div className={`${request.prescriptionRequired ? 'bg-rose-50 border-rose-100' : 'bg-primary-50 border-primary-100'} border rounded-xl p-6 mb-8 mt-4`}>
                <h4 className={`font-semibold ${request.prescriptionRequired ? 'text-rose-900' : 'text-primary-900'} mb-2`}>
                  {request.prescriptionRequired ? 'Prescription Required' : 'Upload Prescription (Optional)'}
                </h4>
                <p className={`${request.prescriptionRequired ? 'text-rose-700' : 'text-primary-700'} text-sm mb-4`}>
                  {request.prescriptionRequired 
                    ? "One or more items in your request require a valid doctor's prescription. Please upload it to continue."
                    : "You can upload your prescription image or PDF, and our AI will automatically extract the medicines for you."}
                </p>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <Button 
                    onClick={() => navigate(`/customer/requests/${id}/prescription/upload`)}
                    className={request.prescriptionRequired ? 'bg-rose-600 hover:bg-rose-700 text-white' : ''}
                  >
                    Upload Prescription & Auto-Extract
                  </Button>
                </div>
              </div>
            )}

            {request.prescriptionIds && request.prescriptionIds.length > 0 && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-6 mb-8 mt-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <h4 className="font-semibold text-emerald-900 mb-1 flex items-center gap-2">
                      {request.prescriptionIds.length} {request.prescriptionIds.length === 1 ? 'Prescription' : 'Prescriptions'} Attached
                      <span className="bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Verified</span>
                    </h4>
                    <p className="text-emerald-700 text-sm">Your prescriptions have been securely uploaded and will be sent to pharmacies.</p>
                  </div>
                  {isDraft && (
                    <Button 
                      variant="outline" 
                      onClick={() => navigate(`/customer/requests/${id}/prescription/upload`)}
                      className="border-emerald-200 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 shrink-0"
                      size="sm"
                    >
                      Add More Prescriptions
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {request.prescriptionIds.map((presc, idx) => (
                    <div key={presc._id || idx} className="bg-white border border-emerald-100 rounded-lg p-4 flex flex-col justify-between shadow-sm">
                      <div className="flex justify-between items-start mb-3">
                         <span className="text-sm font-medium text-emerald-900 truncate pr-2" title={presc.originalFileName}>{presc.originalFileName || 'Prescription Document'}</span>
                         <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${presc.ocrStatus === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : presc.ocrStatus === 'PROCESSING' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'}`}>
                           {presc.ocrStatus || 'UPLOADED'}
                         </span>
                      </div>
                      {isDraft && (presc.ocrStatus === 'COMPLETED' || presc.ocrStatus === 'MANUAL_ENTRY_REQUIRED') && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => navigate(`/customer/requests/${id}/prescription/${presc._id}/review`)}
                        >
                          Review Extraction
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Draft Mode: Submit to Pharmacies */}
          {isDraft ? (
            <div className="mt-8 border-t border-slate-100 pt-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="bg-primary-100 text-primary-700 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                  <h3 className="text-lg font-semibold text-slate-900">Select Pharmacies</h3>
                </div>
                <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                  {selectedPharmacyIds.length} Selected
                </span>
              </div>
              <p className="text-slate-600 text-sm mb-6">Choose up to 5 nearby pharmacies to send this request to for quotations.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                {pharmacies.map(pharmacy => (
                  <label key={pharmacy._id} className={`flex items-start p-4 border-2 rounded-xl cursor-pointer transition-all ${selectedPharmacyIds.includes(pharmacy._id) ? 'border-primary-500 bg-primary-50' : 'border-slate-200 hover:border-primary-300 hover:bg-slate-50'}`}>
                    <input 
                      type="checkbox" 
                      className="mt-1 w-5 h-5 text-primary-600 rounded border-slate-300 focus:ring-primary-500 cursor-pointer"
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
                      <span className="block text-sm font-bold text-slate-900">{pharmacy.name || pharmacy.businessName || 'Unknown Pharmacy'}</span>
                      <span className="block text-xs font-medium text-slate-500 mt-0.5">{pharmacy.address?.city || 'Unknown location'}</span>
                    </div>
                  </label>
                ))}
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={handleSubmitRequest}
                  disabled={selectedPharmacyIds.length === 0}
                  icon={Send}
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  Send Request for Quotations
                </Button>
              </div>
            </div>
          ) : (
            /* Non-Draft Mode: Quotations */
            <div className="border-t border-slate-200 pt-8 mt-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">Quotations from Pharmacies</h3>
                  {quotations.length > 0 && (
                    <span className="text-sm text-slate-500 font-medium mt-1 block">
                      {quotations.length} {quotations.length === 1 ? 'Quotation' : 'Quotations'} Received
                    </span>
                  )}
                </div>
                {quotations.length > 1 && (
                  <div className="flex bg-slate-100 rounded-lg p-1 border border-slate-200">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`px-4 py-2 text-sm font-semibold rounded-md transition-all flex items-center ${viewMode === 'grid' ? 'bg-white shadow-sm text-primary-700' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                      <LayoutGrid className="w-4 h-4 mr-2" /> Grid
                    </button>
                    <button
                      onClick={() => setViewMode('compare')}
                      className={`px-4 py-2 text-sm font-semibold rounded-md transition-all flex items-center ${viewMode === 'compare' ? 'bg-white shadow-sm text-primary-700' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                      <List className="w-4 h-4 mr-2" /> Compare
                    </button>
                  </div>
                )}
              </div>
              
              {quotations && quotations.length > 0 ? (
                viewMode === 'compare' && quotations.length > 1 ? (
                  <div className="overflow-x-auto pb-4 rounded-xl border border-slate-200 shadow-sm">
                    <table className="min-w-full divide-y divide-slate-200 bg-white">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Feature</th>
                          {quotations.map(q => (
                            <th key={q._id} className="px-6 py-4 text-center text-sm font-bold text-slate-900 border-l border-slate-200">
                              {q.pharmacyId?.name || q.pharmacyId?.businessName || 'Unknown Pharmacy'}
                              <div className="text-xs font-medium text-slate-500 mt-1">{q.pharmacyId?.address?.city}</div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        <tr>
                          <td className="px-6 py-4 text-sm font-semibold text-slate-900 bg-slate-50">Status</td>
                          {quotations.map(q => (
                            <td key={q._id} className="px-6 py-4 text-center border-l border-slate-200">
                               <StatusBadge status={q.status} />
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="px-6 py-4 text-sm font-semibold text-slate-900 bg-slate-50">Total Price</td>
                          {quotations.map(q => (
                            <td key={q._id} className="px-6 py-4 text-center border-l border-slate-200 font-bold text-primary-600 text-lg">
                              Rs. {q.total?.toFixed(2) || '0.00'}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="px-6 py-4 text-sm font-semibold text-slate-900 bg-slate-50">Items Available</td>
                          {quotations.map(q => {
                            const available = q.items?.filter(i => i.availabilityResult === 'FULL' || i.availabilityResult === 'PARTIAL').length || 0;
                            const total = request.items.length;
                            return (
                              <td key={q._id} className={`px-6 py-4 text-center border-l border-slate-200 font-bold ${available === total ? 'text-emerald-600' : 'text-amber-600'}`}>
                                {available} / {total}
                              </td>
                            );
                          })}
                        </tr>
                        <tr>
                          <td className="px-6 py-4 text-sm font-semibold text-slate-900 bg-slate-50">Preparation Time</td>
                          {quotations.map(q => (
                            <td key={q._id} className="px-6 py-4 text-center border-l border-slate-200 text-slate-700 font-medium">
                              {q.preparationMinutes} mins
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="px-6 py-4 text-sm font-semibold text-slate-900 bg-slate-50">Delivery</td>
                          {quotations.map(q => (
                            <td key={q._id} className="px-6 py-4 text-center border-l border-slate-200 text-slate-700 font-medium">
                              {q.deliveryAvailable ? `Yes (Rs. ${q.deliveryFee?.toFixed(2)})` : 'Pickup Only'}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="px-6 py-4 text-sm font-semibold text-slate-900 bg-slate-50">Substitutions</td>
                          {quotations.map(q => (
                            <td key={q._id} className="px-6 py-4 text-center border-l border-slate-200 text-slate-700 font-medium">
                              {q.substitutionsOffered > 0 ? (
                                <span className="text-amber-600 font-bold">{q.substitutionsOffered} items</span>
                              ) : (
                                <span className="text-slate-400">None</span>
                              )}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="px-6 py-4 text-sm font-semibold text-slate-900 bg-slate-50">Action</td>
                          {quotations.map(q => (
                            <td key={q._id} className="px-6 py-4 text-center border-l border-slate-200">
                              <div className="flex flex-col gap-2">
                                <Link 
                                  to={`/customer/requests/${id}/quotations/${q._id}`}
                                  className="w-full text-center px-4 py-2 border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 text-sm font-bold transition-colors"
                                >
                                  View Details
                                </Link>
                                {request.status === 'QUOTATIONS_RECEIVED' && q.status === 'SUBMITTED' && (
                                  <Button 
                                    onClick={() => handleAcceptQuotation(q._id)}
                                    disabled={processing}
                                    isLoading={processing}
                                    className="w-full"
                                  >
                                    Accept Quote
                                  </Button>
                                )}
                              </div>
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {quotations.map((quotation) => (
                    <Card key={quotation._id} className={`flex flex-col h-full hover:shadow-md transition-all ${
                      quotation.status === 'ACCEPTED' ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500' : ''
                    }`}>
                      <CardContent className="p-5 flex flex-col h-full">
                        <div className="flex justify-between items-start mb-4 border-b border-slate-100 pb-4">
                          <div>
                            <h4 className="font-bold text-slate-900 text-lg leading-tight">
                              {quotation.pharmacyId?.name || quotation.pharmacyId?.businessName || 'Pharmacy'}
                            </h4>
                            <p className="text-xs font-medium text-slate-500 mt-1">
                              {quotation.pharmacyId?.address?.city || 'Location Unknown'} • {quotation.preparationMinutes}m prep
                            </p>
                          </div>
                          <StatusBadge status={quotation.status} />
                        </div>
                        
                        <div className="space-y-3 mb-6 flex-1">
                          <div className="flex justify-between text-sm items-center">
                            <span className="text-slate-500 font-medium">Items Available:</span>
                            <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                              {quotation.items?.filter(i => i.availabilityResult === 'FULL' || i.availabilityResult === 'PARTIAL').length || 0} / {request.items.length}
                            </span>
                          </div>
                          {quotation.deliveryAvailable && (
                            <div className="flex justify-between text-sm items-center">
                              <span className="text-slate-500 font-medium">Delivery Fee:</span>
                              <span className="font-bold text-slate-900">
                                Rs. {quotation.deliveryFee?.toFixed(2)}
                              </span>
                            </div>
                          )}
                          {!quotation.deliveryAvailable && quotation.pickupAvailable && (
                            <div className="flex justify-between text-sm items-center">
                              <span className="text-slate-500 font-medium">Fulfillment:</span>
                              <span className="font-bold text-slate-900">
                                Pickup Only
                              </span>
                            </div>
                          )}
                          
                          {quotation.substitutionsOffered > 0 && (
                            <div className="text-xs bg-amber-50 text-amber-800 px-2 py-1.5 rounded-md border border-amber-100 font-medium">
                              Includes {quotation.substitutionsOffered} substituted {quotation.substitutionsOffered === 1 ? 'medicine' : 'medicines'}
                            </div>
                          )}
                        </div>

                        <div className="border-t border-slate-100 pt-4 flex flex-col gap-4 mt-auto">
                          <div className="flex justify-between items-center bg-primary-50 rounded-lg px-4 py-3">
                            <span className="text-primary-700 font-medium text-sm">Total Price</span>
                            <span className="font-black text-xl text-primary-700">Rs. {quotation.total?.toFixed(2) || '0.00'}</span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3 mt-1">
                            <Link 
                              to={`/customer/requests/${id}/quotations/${quotation._id}`}
                              className="text-center px-4 py-2.5 border-2 border-primary-600 text-primary-600 rounded-xl hover:bg-primary-50 text-sm font-bold transition-colors"
                            >
                              View Details
                            </Link>
                            {request.status === 'QUOTATIONS_RECEIVED' && quotation.status === 'SUBMITTED' && (
                              <Button 
                                onClick={() => handleAcceptQuotation(quotation._id)}
                                disabled={processing}
                                isLoading={processing}
                                className="w-full"
                              >
                                Accept
                              </Button>
                            )}
                            {quotation.status === 'ACCEPTED' && (
                              <div className="px-4 py-2.5 bg-emerald-100 text-emerald-800 rounded-xl text-sm font-bold flex items-center justify-center border border-emerald-200">
                                Accepted
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                )
              ) : (
                <EmptyState 
                  icon={Search}
                  title="Waiting for Quotations"
                  description="Pharmacies are currently reviewing your request. Quotations will appear here once they respond."
                />
              )}
            </div>
          )}
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
};

export default RequestDetailsPage;
