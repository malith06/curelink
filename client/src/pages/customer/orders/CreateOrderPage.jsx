import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Package, Check, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import orderService from '../../../features/orders/orderService';
import { FULFILMENT_METHOD } from '../../../features/orders/orderConstants';

const CreateOrderPage = () => {
  const { quotationId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // If we navigated here from quotation acceptance, we might have the data in state
  const { quotation } = location.state || {};

  const [fulfilmentMethod, setFulfilmentMethod] = useState(FULFILMENT_METHOD.DELIVERY);
  const [deliveryAddress, setDeliveryAddress] = useState({
    fullName: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    district: '',
    postalCode: '',
    country: 'Sri Lanka'
  });
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Minimal subtotal calculation for display (backend does actual math)
  const calculateDisplaySubtotal = () => {
    if (!quotation || !quotation.items) return 0;
    return quotation.items.reduce((sum, item) => {
      const q = (item.availabilityResult === 'AVAILABLE' || item.availabilityResult === 'SUBSTITUTION_OFFERED') ? item.quantity : 0;
      return sum + (q * item.unitPrice);
    }, 0);
  };

  const displaySubtotal = calculateDisplaySubtotal();
  const deliveryFee = fulfilmentMethod === FULFILMENT_METHOD.DELIVERY ? 50000 : 0;
  const displayTotal = displaySubtotal + deliveryFee;

  const handleInputChange = (e) => {
    setDeliveryAddress({
      ...deliveryAddress,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        fulfilmentMethod,
        deliveryInstructions
      };

      if (fulfilmentMethod === FULFILMENT_METHOD.DELIVERY) {
        payload.deliveryAddress = deliveryAddress;
      }

      const response = await orderService.createOrderFromQuotation(quotationId, payload);
      toast.success('Order created successfully!');
      // Navigate to payment selection page
      navigate(`/customer/orders/${response.data.order._id}/payment`);
    } catch (error) {
      console.error('Order creation failed', error);
      toast.error(error.response?.data?.message || 'Failed to create order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Complete Your Order</h1>
          <p className="text-slate-500">Choose fulfilment and confirm details</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-semibold mb-4">Fulfilment Method</h2>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFulfilmentMethod(FULFILMENT_METHOD.DELIVERY)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  fulfilmentMethod === FULFILMENT_METHOD.DELIVERY
                    ? 'border-indigo-600 bg-indigo-50/50'
                    : 'border-slate-100 hover:border-slate-200'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <MapPin className={`w-5 h-5 ${fulfilmentMethod === FULFILMENT_METHOD.DELIVERY ? 'text-indigo-600' : 'text-slate-400'}`} />
                  {fulfilmentMethod === FULFILMENT_METHOD.DELIVERY && <Check className="w-5 h-5 text-indigo-600" />}
                </div>
                <div className="font-medium text-slate-900">Delivery</div>
                <div className="text-sm text-slate-500 mt-1">Get it delivered to your address</div>
              </button>
              
              <button
                type="button"
                onClick={() => setFulfilmentMethod(FULFILMENT_METHOD.PICKUP)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  fulfilmentMethod === FULFILMENT_METHOD.PICKUP
                    ? 'border-indigo-600 bg-indigo-50/50'
                    : 'border-slate-100 hover:border-slate-200'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <Package className={`w-5 h-5 ${fulfilmentMethod === FULFILMENT_METHOD.PICKUP ? 'text-indigo-600' : 'text-slate-400'}`} />
                  {fulfilmentMethod === FULFILMENT_METHOD.PICKUP && <Check className="w-5 h-5 text-indigo-600" />}
                </div>
                <div className="font-medium text-slate-900">Pickup</div>
                <div className="text-sm text-slate-500 mt-1">Collect from the pharmacy directly</div>
              </button>
            </div>
          </div>

          {fulfilmentMethod === FULFILMENT_METHOD.DELIVERY && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
              <h2 className="text-lg font-semibold mb-4">Delivery Address</h2>
              <form id="orderForm" onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                    <input
                      required
                      type="text"
                      name="fullName"
                      value={deliveryAddress.fullName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                    <input
                      required
                      type="text"
                      name="phone"
                      value={deliveryAddress.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Address Line 1</label>
                  <input
                    required
                    type="text"
                    name="line1"
                    value={deliveryAddress.line1}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Address Line 2 (Optional)</label>
                  <input
                    type="text"
                    name="line2"
                    value={deliveryAddress.line2}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                    <input
                      required
                      type="text"
                      name="city"
                      value={deliveryAddress.city}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">District</label>
                    <input
                      required
                      type="text"
                      name="district"
                      value={deliveryAddress.district}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Delivery Instructions (Optional)</label>
                  <textarea
                    name="deliveryInstructions"
                    value={deliveryInstructions}
                    onChange={(e) => setDeliveryInstructions(e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
              </form>
            </div>
          )}
          
          {fulfilmentMethod === FULFILMENT_METHOD.PICKUP && (
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start gap-4">
               <AlertCircle className="w-6 h-6 text-indigo-500 flex-shrink-0" />
               <div>
                 <h3 className="font-medium text-slate-900">Pickup Instructions</h3>
                 <p className="text-slate-500 text-sm mt-1">
                   You will receive an email and notification when your order is ready for pickup. Please pay at the pharmacy counter.
                 </p>
               </div>
             </div>
          )}
        </div>

        <div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 sticky top-24">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            
            <div className="space-y-3 text-sm text-slate-600 mb-6">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium text-slate-900">Rs. {(displaySubtotal / 100).toFixed(2)}</span>
              </div>
              {fulfilmentMethod === FULFILMENT_METHOD.DELIVERY && (
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span className="font-medium text-slate-900">Rs. {(deliveryFee / 100).toFixed(2)}</span>
                </div>
              )}
              <div className="pt-3 border-t border-slate-100 flex justify-between font-semibold text-base text-slate-900">
                <span>Total</span>
                <span>Rs. {(displayTotal / 100).toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-100 transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Place Order'
              )}
            </button>
            <p className="text-xs text-center text-slate-500 mt-4">
              By placing this order, you agree to the pharmacy's terms of service. You will pay later.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateOrderPage;
