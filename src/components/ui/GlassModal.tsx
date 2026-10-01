import React from 'react';
import { X } from 'lucide-react';

interface GlassModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const GlassModal: React.FC<GlassModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center md:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity" onClick={onClose} />
      <div className="relative w-full max-w-lg fixed inset-x-0 bottom-0 max-h-[92vh] rounded-t-3xl md:relative md:inset-auto md:bottom-auto md:rounded-3xl overflow-y-auto p-5 md:p-6 border-t md:border border-white/15 glass-strong shadow-[0_-10px_40px_rgba(0,0,0,0.5)] md:shadow-[0_0_40px_rgba(0,0,0,0.8)] animate-in slide-in-from-bottom md:zoom-in-95 duration-200 flex flex-col">
        {/* Drag Handle para móvil */}
        <div className="w-9 h-1 bg-white/20 rounded-full mx-auto mb-4 md:hidden" />
        
        <div className="flex justify-between items-center mb-4 md:mb-6 border-b border-white/10 pb-4 shrink-0">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <button onClick={onClose} className="w-11 h-11 flex items-center justify-center text-gray-400 hover:text-white bg-white/5 rounded-full hover:bg-white/10 transition-colors active:scale-95">
            <X className="w-5 h-5"/>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto no-scrollbar pb-safe">
          {children}
        </div>
      </div>
    </div>
  );
};
