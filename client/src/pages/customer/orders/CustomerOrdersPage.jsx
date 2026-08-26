import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, ArrowRight, ChevronRight, Store, Truck, Clock } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState('ALL');
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

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'PROCESSING') return ['PAYMENT_CONFIRMED', 'PHARMACY_ACCEPTED', 'PREPARING'].includes(order.orderStatus);
    if (activeTab === 'DELIVERY') return ['READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.orderStatus);
    if (activeTab === 'CANCELLED') return ['CANCELLED', 'REJECTED'].includes(order.orderStatus);
    return order.orderStatus === activeTab;
  });

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
        <div className="flex items-center gap-4">
           <div className="w-14 h-14 bg-[#0B1354]/10 rounded-2xl flex items-center justify-center">
              <Package className="w-7 h-7 text-[#0B1354]" />
           </div>
           <div>
             <h1 className="text-3xl font-bold text-[#0B1354] tracking-tight">My Orders</h1>
             <p className="mt-1 text-slate-500 font-medium">Track your confirmed medicine orders.</p>
           </div>
        </div>
      </div>

      {/* Status Tabs */}
      {!loading && orders.length > 0 && (
        <div className="flex overflow-x-auto gap-2 mb-6 pb-2 custom-scrollbar">
          {['ALL', 'PENDING_PAYMENT', 'PROCESSING', 'DELIVERY', 'COMPLETED', 'CANCELLED'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tab === 'ALL' ? 'All Orders' : tab.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}
            </button>
          ))}
        </div>
      )}

      {filteredOrders.length === 0 ? (
        <EmptyState 
          icon={Package}
          title={orders.length === 0 ? "No Orders Yet" : `No ${activeTab.toLowerCase().replace(/_/g, ' ')} orders`}
          description={orders.length === 0 ? "You haven't converted any quotations into orders yet." : "Try selecting a different filter."}
          action={
            orders.length === 0 && (
              <Button onClick={() => navigate('/customer/requests')} icon={ArrowRight}>
                Go to your requests
              </Button>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrders.map(order => (
            <Card 
              key={order._id} 
              className="flex flex-col hover:border-primary-300 hover:shadow-md transition-all cursor-pointer group"
              onClick={() => navigate(`/customer/orders/${order._id}`)}
            >
              <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg group-hover:text-primary-700 transition-colors">
                      #{order.orderNumber || order._id.substring(order._id.length - 6).toUpperCase()}
                    </h3>
                    <div className="flex items-center text-xs text-slate-500 mt-1 gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <StatusBadge status={order.orderStatus} />
                </div>
                
                <div className="space-y-3 mt-6">
                  <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <div className="bg-white p-1.5 rounded-md shadow-sm border border-slate-100">
                      <Store className="w-4 h-4 text-primary-500" />
                    </div>
                    <div>
                      <span className="font-semibold text-slate-900 line-clamp-1">{order.pharmacySnapshot?.name || 'Unknown Pharmacy'}</span>
                      <span className="text-xs">{order.pharmacySnapshot?.address?.city || 'Location unavailable'}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <div className="bg-white p-1.5 rounded-md shadow-sm border border-slate-100">
                      <Truck className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div>
                      <span className="font-semibold text-slate-900">{order.fulfilmentMethod}</span>
                      <span className="text-xs ml-1">Method</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 rounded-b-xl flex justify-between items-center group-hover:bg-primary-50 transition-colors">
                <span className="font-black text-primary-700">Rs. {Number(order.total).toFixed(2)}</span>
                <div className="flex items-center text-sm font-medium text-primary-600 group-hover:text-primary-700">
                  View Details <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerOrdersPage;
