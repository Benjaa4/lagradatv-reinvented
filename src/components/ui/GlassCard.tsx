import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
  onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', interactive = false, onClick }) => {
  return (
    <div onClick={onClick} className={`relative overflow-hidden rounded-3xl bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-2xl transition-all duration-200 ${interactive ? 'active:scale-[0.98] md:hover:bg-white/[0.06] md:hover:border-white/20 cursor-pointer' : ''} ${className}`}>
      {/* Top glass shine */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50" />
      {children}
    </div>
  );
};
