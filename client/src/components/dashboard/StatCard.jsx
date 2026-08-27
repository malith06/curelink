import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, colorClass = 'text-primary-600 bg-primary-100', linkText, linkUrl }) => {
  return (
    <div className="flex flex-col justify-between h-full bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-lg transition-all duration-300 group overflow-hidden relative">
      <div className="absolute -right-10 -top-10 w-32 h-32 bg-slate-50 rounded-full mix-blend-multiply opacity-50 group-hover:scale-150 transition-transform duration-700"></div>
      <div className="p-6 relative z-10 flex-1 flex flex-col">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm font-semibold text-slate-500 mb-2 tracking-wide uppercase">{title}</p>
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">{value}</h3>
          </div>
          <div className={`p-4 rounded-2xl shadow-sm ${colorClass} group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="w-6 h-6" aria-hidden="true" />
          </div>
        </div>
        
        <div className="flex-1"></div>

        {linkText && linkUrl && (
          <div className="mt-6 pt-4 border-t border-slate-100/60 flex items-center">
            <Link to={linkUrl} className="text-sm font-bold text-primary-600 hover:text-primary-800 flex items-center group/link bg-primary-50 px-4 py-2 rounded-xl transition-colors w-full justify-between">
              {linkText} <ArrowRight className="ml-1 w-4 h-4 transition-transform group-hover/link:translate-x-1" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
