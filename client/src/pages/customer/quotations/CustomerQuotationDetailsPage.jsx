import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, Check, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import requestService from '../../../features/requests/requestService';
import quotationService from '../../../features/quotations/quotationService';

const CustomerQuotationDetailsPage = () => {
  const { id: requestId, quotationId } = useParams();
  const navigate = useNavigate();
  
  const [request, setRequest] = useState(null);
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchData();
  }, [requestId, quotationId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [reqRes, quoteRes] = await Promise.all([
        requestService.getRequestById(requestId),
        quotationService.getCustomerQuotationDetails(requestId, quotationId)
      ]);
      setRequest(reqRes.data);
      setQuotation(quoteRes.data);
    } catch (error) {
      toast.error('Failed to load quotation details');
      navigate(`/customer/requests/${requestId}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptQuotation = async () => {
    try {
      setProcessing(true);
      await quotationService.acceptQuotation(requestId, quotationId);
      toast.success('Quotation accepted!');
      
      // Auto-trigger payment for demonstration
      await requestService.processPayment(requestId);
      toast.success('Payment processed successfully!');
      
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to accept quotation');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!request || !quotation) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Link to={`/customer/requests/${requestId}`} className="text-primary hover:text-primary-800 flex items-center text-sm font-medium">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Request
        </Link>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{quotation.pharmacyId?.businessName}</h1>
            <p className="text-gray-500 text-sm mt-1">
              Quotation for Request #{request._id.substring(request._id.length - 6).toUpperCase()}
            </p>
          </div>
          <span className={`px-4 py-1.5 rounded-full text-sm font-medium border ${
            quotation.status === 'ACCEPTED' ? 'bg-green-100 text-green-800 border-green-200' :
            quotation.status === 'DECLINED' ? 'bg-red-100 text-red-800 border-red-200' :
            'bg-blue-100 text-blue-800 border-blue-200'
          }`}>
            {quotation.status}
          </span>
        </div>

        <div className="p-6">
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Item Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 border rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Medicine</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Requested</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Available</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Price (Rs)</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total (Rs)</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {quotation.items.map((item) => {
                    const reqItem = request.items.find(i => i._id === item.requestItemId);
                    const isSubstitute = item.substitutionOffered;
                    return (
                      <tr key={item._id} className={item.availabilityResult === 'NONE' ? 'bg-red-50 opacity-75' : ''}>
                        <td className="px-4 py-4">
                          <div className="font-medium text-gray-900 line-clamp-1">
                            {isSubstitute && item.substitutionSnapshot ? (
                              <span className="text-amber-700 flex items-center">
                                <AlertCircle className="w-4 h-4 mr-1 inline" /> 
                                {item.substitutionSnapshot.genericName}
                                <span className="ml-2 text-xs bg-amber-100 px-2 py-0.5 rounded text-amber-800">Substitute</span>
                              </span>
                            ) : (
                              reqItem?.medicineId?.genericName || item.medicineSnapshot?.genericName || 'Medicine'
                            )}
                          </div>
                          {isSubstitute && item.substitutionNote && (
                            <p className="text-xs text-gray-500 mt-1">Note: {item.substitutionNote}</p>
                          )}
                          {!isSubstitute && item.pharmacyItemNote && (
                            <p className="text-xs text-gray-500 mt-1">Note: {item.pharmacyItemNote}</p>
                          )}
                        </td>
                        <td className="px-4 py-4 text-center text-gray-600">
                          {item.requestedQuantity}
                        </td>
                        <td className="px-4 py-4 text-center font-medium">
                          {item.availableQuantity}
                        </td>
                        <td className="px-4 py-4 text-right text-gray-600">
                          {item.unitPrice ? item.unitPrice.toFixed(2) : '-'}
                        </td>
                        <td className="px-4 py-4 text-right font-medium text-gray-900">
                          {item.subtotal ? item.subtotal.toFixed(2) : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-4">Fulfillment Details</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex justify-between">
                  <span className="text-gray-600">Preparation Time:</span>
                  <span className="font-medium text-gray-900">{quotation.preparationMinutes} minutes</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-600">Pickup Available:</span>
                  <span className="font-medium text-gray-900">{quotation.pickupAvailable ? 'Yes' : 'No'}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-600">Delivery Available:</span>
                  <span className="font-medium text-gray-900">{quotation.deliveryAvailable ? 'Yes' : 'No'}</span>
                </li>
                {quotation.deliveryAvailable && (
                  <li className="flex justify-between border-t border-gray-200 pt-3">
                    <span className="text-gray-600">Delivery Fee:</span>
                    <span className="font-medium text-gray-900">Rs. {quotation.deliveryFee?.toFixed(2)}</span>
                  </li>
                )}
              </ul>
              
              {quotation.pharmacyNotes && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <span className="block text-gray-600 text-sm mb-1">Pharmacy Note:</span>
                  <p className="text-sm text-gray-900">{quotation.pharmacyNotes}</p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm flex flex-col justify-between">
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Pricing Summary</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Items Subtotal:</span>
                    <span className="font-medium">Rs. {quotation.subtotal?.toFixed(2)}</span>
                  </div>
                  {quotation.deliveryAvailable && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Delivery Fee:</span>
                      <span className="font-medium">Rs. {quotation.deliveryFee?.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-3 border-t border-gray-100 text-lg font-bold">
                    <span>Total Amount:</span>
                    <span className="text-primary">Rs. {quotation.total?.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4">
                {request.status === 'QUOTATIONS_RECEIVED' && quotation.status === 'SUBMITTED' && (
                  <button 
                    onClick={handleAcceptQuotation}
                    disabled={processing}
                    className="w-full px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary-700 font-medium transition-colors flex items-center justify-center disabled:opacity-50 shadow-sm"
                  >
                    {processing ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Check className="w-5 h-5 mr-2" />}
                    Accept & Pay
                  </button>
                )}
                
                {quotation.status === 'ACCEPTED' && request.paymentStatus === 'PAID' && (
                  <div className="w-full px-4 py-3 bg-green-50 text-green-700 rounded-lg font-bold flex items-center justify-center border border-green-200">
                    <Check className="w-5 h-5 mr-2" /> Quotation Accepted & Paid
                  </div>
                )}
                
                {quotation.status === 'DECLINED' && (
                  <div className="w-full px-4 py-3 bg-red-50 text-red-700 rounded-lg font-bold flex items-center justify-center border border-red-200">
                    Quotation Declined
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerQuotationDetailsPage;
