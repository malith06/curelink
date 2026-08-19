import React from 'react';

const DashboardSection = ({ title, children, action }) => {
  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4 px-1">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">{title}</h2>
        {action && <div>{action}</div>}
      </div>
      {children}
    </section>
  );
};

export default DashboardSection;
