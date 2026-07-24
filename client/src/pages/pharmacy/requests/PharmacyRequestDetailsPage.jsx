import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, Send } from 'lucide-react';
import { toast } from 'react-toastify';
import requestService from '../../../features/requests/requestService';
import { useAuth } from '../../../context/AuthContext';

const PharmacyRequestDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // State for the quotation form
  const [quotationItems, setQuotationItems] = useState({});
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchRequest();
  }, [id]);

  const fetchRequest = async () => {
    try {
      setLoading(true);
      // We can use getRequestById. The backend will return the request if this pharmacy was invited.
      const res = await requestService.getRequestById(id);
      setRequest(res.data);
      
      // Initialize form state
      const initialItems = {};
      res.data.items.forEach(item => {
        initialItems[item.medicineId._id] = {
          price: 0,
          isAvailable: true
        };
      });
      setQuotationItems(initialItems);
    } catch (error) {
      toast.error('Failed to load request details');
      navigate('/pharmacy/inbox');
    } finally {
      setLoading(false);
    }
  };

  const handlePriceChange = (medicineId, value) => {
    setQuotationItems(prev => ({
      ...prev,
      [medicineId]: {
        ...prev[medicineId],
        price: Number(value)
      }
    }));
  };

  const handleAvailabilityChange = (medicineId, isAvailable) => {
    setQuotationItems(prev => ({
      ...prev,
      [medicineId]: {
        ...prev[medicineId],
        isAvailable
      }
    }));
  };

  const handleSubmitQuotation = async () => {
    try {
      setSubmitting(true);
      // Transform our state object into the array expected by the backend
      const itemsArray = Object.keys(quotationItems).map(medicineId => ({
        medicineId,
        price: quotationItems[medicineId].price,
        isAvailable: quotationItems[medicineId].isAvailable
      }));

      await requestService.provideQuotation(id, {
        items: itemsArray,
        notes
      });
      
      toast.success('Quotation submitted successfully');
      fetchRequest();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit quotation');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFulfillmentStatus = async (status) => {
    try {
      setSubmitting(true);
      await requestService.updateFulfillmentStatus(id, status);
      toast.success(`Order marked as ${status}`);
      fetchRequest();
    } catch (error) {
      toast.error('Failed to update status');
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

  // Find if we already submitted a quotation
  const myQuotation = request.quotations?.find(q => q.pharmacyId?._id === user.pharmacyId || q.pharmacyId === user.pharmacyId);
  const isPendingMyQuote = request.status === 'SUBMITTED' && !myQuotation;
  const iWon = myQuotation?.status === 'ACCEPTED';

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-6">
        <Link to="/pharmacy/inbox" className="text-primary hover:text-primary-800 flex items-center text-sm font-medium">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Inbox
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="p-6 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Request #{request._id.substring(request._id.length - 6).toUpperCase()}</h1>
            <p className="text-gray-500 text-sm mt-1">From Customer ID: {request.customerId?._id || 'Unknown'}</p>
          </div>
          <div>
            <span className="px-4 py-1.5 rounded-full text-sm font-bold bg-blue-100 text-blue-800 border border-blue-200">
              {request.status.replace(/_/g, ' ')}
            </span>
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Requested Items</h3>
          <div className="overflow-x-auto mb-8">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Medicine</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prescription?</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  {isPendingMyQuote && (
                    <>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Available?</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Unit Price (Rs)</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {request.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {item.medicineId?.genericName || 'Medicine'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.prescriptionRequired ? (
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Required</span>
                      ) : (
                        <span className="text-xs text-gray-500">No</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center font-bold">
                      {item.quantity}
                    </td>
                    
                    {isPendingMyQuote && quotationItems[item.medicineId._id] && (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <input 
                            type="checkbox" 
                            className="w-5 h-5 text-primary focus:ring-primary border-gray-300 rounded"
                            checked={quotationItems[item.medicineId._id].isAvailable}
                            onChange={(e) => handleAvailabilityChange(item.medicineId._id, e.target.checked)}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <input 
                            type="number" 
                            min="0"
                            step="0.01"
                            disabled={!quotationItems[item.medicineId._id].isAvailable}
                            className="w-24 px-3 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-primary outline-none disabled:bg-gray-100 disabled:opacity-50"
                            value={quotationItems[item.medicineId._id].price || ''}
                            onChange={(e) => handlePriceChange(item.medicineId._id, e.target.value)}
                            placeholder="0.00"
                          />
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Form for Submitting Quotation */}
          {isPendingMyQuote && (
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
              <h4 className="font-semibold text-blue-900 mb-4">Provide Quotation</h4>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes (Optional)</label>
                <textarea 
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary outline-none"
                  rows="3"
                  placeholder="e.g. Generic alternatives available, delivery takes 2 hours..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              <div className="flex justify-end">
                <button 
                  onClick={handleSubmitQuotation}
                  disabled={submitting}
                  className="px-6 py-2 bg-primary text-white font-medium rounded hover:bg-primary-700 flex items-center disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Send className="w-5 h-5 mr-2" />}
                  Send Quotation
                </button>
              </div>
            </div>
          )}

          {/* View Previous Quotation */}
          {myQuotation && (
            <div className={`rounded-xl p-6 border ${iWon ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex justify-between items-center mb-4">
                <h4 className={`font-bold ${iWon ? 'text-green-900' : 'text-gray-900'}`}>Your Quotation Details</h4>
                <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                  myQuotation.status === 'ACCEPTED' ? 'bg-green-200 text-green-800' : 
                  myQuotation.status === 'REJECTED' ? 'bg-red-200 text-red-800' : 
                  'bg-gray-200 text-gray-800'
                }`}>
                  {myQuotation.status}
                </span>
              </div>
              
              <div className="space-y-2 mb-4 text-sm">
                {myQuotation.items.map((qi, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span className="text-gray-600">{qi.medicineId?.genericName || 'Medicine'}</span>
                    <span className="font-medium">{qi.isAvailable ? `Rs. ${qi.price?.toFixed(2)}` : 'Not Available'}</span>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-3 flex justify-between font-bold text-lg">
                <span>Total Offered:</span>
                <span>Rs. {myQuotation.totalPrice?.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Fulfillment controls if accepted & paid */}
          {iWon && request.paymentStatus === 'PAID' && (
            <div className="mt-8 border-t border-gray-200 pt-6">
              <h4 className="font-bold text-gray-900 mb-4">Fulfillment Management</h4>
              <p className="text-sm text-gray-600 mb-4">Customer has paid for this order. Please process and update the status.</p>
              
              <div className="flex gap-4">
                {request.fulfillmentStatus === 'PENDING' && (
                  <button 
                    onClick={() => handleFulfillmentStatus('PROCESSING')}
                    disabled={submitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
                  >
                    Start Processing
                  </button>
                )}
                
                {request.fulfillmentStatus === 'PROCESSING' && (
                  <>
                    <button 
                      onClick={() => handleFulfillmentStatus('READY_FOR_PICKUP')}
                      disabled={submitting}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-medium"
                    >
                      Ready for Pickup
                    </button>
                    <button 
                      onClick={() => handleFulfillmentStatus('DISPATCHED')}
                      disabled={submitting}
                      className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 font-medium"
                    >
                      Dispatched for Delivery
                    </button>
                  </>
                )}
                
                {(request.fulfillmentStatus === 'READY_FOR_PICKUP' || request.fulfillmentStatus === 'DISPATCHED') && request.status !== 'COMPLETED' && (
                  <button 
                    disabled
                    className="px-4 py-2 bg-gray-200 text-gray-600 rounded font-medium cursor-not-allowed"
                  >
                    Waiting for customer to confirm receipt
                  </button>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default PharmacyRequestDetailsPage;
