import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Loader2, ArrowRight } from 'lucide-react';
import orderService from '../../../features/orders/orderService';
import { ORDER_STATUS } from '../../../features/orders/orderConstants';

const CustomerOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await orderService.getMyOrders();
        // Extract array from standard response structure: { status: 'success', data: { orders: [] } }
        setOrders(res.data?.orders || []);
      } catch (error) {
        console.error("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case ORDER_STATUS.PENDING_PAYMENT:
      case ORDER_STATUS.PAYMENT_CONFIRMED:
      case ORDER_STATUS.PHARMACY_ACCEPTED:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case ORDER_STATUS.PREPARING:
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
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatStatus = (status) => {
    if (!status) return 'UNKNOWN';
    return status.replace(/_/g, ' ');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Orders</h1>
          <p className="mt-2 text-slate-600">Track your confirmed medicine orders.</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center">
          <Package className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No Orders Yet</h3>
          <p className="text-slate-500 mb-6">You haven't converted any quotations into orders yet.</p>
          <Link 
            to="/customer/requests"
            className="inline-flex items-center text-indigo-600 font-medium hover:text-indigo-800"
          >
            Go to your requests <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Order / Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Pharmacy</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {orders.map(order => (
                <tr key={order._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-indigo-600">
                      #{order.orderNumber || order._id.substring(order._id.length - 6).toUpperCase()}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900">
                      {order.pharmacySnapshot?.name || 'Unknown Pharmacy'}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {order.fulfilmentMethod}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full border ${getStatusBadge(order.orderStatus)}`}>
                      {formatStatus(order.orderStatus)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                    Rs. {(order.totalAmount / 100).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link to={`/customer/orders/${order._id}`} className="text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-2 rounded-lg transition-colors">
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CustomerOrdersPage;
