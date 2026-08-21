import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Package } from 'lucide-react';
import orderService from '../../../features/orders/orderService';
import { ORDER_STATUS } from '../../../features/orders/orderConstants';
import { Card, CardContent } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Skeleton from '../../../components/ui/Skeleton';

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
      <div className="flex flex-col justify-center items-center h-96 space-y-6">
        <Skeleton className="w-20 h-20 rounded-full" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col justify-center items-center h-96 space-y-6">
        <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mb-2">
          <span className="text-4xl">🤔</span>
        </div>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Order Not Found</h2>
        <Link to="/customer/orders" className="text-primary-600 hover:text-primary-800 font-bold hover:underline transition-colors">Return to My Orders</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-16 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="text-center overflow-hidden border-0 shadow-xl shadow-primary-900/5 ring-1 ring-slate-200/50">
        <div className="h-32 bg-gradient-to-b from-emerald-50 to-white w-full absolute top-0 left-0 -z-10"></div>
        <CardContent className="p-8 md:p-12">
          <div className="w-28 h-28 bg-emerald-100/80 rounded-full flex items-center justify-center mx-auto mb-8 relative">
            <div className="absolute inset-0 bg-emerald-200/50 rounded-full animate-ping opacity-20"></div>
            <CheckCircle2 className="w-14 h-14 text-emerald-600" />
          </div>
          
          <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">
            {isCOD ? 'Order Confirmed!' : 'Payment Successful!'}
          </h1>
          
          <p className="text-lg text-slate-600 mb-10 max-w-md mx-auto font-medium">
            {isCOD 
              ? 'Your order has been confirmed with Cash on Delivery. The pharmacy will begin preparing it shortly.'
              : 'Your card payment has been verified. The pharmacy will begin preparing your order shortly.'}
          </p>

          <div className="bg-slate-50 rounded-2xl p-6 text-left mb-10 inline-block w-full max-w-md mx-auto border border-slate-200 shadow-sm">
            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Order Number</span>
                <span className="font-bold text-slate-900 bg-white px-2 py-1 rounded border border-slate-200">#{order.orderNumber || order._id.substring(order._id.length - 6).toUpperCase()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Amount Paid</span>
                <span className="font-bold text-slate-900 bg-white px-2 py-1 rounded border border-slate-200">Rs. {(order.total / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Payment Method</span>
                <span className="font-bold text-slate-900 bg-white px-2 py-1 rounded border border-slate-200">{isCOD ? 'Cash on Delivery' : 'Card Payment'}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate('/customer/orders')}
              icon={Package}
              size="lg"
            >
              Track Order
            </Button>
            <Button
              onClick={() => navigate('/customer/dashboard')}
              variant="outline"
              size="lg"
              className="group"
            >
              Go to Dashboard
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccessPage;
