import React from 'react';

const AvailabilityStatusBadge = ({ status }) => {
  const getBadgeConfig = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return { label: 'Available', color: 'bg-green-100 text-green-800 border-green-200' };
      case 'LIMITED':
        return { label: 'Limited', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
      case 'CONFIRMATION_REQUIRED':
        return { label: 'Confirmation Required', color: 'bg-orange-100 text-orange-800 border-orange-200' };
      case 'UNAVAILABLE':
        return { label: 'Unavailable', color: 'bg-red-100 text-red-800 border-red-200' };
      default:
        return { label: status || 'Unknown', color: 'bg-gray-100 text-gray-800 border-gray-200' };
    }
  };

  const { label, color } = getBadgeConfig(status);

  return (
    <span className={`px-2.5 py-0.5 inline-flex text-xs font-medium rounded-full border ${color}`}>
      {label}
    </span>
  );
};

export default AvailabilityStatusBadge;
