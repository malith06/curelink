import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, User, MapPin, Banknote, CreditCard, Clock, CheckCircle2, FileText, DollarSign, Store } from 'lucide-react';
import { toast } from 'react-toastify';
import orderService from '../../../features/orders/orderService';
import { ORDER_STATUS, PAYMENT_STATUS, FULFILMENT_METHOD, PAYMENT_METHOD } from '../../../features/orders/orderConstants';
import { Card, CardContent, CardHeader } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Skeleton from '../../../components/ui/Skeleton';
import Badge from '../../../components/ui/Badge';

const PharmacyOrderDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      const res = await orderService.getPharmacyOrderById(id);
      setOrder(res.data?.order || res.data);
    } catch (error) {
      console.error('Failed to load order', error);
      toast.error('Failed to load order details');
      navigate('/pharmacy/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    setActionLoading(true);
    try {
      if (newStatus === ORDER_STATUS.PHARMACY_ACCEPTED) {
        await orderService.acceptOrder(id);
      } else {
        await orderService.updateOrderStatus(id, newStatus);
      }
      toast.success(`Order status updated to ${newStatus.replace(/_/g, ' ')}`);
      fetchOrderDetails();
    } catch (error) {
      console.error('Failed to update status', error);
      toast.error(error.response?.data?.message || 'Failed to update order status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCollectCOD = async () => {
    if (!window.confirm("Are you sure you have collected the cash from the customer? This action cannot be undone.")) {
      return;
    }
    
    setActionLoading(true);
    try {
      await orderService.collectCOD(id);
      toast.success('Cash on Delivery marked as collected successfully!');
      fetchOrderDetails();
    } catch (error) {
      console.error('Failed to collect COD', error);
      toast.error(error.response?.data?.message || 'Failed to record COD collection');
    } finally {
      setActionLoading(false);
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

  const isCOD = order.paymentMethod === PAYMENT_METHOD.COD;
  const isCODPending = isCOD && order.paymentStatus === PAYMENT_STATUS.COD_PENDING;
  
  // Can collect COD if order is in a fulfillable state
  const canCollectCOD = isCODPending && [ORDER_STATUS.READY_FOR_PICKUP, ORDER_STATUS.OUT_FOR_DELIVERY, ORDER_STATUS.DELIVERED, ORDER_STATUS.COMPLETED].includes(order.orderStatus);

  const getStatusVariant = (status) => {
    switch (status) {
      case ORDER_STATUS.PENDING_PAYMENT:
      case ORDER_STATUS.PAYMENT_CONFIRMED:
        return 'info';
      case ORDER_STATUS.PHARMACY_ACCEPTED:
      case ORDER_STATUS.PREPARING:
        return 'warning';
      case ORDER_STATUS.READY_FOR_PICKUP:
      case ORDER_STATUS.OUT_FOR_DELIVERY:
        return 'success';
      case ORDER_STATUS.DELIVERED:
      case ORDER_STATUS.COMPLETED:
        return 'success';
      case ORDER_STATUS.CANCELLED:
      case ORDER_STATUS.REJECTED:
        return 'error';
      default:
        return 'default';
    }
  };

  const renderActionButtons = () => {
    if (order.orderStatus === ORDER_STATUS.PENDING_PAYMENT) {
      return (
        <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex items-start gap-3">
           <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
           <div>
              <p className="text-sm text-amber-800 font-bold">Waiting for Payment</p>
              <p className="text-sm text-amber-700/80 mt-1 font-medium">Customer has not yet completed payment. No action required yet.</p>
           </div>
        </div>
      );
    }

    if (order.orderStatus === ORDER_STATUS.PAYMENT_CONFIRMED) {
      return (
        <Button
          onClick={() => handleUpdateStatus(ORDER_STATUS.PHARMACY_ACCEPTED)}
          disabled={actionLoading}
          loading={actionLoading}
          fullWidth
          size="lg"
        >
          Accept & Start Preparing
        </Button>
      );
    }

    if (order.orderStatus === ORDER_STATUS.PHARMACY_ACCEPTED || order.orderStatus === ORDER_STATUS.PREPARING) {
      const nextStatus = order.fulfilmentMethod === FULFILMENT_METHOD.DELIVERY 
        ? ORDER_STATUS.OUT_FOR_DELIVERY 
        : ORDER_STATUS.READY_FOR_PICKUP;
      
      return (
        <div className="space-y-4">
          <Button
            onClick={() => handleUpdateStatus(ORDER_STATUS.PREPARING)}
            disabled={actionLoading || order.orderStatus === ORDER_STATUS.PREPARING}
            variant="outline"
            fullWidth
            size="lg"
          >
            Mark as Preparing
          </Button>
          <Button
            onClick={() => handleUpdateStatus(nextStatus)}
            disabled={actionLoading}
            loading={actionLoading}
            fullWidth
            size="lg"
          >
            Mark as {nextStatus.replace(/_/g, ' ')}
          </Button>
        </div>
      );
    }

    if (order.orderStatus === ORDER_STATUS.OUT_FOR_DELIVERY || order.orderStatus === ORDER_STATUS.READY_FOR_PICKUP) {
      return (
        <div className="space-y-4">
          <Button
            onClick={() => handleUpdateStatus(order.fulfilmentMethod === FULFILMENT_METHOD.DELIVERY ? ORDER_STATUS.DELIVERED : ORDER_STATUS.COMPLETED)}
            disabled={actionLoading}
            loading={actionLoading}
            fullWidth
            size="lg"
            variant="success"
          >
            Mark as {order.fulfilmentMethod === FULFILMENT_METHOD.DELIVERY ? 'Delivered' : 'Completed'}
          </Button>
        </div>
      );
    }

    if (order.orderStatus === ORDER_STATUS.DELIVERED) {
      return (
        <Button
          onClick={() => handleUpdateStatus(ORDER_STATUS.COMPLETED)}
          disabled={actionLoading}
          loading={actionLoading}
          fullWidth
          size="lg"
          variant="success"
        >
          Close & Mark Completed
        </Button>
      );
    }

    return null;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 mb-2">
        <button onClick={() => navigate('/pharmacy/orders')} className="p-2 hover:bg-slate-100 rounded-full transition-colors group">
          <ArrowLeft className="w-5 h-5 text-slate-600 group-hover:-translate-x-1 transition-transform" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-4">
            Order #{order.orderNumber || order._id.substring(order._id.length - 6).toUpperCase()}
            <Badge variant={getStatusVariant(order.orderStatus)}>
              {order.orderStatus.replace(/_/g, ' ')}
            </Badge>
          </h1>
          <p className="text-slate-500 font-medium mt-1 flex items-center">
             <Clock className="w-4 h-4 mr-1.5" /> Placed on {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-primary-500" />
                Order Items
              </h2>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {order.items?.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-4 border-b border-slate-100 last:border-0 last:pb-0">
                    <div>
                      <div className="font-bold text-slate-900">{item.medicineName}</div>
                      <div className="text-sm font-medium text-slate-500 mt-1">
                        {item.quantity} x Rs. {(item.unitPrice / 100).toFixed(2)}
                      </div>
                    </div>
                    <div className="font-black text-slate-900 text-lg">
                      Rs. {((item.quantity * item.unitPrice) / 100).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
                <div className="flex justify-between text-sm font-medium text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-900">Rs. {((order.totalAmount - (order.deliveryFee || 0)) / 100).toFixed(2)}</span>
                </div>
                {order.fulfilmentMethod === FULFILMENT_METHOD.DELIVERY && (
                  <div className="flex justify-between text-sm font-medium text-slate-600">
                    <span>Delivery Fee</span>
                    <span className="font-bold text-slate-900">Rs. {((order.deliveryFee || 0) / 100).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-lg font-black text-slate-900 pt-4 border-t border-slate-200 mt-4">
                  <span>Total</span>
                  <span className="text-primary-600 text-2xl">Rs. {(order.totalAmount / 100).toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Details */}
          <Card>
             <CardHeader>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <User className="w-5 h-5 text-primary-500" />
                Customer & Fulfilment
              </h2>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Customer Details</p>
                  <p className="font-bold text-slate-900 text-lg">{order.customerSnapshot?.name}</p>
                  <p className="font-medium text-slate-700 mt-2 flex items-center">
                    <User className="w-4 h-4 mr-2 text-slate-400" />
                    {order.customerSnapshot?.phone}
                  </p>
                </div>
                
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Fulfilment</p>
                  <div className="inline-flex items-center px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-bold text-slate-900 shadow-sm">
                    {order.fulfilmentMethod === FULFILMENT_METHOD.DELIVERY ? (
                      <><MapPin className="w-4 h-4 text-primary-600 mr-2" /> Delivery</>
                    ) : (
                      <><Store className="w-4 h-4 text-primary-600 mr-2" /> Pickup</>
                    )}
                  </div>
                  
                  {order.fulfilmentMethod === FULFILMENT_METHOD.DELIVERY && order.deliveryAddress && (
                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <p className="text-sm font-medium text-slate-900 leading-relaxed">
                        {order.deliveryAddress.line1}<br />
                        {order.deliveryAddress.line2 && <>{order.deliveryAddress.line2}<br /></>}
                        {order.deliveryAddress.city}, {order.deliveryAddress.district}
                      </p>
                    </div>
                  )}
                  {order.deliveryInstructions && (
                    <div className="mt-4">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Instructions</p>
                      <p className="text-sm font-medium text-slate-700 bg-white p-3 rounded-lg border border-slate-200">
                        {order.deliveryInstructions}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          {/* Action Card */}
          <Card className="sticky top-24 shadow-lg shadow-primary-900/5 ring-1 ring-slate-200">
            <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary-500" />
                Order Actions
              </h2>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {renderActionButtons()}
              
              {(order.orderStatus === ORDER_STATUS.PAYMENT_CONFIRMED || order.orderStatus === ORDER_STATUS.PHARMACY_ACCEPTED) && (
                <div className="pt-6 border-t border-slate-100">
                  <Button
                    onClick={() => handleUpdateStatus(ORDER_STATUS.CANCELLED)} 
                    disabled={actionLoading}
                    variant="outline"
                    fullWidth
                    className="!text-red-600 !border-red-200 hover:!bg-red-50 hover:!border-red-300"
                  >
                    Reject Order
                  </Button>
                  <p className="text-xs text-center text-slate-500 font-medium mt-3">This will cancel the order and notify the customer.</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Payment Status Card */}
          <Card>
            <CardHeader className="pb-2">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary-500" />
                Payment Info
              </h2>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Method</p>
                  <div className="flex items-center gap-2">
                    {order.paymentMethod === 'CARD' ? <CreditCard className="w-4 h-4 text-primary-600" /> : <Banknote className="w-4 h-4 text-green-600" />}
                    <span className="font-bold text-slate-900 text-sm">
                      {order.paymentMethod === 'CARD' ? 'Card Payment' : order.paymentMethod === 'COD' ? 'COD' : 'None'}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                   <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Status</p>
                   <div className="flex items-center gap-2">
                     {order.paymentStatus === 'PAID' || order.paymentStatus === 'COD_COLLECTED' ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Clock className="w-4 h-4 text-amber-500" />}
                     <span className="font-bold text-slate-900 text-sm">
                        {order.paymentStatus?.replace(/_/g, ' ') || 'PENDING'}
                     </span>
                   </div>
                </div>
              </div>

              {canCollectCOD && (
                <div className="p-5 bg-green-50 rounded-xl border border-green-200">
                  <Button
                    onClick={handleCollectCOD}
                    disabled={actionLoading}
                    loading={actionLoading}
                    variant="success"
                    fullWidth
                    icon={Banknote}
                  >
                    Mark COD Collected
                  </Button>
                  <p className="text-xs font-medium text-green-800 text-center mt-3 leading-relaxed">
                    Click this only after you have physically received the cash from the customer or rider.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PharmacyOrderDetailsPage;
