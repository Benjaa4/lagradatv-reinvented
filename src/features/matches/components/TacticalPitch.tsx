import React from 'react';
import { TeamLineup } from '../../../types';
import { GlassCard } from '../../../components/ui/GlassCard';

export const TacticalPitch: React.FC<{ homeLineup?: TeamLineup, awayLineup?: TeamLineup }> = ({ homeLineup, awayLineup }) => {
  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="flex-1">
        <GlassCard className="p-6 relative overflow-hidden flex flex-col items-center min-h-[500px] border-emerald-900/50">
          <div className="absolute inset-0 bg-emerald-950/20" />
          {/* Tactical Pitch Visual */}
          <div className="w-full max-w-md aspect-[68/100] border border-white/20 rounded-xl relative flex flex-col items-center justify-center">
            <div className="absolute top-1/2 left-0 w-full h-px bg-white/20" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 sm:w-24 sm:h-24 border border-white/20 rounded-full" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-12 sm:w-32 sm:h-16 border border-white/20 rounded-b-xl border-t-0" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-12 sm:w-32 sm:h-16 border border-white/20 rounded-t-xl border-b-0" />
            
            <div className="z-10 text-center px-4">
              <p className="text-white/50 font-bold uppercase tracking-widest text-sm mb-2">Representación Visual Táctica</p>
              <p className="text-primary/70 text-xs font-mono">
                {homeLineup?.formation || 'Desconocida'} vs {awayLineup?.formation || 'Desconocida'}
              </p>
              <p className="text-gray-500 text-xs mt-4">(Simulación del grid de jugadores)</p>
            </div>
          </div>
        </GlassCard>
      </div>
      <div className="w-full lg:w-64 flex flex-col gap-4">
        <GlassCard className="p-4 flex-1">
          <h3 className="font-bold text-white mb-2 border-b border-white/10 pb-2">Banca Local</h3>
          <ul className="text-sm text-gray-400 space-y-1 mt-2">
            {homeLineup?.substitutes?.map((sub, i) => (
              <li key={i} className="flex gap-2"><span className="text-gray-600 w-5">{sub.number}.</span> <span className="truncate">{sub.name || sub.fullName}</span></li>
            )) || <li className="italic">Sin datos</li>}
          </ul>
        </GlassCard>
        <GlassCard className="p-4 flex-1">
          <h3 className="font-bold text-white mb-2 border-b border-white/10 pb-2">Banca Visitante</h3>
          <ul className="text-sm text-gray-400 space-y-1 mt-2">
            {awayLineup?.substitutes?.map((sub, i) => (
              <li key={i} className="flex gap-2"><span className="text-gray-600 w-5">{sub.number}.</span> <span className="truncate">{sub.name || sub.fullName}</span></li>
            )) || <li className="italic">Sin datos</li>}
          </ul>
        </GlassCard>
      </div>
    </div>
  );
}
