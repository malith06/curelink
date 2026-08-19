import React from 'react';

const DashboardSection = ({ title, children, action }) => {
  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        {action && <div>{action}</div>}
      </div>
      {children}
    </section>
  );
};

export default DashboardSection;
