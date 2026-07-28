import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, Send, Save, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import requestService from '../../../features/requests/requestService';
import quotationService from '../../../features/quotations/quotationService';
import { QUOTATION_STATUS, ITEM_AVAILABILITY_STATUS } from '../../../constants/quotation';
import { useAuth } from '../../../context/AuthContext';

const PharmacyRequestDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
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
    } catch (error) {
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
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!request) return null;

  const isDraft = quotation && quotation.status === QUOTATION_STATUS.DRAFT;
  const isSubmitted = quotation && quotation.status !== QUOTATION_STATUS.DRAFT;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-6">
        <Link to="/pharmacy/inbox" className="text-primary hover:text-primary-800 flex items-center text-sm font-medium">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Inbox
        </Link>
      </div>

      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="p-6 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Request #{request._id.substring(request._id.length - 6).toUpperCase()}</h1>
            <p className="text-gray-500 text-sm mt-1">Customer Request Status: {request.status.replace(/_/g, ' ')}</p>
          </div>
          {quotation && (
            <div>
              <span className={`px-4 py-1.5 rounded-full text-sm font-bold border ${
                quotation.status === 'ACCEPTED' ? 'bg-green-100 text-green-800 border-green-200' :
                quotation.status === 'DECLINED' ? 'bg-red-100 text-red-800 border-red-200' :
                quotation.status === 'SUBMITTED' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                'bg-gray-100 text-gray-800 border-gray-200'
              }`}>
                Quote: {quotation.status}
              </span>
            </div>
          )}
        </div>

        {/* Quotation Editor */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quotation Items</h3>
          <div className="overflow-x-auto mb-8">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Medicine</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Req Qty</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Avail Qty</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Unit Price (Rs)</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Subtotal (Rs)</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {quotation?.items.map((qItem) => {
                  const reqItem = request.items.find(i => i._id === qItem.requestItemId);
                  const isEditing = isDraft;
                  
                  return (
                    <tr key={qItem._id}>
                      <td className="px-4 py-4">
                        <div className="font-medium text-gray-900">
                          {qItem.medicineSnapshot?.genericName || reqItem?.medicineId?.genericName || 'Medicine'}
                        </div>
                        {reqItem?.prescriptionRequired && (
                          <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded mt-1 inline-block">Prescription Required</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-center font-bold">
                        {qItem.requestedQuantity}
                      </td>
                      
                      {/* Available Quantity */}
                      <td className="px-4 py-4 text-center">
                        {isEditing ? (
                          <input 
                            type="number" 
                            min="0"
                            max={qItem.requestedQuantity}
                            className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-primary outline-none"
                            value={draftItems[qItem.requestItemId]?.availableQuantity ?? ''}
                            onChange={(e) => handleItemChange(qItem.requestItemId, 'availableQuantity', parseInt(e.target.value) || 0)}
                          />
                        ) : (
                          <span className="font-medium">{qItem.availableQuantity}</span>
                        )}
                      </td>

                      {/* Unit Price */}
                      <td className="px-4 py-4 text-right">
                        {isEditing ? (
                          <input 
                            type="number" 
                            min="0"
                            step="0.01"
                            className="w-24 px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-primary outline-none"
                            value={draftItems[qItem.requestItemId]?.unitPrice ?? ''}
                            onChange={(e) => handleItemChange(qItem.requestItemId, 'unitPrice', parseFloat(e.target.value) || 0)}
                            placeholder="0.00"
                          />
                        ) : (
                          <span>{qItem.unitPrice?.toFixed(2) || '0.00'}</span>
                        )}
                      </td>
                      
                      {/* Subtotal */}
                      <td className="px-4 py-4 text-right font-medium text-gray-900">
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

          {/* Quotation Metadata */}
          {quotation && (
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Fulfillment Details</h4>
                
                <div className="mb-4">
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                    <input 
                      type="checkbox" 
                      disabled={!isDraft}
                      checked={isDraft ? draftMeta.pickupAvailable : quotation.pickupAvailable}
                      onChange={(e) => handleMetaChange('pickupAvailable', e.target.checked)}
                      className="mr-2 rounded text-primary focus:ring-primary"
                    />
                    Pickup Available
                  </label>
                </div>
                
                <div className="mb-4">
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                    <input 
                      type="checkbox" 
                      disabled={!isDraft}
                      checked={isDraft ? draftMeta.deliveryAvailable : quotation.deliveryAvailable}
                      onChange={(e) => handleMetaChange('deliveryAvailable', e.target.checked)}
                      className="mr-2 rounded text-primary focus:ring-primary"
                    />
                    Delivery Available
                  </label>
                </div>

                {(isDraft ? draftMeta.deliveryAvailable : quotation.deliveryAvailable) && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Fee (Rs)</label>
                    {isDraft ? (
                      <input 
                        type="number"
                        min="0"
                        step="0.01"
                        className="w-32 px-3 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-primary outline-none"
                        value={draftMeta.deliveryFee}
                        onChange={(e) => handleMetaChange('deliveryFee', parseFloat(e.target.value) || 0)}
                      />
                    ) : (
                      <div className="font-medium">Rs. {quotation.deliveryFee?.toFixed(2)}</div>
                    )}
                  </div>
                )}
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prep Time (Minutes)</label>
                  {isDraft ? (
                    <input 
                      type="number"
                      min="15"
                      step="5"
                      className="w-32 px-3 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-primary outline-none"
                      value={draftMeta.preparationMinutes}
                      onChange={(e) => handleMetaChange('preparationMinutes', parseInt(e.target.value) || 30)}
                    />
                  ) : (
                    <div className="font-medium">{quotation.preparationMinutes} mins</div>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Notes & Summary</h4>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
                  {isDraft ? (
                    <textarea 
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary outline-none"
                      rows="3"
                      value={draftMeta.pharmacyNotes}
                      onChange={(e) => handleMetaChange('pharmacyNotes', e.target.value)}
                      placeholder="Special instructions or information..."
                    />
                  ) : (
                    <p className="text-gray-600 bg-white p-3 rounded border text-sm">{quotation.pharmacyNotes || 'No notes provided.'}</p>
                  )}
                </div>

                {isSubmitted && (
                  <div className="bg-white p-4 rounded-lg border border-gray-200 mt-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-500">Subtotal:</span>
                      <span className="font-medium">Rs. {quotation.subtotal?.toFixed(2)}</span>
                    </div>
                    {quotation.deliveryAvailable && (
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-500">Delivery Fee:</span>
                        <span className="font-medium">Rs. {quotation.deliveryFee?.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-bold mt-2 pt-2 border-t">
                      <span>Total:</span>
                      <span className="text-primary">Rs. {quotation.total?.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {isDraft && (
            <div className="flex justify-end space-x-4">
              <button 
                onClick={handleSaveDraft}
                disabled={saving || submitting}
                className="px-6 py-2 bg-gray-100 text-gray-700 font-medium rounded hover:bg-gray-200 flex items-center"
              >
                {saving ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
                Save Draft
              </button>
              
              <button 
                onClick={handleSubmitQuotation}
                disabled={saving || submitting}
                className="px-6 py-2 bg-primary text-white font-medium rounded hover:bg-primary-700 flex items-center shadow-sm"
              >
                {submitting ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Send className="w-5 h-5 mr-2" />}
                Submit Quotation
              </button>
            </div>
          )}
          
          {isDraft && (
            <div className="mt-4 flex items-start text-amber-700 bg-amber-50 p-3 rounded-lg text-sm">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
              <p>Submitting this quotation is final. You will not be able to edit the prices or quantities once submitted to the customer.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PharmacyRequestDetailsPage;
