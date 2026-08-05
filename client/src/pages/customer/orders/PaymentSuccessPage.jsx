import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Loader2, Package } from 'lucide-react';
import orderService from '../../../features/orders/orderService';
import { ORDER_STATUS } from '../../../features/orders/orderConstants';

const PaymentSuccessPage = () => {
  const { orderId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isCOD = searchParams.get('method') === 'cod';

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [retries, setRetries] = useState(0);

  useEffect(() => {
    // For card payments, we might need to poll until webhook sets PAYMENT_CONFIRMED
    const fetchOrder = async () => {
      try {
        const res = await orderService.getOrderById(orderId);
        const orderData = res.data?.order || res.data;
        
        if (!isCOD && orderData.orderStatus === ORDER_STATUS.PENDING_PAYMENT && retries < 5) {
          // Webhook might be slow. Retry in 2 seconds.
          setTimeout(() => setRetries(r => r + 1), 2000);
          return;
        }

        setOrder(orderData);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch order', error);
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, isCOD, retries]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-96 space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
        <p className="text-slate-500 font-medium">Verifying your payment...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col justify-center items-center h-96 space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Order Not Found</h2>
        <Link to="/customer/orders" className="text-indigo-600 hover:underline">Return to My Orders</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-16 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 md:p-12 text-center">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-12 h-12 text-green-600" />
        </div>
        
        <h1 className="text-3xl font-bold text-slate-900 mb-4">
          {isCOD ? 'Order Confirmed!' : 'Payment Successful!'}
        </h1>
        
        <p className="text-lg text-slate-600 mb-8 max-w-md mx-auto">
          {isCOD 
            ? 'Your order has been confirmed with Cash on Delivery. The pharmacy will begin preparing it shortly.'
            : 'Your card payment has been verified. The pharmacy will begin preparing your order shortly.'}
        </p>

        <div className="bg-slate-50 rounded-2xl p-6 text-left mb-8 inline-block w-full max-w-sm mx-auto">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Order Number</span>
              <span className="font-semibold text-slate-900">#{order.orderNumber || order._id.substring(order._id.length - 6).toUpperCase()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Amount Paid</span>
              <span className="font-semibold text-slate-900">Rs. {(order.totalAmount / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Payment Method</span>
              <span className="font-semibold text-slate-900">{isCOD ? 'Cash on Delivery' : 'Card Payment'}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to={`/customer/orders`}
            className="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
          >
            <Package className="w-5 h-5 mr-2" />
            Track Order
          </Link>
          <Link
            to="/customer/dashboard"
            className="inline-flex items-center justify-center px-6 py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors"
          >
            Go to Dashboard
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
