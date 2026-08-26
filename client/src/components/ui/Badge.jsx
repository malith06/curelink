import React from 'react';
import { cn } from '../../utils/cn';

const Badge = React.forwardRef(({ className, variant = 'default', children, ...props }, ref) => {
  const baseStyles = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider transition-colors shadow-sm";
  
  const variants = {
    default: "border-slate-200 bg-slate-50 text-slate-700",
    secondary: "border-slate-200 bg-slate-100 text-slate-800",
    destructive: "border-red-200 bg-red-50 text-red-700",
    outline: "text-slate-900 border-slate-200 bg-white",
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
    warning: "border-amber-200 bg-amber-50 text-amber-700",
    primary: "border-primary-200 bg-primary-50 text-primary-700",
    info: "border-blue-200 bg-blue-50 text-blue-700",
  };

  return (
    <div
      ref={ref}
      className={cn(baseStyles, variants[variant], className)}
      {...props}
    >
      {children}
    </div>
  );
});

Badge.displayName = 'Badge';

export default Badge;
