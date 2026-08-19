import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import dashboardService from '../../features/dashboards/dashboardService';
import StatCard from '../../components/dashboard/StatCard';
import DashboardSection from '../../components/dashboard/DashboardSection';
import StatusChart from '../../components/dashboard/StatusChart';
import TrendChart from '../../components/dashboard/TrendChart';
import { Inbox, FileSignature, ShoppingBag, CheckCircle, DollarSign, Clock } from 'lucide-react';

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
      <div className="container mx-auto px-4 py-8 max-w-7xl animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-64 bg-gray-200 rounded-xl"></div>
          <div className="h-64 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pharmacy Dashboard</h1>
          <p className="mt-2 text-gray-600">Overview for {user?.pharmacy?.name || 'your pharmacy'}</p>
        </div>
        <div className="flex items-center">
          <label htmlFor="range" className="text-sm font-medium text-gray-700 mr-2">Time Range:</label>
          <select
            id="range"
            value={range}
            onChange={handleRangeChange}
            className="border-gray-300 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <StatCard 
          title="Incoming Requests" 
          value={data?.summary?.incomingRequests || 0} 
          icon={Inbox} 
          colorClass="text-blue-600 bg-blue-100" 
          linkUrl="/pharmacy/inbox"
        />
        <StatCard 
          title="Active Quotes" 
          value={data?.summary?.submittedQuotations || 0} 
          icon={FileSignature} 
          colorClass="text-indigo-600 bg-indigo-100" 
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
          colorClass="text-green-600 bg-green-100" 
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
          colorClass="text-purple-600 bg-purple-100" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <DashboardSection title="Order Fulfillment Value">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <TrendChart data={data?.charts?.fulfilledValueTrend} color="#10b981" />
          </div>
        </DashboardSection>
        <DashboardSection title="Orders by Status">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <StatusChart data={data?.charts?.ordersByStatus} />
          </div>
        </DashboardSection>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <DashboardSection title="Recent Incoming Requests">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {data?.incomingRequests?.length > 0 ? (
              <ul className="divide-y divide-gray-100">
                {data.incomingRequests.map(req => (
                  <li key={req.id} className="p-4 hover:bg-gray-50 flex justify-between items-center">
                    <div>
                      <Link to={`/pharmacy/requests/${req.id}`} className="font-semibold text-primary-600 hover:text-primary-800">
                        {req.requestNumber}
                      </Link>
                      <p className="text-sm text-gray-500">{req.medicineCount} items • {new Date(req.submittedAt).toLocaleDateString()}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-8 text-center text-gray-500">No recent requests in inbox.</div>
            )}
          </div>
        </DashboardSection>

        <DashboardSection title="Active Orders To Prepare">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
             {data?.activeOrders?.length > 0 ? (
              <ul className="divide-y divide-gray-100">
                {data.activeOrders.map(order => (
                  <li key={order.id} className="p-4 hover:bg-gray-50 flex justify-between items-center">
                    <div>
                      <Link to={`/pharmacy/orders/${order.id}`} className="font-semibold text-primary-600 hover:text-primary-800">
                        {order.orderNumber}
                      </Link>
                      <p className="text-sm text-gray-500">{order.safeCustomerName}</p>
                    </div>
                    <div className="text-right">
                       <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                        {order.orderStatus.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-8 text-center text-gray-500">No active orders needing attention.</div>
            )}
          </div>
        </DashboardSection>
      </div>
    </div>
  );
};

export default PharmacyDashboardPage;
