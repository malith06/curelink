import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, MapPin, Plus, Box, Bell, ShoppingBag, FileSignature, Home } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import dashboardService from '../../features/dashboards/dashboardService';
import StatCard from '../../components/dashboard/StatCard';
import DashboardSection from '../../components/dashboard/DashboardSection';
import Button from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import StatusBadge from '../../components/ui/StatusBadge';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';

const CustomerDashboardPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const result = await dashboardService.getCustomerDashboard();
        setData(result.data);
      } catch (error) {
        console.error('Failed to fetch dashboard', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="mx-auto px-4 py-8 max-w-7xl">
        <Skeleton className="h-10 w-48 mb-2" />
        <Skeleton className="h-5 w-64 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex items-center gap-4">
           <div className="w-14 h-14 bg-[#0B1354]/10 rounded-2xl flex items-center justify-center">
              <Home className="w-7 h-7 text-[#0B1354]" />
           </div>
           <div>
             <h1 className="text-3xl font-bold text-[#0B1354] tracking-tight">Dashboard</h1>
             <p className="mt-1 text-slate-500 font-medium">Welcome back, {user?.name || 'Customer'}</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard 
          title="Active Requests" 
          value={data?.summary?.activeRequests || 0} 
          icon={FileText} 
          colorClass="text-[#0B1354] bg-[#0B1354]/10" 
          linkText="View Requests"
          linkUrl="/customer/requests"
        />
        <StatCard 
          title="Quotations Received" 
          value={data?.summary?.quotationsReceived || 0} 
          icon={FileSignature} 
          colorClass="text-[#0B1354] bg-[#0B1354]/10" 
        />
        <StatCard 
          title="Active Orders" 
          value={data?.summary?.activeOrders || 0} 
          icon={ShoppingBag} 
          colorClass="text-emerald-600 bg-emerald-100" 
          linkText="View Orders"
          linkUrl="/customer/orders"
        />
        <StatCard 
          title="Unread Notifications" 
          value={data?.summary?.unreadNotifications || 0} 
          icon={Bell} 
          colorClass="text-amber-600 bg-amber-100" 
          linkText="View Notifications"
          linkUrl="/notifications"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-10">
          <DashboardSection 
            title="Recent Activity" 
            action={
              <Link to="/customer/requests/new">
                <Button size="sm" icon={Plus}>New Request</Button>
              </Link>
            }
          >
            <Card className="border-t-4 border-t-[#0B1354] rounded-2xl shadow-sm">
              {data?.activeOrders?.length > 0 ? (
                <ul className="divide-y divide-slate-100">
                  {data.activeOrders.map(order => (
                    <li key={order.id} className="p-5 hover:bg-slate-50 transition-colors">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-slate-900">{order.orderNumber}</p>
                          <p className="text-sm text-slate-500">From {order.pharmacyName}</p>
                        </div>
                        <div className="text-right flex flex-col items-end">
                          <StatusBadge status={order.orderStatus} />
                          <p className="text-sm font-medium text-slate-900 mt-2">{order.currency} {order.total}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState 
                  icon={ShoppingBag}
                  title="No active orders"
                  description="You don't have any active orders at the moment."
                />
              )}
            </Card>
          </DashboardSection>

          <DashboardSection title="Actionable Quotations">
            <Card>
              {data?.recentQuotations?.length > 0 ? (
                <ul className="divide-y divide-slate-100">
                  {data.recentQuotations.map(quote => (
                    <li key={quote.id} className="p-5 hover:bg-slate-50 transition-colors">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-slate-900">{quote.pharmacyName}</p>
                          <p className="text-sm text-slate-500">Ref: {quote.requestNumber}</p>
                        </div>
                        <div className="text-right flex flex-col items-end">
                          <StatusBadge status={quote.status} />
                          <p className="text-sm font-medium text-slate-900 mt-2">{quote.currency} {quote.total}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState 
                  icon={FileSignature}
                  title="No pending quotes"
                  description="You don't have any new quotations to review right now."
                />
              )}
            </Card>
          </DashboardSection>
        </div>

        <div className="space-y-10">
          <DashboardSection title="Quick Actions">
            <div className="grid grid-cols-1 gap-4">
              <Link to="/pharmacies/nearby" className="group block">
                <Card className="hover:border-primary-300 hover:shadow-md transition-all">
                  <CardContent className="p-5 flex items-center">
                    <div className="p-3 bg-primary-50 text-primary-600 rounded-xl group-hover:bg-primary-100 transition-colors mr-4">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">Nearby Pharmacies</h3>
                      <p className="text-sm text-slate-500">Find local providers</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              <Link to="/customer/requests/new" className="group block">
                <Card className="hover:border-indigo-300 hover:shadow-md transition-all">
                  <CardContent className="p-5 flex items-center">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-100 transition-colors mr-4">
                      <Box className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">Upload Prescription</h3>
                      <p className="text-sm text-slate-500">Get quotes instantly</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </DashboardSection>

          <DashboardSection title="Recent Prescriptions">
             <Card>
                {data?.recentPrescriptions?.length > 0 ? (
                  <ul className="divide-y divide-slate-100">
                    {data.recentPrescriptions.map(px => (
                      <li key={px._id} className="p-4 flex justify-between items-center">
                        <span className="text-sm font-medium text-slate-900">
                          {new Date(px.createdAt).toLocaleDateString()}
                        </span>
                        <StatusBadge status={px.ocrStatus} />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-6 text-center text-sm text-slate-500">No prescriptions uploaded yet.</div>
                )}
             </Card>
          </DashboardSection>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboardPage;
