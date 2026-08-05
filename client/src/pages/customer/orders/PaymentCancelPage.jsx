import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';

const PaymentCancelPage = () => {
  const { orderId } = useParams();

  return (
    <div className="max-w-2xl mx-auto py-16 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 md:p-12 text-center">
        <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-12 h-12 text-red-600" />
        </div>
        
        <h1 className="text-3xl font-bold text-slate-900 mb-4">
          Payment Cancelled
        </h1>
        
        <p className="text-lg text-slate-600 mb-8 max-w-md mx-auto">
          Your payment process was cancelled or interrupted. Don't worry, your order is still saved. You can try paying again when you're ready.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to={`/customer/orders/${orderId}/payment`}
            className="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Try Payment Again
          </Link>
          <Link
            to="/customer/orders"
            className="inline-flex items-center justify-center px-6 py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Orders
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancelPage;
