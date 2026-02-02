import React from 'react';
import { Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

const PremiumBadge = ({ variant = 'large', className }) => {
  const isSmall = variant === 'small';

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center font-bold uppercase tracking-wider shadow-sm transition-all",
        // Colors: bg-amber-100, text-amber-700, with a subtle border to match the gold theme
        "bg-amber-100 text-amber-700 border border-amber-200", 
        isSmall 
          ? "px-1.5 py-0.5 rounded-md premium-badge-glow-fast" // Removed gap-1 since text is gone, adjusted px for icon balance
          : "px-3 py-1 text-xs gap-1.5 rounded-full premium-badge-glow", 
        className
      )}
      title={isSmall ? "Premium Domain" : undefined}
      aria-label={isSmall ? "Premium Domain" : undefined}
    >
      <Crown className={cn(
        "fill-amber-500/20",
        // Slightly increased icon size for small variant (w-3.5 instead of w-3) since it's now the only element
        isSmall ? "w-3.5 h-3.5" : "w-3.5 h-3.5" 
      )} />
      {!isSmall && <span>Premium</span>}
    </span>
  );
};

export default PremiumBadge;