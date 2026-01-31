import React from 'react';
import { cn } from '@/lib/utils';

const Badge = React.forwardRef(({ className, variant = 'default', ...props }, ref) => {
  const variants = {
    default: 'bg-slate-100 text-slate-900 border border-slate-200',
    primary: 'bg-blue-100 text-blue-900 border border-blue-200',
    success: 'bg-emerald-100 text-emerald-900 border border-emerald-200',
    warning: 'bg-amber-100 text-amber-900 border border-amber-200',
    destructive: 'bg-red-100 text-red-900 border border-red-200',
  };

  return (
    <div
      ref={ref}
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
        variants[variant],
        className
      )}
      {...props}
    />
  );
});

Badge.displayName = 'Badge';

export { Badge };