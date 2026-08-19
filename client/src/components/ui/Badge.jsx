import React from 'react';
import { cn } from '../../utils/cn';

const Badge = React.forwardRef(({ className, variant = 'default', children, ...props }, ref) => {
  const baseStyles = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2";
  
  const variants = {
    default: "border-transparent bg-slate-900 text-slate-50 hover:bg-slate-900/80",
    secondary: "border-transparent bg-slate-100 text-slate-900 hover:bg-slate-100/80",
    destructive: "border-transparent bg-red-500 text-slate-50 hover:bg-red-500/80",
    outline: "text-slate-950",
    success: "border-transparent bg-green-500 text-white hover:bg-green-600",
    warning: "border-transparent bg-amber-500 text-white hover:bg-amber-600",
    primary: "border-transparent bg-primary-100 text-primary-800",
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
