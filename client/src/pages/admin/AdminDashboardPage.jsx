import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import dashboardService from '../../features/dashboards/dashboardService';
import StatCard from '../../components/dashboard/StatCard';
import DashboardSection from '../../components/dashboard/DashboardSection';
import StatusChart from '../../components/dashboard/StatusChart';
import { Users, Store, FileText, Activity, AlertTriangle, CheckCircle, CreditCard } from 'lucide-react';

const AdminDashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('30d');

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const result = await dashboardService.getAdminDashboard({ range });
        setData(result.data);
      } catch (error) {
        console.error('Failed to fetch admin dashboard', error);
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
           {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">System-wide platform metrics</p>
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

      {/* Primary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard 
          title="Total Customers" 
          value={data?.summary?.totalCustomers || 0} 
          icon={Users} 
          colorClass="text-blue-600 bg-blue-100" 
        />
        <StatCard 
          title="Total Pharmacies" 
          value={data?.summary?.totalPharmacies || 0} 
          icon={Store} 
          colorClass="text-indigo-600 bg-indigo-100" 
          linkUrl="/admin/pharmacies"
          linkText="Manage"
        />
        <StatCard 
          title="Pending Approvals" 
          value={data?.summary?.pendingPharmacyApprovals || 0} 
          icon={AlertTriangle} 
          colorClass={data?.summary?.pendingPharmacyApprovals > 0 ? "text-amber-600 bg-amber-100" : "text-gray-500 bg-gray-100"} 
        />
        <StatCard 
          title="Total Orders" 
          value={data?.summary?.totalOrders || 0} 
          icon={FileText} 
          colorClass="text-purple-600 bg-purple-100" 
        />
        <StatCard 
          title="Active Orders" 
          value={data?.summary?.activeOrders || 0} 
          icon={Activity} 
          colorClass="text-green-600 bg-green-100" 
        />
        <StatCard 
          title="Total Paid Value (LKR)" 
          value={(data?.summary?.totalPayments || 0).toLocaleString()} 
          icon={CreditCard} 
          colorClass="text-emerald-600 bg-emerald-100" 
        />
        <StatCard 
          title="Failed Payments" 
          value={data?.summary?.failedPayments || 0} 
          icon={AlertTriangle} 
          colorClass={data?.summary?.failedPayments > 0 ? "text-red-600 bg-red-100" : "text-gray-500 bg-gray-100"} 
        />
        <StatCard 
          title="OCR Failures" 
          value={data?.summary?.ocrFailures || 0} 
          icon={CheckCircle} 
          colorClass={data?.summary?.ocrFailures > 0 ? "text-red-600 bg-red-100" : "text-gray-500 bg-gray-100"} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <DashboardSection title="Orders by Status">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <StatusChart data={data?.charts?.ordersByStatus} />
          </div>
        </DashboardSection>
        <DashboardSection title="OCR Processing Outcomes">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <StatusChart data={data?.charts?.ocrOutcomes} />
          </div>
        </DashboardSection>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <DashboardSection title="Pending Pharmacy Approvals">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {data?.pendingPharmacies?.length > 0 ? (
              <ul className="divide-y divide-gray-100">
                {data.pendingPharmacies.map(pharmacy => (
                  <li key={pharmacy._id} className="p-4 hover:bg-gray-50 flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-900">{pharmacy.name}</p>
                      <p className="text-sm text-gray-500">{pharmacy.contactEmail} • Lic: {pharmacy.licenseNumber}</p>
                    </div>
                    <div>
                      <Link to={`/admin/pharmacies/${pharmacy._id}`} className="text-sm font-medium text-primary-600 hover:text-primary-800">
                        Review &rarr;
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-8 text-center text-gray-500">No pending pharmacies to review.</div>
            )}
          </div>
        </DashboardSection>

        <DashboardSection title="Popular Requested Medicines">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden p-6">
            {data?.popularMedicines?.length > 0 ? (
              <div className="space-y-4">
                {data.popularMedicines.map((med, idx) => (
                  <div key={idx} className="flex items-center">
                    <div className="w-1/3 truncate font-medium text-gray-700 text-sm">{med.name}</div>
                    <div className="w-2/3 flex items-center">
                      <div className="bg-primary-100 h-2 rounded-full" style={{ width: `${Math.min((med.count / data.popularMedicines[0].count) * 100, 100)}%` }}></div>
                      <span className="ml-2 text-xs text-gray-500">{med.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-4">No medicine requests in this period.</div>
            )}
          </div>
        </DashboardSection>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
