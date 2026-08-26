import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import requestService from '../../../features/requests/requestService';
import quotationService from '../../../features/quotations/quotationService';
import { Card, CardContent } from '../../../components/ui/Card';
import StatusBadge from '../../../components/ui/StatusBadge';
import Button from '../../../components/ui/Button';
import Skeleton from '../../../components/ui/Skeleton';

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
      toast.success('Quotation accepted! Please proceed to checkout.');
      
      navigate(`/customer/orders/create/${quotationId}`, { state: { quotation } });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to accept quotation');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto px-4 py-12 max-w-4xl">
        <Skeleton className="h-10 w-64 mb-4" />
        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!request || !quotation) return null;

  return (
    <div className="mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Link to={`/customer/requests/${requestId}`} className="text-primary-600 hover:text-primary-800 flex items-center text-sm font-medium w-fit group transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1 transition-transform group-hover:-translate-x-1" /> Back to Request
        </Link>
      </div>
      
      <Card className="mb-8 overflow-hidden border-t-4 border-t-[#0B1354] rounded-2xl shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center p-6 border-b border-slate-100 bg-slate-50 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#0B1354] tracking-tight">{quotation.pharmacyId?.name || quotation.pharmacyId?.businessName || 'Unknown Pharmacy'}</h1>
            <p className="text-slate-500 text-sm mt-1">
              Quotation for Request #{request._id.substring(request._id.length - 6).toUpperCase()}
            </p>
          </div>
          <StatusBadge status={quotation.status} />
        </div>

        <CardContent className="p-6">
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-[#0B1354] mb-4">Item Breakdown</h3>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Medicine</th>
                    <th className="px-4 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Requested</th>
                    <th className="px-4 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Available</th>
                    <th className="px-4 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Price (Rs)</th>
                    <th className="px-4 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Total (Rs)</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {quotation.items.map((item) => {
                    const reqItem = request.items.find(i => i._id === item.requestItemId);
                    const isSubstitute = item.substitutionOffered;
                    return (
                      <tr key={item._id} className={`${item.availabilityResult === 'NONE' ? 'bg-rose-50/50' : 'hover:bg-slate-50 transition-colors'}`}>
                        <td className="px-4 py-4">
                          <div className="font-semibold text-slate-900 line-clamp-1">
                            {isSubstitute && item.substitutionSnapshot ? (
                              <span className="text-amber-700 flex flex-col sm:flex-row sm:items-center gap-1.5">
                                <span className="flex items-center"><AlertCircle className="w-4 h-4 mr-1 inline" /> {item.substitutionSnapshot.name}</span>
                                <span className="text-[10px] uppercase font-bold tracking-wider bg-amber-100 px-2 py-0.5 rounded-md text-amber-800 w-fit">Substitute</span>
                              </span>
                            ) : (
                              reqItem?.medicineId?.name || item.medicineSnapshot?.name || 'Medicine'
                            )}
                          </div>
                          {isSubstitute && item.substitutionNote && (
                            <p className="text-xs text-slate-500 mt-1 font-medium">Note: {item.substitutionNote}</p>
                          )}
                          {!isSubstitute && item.pharmacyItemNote && (
                            <p className="text-xs text-slate-500 mt-1 font-medium">Note: {item.pharmacyItemNote}</p>
                          )}
                        </td>
                        <td className="px-4 py-4 text-center text-slate-600 font-medium">
                          {item.requestedQuantity}
                        </td>
                        <td className="px-4 py-4 text-center font-bold text-slate-900">
                          {item.availableQuantity}
                        </td>
                        <td className="px-4 py-4 text-right text-slate-600 font-medium">
                          {item.unitPrice ? item.unitPrice.toFixed(2) : '-'}
                        </td>
                        <td className="px-4 py-4 text-right font-bold text-primary-700">
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
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
              <h4 className="font-bold text-slate-900 mb-5 text-lg">Fulfillment Details</h4>
              <ul className="space-y-4 text-sm">
                <li className="flex justify-between items-center">
                  <span className="text-slate-600 font-medium">Preparation Time:</span>
                  <span className="font-bold text-slate-900 bg-white px-3 py-1 rounded-lg border border-slate-200">{quotation.preparationMinutes} minutes</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-slate-600 font-medium">Pickup Available:</span>
                  <span className="font-bold text-slate-900 bg-white px-3 py-1 rounded-lg border border-slate-200">{quotation.pickupAvailable ? 'Yes' : 'No'}</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-slate-600 font-medium">Delivery Available:</span>
                  <span className="font-bold text-slate-900 bg-white px-3 py-1 rounded-lg border border-slate-200">{quotation.deliveryAvailable ? 'Yes' : 'No'}</span>
                </li>
                {quotation.deliveryAvailable && (
                  <li className="flex justify-between items-center border-t border-slate-200 pt-4">
                    <span className="text-slate-600 font-medium">Delivery Fee:</span>
                    <span className="font-bold text-slate-900">Rs. {quotation.deliveryFee?.toFixed(2)}</span>
                  </li>
                )}
              </ul>
              
              {quotation.pharmacyNotes && (
                <div className="mt-6 pt-5 border-t border-slate-200">
                  <span className="block text-slate-900 font-semibold text-sm mb-2">Pharmacy Note:</span>
                  <p className="text-sm text-slate-600 bg-white p-3 rounded-xl border border-slate-200 leading-relaxed">{quotation.pharmacyNotes}</p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-slate-900 mb-5 text-lg">Pricing Summary</h4>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 font-medium">Items Subtotal:</span>
                    <span className="font-semibold text-slate-900">Rs. {quotation.subtotal?.toFixed(2)}</span>
                  </div>
                  {quotation.deliveryAvailable && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 font-medium">Delivery Fee:</span>
                      <span className="font-semibold text-slate-900">Rs. {quotation.deliveryFee?.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-4 border-t border-slate-100 bg-primary-50 -mx-6 px-6 pb-2">
                    <span className="font-bold text-primary-900">Total Amount:</span>
                    <span className="text-2xl font-black text-primary-700">Rs. {quotation.total?.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4">
                {request.status === 'QUOTATIONS_RECEIVED' && quotation.status === 'SUBMITTED' && (
                  <Button 
                    onClick={handleAcceptQuotation}
                    disabled={processing}
                    isLoading={processing}
                    icon={Check}
                    size="lg"
                    fullWidth
                  >
                    Accept & Pay
                  </Button>
                )}
                
                {quotation.status === 'ACCEPTED' && request.paymentStatus === 'PAID' && (
                  <div className="w-full px-4 py-3 bg-emerald-50 text-emerald-700 rounded-xl font-bold flex items-center justify-center border border-emerald-200">
                    <Check className="w-5 h-5 mr-2" /> Quotation Accepted & Paid
                  </div>
                )}
                
                {quotation.status === 'DECLINED' && (
                  <div className="w-full px-4 py-3 bg-rose-50 text-rose-700 rounded-xl font-bold flex items-center justify-center border border-rose-200">
                    Quotation Declined
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerQuotationDetailsPage;
