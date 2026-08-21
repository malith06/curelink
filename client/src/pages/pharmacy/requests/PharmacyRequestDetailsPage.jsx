import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, Send, Save, AlertCircle, FileText, Package, Clock, Truck, Store } from 'lucide-react';
import { toast } from 'react-toastify';
import requestService from '../../../features/requests/requestService';
import quotationService from '../../../features/quotations/quotationService';
import { QUOTATION_STATUS } from '../../../constants/quotation';
import { Card, CardContent, CardHeader } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Skeleton from '../../../components/ui/Skeleton';
import Badge from '../../../components/ui/Badge';
import Input from '../../../components/ui/Input';

const PharmacyRequestDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [request, setRequest] = useState(null);
  const [quotation, setQuotation] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Editable Draft State
  const [draftItems, setDraftItems] = useState({});
  const [draftMeta, setDraftMeta] = useState({
    deliveryFee: 0,
    preparationMinutes: 30,
    deliveryAvailable: false,
    pickupAvailable: true,
    pharmacyNotes: ''
  });

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const reqRes = await requestService.getRequestById(id);
      setRequest(reqRes.data);

      if (['SUBMITTED', 'QUOTATIONS_RECEIVED', 'QUOTATION_ACCEPTED', 'CONVERTED_TO_ORDER'].includes(reqRes.data.status)) {
        // Try to get or create draft
        const qRes = await quotationService.getOrCreateDraft(id);
        setQuotation(qRes.data);
        
        // Initialize state from quotation
        const initialItems = {};
        qRes.data.items.forEach(item => {
          initialItems[item.requestItemId] = {
            availableQuantity: item.availableQuantity,
            unitPrice: item.unitPrice || 0,
            substitutionOffered: item.substitutionOffered,
            substitutionMedicineId: item.substitutionMedicineId,
            substitutionNote: item.substitutionNote || '',
            pharmacyItemNote: item.pharmacyItemNote || ''
          };
        });
        setDraftItems(initialItems);
        setDraftMeta({
          deliveryFee: qRes.data.deliveryFee || 0,
          preparationMinutes: qRes.data.preparationMinutes || 30,
          deliveryAvailable: qRes.data.deliveryAvailable || false,
          pickupAvailable: qRes.data.pickupAvailable ?? true,
          pharmacyNotes: qRes.data.pharmacyNotes || ''
        });
      }
    } catch (err) {
      toast.error('Failed to load details');
      navigate('/pharmacy/inbox');
    } finally {
      setLoading(false);
    }
  };

  const handleItemChange = (requestItemId, field, value) => {
    setDraftItems(prev => ({
      ...prev,
      [requestItemId]: {
        ...prev[requestItemId],
        [field]: value
      }
    }));
  };

  const handleMetaChange = (field, value) => {
    setDraftMeta(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveDraft = async () => {
    try {
      setSaving(true);
      
      const itemsArray = Object.keys(draftItems).map(requestItemId => ({
        requestItemId,
        ...draftItems[requestItemId]
      }));

      const updateData = {
        items: itemsArray,
        ...draftMeta
      };

      const res = await quotationService.updateDraft(quotation._id, updateData);
      setQuotation(res.data);
      toast.success('Draft saved successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save draft');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitQuotation = async () => {
    try {
      if (!window.confirm("Are you sure you want to submit this quotation? You cannot edit it once submitted.")) {
        return;
      }
      
      setSubmitting(true);
      
      // Auto-save draft before submitting
      const itemsArray = Object.keys(draftItems).map(requestItemId => ({
        requestItemId,
        ...draftItems[requestItemId]
      }));

      await quotationService.updateDraft(quotation._id, { items: itemsArray, ...draftMeta });
      
      // Submit
      const res = await quotationService.submitQuotation(quotation._id);
      setQuotation(res.data);
      toast.success('Quotation submitted successfully!');
      fetchData(); // Refresh everything
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit quotation');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        <Skeleton className="h-6 w-32 mb-6" />
        <Card>
          <CardContent className="p-8 space-y-6">
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-4 w-1/4" />
            <div className="mt-8 space-y-4">
               {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!request) return null;

  const isDraft = quotation && quotation.status === QUOTATION_STATUS.DRAFT;
  const isSubmitted = quotation && quotation.status !== QUOTATION_STATUS.DRAFT;

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'ACCEPTED':
        return <Badge variant="success">Quote: {status}</Badge>;
      case 'DECLINED':
        return <Badge variant="error">Quote: {status}</Badge>;
      case 'SUBMITTED':
        return <Badge variant="info">Quote: {status}</Badge>;
      default:
        return <Badge variant="default">Quote: {status}</Badge>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center space-x-4 mb-2">
        <button
          onClick={() => navigate('/pharmacy/inbox')}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600 group-hover:-translate-x-1 transition-transform" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Review Request</h1>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="p-6 md:p-8 bg-slate-50 border-b border-slate-100 flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-3">
              <h2 className="text-xl font-bold text-slate-900">Request #{request._id.substring(request._id.length - 6).toUpperCase()}</h2>
              <Badge variant="default">{request.status.replace(/_/g, ' ')}</Badge>
            </div>
            <p className="text-slate-500 font-medium flex items-center">
              <Clock className="w-4 h-4 mr-1.5" />
              Received {new Date(request.createdAt).toLocaleString()}
            </p>
          </div>
          {quotation && (
            <div>
              {renderStatusBadge(quotation.status)}
            </div>
          )}
        </div>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-white">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Medicine</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Req Qty</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Avail Qty</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Unit Price (Rs)</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Subtotal (Rs)</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {quotation?.items.map((qItem) => {
                  const reqItem = request.items.find(i => i._id === qItem.requestItemId);
                  const isEditing = isDraft;
                  
                  return (
                    <tr key={qItem._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-5">
                        <div className="font-bold text-slate-900 text-sm">
                          {qItem.medicineSnapshot?.genericName || reqItem?.medicineId?.genericName || 'Medicine'}
                        </div>
                        {reqItem?.prescriptionRequired && (
                          <div className="mt-1.5">
                             <Badge variant="error" className="text-[10px]">Prescription Required</Badge>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-5 text-center font-bold text-slate-700">
                        {qItem.requestedQuantity}
                      </td>
                      
                      {/* Available Quantity */}
                      <td className="px-6 py-5 text-center">
                        {isEditing ? (
                          <input 
                            type="number" 
                            min="0"
                            max={qItem.requestedQuantity}
                            className="w-20 px-3 py-1.5 text-center font-bold border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                            value={draftItems[qItem.requestItemId]?.availableQuantity ?? ''}
                            onChange={(e) => handleItemChange(qItem.requestItemId, 'availableQuantity', parseInt(e.target.value) || 0)}
                          />
                        ) : (
                          <span className="font-bold text-slate-900">{qItem.availableQuantity}</span>
                        )}
                      </td>

                      {/* Unit Price */}
                      <td className="px-6 py-5 text-right">
                        {isEditing ? (
                          <div className="flex justify-end relative">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 font-medium">Rs</span>
                            <input 
                              type="number" 
                              min="0"
                              step="0.01"
                              className="w-28 pl-8 pr-3 py-1.5 text-right font-bold border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                              value={draftItems[qItem.requestItemId]?.unitPrice ?? ''}
                              onChange={(e) => handleItemChange(qItem.requestItemId, 'unitPrice', parseFloat(e.target.value) || 0)}
                              placeholder="0.00"
                            />
                          </div>
                        ) : (
                          <span className="font-medium text-slate-700">{qItem.unitPrice?.toFixed(2) || '0.00'}</span>
                        )}
                      </td>
                      
                      {/* Subtotal */}
                      <td className="px-6 py-5 text-right font-bold text-primary-600 text-lg">
                        {isEditing ? (
                          <span>{((draftItems[qItem.requestItemId]?.availableQuantity || 0) * (draftItems[qItem.requestItemId]?.unitPrice || 0)).toFixed(2)}</span>
                        ) : (
                          <span>{qItem.subtotal?.toFixed(2) || '0.00'}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Quotation Metadata */}
      {quotation && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <h4 className="font-bold text-slate-900 flex items-center text-lg">
                <Truck className="w-5 h-5 mr-2 text-primary-500" />
                Fulfillment Details
              </h4>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className={`flex items-start p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    (isDraft ? draftMeta.pickupAvailable : quotation.pickupAvailable) 
                      ? 'border-primary-600 bg-primary-50 ring-2 ring-primary-500/10' 
                      : 'border-slate-200 hover:border-primary-300'
                  }`}>
                  <div className="flex items-center h-5">
                    <input 
                      type="checkbox" 
                      disabled={!isDraft}
                      checked={isDraft ? draftMeta.pickupAvailable : quotation.pickupAvailable}
                      onChange={(e) => handleMetaChange('pickupAvailable', e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-600"
                    />
                  </div>
                  <div className="ml-3">
                    <span className="block font-bold text-slate-900">Pickup</span>
                    <span className="block text-xs text-slate-500 font-medium">Customer picks up</span>
                  </div>
                </label>

                <label className={`flex items-start p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    (isDraft ? draftMeta.deliveryAvailable : quotation.deliveryAvailable) 
                      ? 'border-primary-600 bg-primary-50 ring-2 ring-primary-500/10' 
                      : 'border-slate-200 hover:border-primary-300'
                  }`}>
                  <div className="flex items-center h-5">
                    <input 
                      type="checkbox" 
                      disabled={!isDraft}
                      checked={isDraft ? draftMeta.deliveryAvailable : quotation.deliveryAvailable}
                      onChange={(e) => handleMetaChange('deliveryAvailable', e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-600"
                    />
                  </div>
                  <div className="ml-3">
                    <span className="block font-bold text-slate-900">Delivery</span>
                    <span className="block text-xs text-slate-500 font-medium">Deliver to address</span>
                  </div>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {(isDraft ? draftMeta.deliveryAvailable : quotation.deliveryAvailable) && (
                  <div className="space-y-1.5">
                    <label className="block text-sm font-bold text-slate-700">Delivery Fee (Rs)</label>
                    {isDraft ? (
                      <Input 
                        type="number"
                        min="0"
                        step="0.01"
                        value={draftMeta.deliveryFee}
                        onChange={(e) => handleMetaChange('deliveryFee', parseFloat(e.target.value) || 0)}
                      />
                    ) : (
                      <div className="font-bold text-slate-900 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                        Rs. {quotation.deliveryFee?.toFixed(2)}
                      </div>
                    )}
                  </div>
                )}
                
                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-slate-700">Prep Time (Minutes)</label>
                  {isDraft ? (
                    <Input 
                      type="number"
                      min="15"
                      step="5"
                      value={draftMeta.preparationMinutes}
                      onChange={(e) => handleMetaChange('preparationMinutes', parseInt(e.target.value) || 30)}
                    />
                  ) : (
                    <div className="font-bold text-slate-900 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                      {quotation.preparationMinutes} mins
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <h4 className="font-bold text-slate-900 flex items-center text-lg">
                  <FileText className="w-5 h-5 mr-2 text-primary-500" />
                  Notes to Customer
                </h4>
              </CardHeader>
              <CardContent className="p-6">
                {isDraft ? (
                  <textarea 
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all resize-none shadow-sm font-medium"
                    rows="3"
                    value={draftMeta.pharmacyNotes}
                    onChange={(e) => handleMetaChange('pharmacyNotes', e.target.value)}
                    placeholder="Add special instructions, alternative brands, or general information..."
                  />
                ) : (
                  <p className="text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm font-medium leading-relaxed">
                    {quotation.pharmacyNotes || 'No additional notes provided.'}
                  </p>
                )}
              </CardContent>
            </Card>

            {isSubmitted && (
              <Card className="bg-primary-50 border-primary-100 overflow-hidden">
                <CardContent className="p-6">
                  <h4 className="font-bold text-primary-900 mb-4 text-lg">Quotation Summary</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-primary-700/70">Subtotal:</span>
                      <span className="text-primary-900">Rs. {quotation.subtotal?.toFixed(2)}</span>
                    </div>
                    {quotation.deliveryAvailable && (
                      <div className="flex justify-between text-sm font-medium">
                        <span className="text-primary-700/70">Delivery Fee:</span>
                        <span className="text-primary-900">Rs. {quotation.deliveryFee?.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-lg font-black mt-4 pt-4 border-t border-primary-200/50">
                      <span className="text-primary-900">Total:</span>
                      <span className="text-primary-700 text-2xl">Rs. {quotation.total?.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {isDraft && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-start text-amber-700 bg-amber-50 p-4 rounded-xl text-sm border border-amber-100 flex-1">
            <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
            <p className="font-medium leading-relaxed">Submitting this quotation is final. You will not be able to edit the prices or quantities once submitted to the customer.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
            <Button
              onClick={handleSaveDraft}
              disabled={saving || submitting}
              isLoading={saving}
              variant="outline"
              icon={Save}
              size="lg"
            >
              Save Draft
            </Button>
            
            <Button 
              onClick={handleSubmitQuotation}
              disabled={saving || submitting}
              isLoading={submitting}
              icon={Send}
              size="lg"
            >
              Submit Quotation
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PharmacyRequestDetailsPage;
