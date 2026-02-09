
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

export const SkeletonPulse = ({ className = "" }) => (
  <div className={`animate-pulse bg-slate-200 rounded ${className}`}></div>
);

export const DomainCardSkeleton = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-full overflow-hidden flex flex-col">
      <div className="p-6 flex-1 flex flex-col">
        {/* Logo Placeholder */}
        <div className="mb-6 h-[80px] flex items-center justify-center">
          <SkeletonPulse className="h-16 w-32 rounded-lg" />
        </div>

        {/* Title & Tagline */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <SkeletonPulse className="h-6 w-3/4 mb-2" />
            <SkeletonPulse className="h-4 w-1/2" />
          </div>
          <SkeletonPulse className="h-6 w-6 rounded-full" />
        </div>

        {/* Description */}
        <div className="mb-6 space-y-2 flex-1">
          <SkeletonPulse className="h-3 w-12 mb-3" /> {/* Category Tag */}
          <SkeletonPulse className="h-4 w-full" />
          <SkeletonPulse className="h-4 w-5/6" />
        </div>

        {/* Footer: Price & Button */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
          <div className="flex flex-col gap-1">
            <SkeletonPulse className="h-3 w-10" />
            <SkeletonPulse className="h-6 w-24" />
          </div>
          <SkeletonPulse className="h-9 w-24 rounded-md" />
        </div>
      </div>
    </div>
  );
};

export const DomainGridSkeleton = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array(count).fill(0).map((_, i) => (
        <DomainCardSkeleton key={i} />
      ))}
    </div>
  );
};

export const DomainDetailSkeleton = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <SkeletonPulse className="h-6 w-48 mb-8" /> {/* Breadcrumbs */}
      
      {/* Hero Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col lg:flex-row gap-8 mb-8">
        <SkeletonPulse className="w-full lg:w-[280px] h-[160px] rounded-xl shrink-0" />
        <div className="flex-1 w-full">
          <div className="flex gap-2 mb-4">
            <SkeletonPulse className="h-6 w-24 rounded-full" />
            <SkeletonPulse className="h-6 w-24 rounded-full" />
          </div>
          <SkeletonPulse className="h-12 w-3/4 mb-4" />
          <SkeletonPulse className="h-6 w-1/2" />
        </div>
        <div className="hidden lg:flex flex-col items-end min-w-[200px]">
          <SkeletonPulse className="h-4 w-20 mb-2" />
          <SkeletonPulse className="h-10 w-32 mb-2" />
          <SkeletonPulse className="h-6 w-28 rounded-full" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             {[1,2,3,4].map(i => <SkeletonPulse key={i} className="h-24 rounded-lg" />)}
          </div>
          <SkeletonPulse className="h-64 rounded-xl" />
          <SkeletonPulse className="h-48 rounded-xl" />
        </div>
        <div className="space-y-6">
          <SkeletonPulse className="h-96 rounded-xl" />
        </div>
      </div>
    </div>
  );
};

const LoadingSkeleton = () => {
  return <DomainGridSkeleton />;
};

export default LoadingSkeleton;
