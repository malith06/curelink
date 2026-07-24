import React from 'react';
import { Link } from 'react-router-dom';
import { Store, Pill, Shield, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminDashboardPage = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-2 text-gray-600">Welcome back, {user?.name || 'Administrator'}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Pharmacies */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow p-6">
          <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4 text-blue-600">
            <Store className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Pharmacies</h3>
          <p className="text-gray-600 text-sm mb-4">Review and verify pharmacy registrations.</p>
          <Link to="/admin/pharmacies" className="text-blue-600 font-medium text-sm flex items-center hover:text-blue-800">
            Manage Pharmacies <span className="ml-1">→</span>
          </Link>
        </div>

        {/* Medicines */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow p-6">
          <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center mb-4 text-purple-600">
            <Pill className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Medicines Catalogue</h3>
          <p className="text-gray-600 text-sm mb-4">Manage the global database of medicines.</p>
          <Link to="/admin/medicines" className="text-purple-600 font-medium text-sm flex items-center hover:text-purple-800">
            Manage Medicines <span className="ml-1">→</span>
          </Link>
        </div>

        {/* Users (Placeholder) */}
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 opacity-60">
          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mb-4 text-gray-500">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Users</h3>
          <p className="text-gray-600 text-sm mb-4">Manage customer accounts (Coming soon).</p>
        </div>

        {/* Settings (Placeholder) */}
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 opacity-60">
          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mb-4 text-gray-500">
            <Shield className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">System Logs</h3>
          <p className="text-gray-600 text-sm mb-4">View security logs (Coming soon).</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
