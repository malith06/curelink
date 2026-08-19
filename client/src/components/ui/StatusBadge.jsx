import React from 'react';
import Badge from './Badge';

const statusConfig = {
  // Pharmacy Verification
  APPROVED: { label: 'Approved', variant: 'success' },
  PENDING: { label: 'Pending', variant: 'warning' },
  REJECTED: { label: 'Rejected', variant: 'destructive' },
  SUSPENDED: { label: 'Suspended', variant: 'destructive' },
  
  // Request / Order Status
  NEW: { label: 'New', variant: 'default' },
  QUOTED: { label: 'Quoted', variant: 'primary' },
  ACCEPTED: { label: 'Accepted', variant: 'success' },
  PROCESSING: { label: 'Processing', variant: 'warning' },
  READY_FOR_PICKUP: { label: 'Ready for Pickup', variant: 'primary' },
  OUT_FOR_DELIVERY: { label: 'Out for Delivery', variant: 'primary' },
  DELIVERED: { label: 'Delivered', variant: 'success' },
  COMPLETED: { label: 'Completed', variant: 'success' },
  CANCELLED: { label: 'Cancelled', variant: 'destructive' },

  // Availability
  AVAILABLE: { label: 'Available', variant: 'success' },
  LIMITED: { label: 'Limited Stock', variant: 'warning' },
  UNAVAILABLE: { label: 'Out of Stock', variant: 'destructive' },
};

function StatusBadge({ status, className }) {
  const config = statusConfig[status] || { label: status, variant: 'secondary' };

  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
}

export default StatusBadge;
