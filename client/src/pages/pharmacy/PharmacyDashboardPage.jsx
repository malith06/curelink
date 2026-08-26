import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import dashboardService from '../../features/dashboards/dashboardService';
import StatCard from '../../components/dashboard/StatCard';
import DashboardSection from '../../components/dashboard/DashboardSection';
import StatusChart from '../../components/dashboard/StatusChart';
import TrendChart from '../../components/dashboard/TrendChart';
import { Inbox, FileSignature, ShoppingBag, CheckCircle, DollarSign, Clock, Store } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import StatusBadge from '../../components/ui/StatusBadge';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';

const PharmacyDashboardPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('30d');

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const result = await dashboardService.getPharmacyDashboard({ range });
        setData(result.data);
      } catch (error) {
        console.error('Failed to fetch dashboard', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [range]);

  const handleRangeChange = (e) => {
    setRange(e.target.value);
  };

  if (loading && !data) {
    return (
      <div className="mx-auto px-4 py-8 max-w-7xl">
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-5 w-48 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-[#0B1354]/10 p-3 rounded-xl text-[#0B1354]">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#0B1354] tracking-tight">Pharmacy Dashboard</h1>
            <p className="mt-1 text-slate-500 font-medium">Overview for {user?.pharmacy?.name || 'your pharmacy'}</p>
          </div>
        </div>
        <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
          <label htmlFor="range" className="text-sm font-medium text-slate-500 mx-3">Time Range:</label>
          <select
            id="range"
            value={range}
            onChange={handleRangeChange}
            className="border-0 bg-transparent text-sm font-medium text-slate-900 focus:ring-0 cursor-pointer py-1.5 pl-2 pr-8 outline-none"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5 mb-10">
        <StatCard 
          title="Incoming Requests" 
          value={data?.summary?.incomingRequests || 0} 
          icon={Inbox} 
          colorClass="text-[#0B1354] bg-[#0B1354]/10" 
          linkUrl="/pharmacy/inbox"
        />
        <StatCard 
          title="Active Quotes" 
          value={data?.summary?.submittedQuotations || 0} 
          icon={FileSignature} 
          colorClass="text-[#0B1354] bg-[#0B1354]/10" 
        />
        <StatCard 
          title="Active Orders" 
          value={data?.summary?.activeOrders || 0} 
          icon={ShoppingBag} 
          colorClass="text-amber-600 bg-amber-100" 
          linkUrl="/pharmacy/orders"
        />
        <StatCard 
          title="Completed Orders" 
          value={data?.summary?.completedOrders || 0} 
          icon={CheckCircle} 
          colorClass="text-emerald-600 bg-emerald-100" 
        />
        <StatCard 
          title="Gross Value (LKR)" 
          value={(data?.summary?.grossFulfilledOrderValue || 0).toLocaleString()} 
          icon={DollarSign} 
          colorClass="text-emerald-600 bg-emerald-100" 
        />
        <StatCard 
          title="Avg Response (Min)" 
          value={data?.summary?.averageResponseMinutes || '-'} 
          icon={Clock} 
          colorClass="text-[#0B1354] bg-[#0B1354]/10" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <DashboardSection title="Order Fulfillment Value">
          <Card>
            <CardContent className="p-6">
              <TrendChart data={data?.charts?.fulfilledValueTrend} color="#10b981" />
            </CardContent>
          </Card>
        </DashboardSection>
        <DashboardSection title="Orders by Status">
          <Card>
            <CardContent className="p-6">
              <StatusChart data={data?.charts?.ordersByStatus} />
            </CardContent>
          </Card>
        </DashboardSection>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <DashboardSection title="Recent Incoming Requests">
          <Card>
            {data?.incomingRequests?.length > 0 ? (
              <ul className="divide-y divide-slate-100">
                {data.incomingRequests.map(req => (
                  <li key={req.id} className="p-5 hover:bg-slate-50 transition-colors flex justify-between items-center">
                    <div>
                      <Link to={`/pharmacy/requests/${req.id}`} className="font-semibold text-primary-600 hover:text-primary-800 transition-colors">
                        {req.requestNumber}
                      </Link>
                      <p className="text-sm text-slate-500 mt-1">{req.medicineCount} items • {new Date(req.submittedAt).toLocaleDateString()}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState 
                icon={Inbox}
                title="Inbox is empty"
                description="No recent requests from customers."
              />
            )}
          </Card>
        </DashboardSection>

        <DashboardSection title="Active Orders To Prepare">
          <Card>
             {data?.activeOrders?.length > 0 ? (
              <ul className="divide-y divide-slate-100">
                {data.activeOrders.map(order => (
                  <li key={order.id} className="p-5 hover:bg-slate-50 transition-colors flex justify-between items-center">
                    <div>
                      <Link to={`/pharmacy/orders/${order.id}`} className="font-semibold text-primary-600 hover:text-primary-800 transition-colors">
                        {order.orderNumber}
                      </Link>
                      <p className="text-sm text-slate-500 mt-1">{order.safeCustomerName}</p>
                    </div>
                    <div className="text-right">
                      <StatusBadge status={order.orderStatus} />
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState 
                icon={ShoppingBag}
                title="All caught up"
                description="No active orders needing attention right now."
              />
            )}
          </Card>
        </DashboardSection>
      </div>
    </div>
  );
};

export default PharmacyDashboardPage;
