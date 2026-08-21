import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, MapPin, Package, Check, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import orderService from '../../../features/orders/orderService';
import { FULFILMENT_METHOD } from '../../../features/orders/orderConstants';
import { Card, CardContent } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

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
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600 group-hover:-translate-x-1 transition-transform" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Complete Your Order</h1>
          <p className="text-slate-500 mt-1">Choose fulfilment and confirm details</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardContent className="p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Fulfilment Method</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFulfilmentMethod(FULFILMENT_METHOD.DELIVERY)}
                  className={`p-5 rounded-2xl border-2 text-left transition-all relative overflow-hidden group ${
                    fulfilmentMethod === FULFILMENT_METHOD.DELIVERY
                      ? 'border-primary-600 bg-primary-50 ring-4 ring-primary-500/10'
                      : 'border-slate-200 hover:border-primary-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className={`p-3 rounded-xl ${fulfilmentMethod === FULFILMENT_METHOD.DELIVERY ? 'bg-primary-100 text-primary-700' : 'bg-slate-100 text-slate-500 group-hover:bg-primary-50 group-hover:text-primary-500 transition-colors'}`}>
                      <MapPin className="w-6 h-6" />
                    </div>
                    {fulfilmentMethod === FULFILMENT_METHOD.DELIVERY && <Check className="w-6 h-6 text-primary-600" />}
                  </div>
                  <div className="font-bold text-slate-900 text-lg">Delivery</div>
                  <div className="text-sm text-slate-500 mt-1 font-medium">Get it delivered to your address</div>
                </button>
                
                <button
                  type="button"
                  onClick={() => setFulfilmentMethod(FULFILMENT_METHOD.PICKUP)}
                  className={`p-5 rounded-2xl border-2 text-left transition-all relative overflow-hidden group ${
                    fulfilmentMethod === FULFILMENT_METHOD.PICKUP
                      ? 'border-primary-600 bg-primary-50 ring-4 ring-primary-500/10'
                      : 'border-slate-200 hover:border-primary-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className={`p-3 rounded-xl ${fulfilmentMethod === FULFILMENT_METHOD.PICKUP ? 'bg-primary-100 text-primary-700' : 'bg-slate-100 text-slate-500 group-hover:bg-primary-50 group-hover:text-primary-500 transition-colors'}`}>
                      <Package className="w-6 h-6" />
                    </div>
                    {fulfilmentMethod === FULFILMENT_METHOD.PICKUP && <Check className="w-6 h-6 text-primary-600" />}
                  </div>
                  <div className="font-bold text-slate-900 text-lg">Pickup</div>
                  <div className="text-sm text-slate-500 mt-1 font-medium">Collect from the pharmacy directly</div>
                </button>
              </div>
            </CardContent>
          </Card>

          {fulfilmentMethod === FULFILMENT_METHOD.DELIVERY && (
            <Card className="animate-in fade-in zoom-in-95 duration-300">
              <CardContent className="p-8">
                <h2 className="text-xl font-bold text-slate-900 mb-6">Delivery Address</h2>
                <form id="orderForm" onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-slate-700">Full Name</label>
                      <Input
                        required
                        type="text"
                        name="fullName"
                        value={deliveryAddress.fullName}
                        onChange={handleInputChange}
                        className="w-full"
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-slate-700">Phone Number</label>
                      <Input
                        required
                        type="text"
                        name="phone"
                        value={deliveryAddress.phone}
                        onChange={handleInputChange}
                        className="w-full"
                        placeholder="+94 77 123 4567"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-slate-700">Address Line 1</label>
                    <Input
                      required
                      type="text"
                      name="line1"
                      value={deliveryAddress.line1}
                      onChange={handleInputChange}
                      className="w-full"
                      placeholder="123 Main St"
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-slate-700">Address Line 2 (Optional)</label>
                    <Input
                      type="text"
                      name="line2"
                      value={deliveryAddress.line2}
                      onChange={handleInputChange}
                      className="w-full"
                      placeholder="Apartment, suite, etc."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-slate-700">City</label>
                      <Input
                        required
                        type="text"
                        name="city"
                        value={deliveryAddress.city}
                        onChange={handleInputChange}
                        className="w-full"
                        placeholder="Colombo"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-slate-700">District</label>
                      <Input
                        required
                        type="text"
                        name="district"
                        value={deliveryAddress.district}
                        onChange={handleInputChange}
                        className="w-full"
                        placeholder="Colombo"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-slate-700">Delivery Instructions (Optional)</label>
                    <textarea
                      name="deliveryInstructions"
                      value={deliveryInstructions}
                      onChange={(e) => setDeliveryInstructions(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all shadow-sm"
                      placeholder="e.g. Leave at the front door"
                    />
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
          
          {fulfilmentMethod === FULFILMENT_METHOD.PICKUP && (
             <div className="bg-primary-50 p-6 rounded-2xl border border-primary-100 flex items-start gap-4">
               <AlertCircle className="w-6 h-6 text-primary-600 flex-shrink-0 mt-0.5" />
               <div>
                 <h3 className="font-bold text-primary-900 text-lg">Pickup Instructions</h3>
                 <p className="text-primary-700/80 text-sm mt-2 leading-relaxed">
                   You will receive an email and notification when your order is ready for pickup. Please pay at the pharmacy counter.
                 </p>
               </div>
             </div>
          )}
        </div>

        <div>
          <Card className="sticky top-24">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Order Summary</h2>
              
              <div className="space-y-4 text-sm text-slate-600 mb-8">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Subtotal</span>
                  <span className="font-semibold text-slate-900">Rs. {(displaySubtotal / 100).toFixed(2)}</span>
                </div>
                {fulfilmentMethod === FULFILMENT_METHOD.DELIVERY && (
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Delivery Fee</span>
                    <span className="font-semibold text-slate-900">Rs. {(deliveryFee / 100).toFixed(2)}</span>
                  </div>
                )}
                <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                  <span className="font-bold text-slate-900 text-base">Total</span>
                  <span className="font-black text-primary-600 text-xl">Rs. {(displayTotal / 100).toFixed(2)}</span>
                </div>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={submitting}
                isLoading={submitting}
                size="lg"
                fullWidth
              >
                Place Order
              </Button>
              <p className="text-xs text-center text-slate-500 mt-5 leading-relaxed font-medium">
                By placing this order, you agree to the pharmacy's terms of service. You will pay later.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateOrderPage;
