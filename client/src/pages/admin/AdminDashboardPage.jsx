import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import dashboardService from '../../features/dashboards/dashboardService';
import StatCard from '../../components/dashboard/StatCard';
import DashboardSection from '../../components/dashboard/DashboardSection';
import StatusChart from '../../components/dashboard/StatusChart';
import { Users, Store, FileText, Activity, AlertTriangle, CheckCircle, CreditCard, ChevronRight, BarChart } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import Badge from '../../components/ui/Badge';

const AdminDashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('30d');
  const navigate = useNavigate();

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
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-5 w-48 mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
           {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500 bg-slate-50 min-h-screen">
      {/* Modern Header Section */}
      <div className="bg-[#0B1354] pb-24 pt-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden rounded-b-[3rem] mb-[-4rem]">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500 rounded-full mix-blend-screen filter blur-[80px] opacity-30 animate-pulse"></div>
        
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">Admin Dashboard</h1>
            <p className="mt-2 text-blue-100 font-medium">System-wide platform metrics and operations</p>
          </div>
          <div className="flex items-center bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-1.5 shadow-lg">
            <label htmlFor="range" className="text-sm font-medium text-blue-50 mx-4">Time Range:</label>
            <select
              id="range"
              value={range}
              onChange={handleRangeChange}
              className="bg-white rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-primary-500 cursor-pointer py-2 pl-4 pr-10 outline-none hover:bg-slate-50 transition-colors shadow-sm"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 relative z-20">

      {/* Primary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
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
          colorClass={data?.summary?.pendingPharmacyApprovals > 0 ? "text-amber-600 bg-amber-100 ring-2 ring-amber-500/20" : "text-slate-500 bg-slate-100"} 
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
          colorClass={data?.summary?.failedPayments > 0 ? "text-red-600 bg-red-100 ring-2 ring-red-500/20" : "text-slate-500 bg-slate-100"} 
        />
        <StatCard 
          title="OCR Failures" 
          value={data?.summary?.ocrFailures || 0} 
          icon={CheckCircle} 
          colorClass={data?.summary?.ocrFailures > 0 ? "text-red-600 bg-red-100 ring-2 ring-red-500/20" : "text-slate-500 bg-slate-100"} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <DashboardSection title="Orders by Status">
          <Card className="h-full border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl overflow-hidden">
            <CardContent className="p-8">
              <StatusChart data={data?.charts?.ordersByStatus} />
            </CardContent>
          </Card>
        </DashboardSection>
        <DashboardSection title="OCR Processing Outcomes">
          <Card className="h-full border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl overflow-hidden">
            <CardContent className="p-8">
              <StatusChart data={data?.charts?.ocrOutcomes} />
            </CardContent>
          </Card>
        </DashboardSection>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <DashboardSection title="Pending Pharmacy Approvals">
          <Card className="h-full border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl overflow-hidden">
            {data?.pendingPharmacies?.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {data.pendingPharmacies.map(pharmacy => (
                  <div key={pharmacy._id} className="p-6 hover:bg-slate-50/80 transition-all flex justify-between items-center group cursor-pointer" onClick={() => navigate(`/admin/pharmacies/${pharmacy._id}`)}>
                    <div>
                      <p className="font-extrabold text-slate-900 text-lg group-hover:text-primary-600 transition-colors">{pharmacy.name}</p>
                      <p className="text-sm font-medium text-slate-500 mt-1 flex items-center gap-2">
                        <span>{pharmacy.email}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md text-xs">Reg: {pharmacy.registrationNumber || 'N/A'}</span>
                      </p>
                    </div>
                    <div>
                      <Link to={`/admin/pharmacies/${pharmacy._id}`} className="text-sm font-bold text-primary-600 hover:text-primary-800 flex items-center group-hover:translate-x-1 transition-transform bg-primary-50 px-4 py-2 rounded-xl shadow-sm">
                        Review <ChevronRight className="ml-1 w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
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
          <Card className="h-full border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl overflow-hidden">
            <CardContent className="p-8">
              {data?.popularMedicines?.length > 0 ? (
                <div className="space-y-6">
                  {data.popularMedicines.map((med, idx) => (
                    <div key={idx} className="flex flex-col gap-3 group">
                      <div className="flex justify-between items-center">
                         <span className="font-bold text-slate-900 text-base truncate pr-4 group-hover:text-primary-600 transition-colors">{med.name}</span>
                         <span className="font-black text-primary-700 text-sm bg-primary-100 px-3 py-1 rounded-lg shadow-sm">{med.count}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden shadow-inner">
                        <div className="bg-gradient-to-r from-primary-400 to-primary-600 h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${Math.min((med.count / data.popularMedicines[0].count) * 100, 100)}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState 
                  icon={BarChart}
                  title="No requests data"
                  description="No medicine requests in this period."
                />
              )}
            </CardContent>
          </Card>
        </DashboardSection>
      </div>
    </div>
  </div>
  );
};

export default AdminDashboardPage;
