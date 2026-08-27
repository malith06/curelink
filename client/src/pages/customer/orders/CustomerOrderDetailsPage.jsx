import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, MapPin, Banknote, CreditCard, Clock, CheckCircle2, FileText, Store } from 'lucide-react';
import { toast } from 'react-toastify';
import orderService from '../../../features/orders/orderService';
import { ORDER_STATUS, PAYMENT_STATUS, FULFILMENT_METHOD, PAYMENT_METHOD } from '../../../features/orders/orderConstants';
import { Card, CardContent, CardHeader } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Skeleton from '../../../components/ui/Skeleton';
import Badge from '../../../components/ui/Badge';

const CustomerOrderDetailsPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      const res = await orderService.getOrderById(orderId);
      setOrder(res.data?.order || res.data);
    } catch (error) {
      console.error('Failed to load order', error);
      toast.error('Failed to load order details');
      navigate('/customer/orders');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        <Skeleton className="h-6 w-32 mb-6" />
        <Card>
          <CardContent className="p-8 space-y-6">
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-4 w-1/4" />
            <div className="mt-8 space-y-4">
               {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!order) return null;

  const isPendingPayment = order.orderStatus === ORDER_STATUS.PENDING_PAYMENT;

  const getStatusVariant = (status) => {
    switch (status) {
      case ORDER_STATUS.PENDING_PAYMENT: return 'warning';
      case ORDER_STATUS.PAYMENT_CONFIRMED: return 'info';
      case ORDER_STATUS.PHARMACY_ACCEPTED: return 'indigo';
      case ORDER_STATUS.PREPARING: return 'purple';
      case ORDER_STATUS.READY_FOR_PICKUP: return 'indigo';
      case ORDER_STATUS.OUT_FOR_DELIVERY: return 'blue';
      case ORDER_STATUS.DELIVERED: return 'success';
      case ORDER_STATUS.COMPLETED: return 'success';
      case ORDER_STATUS.CANCELLED: return 'danger';
      case ORDER_STATUS.REJECTED: return 'danger';
      default: return 'slate';
    }
  };

  const getPaymentStatusVariant = (status) => {
    switch (status) {
      case PAYMENT_STATUS.PENDING: return 'warning';
      case PAYMENT_STATUS.PAID: return 'success';
      case PAYMENT_STATUS.COD_PENDING: return 'info';
      case PAYMENT_STATUS.COD_COLLECTED: return 'success';
      case PAYMENT_STATUS.FAILED: return 'danger';
      case PAYMENT_STATUS.REFUNDED: return 'slate';
      default: return 'slate';
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 bg-slate-50 min-h-screen pb-20">
      {/* Modern Header Section */}
      <div className="bg-[#0B1354] pb-24 pt-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden rounded-b-[3rem] mb-[-4rem]">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500 rounded-full mix-blend-screen filter blur-[80px] opacity-30 animate-pulse"></div>
        
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col gap-6">
          <Link to="/customer/orders" className="text-blue-200 hover:text-white flex items-center text-sm font-medium w-fit group transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1 transition-transform group-hover:-translate-x-1" /> Back to Orders
          </Link>
          
          <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
            <div className="flex items-center gap-4">
               <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-lg">
                  <Package className="w-7 h-7 text-white" />
               </div>
               <div>
                 <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                   Order #{order.orderNumber || order._id.substring(order._id.length - 6).toUpperCase()}
                 </h1>
                 <p className="mt-1 text-blue-100 font-medium">Placed on {new Date(order.createdAt).toLocaleString()}</p>
               </div>
            </div>
            {isPendingPayment && (
              <Button 
                onClick={() => navigate(`/customer/orders/${order._id}/payment`)}
                className="w-full sm:w-auto shadow-lg bg-white text-[#0B1354] hover:bg-slate-100"
              >
                Pay Now
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
          {/* Status Banner */}
          <Card className="overflow-hidden border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl">
            <div className={`p-6 md:p-8 ${
              order.orderStatus === ORDER_STATUS.COMPLETED ? 'bg-emerald-50 text-emerald-900' :
              order.orderStatus === ORDER_STATUS.CANCELLED ? 'bg-red-50 text-red-900' :
              order.orderStatus === ORDER_STATUS.PENDING_PAYMENT ? 'bg-amber-50 text-amber-900' :
              'bg-blue-50 text-blue-900'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold opacity-80 uppercase tracking-wider mb-1">Order Status</p>
                  <div className="text-2xl md:text-3xl font-black flex items-center gap-2">
                    {order.orderStatus.replace(/_/g, ' ')}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold opacity-80 uppercase tracking-wider mb-1">Payment Status</p>
                  <Badge variant={getPaymentStatusVariant(order.paymentStatus)} size="md" className="shadow-sm">
                    {order.paymentStatus.replace(/_/g, ' ')}
                  </Badge>
                </div>
              </div>
            </div>
          </Card>

          {/* Items List */}
          <Card>
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-slate-400" />
                Order Items ({order.items.length})
              </h2>
            </CardHeader>
            <div className="divide-y divide-slate-100">
              {order.items.map((item) => (
                <div key={item._id} className="p-6 hover:bg-slate-50/50 transition-colors">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900 text-lg">
                        {item.medicineSnapshot.name}
                      </h3>
                      {item.medicineSnapshot.brand && (
                        <p className="text-sm text-slate-500 font-medium mt-0.5">Brand: {item.medicineSnapshot.brand}</p>
                      )}
                      
                      <div className="mt-3 flex flex-wrap gap-2">
                         <Badge variant="outline" className="bg-white">
                           Qty: {item.approvedQuantity}
                         </Badge>
                      </div>

                      {item.substitutionOffered && (
                         <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                            <p className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">Substitution Accepted</p>
                            <p className="text-sm text-amber-900">
                               Replaced with: <strong>{item.substitutionSnapshot?.name}</strong> {item.substitutionSnapshot?.brand && `(${item.substitutionSnapshot.brand})`}
                            </p>
                         </div>
                      )}
                    </div>
                    <div className="text-right">
                       <p className="text-sm text-slate-500 font-medium mb-1">Rs. {Number(item.unitPrice).toFixed(2)} each</p>
                       <p className="font-bold text-slate-900 text-lg">Rs. {Number(item.subtotal).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Order Totals */}
            <div className="p-6 bg-slate-50 rounded-b-2xl border-t border-slate-100">
              <div className="space-y-3 max-w-sm ml-auto">
                 <div className="flex justify-between text-slate-600 font-medium">
                   <span>Subtotal</span>
                   <span>Rs. {Number(order.subtotal).toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between text-slate-600 font-medium">
                   <span>Delivery Fee</span>
                   <span>Rs. {Number(order.deliveryFee).toFixed(2)}</span>
                 </div>
                 <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                   <span className="font-bold text-slate-900">Total</span>
                   <span className="text-xl font-black text-primary-600">Rs. {Number(order.total).toFixed(2)}</span>
                 </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card>
             <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
               <h3 className="font-bold text-slate-900 flex items-center gap-2">
                 <Store className="w-5 h-5 text-slate-400" />
                 Pharmacy Details
               </h3>
             </CardHeader>
             <CardContent className="p-5">
               <div className="space-y-4">
                 <div>
                   <p className="text-sm font-bold text-slate-900">{order.pharmacySnapshot.name}</p>
                   <p className="text-sm text-slate-500 mt-1">{order.pharmacySnapshot.address?.line1}, {order.pharmacySnapshot.address?.city}</p>
                 </div>
                 <div className="flex items-center gap-3 text-sm text-slate-600">
                   <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                     <Clock className="w-4 h-4" />
                   </div>
                   {order.pharmacySnapshot.phone}
                 </div>
               </div>
             </CardContent>
          </Card>

          <Card>
             <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
               <h3 className="font-bold text-slate-900 flex items-center gap-2">
                 <MapPin className="w-5 h-5 text-slate-400" />
                 Fulfilment: {order.fulfilmentMethod === FULFILMENT_METHOD.DELIVERY ? 'Delivery' : 'Pickup'}
               </h3>
             </CardHeader>
             <CardContent className="p-5">
               {order.fulfilmentMethod === FULFILMENT_METHOD.DELIVERY && order.deliveryAddressSnapshot ? (
                 <div className="space-y-2">
                   <p className="text-sm font-bold text-slate-900">{order.deliveryAddressSnapshot.fullName}</p>
                   <p className="text-sm text-slate-600 leading-relaxed">
                     {order.deliveryAddressSnapshot.line1}
                     {order.deliveryAddressSnapshot.line2 && <><br/>{order.deliveryAddressSnapshot.line2}</>}
                     <br/>{order.deliveryAddressSnapshot.city}, {order.deliveryAddressSnapshot.district}
                   </p>
                   <p className="text-sm text-slate-600 mt-2 font-medium">📞 {order.deliveryAddressSnapshot.phone}</p>
                   
                   {order.deliveryInstructions && (
                     <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                       <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Delivery Notes</p>
                       <p className="text-sm text-slate-700 italic">"{order.deliveryInstructions}"</p>
                     </div>
                   )}
                 </div>
               ) : (
                 <div className="text-sm text-slate-600 leading-relaxed">
                   <p className="font-medium text-slate-900 mb-2">You selected store pickup.</p>
                   <p>Please wait for the notification that your order is READY FOR PICKUP before visiting the pharmacy.</p>
                 </div>
               )}
             </CardContent>
          </Card>

          <Card>
             <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
               <h3 className="font-bold text-slate-900 flex items-center gap-2">
                 <CreditCard className="w-5 h-5 text-slate-400" />
                 Payment Method
               </h3>
             </CardHeader>
             <CardContent className="p-5">
               <div className="flex items-center justify-between">
                 <span className="font-medium text-slate-700">
                   {order.paymentMethod ? order.paymentMethod.replace(/_/g, ' ') : 'Not selected yet'}
                 </span>
                 {order.paymentMethod === PAYMENT_METHOD.CARD && <CreditCard className="w-5 h-5 text-slate-400" />}
                 {order.paymentMethod === PAYMENT_METHOD.COD && <Banknote className="w-5 h-5 text-slate-400" />}
               </div>
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </div>
  );
};

export default CustomerOrderDetailsPage;
