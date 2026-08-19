import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';

const PublicLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <Navbar />
      <main className="flex-grow w-full">
        {/* The child routes will manage their own max-width if they are full-screen (like landing) or boxed (like dashboards) */}
        <Outlet />
      </main>
      <footer className="bg-white border-t border-slate-200 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
            <p>&copy; {new Date().getFullYear()} CureLink. All rights reserved.</p>
            <div className="mt-4 md:mt-0 flex space-x-6">
              <a href="#" className="hover:text-slate-900 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-slate-900 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-slate-900 transition-colors">Contact Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
