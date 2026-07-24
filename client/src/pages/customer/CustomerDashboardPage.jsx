import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Map, Activity, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const CustomerDashboardPage = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Welcome back, {user?.name || 'Customer'}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* New Request Action Card */}
        <div className="bg-primary-50 rounded-xl shadow-sm border border-primary-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col justify-between">
          <div className="p-6">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4 text-primary">
              <Plus className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-primary-900 mb-2">New Medicine Request</h3>
            <p className="text-primary-800 text-sm mb-4">
              Need a prescription filled? Send a request to nearby pharmacies to check availability.
            </p>
          </div>
          <div className="px-6 py-4 bg-primary-100/50 border-t border-primary-200">
            <Link to="/customer/requests/new" className="text-primary font-medium text-sm flex items-center hover:text-primary-800 w-full justify-center">
              Start Request <span className="ml-1">→</span>
            </Link>
          </div>
        </div>

        {/* My Requests Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
          <div className="p-6">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4 text-blue-600">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">My Requests</h3>
            <p className="text-gray-600 text-sm mb-4 min-h-[40px]">
              Track your active medicine requests, view quotations, and confirm orders.
            </p>
            <Link to="/customer/requests" className="text-blue-600 font-medium text-sm flex items-center hover:text-blue-800">
              View History <span className="ml-1">→</span>
            </Link>
          </div>
        </div>

        {/* Find Pharmacies Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
          <div className="p-6">
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center mb-4 text-green-600">
              <Map className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nearby Pharmacies</h3>
            <p className="text-gray-600 text-sm mb-4 min-h-[40px]">
              Browse registered pharmacies in your area and check their contact details.
            </p>
            <Link to="/pharmacies/nearby" className="text-green-600 font-medium text-sm flex items-center hover:text-green-800">
              Open Map <span className="ml-1">→</span>
            </Link>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default CustomerDashboardPage;
