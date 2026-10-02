import React, { useState } from 'react';
import { TeamLineup, MatchModality } from '../../../types';
import { GlassCard } from '../../../components/ui/GlassCard';
import { getFormationCoordinates } from '../../../utils/formationUtils';

interface TacticalPitchProps {
  homeLineup?: TeamLineup;
  awayLineup?: TeamLineup;
  matchType?: MatchModality;
}

export const TacticalPitch: React.FC<TacticalPitchProps> = ({ homeLineup, awayLineup, matchType = 'f7' }) => {
  const [viewMode, setViewMode] = useState<'home' | 'away' | 'both'>('home');

  const renderPitchLines = () => {
    if (matchType === 'f5') {
      return (
        <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
           <rect x="0" y="0" width="100%" height="100%" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
           <line x1="0" y1="50%" x2="100%" y2="50%" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
           <circle cx="50%" cy="50%" r="15%" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
           <circle cx="50%" cy="50%" r="2%" fill="rgba(255,255,255,0.2)" />
           {/* F5 D-Areas */}
           <path d="M 20 0 A 30 30 0 0 0 80 0" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" vectorEffect="non-scaling-stroke" transform="translate(50,0) scale(1, 0.5)" />
           <path d="M 20 100 A 30 30 0 0 1 80 100" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" vectorEffect="non-scaling-stroke" transform="translate(50,0) scale(1, 0.5)" />
        </svg>
      );
    }
    
    // F7 and F11 Default rectangular areas
    return (
      <div className="absolute inset-0 w-full h-full pointer-events-none border-2 border-white/20">
        <div className="absolute top-1/2 left-0 w-full h-px bg-white/20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 sm:w-24 sm:h-24 border-2 border-white/20 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white/20 rounded-full" />
        
        {/* Top Area */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-16 sm:w-48 sm:h-24 border-2 border-white/20 border-t-0" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-6 sm:w-20 sm:h-8 border-2 border-white/20 border-t-0" />
        <div className="absolute top-12 sm:top-20 left-1/2 -translate-x-1/2 w-12 h-6 border-2 border-white/20 rounded-b-full border-t-0" />
        
        {/* Bottom Area */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-16 sm:w-48 sm:h-24 border-2 border-white/20 border-b-0" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-6 sm:w-20 sm:h-8 border-2 border-white/20 border-b-0" />
        <div className="absolute bottom-12 sm:bottom-20 left-1/2 -translate-x-1/2 w-12 h-6 border-2 border-white/20 rounded-t-full border-b-0" />
      </div>
    );
  };

  const renderPlayer = (player: any, index: number, isAway: boolean) => {
    const coords = getFormationCoordinates(
      isAway ? (awayLineup?.formation || '4-3-3') : (homeLineup?.formation || '4-3-3'),
      index,
      isAway,
      viewMode
    );
    
    return (
      <div 
        key={player.id || index} 
        className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center transition-all duration-500"
        style={{ top: coords.top, left: coords.left }}
      >
        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm border-2 shadow-lg z-10 relative ${isAway ? 'bg-white text-black border-gray-300' : 'bg-primary text-black border-emerald-300'}`}>
          {player.number}
          {player.isCaptain && <div className="absolute -top-1 -right-1 bg-yellow-400 text-black text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-black shadow">C</div>}
        </div>
        <div className="bg-black/60 backdrop-blur-sm text-white text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded mt-1 font-medium whitespace-nowrap truncate max-w-[60px] text-center border border-white/10 shadow">
          {player.name || player.fullName?.split(' ')[0]}
        </div>
        <div className="flex gap-0.5 mt-0.5">
          {Array.from({ length: player.yellowCards || 0 }).map((_, i) => <div key={i} className="w-1.5 h-2 bg-yellow-400 rounded-sm shadow-sm border border-yellow-600" />)}
          {player.redCards > 0 && <div className="w-1.5 h-2 bg-red-500 rounded-sm shadow-sm border border-red-700" />}
        </div>
      </div>
    );
  };

  const showHome = viewMode === 'home' || viewMode === 'both';
  const showAway = viewMode === 'away' || viewMode === 'both';

  return (
    <div className="flex flex-col lg:flex-row gap-6 animate-in fade-in">
      <div className="flex-1 flex flex-col items-center">
        
        <div className="flex gap-2 p-1 bg-black/40 border border-white/5 rounded-full mb-6 backdrop-blur-md">
          <button onClick={() => setViewMode('home')} className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${viewMode === 'home' ? 'bg-primary text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}>Local</button>
          <button onClick={() => setViewMode('away')} className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${viewMode === 'away' ? 'bg-white text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}>Visitante</button>
          <button onClick={() => setViewMode('both')} className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${viewMode === 'both' ? 'bg-white/20 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>Frente a Frente</button>
        </div>

        <GlassCard className="p-4 sm:p-6 relative overflow-hidden flex flex-col items-center w-full max-w-lg border-emerald-900/50 shadow-2xl">
          <div className="absolute inset-0 bg-[#348e4b]" style={{
             backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 50px, rgba(255,255,255,0.05) 50px, rgba(255,255,255,0.05) 100px)'
          }} />
          
          <div className="w-full aspect-[68/100] relative">
            {renderPitchLines()}
            
            {showHome && homeLineup?.starting?.map((p, i) => renderPlayer(p, i, false))}
            {showAway && awayLineup?.starting?.map((p, i) => renderPlayer(p, i, true))}
            
            {(!homeLineup?.starting?.length && !awayLineup?.starting?.length) && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px] rounded-xl z-20">
                 <p className="text-white font-bold text-lg">Sin alineaciones</p>
                 <p className="text-gray-300 text-sm mt-1">Los equipos no han confirmado titulares.</p>
              </div>
            )}
          </div>
        </GlassCard>
      </div>

      <div className="w-full lg:w-72 flex flex-col gap-4">
        {showHome && (
          <GlassCard className="p-4 flex-1 border-l-4 border-l-primary relative overflow-hidden">
            <div className="absolute right-0 top-0 opacity-10 text-6xl font-black italic">L</div>
            <h3 className="font-bold text-white mb-2 pb-2">Banca Local</h3>
            <div className="text-xs text-primary mb-2 font-mono">Formación: {homeLineup?.formation || '?'}</div>
            <ul className="text-sm text-gray-400 space-y-1 mt-2">
              {homeLineup?.substitutes?.map((sub, i) => (
                <li key={i} className="flex gap-2 items-center"><span className="text-gray-500 font-mono w-5">{sub.number}</span> <span className="truncate text-white/80">{sub.name || sub.fullName}</span></li>
              )) || <li className="italic text-gray-500">Sin suplentes</li>}
            </ul>
          </GlassCard>
        )}
        {showAway && (
          <GlassCard className="p-4 flex-1 border-l-4 border-l-white relative overflow-hidden">
            <div className="absolute right-0 top-0 opacity-10 text-6xl font-black italic">V</div>
            <h3 className="font-bold text-white mb-2 pb-2">Banca Visitante</h3>
            <div className="text-xs text-white mb-2 font-mono">Formación: {awayLineup?.formation || '?'}</div>
            <ul className="text-sm text-gray-400 space-y-1 mt-2">
              {awayLineup?.substitutes?.map((sub, i) => (
                <li key={i} className="flex gap-2 items-center"><span className="text-gray-500 font-mono w-5">{sub.number}</span> <span className="truncate text-white/80">{sub.name || sub.fullName}</span></li>
              )) || <li className="italic text-gray-500">Sin suplentes</li>}
            </ul>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
