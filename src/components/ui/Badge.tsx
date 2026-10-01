import React from 'react';

type BadgeVariant = 'live' | 'scheduled' | 'played' | 'league';

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ variant, children, className = '' }) => {
  const baseStyles = "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md transition-colors";
  
  const variantStyles = {
    live: "bg-danger/20 text-danger border border-danger/30 shadow-[0_0_15px_rgba(255,51,102,0.2)]",
    scheduled: "bg-white/5 text-gray-300 border border-white/10",
    played: "bg-black/40 text-gray-400 border border-white/5",
    league: "bg-primary/10 text-primary border border-primary/30"
  };

  return (
    <span className={`${baseStyles} ${variantStyles[variant]} ${className}`}>
      {variant === 'live' && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-danger"></span>
        </span>
      )}
      {children}
    </span>
  );
};
