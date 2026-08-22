import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, ArrowRight, ChevronRight } from 'lucide-react';
import orderService from '../../../features/orders/orderService';
import { ORDER_STATUS } from '../../../features/orders/orderConstants';
import { Card } from '../../../components/ui/Card';
import StatusBadge from '../../../components/ui/StatusBadge';
import EmptyState from '../../../components/ui/EmptyState';
import Skeleton from '../../../components/ui/Skeleton';
import Button from '../../../components/ui/Button';

const CustomerOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

  const formatStatus = (status) => {
    if (!status) return 'UNKNOWN';
    return status.replace(/_/g, ' ');
  };

  if (loading) {
    return (
      <div className="mx-auto px-4 py-12 max-w-5xl">
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-5 w-96 mb-8" />
        <Card className="p-4 space-y-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto px-4 py-12 max-w-5xl animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">My Orders</h1>
          <p className="mt-2 text-slate-600">Track your confirmed medicine orders.</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <EmptyState 
          icon={Package}
          title="No Orders Yet"
          description="You haven't converted any quotations into orders yet."
          action={
            <Button onClick={() => navigate('/customer/requests')} icon={ArrowRight}>
              Go to your requests
            </Button>
          }
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Order / Date</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Pharmacy</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {orders.map(order => (
                  <tr key={order._id} className="hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => navigate(`/customer/orders/${order._id}`)}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-slate-900">
                        #{order.orderNumber || order._id.substring(order._id.length - 6).toUpperCase()}
                      </div>
                      <div className="text-xs font-medium text-slate-500 mt-1">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-slate-900">
                        {order.pharmacySnapshot?.name || 'Unknown Pharmacy'}
                      </div>
                      <div className="text-xs font-medium text-slate-500 mt-0.5">
                        {order.fulfilmentMethod}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={order.orderStatus} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-primary-600">
                      Rs. {Number(order.total).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end text-primary-600 group-hover:text-primary-800 transition-colors">
                        View Details <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default CustomerOrdersPage;
