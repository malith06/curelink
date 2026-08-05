import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CreditCard, Banknote, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';
import { toast } from 'react-toastify';
import orderService from '../../../features/orders/orderService';
import { ORDER_STATUS, PAYMENT_STATUS, FULFILMENT_METHOD } from '../../../features/orders/orderConstants';

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
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!order) return null;

  const isCODAllowed = order.pharmacySnapshot?.codAvailable !== false; // Assuming default true

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Select Payment Method</h1>
        <p className="text-slate-500 mt-2">Choose how you want to pay for Order #{order.orderNumber || order._id.substring(order._id.length - 6).toUpperCase()}</p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8">
        <div className="flex justify-between items-center mb-6 pb-6 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Amount to Pay</h2>
            <p className="text-sm text-slate-500">Includes delivery and taxes</p>
          </div>
          <div className="text-3xl font-bold text-indigo-600">
            Rs. {(order.totalAmount / 100).toFixed(2)}
          </div>
        </div>

        <div className="space-y-4">
          {/* Card Payment Option */}
          <button
            type="button"
            onClick={() => setSelectedMethod('CARD')}
            className={`w-full flex items-center p-5 rounded-xl border-2 transition-all ${
              selectedMethod === 'CARD'
                ? 'border-indigo-600 bg-indigo-50/50'
                : 'border-slate-200 hover:border-indigo-300'
            }`}
          >
            <div className={`p-3 rounded-full ${selectedMethod === 'CARD' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
              <CreditCard className="w-6 h-6" />
            </div>
            <div className="ml-4 text-left flex-1">
              <h3 className="font-bold text-slate-900">Pay by Card (Secure Checkout)</h3>
              <p className="text-sm text-slate-500">Visa, Mastercard, AMEX powered by Stripe</p>
            </div>
            <ShieldCheck className={`w-6 h-6 ${selectedMethod === 'CARD' ? 'text-indigo-600' : 'text-slate-300'}`} />
          </button>

          {/* Cash on Delivery Option */}
          <button
            type="button"
            onClick={() => setSelectedMethod('COD')}
            disabled={!isCODAllowed}
            className={`w-full flex items-center p-5 rounded-xl border-2 transition-all ${
              !isCODAllowed ? 'opacity-50 cursor-not-allowed bg-slate-50 border-slate-200' :
              selectedMethod === 'COD'
                ? 'border-indigo-600 bg-indigo-50/50'
                : 'border-slate-200 hover:border-indigo-300'
            }`}
          >
            <div className={`p-3 rounded-full ${selectedMethod === 'COD' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
              <Banknote className="w-6 h-6" />
            </div>
            <div className="ml-4 text-left flex-1">
              <h3 className="font-bold text-slate-900">Cash on Delivery (COD)</h3>
              <p className="text-sm text-slate-500">
                {isCODAllowed 
                  ? order.fulfilmentMethod === FULFILMENT_METHOD.DELIVERY ? 'Pay cash to the rider upon delivery' : 'Pay at the pharmacy counter upon pickup'
                  : 'Cash on delivery is not supported by this pharmacy'}
              </p>
            </div>
          </button>
        </div>

        <div className="mt-8">
          <button
            onClick={handlePaymentSubmit}
            disabled={!selectedMethod || processing}
            className="w-full bg-slate-900 text-white py-4 px-4 rounded-xl font-medium hover:bg-slate-800 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed text-lg shadow-md"
          >
            {processing ? (
              <>
                <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Continue with {selectedMethod === 'CARD' ? 'Card' : selectedMethod === 'COD' ? 'Cash' : 'Payment'}
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </button>
        </div>
        
        {selectedMethod === 'CARD' && (
          <p className="text-xs text-center text-slate-500 mt-4 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 mr-1 text-green-600" />
            Payments are secured and encrypted by Stripe Sandbox.
          </p>
        )}
      </div>
    </div>
  );
};

export default PaymentSelectionPage;
