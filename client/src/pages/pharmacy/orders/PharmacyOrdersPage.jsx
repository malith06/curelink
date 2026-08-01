import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PackageSearch, Loader2, Filter, AlertCircle, ArrowRight } from 'lucide-react';
import orderService from '../../../features/orders/orderService';
import { ORDER_STATUS } from '../../../features/orders/orderConstants';
import { toast } from 'react-toastify';

const PharmacyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // ALL, ACTIVE, COMPLETED, CANCELLED

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = {};
      // Simple frontend-mapped filter logic that we can optionally push to backend later
      if (filter === 'ACTIVE') {
        params.status = `${ORDER_STATUS.PAYMENT_CONFIRMED},${ORDER_STATUS.PHARMACY_ACCEPTED},${ORDER_STATUS.PREPARING},${ORDER_STATUS.READY_FOR_PICKUP},${ORDER_STATUS.OUT_FOR_DELIVERY}`;
      } else if (filter === 'COMPLETED') {
        params.status = `${ORDER_STATUS.DELIVERED},${ORDER_STATUS.COMPLETED}`;
      } else if (filter === 'CANCELLED') {
        params.status = `${ORDER_STATUS.CANCELLED},${ORDER_STATUS.REJECTED}`;
      }

      const res = await orderService.getPharmacyOrders(params);
      setOrders(res.data?.orders || []);
    } catch (error) {
      console.error("Failed to load pharmacy orders", error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

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

  const formatStatus = (status) => {
    if (!status) return 'UNKNOWN';
    return status.replace(/_/g, ' ');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Manage Orders</h1>
          <p className="mt-2 text-slate-600">Review and fulfil customer orders</p>
        </div>

        <div className="flex items-center gap-2 bg-white rounded-xl shadow-sm border border-slate-200 p-1">
          {['ALL', 'ACTIVE', 'COMPLETED', 'CANCELLED'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center">
          <PackageSearch className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No Orders Found</h3>
          <p className="text-slate-500 mb-6">There are no orders matching this filter.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Order ID / Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Method</th>
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
                      {new Date(order.createdAt).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900">
                      {order.customerSnapshot?.name || 'Customer'}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5 truncate max-w-[150px]">
                      {order.customerSnapshot?.phone || 'No phone'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-slate-900 bg-slate-100 px-2 py-1 rounded">
                      {order.fulfilmentMethod}
                    </span>
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
                    <Link to={`/pharmacy/orders/${order._id}`} className="text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-2 rounded-lg transition-colors inline-flex items-center">
                      Manage <ArrowRight className="w-4 h-4 ml-1" />
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

export default PharmacyOrdersPage;
