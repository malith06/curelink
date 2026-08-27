import React, { useState, useEffect } from 'react';
import { ShoppingBag, Download } from 'lucide-react';
import { toast } from 'react-toastify';
import adminService from '../../../features/admin/adminService';
import Button from '../../../components/ui/Button';
import { generatePDFReport } from '../../../utils/reportGenerator';
import { Card, CardContent } from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Skeleton from '../../../components/ui/Skeleton';
import EmptyState from '../../../components/ui/EmptyState';

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    fetchOrders();
  }, [filterStatus]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = filterStatus !== 'ALL' ? { status: filterStatus } : {};
      const result = await adminService.getAllOrders(params);
      setOrders(result.data || []);
    } catch (error) {
      console.error('Failed to fetch orders', error);
      toast.error('Failed to load platform orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'PENDING_PAYMENT':
      case 'PAYMENT_CONFIRMED':
        return 'warning';
      case 'PHARMACY_ACCEPTED':
      case 'PREPARING':
        return 'info';
      case 'READY_FOR_PICKUP':
      case 'OUT_FOR_DELIVERY':
        return 'default';
      case 'COMPLETED':
      case 'DELIVERED':
        return 'success';
      case 'CANCELLED':
      case 'REJECTED':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const handleDownloadReport = () => {
    const columns = ['Order ID', 'Date', 'Customer', 'Pharmacy', 'Payment', 'Order Status', 'Amount (Rs)'];
    const rows = orders.map(order => [
      order.orderNumber,
      new Date(order.createdAt).toLocaleString(),
      order.customerId?.fullName || 'Unknown',
      order.pharmacyId?.name || 'Unknown',
      order.paymentStatus || 'Unknown',
      (order.orderStatus || 'UNKNOWN').replace(/_/g, ' '),
      order.total ? (order.total / 100).toFixed(2) : '0.00'
    ]);
    generatePDFReport(
      `Platform Orders Report (${filterStatus})`,
      columns,
      rows,
      `curelink_orders_${filterStatus.toLowerCase()}_${new Date().getTime()}.pdf`
    );
    toast.success('Report downloaded successfully!');
  };

  return (
    <div className="animate-in fade-in duration-500 bg-slate-50 min-h-screen">
      {/* Modern Header Section */}
      <div className="bg-[#0B1354] pb-24 pt-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden rounded-b-[3rem] mb-[-4rem]">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500 rounded-full mix-blend-screen filter blur-[80px] opacity-30 animate-pulse"></div>
        
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Platform Orders
            </h1>
            <p className="mt-2 text-blue-100 font-medium">Monitor all orders placed through the platform.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex flex-wrap items-center gap-2 bg-white/10 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-1.5">
              {['ALL', 'PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilterStatus(f)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm outline-none ${
                    filterStatus === f
                      ? 'bg-white text-slate-900 shadow-md'
                      : 'text-white hover:bg-white/20'
                  }`}
                >
                  {f === 'ALL' ? 'All Orders' : f.charAt(0) + f.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
            <Button 
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 shadow-lg backdrop-blur-md"
              icon={Download}
              onClick={handleDownloadReport}
              disabled={orders.length === 0}
            >
              Download PDF
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 relative z-20">
        <Card className="overflow-hidden mb-8 border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl">
        {loading ? (
          <div className="p-6 space-y-4">
             {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        ) : orders.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="No orders found"
            message="There are currently no platform orders matching your criteria."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-100 text-xs uppercase font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4 whitespace-nowrap">Order Details</th>
                  <th className="px-6 py-4 whitespace-nowrap">Customer</th>
                  <th className="px-6 py-4 whitespace-nowrap">Pharmacy</th>
                  <th className="px-6 py-4 whitespace-nowrap">Amount</th>
                  <th className="px-6 py-4 whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-50">
                {orders.map(order => (
                  <tr key={order._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-slate-900">
                        {order.orderNumber}
                      </div>
                      <div className="text-xs font-medium text-slate-500 mt-1">
                        {new Date(order.createdAt).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-slate-900">{order.customerId?.fullName || 'Unknown'}</div>
                      <div className="text-xs font-medium text-slate-500 mt-1">{order.customerId?.phone || 'No phone'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-slate-900">{order.pharmacyId?.name || 'Unknown'}</div>
                      <div className="text-xs font-medium text-slate-500 mt-1">{order.pharmacyId?.email || 'No email'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-slate-900">
                        Rs. {order.total ? (order.total / 100).toFixed(2) : '0.00'}
                      </div>
                      <div className="text-xs font-medium text-slate-500 mt-1">
                        {order.paymentStatus || 'Unknown'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={getStatusVariant(order.orderStatus)}>
                        {(order.orderStatus || 'UNKNOWN').replace(/_/g, ' ')}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      </div>
    </div>
  );
};

export default AdminOrdersPage;
