import { cn } from '@/lib/utils';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import React from 'react';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-slate-900 text-slate-50 hover:bg-slate-900/90',
        destructive: 'bg-red-500 text-slate-50 hover:bg-red-500/90',
        outline: 'border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900',
        secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-100/80',
        ghost: 'hover:bg-slate-100 hover:text-slate-900',
        link: 'text-slate-900 underline-offset-4 hover:underline',
        
        // الألوان المسطحة العادية
        emerald: 'bg-emerald-500 text-white hover:bg-emerald-600',
        blue: 'bg-blue-500 text-white hover:bg-blue-600',
        red: 'bg-red-500 text-white hover:bg-red-600',
        orange: 'bg-orange-500 text-white hover:bg-orange-600',
        amber: 'bg-amber-500 text-white hover:bg-amber-600',
        indigo: 'bg-indigo-500 text-white hover:bg-indigo-600',
        purple: 'bg-purple-500 text-white hover:bg-purple-600',
        pink: 'bg-pink-500 text-white hover:bg-pink-600',
        slate: 'bg-slate-700 text-white hover:bg-slate-800',
        gray: 'bg-gray-200 text-gray-900 hover:bg-gray-300',

        // 🌟 الأشكال الاحترافية الجديدة (Premium Styles) 🌟
        
        // 1. النمط المتدرج (Gradient Premium)
        gradient: 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0 shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all duration-300',
        
        // 2. النمط المضيء (Neon Glow) - ممتاز لنطاقات التقنية والذكاء الاصطناعي
        neon: 'bg-slate-900 text-emerald-400 border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:bg-slate-800 hover:shadow-[0_0_25px_rgba(16,185,129,0.6)] hover:-translate-y-0.5 transition-all duration-300',
        
        // 3. النمط ثلاثي الأبعاد (Soft 3D) - يهبط للأسفل عند الضغط عليه
        '3d': 'bg-blue-600 text-white border-b-[4px] border-blue-800 hover:bg-blue-500 hover:border-blue-700 active:border-b-0 active:translate-y-[4px] transition-all',
        
        // 4. النمط الزجاجي الداكن الفاخر (Dark Glassmorphism)
        glass: 'bg-slate-900/80 backdrop-blur-md border border-slate-700 text-white shadow-xl hover:bg-slate-800/90 hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300',
      },
      size: {
        default: 'h-11 px-4 py-2',
        sm: 'h-9 rounded-md px-3 text-xs',
        lg: 'h-12 rounded-lg px-8 text-base',
        icon: 'h-11 w-11',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  );
});
Button.displayName = 'Button';

export { Button, buttonVariants };
