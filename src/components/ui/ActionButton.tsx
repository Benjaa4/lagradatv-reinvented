import React from 'react';
import { Edit3, Trash2, Plus } from 'lucide-react';

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant: 'edit' | 'delete' | 'create';
  label?: string;
}

export const ActionButton: React.FC<ActionButtonProps> = ({ variant, label, className = '', ...props }) => {
  if (variant === 'edit') {
    return (
      <button {...props} className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-sky-400 hover:text-sky-300 hover:bg-sky-500/10 hover:border-sky-500/30 transition-all text-sm font-medium ${className}`}>
        <Edit3 className="w-4 h-4" />
        {label}
      </button>
    );
  }
  if (variant === 'delete') {
    return (
      <button {...props} className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 hover:border-rose-500/30 transition-all text-sm font-medium ${className}`}>
        <Trash2 className="w-4 h-4" />
        {label}
      </button>
    );
  }
  return (
    <button {...props} className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/50 hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all text-sm font-bold ${className}`}>
      <Plus className="w-4 h-4" />
      {label}
    </button>
  );
};
