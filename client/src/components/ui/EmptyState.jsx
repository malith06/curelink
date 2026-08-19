import React from 'react';
import { cn } from '../../utils/cn';

function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action, 
  className 
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center", className)}>
      {Icon && (
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 mb-4">
          <Icon className="h-8 w-8 text-slate-400" />
        </div>
      )}
      <h3 className="mb-2 text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mb-6 max-w-sm text-sm text-slate-500">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}

export default EmptyState;
