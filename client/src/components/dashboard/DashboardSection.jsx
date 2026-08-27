import React from 'react';

const DashboardSection = ({ title, children, action }) => {
  return (
    <section className="mb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 px-1 gap-4">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
          <div className="w-2 h-6 bg-primary-500 rounded-full"></div>
          {title}
        </h2>
        {action && <div>{action}</div>}
      </div>
      {children}
    </section>
  );
};

export default DashboardSection;
