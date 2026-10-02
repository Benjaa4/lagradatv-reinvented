import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Clock } from 'lucide-react';

interface CustomTimePickerProps {
  value: string;
  onChange: (value: string) => void;
}

export const CustomTimePicker: React.FC<CustomTimePickerProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const timeRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<React.CSSProperties>({});

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (ref.current && !ref.current.contains(target) && 
          timeRef.current && !timeRef.current.contains(target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      
      if (spaceBelow > 300) {
        setPosition({ top: rect.bottom + 8, left: rect.left });
      } else {
        setPosition({ bottom: window.innerHeight - rect.top + 8, left: rect.left });
      }
    }
  }, [isOpen]);

  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  const minutes = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'));

  const [h, m] = value ? value.split(':') : ['00', '00'];

  const handleTimeChange = (newH: string, newM: string) => {
    onChange(`${newH}:${newM}`);
  };

  return (
    <div className="relative w-full" ref={ref}>
      <div 
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none hover:bg-white/10 focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors cursor-pointer flex items-center justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{value || <span className="text-gray-400">00:00</span>}</span>
        <Clock className="w-4 h-4 text-gray-400" />
      </div>

      {isOpen && createPortal(
        <div className="fixed z-[99999] max-md:inset-0 max-md:flex max-md:items-center max-md:justify-center max-md:bg-black/60 max-md:backdrop-blur-sm">
          <div 
            ref={timeRef}
            className="backdrop-blur-2xl bg-[#0c101a]/95 glass-strong border border-white/20 rounded-2xl p-4 shadow-2xl animate-in fade-in max-md:zoom-in-95 duration-200 flex gap-2"
            style={typeof window !== 'undefined' && window.innerWidth >= 768 ? { position: 'absolute', ...position } : undefined}
          >
            <div className="flex flex-col h-48 w-16 overflow-y-auto custom-scrollbar bg-black/40 rounded-xl border border-white/5">
              {hours.map(hour => (
                <button
                  type="button"
                  key={hour}
                  onClick={(e) => { e.stopPropagation(); handleTimeChange(hour, m); }}
                  className={`py-2 text-sm font-medium transition-colors ${h === hour ? 'bg-primary text-black shadow-inner font-bold' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                  {hour}
                </button>
              ))}
            </div>

            <div className="flex flex-col justify-center text-white/20 font-bold">:</div>

            <div className="flex flex-col h-48 w-16 overflow-y-auto custom-scrollbar bg-black/40 rounded-xl border border-white/5">
              {minutes.map(minute => (
                <button
                  type="button"
                  key={minute}
                  onClick={(e) => { e.stopPropagation(); handleTimeChange(h, minute); setIsOpen(false); }}
                  className={`py-2 text-sm font-medium transition-colors ${m === minute ? 'bg-primary text-black shadow-inner font-bold' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                  {minute}
                </button>
              ))}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
