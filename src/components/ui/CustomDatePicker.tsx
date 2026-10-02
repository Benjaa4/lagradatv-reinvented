import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface CustomDatePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({ value, onChange, placeholder = 'Seleccionar fecha' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const ref = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<React.CSSProperties>({});

  useEffect(() => {
    if (value) {
      const [y, m, d] = value.split('-');
      if (y && m && d) {
        setCurrentMonth(new Date(parseInt(y), parseInt(m) - 1, 1));
      }
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (ref.current && !ref.current.contains(target) && 
          calendarRef.current && !calendarRef.current.contains(target)) {
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
      
      if (spaceBelow > 340) {
        setPosition({ top: rect.bottom + 8, left: rect.left });
      } else {
        setPosition({ bottom: window.innerHeight - rect.top + 8, left: rect.left });
      }
    }
  }, [isOpen]);

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleDayClick = (day: number) => {
    const y = currentMonth.getFullYear();
    const m = String(currentMonth.getMonth() + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    onChange(`${y}-${m}-${d}`);
    setIsOpen(false);
  };

  const handleToday = (e: React.MouseEvent) => {
    e.stopPropagation();
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    onChange(`${y}-${m}-${d}`);
    setCurrentMonth(new Date(y, today.getMonth(), 1));
    setIsOpen(false);
  };

  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const dayNames = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'];

  return (
    <div className="relative w-full" ref={ref}>
      <div 
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none hover:bg-white/10 focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors cursor-pointer flex items-center justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{value || <span className="text-gray-400">{placeholder}</span>}</span>
        <Calendar className="w-4 h-4 text-gray-400" />
      </div>

      {isOpen && createPortal(
        <div className="fixed z-[99999] max-md:inset-0 max-md:flex max-md:items-center max-md:justify-center max-md:bg-black/60 max-md:backdrop-blur-sm">
          <div 
            ref={calendarRef}
            className="backdrop-blur-2xl bg-[#0c101a]/95 glass-strong border border-white/20 rounded-2xl p-4 shadow-2xl w-[300px] sm:w-[320px] animate-in fade-in max-md:zoom-in-95 duration-200"
            style={typeof window !== 'undefined' && window.innerWidth >= 768 ? { position: 'absolute', ...position } : undefined}
          >
            <div className="flex justify-between items-center mb-4">
              <button type="button" onClick={handlePrevMonth} className="p-1 hover:bg-white/10 rounded-lg transition-colors text-white"><ChevronLeft className="w-4 h-4" /></button>
              <span className="text-white font-bold text-sm">{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</span>
              <button type="button" onClick={handleNextMonth} className="p-1 hover:bg-white/10 rounded-lg transition-colors text-white"><ChevronRight className="w-4 h-4" /></button>
            </div>
            
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map(d => <div key={d} className="text-center text-xs font-medium text-gray-500 py-1">{d}</div>)}
            </div>
            
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const y = currentMonth.getFullYear();
                const m = String(currentMonth.getMonth() + 1).padStart(2, '0');
                const d = String(day).padStart(2, '0');
                const isSelected = value === `${y}-${m}-${d}`;
                const isToday = new Date().toDateString() === new Date(y, currentMonth.getMonth(), day).toDateString();
                
                return (
                  <button
                    type="button"
                    key={day}
                    onClick={() => handleDayClick(day)}
                    className={`w-8 h-8 rounded-full text-xs font-medium transition-colors flex items-center justify-center mx-auto ${isSelected ? 'bg-primary text-black font-bold shadow-[0_0_10px_rgba(0,255,136,0.5)]' : isToday ? 'border border-primary text-primary hover:bg-primary/20' : 'text-gray-300 hover:bg-white/10'}`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-white/10">
              <button type="button" onClick={handleToday} className="w-full py-2 bg-white/5 hover:bg-white/10 text-primary text-xs font-bold rounded-xl transition-colors">
                Hoy
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
