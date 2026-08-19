import React from 'react';

const StatCard = ({ title, value, icon: Icon, colorClass = 'text-primary-600 bg-primary-100', linkText, linkUrl }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between h-full hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        </div>
        <div className={`p-3 rounded-lg ${colorClass}`}>
          <Icon className="w-6 h-6" aria-hidden="true" />
        </div>
      </div>
      {linkText && linkUrl && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <a href={linkUrl} className="text-sm font-medium text-primary-600 hover:text-primary-800">
            {linkText} &rarr;
          </a>
        </div>
      )}
    </div>
  );
};

export default StatCard;
