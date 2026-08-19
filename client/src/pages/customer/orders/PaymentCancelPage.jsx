import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';

const PaymentCancelPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto py-16 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="text-center overflow-hidden border-0 shadow-xl shadow-rose-900/5 ring-1 ring-slate-200/50">
        <div className="h-32 bg-gradient-to-b from-rose-50 to-white w-full absolute top-0 left-0 -z-10"></div>
        <CardContent className="p-8 md:p-12">
          <div className="w-28 h-28 bg-rose-100/80 rounded-full flex items-center justify-center mx-auto mb-8 relative">
            <div className="absolute inset-0 bg-rose-200/50 rounded-full animate-pulse opacity-50"></div>
            <XCircle className="w-14 h-14 text-rose-600 relative z-10" />
          </div>
          
          <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">
            Payment Cancelled
          </h1>
          
          <p className="text-lg text-slate-600 mb-10 max-w-md mx-auto font-medium leading-relaxed">
            Your payment process was cancelled or interrupted. Don't worry, your order is still saved. You can try paying again when you're ready.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate(`/customer/orders/${orderId}/payment`)}
              icon={RefreshCw}
              size="lg"
            >
              Try Payment Again
            </Button>
            <Button
              onClick={() => navigate('/customer/orders')}
              variant="outline"
              size="lg"
              className="group"
            >
              <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Orders
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentCancelPage;
