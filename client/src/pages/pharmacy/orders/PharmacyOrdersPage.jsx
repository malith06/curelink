import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PackageSearch, ArrowRight, Filter, Phone, Clock, Search, Package } from 'lucide-react';
import orderService from '../../../features/orders/orderService';
import { ORDER_STATUS } from '../../../features/orders/orderConstants';
import { toast } from 'react-toastify';
import { Card } from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Skeleton from '../../../components/ui/Skeleton';
import EmptyState from '../../../components/ui/EmptyState';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const PharmacyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // ALL, ACTIVE, COMPLETED, CANCELLED
  const [searchTerm, setSearchTerm] = useState('');
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
        params.status = `${ORDER_STATUS.PENDING_PAYMENT},${ORDER_STATUS.PAYMENT_CONFIRMED},${ORDER_STATUS.PHARMACY_ACCEPTED},${ORDER_STATUS.PREPARING},${ORDER_STATUS.READY_FOR_PICKUP},${ORDER_STATUS.OUT_FOR_DELIVERY}`;
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

  const filteredOrders = orders.filter(order => {
    const orderIdStr = order.orderNumber || (order._id ? order._id.substring(order._id.length - 6).toUpperCase() : '');
    return !searchTerm || orderIdStr.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex items-center gap-4">
           <div className="w-14 h-14 bg-[#0B1354]/10 rounded-2xl flex items-center justify-center">
              <PackageSearch className="w-7 h-7 text-[#0B1354]" />
           </div>
           <div>
             <h1 className="text-3xl font-bold text-[#0B1354] tracking-tight">Manage Orders</h1>
             <p className="mt-1 text-slate-500 font-medium">Review and fulfill customer orders.</p>
           </div>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5 mb-6 pb-2 custom-scrollbar overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {['ALL', 'ACTIVE', 'COMPLETED', 'CANCELLED'].map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  filter === status 
                    ? 'bg-[#0B1354] text-white shadow-sm' 
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {status === 'ALL' ? 'All Orders' : status.charAt(0) + status.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
          <div className="w-full md:w-72">
             <Input 
                icon={Search} 
                placeholder="Search by Order ID..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
             />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-64 w-full" />)}
          </div>
        ) : filteredOrders.length === 0 ? (
          <EmptyState 
            icon={Package}
            title="No orders found"
            description="You don't have any orders matching these filters."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrders.map(order => (
              <Card 
                key={order._id} 
                className="flex flex-col hover:border-primary-300 hover:shadow-md transition-all cursor-pointer group"
                onClick={() => navigate(`/pharmacy/orders/${order._id}`)}
              >
                <div className="p-5 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg group-hover:text-primary-700 transition-colors uppercase">
                        #{order.orderNumber || order._id.substring(order._id.length - 6)}
                      </h3>
                      <div className="flex items-center text-xs text-slate-500 mt-1 gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <Badge variant={getStatusBadge(order.orderStatus)}>
                      {order.orderStatus.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                  
                  <div className="space-y-4 mt-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0">
                        <span className="font-bold text-slate-600 text-sm">
                          {(order.customerSnapshot?.fullName || 'C').charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="overflow-hidden">
                        <div className="font-bold text-slate-900 truncate">
                          {order.customerSnapshot?.fullName || 'Customer'}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center mt-0.5 truncate">
                          <Phone className="w-3 h-3 mr-1" />
                          {order.customerSnapshot?.phone || 'No phone'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <div className="flex items-center gap-2">
                        <div className="bg-white px-2 py-1 rounded shadow-sm border border-slate-100 flex items-center">
                           <span className="text-xs font-bold text-slate-700">{order.fulfilmentMethod}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-slate-500 font-medium">Total</div>
                        <div className="font-bold text-primary-700">Rs. {order.total ? order.total.toFixed(2) : '0.00'}</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 rounded-b-xl flex justify-between items-center group-hover:bg-primary-50 transition-colors">
                  <span className="text-sm font-medium text-slate-500">Click to manage</span>
                  <div className="flex items-center text-sm font-bold text-primary-600 group-hover:text-primary-700">
                    Manage Order <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PharmacyOrdersPage;
