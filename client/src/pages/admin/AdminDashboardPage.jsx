import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import dashboardService from '../../features/dashboards/dashboardService';
import StatCard from '../../components/dashboard/StatCard';
import DashboardSection from '../../components/dashboard/DashboardSection';
import StatusChart from '../../components/dashboard/StatusChart';
import { Users, Store, FileText, Activity, AlertTriangle, CheckCircle, CreditCard, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import Badge from '../../components/ui/Badge';

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
      <div className="mx-auto px-4 py-8 max-w-7xl">
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-5 w-48 mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
           {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Admin Dashboard</h1>
          <p className="mt-1 text-slate-600">System-wide platform metrics</p>
        </div>
        <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
          <label htmlFor="range" className="text-sm font-medium text-slate-500 mx-3">Time Range:</label>
          <select
            id="range"
            value={range}
            onChange={handleRangeChange}
            className="border-0 bg-transparent text-sm font-medium text-slate-900 focus:ring-0 cursor-pointer py-1.5 pl-2 pr-8"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
        </div>
      </div>

      {/* Primary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
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
          colorClass={data?.summary?.pendingPharmacyApprovals > 0 ? "text-amber-600 bg-amber-100" : "text-slate-500 bg-slate-100"} 
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
          colorClass={data?.summary?.failedPayments > 0 ? "text-red-600 bg-red-100" : "text-slate-500 bg-slate-100"} 
        />
        <StatCard 
          title="OCR Failures" 
          value={data?.summary?.ocrFailures || 0} 
          icon={CheckCircle} 
          colorClass={data?.summary?.ocrFailures > 0 ? "text-red-600 bg-red-100" : "text-slate-500 bg-slate-100"} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <DashboardSection title="Orders by Status">
          <Card>
            <CardContent className="p-6">
              <StatusChart data={data?.charts?.ordersByStatus} />
            </CardContent>
          </Card>
        </DashboardSection>
        <DashboardSection title="OCR Processing Outcomes">
          <Card>
            <CardContent className="p-6">
              <StatusChart data={data?.charts?.ocrOutcomes} />
            </CardContent>
          </Card>
        </DashboardSection>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <DashboardSection title="Pending Pharmacy Approvals">
          <Card>
            {data?.pendingPharmacies?.length > 0 ? (
              <ul className="divide-y divide-slate-100">
                {data.pendingPharmacies.map(pharmacy => (
                  <li key={pharmacy._id} className="p-5 hover:bg-slate-50 transition-colors flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-slate-900">{pharmacy.name}</p>
                      <p className="text-sm text-slate-500 mt-1">{pharmacy.contactEmail} • Lic: {pharmacy.licenseNumber}</p>
                    </div>
                    <div>
                      <Link to={`/admin/pharmacies/${pharmacy._id}`} className="text-sm font-medium text-primary-600 hover:text-primary-800 flex items-center group">
                        Review <ChevronRight className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState 
                icon={CheckCircle}
                title="All caught up"
                description="No pending pharmacies to review."
              />
            )}
          </Card>
        </DashboardSection>

        <DashboardSection title="Popular Requested Medicines">
          <Card>
            <CardContent className="p-6">
              {data?.popularMedicines?.length > 0 ? (
                <div className="space-y-4">
                  {data.popularMedicines.map((med, idx) => (
                    <div key={idx} className="flex items-center">
                      <div className="w-1/3 truncate font-medium text-slate-700 text-sm">{med.name}</div>
                      <div className="w-2/3 flex items-center">
                        <div className="bg-primary-100 h-2.5 rounded-full" style={{ width: `${Math.min((med.count / data.popularMedicines[0].count) * 100, 100)}%` }}></div>
                        <span className="ml-3 text-xs font-medium text-slate-500">{med.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState 
                  icon={Activity}
                  title="No requests data"
                  description="No medicine requests in this period."
                />
              )}
            </CardContent>
          </Card>
        </DashboardSection>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
