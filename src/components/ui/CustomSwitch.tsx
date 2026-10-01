import React from 'react';

export const CustomSwitch: React.FC<{ checked: boolean; onChange: (c: boolean) => void; label?: string }> = ({ checked, onChange, label }) => (
  <label className="flex items-center cursor-pointer gap-3 group">
    <div className="relative">
      <input type="checkbox" className="sr-only" checked={checked} onChange={e => onChange(e.target.checked)} />
      <div className={`w-12 h-6 rounded-full transition-colors duration-300 backdrop-blur-xl border border-white/10 ${checked ? 'bg-primary/40' : 'bg-white/10'}`} />
      <div className={`absolute left-1 top-1 w-4 h-4 rounded-full transition-transform duration-300 ${checked ? 'transform translate-x-6 bg-primary shadow-[0_0_10px_rgba(0,255,136,0.8)]' : 'bg-gray-400'}`} />
    </div>
    {label && <span className="text-gray-300 text-sm font-medium group-hover:text-white transition-colors select-none">{label}</span>}
  </label>
);
