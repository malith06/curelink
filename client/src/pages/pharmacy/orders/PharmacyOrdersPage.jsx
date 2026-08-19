import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PackageSearch, ArrowRight, Filter, Phone } from 'lucide-react';
import orderService from '../../../features/orders/orderService';
import { ORDER_STATUS } from '../../../features/orders/orderConstants';
import { toast } from 'react-toastify';
import { Card } from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Skeleton from '../../../components/ui/Skeleton';
import EmptyState from '../../../components/ui/EmptyState';
import Button from '../../../components/ui/Button';

const PharmacyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // ALL, ACTIVE, COMPLETED, CANCELLED
  const navigate = useNavigate();

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

  const formatStatus = (status) => {
    if (!status) return 'UNKNOWN';
    return status.replace(/_/g, ' ');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Manage Orders</h1>
          <p className="mt-2 text-slate-600 font-medium">Review and fulfil customer orders</p>
        </div>
      </div>

      <Card className="overflow-hidden mb-8">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-center gap-5">
           <div className="flex flex-wrap gap-2">
            {['ALL', 'ACTIVE', 'COMPLETED', 'CANCELLED'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  filter === f
                    ? 'bg-primary-600 text-white shadow-md shadow-primary-600/20'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        ) : orders.length === 0 ? (
          <EmptyState 
            icon={PackageSearch}
            title="No Orders Found"
            description="There are no orders matching this filter."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Order ID / Date</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Method</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Total (Rs)</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {orders.map(order => (
                  <tr key={order._id} className="hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => navigate(`/pharmacy/orders/${order._id}`)}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-mono text-sm font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md inline-block mb-1 border border-slate-200">
                        #{order.orderNumber || order._id.substring(order._id.length - 6).toUpperCase()}
                      </div>
                      <div className="text-xs font-medium text-slate-500 mt-1">
                        {new Date(order.createdAt).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-slate-900">
                        {order.customerSnapshot?.name || 'Customer'}
                      </div>
                      <div className="text-xs font-medium text-slate-500 mt-0.5 truncate max-w-[150px] flex items-center">
                        <Phone className="w-3 h-3 mr-1" />
                        {order.customerSnapshot?.phone || 'No phone'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                        {order.fulfilmentMethod}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={getStatusBadge(order.orderStatus)}>
                        {formatStatus(order.orderStatus)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-primary-600 text-right">
                      {(order.totalAmount / 100).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="text-primary-600 hover:text-primary-800 flex items-center justify-end font-bold transition-colors">
                        Manage <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default PharmacyOrdersPage;
