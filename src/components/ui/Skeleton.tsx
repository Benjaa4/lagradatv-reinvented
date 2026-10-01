import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
  return (
    <div 
      className={`animate-pulse motion-reduce:animate-none rounded-2xl bg-white/[0.04] relative overflow-hidden after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-white/[0.05] after:to-transparent after:animate-shimmer ${className}`}
      aria-busy="true"
    />
  );
};

export const MatchCardSkeleton: React.FC = () => (
  <div className="p-6 rounded-xl border border-white/10 bg-white/[0.02] flex flex-col h-full gap-6 w-[85vw] md:w-auto shrink-0 snap-center relative overflow-hidden">
    <Skeleton className="absolute inset-0 rounded-none z-0 opacity-50" />
    <div className="flex justify-between items-center z-10">
      <Skeleton className="w-24 h-4 rounded-full" />
      <Skeleton className="w-16 h-4 rounded-full" />
    </div>
    <div className="flex justify-between items-center border-y border-white/5 py-4 z-10">
      <div className="flex flex-col items-center gap-2 w-1/3">
        <Skeleton className="w-10 h-10 rounded-full" />
        <Skeleton className="w-20 h-4 rounded-full" />
      </div>
      <Skeleton className="w-12 h-8 rounded-lg" />
      <div className="flex flex-col items-center gap-2 w-1/3">
        <Skeleton className="w-10 h-10 rounded-full" />
        <Skeleton className="w-20 h-4 rounded-full" />
      </div>
    </div>
    <Skeleton className="w-full h-10 rounded-lg mt-auto z-10" />
  </div>
);

export const StandingsSkeleton: React.FC = () => (
  <div className="space-y-2">
    {[...Array(8)].map((_, i) => (
      <Skeleton key={i} className="w-full h-14 rounded-xl" />
    ))}
  </div>
);

export const BracketSkeleton: React.FC = () => (
  <div className="flex flex-col gap-4">
    <Skeleton className="w-full h-16 rounded-xl" />
    <Skeleton className="w-full h-16 rounded-xl" />
    <Skeleton className="w-full h-16 rounded-xl" />
  </div>
);

export const VideoCardSkeleton: React.FC = () => (
  <Skeleton className="w-full aspect-video rounded-2xl" />
);

export const PitchSkeleton: React.FC = () => (
  <Skeleton className="w-full max-w-md mx-auto aspect-[68/100] rounded-3xl" />
);
