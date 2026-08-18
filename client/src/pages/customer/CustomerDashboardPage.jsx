import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Map, Plus, Box, Bell, ShoppingBag, FileSignature } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import dashboardService from '../../features/dashboards/dashboardService';
import StatCard from '../../components/dashboard/StatCard';
import DashboardSection from '../../components/dashboard/DashboardSection';

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
      <div className="container mx-auto px-4 py-8 max-w-6xl animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Welcome back, {user?.name || 'Customer'}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Active Requests" 
          value={data?.summary?.activeRequests || 0} 
          icon={FileText} 
          colorClass="text-blue-600 bg-blue-100" 
          linkText="View Requests"
          linkUrl="/customer/requests"
        />
        <StatCard 
          title="Quotations Received" 
          value={data?.summary?.quotationsReceived || 0} 
          icon={FileSignature} 
          colorClass="text-indigo-600 bg-indigo-100" 
        />
        <StatCard 
          title="Active Orders" 
          value={data?.summary?.activeOrders || 0} 
          icon={ShoppingBag} 
          colorClass="text-green-600 bg-green-100" 
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
        <div className="lg:col-span-2 space-y-8">
          <DashboardSection 
            title="Recent Activity" 
            action={<Link to="/customer/requests/new" className="text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 px-4 py-2 rounded-lg transition-colors flex items-center"><Plus className="w-4 h-4 mr-1"/> New Request</Link>}
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {data?.activeOrders?.length > 0 ? (
                <ul className="divide-y divide-gray-100">
                  {data.activeOrders.map(order => (
                    <li key={order.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-gray-900">{order.orderNumber}</p>
                          <p className="text-sm text-gray-500">From {order.pharmacyName}</p>
                        </div>
                        <div className="text-right">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {order.orderStatus.replace(/_/g, ' ')}
                          </span>
                          <p className="text-sm font-medium text-gray-900 mt-1">{order.currency} {order.total}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-8 text-center text-gray-500">No active orders right now.</div>
              )}
            </div>
          </DashboardSection>

          <DashboardSection title="Actionable Quotations">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {data?.recentQuotations?.length > 0 ? (
                <ul className="divide-y divide-gray-100">
                  {data.recentQuotations.map(quote => (
                    <li key={quote.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-gray-900">{quote.pharmacyName}</p>
                          <p className="text-sm text-gray-500">Ref: {quote.requestNumber}</p>
                        </div>
                        <div className="text-right">
                           <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {quote.status}
                          </span>
                          <p className="text-sm font-medium text-gray-900 mt-1">{quote.currency} {quote.total}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-8 text-center text-gray-500">No new quotations to review.</div>
              )}
            </div>
          </DashboardSection>
        </div>

        <div className="space-y-8">
          <DashboardSection title="Quick Actions">
            <div className="grid grid-cols-1 gap-4">
              <Link to="/pharmacies/nearby" className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-primary-300 hover:shadow-md transition-all flex items-center group">
                <div className="p-3 bg-primary-50 text-primary-600 rounded-lg group-hover:bg-primary-100 mr-4">
                  <Map className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Nearby Pharmacies</h3>
                  <p className="text-sm text-gray-500">Find local providers</p>
                </div>
              </Link>
              <Link to="/customer/requests/new" className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-primary-300 hover:shadow-md transition-all flex items-center group">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 mr-4">
                  <Box className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Upload Prescription</h3>
                  <p className="text-sm text-gray-500">Get quotes instantly</p>
                </div>
              </Link>
            </div>
          </DashboardSection>

          <DashboardSection title="Recent Prescriptions">
             <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {data?.recentPrescriptions?.length > 0 ? (
                  <ul className="divide-y divide-gray-100">
                    {data.recentPrescriptions.map(px => (
                      <li key={px._id} className="p-4 hover:bg-gray-50 transition-colors flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-900">Uploaded {new Date(px.createdAt).toLocaleDateString()}</span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          {px.ocrStatus}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-6 text-center text-sm text-gray-500">No prescriptions uploaded yet.</div>
                )}
             </div>
          </DashboardSection>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboardPage;
