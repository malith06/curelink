import React, { useState, useEffect } from 'react';
import { CreditCard, Banknote, DollarSign, Download } from 'lucide-react';
import { toast } from 'react-toastify';
import adminService from '../../../features/admin/adminService';
import Button from '../../../components/ui/Button';
import { generatePDFReport } from '../../../utils/reportGenerator';
import { Card, CardContent } from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Skeleton from '../../../components/ui/Skeleton';
import EmptyState from '../../../components/ui/EmptyState';

const AdminPaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterMethod, setFilterMethod] = useState('ALL');

  useEffect(() => {
    fetchPayments();
  }, [filterMethod]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterMethod !== 'ALL') {
        params.method = filterMethod;
      }
      
      const res = await adminService.getAllPayments(params);
      setPayments(res.data || []);
    } catch (error) {
      console.error('Failed to load payments', error);
      toast.error('Failed to load payment records');
    } finally {
      setLoading(false);
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'PAID':
      case 'COD_COLLECTED':
        return 'success';
      case 'PROCESSING':
      case 'COD_PENDING':
        return 'warning';
      case 'FAILED':
      case 'CANCELLED':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const handleDownloadReport = () => {
    const columns = ['Payment ID', 'Date', 'Customer', 'Pharmacy', 'Method', 'Status', 'Amount (Rs)'];
    const rows = payments.map(payment => [
      payment.paymentNumber,
      new Date(payment.createdAt).toLocaleString(),
      payment.customerId?.fullName || 'Unknown',
      payment.pharmacyId?.name || 'Unknown',
      payment.method,
      (payment.status || 'UNKNOWN').replace(/_/g, ' '),
      payment.amount ? (payment.amount / 100).toFixed(2) : '0.00'
    ]);
    generatePDFReport(
      `Payment Transactions Report (${filterMethod})`,
      columns,
      rows,
      `curelink_payments_${filterMethod.toLowerCase()}_${new Date().getTime()}.pdf`
    );
    toast.success('Report downloaded successfully!');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-green-600" />
            Payment Monitoring
          </h1>
          <p className="mt-2 text-slate-600">Monitor all system payments and transactions.</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white rounded-xl shadow-sm border border-slate-200 p-1">
            {['ALL', 'CARD', 'COD'].map((f) => (
              <button
                key={f}
                onClick={() => setFilterMethod(f)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                  filterMethod === f
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <Button 
            variant="outline"
            icon={Download}
            onClick={handleDownloadReport}
            disabled={payments.length === 0}
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
        ) : payments.length === 0 ? (
          <EmptyState
            icon={DollarSign}
            title="No Payments Found"
            message="There are no payment records matching this filter."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-100 text-xs uppercase font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4 whitespace-nowrap">Payment ID / Date</th>
                  <th className="px-6 py-4 whitespace-nowrap">Customer</th>
                  <th className="px-6 py-4 whitespace-nowrap">Pharmacy</th>
                  <th className="px-6 py-4 whitespace-nowrap">Method</th>
                  <th className="px-6 py-4 whitespace-nowrap">Status</th>
                  <th className="px-6 py-4 whitespace-nowrap text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-50">
                {payments.map(payment => (
                  <tr key={payment._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-slate-900">
                        {payment.paymentNumber}
                      </div>
                      <div className="text-xs font-medium text-slate-500 mt-1">
                        {new Date(payment.createdAt).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-slate-900">{payment.customerId?.fullName || 'Unknown'}</div>
                      <div className="text-xs font-medium text-slate-500 mt-1">{payment.customerId?.phone || 'No phone'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-slate-900">{payment.pharmacyId?.name || 'Unknown'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {payment.method === 'CARD' ? <CreditCard className="w-4 h-4 text-indigo-500" /> : <Banknote className="w-4 h-4 text-green-500" />}
                        <span className="text-sm font-bold text-slate-900">{payment.method}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={getStatusVariant(payment.status)}>
                        {(payment.status || 'UNKNOWN').replace(/_/g, ' ')}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-black text-slate-900">
                      Rs. {payment.amount ? (payment.amount / 100).toFixed(2) : '0.00'}
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

export default AdminPaymentsPage;
