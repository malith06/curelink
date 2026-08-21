import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CreditCard, Banknote, ShieldCheck } from 'lucide-react';
import { toast } from 'react-toastify';
import orderService from '../../../features/orders/orderService';
import { ORDER_STATUS, FULFILMENT_METHOD } from '../../../features/orders/orderConstants';
import { Card, CardContent } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Skeleton from '../../../components/ui/Skeleton';

const PaymentSelectionPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await orderService.getOrderById(orderId);
        const orderData = res.data?.order || res.data;
        
        // Ensure order is in pending payment state
        if (orderData.orderStatus !== ORDER_STATUS.PENDING_PAYMENT) {
          toast.info('Payment has already been processed for this order.');
          navigate('/customer/orders');
          return;
        }

        setOrder(orderData);
      } catch (error) {
        toast.error('Failed to load order details');
        navigate('/customer/orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId, navigate]);

  const handlePaymentSubmit = async () => {
    if (!selectedMethod) {
      toast.error('Please select a payment method');
      return;
    }

    setProcessing(true);

    try {
      if (selectedMethod === 'CARD') {
        const res = await orderService.createCardSession(orderId);
        // Redirect to Stripe Sandbox Checkout
        window.location.href = res.data.checkoutUrl;
      } else if (selectedMethod === 'COD') {
        await orderService.selectCOD(orderId);
        toast.success('Cash on Delivery selected successfully!');
        navigate(`/customer/orders/${orderId}/payment/success?method=cod`);
      }
    } catch (error) {
      console.error('Payment error', error);
      toast.error(error.response?.data?.message || 'Failed to process payment choice');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto px-4 py-12 max-w-3xl">
        <Skeleton className="h-10 w-64 mx-auto mb-2" />
        <Skeleton className="h-5 w-96 mx-auto mb-8" />
        <Card>
          <CardContent className="p-6 space-y-4">
             <Skeleton className="h-20 w-full" />
             <Skeleton className="h-24 w-full" />
             <Skeleton className="h-24 w-full" />
             <Skeleton className="h-14 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!order) return null;

  const isCODAllowed = order.pharmacySnapshot?.codAvailable !== false; // Assuming default true

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Select Payment Method</h1>
        <p className="text-slate-600 mt-2 font-medium">Choose how you want to pay for Order #{order.orderNumber || order._id.substring(order._id.length - 6).toUpperCase()}</p>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-8">
          <div className="flex justify-between items-center mb-8 pb-6 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Amount to Pay</h2>
              <p className="text-sm text-slate-500 font-medium">Includes delivery and taxes</p>
            </div>
            <div className="text-3xl font-black text-primary-600">
              Rs. {(order.total / 100).toFixed(2)}
            </div>
          </div>

          <div className="space-y-4">
            {/* Card Payment Option */}
            <button
              type="button"
              onClick={() => setSelectedMethod('CARD')}
              className={`w-full flex items-center p-5 rounded-2xl border-2 transition-all group ${
                selectedMethod === 'CARD'
                  ? 'border-primary-600 bg-primary-50 ring-4 ring-primary-500/10'
                  : 'border-slate-200 hover:border-primary-300 hover:bg-slate-50'
              }`}
            >
              <div className={`p-4 rounded-full transition-colors ${selectedMethod === 'CARD' ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-primary-50 group-hover:text-primary-500'}`}>
                <CreditCard className="w-6 h-6" />
              </div>
              <div className="ml-5 text-left flex-1">
                <h3 className="font-bold text-slate-900 text-lg">Pay by Card (Secure Checkout)</h3>
                <p className="text-sm text-slate-500 font-medium">Visa, Mastercard, AMEX powered by Stripe</p>
              </div>
              <ShieldCheck className={`w-8 h-8 ${selectedMethod === 'CARD' ? 'text-primary-600' : 'text-slate-300 group-hover:text-primary-300'}`} />
            </button>

            {/* Cash on Delivery Option */}
            <button
              type="button"
              onClick={() => setSelectedMethod('COD')}
              disabled={!isCODAllowed}
              className={`w-full flex items-center p-5 rounded-2xl border-2 transition-all group ${
                !isCODAllowed ? 'opacity-50 cursor-not-allowed bg-slate-50 border-slate-200' :
                selectedMethod === 'COD'
                  ? 'border-primary-600 bg-primary-50 ring-4 ring-primary-500/10'
                  : 'border-slate-200 hover:border-primary-300 hover:bg-slate-50'
              }`}
            >
              <div className={`p-4 rounded-full transition-colors ${selectedMethod === 'COD' ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-primary-50 group-hover:text-primary-500'}`}>
                <Banknote className="w-6 h-6" />
              </div>
              <div className="ml-5 text-left flex-1">
                <h3 className="font-bold text-slate-900 text-lg">Cash on Delivery (COD)</h3>
                <p className="text-sm text-slate-500 font-medium">
                  {isCODAllowed 
                    ? order.fulfilmentMethod === FULFILMENT_METHOD.DELIVERY ? 'Pay cash to the rider upon delivery' : 'Pay at the pharmacy counter upon pickup'
                    : 'Cash on delivery is not supported by this pharmacy'}
                </p>
              </div>
            </button>
          </div>

          <div className="mt-10">
            <Button
              onClick={handlePaymentSubmit}
              disabled={!selectedMethod || processing}
              isLoading={processing}
              size="lg"
              fullWidth
            >
              Continue with {selectedMethod === 'CARD' ? 'Card' : selectedMethod === 'COD' ? 'Cash' : 'Payment'}
            </Button>
          </div>
          
          {selectedMethod === 'CARD' && (
            <p className="text-xs text-center text-slate-500 mt-5 flex items-center justify-center font-medium bg-slate-50 p-2 rounded-lg">
              <ShieldCheck className="w-4 h-4 mr-1.5 text-emerald-600" />
              Payments are secured and encrypted by Stripe Sandbox.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSelectionPage;
