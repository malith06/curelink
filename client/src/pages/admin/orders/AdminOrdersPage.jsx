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
    <div className="max-w-7xl mx-auto px-4 py-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <ShoppingBag className="w-8 h-8 text-indigo-600" />
            Platform Orders
          </h1>
          <p className="mt-2 text-slate-600">Monitor all orders placed through the platform.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex items-center gap-2 bg-white rounded-xl shadow-sm border border-slate-200 p-1">
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 rounded-lg text-sm font-medium border-0 focus:ring-0 cursor-pointer"
            >
              <option value="ALL">All Orders</option>
              <option value="PENDING">Pending</option>
              <option value="PROCESSING">Processing</option>
              <option value="COMPLETED">Completed</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
          <Button 
            variant="outline"
            icon={Download}
            onClick={handleDownloadReport}
            disabled={orders.length === 0}
          >
            Download PDF
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden mb-8">
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
  );
};

export default AdminOrdersPage;
