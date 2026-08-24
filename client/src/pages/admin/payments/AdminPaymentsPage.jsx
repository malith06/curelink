import React, { useState, useEffect } from 'react';
import { CreditCard, Banknote, Loader2, DollarSign, Download } from 'lucide-react';
import { toast } from 'react-toastify';
import adminService from '../../../features/admin/adminService';
import Button from '../../../components/ui/Button';
import { generatePDFReport } from '../../../utils/reportGenerator';

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

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PAID':
      case 'COD_COLLECTED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'PROCESSING':
      case 'COD_PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'FAILED':
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const handleDownloadReport = () => {
    const columns = ['Payment ID', 'Date', 'Customer', 'Pharmacy', 'Method', 'Status', 'Amount (Rs)'];
    const rows = payments.map(payment => [
      payment.paymentNumber,
      new Date(payment.createdAt).toLocaleString(),
      payment.customerId?.name || 'Unknown',
      payment.pharmacyId?.name || 'Unknown',
      payment.method,
      payment.status.replace(/_/g, ' '),
      (payment.amount / 100).toFixed(2)
    ]);
    generatePDFReport(
      `Payment Transactions Report (${filterMethod})`,
      columns,
      rows,
      `curelink_payments_${filterMethod.toLowerCase()}_${new Date().getTime()}.pdf`
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl animate-in fade-in duration-500">
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
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterMethod === f
                    ? 'bg-indigo-600 text-white'
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

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      ) : payments.length === 0 ? (
        <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center">
          <DollarSign className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No Payments Found</h3>
          <p className="text-slate-500">There are no payment records matching this filter.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Payment ID / Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Pharmacy</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Method</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {payments.map(payment => (
                  <tr key={payment._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-slate-900">
                        {payment.paymentNumber}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {new Date(payment.createdAt).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900">{payment.customerId?.name || 'Unknown'}</div>
                      <div className="text-xs text-slate-500">{payment.customerId?.phone || 'No phone'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900">{payment.pharmacyId?.name || 'Unknown'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {payment.method === 'CARD' ? <CreditCard className="w-4 h-4 text-indigo-500" /> : <Banknote className="w-4 h-4 text-green-500" />}
                        <span className="text-sm font-medium text-slate-900">{payment.method}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full border ${getStatusBadge(payment.status)}`}>
                        {payment.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">
                      Rs. {(payment.amount / 100).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPaymentsPage;
