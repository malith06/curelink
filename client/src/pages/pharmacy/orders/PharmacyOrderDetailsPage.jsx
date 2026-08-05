import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, User, MapPin, Banknote, CreditCard, Clock, CheckCircle2, FileText, Loader2, DollarSign } from 'lucide-react';
import { toast } from 'react-toastify';
import orderService from '../../../features/orders/orderService';
import { ORDER_STATUS, PAYMENT_STATUS, FULFILMENT_METHOD, PAYMENT_METHOD } from '../../../features/orders/orderConstants';

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
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!order) return null;

  const isCOD = order.paymentMethod === PAYMENT_METHOD.COD;
  const isCODPending = isCOD && order.paymentStatus === PAYMENT_STATUS.COD_PENDING;
  
  // Can collect COD if order is in a fulfillable state
  const canCollectCOD = isCODPending && [ORDER_STATUS.READY_FOR_PICKUP, ORDER_STATUS.OUT_FOR_DELIVERY, ORDER_STATUS.DELIVERED, ORDER_STATUS.COMPLETED].includes(order.orderStatus);

  const getStatusBadge = (status) => {
    switch (status) {
      case ORDER_STATUS.PENDING_PAYMENT:
      case ORDER_STATUS.PAYMENT_CONFIRMED:
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case ORDER_STATUS.PHARMACY_ACCEPTED:
      case ORDER_STATUS.PREPARING:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case ORDER_STATUS.READY_FOR_PICKUP:
      case ORDER_STATUS.OUT_FOR_DELIVERY:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case ORDER_STATUS.DELIVERED:
      case ORDER_STATUS.COMPLETED:
        return 'bg-green-100 text-green-800 border-green-200';
      case ORDER_STATUS.CANCELLED:
      case ORDER_STATUS.REJECTED:
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const renderActionButtons = () => {
    if (order.orderStatus === ORDER_STATUS.PENDING_PAYMENT) {
      return <div className="text-sm text-amber-600 font-medium">Waiting for customer to complete payment...</div>;
    }

    if (order.orderStatus === ORDER_STATUS.PAYMENT_CONFIRMED) {
      return (
        <button
          onClick={() => handleUpdateStatus(ORDER_STATUS.PHARMACY_ACCEPTED)}
          disabled={actionLoading}
          className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center disabled:opacity-50"
        >
          {actionLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : 'Accept & Start Preparing'}
        </button>
      );
    }

    if (order.orderStatus === ORDER_STATUS.PHARMACY_ACCEPTED || order.orderStatus === ORDER_STATUS.PREPARING) {
      const nextStatus = order.fulfilmentMethod === FULFILMENT_METHOD.DELIVERY 
        ? ORDER_STATUS.OUT_FOR_DELIVERY 
        : ORDER_STATUS.READY_FOR_PICKUP;
      
      return (
        <div className="space-y-3">
          <button
            onClick={() => handleUpdateStatus(ORDER_STATUS.PREPARING)}
            disabled={actionLoading || order.orderStatus === ORDER_STATUS.PREPARING}
            className="w-full bg-yellow-500 text-white py-3 rounded-xl font-medium hover:bg-yellow-600 transition-colors flex items-center justify-center disabled:opacity-50"
          >
            Mark as Preparing
          </button>
          <button
            onClick={() => handleUpdateStatus(nextStatus)}
            disabled={actionLoading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center justify-center disabled:opacity-50"
          >
            Mark as {nextStatus.replace(/_/g, ' ')}
          </button>
        </div>
      );
    }

    if (order.orderStatus === ORDER_STATUS.OUT_FOR_DELIVERY || order.orderStatus === ORDER_STATUS.READY_FOR_PICKUP) {
      return (
        <div className="space-y-3">
          <button
            onClick={() => handleUpdateStatus(order.fulfilmentMethod === FULFILMENT_METHOD.DELIVERY ? ORDER_STATUS.DELIVERED : ORDER_STATUS.COMPLETED)}
            disabled={actionLoading}
            className="w-full bg-green-600 text-white py-3 rounded-xl font-medium hover:bg-green-700 transition-colors flex items-center justify-center disabled:opacity-50"
          >
            Mark as {order.fulfilmentMethod === FULFILMENT_METHOD.DELIVERY ? 'Delivered' : 'Completed'}
          </button>
        </div>
      );
    }

    if (order.orderStatus === ORDER_STATUS.DELIVERED) {
      return (
        <button
          onClick={() => handleUpdateStatus(ORDER_STATUS.COMPLETED)}
          disabled={actionLoading}
          className="w-full bg-green-600 text-white py-3 rounded-xl font-medium hover:bg-green-700 transition-colors flex items-center justify-center disabled:opacity-50"
        >
          Close & Mark Completed
        </button>
      );
    }

    return null;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl animate-in fade-in duration-500">
      <div className="mb-6 flex items-center gap-4">
        <Link to="/pharmacy/orders" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            Order #{order.orderNumber || order._id.substring(order._id.length - 6).toUpperCase()}
            <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusBadge(order.orderStatus)}`}>
              {order.orderStatus.replace(/_/g, ' ')}
            </span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">Placed on {new Date(order.createdAt).toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-slate-400" />
              Order Items
            </h2>
            <div className="space-y-4">
              {order.items?.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-3 border-b border-slate-100 last:border-0 last:pb-0">
                  <div>
                    <div className="font-medium text-slate-900">{item.medicineName}</div>
                    <div className="text-sm text-slate-500">
                      {item.quantity} x Rs. {(item.unitPrice / 100).toFixed(2)}
                    </div>
                  </div>
                  <div className="font-semibold text-slate-900">
                    Rs. {((item.quantity * item.unitPrice) / 100).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-slate-200">
              <div className="flex justify-between text-sm text-slate-600 mb-2">
                <span>Subtotal</span>
                <span>Rs. {((order.totalAmount - (order.deliveryFee || 0)) / 100).toFixed(2)}</span>
              </div>
              {order.fulfilmentMethod === FULFILMENT_METHOD.DELIVERY && (
                <div className="flex justify-between text-sm text-slate-600 mb-2">
                  <span>Delivery Fee</span>
                  <span>Rs. {((order.deliveryFee || 0) / 100).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold text-slate-900 pt-2 border-t border-slate-100 mt-2">
                <span>Total</span>
                <span className="text-indigo-600">Rs. {(order.totalAmount / 100).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Customer Details */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-slate-400" />
              Customer Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-slate-500 mb-1">Customer Name</p>
                <p className="font-medium text-slate-900">{order.customerSnapshot?.name}</p>
                <p className="text-sm text-slate-500 mt-3 mb-1">Phone Number</p>
                <p className="font-medium text-slate-900">{order.customerSnapshot?.phone}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Fulfilment Method</p>
                <p className="font-medium text-slate-900 flex items-center gap-2">
                  {order.fulfilmentMethod === FULFILMENT_METHOD.DELIVERY ? (
                    <><MapPin className="w-4 h-4 text-indigo-500" /> Delivery</>
                  ) : (
                    <><Package className="w-4 h-4 text-indigo-500" /> Pickup</>
                  )}
                </p>
                {order.fulfilmentMethod === FULFILMENT_METHOD.DELIVERY && order.deliveryAddress && (
                  <div className="mt-3">
                    <p className="text-sm text-slate-500 mb-1">Delivery Address</p>
                    <p className="text-sm font-medium text-slate-900">
                      {order.deliveryAddress.line1}<br />
                      {order.deliveryAddress.line2 && <>{order.deliveryAddress.line2}<br /></>}
                      {order.deliveryAddress.city}, {order.deliveryAddress.district}
                    </p>
                  </div>
                )}
                {order.deliveryInstructions && (
                  <div className="mt-3">
                    <p className="text-sm text-slate-500 mb-1">Instructions</p>
                    <p className="text-sm text-slate-700 bg-slate-50 p-2 rounded border border-slate-100">
                      {order.deliveryInstructions}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Payment Status Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-slate-400" />
              Payment Info
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${order.paymentMethod === 'CARD' ? 'bg-indigo-100 text-indigo-600' : 'bg-green-100 text-green-600'}`}>
                  {order.paymentMethod === 'CARD' ? <CreditCard className="w-5 h-5" /> : <Banknote className="w-5 h-5" />}
                </div>
                <div>
                  <p className="text-sm text-slate-500">Method</p>
                  <p className="font-semibold text-slate-900">{order.paymentMethod === 'CARD' ? 'Card Payment (Stripe)' : order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Not Selected'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${order.paymentStatus === 'PAID' || order.paymentStatus === 'COD_COLLECTED' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                  {order.paymentStatus === 'PAID' || order.paymentStatus === 'COD_COLLECTED' ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                </div>
                <div>
                  <p className="text-sm text-slate-500">Status</p>
                  <p className="font-semibold text-slate-900">{order.paymentStatus?.replace(/_/g, ' ') || 'PENDING'}</p>
                </div>
              </div>

              {canCollectCOD && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <button
                    onClick={handleCollectCOD}
                    disabled={actionLoading}
                    className="w-full bg-green-600 text-white py-2 rounded-xl font-medium hover:bg-green-700 transition-colors flex items-center justify-center disabled:opacity-50"
                  >
                    {actionLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Banknote className="w-4 h-4 mr-2" />}
                    Mark COD Collected
                  </button>
                  <p className="text-xs text-slate-500 text-center mt-2">
                    Click this only after you have received the cash.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Action Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-24">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-slate-400" />
              Update Status
            </h2>
            {renderActionButtons()}
            
            {(order.orderStatus === ORDER_STATUS.PAYMENT_CONFIRMED || order.orderStatus === ORDER_STATUS.PHARMACY_ACCEPTED) && (
              <button
                onClick={() => handleUpdateStatus(ORDER_STATUS.CANCELLED)} // Assuming simple reject maps to CANCELLED for simplicity here, or REJECTED.
                disabled={actionLoading}
                className="w-full mt-3 bg-white border border-red-200 text-red-600 py-3 rounded-xl font-medium hover:bg-red-50 transition-colors flex items-center justify-center disabled:opacity-50"
              >
                Reject Order
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PharmacyOrderDetailsPage;
