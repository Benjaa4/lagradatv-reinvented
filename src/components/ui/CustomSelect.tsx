import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface Option { value: string; label: string; }
interface CustomSelectProps { options: Option[]; value: string; onChange: (v: string) => void; placeholder?: string; }

export const CustomSelect: React.FC<CustomSelectProps> = ({ options, value, onChange, placeholder = 'Seleccionar...' }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClick = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);
  
  const selectedLabel = options.find(o => o.value === value)?.label || placeholder;

  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setOpen(!open)} className="w-full flex items-center justify-between bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors shadow-inner outline-none">
        <span>{selectedLabel}</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${open ? 'rotate-180 text-primary' : 'text-gray-400'}`} />
      </button>
      {open && (
        <div className="absolute top-full mt-2 left-0 w-full z-50 backdrop-blur-2xl bg-black/80 border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto">
          {options.map(opt => (
            <button key={opt.value} type="button" onClick={() => { onChange(opt.value); setOpen(false); }} className={`w-full text-left px-4 py-3 text-sm transition-colors ${value === opt.value ? 'bg-primary/20 text-primary font-bold border-l-2 border-primary' : 'text-gray-300 hover:bg-white/10 hover:text-white border-l-2 border-transparent'}`}>
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
